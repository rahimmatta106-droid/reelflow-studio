# AutoReels Setup & Integration Guide

Production-grade automation engine combining **Google Veo Video Generation**, **WhatsApp Cloud API Interactive Reviews**, and **Meta Graph API Facebook Reels Automation across up to 100 Pages**.

---

## 1. Required External Accounts & API Credentials

| Service | Required Credentials | Purpose |
| :--- | :--- | :--- |
| **Google AI Studio** | `GEMINI_API_KEY` | Gemini 3.8 Flash for Title/Caption/Hashtag generation & Google Veo-2 video synthesis adapter |
| **Meta Developers (Facebook)** | `META_APP_ID`, `META_APP_SECRET`, Page Access Tokens | Managing 100 Facebook Pages and publishing vertical Reels to `/{page-id}/video_reels` |
| **WhatsApp Business Platform** | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | Sending interactive review notifications with signed Approve/Reject action buttons |
| **PostgreSQL 16+** | `DATABASE_URL` | Relational store for 100 Facebook Pages, video jobs, audit logs, and scheduling |
| **Redis 7+** | `REDIS_URL` | Task queue for background worker, retries, and publish scheduler |

---

## 2. Meta Graph API (Facebook 100 Pages Setup)

1. Go to [developers.facebook.com](https://developers.facebook.com) and create a **Business** App type.
2. Under **Add Products**, add **Facebook Login for Business** and **Page Public Content Access**.
3. Required OAuth Permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_metadata`
4. Exchange short-lived User Tokens for Long-Lived System User Tokens (60-day or permanent System User Access Tokens).
5. For each page, query `GET /me/accounts` to retrieve the Page ID and Page Access Token.

---

## 3. WhatsApp Cloud API Webhook Setup

1. In the Meta App dashboard, add **WhatsApp**.
2. Under **Configuration > Webhook**:
   - Callback URL: `https://YOUR_DOMAIN/api/whatsapp/webhook`
   - Verify Token: Matches your `WHATSAPP_VERIFY_TOKEN`
3. Subscribe to webhook fields:
   - `messages`
4. When a video completes:
   - The engine sends an interactive button message (or signed link).
   - Inbound replies (`APPROVE_<jobId>_<token>`) trigger status updates.

---

## 4. Running Locally with Docker

```bash
# 1. Clone the repo
git clone <repo-url> autoreels
cd autoreels

# 2. Configure environment variables
cp .env.example .env

# 3. Start PostgreSQL, Redis, Backend API and Web Console
docker-compose up -d --build

# 4. Access the Command Center
open http://localhost:8000
```

---

## 5. Building the Android Application

1. Open `/android` in **Android Studio Ladybug (2024.2+)** or later.
2. Ensure JDK 17+ is selected in Gradle settings.
3. Replace `google-services.json` in `/android/app/` with your Firebase project credentials.
4. Set backend URL in `ApiService.kt`.
5. Run `./gradlew assembleDebug` or click **Run on Device / Emulator**.
