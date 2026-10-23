package com.reelflow.studio.data.service

import com.reelflow.studio.data.interfaces.VideoGenerationProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

/**
 * Production-ready Real Video Generation Provider for ReelFlow Studio.
 * Connects securely to the ReelFlow Cloud Backend which invokes Google's official
 * Video Generation API (gemini-omni-1.1-flash).
 *
 * Security Guarantee:
 * - ZERO Google API keys or credentials are baked into the Android application binary.
 * - All generative requests are proxied and audited through the cloud backend.
 * - Real errors (billing requirements, quota exhaustion, safety rejections) are preserved
 *   and surfaced directly without simulation.
 */
class RealVideoGenerationService(
    private val backendBaseUrl: String = "http://10.0.2.2:3000" // Default Android emulator loopback
) : VideoGenerationProvider {

    override val providerName: String = "Google Veo (gemini-omni-1.1-flash via Backend)"

    override suspend fun generateVideo(
        prompt: String,
        negativePrompt: String,
        durationSeconds: Int,
        aspectRatio: String,
        resolution: String
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            // 1. Submit Generation Job to Cloud Backend
            val submitUrl = URL("$backendBaseUrl/api/video/generate")
            val connection = (submitUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                doOutput = true
                connectTimeout = 15000
                readTimeout = 15000
            }

            val payload = JSONObject().apply {
                put("prompt", prompt)
                put("negativePrompt", negativePrompt)
                put("durationSeconds", durationSeconds)
                put("aspectRatio", aspectRatio)
                put("resolution", resolution)
                put("autoPublishOnApproval", true)
            }

            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(payload.toString())
                writer.flush()
            }

            val responseCode = connection.responseCode
            val responseStream = if (responseCode in 200..299) {
                connection.inputStream
            } else {
                connection.errorStream ?: connection.inputStream
            }

            val responseBody = BufferedReader(InputStreamReader(responseStream)).use { it.readText() }
            if (responseCode !in 200..299) {
                val errorMsg = try {
                    JSONObject(responseBody).optString("error", "HTTP $responseCode submission failure")
                } catch (e: Exception) {
                    "HTTP $responseCode: $responseBody"
                }
                return@withContext Result.failure(Exception(errorMsg))
            }

            val jsonResponse = JSONObject(responseBody)
            val jobId = jsonResponse.optString("jobId")
            if (jobId.isEmpty()) {
                return@withContext Result.failure(Exception("Backend did not return a valid jobId"))
            }

            // 2. Poll for Status until COMPLETED or FAILED (Max 5 minutes)
            val pollTimeoutMillis = 300_000L
            val pollIntervalMillis = 3_000L
            val startTime = System.currentTimeMillis()

            while (System.currentTimeMillis() - startTime < pollTimeoutMillis) {
                delay(pollIntervalMillis)

                val pollUrl = URL("$backendBaseUrl/api/video/jobs/$jobId")
                val pollConn = (pollUrl.openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    setRequestProperty("Accept", "application/json")
                    connectTimeout = 10000
                    readTimeout = 10000
                }

                if (pollConn.responseCode in 200..299) {
                    val pollBody = BufferedReader(InputStreamReader(pollConn.inputStream)).use { it.readText() }
                    val pollJson = JSONObject(pollBody).optJSONObject("job")

                    if (pollJson != null) {
                        val status = pollJson.optString("status")
                        when (status) {
                            "WAITING_FOR_APPROVAL", "VIDEO_READY", "COMPLETED", "POST_SCHEDULED", "PUBLISHED" -> {
                                val videoUrl = pollJson.optString("videoUrl")
                                if (videoUrl.isNotEmpty()) {
                                    val resolvedUrl = if (videoUrl.startsWith("/")) {
                                        "$backendBaseUrl$videoUrl"
                                    } else {
                                        videoUrl
                                    }
                                    return@withContext Result.success(resolvedUrl)
                                }
                            }
                            "FAILED" -> {
                                val errorReason = pollJson.optString("errorReason", "External Video API generation failed")
                                return@withContext Result.failure(Exception(errorReason))
                            }
                        }
                    }
                }
            }

            Result.failure(Exception("Video generation timed out after 5 minutes"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun observeGenerationProgress(jobId: String): Flow<Int> = flow {
        var isTerminal = false
        var attempts = 0
        val maxAttempts = 100

        while (!isTerminal && attempts < maxAttempts) {
            attempts++
            try {
                val pollUrl = URL("$backendBaseUrl/api/video/jobs/$jobId")
                val pollConn = (pollUrl.openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    setRequestProperty("Accept", "application/json")
                    connectTimeout = 5000
                    readTimeout = 5000
                }

                if (pollConn.responseCode in 200..299) {
                    val pollBody = BufferedReader(InputStreamReader(pollConn.inputStream)).use { it.readText() }
                    val pollJson = JSONObject(pollBody).optJSONObject("job")
                    if (pollJson != null) {
                        val progress = pollJson.optInt("progressPercent", 0)
                        emit(progress)
                        val status = pollJson.optString("status")
                        if (status in listOf("WAITING_FOR_APPROVAL", "VIDEO_READY", "COMPLETED", "FAILED")) {
                            isTerminal = true
                        }
                    }
                }
            } catch (e: Exception) {
                // Ignore transient network read drops during polling
            }

            if (!isTerminal) {
                delay(2000)
            }
        }
    }
}
