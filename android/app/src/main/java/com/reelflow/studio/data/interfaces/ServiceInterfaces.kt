package com.reelflow.studio.data.interfaces

import com.reelflow.studio.data.model.*
import kotlinx.coroutines.flow.Flow

/**
 * Modular Provider Interfaces for Future Real Cloud Backend & Official Integrations:
 * 1. Cloud Backend API
 * 2. AI Video Generation Provider (Google Veo / Flow / Imagen Video)
 * 3. WhatsApp Business Platform / Cloud API
 * 4. Meta Graph API (Facebook Reels v21.0)
 */

interface CloudBackendClient {
    suspend fun syncPages(): List<FacebookPage>
    suspend fun fetchJobs(): List<VideoReelItem>
    suspend fun saveJob(job: VideoReelItem): Result<VideoReelItem>
    suspend fun updateJobStatus(jobId: String, status: JobStatus): Result<Unit>
    suspend fun fetchLogs(): List<SystemLogEntry>
}

interface VideoGenerationProvider {
    val providerName: String
    suspend fun generateVideo(
        prompt: String,
        negativePrompt: String,
        durationSeconds: Int,
        aspectRatio: String,
        resolution: String
    ): Result<String> // Returns generated video URL or storage path
    
    fun observeGenerationProgress(jobId: String): Flow<Int> // 0 to 100%
}

interface WhatsAppBusinessService {
    suspend fun sendReviewNotification(
        recipientPhone: String,
        job: VideoReelItem,
        signedPreviewUrl: String
    ): Result<String> // Returns WhatsApp Message ID

    suspend fun checkReviewStatus(jobId: String): Result<WhatsAppReviewState>
}

interface MetaGraphPublishingService {
    suspend fun verifyPageToken(pageId: String): Result<TokenHealth>
    
    suspend fun uploadAndPublishReel(
        pageId: String,
        videoUriOrUrl: String,
        title: String,
        caption: String,
        hashtags: List<String>,
        idempotencyKey: String
    ): Result<PublishRecord>
}
