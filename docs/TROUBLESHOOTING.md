# AutoReels Troubleshooting & Edge-Case Guide

### 1. WhatsApp Webhook Fails Verification (Error 403)
- **Cause**: Token mismatch between Meta App Dashboard and `WHATSAPP_VERIFY_TOKEN`.
- **Fix**: Verify your webhook URL matches `https://your-domain/api/whatsapp/webhook` and the verify token matches your environment variable.

### 2. WhatsApp 24-Hour Messaging Window Restriction
- **Cause**: User hasn't messaged the business phone number in >24 hours. Free-form text cannot be delivered.
- **Fix**: The system uses registered utility templates (`video_approval_notification_v1`) or sends signed review links that fall back gracefully.

### 3. Meta Graph API Rate Limits (#32 or #17)
- **Cause**: Publishing too many Reels simultaneously from a single IP or app token.
- **Fix**:
  - Independent publishing queues per Page.
  - Configurable `dailyLimit` (default: 3 posts/day per Page).
  - Exponential backoff retry handler with jitter.

### 4. Video Rendering Timeouts
- **Cause**: Large high-resolution rendering queues on Google Veo.
- **Fix**:
  - Asynchronous webhook polling via `BackgroundSchedulerWorker`.
  - Configurable duration options (8s, 10s, 15s).
  - Fallback gallery mode when AI budget is exhausted.

### 5. Emergency Stop
- When the kill switch is triggered via `POST /api/system/emergency-stop`, all background workers immediately freeze generation jobs and block Meta Graph API publish requests.
