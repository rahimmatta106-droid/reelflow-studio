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
import com.reelflow.studio.data.model.JobStatus
import com.reelflow.studio.ui.navigation.Screen
import com.reelflow.studio.ui.theme.*
import com.reelflow.studio.viewmodel.ReelFlowViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WhatsAppReviewScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val jobs by viewModel.jobs.collectAsState()
    val selectedJob by viewModel.selectedJob.collectAsState()
    val job = selectedJob ?: jobs.firstOrNull()

    var reviewerNote by remember { mutableStateOf("") }
    var actionRecorded by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("WhatsApp Review Status", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
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
        if (job == null) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No video job available for review", color = Slate400)
            }
        } else {
            Column(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Mock WhatsApp Business Notice
                Card(
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    border = BorderStroke(1.dp, Slate800),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = EmeraldGreen)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Official WhatsApp Business Platform adapter prepared. Post will NEVER publish to Facebook without explicit approval record.",
                            fontSize = 11.sp,
                            color = Slate400
                        )
                    }
                }

                // WhatsApp Message Card Preview
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0B141A)),
                    border = BorderStroke(1.dp, Color(0xFF202C33)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("AutoReels Review Bot", color = Color(0xFF00A884), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("Recipient: ${job.whatsappReviewStatus.recipientPhone}", color = Color(0xFF8696A0), fontSize = 10.sp)
                        }

                        Divider(color = Color(0xFF202C33))

                        Text("🎬 NEW REEL FOR REVIEW", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("Target: ${job.targetPageName}", color = Color(0xFF8696A0), fontSize = 11.sp)
                        Text(job.title, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                        Text(job.caption, color = Color(0xFFE9EDEF), fontSize = 11.sp)
                        Text(job.hashtags.joinToString(" "), color = Color(0xFF53BDEB), fontSize = 10.sp)

                        // Signed Token
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF111B21), RoundedCornerShape(6.dp))
                                .padding(8.dp)
                        ) {
                            Text("Token: sig_${job.whatsappReviewStatus.signedToken} · Status: ${job.whatsappReviewStatus.status}", color = Color(0xFF8696A0), fontSize = 10.sp)
                        }
                    }
                }

                // Reviewer Decision Actions
                Text("EXPLICIT APPROVAL GATEKEEPER", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)

                OutlinedTextField(
                    value = reviewerNote,
                    onValueChange = { reviewerNote = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Optional reviewer comment or rejection reason...") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Slate900,
                        unfocusedContainerColor = Slate900,
                        focusedBorderColor = PrimaryBlue,
                        unfocusedBorderColor = Slate800,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    ),
                    shape = RoundedCornerShape(10.dp)
                )

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(
                        onClick = {
                            viewModel.submitWhatsAppReview(job.id, approved = true, comment = reviewerNote.ifEmpty { "Approved in mobile app" })
                            actionRecorded = "Approved"
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("APPROVE", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }

                    OutlinedButton(
                        onClick = {
                            viewModel.submitWhatsAppReview(job.id, approved = false, comment = reviewerNote.ifEmpty { "Rejected by reviewer" })
                            actionRecorded = "Rejected"
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = RoseError),
                        border = BorderStroke(1.dp, RoseError),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("REJECT", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }

                if (actionRecorded != null) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Slate900),
                        border = BorderStroke(1.dp, if (actionRecorded == "Approved") EmeraldGreen else RoseError),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("Decision recorded: $actionRecorded. Ready to proceed to publishing calendar.", color = Color.White, fontSize = 11.sp)
                        }
                    }
                }

                // Proceed Button
                Button(
                    onClick = { navController.navigate(Screen.CalendarSchedule.route) },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Proceed to Publishing Calendar", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }
        }
    }
}
