import React, { useState } from 'react';
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Layers, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Settings, 
  TrendingUp, 
  Play, 
  Pause,
  ArrowLeft,
  Search,
  Check,
  X,
  Upload,
  Calendar,
  Eye,
  Info,
  ShieldCheck,
  ChevronRight,
  Edit,
  Video
} from 'lucide-react';
import type { FacebookPage, VideoJob, BudgetConfig } from '../types';

interface AndroidEmulatorViewProps {
  pages: FacebookPage[];
  jobs: VideoJob[];
  budget: BudgetConfig;
  onOpenPreview: (job: VideoJob) => void;
  onApproveJob: (job: VideoJob) => void;
  onRejectJob: (job: VideoJob) => void;
}

export const AndroidEmulatorView: React.FC<AndroidEmulatorViewProps> = ({
  pages,
  jobs,
  budget,
  onOpenPreview,
  onApproveJob,
  onRejectJob,
}) => {
  // Screen 1 to 10 mapped exactly to user prompt:
  // 1: Dashboard with video counts and publishing status
  // 2: Page manager supporting up to 100 authorized Facebook Pages
  // 3: AI video prompt form
  // 4: Gallery video picker
  // 5: Video preview screen
  // 6: English title, caption, and five relevant hashtags editor
  // 7: WhatsApp review status screen
  // 8: Publishing calendar with date, time, and timezone
  // 9: Scheduled posts and publishing history
  // 10: Settings and error logs
  const [currentScreen, setCurrentScreen] = useState<number>(1);
  const [selectedJob, setSelectedJob] = useState<VideoJob>(jobs[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Screen 2 state (Page Manager)
  const [pageSearch, setPageSearch] = useState<string>('');
  const [selectedNiche, setSelectedNiche] = useState<string>('All');

  // Screen 3 state (Prompt Form)
  const [promptText, setPromptText] = useState<string>(
    'Futuristic quantum computing lab with floating neon neural interfaces, cinematic forward glide, 8k vertical reel'
  );
  const [negativePrompt, setNegativePrompt] = useState<string>('blurry, low quality, artifacts');
  const [duration, setDuration] = useState<number>(15);
  const [targetPageId, setTargetPageId] = useState<string>(pages[0]?.id || 'page_1');
  const [isRealGeneratingInPhone, setIsRealGeneratingInPhone] = useState<boolean>(false);
  const [phoneGenError, setPhoneGenError] = useState<string | null>(null);
  const [phoneGenStatus, setPhoneGenStatus] = useState<string>('');

  const handlePhoneGenerateRealVideo = async () => {
    setIsRealGeneratingInPhone(true);
    setPhoneGenError(null);
    setPhoneGenStatus('Submitting to Google Video API...');

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          negativePrompt: negativePrompt,
          targetPageId: targetPageId,
          durationSeconds: duration <= 5 ? 5 : 10,
          aspectRatio: '9:16',
          resolution: '720p',
          autoPublishOnApproval: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit generation job');
      }

      const jobId = data.jobId;
      setPhoneGenStatus('Cloud rendering in progress...');

      const pollTimer = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/video/jobs/${jobId}`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            if (pollData.job) {
              const j = pollData.job;
              setPhoneGenStatus(`Progress: ${j.progressPercent}% (${j.status})`);
              if (j.status === 'WAITING_FOR_APPROVAL' || j.status === 'VIDEO_READY') {
                clearInterval(pollTimer);
                setIsRealGeneratingInPhone(false);
                setSelectedJob(j);
                setTitle(j.metadata.title);
                setCaption(j.metadata.caption);
                setHashtags(j.metadata.hashtags.join(' '));
                setCurrentScreen(5);
              } else if (j.status === 'FAILED') {
                clearInterval(pollTimer);
                setIsRealGeneratingInPhone(false);
                setPhoneGenError(j.errorReason || 'Google Video Generation API error');
              }
            }
          }
        } catch (e: any) {
          // Ignore transient poll error
        }
      }, 2500);

    } catch (err: any) {
      setIsRealGeneratingInPhone(false);
      setPhoneGenError(err?.message || 'Failed to connect to backend video service');
    }
  };

  // Screen 4 state (Gallery Picker)
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('gal_1');
  const galleryVideos = [
    { id: 'gal_1', name: 'Reel_CyberLab_01.mp4', dur: '0:15', size: '24.5 MB', res: '1080x1920', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80' },
    { id: 'gal_2', name: 'Reel_GymKettlebell_02.mp4', dur: '0:10', size: '16.8 MB', res: '1080x1920', thumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80' },
    { id: 'gal_3', name: 'Reel_DolomitesLake_03.mp4', dur: '0:15', size: '28.1 MB', res: '1080x1920', thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
    { id: 'gal_4', name: 'Reel_GarlicSkillet_04.mp4', dur: '0:08', size: '12.3 MB', res: '1080x1920', thumb: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80' },
  ];

  // Screen 6 state (Metadata Editor)
  const [title, setTitle] = useState<string>(selectedJob?.metadata?.title || 'Quantum AI Just Shattered Computing Limits!');
  const [caption, setCaption] = useState<string>(selectedJob?.metadata?.caption || 'Witness the breakthrough moment researchers unlocked the first real-time holographic quantum processor.');
  const [hashtags, setHashtags] = useState<string>(selectedJob?.metadata?.hashtags?.join(' ') || '#QuantumAI #FutureTech #ArtificialIntelligence #TechNews #DeepTech');
  const [savedMetadataToast, setSavedMetadataToast] = useState<boolean>(false);

  // Screen 7 state (WhatsApp Review)
  const [reviewerComment, setReviewerComment] = useState<string>('');
  const [approvalActionNotice, setApprovalActionNotice] = useState<string | null>(null);

  // Screen 8 state (Calendar Schedule)
  const [scheduledDate, setScheduledDate] = useState<string>('2026-10-24');
  const [scheduledTime, setScheduledTime] = useState<string>('15:00');
  const [scheduledTz, setScheduledTz] = useState<string>('America/New_York (EST)');
  const [scheduleNotice, setScheduleNotice] = useState<boolean>(false);

  // Screen 9 state (History Posts)
  const [historyTab, setHistoryTab] = useState<'scheduled' | 'published'>('scheduled');

  // Screen 10 state (Settings & Logs)
  const [logSearch, setLogSearch] = useState<string>('');

  const screens = [
    { id: 1, name: '1. Dashboard' },
    { id: 2, name: '2. 100 Pages Manager' },
    { id: 3, name: '3. AI Prompt Form' },
    { id: 4, name: '4. Gallery Video Picker' },
    { id: 5, name: '5. Video Preview Screen' },
    { id: 6, name: '6. Title, Caption & 5 Hashtags' },
    { id: 7, name: '7. WhatsApp Review Status' },
    { id: 8, name: '8. Publishing Calendar' },
    { id: 9, name: '9. Scheduled & History' },
    { id: 10, name: '10. Settings & Error Logs' },
  ];

  const filteredPages = pages.filter(p => {
    return (selectedNiche === 'All' || p.niche === selectedNiche) &&
      (pageSearch === '' || p.name.toLowerCase().includes(pageSearch.toLowerCase()) || p.pageId.includes(pageSearch));
  });

  return (
    <div className="space-y-6">
      {/* Screen Title & Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">ReelFlow Studio Android App (Jetpack Compose)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Native mobile interface built with Kotlin, Material3, and modular service interfaces. All 10 screens functional.
          </p>
        </div>

        {/* Quick Screen Selector Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Active Screen:</span>
          <select
            value={currentScreen}
            onChange={e => setCurrentScreen(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-none cursor-pointer"
          >
            {screens.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Screen Switcher on Left + Mobile Phone Frame on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: 10 Screens Drawer */}
        <div className="lg:col-span-4 space-y-2 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-2">
            10 Native Android Screens
          </h3>
          <div className="space-y-1.5 text-xs">
            {screens.map(s => (
              <button
                key={s.id}
                onClick={() => setCurrentScreen(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  currentScreen === s.id
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{s.name}</span>
                <span className="font-mono text-[10px] opacity-70">Compose</span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-1 mt-4">
            <div className="font-semibold text-slate-300">Mock Implementation Notice</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Version 1.0 uses sample data and mock publishing service. All controls are interactive. Ready for cloud backend.
            </p>
          </div>
        </div>

        {/* Center/Right: Realistic Pixel 9 Pro Mobile Frame */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-[375px] h-[750px] bg-black rounded-[50px] p-3 border-4 border-slate-700 shadow-2xl relative flex flex-col overflow-hidden">
            {/* Top Speaker & Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
            </div>

            {/* Mobile Screen Inside Frame */}
            <div className="w-full h-full bg-slate-950 rounded-[40px] overflow-hidden flex flex-col relative text-white">
              {/* Android Status Bar */}
              <div className="pt-2 px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Dynamic Screen Header Bar */}
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {currentScreen !== 1 && (
                    <button
                      onClick={() => setCurrentScreen(1)}
                      className="text-slate-300 hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <span className="font-bold text-xs text-white">
                    {screens.find(s => s.id === currentScreen)?.name.replace(/^\d+\.\s*/, '')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800/50">
                  ReelFlow
                </span>
              </div>

              {/* Active Screen Viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {/* ------------------------------------------------------------- */}
                {/* Screen 1: Dashboard with video counts and publishing status */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 1 && (
                  <div className="space-y-3.5">
                    {/* Mock Disclosure Pill */}
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                      <Info className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="text-[10px] text-slate-300">
                        <strong>Simulation Mode:</strong> Sample metrics & mock publishing daemon active.
                      </div>
                    </div>

                    {/* Video Counts Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div 
                        onClick={() => setCurrentScreen(2)}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <div className="text-[10px] text-slate-400">Authorized Pages</div>
                        <div className="text-xl font-bold font-mono text-white mt-0.5">100</div>
                        <div className="text-[10px] text-emerald-400">85 Active · 10 Niches</div>
                      </div>

                      <div 
                        onClick={() => setCurrentScreen(7)}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <div className="text-[10px] text-slate-400">Awaiting WhatsApp</div>
                        <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                          {jobs.filter(j => j.status === 'WAITING_FOR_APPROVAL').length}
                        </div>
                        <div className="text-[10px] text-slate-400">Review Gatekeeper</div>
                      </div>

                      <div 
                        onClick={() => setCurrentScreen(9)}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <div className="text-[10px] text-slate-400">Scheduled Posts</div>
                        <div className="text-xl font-bold font-mono text-white mt-0.5">
                          {jobs.filter(j => j.status === 'POST_SCHEDULED').length}
                        </div>
                        <div className="text-[10px] text-blue-400">Ready for Meta</div>
                      </div>

                      <div 
                        onClick={() => setCurrentScreen(9)}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <div className="text-[10px] text-slate-400">Published Reels</div>
                        <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                          {jobs.filter(j => j.status === 'PUBLISHED').length}
                        </div>
                        <div className="text-[10px] text-slate-400">14.2k Total Views</div>
                      </div>
                    </div>

                    {/* Quick Creation Actions */}
                    <div className="pt-1 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                        Quick Source & Create
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setCurrentScreen(3)}
                          className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Prompt</span>
                        </button>

                        <button
                          onClick={() => setCurrentScreen(4)}
                          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-sky-400" />
                          <span>Gallery Media</span>
                        </button>
                      </div>
                    </div>

                    {/* Recent Reel in Queue */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                        <span>LATEST REEL IN PIPELINE</span>
                        <span 
                          onClick={() => setCurrentScreen(5)}
                          className="text-blue-400 cursor-pointer hover:underline"
                        >
                          Preview Reel
                        </span>
                      </div>

                      {selectedJob && (
                        <div 
                          onClick={() => setCurrentScreen(5)}
                          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 cursor-pointer hover:border-slate-700"
                        >
                          <div className="flex gap-2.5">
                            <div className="w-12 h-18 bg-black rounded-lg overflow-hidden shrink-0 relative">
                              <img 
                                src={selectedJob.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80'} 
                                alt="Reel" 
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Play className="w-3.5 h-3.5 text-white fill-white" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <span className="text-[10px] text-blue-400 font-semibold">{selectedJob.targetPageName}</span>
                              <div className="text-white font-semibold text-xs line-clamp-1">{selectedJob.metadata.title}</div>
                              <div className="text-[10px] text-slate-400 line-clamp-1">{selectedJob.metadata.caption}</div>
                              <div className="text-[10px] text-emerald-400 font-mono">Status: {selectedJob.status}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 2: Page manager supporting up to 100 authorized Pages */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 2 && (
                  <div className="space-y-2.5">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search 100 pages..."
                        value={pageSearch}
                        onChange={e => setPageSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                    </div>

                    {/* Niche Chips */}
                    <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                      {['All', 'Tech & AI', 'Fitness', 'Travel', 'Cuisine', 'Finance'].map(n => (
                        <button
                          key={n}
                          onClick={() => setSelectedNiche(n === 'Fitness' ? 'Fitness & Wellness' : n === 'Travel' ? 'Travel & Adventure' : n === 'Cuisine' ? 'Cuisine & Cooking' : n === 'Finance' ? 'Finance & Crypto' : n)}
                          className={`px-2 py-1 rounded-md shrink-0 cursor-pointer ${
                            selectedNiche.includes(n) ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono">
                      Showing {filteredPages.length} of 100 Pages
                    </div>

                    {/* Pages List */}
                    <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-0.5">
                      {filteredPages.slice(0, 15).map(p => (
                        <div key={p.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.niche} · ID: {p.pageId}</div>
                            <div className="text-[9px] text-emerald-400 font-mono">
                              {(p.followers / 1000).toFixed(0)}k followers · Limit: {p.dailyLimit}/day
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            p.isEnabled ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {p.isEnabled ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 3: AI video prompt form */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Target Page</label>
                      <select 
                        value={targetPageId}
                        onChange={e => setTargetPageId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                      >
                        {pages.slice(0, 10).map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.niche})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Scene Description (9:16 Vertical Reel)</label>
                      <textarea
                        rows={3}
                        value={promptText}
                        onChange={e => setPromptText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Negative Prompt</label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={e => setNegativePrompt(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Duration</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[8, 10, 15, 30].map(d => (
                          <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={`py-1.5 rounded text-xs font-mono font-medium ${
                              duration === d ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {d}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400">
                      Engine: <strong>Google Veo (gemini-omni-1.1-flash)</strong> · Format: <strong>9:16 Vertical</strong>
                    </div>

                    {/* Real Generation Status or Error */}
                    {phoneGenStatus && (
                      <div className="p-2 bg-blue-950/70 border border-blue-800 rounded-lg text-[10px] text-blue-200 animate-pulse">
                        ⏳ {phoneGenStatus}
                      </div>
                    )}

                    {phoneGenError && (
                      <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-lg text-[10px] text-rose-200 space-y-1">
                        <div className="font-bold text-rose-300">Google Video API Output:</div>
                        <div className="font-mono text-[9px] bg-black/40 p-1.5 rounded">{phoneGenError}</div>
                        <div className="text-[9px] text-slate-300">
                          (No fake simulation: reports true external API response)
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 pt-1">
                      <button
                        onClick={handlePhoneGenerateRealVideo}
                        disabled={isRealGeneratingInPhone}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <span>⚡ Generate Real AI Reel (Backend)</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentScreen(5); // Advance to preview
                        }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 font-medium text-xs cursor-pointer"
                      >
                        Preview Current Active Reel →
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 4: Gallery video picker */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 4 && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-400">
                      Select local device video for 9:16 Reel formatting:
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {galleryVideos.map(item => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedGalleryId(item.id)}
                          className={`p-2 bg-slate-900 border rounded-xl cursor-pointer ${
                            selectedGalleryId === item.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800'
                          }`}
                        >
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <img src={item.thumb} alt="thumb" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 px-1 rounded text-white">
                              {item.dur}
                            </span>
                          </div>
                          <div className="mt-1 text-[10px] font-semibold text-white truncate">{item.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{item.res} · {item.size}</div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentScreen(5)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs cursor-pointer shadow-sm mt-2"
                    >
                      Use Selected Gallery Video →
                    </button>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 5: Video preview screen */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 5 && selectedJob && (
                  <div className="space-y-3 flex flex-col items-center">
                    {/* 9:16 Vertical Reel Player */}
                    <div 
                      className="relative w-[210px] h-[373px] bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-lg group"
                    >
                      {selectedJob.videoUrl ? (
                        <video 
                          src={selectedJob.videoUrl}
                          poster={selectedJob.thumbnailUrl}
                          controls
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <img 
                            src={selectedJob.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'} 
                            alt="Reel" 
                            className="w-full h-full object-cover" 
                          />
                          <div 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="absolute inset-0 bg-black/25 flex items-center justify-center cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-white">
                              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Overlay Info */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 text-left pointer-events-none">
                        <div className="text-[10px] text-sky-400 font-bold">{selectedJob.targetPageName}</div>
                        <div className="text-white text-xs font-semibold line-clamp-1">{selectedJob.metadata.title}</div>
                        <div className="text-[9px] text-slate-300 font-mono mt-0.5">{selectedJob.metadata.hashtags.slice(0, 3).join(' ')}</div>
                      </div>

                      <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono pointer-events-none">
                        9:16 · {selectedJob.durationSeconds}s
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="w-full grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setCurrentScreen(6)}
                        className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-white font-medium text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Metadata</span>
                      </button>

                      <button
                        onClick={() => setCurrentScreen(7)}
                        className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>WhatsApp Review</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 6: Title, caption, and 5 hashtags editor */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 6 && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">One Compelling English Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Natural English Caption</label>
                      <textarea
                        rows={3}
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-slate-400">Strictly 5 Relevant Hashtags</label>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {hashtags.split(' ').filter(t => t.startsWith('#')).length}/5 tags
                        </span>
                      </div>
                      <input
                        type="text"
                        value={hashtags}
                        onChange={e => setHashtags(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sky-400 text-xs font-mono"
                      />
                    </div>

                    {savedMetadataToast && (
                      <div className="p-2 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-[10px]">
                        ✓ Title, caption, and 5 hashtags updated!
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSavedMetadataToast(true);
                          setTimeout(() => setSavedMetadataToast(false), 1500);
                        }}
                        className="py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-medium cursor-pointer"
                      >
                        Save Locally
                      </button>

                      <button
                        onClick={() => setCurrentScreen(7)}
                        className="py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        To WhatsApp Review →
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 7: WhatsApp review status screen */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 7 && selectedJob && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0b141a] border border-[#202c33] rounded-xl space-y-2 font-sans">
                      <div className="flex justify-between items-center text-[10px] text-[#8696a0]">
                        <span className="text-[#00a884] font-bold">WhatsApp Review Gatekeeper</span>
                        <span>{selectedJob.whatsappReview.status}</span>
                      </div>
                      <div className="text-white text-xs font-semibold">{title}</div>
                      <div className="text-[#d1d7db] text-[10px] leading-relaxed">{caption}</div>
                      <div className="text-[#53bdeb] text-[10px] font-mono">{hashtags}</div>
                      <div className="text-[9px] text-[#8696a0] font-mono">
                        Signed Token: {selectedJob.whatsappReview.signedApprovalToken}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Reviewer Reason (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Approved for 3 PM publish"
                        value={reviewerComment}
                        onChange={e => setReviewerComment(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onApproveJob(selectedJob);
                          setApprovalActionNotice('Approved');
                        }}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>APPROVE</span>
                      </button>

                      <button
                        onClick={() => {
                          onRejectJob(selectedJob);
                          setApprovalActionNotice('Rejected');
                        }}
                        className="py-2.5 bg-rose-950 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>REJECT</span>
                      </button>
                    </div>

                    {approvalActionNotice && (
                      <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300">
                        Status recorded as: <strong className="text-emerald-400">{approvalActionNotice}</strong>
                      </div>
                    )}

                    <button
                      onClick={() => setCurrentScreen(8)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs cursor-pointer shadow-sm mt-1"
                    >
                      To Publishing Calendar →
                    </button>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 8: Publishing calendar with date, time, and timezone */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 8 && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold text-slate-300">
                      Configure Publishing Date & Target Timezone:
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Scheduled Date</label>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        {['2026-10-24', '2026-10-25', '2026-10-26'].map(d => (
                          <button
                            key={d}
                            onClick={() => setScheduledDate(d)}
                            className={`py-1.5 rounded text-[11px] font-mono ${
                              scheduledDate === d ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {d.slice(5)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Scheduled Time</label>
                      <div className="grid grid-cols-4 gap-1 text-[11px]">
                        {['09:00', '12:00', '15:00', '18:00'].map(t => (
                          <button
                            key={t}
                            onClick={() => setScheduledTime(t)}
                            className={`py-1.5 rounded font-mono ${
                              scheduledTime === t ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Audience Timezone</label>
                      <select
                        value={scheduledTz}
                        onChange={e => setScheduledTz(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                      >
                        <option value="America/New_York (EST)">America/New_York (EST)</option>
                        <option value="America/Chicago (CST)">America/Chicago (CST)</option>
                        <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                        <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                      </select>
                    </div>

                    {scheduleNotice && (
                      <div className="p-2 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-[10px]">
                        ✓ Post scheduled for {scheduledDate} at {scheduledTime} ({scheduledTz})
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setScheduleNotice(true);
                        setTimeout(() => setCurrentScreen(9), 1000);
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-xs cursor-pointer shadow-sm"
                    >
                      Confirm Schedule & View Queue
                    </button>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 9: Scheduled posts and publishing history */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 9 && (
                  <div className="space-y-3">
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                      <button
                        onClick={() => setHistoryTab('scheduled')}
                        className={`flex-1 py-1.5 rounded-md font-medium ${
                          historyTab === 'scheduled' ? 'bg-blue-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        Scheduled Queue
                      </button>
                      <button
                        onClick={() => setHistoryTab('published')}
                        className={`flex-1 py-1.5 rounded-md font-medium ${
                          historyTab === 'published' ? 'bg-blue-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        Published History
                      </button>
                    </div>

                    {historyTab === 'scheduled' ? (
                      <div className="space-y-2">
                        {jobs.filter(j => j.status === 'POST_SCHEDULED').map(j => (
                          <div key={j.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-blue-400 font-semibold">{j.targetPageName}</span>
                              <span className="text-slate-400 font-mono">Tomorrow 15:00</span>
                            </div>
                            <div className="font-semibold text-white text-xs">{j.metadata.title}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">{j.metadata.caption}</div>
                            <div className="text-[9px] text-emerald-400 font-mono">✓ Approved for publish</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {jobs.filter(j => j.status === 'PUBLISHED').map(j => (
                          <div key={j.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-blue-400 font-semibold">{j.targetPageName}</span>
                              <span className="text-emerald-400 font-mono">✓ Published</span>
                            </div>
                            <div className="font-semibold text-white text-xs">{j.metadata.title}</div>
                            <div className="text-[9px] text-sky-400 font-mono">ID: {j.publishResult?.facebookReelId}</div>
                            <div className="text-[9px] text-slate-400 font-mono">Views: {j.publishResult?.viewsCount?.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* Screen 10: Settings and error logs */}
                {/* ------------------------------------------------------------- */}
                {currentScreen === 10 && (
                  <div className="space-y-3">
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs">
                      <div className="font-semibold text-white">ReelFlow Studio v1.0</div>
                      <div className="text-[10px] text-slate-400">
                        • Mock Publishing Service: Generates simulated Reel IDs.<br />
                        • Prepared Interfaces: ServiceInterfaces.kt<br />
                        • Google Veo-2 & Flow adapter hooks ready.
                      </div>
                    </div>

                    <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono">
                      System & Error Logs
                    </div>

                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                      {[
                        { level: 'INFO', tag: 'INIT', msg: 'ReelFlow Studio v1 started in mock simulation mode' },
                        { level: 'INFO', tag: 'PAGES', msg: '100 Facebook Pages bound (Mock Meta Graph API v21.0)' },
                        { level: 'INFO', tag: 'WHATSAPP', msg: 'Review gatekeeper ready with signed token' },
                        { level: 'WARN', tag: 'QUOTA', msg: 'Simulated daily publishing limit at 3 posts/day' },
                      ].map((log, i) => (
                        <div key={i} className="p-2 bg-slate-900 border border-slate-800 rounded text-[10px] space-y-0.5">
                          <div className="flex justify-between font-mono">
                            <span className="text-blue-400 font-bold">{log.tag}</span>
                            <span className={log.level === 'WARN' ? 'text-amber-400' : 'text-slate-500'}>{log.level}</span>
                          </div>
                          <div className="text-slate-300 font-mono">{log.msg}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Bottom Navigation Bar */}
              <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 text-[10px] text-slate-400 shrink-0">
                <button 
                  onClick={() => setCurrentScreen(1)} 
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${currentScreen === 1 ? 'text-blue-400 font-bold' : ''}`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button 
                  onClick={() => setCurrentScreen(2)} 
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${currentScreen === 2 ? 'text-blue-400 font-bold' : ''}`}
                >
                  <Layers className="w-4 h-4" />
                  <span>100 Pages</span>
                </button>
                <button 
                  onClick={() => setCurrentScreen(3)} 
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${currentScreen === 3 ? 'text-blue-400 font-bold' : ''}`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create</span>
                </button>
                <button 
                  onClick={() => setCurrentScreen(7)} 
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${currentScreen === 7 ? 'text-blue-400 font-bold' : ''}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Review</span>
                </button>
                <button 
                  onClick={() => setCurrentScreen(10)} 
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${currentScreen === 10 ? 'text-blue-400 font-bold' : ''}`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Android Gesture Pill */}
              <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
                <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
