package com.reelflow.studio.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Slate950 = Color(0xFF020617)
val Slate900 = Color(0xFF0F172A)
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Slate400 = Color(0xFF94A3B8)
val Slate300 = Color(0xFFCBD5E1)

val PrimaryBlue = Color(0xFF2563EB)
val AccentSky = Color(0xFF0284C7)
val EmeraldGreen = Color(0xFF10B981)
val AmberWarning = Color(0xFFF59E0B)
val RoseError = Color(0xFFEF4444)

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryBlue,
    onPrimary = Color.White,
    primaryContainer = Slate800,
    onPrimaryContainer = Color.White,
    secondary = AccentSky,
    onSecondary = Color.White,
    background = Slate950,
    onBackground = Color(0xFFF8FAFC),
    surface = Slate900,
    onSurface = Color(0xFFF8FAFC),
    surfaceVariant = Slate800,
    onSurfaceVariant = Slate400,
    outline = Slate700,
    error = RoseError,
    onError = Color.White
)

@Composable
fun ReelFlowTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography(),
        content = content
    )
}
