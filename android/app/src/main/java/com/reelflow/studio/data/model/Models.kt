package com.reelflow.studio.data.model

import java.util.UUID

enum class JobStatus {
    DRAFT,
    AI_GENERATING,
    READY_FOR_REVIEW,
    WHATSAPP_REVIEW_SENT,
    APPROVED,
    REJECTED,
    SCHEDULED,
    PUBLISHING,
    PUBLISHED,
    FAILED
}

enum class TokenHealth {
    ACTIVE,
    EXPIRING_SOON,
    EXPIRED
}

data class FacebookPage(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val pageId: String,
    val category: String,
    val niche: String,
    val followers: Int,
    val isAuthorized: Boolean = true,
    val isEnabled: Boolean = true,
    val tokenHealth: TokenHealth = TokenHealth.ACTIVE,
    val tokenExpiryDays: Int = 45,
    val defaultTimezone: String = "America/New_York",
    val dailyPublishLimit: Int = 3,
    val postsPublishedToday: Int = 0,
    val customPromptGuidance: String = "",
    val defaultHashtags: List<String> = emptyList()
)

data class VideoReelItem(
    val id: String = UUID.randomUUID().toString(),
    val targetPageId: String,
    val targetPageName: String,
    val prompt: String,
    val negativePrompt: String = "",
    val durationSeconds: Int = 15,
    val aspectRatio: String = "9:16",
    val resolution: String = "1080p",
    val videoUrl: String? = null,
    val localUri: String? = null,
    val thumbnailUrl: String? = null,
    val status: JobStatus = JobStatus.DRAFT,
    val progressPercent: Int = 0,
    val title: String = "",
    val caption: String = "",
    val hashtags: List<String> = listOf("#Reels", "#Trending", "#Viral", "#Creator", "#Explore"),
    val alternativeTitles: List<String> = emptyList(),
    val scheduledDateTime: String? = null, // ISO-8601 string
    val scheduledTimezone: String = "America/New_York",
    val whatsappReviewStatus: WhatsAppReviewState = WhatsAppReviewState(),
    val publishRecord: PublishRecord? = null,
    val createdAt: Long = System.currentTimeMillis()
)

data class WhatsAppReviewState(
    val sent: Boolean = false,
    val sentTimestamp: Long? = null,
    val recipientPhone: String = "+1 (555) 019-2834",
    val status: String = "Not Sent", // Not Sent, Delivered, Read, Approved, Rejected
    val signedToken: String = UUID.randomUUID().toString().take(12),
    val reviewerComment: String = "",
    val decisionTimestamp: Long? = null
)

data class PublishRecord(
    val facebookReelId: String,
    val postUrl: String,
    val publishedAt: Long = System.currentTimeMillis(),
    val initialViews: Int = 0,
    val initialReach: Int = 0
)

data class GalleryMediaItem(
    val id: String = UUID.randomUUID().toString(),
    val filename: String,
    val durationText: String,
    val sizeText: String,
    val resolutionText: String,
    val previewThumbnail: String,
    val localPath: String
)

data class SystemLogEntry(
    val id: String = UUID.randomUUID().toString(),
    val timestamp: Long = System.currentTimeMillis(),
    val level: String, // INFO, WARN, ERROR
    val tag: String,
    val message: String,
    val details: String? = null
)
