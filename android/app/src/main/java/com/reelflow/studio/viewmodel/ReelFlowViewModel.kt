package com.reelflow.studio.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.reelflow.studio.data.interfaces.MetaGraphPublishingService
import com.reelflow.studio.data.model.*
import com.reelflow.studio.data.service.RealMetaPublishingService
import com.reelflow.studio.data.repository.PublishingMode
import com.reelflow.studio.data.repository.ReelFlowRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ReelFlowViewModel(
    private val repository: ReelFlowRepository = ReelFlowRepository()
) : ViewModel() {

    init {
        repository.bindScope(viewModelScope)
    }

    val pages: StateFlow<List<FacebookPage>> = repository.pages
    val jobs: StateFlow<List<VideoReelItem>> = repository.jobs
    val galleryMedia: StateFlow<List<GalleryMediaItem>> = repository.galleryMedia
    val logs: StateFlow<List<SystemLogEntry>> = repository.logs
    val publishingMode: StateFlow<PublishingMode> = repository.publishingMode

    private var realService: RealMetaPublishingService? = null

    /** Attach the real Meta publisher (call once from MainActivity with app context). */
    fun attachRealPublishing(service: MetaGraphPublishingService) {
        repository.attachRealPublisher(service)
        realService = service as? RealMetaPublishingService
    }

    /** Save a Page access token into encrypted storage. */
    fun savePageToken(graphPageId: String, token: String) {
        realService?.savePageToken(graphPageId, token)
    }

    fun hasPageToken(graphPageId: String): Boolean =
        realService?.hasPageToken(graphPageId) == true

    fun removePageToken(graphPageId: String) {
        realService?.removePageToken(graphPageId)
    }

    fun setPublishingMode(mode: PublishingMode) {
        repository.setPublishingMode(mode)
    }

    /** Publish using the active mode (REAL = live Meta Graph API, MOCK = simulated). */
    fun publishNow(jobId: String) {
        repository.publishReel(jobId)
    }

    fun verifyPageToken(page: FacebookPage, onResult: (Result<TokenHealth>) -> Unit) {
        repository.verifyPageToken(page, onResult)
    }

    // Active selection state for workflow between screens
    private val _selectedJob = MutableStateFlow<VideoReelItem?>(null)
    val selectedJob: StateFlow<VideoReelItem?> = _selectedJob.asStateFlow()

    private val _selectedPageId = MutableStateFlow<String>("page_1")
    val selectedPageId: StateFlow<String> = _selectedPageId.asStateFlow()

    fun selectJob(job: VideoReelItem?) {
        _selectedJob.value = job
    }

    fun selectPage(pageId: String) {
        _selectedPageId.value = pageId
    }

    fun togglePage(pageId: String, isEnabled: Boolean) {
        repository.updatePageStatus(pageId, isEnabled)
    }

    fun bulkTogglePages(pageIds: Set<String>, enable: Boolean) {
        repository.bulkUpdatePages(pageIds, enable)
    }

    fun createNewPromptJob(
        prompt: String,
        negativePrompt: String,
        durationSeconds: Int,
        targetPageId: String
    ) {
        val targetPage = pages.value.find { it.id == targetPageId } ?: pages.value.first()
        val newJob = VideoReelItem(
            targetPageId = targetPage.id,
            targetPageName = targetPage.name,
            prompt = prompt,
            negativePrompt = negativePrompt,
            durationSeconds = durationSeconds,
            status = JobStatus.READY_FOR_REVIEW,
            title = "Mastering ${targetPage.niche}: 3 Key Takeaways",
            caption = "Discover how to optimize your daily routine with these tested insights! Save this Reel for later.",
            hashtags = targetPage.defaultHashtags.ifEmpty { listOf("#Reels", "#Trending", "#Creator", "#Viral", "#Watch") },
            thumbnailUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            whatsappReviewStatus = WhatsAppReviewState(
                sent = true,
                sentTimestamp = System.currentTimeMillis(),
                status = "Delivered"
            )
        )
        repository.addJob(newJob)
        _selectedJob.value = newJob
    }

    fun importGalleryVideo(media: GalleryMediaItem, targetPageId: String) {
        val targetPage = pages.value.find { it.id == targetPageId } ?: pages.value.first()
        val newJob = VideoReelItem(
            targetPageId = targetPage.id,
            targetPageName = targetPage.name,
            prompt = "Imported from local gallery: ${media.filename}",
            durationSeconds = 15,
            localUri = media.localPath,
            thumbnailUrl = media.previewThumbnail,
            status = JobStatus.READY_FOR_REVIEW,
            title = "New Reel: ${media.filename.replace(".mp4", "")}",
            caption = "Uploaded directly from gallery media. Ready for review.",
            hashtags = targetPage.defaultHashtags.ifEmpty { listOf("#GalleryUpload", "#Reels", "#Shorts", "#Daily", "#Creator") },
            whatsappReviewStatus = WhatsAppReviewState(
                sent = true,
                sentTimestamp = System.currentTimeMillis(),
                status = "Delivered"
            )
        )
        repository.addJob(newJob)
        _selectedJob.value = newJob
    }

    fun updateMetadata(jobId: String, title: String, caption: String, hashtags: List<String>) {
        val current = jobs.value.find { it.id == jobId } ?: return
        val updated = current.copy(
            title = title,
            caption = caption,
            hashtags = hashtags.take(5)
        )
        repository.updateJob(updated)
        _selectedJob.value = updated
        repository.addLog("METADATA_EDIT", "Updated metadata for job $jobId")
    }

    fun updateSchedule(jobId: String, dateTime: String, timezone: String) {
        val current = jobs.value.find { it.id == jobId } ?: return
        val updated = current.copy(
            scheduledDateTime = dateTime,
            scheduledTimezone = timezone,
            status = JobStatus.SCHEDULED
        )
        repository.updateJob(updated)
        _selectedJob.value = updated
        repository.addLog("SCHEDULE_UPDATE", "Post $jobId scheduled for $dateTime ($timezone)")
    }

    fun submitWhatsAppReview(jobId: String, approved: Boolean, comment: String = "") {
        repository.updateWhatsAppDecision(jobId, approved, comment)
    }

    fun mockPublishNow(jobId: String) {
        repository.publishReelMock(jobId)
    }
}
