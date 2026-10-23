"""
WhatsApp Business Platform / Cloud API Adapter
Handles sending interactive video review notifications with signed approval links
and processes inbound decision webhooks securely.
"""

import os
import hmac
import hashlib
import time
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("autoreels.whatsapp")

class WhatsAppAdapter:
    def __init__(
        self,
        access_token: Optional[str] = None,
        phone_number_id: Optional[str] = None,
        app_secret: Optional[str] = None,
        verify_token: Optional[str] = None,
        base_app_url: Optional[str] = None
    ):
        self.access_token = access_token or os.getenv("WHATSAPP_TOKEN", "")
        self.phone_number_id = phone_number_id or os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        self.app_secret = app_secret or os.getenv("WHATSAPP_APP_SECRET", "autoreels_app_secret_key")
        self.verify_token = verify_token or os.getenv("WHATSAPP_VERIFY_TOKEN", "autoreels_secure_verify_token_2026")
        self.base_app_url = base_app_url or os.getenv("APP_URL", "https://localhost:3000")
        self.api_url = f"https://graph.facebook.com/v21.0/{self.phone_number_id}/messages"

    def verify_webhook_signature(self, payload_bytes: bytes, signature_header: str) -> bool:
        """
        Validates the X-Hub-Signature-256 header sent by Meta to prevent forged requests.
        """
        if not signature_header or not signature_header.startswith("sha256="):
            return False

        expected_sig = hmac.new(
            self.app_secret.encode("utf-8"),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()

        incoming_sig = signature_header.replace("sha256=", "")
        return hmac.compare_digest(expected_sig, incoming_sig)

    def generate_signed_approval_token(self, job_id: str, salt: str = "") -> str:
        """
        Creates an HMAC signed token tied to the specific job_id to prevent tampering.
        """
        data = f"{job_id}:{self.app_secret}:{salt}".encode("utf-8")
        return hmac.new(self.app_secret.encode("utf-8"), data, hashlib.sha256).hexdigest()[:24]

    async def send_review_notification(
        self,
        recipient_phone: str,
        job_id: str,
        video_preview_url: str,
        title: str,
        caption: str,
        hashtags: list,
        target_page_name: str,
        scheduled_for: str
    ) -> Dict[str, Any]:
        """
        Sends an interactive message with Approve, Reject, and Regenerate buttons.
        Also includes a secure signed web review link if buttons cannot be rendered.
        """
        token = self.generate_signed_approval_token(job_id)
        signed_web_url = f"{self.base_app_url}/api/whatsapp/review-link/{job_id}?token={token}"

        body_text = (
            f"🎬 *NEW REEL FOR REVIEW*\n\n"
            f"*Target Page:* {target_page_name}\n"
            f"*Scheduled:* {scheduled_for}\n\n"
            f"*Title:* {title}\n"
            f"*Caption:* {caption}\n"
            f"*Tags:* {' '.join(hashtags)}\n\n"
            f"🔗 *Preview Video & Review Online:*\n{signed_web_url}"
        )

        interactive_payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_phone.replace("+", "").replace(" ", "").replace("-", ""),
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": body_text},
                "action": {
                    "buttons": [
                        {
                            "type": "reply",
                            "reply": {
                                "id": f"APPROVE_{job_id}_{token}",
                                "title": "✓ Approve & Schedule"
                            }
                        },
                        {
                            "type": "reply",
                            "reply": {
                                "id": f"REJECT_{job_id}_{token}",
                                "title": "✕ Reject"
                            }
                        },
                        {
                            "type": "reply",
                            "reply": {
                                "id": f"REGENERATE_{job_id}_{token}",
                                "title": "↻ Regenerate"
                            }
                        }
                    ]
                }
            }
        }

        logger.info(f"Sending WhatsApp review message to {recipient_phone} for job {job_id}")

        if not self.access_token or self.access_token == "MY_WHATSAPP_TOKEN":
            # Simulation mode when live WhatsApp credentials are not yet entered
            return {
                "success": True,
                "mode": "simulated",
                "message_id": f"wamid_sim_{int(time.time())}",
                "signed_approval_token": token,
                "signed_preview_url": signed_web_url,
                "recipient_phone": recipient_phone,
            }

        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            resp = await client.post(self.api_url, json=interactive_payload, headers=headers)
            if resp.status_code >= 400:
                logger.error(f"WhatsApp API error: {resp.status_code} - {resp.text}")
                # Fallback to simulated ticket with signed link
                return {
                    "success": False,
                    "error": resp.text,
                    "signed_approval_token": token,
                    "signed_preview_url": signed_web_url
                }

            data = resp.json()
            return {
                "success": True,
                "mode": "live",
                "message_id": data.get("messages", [{}])[0].get("id"),
                "signed_approval_token": token,
                "signed_preview_url": signed_web_url
            }
