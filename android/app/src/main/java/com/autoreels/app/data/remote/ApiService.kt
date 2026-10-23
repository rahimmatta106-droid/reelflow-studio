package com.autoreels.app.data.remote

import com.autoreels.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @GET("/api/status")
    async suspend fun getSystemStatus(): Response<SystemStatus>

    @GET("/api/pages")
    async suspend fun getPages(
        @Query("niche") niche: String? = null,
        @Query("search") search: String? = null,
        @Query("limit") limit: Int = 100
    ): Response<Map<String, Any>>

    @POST("/api/pages/update")
    async suspend fun updatePage(@Body payload: Map<String, Any>): Response<Map<String, Any>>

    @POST("/api/pages/bulk-toggle")
    async suspend fun bulkTogglePages(@Body payload: Map<String, Any>): Response<Map<String, Any>>

    @GET("/api/jobs")
    async suspend fun getJobs(
        @Query("status") status: String? = null,
        @Query("pageId") pageId: String? = null
    ): Response<Map<String, Any>>

    @POST("/api/jobs/create")
    async suspend fun createJob(@Body payload: CreateJobPayload): Response<Map<String, Any>>

    @POST("/api/ai/generate-metadata")
    async suspend fun generateMetadata(@Body payload: Map<String, String>): Response<Map<String, Any>>

    @POST("/api/whatsapp/review-action")
    async suspend fun submitWhatsAppReview(@Body payload: ReviewActionPayload): Response<Map<String, Any>>

    @POST("/api/facebook/publish-now")
    async suspend fun publishReelNow(@Body payload: Map<String, String>): Response<Map<String, Any>>

    @POST("/api/jobs/{id}/retry")
    async suspend fun retryJob(@Path("id") jobId: String): Response<Map<String, Any>>

    @POST("/api/system/emergency-stop")
    async suspend fun setEmergencyStop(@Body payload: Map<String, Boolean>): Response<Map<String, Any>>
}
