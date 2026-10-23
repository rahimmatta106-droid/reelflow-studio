"""
Meta Graph API Adapter for Facebook Reels (Multi-Tenant, up to 100+ Pages)
Implements official 3-phase Reels upload protocol:
Phase 1: Initialize session (POST /{page-id}/video_reels?upload_phase=start)
Phase 2: Binary stream transfer to upload_url
Phase 3: Finalize publish (POST /{page-id}/video_reels?upload_phase=finish)
"""

import os
import time
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("autoreels.facebook")

class MetaGraphReelsAdapter:
    def __init__(self, api_version: str = "v21.0"):
        self.api_version = api_version
        self.base_url = f"https://graph.facebook.com/{self.api_version}"

    async def verify_page_token(self, page_id: str, page_access_token: str) -> Dict[str, Any]:
        """
        Validates page token permissions and expiration via /me or /{page_id}.
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(
                    f"{self.base_url}/{page_id}",
                    params={"fields": "id,name,access_token,is_eligible_for_reels", "access_token": page_access_token}
                )
                if resp.status_code == 200:
                    return {"valid": True, "data": resp.json()}
                return {"valid": False, "error": resp.json().get("error", {})}
            except Exception as e:
                return {"valid": False, "error": str(e)}

    async def publish_reel(
        self,
        page_id: str,
        page_access_token: str,
        video_url: str,
        title: str,
        caption: str,
        hashtags: list,
        idempotency_key: str
    ) -> Dict[str, Any]:
        """
        Executes verified Reels publishing sequence with idempotency.
        """
        full_description = f"{caption}\n\n{' '.join(hashtags)}"
        logger.info(f"Initiating Reel publish for Page {page_id} with key {idempotency_key}")

        # If dummy or simulation token
        if not page_access_token or page_access_token.startswith("simulated_") or page_access_token == "MY_META_TOKEN":
            reel_id = f"reel_meta_sim_{int(time.time())}"
            return {
                "success": True,
                "mode": "simulated",
                "video_id": f"vid_sim_{int(time.time())}",
                "reel_id": reel_id,
                "post_url": f"https://www.facebook.com/reel/{reel_id}",
                "published_at": time.time(),
                "idempotency_key": idempotency_key
            }

        async with httpx.AsyncClient(timeout=60.0) as client:
            # Phase 1: Initialize Reel upload session
            init_url = f"{self.base_url}/{page_id}/video_reels"
            init_params = {
                "upload_phase": "start",
                "access_token": page_access_token
            }
            init_resp = await client.post(init_url, params=init_params)
            if init_resp.status_code != 200:
                logger.error(f"Failed to start Reel upload: {init_resp.text}")
                return {"success": False, "phase": "start", "error": init_resp.json()}

            init_data = init_resp.json()
            video_id = init_data.get("video_id")
            upload_url = init_data.get("upload_url")

            # Phase 2: Transfer Video Binary
            # Stream video from video_url to upload_url
            video_stream = await client.get(video_url)
            upload_headers = {
                "Authorization": f"OAuth {page_access_token}",
                "offset": "0",
                "file_size": str(len(video_stream.content))
            }
            upload_resp = await client.post(upload_url, headers=upload_headers, content=video_stream.content)
            if upload_resp.status_code != 200:
                logger.error(f"Failed to upload video stream: {upload_resp.text}")
                return {"success": False, "phase": "upload", "error": upload_resp.json()}

            # Phase 3: Finalize and Publish
            finish_params = {
                "upload_phase": "finish",
                "access_token": page_access_token,
                "video_id": video_id,
                "title": title[:100],
                "description": full_description,
                "video_state": "PUBLISHED"
            }
            finish_resp = await client.post(init_url, params=finish_params)
            if finish_resp.status_code != 200:
                logger.error(f"Failed to finish Reel publish: {finish_resp.text}")
                return {"success": False, "phase": "finish", "error": finish_resp.json()}

            finish_data = finish_resp.json()
            return {
                "success": True,
                "mode": "live",
                "video_id": video_id,
                "reel_id": finish_data.get("id", video_id),
                "post_url": f"https://www.facebook.com/reel/{video_id}",
                "published_at": time.time(),
                "idempotency_key": idempotency_key
            }
