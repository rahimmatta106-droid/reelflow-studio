import React from 'react';
import { 
  Layers, 
  MessageSquare, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import type { FacebookPage, VideoJob, BudgetConfig } from '../types';

interface DashboardViewProps {
  pages: FacebookPage[];
  jobs: VideoJob[];
  budget: BudgetConfig;
  onNavigate: (tab: string) => void;
  onOpenPreview: (job: VideoJob) => void;
  onApproveJob: (job: VideoJob) => void;
  onRejectJob: (job: VideoJob) => void;
  onAdvanceJob: (jobId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pages,
  jobs,
  budget,
  onNavigate,
  onOpenPreview,
  onApproveJob,
  onRejectJob,
  onAdvanceJob,
}) => {
  const activePagesCount = pages.filter(p => p.isEnabled).length;
  const waitingApprovalJobs = jobs.filter(j => j.status === 'WAITING_FOR_APPROVAL');
  const generatingJobs = jobs.filter(j => j.status === 'VIDEO_GENERATING' || j.status === 'AI_VIDEO_JOB_QUEUED');
  const scheduledJobs = jobs.filter(j => j.status === 'POST_SCHEDULED');
  const publishedJobs = jobs.filter(j => j.status === 'PUBLISHED');
  const failedJobs = jobs.filter(j => j.status === 'FAILED');

  const totalViews = publishedJobs.reduce((acc, j) => acc + (j.publishResult?.viewsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Emergency Notice Banner if Active */}
      {budget.emergencyStopActive && (
        <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center justify-between text-rose-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-100">Global Emergency Stop is ENGAGED</p>
              <p className="text-xs text-rose-300">All video generation requests and scheduled Facebook publishes are frozen.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('budget')}
            className="px-3 py-1.5 text-xs bg-rose-800 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Manage Safety Controls
          </button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Pages Managed</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{pages.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-400 font-medium">{activePagesCount} active</span> · 2 expiring
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Active Queue</span>
            <RefreshCw className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{generatingJobs.length + waitingApprovalJobs.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span>{generatingJobs.length} rendering</span> · <span>{waitingApprovalJobs.length} review</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Pending WhatsApp</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{waitingApprovalJobs.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Awaiting review button</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Scheduled Posts</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{scheduledJobs.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Ready for Meta Reels upload</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Daily AI Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">${budget.currentDaySpentUsd.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Limit: ${budget.dailyLimitUsd.toFixed(2)}/day</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Published Reels</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{publishedJobs.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-400 font-medium">{(totalViews / 1000).toFixed(1)}k views</span>
          </div>
        </div>
      </div>

      {/* State Machine Pipeline Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Automated Pipeline Lifecycle</h2>
            <p className="text-xs text-slate-400 mt-0.5">Strict asynchronous state machine with cryptographic WhatsApp approval gatekeeper</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">100% Cloud-Authoritative</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Step 1</div>
            <div className="font-semibold text-slate-200 mt-0.5">Veo Prompt Created</div>
            <div className="text-[11px] text-slate-400">9:16 vertical parameters</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Step 2</div>
            <div className="font-semibold text-slate-200 mt-0.5">AI Video Rendering</div>
            <div className="text-[11px] text-slate-400">Google Veo-2 / Flow API</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Step 3</div>
            <div className="font-semibold text-slate-200 mt-0.5">Metadata Synthesis</div>
            <div className="text-[11px] text-slate-400">Gemini 3.8 Flash (Title/Tags)</div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200">
            <div className="text-[10px] text-amber-400 uppercase font-mono">Step 4 (Critical)</div>
            <div className="font-semibold text-amber-100 mt-0.5">WhatsApp Review</div>
            <div className="text-[11px] text-amber-300/80">Interactive buttons & signature</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Step 5</div>
            <div className="font-semibold text-slate-200 mt-0.5">Publish Scheduled</div>
            <div className="text-[11px] text-slate-400">Target Page queue & timezone</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Step 6</div>
            <div className="font-semibold text-slate-200 mt-0.5">Meta Graph Upload</div>
            <div className="text-[11px] text-slate-400">3-phase Reels protocol</div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
            <div className="text-[10px] text-emerald-400 uppercase font-mono">Step 7</div>
            <div className="font-semibold text-emerald-100 mt-0.5">Verified Published</div>
            <div className="text-[11px] text-emerald-300/80">Reels ID & views telemetry</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Pending WhatsApp Approvals vs Active Pages Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: WhatsApp Reviews Requiring Attention (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Pending WhatsApp Approvals ({waitingApprovalJobs.length})</h3>
            </div>
            <button
              onClick={() => onNavigate('queue')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {waitingApprovalJobs.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-200">All reviews are up to date!</p>
              <p className="text-xs text-slate-500 mt-1">No videos currently waiting for WhatsApp approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingApprovalJobs.map(job => (
                <div
                  key={job.id}
                  className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                >
                  <div className="flex gap-3 items-center">
                    <div 
                      onClick={() => onOpenPreview(job)}
                      className="relative w-16 h-24 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shrink-0 cursor-pointer group"
                    >
                      <img 
                        src={job.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'} 
                        alt="Reel preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 text-white px-1 rounded">
                        {job.durationSeconds}s
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-blue-400 font-medium">{job.targetPageName}</span>
                        <span>·</span>
                        <span>{job.niche}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-500">{job.modelUsed}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white line-clamp-1">{job.metadata.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">{job.metadata.caption}</p>
                      <div className="text-xs text-sky-400 font-mono">
                        {job.metadata.hashtags.slice(0, 3).join(' ')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={() => onOpenPreview(job)}
                      className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onRejectJob(job)}
                      className="px-3 py-1.5 text-xs text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onApproveJob(job)}
                      className="px-3 py-1.5 text-xs text-emerald-200 bg-emerald-600 hover:bg-emerald-500 font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      Approve & Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Generation Jobs currently in progress */}
          {generatingJobs.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase font-mono tracking-wider">
                Currently Synthesizing ({generatingJobs.length})
              </h4>
              <div className="space-y-2">
                {generatingJobs.map(job => (
                  <div key={job.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                      <div>
                        <span className="text-white font-medium">{job.targetPageName}: </span>
                        <span className="text-slate-400">{job.prompt.slice(0, 45)}...</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sky-400">{job.progressPercent}%</span>
                      <button
                        onClick={() => onAdvanceJob(job.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 rounded cursor-pointer"
                        title="Simulate step advance"
                      >
                        Advance Step
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 100 Pages Niche Distribution & Token Health */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Pages Niche Breakdown</h3>
            <button
              onClick={() => onNavigate('pages')}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              All 100 Pages
            </button>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            {[
              { niche: 'Tech & AI', count: 10, totalReels: 2840, avgViews: '34k' },
              { niche: 'Fitness & Wellness', count: 10, totalReels: 2410, avgViews: '28k' },
              { niche: 'Travel & Adventure', count: 10, totalReels: 1980, avgViews: '42k' },
              { niche: 'Cuisine & Cooking', count: 10, totalReels: 2150, avgViews: '31k' },
              { niche: 'Finance & Crypto', count: 10, totalReels: 1720, avgViews: '22k' },
              { niche: 'Comedy & Humor', count: 10, totalReels: 3200, avgViews: '58k' },
              { niche: 'Real Estate & Luxury', count: 10, totalReels: 1450, avgViews: '19k' },
              { niche: 'Gaming', count: 10, totalReels: 2600, avgViews: '38k' },
            ].map(item => (
              <div key={item.niche} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                <div>
                  <span className="text-white font-medium">{item.niche}</span>
                  <span className="text-slate-500 ml-2 font-mono">{item.count} pages</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-300 font-mono">{item.totalReels} reels</span>
                  <span className="text-slate-500 ml-2 font-mono">avg {item.avgViews}</span>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={() => onNavigate('pages')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Configure Page Prompts & Limits
              </button>
            </div>
          </div>

          {/* Quick WhatsApp Health Indicator */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>WhatsApp Cloud API Operational</span>
            </div>
            <p className="text-xs text-slate-400">
              Inbound Webhook verified on <span className="font-mono text-slate-300">/api/whatsapp/webhook</span> with HMAC SHA-256 protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
