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
fun PromptFormScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val pages by viewModel.pages.collectAsState()
    var selectedPageId by remember { mutableStateOf(pages.firstOrNull()?.id ?: "") }
    var prompt by remember { mutableStateOf("Futuristic quantum AI lab with floating neon neural interfaces, cinematic forward motion, 8k vertical reel") }
    var negativePrompt by remember { mutableStateOf("blurry, low quality, artifacts, watermark") }
    var durationSeconds by remember { mutableStateOf(15) }
    var isSubmitting by remember { mutableStateOf(false) }

    val selectedPage = pages.find { it.id == selectedPageId } ?: pages.firstOrNull()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Video Prompt Form", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
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
            // Notice: Mock Video Provider
            Card(
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = BorderStroke(1.dp, Slate800),
                shape = RoundedCornerShape(10.dp)
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Info, contentDescription = null, tint = AccentSky, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Mock Provider: Google Veo-2 Adapter interface prepared. Submitting creates a simulated 9:16 Reel job.",
                        fontSize = 11.sp,
                        color = Slate400
                    )
                }
            }

            // Target Page Dropdown
            Text("TARGET FACEBOOK PAGE", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = BorderStroke(1.dp, Slate800),
                shape = RoundedCornerShape(10.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(selectedPage?.name ?: "Select Page", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                    Text("${selectedPage?.niche} · Limit: ${selectedPage?.dailyPublishLimit}/day", color = Slate400, fontSize = 11.sp)
                }
            }

            // Page master prompt (100% verbatim) — fills the prompt field as-is
            run {
                val masterPrompts by viewModel.pageMasterPrompts.collectAsState()
                val saved = masterPrompts[selectedPageId]
                if (saved != null) {
                    Button(
                        onClick = { prompt = saved },
                        modifier = Modifier.fillMaxWidth().height(44.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Description, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Use Saved Master Prompt (100% same)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        "This page has a saved master prompt. Tap above to load it exactly as saved — nothing is changed.",
                        fontSize = 11.sp, color = Slate400
                    )
                } else {
                    Text(
                        "No master prompt saved for this page. Save one from Pages tab (📄 icon) to reuse it 100% verbatim.",
                        fontSize = 11.sp, color = Slate400
                    )
                }
            }

            // Prompt Input
            Text("SCENE PROMPT (9:16 VERTICAL REEL)", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            OutlinedTextField(
                value = prompt,
                onValueChange = { prompt = it },
                modifier = Modifier.fillMaxWidth().height(120.dp),
                placeholder = { Text("Describe visual action, camera glide, lighting, and mood...") },
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

            // Negative Prompt
            Text("NEGATIVE PROMPT (ELEMENTS TO EXCLUDE)", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            OutlinedTextField(
                value = negativePrompt,
                onValueChange = { negativePrompt = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("blurry, low quality, distorted text") },
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

            // Duration Selector (8s, 10s, 15s, 30s)
            Text("CONFIGURABLE DURATION", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                listOf(8, 10, 15, 30).forEach { dur ->
                    Button(
                        onClick = { durationSeconds = dur },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (durationSeconds == dur) PrimaryBlue else Slate900
                        ),
                        border = BorderStroke(1.dp, if (durationSeconds == dur) PrimaryBlue else Slate800),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("${dur}s", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Aspect Ratio (Locked to 9:16 Reels)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Aspect Ratio: 9:16 Vertical (Facebook Reels)", color = Slate300, fontSize = 12.sp)
                Text("1080x1920", color = AccentSky, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Submit Button (mock preview flow)
            Button(
                onClick = {
                    isSubmitting = true
                    viewModel.createNewPromptJob(
                        prompt = prompt,
                        negativePrompt = negativePrompt,
                        durationSeconds = durationSeconds,
                        targetPageId = selectedPageId
                    )
                    navController.navigate(Screen.VideoPreview.route)
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Synthesize & Advance to Preview", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }

            // REAL Veo 3 generation (needs Gemini API key in Settings)
            run {
                val veoKey by viewModel.veoApiKey.collectAsState()
                val veoStatus by viewModel.veoStatus.collectAsState()
                Button(
                    onClick = {
                        viewModel.generateVeoVideo(
                            prompt = prompt,
                            negativePrompt = negativePrompt,
                            targetPageId = selectedPageId
                        )
                    },
                    enabled = veoKey != null,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F9D58)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Movie, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        if (veoKey != null) "Generate REAL Video with Veo 3 (8s)"
                        else "Generate with Veo 3 (needs API key in Settings)",
                        fontSize = 13.sp, fontWeight = FontWeight.Bold
                    )
                }
                if (veoStatus != null) {
                    Text(veoStatus!!, fontSize = 11.sp)
                }
            }
        }
    }
}
