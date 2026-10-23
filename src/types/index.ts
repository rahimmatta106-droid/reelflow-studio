export type JobStatus = 
  | 'PROMPT_CREATED'
  | 'AI_VIDEO_JOB_QUEUED'
  | 'VIDEO_GENERATING'
  | 'VIDEO_READY'
  | 'METADATA_GENERATING'
  | 'METADATA_READY'
  | 'WHATSAPP_REVIEW_SENT'
  | 'WAITING_FOR_APPROVAL'
  | 'REJECTED'
  | 'REGENERATION_QUEUED'
  | 'POST_SCHEDULED'
  | 'FACEBOOK_UPLOAD_STARTED'
  | 'PUBLISHED'
  | 'FAILED';

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  niche: 'Tech & AI' | 'Fitness & Wellness' | 'Travel & Adventure' | 'Cuisine & Cooking' | 'Finance & Crypto' | 'Comedy & Humor' | 'Real Estate & Luxury' | 'Automotive' | 'Gaming' | 'Life Hacks';
  pageId: string;
  followers: number;
  isEnabled: boolean;
  tokenStatus: 'active' | 'expiring_soon' | 'expired';
  tokenExpiresAt: string;
  timezone: string;
  postingFrequencyHours: number;
  dailyLimit: number;
  postsPublishedToday: number;
  customPromptRules: string;
  defaultHashtags: string[];
  reelsPublishedTotal: number;
  avgViews: number;
}

export interface VideoJob {
  id: string;
  idempotencyKey: string;
  targetPageId: string;
  targetPageName: string;
  niche: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  durationSeconds: 5 | 8 | 10 | 15 | 30;
  resolution: '720p' | '1080p';
  modelUsed: 'Google Veo-2' | 'Google Flow / Imagen Video' | 'Gemini Omni Flash 1.1' | 'Google Veo (gemini-omni-1.1-flash)';
  videoUrl?: string;
  thumbnailUrl?: string;
  videoBlobType?: string;
  status: JobStatus;
  progressPercent: number;
  errorReason?: string;
  retryCount: number;
  maxRetries: number;
  
  // Generated Metadata
  metadata: {
    title: string;
    caption: string;
    hashtags: string[];
    alternativeTitles: string[];
    tone: string;
  };

  // WhatsApp Review Info
  whatsappReview: {
    messageId?: string;
    recipientPhone: string;
    sentAt?: string;
    status: 'pending' | 'pending_credentials' | 'delivered' | 'read' | 'approved' | 'rejected' | 'regenerated' | 'failed';
    decision?: 'APPROVED' | 'REJECTED' | 'REGENERATE';
    decisionTimestamp?: string;
    decisionReason?: string;
    reviewerName?: string;
    signedApprovalToken: string;
    signedPreviewUrl: string;
    expiresAt: string;
  };

  // Scheduling & Facebook Publish
  schedule: {
    scheduledFor?: string;
    timezone: string;
    autoPublishOnApproval: boolean;
  };

  publishResult?: {
    facebookReelId?: string;
    facebookPostUrl?: string;
    publishedAt?: string;
    viewsCount?: number;
    reachCount?: number;
  };

  cost: {
    estimatedUsd: number;
    actualUsd: number;
  };

  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  targetType: 'job' | 'page' | 'whatsapp' | 'security' | 'system';
  targetId?: string;
}

export interface BudgetConfig {
  dailyLimitUsd: number;
  monthlyLimitUsd: number;
  currentDaySpentUsd: number;
  currentMonthSpentUsd: number;
  concurrentJobsLimit: number;
  emergencyStopActive: boolean;
  lowCostDevMode: boolean;
  galleryFallbackActive: boolean;
}

export interface WhatsAppIncomingWebhookPayload {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: 'interactive' | 'text' | 'button';
          interactive?: {
            type: 'button_reply';
            button_reply: {
              id: string; // e.g. "APPROVE_<jobId>_<token>"
              title: string;
            };
          };
          text?: {
            body: string;
          };
        }>;
      };
      field: 'messages';
    }>;
  }>;
}
