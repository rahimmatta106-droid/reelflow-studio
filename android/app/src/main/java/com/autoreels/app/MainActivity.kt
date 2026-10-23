package com.autoreels.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.rememberNavController
import com.autoreels.app.ui.screens.AutoReelsNavHost

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AutoReelsTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0F172A)
                ) {
                    val navController = rememberNavController()
                    AutoReelsNavHost(navController = navController)
                }
            }
        }
    }
}

@Composable
fun AutoReelsTheme(content: @Composable () -> Unit) {
    val darkColorScheme = darkColorScheme(
        primary = Color(0xFF2563EB),
        secondary = Color(0xFF0EA5E9),
        background = Color(0xFF0F172A),
        surface = Color(0xFF1E293B),
        onPrimary = Color.White,
        onBackground = Color(0xFFF8FAFC),
        onSurface = Color(0xFFF8FAFC),
    )

    MaterialTheme(
        colorScheme = darkColorScheme,
        content = content
    )
}
