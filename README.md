# ReelFlow Studio: Native Android & Cloud Automation Platform

**ReelFlow Studio** is a native Android application and companion management platform for automating AI-generated vertical Reels across up to 100 authorized Facebook Pages.

## Core Features
1. **10 Dedicated Native Screens** built with Kotlin and Jetpack Compose.
2. **Multi-Tenant Page Management** supporting up to 100 authorized Facebook Pages across 10 niches.
3. **AI Video Prompt Form** with 9:16 vertical parameters and configurable durations (8s, 10s, 15s, 30s).
4. **Gallery Video Picker** for importing local device media.
5. **9:16 Video Preview Screen** with play/pause and metadata overlays.
6. **English Title, Caption, and 5 Relevant Hashtags Editor**.
7. **WhatsApp Review Status** gatekeeper enforcing explicit approval before publishing.
8. **Publishing Calendar** with date, time, and timezone controls.
9. **Scheduled Posts & History** tracking Facebook Reel IDs and metrics.
10. **Settings & Error Logs** with live diagnostics and mock architecture disclosures.

## Version 1.0 Mock Disclosures
- **Mock Publishing Service**: Generates simulated Reel IDs without publishing live to Facebook.
- **Mock AI Video Generation**: Simulates rendering progress and loads sample test video assets.
- **Mock WhatsApp Review**: Simulates notification delivery and approval tokens locally.
- **Prepared Interfaces**: Cleanly separated in `ServiceInterfaces.kt` for future integration with Google Veo, WhatsApp Cloud API, and Meta Graph API v21.0.

See `/android/README.md` for full Android Studio setup instructions.
