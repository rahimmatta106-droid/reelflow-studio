package com.reelflow.studio.data.service

import android.content.Context
import android.net.Uri
import com.reelflow.studio.data.interfaces.MetaGraphPublishingService
import com.reelflow.studio.data.model.PublishRecord
import com.reelflow.studio.data.model.TokenHealth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit

/**
 * REAL Meta Graph API publishing service for ReelFlow Studio.
 *
 * Publishes Reels DIRECTLY from the phone to Facebook — no cloud backend,
 * no server cost. Implements the official 3-phase Reels upload protocol:
 *
 *   Phase 1: POST /{page-id}/video_reels?upload_phase=start   -> video_id + upload_url
 *   Phase 2: POST {upload_url} with video bytes               -> binary transfer
 *   Phase 3: POST /{page-id}/video_reels?upload_phase=finish  -> published Reel
 *
 * Page access tokens are read from [SecureTokenStore] (encrypted) and are
 * never logged or embedded in the app binary.
 */
class RealMetaPublishingService(
    private val context: Context,
    private val apiVersion: String = "v21.0"
) : MetaGraphPublishingService {

    private val tokenStore = SecureTokenStore(context)

    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(120, TimeUnit.SECONDS)
        .writeTimeout(600, TimeUnit.SECONDS)
        .build()

    private val baseUrl: String get() = "https://graph.facebook.com/$apiVersion"

    // ------------------------------------------------------------------
    // Token management (delegated to the encrypted store)
    // ------------------------------------------------------------------

    fun savePageToken(graphPageId: String, token: String) =
        tokenStore.savePageToken(graphPageId, token)

    fun hasPageToken(graphPageId: String): Boolean =
        tokenStore.hasToken(graphPageId)

    fun removePageToken(graphPageId: String) =
        tokenStore.removePageToken(graphPageId)

    // ------------------------------------------------------------------
    // MetaGraphPublishingService
    // ------------------------------------------------------------------

    override suspend fun verifyPageToken(pageId: String): Result<TokenHealth> =
        withContext(Dispatchers.IO) {
            val token = tokenStore.getPageToken(pageId)
                ?: return@withContext Result.failure(
                    Exception("No access token saved for page $pageId. Add it in Page Manager.")
                )
            try {
                val url = "$baseUrl/$pageId?fields=id,name&access_token=$token"
                val request = Request.Builder().url(url).get().build()
                client.newCall(request).execute().use { resp ->
                    val body = resp.body?.string().orEmpty()
                    if (!resp.isSuccessful) {
                        val msg = runCatching {
                            JSONObject(body).optJSONObject("error")?.optString("message")
                        }.getOrNull()?.takeIf { it.isNotBlank() }
                            ?: "Token verification failed (HTTP ${resp.code})"
                        return@withContext Result.failure(Exception(msg))
                    }
                    Result.success(TokenHealth.ACTIVE)
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    override suspend fun uploadAndPublishReel(
        pageId: String,
        videoUriOrUrl: String,
        title: String,
        caption: String,
        hashtags: List<String>,
        idempotencyKey: String
    ): Result<PublishRecord> = withContext(Dispatchers.IO) {
        val token = tokenStore.getPageToken(pageId)
            ?: return@withContext Result.failure(
                Exception("No access token saved for page $pageId. Add it in Page Manager.")
            )
        try {
            val videoFile = resolveVideoFile(videoUriOrUrl)
                ?: return@withContext Result.failure(
                    Exception("Could not read video source: $videoUriOrUrl")
                )

            // ---- Phase 1: initialize upload session ----
            val startUrl = "$baseUrl/$pageId/video_reels"
            val startBody = FormBody.Builder()
                .add("upload_phase", "start")
                .add("access_token", token)
                .build()
            val startJson: JSONObject
            val startOk: Boolean
            client.newCall(Request.Builder().url(startUrl).post(startBody).build())
                .execute().use { resp ->
                    startOk = resp.isSuccessful
                    startJson = JSONObject(resp.body?.string().orEmpty())
                }
            if (!startOk) {
                throw Exception(
                    "Phase 1 (start) failed: " +
                        (startJson.optJSONObject("error")?.optString("message") ?: "unknown error")
                )
            }
            val videoId = startJson.optString("video_id")
            val uploadUrl = startJson.optString("upload_url")
            if (videoId.isBlank() || uploadUrl.isBlank()) {
                throw Exception("Phase 1 returned no video_id/upload_url.")
            }

            // ---- Phase 2: transfer video bytes ----
            val uploadRequest = Request.Builder()
                .url(uploadUrl)
                .addHeader("Authorization", "OAuth $token")
                .addHeader("offset", "0")
                .addHeader("file_size", videoFile.length().toString())
                .post(videoFile.asRequestBody("video/mp4".toMediaType()))
                .build()
            val uploadOk: Boolean
            val uploadBody: String
            client.newCall(uploadRequest).execute().use { resp ->
                uploadOk = resp.isSuccessful
                uploadBody = resp.body?.string().orEmpty()
            }
            if (!uploadOk) throw Exception("Phase 2 (upload) failed: $uploadBody")

            // ---- Phase 3: finish & publish ----
            val description = buildString {
                if (title.isNotBlank()) append(title).append("\n\n")
                if (caption.isNotBlank()) append(caption)
                if (hashtags.isNotEmpty()) append("\n\n").append(hashtags.joinToString(" "))
            }.take(2200)
            val finishBody = FormBody.Builder()
                .add("upload_phase", "finish")
                .add("access_token", token)
                .add("video_id", videoId)
                .add("video_state", "PUBLISHED")
                .add("description", description)
                .build()
            val finishJson: JSONObject
            val finishOk: Boolean
            client.newCall(Request.Builder().url(startUrl).post(finishBody).build())
                .execute().use { resp ->
                    finishOk = resp.isSuccessful
                    finishJson = JSONObject(resp.body?.string().orEmpty())
                }
            if (!finishOk) {
                throw Exception(
                    "Phase 3 (finish) failed: " +
                        (finishJson.optJSONObject("error")?.optString("message") ?: "unknown error")
                )
            }
            val reelId = finishJson.optString("id").ifBlank { videoId }
            Result.success(
                PublishRecord(
                    facebookReelId = reelId,
                    postUrl = "https://www.facebook.com/reel/$reelId"
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /**
     * Resolves [videoUriOrUrl] to a local temp file.
     * Accepts http(s) URLs (downloaded to cache) and Android content/file URIs.
     */
    private fun resolveVideoFile(videoUriOrUrl: String): File? {
        return try {
            if (videoUriOrUrl.startsWith("http://") || videoUriOrUrl.startsWith("https://")) {
                val request = Request.Builder().url(videoUriOrUrl).get().build()
                client.newCall(request).execute().use { resp ->
                    if (!resp.isSuccessful) return null
                    val tmp = File.createTempFile("reel_dl_", ".mp4", context.cacheDir)
                    resp.body?.byteStream()?.use { input ->
                        FileOutputStream(tmp).use { output -> input.copyTo(output) }
                    }
                    tmp
                }
            } else {
                val uri = Uri.parse(videoUriOrUrl)
                val tmp = File.createTempFile("reel_local_", ".mp4", context.cacheDir)
                context.contentResolver.openInputStream(uri)?.use { input ->
                    FileOutputStream(tmp).use { output -> input.copyTo(output) }
                } ?: return null
                tmp
            }
        } catch (e: Exception) {
            null
        }
    }
}
