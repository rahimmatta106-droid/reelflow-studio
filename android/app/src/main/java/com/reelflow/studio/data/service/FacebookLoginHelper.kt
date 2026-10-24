package com.reelflow.studio.data.service

import android.app.Activity
import android.os.Bundle
import com.facebook.AccessToken
import com.facebook.CallbackManager
import com.facebook.FacebookCallback
import com.facebook.FacebookException
import com.facebook.GraphRequest
import com.facebook.login.LoginManager
import com.facebook.login.LoginResult

/**
 * Facebook Login for ReelFlow Studio — the easy way to connect real pages.
 *
 * Flow: user taps "Login with Facebook" -> grants pages permissions ->
 * helper fetches /me/accounts -> every Page access token is saved into
 * [SecureTokenStore] (encrypted). Real publishing then works with no
 * manual copy-paste.
 *
 * NOTE: requires a real Meta App ID in res/values/strings.xml
 * (facebook_app_id). Until it is set, [login] reports a clear error
 * instead of crashing.
 */
sealed class FbLoginResult {
    data class Success(
        val pageCount: Int,
        val pageNames: List<String>,
        val accountId: String = "",
        val accountName: String = "",
        val pageIds: List<String> = emptyList()
    ) : FbLoginResult()
    data class Cancelled(val reason: String = "Login cancelled") : FbLoginResult()
    data class Error(val message: String) : FbLoginResult()
}

class FacebookLoginHelper(
    private val activity: Activity,
    private val tokenStore: SecureTokenStore,
    private val callbackManager: CallbackManager,
    private val appId: String,
    private val onResult: (FbLoginResult) -> Unit
) {
    companion object {
        /** Placeholder — replace with the real Meta App ID after verification. */
        const val PLACEHOLDER_APP_ID = "000000000000000"

        val PERMISSIONS = listOf(
            "pages_show_list",
            "pages_manage_posts",
            "pages_read_engagement"
        )
    }

    fun login() {
        if (appId.isBlank() || appId == PLACEHOLDER_APP_ID) {
            onResult(
                FbLoginResult.Error(
                    "Meta App ID not set yet. Finish developer verification, " +
                        "create the ReelFlow app on developers.facebook.com, " +
                        "then set facebook_app_id in the app."
                )
            )
            return
        }
        // Fresh login every time: clears the previous session so a DIFFERENT
        // account can be added. Saved page tokens are NOT affected.
        LoginManager.getInstance().logOut()
        LoginManager.getInstance().registerCallback(
            callbackManager,
            object : FacebookCallback<LoginResult> {
                override fun onSuccess(result: LoginResult) = fetchAccountAndPages()
                override fun onCancel() = onResult(FbLoginResult.Cancelled())
                override fun onError(error: FacebookException) {
                    onResult(FbLoginResult.Error(error.message ?: "Facebook login failed"))
                }
            }
        )
        LoginManager.getInstance().logInWithReadPermissions(activity, PERMISSIONS)
    }

    fun logout() {
        LoginManager.getInstance().logOut()
    }

    private fun fetchAccountAndPages() {
        val token = AccessToken.getCurrentAccessToken()
        if (token == null) {
            onResult(FbLoginResult.Error("No Facebook access token after login"))
            return
        }
        // First: who logged in? Then: which pages do they manage?
        val meRequest = GraphRequest.newGraphPathRequest(token, "me") { meResponse ->
            val meJson = meResponse.jsonObject
            val accountId = meJson?.optString("id") ?: ""
            val accountName = meJson?.optString("name") ?: ""
            fetchPages(accountId, accountName)
        }
        meRequest.parameters = Bundle().apply { putString("fields", "id,name") }
        meRequest.executeAsync()
    }

    private fun fetchPages(accountId: String, accountName: String) {
        val token = AccessToken.getCurrentAccessToken()
        if (token == null) {
            onResult(FbLoginResult.Error("No Facebook access token after login"))
            return
        }
        val request = GraphRequest.newGraphPathRequest(token, "me/accounts") { response ->
            try {
                val data = response.jsonObject?.optJSONArray("data")
                var count = 0
                val names = mutableListOf<String>()
                val ids = mutableListOf<String>()
                if (data != null) {
                    for (i in 0 until data.length()) {
                        val page = data.getJSONObject(i)
                        val id = page.optString("id")
                        val pageToken = page.optString("access_token")
                        val name = page.optString("name")
                        if (id.isNotBlank() && pageToken.isNotBlank()) {
                            tokenStore.savePageToken(id, pageToken)
                            count++
                            ids.add(id)
                            if (name.isNotBlank()) names.add(name)
                        }
                    }
                }
                onResult(
                    FbLoginResult.Success(
                        pageCount = count,
                        pageNames = names,
                        accountId = accountId,
                        accountName = accountName,
                        pageIds = ids
                    )
                )
            } catch (e: Exception) {
                onResult(FbLoginResult.Error(e.message ?: "Failed to read your pages"))
            }
        }
        request.parameters = Bundle().apply {
            putString("fields", "id,name,access_token")
        }
        request.executeAsync()
    }
}
