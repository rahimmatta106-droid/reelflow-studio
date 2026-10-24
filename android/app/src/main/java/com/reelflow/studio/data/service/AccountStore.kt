package com.reelflow.studio.data.service

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Tracks Facebook accounts connected via Login (up to 50).
 *
 * Page access TOKENS stay in [SecureTokenStore] (encrypted). This store only
 * keeps account display info (id, name, page ids) so the UI can list
 * connected accounts. Tokens persist even after Facebook logout, which is
 * what makes multi-account connect easy: login -> pages saved -> logout ->
 * login next account -> repeat.
 */
data class ConnectedAccount(
    val id: String,
    val name: String,
    val pageIds: List<String>
) {
    val pageCount: Int get() = pageIds.size
}

class AccountStore(context: Context) {

    private val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS = "reelflow_accounts"
        private const val KEY = "accounts_json"
        const val MAX_ACCOUNTS = 50
    }

    fun getAccounts(): List<ConnectedAccount> {
        val raw = prefs.getString(KEY, null) ?: return emptyList()
        return try {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { i ->
                val o = arr.getJSONObject(i)
                val ids = mutableListOf<String>()
                val idArr = o.optJSONArray("pageIds")
                if (idArr != null) {
                    for (j in 0 until idArr.length()) ids.add(idArr.getString(j))
                }
                ConnectedAccount(
                    id = o.optString("id"),
                    name = o.optString("name"),
                    pageIds = ids
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    /** Add or replace an account. Returns false when the 50-account cap is hit. */
    fun addAccount(account: ConnectedAccount): Boolean {
        val current = getAccounts().filter { it.id != account.id }.toMutableList()
        if (current.size >= MAX_ACCOUNTS) return false
        current.add(account)
        save(current)
        return true
    }

    /** Remove an account; returns its page ids so their tokens can be removed too. */
    fun removeAccount(accountId: String): List<String> {
        val current = getAccounts()
        val removed = current.find { it.id == accountId }
        save(current.filter { it.id != accountId })
        return removed?.pageIds ?: emptyList()
    }

    fun totalPages(): Int = getAccounts().sumOf { it.pageCount }

    private fun save(accounts: List<ConnectedAccount>) {
        val arr = JSONArray()
        for (a in accounts) {
            val o = JSONObject()
            o.put("id", a.id)
            o.put("name", a.name)
            val ids = JSONArray()
            for (id in a.pageIds) ids.put(id)
            o.put("pageIds", ids)
            arr.put(o)
        }
        prefs.edit().putString(KEY, arr.toString()).apply()
    }
}
