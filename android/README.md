# ReelFlow Studio (Android Native App)

**ReelFlow Studio** is a native Android application built with **Kotlin** and **Jetpack Compose** for managing AI-generated video workflows across up to 100 authorized Facebook Pages.

---

## 📱 Implemented Screens

1. **Dashboard (`DashboardScreen.kt`)**: Displays video counts (queue, awaiting review, scheduled, published), total reach/views metrics, and quick navigation.
2. **Page Manager (`PageManagerScreen.kt`)**: Supports up to 100 authorized Facebook Pages across 10 niches with search, filtering, token health monitoring, and bulk active/paused toggles.
3. **AI Video Prompt Form (`PromptFormScreen.kt`)**: Configures 9:16 vertical Reels parameters (prompts, negative prompts, 8s/10s/15s/30s durations, resolution) for Google Veo-2.
4. **Gallery Video Picker (`GalleryPickerScreen.kt`)**: Lets users browse, preview, and import local device videos with duration, size, and resolution tags.
5. **Video Preview Screen (`VideoPreviewScreen.kt`)**: True 9:16 vertical video Reel player with playback controls, overlay text, and quick action bar.
6. **Metadata Editor (`MetadataEditorScreen.kt`)**: Dedicated editor for 1 punchy English title, 1 natural caption, and strictly 5 targeted hashtags.
7. **WhatsApp Review Status (`WhatsAppReviewScreen.kt`)**: Review gatekeeper showing WhatsApp notification status (Delivered, Read, Approved, Rejected) and cryptographic approval actions.
8. **Publishing Calendar (`CalendarScheduleScreen.kt`)**: Scheduling tool with date picker, time presets, and audience timezone dropdown.
9. **Scheduled Posts & History (`HistoryPostsScreen.kt`)**: Segmented view of upcoming queued posts and published history with Facebook Reel IDs.
10. **Settings & Error Logs (`SettingsLogsScreen.kt`)**: Mock service disclosures, interface definitions, and searchable system log stream.

---

## 🛠️ Setup Instructions (Android Studio)

1. Open **Android Studio Ladybug (2024.2+)** or later.
2. Select **Open** and choose the `/android` directory.
3. Ensure **JDK 17+** is configured in **Settings > Build, Execution, Deployment > Build Tools > Gradle**.
4. Sync Gradle files (`settings.gradle.kts`, `build.gradle.kts`, `app/build.gradle.kts`).
5. Run the app on an Android device or emulator running **API 26 (Android 8.0) or higher**.

---

## 🔌 Architecture & Modular Interfaces

The codebase isolates UI from external dependencies using clean interfaces located in `com.reelflow.studio.data.interfaces`:

- `CloudBackendClient`: Syncs pages, jobs, and audit logs.
- `VideoGenerationProvider`: Prepared for Google Veo / Flow / Imagen Video APIs.
- `WhatsAppBusinessService`: Prepared for WhatsApp Business Cloud API interactive templates and webhooks.
- `MetaGraphPublishingService`: Prepared for Meta Graph API v21.0 3-phase Reels upload protocol (`/{page-id}/video_reels`).

---

---

## ⚡ Real AI Video Generation Module (`RealVideoGenerationService.kt`)

In addition to the mock simulation service, ReelFlow Studio includes a real production-grade video generation service:

- **Official Model**: Google Video Generation (`gemini-omni-1.1-flash` via `@google/genai` Interactions API).
- **Secure Backend Architecture**:
  - ZERO API keys in Android APK code or client assets.
  - Generative requests are dispatched to `POST /api/video/generate` on the cloud backend.
  - The backend securely handles authorization using server-side `GEMINI_API_KEY`.
- **Supported Video Settings**:
  - **Aspect Ratio**: `9:16` (Vertical Reel) or `16:9` (Widescreen).
  - **Duration**: `5s` or `10s` native generation.
  - **Resolution**: `720p` (default) or `1080p`.
- **Private Cloud Storage**:
  - Completed MP4 bytes are stored in private cloud storage (`/storage/videos/{jobId}.mp4`).
  - Served via authenticated HTTP 206 Partial Content Range streaming.
- **Strict Anti-Hallucination Error Handling**:
  - Real API errors (e.g., unbilled key, 403 authorization, 429 quota exhaustion, safety trigger) immediately transition the job to `FAILED` with the exact external API message.
  - Success is NEVER faked or simulated when calling the real generation route.

