package com.pokertool.util

import android.content.Context
import android.content.SharedPreferences

class PrefsManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("pokertool_prefs", Context.MODE_PRIVATE)

    var apiKey: String
        get() = prefs.getString("api_key", "") ?: ""
        set(value) = prefs.edit().putString("api_key", value).apply()

    var playStyle: String
        get() = prefs.getString("play_style", "Balanced") ?: "Balanced"
        set(value) = prefs.edit().putString("play_style", value).apply()

    var model: String
        get() = prefs.getString("model", "gpt-4o") ?: "gpt-4o"
        set(value) = prefs.edit().putString("model", value).apply()

    val hasApiKey: Boolean
        get() = apiKey.isNotBlank()
}
