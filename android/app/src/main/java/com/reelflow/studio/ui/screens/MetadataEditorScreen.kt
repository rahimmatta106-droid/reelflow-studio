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
fun MetadataEditorScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val jobs by viewModel.jobs.collectAsState()
    val selectedJob by viewModel.selectedJob.collectAsState()
    val job = selectedJob ?: jobs.firstOrNull()

    var title by remember(job) { mutableStateOf(job?.title ?: "Mastering Digital Workflow in 2026") }
    var caption by remember(job) { mutableStateOf(job?.caption ?: "Here is the step-by-step breakdown you need to know today. Save this Reel for your next session!") }
    var hashtagsText by remember(job) { mutableStateOf(job?.hashtags?.joinToString(" ") ?: "#TechTips #AIWorkflow #ReelsViral #Productivity #DailyShorts") }
    var savedToast by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Metadata Editor", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            if (job != null) {
                                val tags = hashtagsText.split(" ").map { it.trim() }.filter { it.startsWith("#") }.take(5)
                                viewModel.updateMetadata(job.id, title, caption, tags)
                                savedToast = true
                            }
                        }
                    ) {
                        Text("Save", color = EmeraldGreen, fontWeight = FontWeight.Bold, fontSize = 14.sp)
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
            if (savedToast) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = EmeraldGreen.copy(alpha = 0.2f)),
                    border = BorderStroke(1.dp, EmeraldGreen),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = EmeraldGreen)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Metadata successfully updated in local state!", color = EmeraldGreen, fontSize = 12.sp)
                    }
                }
            }

            // Target Page Reference
            Card(
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = BorderStroke(1.dp, Slate800),
                shape = RoundedCornerShape(10.dp)
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Layers, contentDescription = null, tint = PrimaryBlue)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Target Page: ${job?.targetPageName ?: "General"}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text("English Title, Caption & 5 Relevant Hashtags", color = Slate400, fontSize = 11.sp)
                    }
                }
            }

            // 1. Title Input
            Text("ONE COMPELLING ENGLISH TITLE", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("High-engagement Reel title (max 10 words)...") },
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

            // 2. Caption Input
            Text("NATURAL ENGLISH CAPTION", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            OutlinedTextField(
                value = caption,
                onValueChange = { caption = it },
                modifier = Modifier.fillMaxWidth().height(130.dp),
                placeholder = { Text("Conversational description with call to action...") },
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

            // 3. Exactly 5 Relevant Hashtags
            val currentTags = hashtagsText.split(" ").filter { it.isNotBlank() }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("FIVE RELEVANT HASHTAGS", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
                Text("${currentTags.size}/5 tags", color = if (currentTags.size == 5) EmeraldGreen else AmberWarning, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            OutlinedTextField(
                value = hashtagsText,
                onValueChange = { hashtagsText = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("#Tag1 #Tag2 #Tag3 #Tag4 #Tag5") },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Slate900,
                    unfocusedContainerColor = Slate900,
                    focusedBorderColor = PrimaryBlue,
                    unfocusedBorderColor = Slate800,
                    focusedTextColor = AccentSky,
                    unfocusedTextColor = AccentSky
                ),
                shape = RoundedCornerShape(10.dp)
            )

            // Next Actions
            Button(
                onClick = {
                    if (job != null) {
                        val tags = hashtagsText.split(" ").map { it.trim() }.filter { it.startsWith("#") }.take(5)
                        viewModel.updateMetadata(job.id, title, caption, tags)
                    }
                    navController.navigate(Screen.WhatsAppReview.route)
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Proceed to WhatsApp Review", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
