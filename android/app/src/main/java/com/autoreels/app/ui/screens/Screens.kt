package com.autoreels.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable

/**
 * 15 Android App Screens Orchestrator:
 * 1. LoginScreen
 * 2. DashboardScreen
 * 3. PageManagerScreen (up to 100 pages)
 * 4. PromptStudioScreen
 * 5. VideoProviderSettingsScreen
 * 6. VideoGenerationQueueScreen
 * 7. WhatsAppReviewScreen
 * 8. VideoPreviewAndMetadataScreen
 * 9. PublishingCalendarScreen
 * 10. ScheduledPostsScreen
 * 11. PublishedPostsScreen
 * 12. FailedJobsAndRetryScreen
 * 13. AnalyticsScreen
 * 14. UsageAndCostScreen
 * 15. ApiSettingsAndAuditScreen
 */

sealed class Screen(val route: String, val title: String) {
    object Login : Screen("login", "Secure Login")
    object Dashboard : Screen("dashboard", "Main Dashboard")
    object PageManager : Screen("pages", "100 Pages Manager")
    object PromptStudio : Screen("prompt_studio", "AI Prompt Studio")
    object ProviderSettings : Screen("provider_settings", "Google Flow / Veo")
    object GenerationQueue : Screen("queue", "Video Queue")
    object WhatsAppReview : Screen("whatsapp_review", "WhatsApp Approvals")
    object VideoPreview : Screen("preview", "Video & Metadata")
    object Calendar : Screen("calendar", "Publishing Calendar")
    object ScheduledPosts : Screen("scheduled", "Scheduled Reels")
    object PublishedPosts : Screen("published", "Published Reels")
    object FailedJobs : Screen("failed", "Failed & Retries")
    object Analytics : Screen("analytics", "Analytics & Insights")
    object CostMonitoring : Screen("cost", "Budget & Usage")
    object ApiSettings : Screen("settings", "API & Audit Logs")
}

@Composable
fun AutoReelsNavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(navController)
        }
        composable(Screen.PageManager.route) {
            PageManagerScreen(navController)
        }
        composable(Screen.PromptStudio.route) {
            PromptStudioScreen(navController)
        }
        composable(Screen.WhatsAppReview.route) {
            WhatsAppReviewScreen(navController)
        }
        composable(Screen.VideoPreview.route) {
            VideoPreviewScreen(navController)
        }
        composable(Screen.GenerationQueue.route) {
            QueueScreen(navController)
        }
        composable(Screen.ScheduledPosts.route) {
            ScheduledPostsScreen(navController)
        }
        composable(Screen.PublishedPosts.route) {
            PublishedPostsScreen(navController)
        }
        composable(Screen.FailedJobs.route) {
            FailedJobsScreen(navController)
        }
        composable(Screen.Analytics.route) {
            AnalyticsScreen(navController)
        }
        composable(Screen.CostMonitoring.route) {
            CostScreen(navController)
        }
        composable(Screen.ApiSettings.route) {
            SettingsScreen(navController)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(navController: NavHostController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AutoReels Automation Engine", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A),
                    titleContentColor = Color.White
                )
            )
        },
        containerColor = Color(0xFF0F172A)
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // KPI Summary Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard("100", "Connected Pages", "98 Active · 2 Expiring", Modifier.weight(1f))
                MetricCard("5", "Active Queue", "1 Generating · 2 Review", Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard("$6.40", "Today's Cost", "Limit: $25.00 / day", Modifier.weight(1f))
                MetricCard("14.2k", "Today's Views", "Avg. +24% growth", Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(20.dp))
            Text("Quick Navigation (15 Screens)", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(10.dp))

            NavigationButton("100 Facebook Pages Manager", "Multi-tenant niche controls & token status") {
                navController.navigate(Screen.PageManager.route)
            }
            NavigationButton("AI Prompt Studio (Veo-2)", "9:16 vertical reels generator & Gemini tags") {
                navController.navigate(Screen.PromptStudio.route)
            }
            NavigationButton("WhatsApp Review Gatekeeper", "Verify signed approval tokens & decisions") {
                navController.navigate(Screen.WhatsAppReview.route)
            }
            NavigationButton("Video Generation Pipeline", "Live state machine tracker & progress") {
                navController.navigate(Screen.GenerationQueue.route)
            }
            NavigationButton("Publishing & Calendar Queue", "Scheduled Reels & automated uploads") {
                navController.navigate(Screen.ScheduledPosts.route)
            }
            NavigationButton("Failed Jobs & Retries", "Idempotent backoff & diagnostic logs") {
                navController.navigate(Screen.FailedJobs.route)
            }
            NavigationButton("Usage & Budget Limits", "Cost metering and emergency kill-switch") {
                navController.navigate(Screen.CostMonitoring.route)
            }
            NavigationButton("API Settings & Audit Trail", "WhatsApp, Meta Graph & Veo configuration") {
                navController.navigate(Screen.ApiSettings.route)
            }
        }
    }
}

