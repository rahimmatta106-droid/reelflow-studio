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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.reelflow.studio.ui.navigation.Screen
import com.reelflow.studio.ui.theme.*
import com.reelflow.studio.viewmodel.ReelFlowViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScheduleScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val jobs by viewModel.jobs.collectAsState()
    val selectedJob by viewModel.selectedJob.collectAsState()
    val job = selectedJob ?: jobs.firstOrNull()

    var selectedDate by remember { mutableStateOf("2026-10-24") }
    var selectedTime by remember { mutableStateOf("15:00") }
    var selectedTimezone by remember { mutableStateOf("America/New_York (EST)") }
    var scheduleSuccess by remember { mutableStateOf(false) }

    val timezones = listOf(
        "America/New_York (EST)",
        "America/Chicago (CST)",
        "America/Los_Angeles (PST)",
        "Europe/London (GMT)",
        "UTC"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Publishing Calendar", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
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
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Selected Video Header
            Card(
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = BorderStroke(1.dp, Slate800),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Schedule, contentDescription = null, tint = AccentSky, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(job?.targetPageName ?: "Selected Facebook Page", color = PrimaryBlue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(job?.title ?: "AI Reel Video", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, maxLines = 1)
                        Text("Approved status verified for scheduled upload", color = EmeraldGreen, fontSize = 10.sp)
                    }
                }
            }

            // Date Picker Card
            Text("PUBLISHING DATE", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                listOf("Today", "Tomorrow", "+2 Days", "+3 Days").forEachIndexed { idx, label ->
                    val dateStr = "2026-10-${24 + idx}"
                    Button(
                        onClick = { selectedDate = dateStr },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedDate == dateStr) PrimaryBlue else Slate900
                        ),
                        border = BorderStroke(1.dp, if (selectedDate == dateStr) PrimaryBlue else Slate800),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(label, color = Color.White, fontSize = 11.sp)
                    }
                }
            }

            // Time Selector
            Text("PUBLISHING TIME", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                listOf("09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "08:00 PM").forEach { timeStr ->
                    Button(
                        onClick = { selectedTime = timeStr },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedTime == timeStr) PrimaryBlue else Slate900
                        ),
                        border = BorderStroke(1.dp, if (selectedTime == timeStr) PrimaryBlue else Slate800),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(2.dp)
                    ) {
                        Text(timeStr.replace(" ", "\n"), color = Color.White, fontSize = 10.sp, maxLines = 2)
                    }
                }
            }

            // Timezone Dropdown Selector
            Text("TARGET AUDIENCE TIMEZONE", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                timezones.forEach { tz ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedTimezone = tz },
                        colors = CardDefaults.cardColors(containerColor = Slate900),
                        border = BorderStroke(1.dp, if (selectedTimezone == tz) PrimaryBlue else Slate800),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(
                                selected = selectedTimezone == tz,
                                onClick = { selectedTimezone = tz },
                                colors = RadioButtonDefaults.colors(selectedColor = PrimaryBlue)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(tz, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }

            // Success Notice
            if (scheduleSuccess) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = EmeraldGreen.copy(alpha = 0.2f)),
                    border = BorderStroke(1.dp, EmeraldGreen),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = EmeraldGreen)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Reel successfully added to scheduled queue!", color = EmeraldGreen, fontSize = 11.sp)
                    }
                }
            }

            // Confirm Schedule Button
            Button(
                onClick = {
                    if (job != null) {
                        viewModel.updateSchedule(job.id, "$selectedDate $selectedTime", selectedTimezone)
                        scheduleSuccess = true
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Confirm & Schedule Reel", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }

            // Quick Link to History
            TextButton(
                onClick = { navController.navigate(Screen.HistoryPosts.route) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("View All Scheduled & Published Posts →", color = AccentSky, fontSize = 12.sp)
            }
        }
    }
}
