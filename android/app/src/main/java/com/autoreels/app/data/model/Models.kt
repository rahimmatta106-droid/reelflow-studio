package com.autoreels.app.data.model

import com.google.gson.annotations.SerializedName

data class FacebookPage(
    val id: String,
    val name: String,
    val category: String,
    val niche: String,
    @SerializedName("pageId") val pageId: String,
    val followers: Int,
    @SerializedName("isEnabled") val isEnabled: Boolean,
    @SerializedName("tokenStatus") val tokenStatus: String,
    val timezone: String,
    @SerializedName("dailyLimit") val dailyLimit: Int,
    @SerializedName("postsPublishedToday") val postsPublishedToday: Int,
    @SerializedName("customPromptRules") val customPromptRules: String,
    @SerializedName("defaultHashtags") val defaultHashtags: List<String>,
    @SerializedName("reelsPublishedTotal") val reelsPublishedTotal: Int,
    @SerializedName("avgViews") val avgViews: Int
)

data class VideoJob(
    val id: String,
    @SerializedName("idempotencyKey") val idempotencyKey: String,
    @SerializedName("targetPageId") val targetPageId: String,
    @SerializedName("targetPageName") val targetPageName: String,
    val niche: String,
    val prompt: String,
    @SerializedName("durationSeconds") val durationSeconds: Int,
    @SerializedName("aspectRatio") val aspectRatio: String,
    @SerializedName("modelUsed") val modelUsed: String,
    @SerializedName("videoUrl") val videoUrl: String?,
    @SerializedName("thumbnailUrl") val thumbnailUrl: String?,
    val status: String,
    @SerializedName("progressPercent") val progressPercent: Int,
    @SerializedName("errorReason") val errorReason: String?,
    @SerializedName("retryCount") val retryCount: Int,
    val metadata: VideoMetadata,
    @SerializedName("whatsappReview") val whatsappReview: WhatsAppReviewInfo,
    val schedule: ScheduleInfo,
    @SerializedName("publishResult") val publishResult: PublishResult?,
    val cost: CostInfo
)

data class VideoMetadata(
    val title: String,
    val caption: String,
    val hashtags: List<String>,
    @SerializedName("alternativeTitles") val alternativeTitles: List<String>,
    val tone: String
)

data class WhatsAppReviewInfo(
    val status: String,
    val decision: String?,
    @SerializedName("decisionTimestamp") val decisionTimestamp: String?,
    @SerializedName("reviewerName") val reviewerName: String?,
    @SerializedName("signedApprovalToken") val signedApprovalToken: String,
    @SerializedName("signedPreviewUrl") val signedPreviewUrl: String
)

data class ScheduleInfo(
    @SerializedName("scheduledFor") val scheduledFor: String?,
    val timezone: String,
    @SerializedName("autoPublishOnApproval") val autoPublishOnApproval: Boolean
)

data class PublishResult(
    @SerializedName("facebookReelId") val facebookReelId: String?,
    @SerializedName("facebookPostUrl") val facebookPostUrl: String?,
    @SerializedName("publishedAt") val publishedAt: String?,
    @SerializedName("viewsCount") val viewsCount: Int?,
    @SerializedName("reachCount") val reachCount: Int?
)

data class CostInfo(
    @SerializedName("estimatedUsd") val estimatedUsd: Double,
    @SerializedName("actualUsd") val actualUsd: Double
)

data class SystemStatus(
    val status: String,
    val metrics: Map<String, Int>,
    val budget: Map<String, Any>
)

data class CreateJobPayload(
    val prompt: String,
    @SerializedName("targetPageId") val targetPageId: String,
    @SerializedName("durationSeconds") val durationSeconds: Int = 15,
    @SerializedName("aspectRatio") val aspectRatio: String = "9:16",
    @SerializedName("resolution") val resolution: String = "1080p",
    @SerializedName("modelUsed") val modelUsed: String = "Google Veo-2",
    @SerializedName("scheduleTime") val scheduleTime: String? = null
)

data class ReviewActionPayload(
    @SerializedName("jobId") val jobId: String,
    val token: String,
    val decision: String, // APPROVED, REJECTED, REGENERATE
    val reason: String?,
    @SerializedName("reviewerName") val reviewerName: String = "Android Mobile App"
)