@Composable
fun MetricCard(value: String, title: String, subtitle: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(value, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text(title, fontSize = 13.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(subtitle, fontSize = 11.sp, color = Color(0xFF64748B))
        }
    }
}

@Composable
fun NavigationButton(title: String, subtitle: String, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(10.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold, color = Color.White, fontSize = 14.sp)
                Text(subtitle, color = Color(0xFF94A3B8), fontSize = 12.sp)
            }
            Text("→", color = Color(0xFF38BDF8), fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PageManagerScreen(navController: NavHostController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Facebook Pages (100 Managed)") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Text("←", color = Color.White, fontSize = 20.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0F172A), titleContentColor = Color.White)
            )
        },
        containerColor = Color(0xFF0F172A)
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp)) {
            Text("100 Pages Connected across 10 Niches", color = Color(0xFF94A3B8), fontSize = 13.sp)
            Spacer(modifier = Modifier.height(12.dp))
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(10) { i ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Tech Pulse ${i + 1}", fontWeight = FontWeight.Bold, color = Color.White)
                                Text("Active · 340k Fans", color = Color(0xFF10B981), fontSize = 12.sp)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Page ID: 10984920${i} · Daily Limit: 3 Reels · EST", color = Color(0xFF64748B), fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PromptStudioScreen(navController: NavHostController) {
    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) {
        Text("AI Video Prompt Studio", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Generate 9:16 Vertical Reels with Google Veo-2", color = Color(0xFF94A3B8), fontSize = 13.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { navController.popBackStack() }) {
            Text("Back to Dashboard")
        }
    }
}

@Composable
fun WhatsAppReviewScreen(navController: NavHostController) {
    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) {
        Text("WhatsApp Approval Gatekeeper", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Requires explicit WhatsApp button click or signed web link.", color = Color(0xFF94A3B8), fontSize = 13.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { navController.popBackStack() }) {
            Text("Back to Dashboard")
        }
    }
}

@Composable fun VideoPreviewScreen(navController: NavHostController) { Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) { Text("Video Preview Screen", color = Color.White); Button(onClick = { navController.popBackStack() }) { Text("Back") } } }
@Composable fun QueueScreen(navController: NavHostController) { Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) { Text("Video Generation Queue", color = Color.White); Button(onClick = { navController.popBackStack() }) { Text("Back") } } }
@Composable fun ScheduledPostsScreen(navController: NavHostController) { Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) { Text("Scheduled Posts", color = Color.White); Button(onClick = { navController.popBackStack() }) { Text("Back") } } }
@Composable fun PublishedPostsScreen(navController: NavHostController) { Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) { Text("Published Posts", color = Color.White); Button(onClick = { navController.popBackStack() }) { Text("Back") } } }
@Composable fun FailedJobsScreen(navController: NavHostController) { Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) { Text("Failed Jobs & Retries", color = Color.White); Button(onClick = { navController.popBackStack() }) { Text("Back") } } }
@Composable fun AnalyticsScreen(navController: NavHostController) { Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) { Text("Analytics Dashboard", color = Color.White); Button(onClick = { navController.popBackStack() }) { Text("Back") } } }
@Composable fun CostScreen(navController: NavHostController) { Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) { Text("Usage & Cost Limits", color = Color.White); Button(onClick = { navController.popBackStack() }) { Text("Back") } } }
@Composable fun SettingsScreen(navController: NavHostController) { Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0F172A)).padding(16.dp)) { Text("API Settings & Audit Logs", color = Color.White); Button(onClick = { navController.popBackStack() }) { Text("Back") } } }
