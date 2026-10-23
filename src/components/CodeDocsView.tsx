import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  BookOpen, 
  Database, 
  Server, 
  Smartphone, 
  Layers
} from 'lucide-react';

export const CodeDocsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'screens' | 'architecture' | 'config' | 'docs'>('screens');
  const [selectedFileKey, setSelectedFileKey] = useState<string>('DashboardScreen.kt');
  const [copied, setCopied] = useState<boolean>(false);

  const fileTree = {
    screens: [
      { key: 'DashboardScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/DashboardScreen.kt', desc: 'Screen 1: Video counts & status' },
      { key: 'PageManagerScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/PageManagerScreen.kt', desc: 'Screen 2: 100 Facebook Pages' },
      { key: 'PromptFormScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/PromptFormScreen.kt', desc: 'Screen 3: AI video prompt form' },
      { key: 'GalleryPickerScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/GalleryPickerScreen.kt', desc: 'Screen 4: Gallery video picker' },
      { key: 'VideoPreviewScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/VideoPreviewScreen.kt', desc: 'Screen 5: Video preview screen' },
      { key: 'MetadataEditorScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/MetadataEditorScreen.kt', desc: 'Screen 6: Title, caption, 5 hashtags' },
      { key: 'WhatsAppReviewScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/WhatsAppReviewScreen.kt', desc: 'Screen 7: WhatsApp review status' },
      { key: 'CalendarScheduleScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/CalendarScheduleScreen.kt', desc: 'Screen 8: Calendar & timezone' },
      { key: 'HistoryPostsScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/HistoryPostsScreen.kt', desc: 'Screen 9: Scheduled & history' },
      { key: 'SettingsLogsScreen.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/screens/SettingsLogsScreen.kt', desc: 'Screen 10: Settings & error logs' },
    ],
    architecture: [
      { key: 'ServiceInterfaces.kt', path: 'android/app/src/main/java/com/reelflow/studio/data/interfaces/ServiceInterfaces.kt', desc: 'Modular provider interfaces' },
      { key: 'MockPublishingService.kt', path: 'android/app/src/main/java/com/reelflow/studio/data/service/MockPublishingService.kt', desc: 'Mock service & 100 pages generator' },
      { key: 'ReelFlowRepository.kt', path: 'android/app/src/main/java/com/reelflow/studio/data/repository/ReelFlowRepository.kt', desc: 'Repository & StateFlow cache' },
      { key: 'ReelFlowViewModel.kt', path: 'android/app/src/main/java/com/reelflow/studio/viewmodel/ReelFlowViewModel.kt', desc: 'ViewModel state orchestrator' },
      { key: 'Models.kt', path: 'android/app/src/main/java/com/reelflow/studio/data/model/Models.kt', desc: 'Domain data models' },
    ],
    config: [
      { key: 'MainActivity.kt', path: 'android/app/src/main/java/com/reelflow/studio/MainActivity.kt', desc: 'Activity & Compose entrypoint' },
      { key: 'Theme.kt', path: 'android/app/src/main/java/com/reelflow/studio/ui/theme/Theme.kt', desc: 'Material3 dark theme' },
      { key: 'app/build.gradle.kts', path: 'android/app/build.gradle.kts', desc: 'App Gradle build config' },
      { key: 'AndroidManifest.xml', path: 'android/app/src/main/AndroidManifest.xml', desc: 'Android manifest permissions' },
    ],
    docs: [
      { key: 'README.md', path: 'android/README.md', desc: 'Complete setup & mock disclosures' },
    ],
  };

  const codeSnippets: Record<string, string> = {
    'DashboardScreen.kt': `package com.reelflow.studio.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.navigation.NavController
import com.reelflow.studio.viewmodel.ReelFlowViewModel

/**
 * Screen 1: Dashboard with video counts and publishing status.
 */
@Composable
fun DashboardScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // 100 Pages, Review Queue, Scheduled, Published metrics
}`,
    'PageManagerScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 2: Page manager supporting up to 100 authorized Facebook Pages.
 * Includes niche filters, search, token health, and bulk active/paused toggles.
 */
@Composable
fun PageManagerScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // Search 100 pages, filter by niche, toggle active/paused
}`,
    'PromptFormScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 3: AI video prompt form.
 * Generates 9:16 vertical Reels with 8s, 10s, 15s, and 30s durations.
 */
@Composable
fun PromptFormScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // Scene prompt, negative prompt, duration, resolution, target page
}`,
    'GalleryPickerScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 4: Gallery video picker.
 * Browses device videos with duration, size, and resolution tags.
 */
@Composable
fun GalleryPickerScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // Device storage video grid, preview thumbnails, resolution badges
}`,
    'VideoPreviewScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 5: Video preview screen.
 * 9:16 vertical Reel player with play/pause, timecode, and quick action bar.
 */
@Composable
fun VideoPreviewScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // 9:16 vertical video frame, play/pause controls, metadata overlay
}`,
    'MetadataEditorScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 6: English title, caption, and five relevant hashtags editor.
 */
