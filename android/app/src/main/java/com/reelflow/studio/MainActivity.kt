package com.reelflow.studio

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.*
import com.reelflow.studio.data.service.RealMetaPublishingService
import com.reelflow.studio.ui.navigation.Screen
import com.reelflow.studio.ui.screens.*
import com.reelflow.studio.ui.theme.ReelFlowTheme
import com.reelflow.studio.ui.theme.Slate950
import com.reelflow.studio.viewmodel.ReelFlowViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Attach the REAL Meta Graph API publisher (direct from device, no server).
        // Publishing stays in MOCK mode until the user flips the switch in Settings.
        val realPublisher by lazy { RealMetaPublishingService(applicationContext) }
        setContent {
            ReelFlowTheme {
                val viewModel: ReelFlowViewModel = viewModel()
                LaunchedEffect(Unit) {
                    viewModel.attachRealPublishing(realPublisher)
                }
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                Scaffold(
                    containerColor = Slate950,
                    bottomBar = {
                        NavigationBar(
                            containerColor = MaterialTheme.colorScheme.surface,
                            contentColor = MaterialTheme.colorScheme.onSurface
                        ) {
                            NavigationBarItem(
                                selected = currentRoute == Screen.Dashboard.route,
                                onClick = { navController.navigate(Screen.Dashboard.route) },
                                icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                                label = { Text("Home") }
                            )
                            NavigationBarItem(
                                selected = currentRoute == Screen.PageManager.route,
                                onClick = { navController.navigate(Screen.PageManager.route) },
                                icon = { Icon(Icons.Default.Layers, contentDescription = "500 Pages") },
                                label = { Text("Pages") }
                            )
                            NavigationBarItem(
                                selected = currentRoute == Screen.PromptForm.route,
                                onClick = { navController.navigate(Screen.PromptForm.route) },
                                icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "AI Studio") },
                                label = { Text("Create") }
                            )
                            NavigationBarItem(
                                selected = currentRoute == Screen.WhatsAppReview.route,
                                onClick = { navController.navigate(Screen.WhatsAppReview.route) },
                                icon = { Icon(Icons.Default.CheckCircle, contentDescription = "Review") },
                                label = { Text("Review") }
                            )
                            NavigationBarItem(
                                selected = currentRoute == Screen.SettingsLogs.route,
                                onClick = { navController.navigate(Screen.SettingsLogs.route) },
                                icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                                label = { Text("Settings") }
                            )
                        }
                    }
                ) { padding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Dashboard.route,
                        modifier = Modifier.padding(padding)
                    ) {
                        composable(Screen.Dashboard.route) {
                            DashboardScreen(viewModel, navController)
                        }
                        composable(Screen.PageManager.route) {
                            PageManagerScreen(viewModel, navController)
                        }
                        composable(Screen.PromptForm.route) {
                            PromptFormScreen(viewModel, navController)
                        }
                        composable(Screen.GalleryPicker.route) {
                            GalleryPickerScreen(viewModel, navController)
                        }
                        composable(Screen.VideoPreview.route) {
                            VideoPreviewScreen(viewModel, navController)
                        }
                        composable(Screen.MetadataEditor.route) {
                            MetadataEditorScreen(viewModel, navController)
                        }
                        composable(Screen.WhatsAppReview.route) {
                            WhatsAppReviewScreen(viewModel, navController)
                        }
                        composable(Screen.CalendarSchedule.route) {
                            CalendarScheduleScreen(viewModel, navController)
                        }
                        composable(Screen.HistoryPosts.route) {
                            HistoryPostsScreen(viewModel, navController)
                        }
                        composable(Screen.SettingsLogs.route) {
                            SettingsLogsScreen(viewModel, navController)
                        }
                    }
                }
            }
        }
    }
}
