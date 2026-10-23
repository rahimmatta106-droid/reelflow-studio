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
import com.reelflow.studio.data.model.FacebookPage
import com.reelflow.studio.data.model.TokenHealth
import com.reelflow.studio.ui.theme.*
import com.reelflow.studio.viewmodel.ReelFlowViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PageManagerScreen(
    viewModel: ReelFlowViewModel,
    navController: NavController
) {
    val pages by viewModel.pages.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var selectedNiche by remember { mutableStateOf("All") }
    var selectedIds by remember { mutableStateOf(setOf<String>()) }
    var tokenDialogPage by remember { mutableStateOf<FacebookPage?>(null) }
    var tokenInput by remember { mutableStateOf("") }
    var tokenError by remember { mutableStateOf<String?>(null) }

    val niches = listOf("All", "Tech & AI", "Fitness & Wellness", "Travel & Adventure", "Cuisine & Cooking", "Finance & Crypto", "Gaming")

    val filteredPages = pages.filter { page ->
        (selectedNiche == "All" || page.niche == selectedNiche) &&
        (searchQuery.isEmpty() || page.name.contains(searchQuery, ignoreCase = true) || page.pageId.contains(searchQuery))
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("500 Facebook Pages", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    if (selectedIds.isNotEmpty()) {
                        TextButton(onClick = { viewModel.bulkTogglePages(selectedIds, true) }) {
                            Text("Enable (${selectedIds.size})", color = EmeraldGreen, fontSize = 12.sp)
                        }
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
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Search Input
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search 500 pages by name or ID...", color = Slate400, fontSize = 12.sp) },
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

            // Niche Horizontal Scroll
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                niches.forEach { niche ->
                    FilterChip(
                        selected = selectedNiche == niche,
                        onClick = { selectedNiche = niche },
                        label = { Text(niche, fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryBlue,
                            selectedLabelColor = Color.White,
                            containerColor = Slate900,
                            labelColor = Slate400
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            borderColor = Slate800,
                            selectedBorderColor = PrimaryBlue,
                            enabled = true,
                            selected = selectedNiche == niche
                        )
                    )
                }
            }

            // Results Counter & Select All
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Showing ${filteredPages.size} of 500 Authorized Pages",
                    fontSize = 11.sp,
                    color = Slate400
                )
                TextButton(
                    onClick = {
                        selectedIds = if (selectedIds.size == filteredPages.size) emptySet() else filteredPages.map { it.id }.toSet()
                    }
                ) {
                    Text(
                        if (selectedIds.size == filteredPages.size) "Deselect All" else "Select All",
                        fontSize = 11.sp,
                        color = AccentSky
                    )
                }
            }

            // Lazy List of Pages
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredPages, key = { it.id }) { page ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Slate900),
                        border = BorderStroke(1.dp, if (selectedIds.contains(page.id)) PrimaryBlue else Slate800),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = selectedIds.contains(page.id),
                                onCheckedChange = { checked ->
                                    selectedIds = if (checked) selectedIds + page.id else selectedIds - page.id
                                },
                                colors = CheckboxDefaults.colors(checkedColor = PrimaryBlue)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(page.name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                                Text("${page.niche} · ID: ${page.pageId}", color = Slate400, fontSize = 11.sp)
                                Spacer(modifier = Modifier.height(2.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text("${page.followers / 1000}k Followers", color = Slate300, fontSize = 10.sp)
                                    Text("Limit: ${page.dailyPublishLimit}/day", color = Slate400, fontSize = 10.sp)
                                    Text(
                                        when (page.tokenHealth) {
                                            TokenHealth.ACTIVE -> "Token Active"
                                            TokenHealth.EXPIRING_SOON -> "Expiring Soon"
                                            TokenHealth.EXPIRED -> "Expired"
                                        },
                                        color = when (page.tokenHealth) {
                                            TokenHealth.ACTIVE -> EmeraldGreen
                                            TokenHealth.EXPIRING_SOON -> AmberWarning
                                            TokenHealth.EXPIRED -> RoseError
                                        },
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                            // Token key button (real Meta API)
                            IconButton(onClick = {
                                tokenDialogPage = page
                                tokenInput = ""
                                tokenError = null
                            }) {
                                Icon(
                                    Icons.Default.Key,
                                    contentDescription = "Set Page access token",
                                    tint = if (viewModel.hasPageToken(page.pageId)) EmeraldGreen else Slate400
                                )
                            }
                            Switch(
                                checked = page.isEnabled,
                                onCheckedChange = { viewModel.togglePage(page.id, it) },
                                colors = SwitchDefaults.colors(checkedThumbColor = EmeraldGreen)
                            )
                        }
                    }
                }
            }
        }
    }

    // Page access token dialog (stored encrypted on-device, never logged)
    tokenDialogPage?.let { page ->
        AlertDialog(
            onDismissRequest = { tokenDialogPage = null },
            title = { Text("Page Access Token", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "Paste the access token for \"${page.name}\" (ID ${page.pageId}). It is stored encrypted on this device only.",
                        color = Slate400,
                        fontSize = 12.sp
                    )
                    OutlinedTextField(
                        value = tokenInput,
                        onValueChange = { tokenInput = it; tokenError = null },
                        placeholder = { Text("EAAB...", fontSize = 12.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Slate900,
                            unfocusedContainerColor = Slate900,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = PrimaryBlue,
                            unfocusedBorderColor = Slate800
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                    tokenError?.let { Text(it, color = RoseError, fontSize = 11.sp) }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    if (tokenInput.isBlank()) {
                        tokenError = "Token cannot be empty."
                    } else {
                        viewModel.savePageToken(page.pageId, tokenInput.trim())
                        viewModel.verifyPageToken(page) { result ->
                            result.onFailure { e -> tokenError = e.message }
                            result.onSuccess { tokenDialogPage = null }
                        }
                    }
                }) { Text("Save & Verify", color = EmeraldGreen, fontSize = 13.sp) }
            },
            dismissButton = {
                TextButton(onClick = { tokenDialogPage = null }) {
                    Text("Cancel", color = Slate400, fontSize = 13.sp)
                }
            },
            containerColor = Slate900,
            shape = RoundedCornerShape(14.dp)
        )
    }
}
