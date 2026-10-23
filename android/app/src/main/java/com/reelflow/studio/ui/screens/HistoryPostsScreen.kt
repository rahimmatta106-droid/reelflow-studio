package com.reelflow.studio.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.reelflow.studio.data.model.JobStatus
import com.reelflow.studio.ui.theme.*
import com.reelflow.studio.viewmodel.ReelFlowViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryPostsScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val jobs by viewModel.jobs.collectAsState()
    var selectedTab by remember { mutableStateOf(0) } // 0: Scheduled, 1: Published

    val scheduledPosts = jobs.filter { it.status == JobStatus.SCHEDULED }
    val publishedPosts = jobs.filter { it.status == JobStatus.PUBLISHED }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scheduled & History", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Segmented Tab Controls
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Slate900,
                contentColor = Color.White,
                divider = {}
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Scheduled (${scheduledPosts.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Published History (${publishedPosts.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
            }

            if (selectedTab == 0) {
                // Scheduled Posts Tab
                if (scheduledPosts.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No upcoming scheduled posts found.", color = Slate400, fontSize = 13.sp)
                    }
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxSize()) {
                        items(scheduledPosts, key = { it.id }) { post ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = Slate900),
                                border = BorderStroke(1.dp, Slate800),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(post.targetPageName, color = PrimaryBlue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                        Text("⏱ Scheduled", color = AccentSky, fontWeight = FontWeight.Medium, fontSize = 11.sp)
                                    }
                                    Text(post.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Text(post.caption, color = Slate400, fontSize = 11.sp, maxLines = 2)

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            post.scheduledDateTime ?: "Tomorrow at 15:00",
                                            color = Slate300,
                                            fontSize = 11.sp
                                        )
                                        Button(
                                            onClick = { viewModel.mockPublishNow(post.id) },
                                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                                            shape = RoundedCornerShape(6.dp),
                                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                        ) {
                                            Text("Mock Publish Now", fontSize = 10.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // Published History Tab
                if (publishedPosts.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No published history yet.", color = Slate400, fontSize = 13.sp)
                    }
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxSize()) {
                        items(publishedPosts, key = { it.id }) { post ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = Slate900),
                                border = BorderStroke(1.dp, Slate800),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(post.targetPageName, color = PrimaryBlue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                        Text("✓ Published", color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                    }
                                    Text(post.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Text(
                                        "Facebook Reel ID: ${post.publishRecord?.facebookReelId ?: "reel_sim_live"}",
                                        color = AccentSky,
                                        fontSize = 11.sp
                                    )

                                    Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                                        Text("Views: ${post.publishRecord?.initialViews ?: 0}", color = Slate300, fontSize = 11.sp)
                                        Text("Reach: ${post.publishRecord?.initialReach ?: 0}", color = Slate400, fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
