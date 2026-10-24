package com.reelflow.studio.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.reelflow.studio.data.model.JobStatus
import com.reelflow.studio.ui.navigation.Screen
import com.reelflow.studio.ui.theme.*
import com.reelflow.studio.viewmodel.ReelFlowViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val pages by viewModel.pages.collectAsState()
    val jobs by viewModel.jobs.collectAsState()

    val readyForReviewCount = jobs.count { it.status == JobStatus.READY_FOR_REVIEW || it.status == JobStatus.WHATSAPP_REVIEW_SENT }
    val scheduledCount = jobs.count { it.status == JobStatus.SCHEDULED }
    val publishedCount = jobs.count { it.status == JobStatus.PUBLISHED }
    val totalViews = jobs.filter { it.status == JobStatus.PUBLISHED }.sumOf { it.publishRecord?.initialViews ?: 0 }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Rahim Facebook Automation Agent", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("500 Facebook Pages Automation", fontSize = 11.sp, color = Slate400)
                    }
                },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.SettingsLogs.route) }) {
                        Icon(Icons.Default.Info, contentDescription = "Mock Info", tint = Slate400)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Slate900,
                    titleContentColor = Color.White
                )
            )
        },
        containerColor = Slate950
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Mock System Banner
            Card(
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = BorderStroke(1.dp, Slate800),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CloudQueue, contentDescription = null, tint = AccentSky, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text("Simulation Mode (v1.0)", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Text("Ready for future Cloud Backend, Veo API & Meta Graph v21.0", fontSize = 11.sp, color = Slate400)
                    }
                }
            }

            // Status Metrics Grid
            Text("VIDEO COUNTS & STATUS", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400, letterSpacing = 1.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                MetricBox("500", "Pages", "425 Active", Slate800, Modifier.weight(1f)) {
                    navController.navigate(Screen.PageManager.route)
                }
                MetricBox("$readyForReviewCount", "Review", "Pending WA", Slate800, Modifier.weight(1f)) {
                    navController.navigate(Screen.WhatsAppReview.route)
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                MetricBox("$scheduledCount", "Scheduled", "Upcoming", Slate800, Modifier.weight(1f)) {
                    navController.navigate(Screen.CalendarSchedule.route)
                }
                MetricBox("$publishedCount", "Published", "${totalViews / 1000}k Views", Slate800, Modifier.weight(1f)) {
                    navController.navigate(Screen.HistoryPosts.route)
                }
            }

            // Quick Create Strip
            Text("CREATE & SOURCE REELS", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400, letterSpacing = 1.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { navController.navigate(Screen.PromptForm.route) },
                    modifier = Modifier.weight(1f).height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("AI Prompt", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = { navController.navigate(Screen.GalleryPicker.route) },
                    modifier = Modifier.weight(1f).height(48.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                    border = BorderStroke(1.dp, Slate700),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.VideoLibrary, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Gallery Picker", fontSize = 13.sp)
                }
            }

            // Recent Active Video Queue
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("RECENT QUEUE ITEMS", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400, letterSpacing = 1.sp)
                TextButton(onClick = { navController.navigate(Screen.HistoryPosts.route) }) {
                    Text("All Posts", fontSize = 11.sp, color = AccentSky)
                }
            }

            jobs.take(3).forEach { job ->
                Card(
                    modifier = Modifier.fillMaxWidth().clickable {
                        viewModel.selectJob(job)
                        navController.navigate(Screen.VideoPreview.route)
                    },
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    border = BorderStroke(1.dp, Slate800),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(50.dp, 75.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color.Black),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, tint = Color.White.copy(alpha = 0.8f))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(job.targetPageName, color = PrimaryBlue, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Text(job.title.ifEmpty { "AI Generated Reel" }, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                            Text(job.caption, color = Slate400, fontSize = 11.sp, maxLines = 1)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "Status: ${job.status.name.replace("_", " ")}",
                                color = if (job.status == JobStatus.PUBLISHED) EmeraldGreen else AccentSky,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate700)
                    }
                }
            }
        }
    }
}

@Composable
fun MetricBox(value: String, title: String, subtitle: String, background: Color, modifier: Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = background),
        border = BorderStroke(1.dp, Slate700),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text(title, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate300)
            Text(subtitle, fontSize = 10.sp, color = Slate400)
        }
    }
}
