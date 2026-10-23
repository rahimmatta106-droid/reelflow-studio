import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Clock, 
  Send, 
  RefreshCw, 
  Check, 
  Layers, 
  AlertCircle,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  HardDrive,
  DollarSign,
  AlertTriangle,
  Film,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import type { FacebookPage, VideoJob } from '../types';

interface PromptStudioViewProps {
  pages: FacebookPage[];
  onCreateJob: (payload: any) => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const PromptStudioView: React.FC<PromptStudioViewProps> = ({
  pages,
  onCreateJob,
  onNavigate,
}) => {
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id || '');
  const [prompt, setPrompt] = useState<string>(
    'Futuristic quantum computing laboratory with floating holographic neural interfaces, camera gliding forward, cinematic neon cyan and warm amber accent lighting, 8k hyperrealistic vertical reel'
  );
  const [negativePrompt, setNegativePrompt] = useState<string>(
    'blurry, distorted text, low frame rate, ugly hands, watermark, grainy'
  );
  const [durationSeconds, setDurationSeconds] = useState<5 | 10 | 15>(10);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [modelMode, setModelMode] = useState<'real_omni' | 'simulated'>('real_omni');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  
  // Real Video Generation Active Job State
  const [activeRealJob, setActiveRealJob] = useState<VideoJob | null>(null);
  const [isGeneratingReal, setIsGeneratingReal] = useState<boolean>(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const pollIntervalRef = useRef<any>(null);

  // AI Generated Metadata preview state
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState<boolean>(false);
  const [generatedMetadata, setGeneratedMetadata] = useState<{
    title: string;
    caption: string;
    hashtags: string[];
    alternativeTitles: string[];
    tone: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];

  // Preset Prompts by Niche
  const presetPrompts: Record<string, string> = {
    'Tech & AI': 'Futuristic quantum computing laboratory with floating holographic neural interfaces, camera gliding forward, cinematic neon cyan and warm amber accent lighting, 8k hyperrealistic vertical reel',
    'Fitness & Wellness': 'High-intensity athlete performing explosive kettlebell swings in a sunlit minimalist concrete gym, sweat droplets flying in slow-motion, sharp cinematic lighting',
    'Travel & Adventure': 'Cinematic first-person drone swoop descending into a secluded turquoise alpine lake surrounded by snow-capped peaks, cinematic 9:16 vertical video',
    'Cuisine & Cooking': 'Extreme macro slow-motion shot of caramelized garlic and rosemary sizzling in hot olive oil inside a black cast-iron pan, glistening herbs',
    'Finance & Crypto': 'Sleek 3D financial analytics podium with shimmering gold and platinum bar charts, futuristic dark luxury ambient lighting, smooth rotating camera',
    'Comedy & Humor': 'Relatable point-of-view comedic sketch showing a chaotic morning rush trying to pack lunch while pet dog watches with humorous judgment',
    'Real Estate & Luxury': 'Slow gliding architectural walkthrough of an ultra-modern cliffside Malibu villa with floor-to-ceiling glass infinity pool overlooking sunset ocean',
  };

  const handleApplyPreset = (niche: string) => {
    if (presetPrompts[niche]) {
      setPrompt(presetPrompts[niche]);
    }
  };

  // Poll real job status until terminal state
  const pollJobStatus = async (jobId: string) => {
    try {
      const res = await fetch(`/api/video/jobs/${jobId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.job) {
        setActiveRealJob(data.job);
        if (data.job.status === 'FAILED' || data.job.status === 'WAITING_FOR_APPROVAL' || data.job.status === 'VIDEO_READY') {
          setIsGeneratingReal(false);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    } catch (err: any) {
      console.warn('Job poll error:', err?.message);
    }
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Call Server-Side Gemini 3.8 Flash to preview Title, Caption & Hashtags
  const handleGenerateMetadata = async () => {
    if (!prompt) return;
    setIsGeneratingMetadata(true);
    try {
      const res = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          niche: selectedPage?.niche || 'Tech & AI',
          targetAudience: 'USA & Global English',
          tone: 'Engaging & Authentic',
        }),
      });
      const data = await res.json();
      if (data.metadata) {
        setGeneratedMetadata(data.metadata);
      }
    } catch (err) {
      console.error('Failed to generate metadata:', err);
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  // Submit Real Video Generation via Google Interactions API
  const handleGenerateRealVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGeneratingReal) return;

    setIsGeneratingReal(true);
    setPollingError(null);
    setActiveRealJob(null);

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim(),
          targetPageId: selectedPage?.id,
          durationSeconds: durationSeconds <= 5 ? 5 : 10,
          aspectRatio,
          resolution,
          autoPublishOnApproval: true,
          title: generatedMetadata?.title,
          caption: generatedMetadata?.caption,
          hashtags: generatedMetadata?.hashtags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit real video generation job');
      }

      if (data.job) {
        setActiveRealJob(data.job);
        // Start polling
        const jobId = data.job.id;
        pollIntervalRef.current = setInterval(() => {
          pollJobStatus(jobId);
        }, 2500);
      }
    } catch (err: any) {
      setIsGeneratingReal(false);
      setPollingError(err?.message || 'Failed to submit generation job');
    }
  };

  // Submit Simulated Job (Mock Service)
  const handleSimulatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateJob({
        prompt,
        negativePrompt,
        targetPageId: selectedPage?.id,
        durationSeconds,
        resolution,
        aspectRatio,
        modelUsed: 'Google Veo-2 (Simulated)',
        scheduleTime: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
        autoPublishOnApproval: true,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onNavigate('queue');
      }, 1200);
    } catch (err) {
      console.error('Failed to create job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve Real Video Result
  const handleApproveRealJob = async (job: VideoJob) => {
    try {
      const res = await fetch('/api/whatsapp/review-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          token: job.whatsappReview.signedApprovalToken,
          decision: 'APPROVED',
          reviewerName: 'Prompt Studio Direct Review',
          reason: 'Approved after inspecting real video generation render',
        }),
      });
      if (res.ok) {
        await pollJobStatus(job.id);
        alert('✓ Video approved! Scheduled for Facebook publishing queue.');
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleRejectRealJob = async (job: VideoJob) => {
    try {
      const res = await fetch('/api/whatsapp/review-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          token: job.whatsappReview.signedApprovalToken,
          decision: 'REJECTED',
          reviewerName: 'Prompt Studio Direct Review',
          reason: 'Rejected visual quality or prompt coherence',
        }),
      });
      if (res.ok) {
        await pollJobStatus(job.id);
      }
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  const estimatedCost = (durationSeconds <= 5 ? 5 : 10) * 0.03;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">AI Video Generation Studio</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit text prompts to Google's official video generation engine, save MP4s to private cloud storage, and review before publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-emerald-400">Google Omni Flash Ready</span>
        </div>
      </div>

      {/* Mode Switcher Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-white">Execution Mode</div>
          <div className="text-[11px] text-slate-400">
            {modelMode === 'real_omni' 
              ? 'Real Google Video API: calls gemini-omni-1.1-flash server-side, saves MP4 to private storage, reports actual results.'
              : 'Local Simulation Mode: demonstrates state machine without invoking external paid video APIs.'}
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setModelMode('real_omni')}
            className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
              modelMode === 'real_omni'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Real Video API (Veo / Omni)
          </button>
          <button
            type="button"
            onClick={() => setModelMode('simulated')}
            className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
              modelMode === 'simulated'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧪 Simulation Mode
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={modelMode === 'real_omni' ? handleGenerateRealVideo : handleSimulatedSubmit} className="space-y-6">
        {/* Step 1: Target Page Selection */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Target Facebook Page ({pages.length} Connected)</span>
            </label>
            <span className="text-xs text-slate-500 font-mono">Page ID: {selectedPage?.pageId}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                value={selectedPageId}
                onChange={e => {
                  setSelectedPageId(e.target.value);
                  const p = pages.find(page => page.id === e.target.value);
                  if (p && presetPrompts[p.niche]) {
                    setPrompt(presetPrompts[p.niche]);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {pages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.name} ({page.niche}) · {(page.followers / 1000).toFixed(0)}k Followers
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/60 rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Niche: <strong className="text-white">{selectedPage?.niche}</strong></span>
                <span>Daily Limit: <strong className="text-white">{selectedPage?.dailyLimit} Reels</strong></span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Prompt Guideline: {selectedPage?.customPromptRules}
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-slate-400">Apply Niche Prompt Recipe:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.keys(presetPrompts).map(niche => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => handleApplyPreset(niche)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Prompt Engineering & Model Parameters */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-sky-400" />
              <span>Video Scene Prompt</span>
            </label>
            <span className="text-xs text-blue-400 font-mono">
              Model: {modelMode === 'real_omni' ? 'gemini-omni-1.1-flash' : 'Google Veo-2 (Simulated)'}
            </span>
          </div>

          <textarea
            rows={4}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe visual camera motion, lighting, subject, and scene details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Negative Prompt (Elements to exclude)</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={e => setNegativePrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['9:16', '16:9'] as const).map(ar => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={`py-2 text-xs font-mono font-medium rounded cursor-pointer transition-colors ${
                      aspectRatio === ar
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {ar} {ar === '9:16' ? '(Reels)' : '(Wide)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Duration</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[5, 10].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationSeconds(d as any)}
                    className={`py-2 text-xs font-mono font-medium rounded cursor-pointer transition-colors ${
                      durationSeconds === d
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {d} seconds
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Resolution</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['720p', '1080p'] as const).map(res => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`py-2 text-xs font-mono font-medium rounded cursor-pointer transition-colors ${
                      resolution === res
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: AI Title, Caption & Hashtags Generator */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Title, Caption & 5 Hashtags Generator (Gemini 3.8 Flash)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates 1 compelling English hook, engaging caption, and strictly 5 relevant niche hashtags.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateMetadata}
              disabled={isGeneratingMetadata}
              className="px-3.5 py-1.5 bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMetadata ? 'animate-spin' : ''}`} />
              <span>{isGeneratingMetadata ? 'Generating...' : 'Generate with Gemini'}</span>
            </button>
          </div>

          {generatedMetadata && (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Proposed Title:</label>
                <div className="text-white font-semibold text-sm mt-0.5">{generatedMetadata.title}</div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Proposed Caption:</label>
                <div className="text-slate-300 mt-0.5 leading-relaxed">{generatedMetadata.caption}</div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">5 Targeted Hashtags:</label>
                <div className="text-sky-400 font-mono mt-0.5">{generatedMetadata.hashtags.join(' ')}</div>
              </div>
            </div>
          )}
        </div>

        {/* Cost & Submission Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estimated Cost: <strong className="text-white font-mono">${estimatedCost.toFixed(2)} USD</strong> ($0.03/sec)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {modelMode === 'real_omni' 
                ? 'Job will be submitted securely through the cloud backend with zero API keys on the client.' 
                : 'Simulated workflow queued for queue view test.'}
            </div>
          </div>

          <button
            type="submit"
            disabled={isGeneratingReal || isSubmitting || submitSuccess}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
              submitSuccess
                ? 'bg-emerald-600 text-white'
                : isGeneratingReal
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isGeneratingReal ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Video in Cloud...</span>
              </>
            ) : submitSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Job Queued Successfully!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{modelMode === 'real_omni' ? '⚡ Generate Real AI Reel' : 'Submit Simulated Job'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Real Video Generation Live Pipeline Monitor */}
      {pollingError && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Submission Error</span>
          </div>
          <p className="text-rose-200">{pollingError}</p>
        </div>
      )}

      {activeRealJob && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Real Video Pipeline Job: {activeRealJob.id}</h3>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
              activeRealJob.status === 'WAITING_FOR_APPROVAL' || activeRealJob.status === 'VIDEO_READY'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : activeRealJob.status === 'VIDEO_GENERATING'
                ? 'bg-blue-950 text-blue-300 border border-blue-800 animate-pulse'
                : activeRealJob.status === 'FAILED'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {activeRealJob.status}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Cloud Rendering Progress</span>
              <span className="font-mono">{activeRealJob.progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-500 ${
                  activeRealJob.status === 'FAILED' 
                    ? 'bg-rose-500' 
                    : activeRealJob.status === 'WAITING_FOR_APPROVAL' || activeRealJob.status === 'VIDEO_READY'
                    ? 'bg-emerald-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${activeRealJob.progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* If Status is FAILED: Explicit anti-hallucination error display */}
          {activeRealJob.status === 'FAILED' && (
            <div className="p-4 bg-rose-950/70 border border-rose-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>External Google Video API Error (Direct Output)</span>
              </div>
              <p className="text-rose-200 leading-relaxed font-mono text-[11px] bg-black/40 p-3 rounded-lg border border-rose-900/50">
                {activeRealJob.errorReason || 'The external Google video generation API returned an error response.'}
              </p>
              <div className="text-[11px] text-slate-300">
                <strong>Anti-Hallucination Policy:</strong> ReelFlow Studio strictly reports the actual external API response instead of generating fake video output when Google's API returns an error or quota limit.
              </div>
            </div>
          )}

          {/* If Status is WAITING_FOR_APPROVAL: Video player & private storage preview */}
          {(activeRealJob.status === 'WAITING_FOR_APPROVAL' || activeRealJob.status === 'VIDEO_READY') && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* 9:16 Video Player */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="w-[220px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative">
                    <video
                      controls
                      autoPlay
                      muted
                      playsInline
                      src={activeRealJob.videoUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Video Details & Storage Record */}
                <div className="md:col-span-7 space-y-3 text-xs">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <HardDrive className="w-4 h-4" />
                      <span>Saved to Private Cloud Storage</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 break-all bg-black/50 p-2 rounded">
                      /storage/videos/{activeRealJob.id}.mp4
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Served via authenticated HTTP 206 streaming route: <span className="font-mono text-sky-400">{activeRealJob.videoUrl}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
                    <div className="text-slate-400">Proposed Title:</div>
                    <div className="font-semibold text-white text-sm">{activeRealJob.metadata.title}</div>
                    <div className="text-slate-400 mt-1">Proposed Caption:</div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">{activeRealJob.metadata.caption}</div>
                    <div className="text-sky-400 font-mono text-[11px] mt-1">{activeRealJob.metadata.hashtags.join(' ')}</div>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-slate-400">Actual Generation Cost</div>
                      <div className="text-emerald-400 font-mono font-bold text-sm">
                        ${activeRealJob.cost.actualUsd.toFixed(2)} USD
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <div>Target: <strong className="text-white">{activeRealJob.targetPageName}</strong></div>
                      <div>Format: <strong className="text-white">{activeRealJob.aspectRatio} · {activeRealJob.durationSeconds}s</strong></div>
                    </div>
                  </div>

                  {/* Explicit Approval Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleApproveRealJob(activeRealJob)}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve for Facebook</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRejectRealJob(activeRealJob)}
                      className="py-2.5 px-4 bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-300 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Video</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
