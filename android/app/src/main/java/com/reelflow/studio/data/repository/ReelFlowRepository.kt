package com.reelflow.studio.data.repository

import com.reelflow.studio.data.interfaces.MetaGraphPublishingService
import com.reelflow.studio.data.model.*
import com.reelflow.studio.data.service.MockPublishingService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

/** Publishing backend selector: simulated vs real Meta Graph API. */
enum class PublishingMode { MOCK, REAL }

class ReelFlowRepository(
    private val mockService: MockPublishingService = MockPublishingService()
) {
    private val _pages = MutableStateFlow<List<FacebookPage>>(MockPublishingService.generateSampleFacebookPages())
    val pages: StateFlow<List<FacebookPage>> = _pages.asStateFlow()

    private val _jobs = MutableStateFlow<List<VideoReelItem>>(createInitialSampleJobs())
    val jobs: StateFlow<List<VideoReelItem>> = _jobs.asStateFlow()

    private val _galleryMedia = MutableStateFlow<List<GalleryMediaItem>>(createSampleGalleryMedia())
    val galleryMedia: StateFlow<List<GalleryMediaItem>> = _galleryMedia.asStateFlow()

    private val _logs = MutableStateFlow<List<SystemLogEntry>>(createInitialLogs())
    val logs: StateFlow<List<SystemLogEntry>> = _logs.asStateFlow()

    private val _publishingMode = MutableStateFlow(PublishingMode.MOCK)
    val publishingMode: StateFlow<PublishingMode> = _publishingMode.asStateFlow()

    /** Attached by the app once a Context is available (MainActivity). Null = mock only. */
    private var realPublisher: MetaGraphPublishingService? = null

    private var scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    fun bindScope(externalScope: CoroutineScope) {
        scope = externalScope
    }

    fun attachRealPublisher(service: MetaGraphPublishingService) {
        realPublisher = service
        addLog("REAL_PUBLISH", "Real Meta Graph API publisher attached (v21.0, direct from device)")
    }

    fun setPublishingMode(mode: PublishingMode) {
        _publishingMode.value = mode
        addLog("PUBLISH_MODE", "Publishing mode set to $mode")
    }

    fun updatePageStatus(pageId: String, isEnabled: Boolean) {
        _pages.value = _pages.value.map { p ->
            if (p.id == pageId) p.copy(isEnabled = isEnabled) else p
        }
        addLog("PAGE_TOGGLE", "Page $pageId toggled to enabled=$isEnabled")
    }

    fun bulkUpdatePages(pageIds: Set<String>, enable: Boolean) {
        _pages.value = _pages.value.map { p ->
            if (pageIds.contains(p.id)) p.copy(isEnabled = enable) else p
        }
        addLog("PAGES_BULK", "Bulk updated ${pageIds.size} pages to enabled=$enable")
    }

    fun addJob(job: VideoReelItem) {
        _jobs.value = listOf(job) + _jobs.value
        addLog("JOB_CREATED", "New video reel created for ${job.targetPageName}: ${job.title}")
    }

    fun updateJob(job: VideoReelItem) {
        _jobs.value = _jobs.value.map { j ->
            if (j.id == job.id) job else j
        }
    }

    fun updateWhatsAppDecision(jobId: String, approved: Boolean, comment: String = "") {
        _jobs.value = _jobs.value.map { j ->
            if (j.id == jobId) {
                val nextStatus = if (approved) JobStatus.SCHEDULED else JobStatus.REJECTED
                j.copy(
                    status = nextStatus,
                    whatsappReviewStatus = j.whatsappReviewStatus.copy(
                        status = if (approved) "Approved" else "Rejected",
                        reviewerComment = comment,
                        decisionTimestamp = System.currentTimeMillis()
                    )
                )
            } else j
        }
        addLog("WHATSAPP_REVIEW", "Review decision for job $jobId: approved=$approved")
    }

    fun publishReelMock(jobId: String) {
        _jobs.value = _jobs.value.map { j ->
            if (j.id == jobId) {
                val mockReelId = "reel_${System.currentTimeMillis()}"
                j.copy(
                    status = JobStatus.PUBLISHED,
                    publishRecord = PublishRecord(
                        facebookReelId = mockReelId,
                        postUrl = "https://facebook.com/reel/$mockReelId",
                        initialViews = 24,
                        initialReach = 65
                    )
                )
            } else j
        }
        addLog("MOCK_PUBLISH", "Simulated publishing of reel for job $jobId to Meta Graph API")
    }

    /**
     * Publishes a reel using the active [PublishingMode].
     * REAL mode calls the Meta Graph API directly from the device (no server).
     * Falls back to mock when no real publisher is attached or no token is saved.
     */
    fun publishReel(jobId: String) {
        val job = _jobs.value.find { it.id == jobId } ?: return
        val publisher = realPublisher
        if (_publishingMode.value != PublishingMode.REAL || publisher == null) {
            publishReelMock(jobId)
            return
        }
        val page = _pages.value.find { it.id == job.targetPageId }
        val graphPageId = page?.pageId ?: job.targetPageId

        _jobs.value = _jobs.value.map {
            if (it.id == jobId) it.copy(status = JobStatus.PUBLISHING) else it
        }
        addLog("REAL_PUBLISH", "Uploading reel to page $graphPageId via Meta Graph API (3-phase)...")

        scope.launch(Dispatchers.IO) {
            val result = publisher.uploadAndPublishReel(
                pageId = graphPageId,
                videoUriOrUrl = job.localUri ?: job.videoUrl.orEmpty(),
                title = job.title,
                caption = job.caption,
                hashtags = job.hashtags,
                idempotencyKey = "reelflow_${job.id}"
            )
            scope.launch(Dispatchers.Main) {
                result
                    .onSuccess { record ->
                        _jobs.value = _jobs.value.map {
                            if (it.id == jobId) it.copy(status = JobStatus.PUBLISHED, publishRecord = record) else it
                        }
                        addLog("REAL_PUBLISH", "SUCCESS: reel live at ${record.postUrl}")
                    }
                    .onFailure { e ->
                        _jobs.value = _jobs.value.map {
                            if (it.id == jobId) it.copy(status = JobStatus.FAILED) else it
                        }
                        addLog("REAL_PUBLISH", "FAILED: ${e.message}", level = "ERROR")
                    }
            }
        }
    }

    /** Verify a page's saved token against the live Meta Graph API. */
    fun verifyPageToken(page: FacebookPage, onResult: (Result<TokenHealth>) -> Unit) {
        val publisher = realPublisher
        if (publisher == null) {
            onResult(Result.failure(Exception("Real publisher not attached")))
            return
        }
        scope.launch(Dispatchers.IO) {
            val result = publisher.verifyPageToken(page.pageId)
            scope.launch(Dispatchers.Main) {
                result.onSuccess { health ->
                    _pages.value = _pages.value.map {
                        if (it.id == page.id) it.copy(tokenHealth = health) else it
                    }
                }
                onResult(result)
            }
        }
    }

    fun addLog(tag: String, message: String, level: String = "INFO") {
        val entry = SystemLogEntry(level = level, tag = tag, message = message)
        _logs.value = listOf(entry) + _logs.value
    }

    companion object {
        fun createInitialSampleJobs(): List<VideoReelItem> {
            return listOf(
                VideoReelItem(
                    id = "job_1",
                    targetPageId = "page_1",
                    targetPageName = "Tech Pulse 01",
                    prompt = "Futuristic quantum computing laboratory with floating holographic neural interfaces, camera gliding forward, cinematic neon cyan and warm amber accent lighting, 8k vertical reel",
                    durationSeconds = 15,
                    status = JobStatus.READY_FOR_REVIEW,
                    title = "Quantum AI Just Shattered Computing Limits!",
                    caption = "Witness the breakthrough moment researchers unlocked the first real-time holographic quantum processor. Would you trust a quantum AI assistant?",
                    hashtags = listOf("#QuantumAI", "#FutureTech", "#ArtificialIntelligence", "#TechNews", "#DeepTech"),
                    thumbnailUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
                    videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    whatsappReviewStatus = WhatsAppReviewState(
                        sent = true,
                        sentTimestamp = System.currentTimeMillis() - 15 * 60000,
                        status = "Delivered"
                    )
                ),
                VideoReelItem(
                    id = "job_2",
                    targetPageId = "page_2",
                    targetPageName = "Fitness Pulse 02",
                    prompt = "High-intensity athlete performing explosive kettlebell snatch in a sunlit minimalist gym, ultra-crisp slow-motion muscle definition",
                    durationSeconds = 10,
                    status = JobStatus.PUBLISHED,
                    title = "3 Kettlebell Moves That Melt Core Fat",
                    caption = "Stop doing endless crunches! Add this explosive compound sequence to your next session for maximum core activation.",
                    hashtags = listOf("#CoreWorkout", "#KettlebellTraining", "#FitnessMotivation", "#DailyWorkout", "#StrengthTraining"),
                    thumbnailUrl = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
                    videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                    publishRecord = PublishRecord(
                        facebookReelId = "reel_891048291048",
                        postUrl = "https://facebook.com/reel/891048291048",
                        initialViews = 14200,
                        initialReach = 19800
                    )
                ),
                VideoReelItem(
                    id = "job_3",
                    targetPageId = "page_3",
                    targetPageName = "Travel Pulse 03",
                    prompt = "Drone shot descending over misty emerald alpine lake with a small wooden kayak in the middle, reflection of jagged snow-capped peaks in water",
                    durationSeconds = 15,
                    status = JobStatus.SCHEDULED,
                    title = "Hidden Alpine Secret Most Tourists Miss!",
                    caption = "Tucked deep in the Dolomites, this secluded mirror lake looks straight out of a fantasy novel. Who would you take here?",
                    hashtags = listOf("#TravelReels", "#HiddenGems", "#AlpineLake", "#Wanderlust", "#ExploreMore"),
                    thumbnailUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
                    videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                    scheduledDateTime = "2026-10-24T14:30:00Z",
                    scheduledTimezone = "America/New_York",
                    whatsappReviewStatus = WhatsAppReviewState(
                        sent = true,
                        sentTimestamp = System.currentTimeMillis() - 45 * 60000,
                        status = "Approved",
                        reviewerComment = "Approved via WhatsApp"
                    )
                )
            )
        }

        fun createSampleGalleryMedia(): List<GalleryMediaItem> {
            return listOf(
                GalleryMediaItem(
                    id = "gal_1",
                    filename = "Reel_CyberLab_01.mp4",
                    durationText = "0:15",
                    sizeText = "24.5 MB",
                    resolutionText = "1080x1920",
                    previewThumbnail = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
                    localPath = "/storage/emulated/0/DCIM/Camera/Reel_CyberLab_01.mp4"
                ),
                GalleryMediaItem(
                    id = "gal_2",
                    filename = "Reel_GymKettlebell_02.mp4",
                    durationText = "0:10",
                    sizeText = "16.8 MB",
                    resolutionText = "1080x1920",
                    previewThumbnail = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
                    localPath = "/storage/emulated/0/DCIM/Camera/Reel_GymKettlebell_02.mp4"
                ),
                GalleryMediaItem(
                    id = "gal_3",
                    filename = "Reel_DolomitesLake_03.mp4",
                    durationText = "0:15",
                    sizeText = "28.1 MB",
                    resolutionText = "1080x1920",
                    previewThumbnail = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
                    localPath = "/storage/emulated/0/DCIM/Camera/Reel_DolomitesLake_03.mp4"
                ),
                GalleryMediaItem(
                    id = "gal_4",
                    filename = "Reel_GarlicSkillet_04.mp4",
                    durationText = "0:08",
                    sizeText = "12.3 MB",
                    resolutionText = "1080x1920",
                    previewThumbnail = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
                    localPath = "/storage/emulated/0/DCIM/Camera/Reel_GarlicSkillet_04.mp4"
                )
            )
        }

        fun createInitialLogs(): List<SystemLogEntry> {
            return listOf(
                SystemLogEntry(level = "INFO", tag = "SERVICE", message = "ReelFlow Mock Publishing Service active"),
                SystemLogEntry(level = "INFO", tag = "OAUTH", message = "500 Facebook Pages bound (Mock Graph API v21.0)"),
                SystemLogEntry(level = "INFO", tag = "WHATSAPP", message = "Mock WhatsApp approval token generated for review"),
                SystemLogEntry(level = "WARN", tag = "QUOTA", message = "Simulated daily rate limit at 3 posts/day per Page")
            )
        }
    }
}
