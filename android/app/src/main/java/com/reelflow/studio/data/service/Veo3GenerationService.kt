package com.reelflow.studio.data.service

import android.content.Context
import com.reelflow.studio.data.interfaces.VideoGenerationProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.File
import java.io.FileOutputStream
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

/**
 * REAL Google Veo 3 video generation — direct Gemini API, no backend server.
 *
 * Flow: POST predictLongRunning -> poll operation -> download video bytes
 * to local storage -> return the local file path (ready for preview/publish).
 *
 * Models: "veo-3.0-generate-001" (quality + audio) or
 * "veo-3.0-fast-generate-001" (cheaper/faster). Veo 3 generates 8s clips.
 * Aspect ratio "9:16" for vertical Reels.
 *
 * COST (Gemini API, approx): Veo 3 Quality ~$0.75/sec, Fast ~$0.40/sec.
 * One 8s clip ≈ $6.00 (quality) / $3.20 (fast). Billing is on the user's
 * own Google Cloud account via their API key — ReelFlow never sees the key
 * beyond encrypted on-device storage.
 */
class Veo3GenerationService(
    private val context: Context,
    private val apiKey: String,
    private val model: String = MODEL_QUALITY
) : VideoGenerationProvider {

    companion object {
        const val MODEL_QUALITY = "veo-3.0-generate-001"
        const val MODEL_FAST = "veo-3.0-fast-generate-001"
        private const val BASE = "https://generativelanguage.googleapis.com/v1beta"
        private const val POLL_TIMEOUT_MS = 420_000L // 7 minutes
        private const val POLL_INTERVAL_MS = 10_000L
    }

    override val providerName: String = "Google Veo 3 ($model)"

    override suspend fun generateVideo(
        prompt: String,
        negativePrompt: String,
        durationSeconds: Int,
        aspectRatio: String,
        resolution: String
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            if (apiKey.isBlank()) {
                return@withContext Result.failure(
                    Exception("Veo API key not set. Add it in Settings first.")
                )
            }
            // Veo 3 always generates 8s clips; duration is informational here.
            val fullPrompt = if (negativePrompt.isNotBlank()) {
                "$prompt. Avoid: $negativePrompt"
            } else {
                prompt
            }
            val operationName = submit(fullPrompt, aspectRatio)
                ?: return@withContext Result.failure(
                    Exception("Veo did not return an operation")
                )
            val videoUri = pollUntilDone(operationName)
                ?: return@withContext Result.failure(
                    Exception("Veo generation timed out")
                )
            val localPath = downloadVideo(videoUri)
            Result.success(localPath)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun submit(prompt: String, aspectRatio: String): String? {
        val url = URL("$BASE/models/$model:predictLongRunning")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("x-goog-api-key", apiKey)
            doOutput = true
            connectTimeout = 30_000
            readTimeout = 30_000
        }
        val payload = JSONObject().apply {
            put("instances", org.json.JSONArray().put(JSONObject().put("prompt", prompt)))
            put("parameters", JSONObject().apply {
                put("aspectRatio", if (aspectRatio == "9:16") "9:16" else "16:9")
                put("durationSeconds", 8)
            })
        }
        OutputStreamWriter(conn.outputStream).use { it.write(payload.toString()); it.flush() }
        val code = conn.responseCode
        val body = readBody(conn)
        if (code !in 200..299) {
            throw Exception("Veo submit failed ($code): ${shortError(body)}")
        }
        return JSONObject(body).optString("name").takeIf { it.isNotBlank() }
    }

    private suspend fun pollUntilDone(operationName: String): String? {
        val start = System.currentTimeMillis()
        while (System.currentTimeMillis() - start < POLL_TIMEOUT_MS) {
            delay(POLL_INTERVAL_MS)
            val url = URL("$BASE/$operationName")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                setRequestProperty("x-goog-api-key", apiKey)
                connectTimeout = 15_000
                readTimeout = 15_000
            }
            val code = conn.responseCode
            val body = readBody(conn)
            if (code !in 200..299) continue
            val json = JSONObject(body)
            if (json.optBoolean("done")) {
                if (json.has("error")) {
                    val err = json.optJSONObject("error")
                    throw Exception(
                        "Veo failed: ${err?.optString("message") ?: "unknown error"}"
                    )
                }
                val uri = json.optJSONObject("response")
                    ?.optJSONObject("generateVideoResponse")
                    ?.optJSONArray("generatedSamples")
                    ?.optJSONObject(0)
                    ?.optJSONObject("video")
                    ?.optString("uri")
                if (!uri.isNullOrBlank()) return uri
                return null
            }
        }
        return null
    }

    private fun downloadVideo(videoUri: String): String {
        // Video bytes also require the API key.
        val sep = if (videoUri.contains("?")) "&" else "?"
        val url = URL("$videoUri${sep}key=$apiKey")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 30_000
            readTimeout = 300_000
        }
        if (conn.responseCode !in 200..299) {
            throw Exception("Video download failed (${conn.responseCode})")
        }
        val outFile = File(context.filesDir, "veo_${System.currentTimeMillis()}.mp4")
        conn.inputStream.use { input ->
            FileOutputStream(outFile).use { output -> input.copyTo(output) }
        }
        return outFile.absolutePath
    }

    private fun readBody(conn: HttpURLConnection): String {
        val stream = if (conn.responseCode in 200..299) {
            conn.inputStream
        } else {
            conn.errorStream ?: conn.inputStream
        }
        return BufferedReader(InputStreamReader(stream)).use { it.readText() }
    }

    private fun shortError(body: String): String {
        return try {
            JSONObject(body).optJSONObject("error")?.optString("message") ?: body
        } catch (e: Exception) {
            body
        }.take(300)
    }

    override fun observeGenerationProgress(jobId: String): Flow<Int> = flow {
        // Veo has no progress API; emit an indeterminate pulse while polling.
        var p = 5
        while (p < 95) {
            emit(p)
            delay(10_000)
            p += 10
        }
    }
}
