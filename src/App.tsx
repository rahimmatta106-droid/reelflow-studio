/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PageManagerView } from './components/PageManagerView';
import { PromptStudioView } from './components/PromptStudioView';
import { QueueReviewView } from './components/QueueReviewView';
import { CalendarScheduleView } from './components/CalendarScheduleView';
import { BudgetSettingsView } from './components/BudgetSettingsView';
import { AndroidEmulatorView } from './components/AndroidEmulatorView';
import { CodeDocsView } from './components/CodeDocsView';
import { VideoModal } from './components/VideoModal';

import type { FacebookPage, VideoJob, BudgetConfig, AuditLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('emulator');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [budget, setBudget] = useState<BudgetConfig>({
    dailyLimitUsd: 25.00,
    monthlyLimitUsd: 500.00,
    currentDaySpentUsd: 6.40,
    currentMonthSpentUsd: 142.80,
    concurrentJobsLimit: 5,
    emergencyStopActive: false,
    lowCostDevMode: false,
    galleryFallbackActive: false,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedPreviewJob, setSelectedPreviewJob] = useState<VideoJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial Data Fetch from Express Backend
  const fetchData = async () => {
    try {
      const [statusRes, pagesRes, jobsRes, logsRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/pages?limit=100'),
        fetch('/api/jobs'),
        fetch('/api/audit-logs'),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.budget) setBudget(sData.budget);
      }
      if (pagesRes.ok) {
        const pData = await pagesRes.json();
        if (pData.pages) setPages(pData.pages);
      }
      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        if (jData.jobs) setJobs(jData.jobs);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        if (lData.logs) setAuditLogs(lData.logs);
      }
    } catch (err) {
      console.warn('Backend fetch failed or running in preview sandbox, using client store:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateJob = async (payload: any) => {
    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error creating job:', err);
    }
  };

  const handleUpdatePage = async (updatedPage: Partial<FacebookPage> & { id: string }) => {
    try {
      const res = await fetch('/api/pages/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPage),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error updating page:', err);
    }
  };

  const handleBulkToggle = async (pageIds: string[], enable: boolean) => {
    try {
      const res = await fetch('/api/pages/bulk-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIds, enable }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error bulk toggling pages:', err);
    }
  };

  const handleWhatsAppAction = async (job: VideoJob, decision: 'APPROVED' | 'REJECTED' | 'REGENERATE') => {
    try {
      const res = await fetch('/api/whatsapp/review-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          token: job.whatsappReview.signedApprovalToken,
          decision,
          reviewerName: 'Admin Web Console',
        }),
      });
      if (res.ok) {
        await fetchData();
        if (selectedPreviewJob?.id === job.id) {
          setSelectedPreviewJob(null);
        }
      }
    } catch (err) {
      console.error('Error recording WhatsApp action:', err);
    }
  };

  const handleAdvanceJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/simulate-step`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error advancing job:', err);
    }
  };

  const handlePublishNow = async (jobId: string) => {
    try {
      const res = await fetch('/api/facebook/publish-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to publish Reel to Meta');
      } else {
        await fetchData();
        if (selectedPreviewJob?.id === jobId) {
          setSelectedPreviewJob(null);
        }
      }
    } catch (err) {
      console.error('Error publishing reel:', err);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error retrying job:', err);
    }
  };

  const handleToggleEmergencyStop = async () => {
    try {
      const nextState = !budget.emergencyStopActive;
      const res = await fetch('/api/system/emergency-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: nextState }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error toggling emergency stop:', err);
    }
  };

  const handleUpdateBudget = async (newBudget: Partial<BudgetConfig>) => {
    try {
      const res = await fetch('/api/system/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudget),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error updating budget:', err);
    }
  };

  const handleSaveMetadata = async (jobId: string, metadata: any) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/update-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error updating metadata:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar complying with 3-zone contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        emergencyStop={budget.emergencyStopActive}
        onToggleEmergencyStop={handleToggleEmergencyStop}
        onOpenNewJob={() => setActiveTab('studio')}
      />

      {/* Main Body Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            pages={pages}
            jobs={jobs}
            budget={budget}
            onNavigate={setActiveTab}
            onOpenPreview={setSelectedPreviewJob}
            onApproveJob={job => handleWhatsAppAction(job, 'APPROVED')}
            onRejectJob={job => handleWhatsAppAction(job, 'REJECTED')}
            onAdvanceJob={handleAdvanceJob}
          />
        )}

        {activeTab === 'pages' && (
          <PageManagerView
            pages={pages}
            onUpdatePage={handleUpdatePage}
            onBulkToggle={handleBulkToggle}
          />
        )}

        {activeTab === 'studio' && (
          <PromptStudioView
            pages={pages}
            onCreateJob={handleCreateJob}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'queue' && (
          <QueueReviewView
            jobs={jobs}
            onOpenPreview={setSelectedPreviewJob}
            onApproveJob={job => handleWhatsAppAction(job, 'APPROVED')}
            onRejectJob={job => handleWhatsAppAction(job, 'REJECTED')}
            onRegenerateJob={job => handleWhatsAppAction(job, 'REGENERATE')}
            onAdvanceJob={handleAdvanceJob}
            onRetryJob={handleRetryJob}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarScheduleView
            jobs={jobs}
            onOpenPreview={setSelectedPreviewJob}
            onPublishNow={handlePublishNow}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetSettingsView
            budget={budget}
            auditLogs={auditLogs}
            onUpdateBudget={handleUpdateBudget}
            onToggleEmergencyStop={handleToggleEmergencyStop}
          />
        )}

        {activeTab === 'emulator' && (
          <AndroidEmulatorView
            pages={pages}
            jobs={jobs}
            budget={budget}
            onOpenPreview={setSelectedPreviewJob}
            onApproveJob={job => handleWhatsAppAction(job, 'APPROVED')}
            onRejectJob={job => handleWhatsAppAction(job, 'REJECTED')}
          />
        )}

        {activeTab === 'docs' && <CodeDocsView />}
      </main>

      {/* Video Modal / Metadata Editor */}
      <VideoModal
        job={selectedPreviewJob}
        onClose={() => setSelectedPreviewJob(null)}
        onSaveMetadata={handleSaveMetadata}
        onApprove={job => handleWhatsAppAction(job, 'APPROVED')}
        onReject={job => handleWhatsAppAction(job, 'REJECTED')}
        onPublishNow={handlePublishNow}
      />
    </div>
  );
}
