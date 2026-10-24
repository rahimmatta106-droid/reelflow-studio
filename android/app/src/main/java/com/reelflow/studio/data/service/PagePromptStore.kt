package com.reelflow.studio.data.service

import android.content.Context

/**
 * Per-page master prompt storage.
 *
 * Each page gets its own saved master prompt. Videos for that page are then
 * generated 100% according to the saved prompt — verbatim, no rewriting,
 * no "improvement". Prompts are plain text (not secrets), stored in
 * SharedPreferences keyed by page id.
 */
class PagePromptStore(context: Context) {

    private val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS = "reelflow_page_prompts"
        private const val PREFIX = "master_prompt_"
    }

    /** Save (or replace) the master prompt for a page. Blank clears it. */
    fun saveMasterPrompt(pageId: String, prompt: String) {
        val editor = prefs.edit()
        if (prompt.isBlank()) {
            editor.remove(PREFIX + pageId)
        } else {
            editor.putString(PREFIX + pageId, prompt)
        }
        editor.apply()
    }

    /** The saved master prompt for a page, or null when none is saved. */
    fun getMasterPrompt(pageId: String): String? =
        prefs.getString(PREFIX + pageId, null)?.takeIf { it.isNotBlank() }

    /** True when the page has a saved master prompt. */
    fun hasMasterPrompt(pageId: String): Boolean = getMasterPrompt(pageId) != null

    /** All saved prompts as pageId -> prompt. */
    fun getAllPrompts(): Map<String, String> {
        val out = mutableMapOf<String, String>()
        for ((key, value) in prefs.all) {
            if (key.startsWith(PREFIX) && value is String && value.isNotBlank()) {
                out[key.removePrefix(PREFIX)] = value
            }
        }
        return out
    }
}
