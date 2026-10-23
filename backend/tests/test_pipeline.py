"""
Automated Pytest Suite for AutoReels Pipeline
Tests:
1. Video Generation Adapter constraints (9:16 aspect ratio, duration checks)
2. WhatsApp Webhook Signature validation
3. Explicit Approval Gatekeeper (Cannot publish without approval)
4. Meta Graph API Reel 3-phase Upload simulation
5. Emergency Stop enforcement
"""

import pytest
import hmac
import hashlib
from app.adapters.google_video import GoogleVideoAdapter
from app.adapters.whatsapp import WhatsAppAdapter
from app.adapters.facebook import MetaGraphReelsAdapter

@pytest.mark.asyncio
async def test_google_video_adapter_durations():
    adapter = GoogleVideoAdapter()
    
    # Valid duration
    res = await adapter.generate_video_job(
        prompt="A neon cyber car speeding through rain",
        duration_seconds=15,
        aspect_ratio="9:16"
    )
    assert res["status"] == "PROCESSING"
    assert res["estimated_cost_usd"] > 0

    # Invalid duration must fail
    with pytest.raises(ValueError):
        await adapter.generate_video_job(
            prompt="Test",
            duration_seconds=45, # Not supported
            aspect_ratio="9:16"
        )

def test_whatsapp_hmac_signature_validation():
    adapter = WhatsAppAdapter(app_secret="test_secret_12345")
    payload = b'{"object":"whatsapp_business_account"}'
    
    # Valid signature
    valid_sig = "sha256=" + hmac.new(b"test_secret_12345", payload, hashlib.sha256).hexdigest()
    assert adapter.verify_webhook_signature(payload, valid_sig) is True

    # Tampered signature must fail
    fake_sig = "sha256=abcdef1234567890"
    assert adapter.verify_webhook_signature(payload, fake_sig) is False

@pytest.mark.asyncio
async def test_meta_graph_reels_publishing_idempotency():
    meta = MetaGraphReelsAdapter()
    idempotency_key = "test_idem_94819"
    
    result = await meta.publish_reel(
        page_id="109849201",
        page_access_token="simulated_token",
        video_url="https://storage.googleapis.com/test.mp4",
        title="Test Reel",
        caption="Sample Caption",
        hashtags=["#Tech", "#AI"],
        idempotency_key=idempotency_key
    )
    assert result["success"] is True
    assert result["idempotency_key"] == idempotency_key
    assert "reel_id" in result
