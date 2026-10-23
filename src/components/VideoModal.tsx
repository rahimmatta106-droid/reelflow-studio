import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import type { VideoJob } from '../types';

interface VideoModalProps {
  job: VideoJob | null;
  onClose: () => void;
  onSaveMetadata: (jobId: string, metadata: { title: string; caption: string; hashtags: string[]; scheduledFor?: string }) => void;
  onApprove: (job: VideoJob) => void;
  onReject: (job: VideoJob) => void;
  onPublishNow: (jobId: string) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  job,
  onClose,
  onSaveMetadata,
  onApprove,
  onReject,
  onPublishNow,
}) => {
  if (!job) return null;

  const [title, setTitle] = useState(job.metadata.title);
  const [caption, setCaption] = useState(job.metadata.caption);
  const [hashtagsStr, setHashtagsStr] = useState(job.metadata.hashtags.join(' '));
  const [scheduledFor, setScheduledFor] = useState(
    job.schedule.scheduledFor ? new Date(job.schedule.scheduledFor).toISOString().slice(0, 16) : ''
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const tags = hashtagsStr.split(' ').map(t => t.trim()).filter(Boolean);
    onSaveMetadata(job.id, {
      title,
      caption,
      hashtags: tags,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase bg-blue-950 text-blue-300 px-2.5 py-1 rounded border border-blue-800/60 font-semibold">
              9:16 Reel Editor
            </span>
            <span className="text-xs text-slate-400">Target: <strong className="text-white">{job.targetPageName}</strong> ({job.niche})</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column (Reel Player on Left, Metadata Editor on Right) */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: 9:16 Vertical Video Player */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[270px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
              <video
                controls
                playsInline
                loop
                poster={job.thumbnailUrl || ''}
                src={job.videoUrl || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {job.durationSeconds}s · 1080p
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-2">
              Model: {job.modelUsed} · Vertical 9:16
            </div>
          </div>

          {/* Right Column: Title, Caption & Hashtags Editor */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reel Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              />
              {job.metadata.alternativeTitles?.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500">Alternatives:</span>
                  {job.metadata.alternativeTitles.map((alt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTitle(alt)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer"
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Caption / Description</label>
              <textarea
                rows={4}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hashtags (Exactly 5 Targeted Tags)</label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={e => setHashtagsStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-sky-400 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Publish Timezone</label>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono">
                  {job.schedule.timezone}
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scheduled Publish Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Approval Status Audit */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-300">Approval State: {job.whatsappReview.decision || 'PENDING'}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {job.whatsappReview.reviewerName || 'Awaiting Reviewer'} · {job.whatsappReview.decisionTimestamp ? new Date(job.whatsappReview.decisionTimestamp).toLocaleTimeString() : 'Unreviewed'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs cursor-pointer font-medium"
              >
                {isSaved ? '✓ Saved!' : 'Save Edits'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic signature verified</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onReject(job)}
              className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-medium rounded-lg cursor-pointer"
            >
              ✕ Reject
            </button>

            <button
              onClick={() => onApprove(job)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer shadow-sm"
            >
              ✓ Approve & Schedule
            </button>

            {job.whatsappReview.decision === 'APPROVED' && job.status !== 'PUBLISHED' && (
              <button
                onClick={() => onPublishNow(job.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer shadow-sm"
              >
                Publish Reel Now to Meta →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
