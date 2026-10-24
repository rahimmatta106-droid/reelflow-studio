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
import com.reelflow.studio.data.repository.PublishingMode
import com.reelflow.studio.ui.theme.*
import com.reelflow.studio.viewmodel.ReelFlowViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsLogsScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val logs by viewModel.logs.collectAsState()
    val publishingMode by viewModel.publishingMode.collectAsState()
    var logSearch by remember { mutableStateOf("") }

    val filteredLogs = logs.filter {
        logSearch.isEmpty() || it.message.contains(logSearch, ignoreCase = true) || it.tag.contains(logSearch, ignoreCase = true)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Error Logs", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
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
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Publishing Mode Card (MOCK vs REAL Meta Graph API)
            Card(
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = BorderStroke(
                    1.dp,
                    if (publishingMode == PublishingMode.REAL) EmeraldGreen else Slate800
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            if (publishingMode == PublishingMode.REAL) Icons.Default.CloudDone else Icons.Default.CloudOff,
                            contentDescription = null,
                            tint = if (publishingMode == PublishingMode.REAL) EmeraldGreen else Slate400
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Publishing Mode", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                    }
                    Text(
                        if (publishingMode == PublishingMode.REAL)
                            "REAL: Reels publish live to Facebook via Meta Graph API v21.0, directly from this device. Page tokens are stored encrypted."
                        else
                            "MOCK: Publishing is simulated with fake Reel IDs. Nothing goes live on Facebook.",
                        color = Slate400,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilterChip(
                            selected = publishingMode == PublishingMode.MOCK,
                            onClick = { viewModel.setPublishingMode(PublishingMode.MOCK) },
                            label = { Text("Mock", fontSize = 12.sp) },
                            modifier = Modifier.weight(1f)
                        )
                        FilterChip(
                            selected = publishingMode == PublishingMode.REAL,
                            onClick = { viewModel.setPublishingMode(PublishingMode.REAL) },
                            label = { Text("Real (Meta API)", fontSize = 12.sp) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (publishingMode == PublishingMode.REAL) {
                        Text(
                            "Add each Page's access token in Page Manager before publishing. Verify tokens with the check button.",
                            color = EmeraldGreen,
                            fontSize = 11.sp
                        )
                    }
                }
            }

            // Facebook Login Card — one-tap real page connect
            run {
                val fbMessage by viewModel.fbLoginMessage.collectAsState()
                Card(
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    border = BorderStroke(1.dp, Slate800),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Facebook, contentDescription = null, tint = AccentSky)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Connect Facebook Pages", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        }
                        Text(
                            "Tap below, log in with Facebook and grant page permissions. " +
                                "All your pages connect automatically — no manual tokens. " +
                                "Real mode switches ON by itself.",
                            color = Slate400,
                            fontSize = 11.sp,
                            lineHeight = 16.sp
                        )
                        Button(
                            onClick = { viewModel.requestFacebookLogin() },
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1877F2)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Login with Facebook", color = Color.White, fontSize = 13.sp)
                        }
                        if (fbMessage != null) {
                            Text(fbMessage!!, color = AccentSky, fontSize = 11.sp)
                        }
                    }
                }
            }

            // Mock Architecture Disclosure Card
            Card(
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = BorderStroke(1.dp, Slate800),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Code, contentDescription = null, tint = AccentSky)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("ReelFlow Studio v1 Architecture", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                    }
                    Text(
                        "• Sample Data: 500 realistic Facebook Pages across 10 niches\n" +
                        "• Mock Publishing Service: Simulation delays and mock Reel IDs\n" +
                        "• Prepared Interfaces: Ready to plug into Google Veo, WhatsApp Business Cloud API, and Meta Graph API v21.0 without rewriting screens",
                        color = Slate400,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            }

            // System Logs Search
            Text("SYSTEM & ERROR LOGS (${filteredLogs.size})", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            OutlinedTextField(
                value = logSearch,
                onValueChange = { logSearch = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Filter logs by tag or message...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate400) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Slate900,
                    unfocusedContainerColor = Slate900,
                    focusedBorderColor = PrimaryBlue,
                    unfocusedBorderColor = Slate800,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp),
                singleLine = true
            )

            // Logs Stream
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(filteredLogs, key = { it.id }) { log ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Slate900),
                        border = BorderStroke(1.dp, Slate800),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(
                                        when (log.level) {
                                            "ERROR" -> RoseError
                                            "WARN" -> AmberWarning
                                            else -> EmeraldGreen
                                        },
                                        shape = RoundedCornerShape(4.dp)
                                    )
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(log.tag, color = AccentSky, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                    Text(log.level, color = Slate400, fontSize = 10.sp)
                                }
                                Text(log.message, color = Color.White, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            // Action
            Button(
                onClick = { viewModel.addLog("USER_TEST", "Test diagnostic event triggered by user") },
                modifier = Modifier.fillMaxWidth().height(44.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Emit Diagnostic Log Event", color = Color.White, fontSize = 12.sp)
            }
        }
    }
}
