package com.reelflow.studio.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import com.reelflow.studio.data.model.GalleryMediaItem
import com.reelflow.studio.ui.navigation.Screen
import com.reelflow.studio.ui.theme.*
import com.reelflow.studio.viewmodel.ReelFlowViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GalleryPickerScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val galleryMedia by viewModel.galleryMedia.collectAsState()
    val pages by viewModel.pages.collectAsState()
    var selectedMedia by remember { mutableStateOf<GalleryMediaItem?>(galleryMedia.firstOrNull()) }
    var selectedPageId by remember { mutableStateOf(pages.firstOrNull()?.id ?: "") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gallery Video Picker", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
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
            Text("SELECT VIDEO FROM DEVICE STORAGE", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = Slate400)

            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(galleryMedia, key = { it.id }) { item ->
                    val isSelected = selectedMedia?.id == item.id
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedMedia = item },
                        colors = CardDefaults.cardColors(containerColor = Slate900),
                        border = BorderStroke(2.dp, if (isSelected) PrimaryBlue else Slate800),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(130.dp)
                                    .background(Color.Black),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.PlayCircle, contentDescription = null, tint = Color.White.copy(alpha = 0.8f), modifier = Modifier.size(36.dp))
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.BottomEnd)
                                        .padding(6.dp)
                                        .background(Color.Black.copy(alpha = 0.7f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(item.durationText, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(item.filename, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, maxLines = 1)
                                Text("${item.resolutionText} · ${item.sizeText}", color = Slate400, fontSize = 10.sp)
                            }
                        }
                    }
                }
            }

            // Target Page Info
            Card(
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = BorderStroke(1.dp, Slate800),
                shape = RoundedCornerShape(10.dp)
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Layers, contentDescription = null, tint = PrimaryBlue)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text("Target: ${pages.find { it.id == selectedPageId }?.name ?: "Facebook Page"}", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text("Ready to attach video to 9:16 publishing queue", color = Slate400, fontSize = 11.sp)
                    }
                }
            }

            // Proceed Button
            Button(
                onClick = {
                    selectedMedia?.let { media ->
                        viewModel.importGalleryVideo(media, selectedPageId)
                        navController.navigate(Screen.VideoPreview.route)
                    }
                },
                enabled = selectedMedia != null,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Select & Continue to Preview", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
