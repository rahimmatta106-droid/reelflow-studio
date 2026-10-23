package com.reelflow.studio.data.service

import com.reelflow.studio.data.interfaces.*
import com.reelflow.studio.data.model.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.util.UUID

/**
 * Mock Service Implementation for ReelFlow Studio v1.
 * Clearly designated as simulated logic preparing for future production backends.
 */
class MockPublishingService : 
    CloudBackendClient, 
    VideoGenerationProvider, 
    WhatsAppBusinessService, 
    MetaGraphPublishingService {

    override val providerName: String = "Google Veo-2 (Simulated Adapter)"

    override suspend fun syncPages(): List<FacebookPage> {
        delay(300)
        return generateSampleFacebookPages()
    }

    override suspend fun fetchJobs(): List<VideoReelItem> {
        delay(200)
        return emptyList()
    }

    override suspend fun saveJob(job: VideoReelItem): Result<VideoReelItem> {
        delay(200)
        return Result.success(job)
    }

    override suspend fun updateJobStatus(jobId: String, status: JobStatus): Result<Unit> {
        delay(150)
        return Result.success(Unit)
    }

    override suspend fun fetchLogs(): List<SystemLogEntry> {
        return listOf(
            SystemLogEntry(level = "INFO", tag = "INIT", message = "ReelFlow Studio v1 initialized in mock simulation mode"),
            SystemLogEntry(level = "INFO", tag = "PAGES", message = "500 Facebook Pages loaded from mock repository cache"),
            SystemLogEntry(level = "INFO", tag = "WHATSAPP", message = "WhatsApp Review mock pipeline ready (template: video_review_v1)")
        )
    }

    override suspend fun generateVideo(
        prompt: String,
        negativePrompt: String,
        durationSeconds: Int,
        aspectRatio: String,
        resolution: String
    ): Result<String> {
        delay(1500) // Simulate cloud rendering latency
        val sampleVideoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        return Result.success(sampleVideoUrl)
    }

    override fun observeGenerationProgress(jobId: String): Flow<Int> = flow {
        emit(10)
        delay(300)
        emit(35)
        delay(400)
        emit(70)
        delay(400)
        emit(95)
        delay(200)
        emit(100)
    }

    override suspend fun sendReviewNotification(
        recipientPhone: String,
        job: VideoReelItem,
        signedPreviewUrl: String
    ): Result<String> {
        delay(400)
        val mockMessageId = "wamid_mock_${UUID.randomUUID().toString().take(8)}"
        return Result.success(mockMessageId)
    }

    override suspend fun checkReviewStatus(jobId: String): Result<WhatsAppReviewState> {
        delay(200)
        return Result.success(
            WhatsAppReviewState(
                sent = true,
                sentTimestamp = System.currentTimeMillis() - 600000,
                status = "Delivered",
                reviewerComment = "Sample simulated review note"
            )
        )
    }

    override suspend fun verifyPageToken(pageId: String): Result<TokenHealth> {
        delay(100)
        return Result.success(TokenHealth.ACTIVE)
    }

    override suspend fun uploadAndPublishReel(
        pageId: String,
        videoUriOrUrl: String,
        title: String,
        caption: String,
        hashtags: List<String>,
        idempotencyKey: String
    ): Result<PublishRecord> {
        delay(1200) // Simulate Meta 3-phase Reels upload
        val simulatedReelId = "reel_mock_${System.currentTimeMillis()}"
        return Result.success(
            PublishRecord(
                facebookReelId = simulatedReelId,
                postUrl = "https://facebook.com/reel/$simulatedReelId",
                publishedAt = System.currentTimeMillis(),
                initialViews = 1,
                initialReach = 1
            )
        )
    }

    companion object {
        /** Maximum pages supported by ReelFlow Studio. */
        const val MAX_PAGES = 500

        fun generateSampleFacebookPages(count: Int = MAX_PAGES): List<FacebookPage> {
            val niches = listOf(
                "Tech & AI" to "Technology & Software",
                "Fitness & Wellness" to "Health & Fitness",
                "Travel & Adventure" to "Travel Agency & Tourism",
                "Cuisine & Cooking" to "Food & Beverage",
                "Finance & Crypto" to "Financial Service",
                "Comedy & Humor" to "Entertainment & Comedy",
                "Real Estate & Luxury" to "Real Estate",
                "Automotive" to "Cars & Motor Vehicles",
                "Gaming" to "Video Games & Esports",
                "Life Hacks" to "Productivity & Tips"
            )

            val timezones = listOf(
                "America/New_York",
                "America/Chicago",
                "America/Los_Angeles",
                "Europe/London"
            )

            return (1..count).map { index ->
                val (niche, category) = niches[(index - 1) % niches.size]
                val pageNum = when {
                    index < 10 -> "00$index"
                    index < 100 -> "0$index"
                    else -> "$index"
                }
                val tokenDays = 20 + (index * 3 % 70)
                val health = when {
                    tokenDays <= 14 -> TokenHealth.EXPIRING_SOON
                    tokenDays <= 0 -> TokenHealth.EXPIRED
                    else -> TokenHealth.ACTIVE
                }

                FacebookPage(
                    id = "page_$index",
                    name = "$niche Pulse $pageNum",
                    pageId = "109${800000000 + index * 12345}",
                    category = category,
                    niche = niche,
                    followers = 15000 + (index * 7820 % 650000),
                    isAuthorized = true,
                    isEnabled = index <= (count * 0.85).toInt(),
                    tokenHealth = health,
                    tokenExpiryDays = tokenDays,
                    defaultTimezone = timezones[index % timezones.size],
                    dailyPublishLimit = 3,
                    postsPublishedToday = (index % 3),
                    customPromptGuidance = "Create fast-paced, hook-driven vertical Reels for $niche audience.",
                    defaultHashtags = listOf("#$niche".replace(" & ", "").replace(" ", ""), "#Reels", "#Trending", "#Viral", "#FYP")
                )
            }
        }
    }
}
