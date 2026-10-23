import React, { useState } from 'react';
import { 
  Play, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertCircle, 
  Share2, 
  Lock, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import type { VideoJob, JobStatus } from '../types';

interface QueueReviewViewProps {
  jobs: VideoJob[];
  onOpenPreview: (job: VideoJob) => void;
  onApproveJob: (job: VideoJob) => void;
  onRejectJob: (job: VideoJob) => void;
  onRegenerateJob: (job: VideoJob) => void;
  onAdvanceJob: (jobId: string) => void;
  onRetryJob: (jobId: string) => void;
}

export const QueueReviewView: React.FC<QueueReviewViewProps> = ({
  jobs,
  onOpenPreview,
  onApproveJob,
  onRejectJob,
  onRegenerateJob,
  onAdvanceJob,
  onRetryJob,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeJobForWhatsAppSim, setActiveJobForWhatsAppSim] = useState<VideoJob | null>(
    jobs.find(j => j.status === 'WAITING_FOR_APPROVAL') || jobs[0] || null
  );

  const statusTabs = [
    { id: 'all', label: 'All Jobs', count: jobs.length },
    { id: 'WAITING_FOR_APPROVAL', label: 'Waiting WhatsApp', count: jobs.filter(j => j.status === 'WAITING_FOR_APPROVAL').length },
    { id: 'VIDEO_GENERATING', label: 'Rendering', count: jobs.filter(j => j.status === 'VIDEO_GENERATING' || j.status === 'AI_VIDEO_JOB_QUEUED').length },
    { id: 'POST_SCHEDULED', label: 'Scheduled', count: jobs.filter(j => j.status === 'POST_SCHEDULED').length },
    { id: 'PUBLISHED', label: 'Published', count: jobs.filter(j => j.status === 'PUBLISHED').length },
    { id: 'FAILED', label: 'Failed', count: jobs.filter(j => j.status === 'FAILED').length },
  ];

  const filteredJobs = jobs.filter(job => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'VIDEO_GENERATING') {
      return job.status === 'VIDEO_GENERATING' || job.status === 'AI_VIDEO_JOB_QUEUED';
    }
    return job.status === selectedStatus;
  });

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'WAITING_FOR_APPROVAL':
        return <span className="text-amber-400 font-medium">Waiting Review</span>;
      case 'VIDEO_GENERATING':
        return <span className="text-sky-400 font-medium">Generating (Veo-2)</span>;
      case 'POST_SCHEDULED':
        return <span className="text-indigo-400 font-medium">Scheduled</span>;
      case 'PUBLISHED':
        return <span className="text-emerald-400 font-medium">Published to Meta</span>;
      case 'FAILED':
        return <span className="text-rose-400 font-medium">Failed</span>;
      default:
        return <span className="text-slate-400 font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Video Queue & WhatsApp Review Gatekeeper</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict human approval required before Facebook publishing. Inbound WhatsApp button callbacks and signed URLs supported.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors font-medium cursor-pointer ${
              selectedStatus === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label} <span className="ml-1 opacity-70 font-mono">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* 2-Column Layout: Jobs Table/List on Left + Live WhatsApp Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Cards */}
        <div className="lg:col-span-7 space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
              <p className="text-sm font-medium text-slate-300">No jobs found in this view.</p>
              <p className="text-xs text-slate-500 mt-1">Try selecting another status tab or create a new AI Reel.</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div
                key={job.id}
                onClick={() => setActiveJobForWhatsAppSim(job)}
                className={`p-4 bg-slate-900 border rounded-xl transition-all cursor-pointer ${
                  activeJobForWhatsAppSim?.id === job.id
                    ? 'border-blue-500 shadow-md ring-1 ring-blue-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex gap-3.5 items-start">
                  {/* Thumbnail / 9:16 indicator */}
                  <div className="relative w-16 h-24 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                    <img 
                      src={job.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'} 
                      alt="Thumbnail"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white opacity-80" />
                    </div>
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 text-white px-1 rounded">
                      {job.durationSeconds}s
                    </span>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-blue-400 font-semibold">{job.targetPageName}</span>
                        <span>·</span>
                        <span>{job.niche}</span>
                      </div>
                      <div className="text-xs">{getStatusBadge(job.status)}</div>
                    </div>

                    <h4 className="text-xs font-semibold text-white truncate">{job.metadata.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{job.prompt}</p>

                    {/* Progress Bar for generating jobs */}
                    {job.status === 'VIDEO_GENERATING' && (
                      <div className="pt-1">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-sky-500 h-full transition-all duration-300"
                            style={{ width: `${job.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                          <span>Synthesizing 9:16 frames...</span>
                          <span>{job.progressPercent}%</span>
                        </div>
                      </div>
                    )}

                    {/* Error Notice */}
                    {job.status === 'FAILED' && (
                      <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded border border-rose-800/60 mt-1">
                        {job.errorReason}
                      </div>
                    )}

                    {/* Footer info & Quick actions */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                      <span>Est: ${job.cost.estimatedUsd.toFixed(2)} · Retries: {job.retryCount}/{job.maxRetries}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onOpenPreview(job); }}
                          className="text-blue-400 hover:text-blue-300 cursor-pointer font-sans"
                        >
                          Preview & Edit
                        </button>
                        {job.status === 'FAILED' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRetryJob(job.id); }}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer font-sans"
                          >
                            Retry
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); onAdvanceJob(job.id); }}
                            className="text-slate-400 hover:text-white cursor-pointer font-sans"
                            title="Simulate step advance"
                          >
                            Advance Step →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Live WhatsApp Interactive Simulator & Webhook Tester */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Cloud API Simulator</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Official Webhook Tester</span>
            </div>

            {activeJobForWhatsAppSim ? (
              <div className="space-y-4">
                {/* WhatsApp Chat Bubble Mockup */}
                <div className="bg-[#0b141a] rounded-xl p-3.5 border border-[#202c33] shadow-inner space-y-3 font-sans">
                  {/* WhatsApp Message Header */}
                  <div className="flex items-center justify-between text-[11px] text-[#8696a0] border-b border-[#202c33] pb-2">
                    <span className="font-semibold text-white">AutoReels Bot (Official)</span>
                    <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Message Body Bubble */}
                  <div className="bg-[#202c33] text-[#e9edef] rounded-lg p-3 text-xs space-y-2 border-l-4 border-emerald-500">
                    <div className="font-bold text-[#00a884] flex items-center gap-1.5">
                      <span>🎬 NEW REEL FOR REVIEW</span>
                    </div>

                    <div className="text-[11px] text-[#8696a0]">
                      <div>*Target Page:* {activeJobForWhatsAppSim.targetPageName}</div>
                      <div>*Scheduled:* {activeJobForWhatsAppSim.schedule.scheduledFor ? new Date(activeJobForWhatsAppSim.schedule.scheduledFor).toLocaleString() : 'Immediate'}</div>
                    </div>

                    <div className="pt-1">
                      <div className="font-semibold text-white text-xs">{activeJobForWhatsAppSim.metadata.title}</div>
                      <div className="text-[11px] text-[#d1d7db] mt-1 leading-relaxed">
                        {activeJobForWhatsAppSim.metadata.caption}
                      </div>
                      <div className="text-[11px] text-[#53bdeb] font-mono mt-1">
                        {activeJobForWhatsAppSim.metadata.hashtags.join(' ')}
                      </div>
                    </div>

                    {/* Signed Link Preview */}
                    <div className="p-2 bg-[#111b21] rounded text-[10px] text-[#8696a0] flex items-center justify-between">
                      <span className="truncate">🔗 Secure Review Link (Signed Token)</span>
                      <a
                        href={`/api/whatsapp/review-link/${activeJobForWhatsAppSim.id}?token=${activeJobForWhatsAppSim.whatsappReview.signedApprovalToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00a884] font-medium flex items-center gap-1 hover:underline ml-2"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Interactive Reply Buttons (Meta WhatsApp Business spec) */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => onApproveJob(activeJobForWhatsAppSim)}
                      disabled={activeJobForWhatsAppSim.whatsappReview.decision === 'APPROVED'}
                      className="w-full py-2 bg-[#00a884] hover:bg-[#028b6e] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeJobForWhatsAppSim.whatsappReview.decision === 'APPROVED' ? '✓ APPROVED & SCHEDULED' : '✓ APPROVE & SCHEDULE'}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => onRejectJob(activeJobForWhatsAppSim)}
                        disabled={activeJobForWhatsAppSim.whatsappReview.decision === 'REJECTED'}
                        className="py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-rose-400 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>✕ Reject</span>
                      </button>

                      <button
                        onClick={() => onRegenerateJob(activeJobForWhatsAppSim)}
                        className="py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-[#8696a0] hover:text-white font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>↻ Regenerate</span>
                      </button>
                    </div>
                  </div>

                  {/* Current Decision Audit Badge */}
                  {activeJobForWhatsAppSim.whatsappReview.decision && (
                    <div className="p-2 bg-[#111b21] rounded text-[11px] text-center border border-[#202c33]">
                      <span className="text-[#8696a0]">Audit Record: </span>
                      <strong className={activeJobForWhatsAppSim.whatsappReview.decision === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}>
                        {activeJobForWhatsAppSim.whatsappReview.decision}
                      </strong>
                      <span className="text-[#8696a0] font-mono text-[10px] block mt-0.5">
                        {activeJobForWhatsAppSim.whatsappReview.decisionTimestamp ? new Date(activeJobForWhatsAppSim.whatsappReview.decisionTimestamp).toLocaleString() : ''} by {activeJobForWhatsAppSim.whatsappReview.reviewerName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Webhook Payload Debugger */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>Cryptographic Security Audit</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono break-all">
                    HMAC Token: {activeJobForWhatsAppSim.whatsappReview.signedApprovalToken}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Idempotency Key: {activeJobForWhatsAppSim.idempotencyKey}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs">
                Select a job from the list to test the WhatsApp interactive approval simulator.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
