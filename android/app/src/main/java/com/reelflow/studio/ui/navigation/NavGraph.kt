package com.reelflow.studio.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Dashboard : Screen("dashboard", "Dashboard")
    object PageManager : Screen("page_manager", "Facebook Pages")
    object PromptForm : Screen("prompt_form", "AI Prompt Studio")
    object GalleryPicker : Screen("gallery_picker", "Gallery Media")
    object VideoPreview : Screen("video_preview", "Reels Preview")
    object MetadataEditor : Screen("metadata_editor", "Title & Hashtags")
    object WhatsAppReview : Screen("whatsapp_review", "WhatsApp Review")
    object CalendarSchedule : Screen("calendar_schedule", "Publishing Calendar")
    object HistoryPosts : Screen("history_posts", "Posts History")
    object SettingsLogs : Screen("settings_logs", "Settings & Logs")
}
