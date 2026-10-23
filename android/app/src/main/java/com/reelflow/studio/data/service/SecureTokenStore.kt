package com.reelflow.studio.data.service

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Secure storage for Facebook Page access tokens.
 *
 * Security guarantees:
 * - Tokens are encrypted at rest with AES256-GCM (AndroidX Security).
 * - Tokens are NEVER stored in data models, logs, or plain preferences.
 * - Keyed by the Graph Page ID (e.g. "1222195227651341").
 */
class SecureTokenStore(context: Context) {

    private val masterKey: MasterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "reelflow_secure_tokens",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    /** Save (or replace) the Page access token for a Graph Page ID. */
    fun savePageToken(graphPageId: String, token: String) {
        prefs.edit().putString(keyFor(graphPageId), token.trim()).apply()
    }

    /** Returns the saved token, or null when the page has none. */
    fun getPageToken(graphPageId: String): String? =
        prefs.getString(keyFor(graphPageId), null)?.takeIf { it.isNotBlank() }

    /** True when a token is saved for this Graph Page ID. */
    fun hasToken(graphPageId: String): Boolean = getPageToken(graphPageId) != null

    /** Remove the saved token (e.g. on revoke / page removal). */
    fun removePageToken(graphPageId: String) {
        prefs.edit().remove(keyFor(graphPageId)).apply()
    }

    /** Graph Page IDs that currently have a saved token. */
    fun pagesWithTokens(): Set<String> =
        prefs.all.keys
            .filter { it.startsWith(PREFIX) }
            .map { it.removePrefix(PREFIX) }
            .toSet()

    fun clearAll() {
        prefs.edit().clear().apply()
    }

    private fun keyFor(graphPageId: String) = "$PREFIX$graphPageId"

    companion object {
        private const val PREFIX = "page_token_"
    }
}