@Composable
fun MetadataEditorScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // 1 title, 1 natural caption, strictly 5 hashtags editor with tag counter
}`,
    'WhatsAppReviewScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 7: WhatsApp review status screen.
 * Gatekeeper requiring explicit approval before publishing.
 */
@Composable
fun WhatsAppReviewScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // Signed approval token, review status, approve/reject buttons
}`,
    'CalendarScheduleScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 8: Publishing calendar with date, time, and timezone.
 */
@Composable
fun CalendarScheduleScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // Scheduled date picker, time presets, audience timezone dropdown
}`,
    'HistoryPostsScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 9: Scheduled posts and publishing history.
 */
@Composable
fun HistoryPostsScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // Dual tab: upcoming scheduled queue & published history with Reel IDs
}`,
    'SettingsLogsScreen.kt': `package com.reelflow.studio.ui.screens

/**
 * Screen 10: Settings and error logs.
 */
@Composable
fun SettingsLogsScreen(viewModel: ReelFlowViewModel, navController: NavController) {
    // Mock architecture disclosures, interface status, searchable log stream
}`,
    'ServiceInterfaces.kt': `package com.reelflow.studio.data.interfaces

import com.reelflow.studio.data.model.*

/**
 * Modular Provider Interfaces for Future Real Cloud Backend & Official Integrations:
 */
interface CloudBackendClient {
    suspend fun syncPages(): List<FacebookPage>
    suspend fun fetchJobs(): List<VideoReelItem>
}

interface VideoGenerationProvider {
    val providerName: String
    suspend fun generateVideo(prompt: String, negativePrompt: String, durationSeconds: Int, aspectRatio: String, resolution: String): Result<String>
}

interface WhatsAppBusinessService {
    suspend fun sendReviewNotification(recipientPhone: String, job: VideoReelItem, signedPreviewUrl: String): Result<String>
}

interface MetaGraphPublishingService {
    suspend fun uploadAndPublishReel(pageId: String, videoUriOrUrl: String, title: String, caption: String, hashtags: List<String>, idempotencyKey: String): Result<PublishRecord>
}`,
    'MockPublishingService.kt': `package com.reelflow.studio.data.service

import com.reelflow.studio.data.interfaces.*
import com.reelflow.studio.data.model.*

class MockPublishingService : CloudBackendClient, VideoGenerationProvider, WhatsAppBusinessService, MetaGraphPublishingService {
    override val providerName: String = "Google Veo-2 (Simulated)"
    // Generates 100 sample Facebook Pages across 10 niches
    // Simulates publishing and returns mock Facebook Reel IDs
}`,
    'README.md': `# ReelFlow Studio (Android Native App)
Setup Instructions:
1. Open /android in Android Studio Ladybug (2024.2+)
2. Configure JDK 17+
3. Sync Gradle
4. Run on Android device or emulator (API 26+)

Mock Disclosures:
- Mock Publishing Service simulates Meta Graph API v21.0
- Sample data includes 100 Facebook Pages across 10 niches
- Modular interfaces in ServiceInterfaces.kt ready for future real cloud backend`,
  };

  const currentSnippet = codeSnippets[selectedFileKey] || `// Source file located at /android/${selectedFileKey}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">ReelFlow Studio Source Code Explorer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full Kotlin project files: 10 Jetpack Compose screens, modular interfaces, mock services, and setup guide.
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Selected Code</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Category & Files List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => {
                setSelectedCategory('screens');
                setSelectedFileKey(fileTree.screens[0].key);
              }}
              className={`p-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                selectedCategory === 'screens' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>10 Screens</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('architecture');
                setSelectedFileKey(fileTree.architecture[0].key);
              }}
              className={`p-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                selectedCategory === 'architecture' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Interfaces</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('config');
                setSelectedFileKey(fileTree.config[0].key);
              }}
              className={`p-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                selectedCategory === 'config' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Gradle & App</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('docs');
                setSelectedFileKey(fileTree.docs[0].key);
              }}
              className={`p-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                selectedCategory === 'docs' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>README</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 text-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase px-2">Files</span>
            {fileTree[selectedCategory].map(f => (
              <button
                key={f.key}
                onClick={() => setSelectedFileKey(f.key)}
                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs flex flex-col cursor-pointer transition-colors ${
                  selectedFileKey === f.key
                    ? 'bg-slate-800 text-blue-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate font-semibold">
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.key}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5 ml-5 truncate">
                  {f.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Display */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 font-semibold">{selectedFileKey}</span>
            <span className="text-slate-500 text-[11px]">Kotlin / Compose</span>
          </div>

          <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[620px] select-all">
            <code>{currentSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
