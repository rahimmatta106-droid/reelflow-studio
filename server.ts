import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type { FacebookPage, VideoJob, AuditLog, BudgetConfig } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Private Video Storage Directory
const STORAGE_DIR = path.resolve(__dirname, 'storage', 'videos');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed 100 Facebook Pages
const NICHES = [
  'Tech & AI',
  'Fitness & Wellness',
  'Travel & Adventure',
  'Cuisine & Cooking',
  'Finance & Crypto',
  'Comedy & Humor',
  'Real Estate & Luxury',
  'Automotive',
  'Gaming',
  'Life Hacks',
] as const;

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const INITIAL_PAGES: FacebookPage[] = Array.from({ length: 100 }, (_, i) => {
  const niche = NICHES[i % NICHES.length];
  const pageNumber = i + 1;
  const followers = Math.floor(12000 + Math.random() * 850000);
  const tokenExpiresInDays = Math.floor(10 + Math.random() * 80);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + tokenExpiresInDays);

  const defaultHashtagsMap: Record<string, string[]> = {
    'Tech & AI': ['#TechNews', '#AIRevolution', '#FutureTech', '#CodingLife', '#SmartTech'],
    'Fitness & Wellness': ['#FitnessGoals', '#WorkoutRoutine', '#HealthyLiving', '#GymMotivation', '#WellnessJourney'],
    'Travel & Adventure': ['#TravelVibes', '#Wanderlust', '#ExploreTheWorld', '#TravelReels', '#BucketListAdventures'],
    'Cuisine & Cooking': ['#QuickRecipes', '#FoodieHeaven', '#HomeChef', '#DeliciousEats', '#EasyCooking'],
    'Finance & Crypto': ['#FinancialFreedom', '#InvestingTips', '#CryptoInsights', '#SmartMoney', '#WealthBuilding'],
    'Comedy & Humor': ['#RelatableHumor', '#FunnyReels', '#DailyLaughs', '#ComedyShorts', '#ViralHumor'],
    'Real Estate & Luxury': ['#LuxuryHomes', '#DreamHouse', '#RealEstateTips', '#ModernArchitecture', '#MansionTour'],
    'Automotive': ['#SupercarsDaily', '#CarEnthusiast', '#DriveLifestyle', '#AutoTrends', '#VehicleReview'],
    'Gaming': ['#GamingMoments', '#ProGamer', '#GameClips', '#NextGenGaming', '#GamerCommunity'],
    'Life Hacks': ['#ProductivityHacks', '#LifeTips', '#SmartHacks', '#TimeSaver', '#EverydayHacks'],
  };

  return {
    id: `fb_page_${pageNumber}`,
    name: `${niche.split(' ')[0]} Pulse ${pageNumber <= 9 ? `0${pageNumber}` : pageNumber}`,
    category: `${niche} Creator & Media`,
    niche: niche,
    pageId: `109${Math.floor(100000000 + Math.random() * 900000000)}`,
    followers,
    isEnabled: pageNumber <= 88, // 88 enabled by default
    tokenStatus: tokenExpiresInDays < 15 ? 'expiring_soon' : 'active',
    tokenExpiresAt: expiryDate.toISOString(),
    timezone: TIMEZONES[i % TIMEZONES.length],
    postingFrequencyHours: [4, 6, 8, 12][i % 4],
    dailyLimit: 3,
    postsPublishedToday: Math.floor(Math.random() * 3),
    customPromptRules: `Create energetic, hook-first Reels for ${niche}. Focus on visually dynamic opening 2 seconds with clean motion and crisp contrast.`,
    defaultHashtags: defaultHashtagsMap[niche] || ['#ReelsViral', '#TrendingNow', '#WatchTillEnd', '#DailyContent', '#ExplorePage'],
    reelsPublishedTotal: Math.floor(25 + Math.random() * 450),
    avgViews: Math.floor(8500 + Math.random() * 62000),
  };
});

let pagesStore: FacebookPage[] = [...INITIAL_PAGES];

let budgetStore: BudgetConfig = {
  dailyLimitUsd: 25.00,
  monthlyLimitUsd: 500.00,
  currentDaySpentUsd: 6.40,
  currentMonthSpentUsd: 142.80,
  concurrentJobsLimit: 5,
  emergencyStopActive: false,
  lowCostDevMode: false,
  galleryFallbackActive: false,
};

let auditLogsStore: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'OAUTH_TOKEN_VERIFIED',
    actor: 'Meta Graph API System',
    details: 'Validated page tokens for 100 connected pages. 98 healthy, 2 expiring within 14 days.',
    severity: 'info',
    targetType: 'page',
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    action: 'WHATSAPP_WEBHOOK_REGISTERED',
    actor: 'WhatsApp Cloud API',
    details: 'Webhook challenge verified successfully with HMAC-SHA256 signature.',
    severity: 'info',
    targetType: 'whatsapp',
  },
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'AI_VIDEO_GENERATED',
    actor: 'Google Veo-2 Adapter',
    details: 'Successfully synthesized 15s 1080x1920 vertical Reel. Render latency: 14.2s.',
    severity: 'info',
    targetType: 'job',
    targetId: 'job_sample_1',
  },
  {
    id: 'log_4',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    action: 'FACEBOOK_REEL_PUBLISHED',
    actor: 'Meta Publisher Worker',
    details: 'Published Reel #49102 to Page "Tech Pulse 01" (ID: 109849201). Graph API Status: 200 OK.',
    severity: 'info',
    targetType: 'job',
    targetId: 'job_sample_2',
  },
];

// Seed realistic Video Jobs
let videoJobsStore: VideoJob[] = [
  {
    id: 'job_sample_1',
    idempotencyKey: 'idem_948192a_01',
    targetPageId: 'fb_page_1',
    targetPageName: 'Tech Pulse 01',
    niche: 'Tech & AI',
    prompt: 'Futuristic quantum computing laboratory with floating holographic neural interfaces, camera gliding forward, cinematic neon cyan and warm amber accent lighting, 8k hyperrealistic vertical reel',
    negativePrompt: 'blurry, distorted text, low frame rate, ugly hands, watermark',
    aspectRatio: '9:16',
    durationSeconds: 15,
    resolution: '1080p',
    modelUsed: 'Google Veo-2',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    status: 'WAITING_FOR_APPROVAL',
    progressPercent: 100,
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      title: 'Quantum AI Just Shattered Computing Limits!',
      caption: 'Witness the breakthrough moment researchers unlocked the first real-time holographic quantum processor. The next decade of AI starts today. Would you trust a quantum AI assistant?',
      hashtags: ['#QuantumAI', '#FutureTech', '#ArtificialIntelligence', '#TechNews', '#DeepTech'],
      alternativeTitles: [
        'Inside The First Holographic Quantum Lab',
        'Is This The Future Of Supercomputers?',
      ],
      tone: 'Excited & Authoritative',
    },
    whatsappReview: {
      messageId: 'wamid_HBgLMTA5MzI5',
      recipientPhone: '+1 (555) 902-1849',
      sentAt: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'pending',
      signedApprovalToken: 'sig_tok_9a8f7b1e2c4d5',
      signedPreviewUrl: '/api/whatsapp/review-link/job_sample_1?token=sig_tok_9a8f7b1e2c4d5',
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    },
    schedule: {
      scheduledFor: new Date(Date.now() + 4 * 3600000).toISOString(),
      timezone: 'America/New_York',
      autoPublishOnApproval: true,
    },
    cost: {
      estimatedUsd: 0.35,
      actualUsd: 0.32,
    },
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'job_sample_2',
    idempotencyKey: 'idem_819283b_02',
    targetPageId: 'fb_page_2',
    targetPageName: 'Fitness Pulse 02',
    niche: 'Fitness & Wellness',
    prompt: 'Athlete performing high-intensity kettlebell snatch in a modern sunlit minimalist gym, ultra-crisp slow-motion muscle definition, cinematic lighting',
    aspectRatio: '9:16',
    durationSeconds: 10,
    resolution: '1080p',
    modelUsed: 'Google Veo-2',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    status: 'PUBLISHED',
    progressPercent: 100,
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      title: '3 Kettlebell Moves That Melt Core Fat in 10 Mins',
      caption: 'Stop doing endless crunches! Add this explosive compound sequence to your next session for maximum core activation and strength. Save this for your morning workout.',
      hashtags: ['#CoreWorkout', '#KettlebellTraining', '#FitnessMotivation', '#DailyWorkout', '#StrengthTraining'],
      alternativeTitles: ['Explosive Kettlebell Core Routine', 'Build An Unbreakable Core'],
      tone: 'Energetic & Inspiring',
    },
    whatsappReview: {
      messageId: 'wamid_HBgLMTA4MjE1',
      recipientPhone: '+1 (555) 902-1849',
      sentAt: new Date(Date.now() - 120 * 60000).toISOString(),
      status: 'approved',
      decision: 'APPROVED',
      decisionTimestamp: new Date(Date.now() - 105 * 60000).toISOString(),
      reviewerName: 'Lead Content Admin',
      signedApprovalToken: 'sig_tok_8b1a9c3e',
      signedPreviewUrl: '/api/whatsapp/review-link/job_sample_2?token=sig_tok_8b1a9c3e',
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    },
    schedule: {
      scheduledFor: new Date(Date.now() - 60 * 60000).toISOString(),
      timezone: 'America/Chicago',
      autoPublishOnApproval: true,
    },
    publishResult: {
      facebookReelId: 'reel_fb_891048291048',
      facebookPostUrl: 'https://facebook.com/reel/891048291048',
      publishedAt: new Date(Date.now() - 58 * 60000).toISOString(),
      viewsCount: 14200,
      reachCount: 19800,
    },
    cost: {
      estimatedUsd: 0.28,
      actualUsd: 0.25,
    },
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 58 * 60000).toISOString(),
  },
  {
    id: 'job_sample_3',
    idempotencyKey: 'idem_738192c_03',
    targetPageId: 'fb_page_3',
    targetPageName: 'Travel Pulse 03',
    niche: 'Travel & Adventure',
    prompt: 'Drone shot descending over misty emerald alpine lake with a small wooden kayak in the middle, reflection of jagged snow-capped peaks in water, 9:16 vertical ratio',
    aspectRatio: '9:16',
    durationSeconds: 15,
    resolution: '1080p',
    modelUsed: 'Google Flow / Imagen Video',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    status: 'POST_SCHEDULED',
    progressPercent: 100,
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      title: 'Hidden Alpine Secret Most Tourists Miss!',
      caption: 'Tucked deep in the Dolomites, this secluded mirror lake looks straight out of a fantasy novel. Who is the first person you would take here? Tag them below!',
      hashtags: ['#TravelReels', '#HiddenGems', '#AlpineLake', '#Wanderlust', '#ExploreMore'],
      alternativeTitles: ['The Most Peaceful Lake in Europe', 'Dolomites Hidden Paradise'],
      tone: 'Inspiring & Dreamy',
    },
    whatsappReview: {
      messageId: 'wamid_HBgLMTA4MjE2',
      recipientPhone: '+1 (555) 902-1849',
      sentAt: new Date(Date.now() - 45 * 60000).toISOString(),
      status: 'approved',
      decision: 'APPROVED',
      decisionTimestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      reviewerName: 'Lead Content Admin',
      signedApprovalToken: 'sig_tok_7c2d9e4a',
      signedPreviewUrl: '/api/whatsapp/review-link/job_sample_3?token=sig_tok_7c2d9e4a',
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    },
    schedule: {
      scheduledFor: new Date(Date.now() + 2 * 3600000).toISOString(),
      timezone: 'America/Los_Angeles',
      autoPublishOnApproval: true,
    },
    cost: {
      estimatedUsd: 0.35,
      actualUsd: 0.31,
    },
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'job_sample_4',
    idempotencyKey: 'idem_482910d_04',
    targetPageId: 'fb_page_4',
    targetPageName: 'Cuisine Pulse 04',
    niche: 'Cuisine & Cooking',
    prompt: 'Extreme close up of sizzling garlic butter shrimp in cast iron skillet, golden bubbles, parsley sprinkling falling in slow motion',
    aspectRatio: '9:16',
    durationSeconds: 8,
    resolution: '1080p',
    modelUsed: 'Google Veo-2',
    status: 'VIDEO_GENERATING',
    progressPercent: 68,
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      title: '10-Minute Garlic Butter Shrimp That Slaps!',
      caption: 'The crispiest, juiciest skillet shrimp you will ever make. Restaurant quality at home in under 10 minutes flat.',
      hashtags: ['#QuickRecipes', '#ShrimpLovers', '#DinnerHacks', '#FoodieReels', '#EasyMeals'],
      alternativeTitles: ['Restaurant Quality Garlic Shrimp In 10 Mins'],
      tone: 'Punchy & Mouthwatering',
    },
    whatsappReview: {
      recipientPhone: '+1 (555) 902-1849',
      status: 'pending',
      signedApprovalToken: 'sig_tok_4d3e2f1a',
      signedPreviewUrl: '/api/whatsapp/review-link/job_sample_4?token=sig_tok_4d3e2f1a',
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    },
    schedule: {
      timezone: 'America/New_York',
      autoPublishOnApproval: true,
    },
    cost: {
      estimatedUsd: 0.22,
      actualUsd: 0.00,
    },
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'job_sample_5',
    idempotencyKey: 'idem_910283e_05',
    targetPageId: 'fb_page_5',
    targetPageName: 'Finance Pulse 05',
    niche: 'Finance & Crypto',
    prompt: 'Modern cinematic 3D graph showing gold and crypto asset allocation, elegant dark obsidian podium, clean golden lighting reflections',
    aspectRatio: '9:16',
    durationSeconds: 10,
    resolution: '1080p',
    modelUsed: 'Google Veo-2',
    status: 'FAILED',
    progressPercent: 42,
    errorReason: 'Meta Graph API Rate Limit: Temporary publish quota reached for page token. Automatic backoff retry scheduled.',
    retryCount: 1,
    maxRetries: 3,
    metadata: {
      title: 'Why The Wealthy Hold 15% In Tangible Assets',
      caption: 'Here is how high-net-worth portfolios hedge against monetary debasement. A 60-second breakdown of asset preservation principles.',
      hashtags: ['#WealthBuilding', '#AssetAllocation', '#FinanceTips', '#Investing101', '#MoneyMindset'],
      alternativeTitles: ['Portfolio Allocation Secrets of the 1%'],
      tone: 'Analytical & Educated',
    },
    whatsappReview: {
      recipientPhone: '+1 (555) 902-1849',
      status: 'pending',
      signedApprovalToken: 'sig_tok_5e4f3a2b',
      signedPreviewUrl: '/api/whatsapp/review-link/job_sample_5?token=sig_tok_5e4f3a2b',
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    },
    schedule: {
      timezone: 'America/Chicago',
      autoPublishOnApproval: true,
    },
    cost: {
      estimatedUsd: 0.28,
      actualUsd: 0.05,
    },
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
];

// -------------------------------------------------------------
// WhatsApp Business Platform (Cloud API) Configuration
// -------------------------------------------------------------
interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  recipientPhone: string;
  verifyToken: string;
  isLiveConnected: boolean;
  verifiedName?: string;
  displayPhoneNumber?: string;
  lastTestedAt?: string;
  lastTestError?: string;
}

const whatsAppConfig: WhatsAppConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  recipientPhone: process.env.WHATSAPP_RECIPIENT_PHONE || '+15559021849',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'autoreels_secure_verify_token_2026',
  isLiveConnected: false, // Strict: Never claim connected until real credentials & successful test
};

// Dispatch WhatsApp Review Notification with Interactive Buttons & Signed Expiring URL
async function sendWhatsAppReviewNotification(job: VideoJob): Promise<{ success: boolean; messageId?: string; error?: string; channel: 'interactive_button' | 'signed_link' | 'unconfigured' }> {
  const appBaseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const signedPreviewUrl = `${appBaseUrl}/api/whatsapp/review-link/${job.id}?token=${job.whatsappReview.signedApprovalToken}`;
  job.whatsappReview.signedPreviewUrl = signedPreviewUrl;

  const scheduledTimeStr = job.schedule.scheduledFor 
    ? new Date(job.schedule.scheduledFor).toLocaleString('en-US', { timeZone: job.schedule.timezone, dateStyle: 'medium', timeStyle: 'short' }) 
    : 'Immediate on Approval';

  const notificationText = [
    `🎬 *ReelFlow Studio — AI Video Review Required*`,
    ``,
    `📌 *Title:* ${job.metadata.title}`,
    `📝 *Caption:* ${job.metadata.caption}`,
    `🏷️ *Hashtags:* ${job.metadata.hashtags.join(' ')}`,
    `🎯 *Target Page:* ${job.targetPageName} (Niche: ${job.niche})`,
    `⏰ *Scheduled Publish:* ${scheduledTimeStr} (${job.schedule.timezone})`,
    `🔒 *Fast-Track Approval Link:* ${signedPreviewUrl}`,
    ``,
    `_Reply with interactive buttons below or open the secure link above to review & approve._`
  ].join('\n');

  // If real WhatsApp credentials are NOT configured or non-testable
  if (!whatsAppConfig.accessToken || !whatsAppConfig.phoneNumberId || !whatsAppConfig.isLiveConnected) {
    job.whatsappReview.status = 'pending_credentials';
    job.whatsappReview.sentAt = new Date().toISOString();

    auditLogsStore.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'WHATSAPP_NOTIFICATION_PREPARED',
      actor: 'WhatsApp Review Engine',
      details: `Generated secure signed review URL for job ${job.id}. Real WhatsApp Cloud API is disconnected (real credentials required). Signed URL: ${signedPreviewUrl}`,
      severity: 'warning',
      targetType: 'whatsapp',
      targetId: job.id,
    });

    return {
      success: false,
      error: 'WhatsApp Business Platform not connected with verified credentials. Generated signed preview link.',
      channel: 'unconfigured',
    };
  }

  // Real WhatsApp Cloud API Call:
  // Step 1: Try interactive message with quick reply buttons
  try {
    const interactivePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: whatsAppConfig.recipientPhone.replace(/[^0-9]/g, ''),
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: 'AI Reel Review Required'
        },
        body: {
          text: notificationText.slice(0, 1024)
        },
        footer: {
          text: 'ReelFlow Studio Gatekeeper • Expiring Link'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: `APPROVE_${job.id}_${job.whatsappReview.signedApprovalToken}`,
                title: '✅ Approve Post'
              }
            },
            {
              type: 'reply',
              reply: {
                id: `REJECT_${job.id}_${job.whatsappReview.signedApprovalToken}`,
                title: '❌ Reject Post'
              }
            }
          ]
        }
      }
    };

    let metaRes = await fetch(`https://graph.facebook.com/v21.0/${whatsAppConfig.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsAppConfig.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(interactivePayload)
    });

    let metaData = await metaRes.json();

    // If interactive buttons return 400 (e.g. 24h window closed or template required), fall back to text message with signed expiring URL
    if (!metaRes.ok) {
      console.warn('[WhatsApp Cloud API] Interactive button send failed, falling back to text message with signed URL:', metaData?.error?.message);

      const fallbackTextPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: whatsAppConfig.recipientPhone.replace(/[^0-9]/g, ''),
        type: 'text',
        text: {
          preview_url: true,
          body: notificationText
        }
      };

      metaRes = await fetch(`https://graph.facebook.com/v21.0/${whatsAppConfig.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsAppConfig.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fallbackTextPayload)
      });

      metaData = await metaRes.json();
    }

    if (metaRes.ok && metaData.messages?.[0]?.id) {
      const messageId = metaData.messages[0].id;
      job.whatsappReview.messageId = messageId;
      job.whatsappReview.status = 'delivered';
      job.whatsappReview.sentAt = new Date().toISOString();

      auditLogsStore.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'WHATSAPP_NOTIFICATION_DELIVERED',
        actor: 'WhatsApp Cloud API',
        details: `Sent review notification to ${whatsAppConfig.recipientPhone} for job ${job.id}. Message ID: ${messageId}`,
        severity: 'info',
        targetType: 'whatsapp',
        targetId: job.id,
      });

      return { success: true, messageId, channel: 'interactive_button' };
    } else {
      const errorMsg = metaData.error?.message || 'Meta Graph API returned error';
      job.whatsappReview.status = 'failed';

      auditLogsStore.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'WHATSAPP_NOTIFICATION_FAILED',
        actor: 'WhatsApp Cloud API',
        details: `Failed to deliver notification for job ${job.id}: ${errorMsg}`,
        severity: 'warning',
        targetType: 'whatsapp',
        targetId: job.id,
      });

      return { success: false, error: errorMsg, channel: 'signed_link' };
    }
  } catch (err: any) {
    const errorMsg = err?.message || 'Network error reaching Meta Graph API';
    job.whatsappReview.status = 'failed';
    return { success: false, error: errorMsg, channel: 'signed_link' };
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Health & Configuration Status
app.get('/api/status', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AutoReels Automation Engine',
    version: '2.4.0',
    providers: {
      geminiAi: {
        configured: hasGeminiKey,
        model: 'gemini-3.8-flash',
        status: hasGeminiKey ? 'active' : 'fallback_mode',
      },
      geminiOmniFlash: {
        configured: hasGeminiKey,
        model: 'gemini-omni-1.1-flash',
        videoFormats: ['9:16', '16:9'],
        durations: ['5s', '10s'],
        resolutions: ['720p', '1080p'],
        storageEngine: 'Local Private Cloud Directory (/storage/videos)',
        costPerSecondUsd: 0.03,
        status: hasGeminiKey ? 'active' : 'unconfigured_key',
      },
      googleVeo: {
        configured: hasGeminiKey,
        model: 'Google Veo / Omni Video Engine',
        status: hasGeminiKey ? 'ready' : 'unconfigured_key',
      },
      whatsappCloudApi: {
        configured: Boolean(whatsAppConfig.accessToken && whatsAppConfig.phoneNumberId),
        status: whatsAppConfig.isLiveConnected 
          ? 'CONNECTED' 
          : whatsAppConfig.accessToken && whatsAppConfig.phoneNumberId 
          ? 'CREDENTIALS_SET_NOT_TESTED' 
          : 'DISCONNECTED',
        isLiveConnected: whatsAppConfig.isLiveConnected,
        phoneNumberId: whatsAppConfig.phoneNumberId ? `${whatsAppConfig.phoneNumberId.slice(0, 4)}...${whatsAppConfig.phoneNumberId.slice(-4)}` : null,
        displayPhoneNumber: whatsAppConfig.displayPhoneNumber || null,
        verifiedName: whatsAppConfig.verifiedName || null,
        recipientPhone: whatsAppConfig.recipientPhone || null,
        webhookPath: '/api/whatsapp/webhook',
        interactiveSupport: true,
        signedLinksSupport: true,
        lastTestedAt: whatsAppConfig.lastTestedAt || null,
        lastTestError: whatsAppConfig.lastTestError || null,
      },
      metaGraphApi: {
        configured: Boolean(process.env.META_ACCESS_TOKEN),
        pagesConnected: pagesStore.length,
        version: 'v21.0',
        reelsEndpoint: '/{page-id}/video_reels',
      },
    },
    metrics: {
      totalPages: pagesStore.length,
      activePages: pagesStore.filter(p => p.isEnabled).length,
      totalJobs: videoJobsStore.length,
      waitingReview: videoJobsStore.filter(j => j.status === 'WAITING_FOR_APPROVAL').length,
      scheduled: videoJobsStore.filter(j => j.status === 'POST_SCHEDULED').length,
      published: videoJobsStore.filter(j => j.status === 'PUBLISHED').length,
      failed: videoJobsStore.filter(j => j.status === 'FAILED').length,
    },
    budget: budgetStore,
  });
});

// 2. Facebook Pages Management (Supports 100 Pages)
app.get('/api/pages', (req, res) => {
  const { niche, search, enabledOnly, page = '1', limit = '100' } = req.query;
  let results = [...pagesStore];

  if (niche && niche !== 'all') {
    results = results.filter(p => p.niche === niche);
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(q) || p.pageId.includes(q));
  }
  if (enabledOnly === 'true') {
    results = results.filter(p => p.isEnabled);
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 100;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = results.slice(startIndex, startIndex + limitNum);

  res.json({
    total: results.length,
    page: pageNum,
    limit: limitNum,
    pages: paginated,
  });
});

app.post('/api/pages/update', (req, res) => {
  const { id, isEnabled, dailyLimit, postingFrequencyHours, customPromptRules, timezone } = req.body;
  const pageIndex = pagesStore.findIndex(p => p.id === id);
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }

  pagesStore[pageIndex] = {
    ...pagesStore[pageIndex],
    isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : pagesStore[pageIndex].isEnabled,
    dailyLimit: dailyLimit !== undefined ? Number(dailyLimit) : pagesStore[pageIndex].dailyLimit,
    postingFrequencyHours: postingFrequencyHours !== undefined ? Number(postingFrequencyHours) : pagesStore[pageIndex].postingFrequencyHours,
    customPromptRules: customPromptRules || pagesStore[pageIndex].customPromptRules,
    timezone: timezone || pagesStore[pageIndex].timezone,
  };

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'PAGE_CONFIG_UPDATED',
    actor: 'Admin Console',
    details: `Updated settings for Page "${pagesStore[pageIndex].name}" (Enabled: ${pagesStore[pageIndex].isEnabled}, Daily Limit: ${pagesStore[pageIndex].dailyLimit})`,
    severity: 'info',
    targetType: 'page',
    targetId: id,
  });

  res.json({ success: true, page: pagesStore[pageIndex] });
});

app.post('/api/pages/bulk-toggle', (req, res) => {
  const { pageIds, enable } = req.body;
  if (!Array.isArray(pageIds)) {
    return res.status(400).json({ error: 'pageIds array required' });
  }

  const idsSet = new Set(pageIds);
  pagesStore = pagesStore.map(p => {
    if (idsSet.has(p.id)) {
      return { ...p, isEnabled: Boolean(enable) };
    }
    return p;
  });

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'PAGES_BULK_TOGGLED',
    actor: 'Admin Console',
    details: `Bulk updated ${pageIds.length} pages to ${enable ? 'ENABLED' : 'DISABLED'}`,
    severity: 'info',
    targetType: 'page',
  });

  res.json({ success: true, count: pageIds.length, enabled: Boolean(enable) });
});

// 3. AI Metadata Generation with Gemini 3.8 Flash
app.post('/api/ai/generate-metadata', async (req, res) => {
  const { prompt, niche, targetAudience = 'USA & Global English', tone = 'Engaging & Authentic' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const systemPrompt = `You are an elite Meta Reels algorithm & copywriting specialist.
Generate:
1. One compelling English title (punchy hook, max 10 words, no clickbait scams, no guaranteed-viral claims).
2. One natural English caption (1-3 sentences, high engagement, strong hook, conversational question or call to save).
3. EXACTLY 5 relevant hashtags (targeted to the niche, no spammy unrelated tags).
4. Two alternative titles.
Target Niche: ${niche || 'General Reels'}
Target Audience: ${targetAudience}
Tone: ${tone}

Return STRICT JSON matching this format:
{
  "title": "string",
  "caption": "string",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "alternativeTitles": ["string", "string"],
  "tone": "string"
}`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Video Prompt description: "${prompt}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(geminiResponse.text?.trim() || '{}');
    res.json({
      success: true,
      metadata: {
        title: parsed.title || 'Mastering The Daily Flow',
        caption: parsed.caption || 'Here is the step-by-step insight you need to know today. Save this for later!',
        hashtags: Array.isArray(parsed.hashtags) && parsed.hashtags.length === 5 
          ? parsed.hashtags 
          : ['#ReelsDaily', '#TrendingNow', '#WatchTillEnd', '#MustWatch', '#ExplorePage'],
        alternativeTitles: parsed.alternativeTitles || ['Daily Insights', 'Step By Step Guide'],
        tone: parsed.tone || tone,
      },
    });
  } catch (err: any) {
    console.error('Gemini metadata generation failed, applying intelligent heuristic fallback:', err?.message);
    // Intelligent domain fallback if API key quota exceeded or unconfigured
    const sanitizedNiche = niche ? String(niche).replace(/[^a-zA-Z]/g, '') : 'Daily';
    res.json({
      success: true,
      metadata: {
        title: `The Ultimate ${niche || 'Reel'} Breakthrough You Must See`,
        caption: `A closer look at how modern creators are revolutionizing ${niche || 'content'}. What do you think about this technique? Let us know below!`,
        hashtags: [`#${sanitizedNiche}Tips`, `#${sanitizedNiche}Life`, `#ReelsViral`, `#ExplorePage`, `#DailyInspiration`],
        alternativeTitles: [
          `3 Key Takeaways for ${niche || 'Creators'}`,
          `Why Everyone Is Talking About This Breakthrough`,
        ],
        tone: tone || 'Engaging & Authentic',
      },
    });
  }
});

// 4. Video Jobs Queue
app.get('/api/jobs', (req, res) => {
  const { status, pageId } = req.query;
  let results = [...videoJobsStore];

  if (status && status !== 'all') {
    results = results.filter(j => j.status === status);
  }
  if (pageId) {
    results = results.filter(j => j.targetPageId === pageId);
  }

  // Sort descending by created time
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ total: results.length, jobs: results });
});

// Single Job Polling Endpoint
app.get('/api/video/jobs/:id', (req, res) => {
  const { id } = req.params;
  const job = videoJobsStore.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ success: true, job });
});

// Video file streaming endpoint with HTTP 206 Range support for Reels players
app.get('/api/storage/videos/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(STORAGE_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found in storage' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Real AI Video Generation via Google Interactions API (gemini-omni-1.1-flash)
app.post('/api/video/generate', async (req, res) => {
  if (budgetStore.emergencyStopActive) {
    return res.status(403).json({ error: 'EMERGENCY_STOP_ACTIVE: Generation jobs suspended.' });
  }

  const {
    prompt,
    negativePrompt,
    targetPageId,
    durationSeconds = 10,
    aspectRatio = '9:16',
    resolution = '720p',
    autoPublishOnApproval = true,
    title,
    caption,
    hashtags,
  } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const targetPage = pagesStore.find(p => p.id === targetPageId) || pagesStore[0];
  const jobId = `job_real_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const idempotencyKey = `idem_${crypto.randomBytes(8).toString('hex')}`;
  const approvalToken = `sig_${crypto.randomBytes(16).toString('hex')}`;

  // Valid durations for gemini-omni-1.1-flash are '5s' or '10s'
  const durationSecNum = Number(durationSeconds);
  const modelDuration = durationSecNum <= 5 ? '5s' : '10s';
  const finalDurationSec = durationSecNum <= 5 ? 5 : 10;

  // Real model pricing: ~$0.03 per second of generated video
  const costPerSecond = 0.03;
  const estimatedUsd = parseFloat((finalDurationSec * costPerSecond).toFixed(2));

  // Initialize Job Record in QUEUED state
  const newJob: VideoJob = {
    id: jobId,
    idempotencyKey,
    targetPageId: targetPage.id,
    targetPageName: targetPage.name,
    niche: targetPage.niche,
    prompt: prompt.trim(),
    negativePrompt: negativePrompt || 'blurry, low quality, artifacts, watermark',
    aspectRatio: aspectRatio === '16:9' ? '16:9' : '9:16',
    durationSeconds: finalDurationSec as any,
    resolution: resolution === '1080p' ? '1080p' : '720p',
    modelUsed: 'Google Veo (gemini-omni-1.1-flash)',
    status: 'AI_VIDEO_JOB_QUEUED',
    progressPercent: 5,
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      title: title || `${targetPage.niche}: ${prompt.slice(0, 35)}...`,
      caption: caption || `Witness this real AI creation: ${prompt.slice(0, 60)}. Save & share!`,
      hashtags: Array.isArray(hashtags) && hashtags.length === 5 ? hashtags : targetPage.defaultHashtags,
      alternativeTitles: [`Next-Gen ${targetPage.niche}`, `AI Reel Breakthrough`],
      tone: 'Inspiring & Modern',
    },
    whatsappReview: {
      recipientPhone: '+1 (555) 902-1849',
      status: 'pending',
      signedApprovalToken: approvalToken,
      signedPreviewUrl: `/api/whatsapp/review-link/${jobId}?token=${approvalToken}`,
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    },
    schedule: {
      scheduledFor: new Date(Date.now() + 3 * 3600000).toISOString(),
      timezone: targetPage.timezone,
      autoPublishOnApproval: Boolean(autoPublishOnApproval),
    },
    cost: {
      estimatedUsd,
      actualUsd: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  videoJobsStore.unshift(newJob);

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'REAL_VIDEO_JOB_QUEUED',
    actor: 'ReelFlow Studio Core',
    details: `Queued real AI video job ${jobId} with gemini-omni-1.1-flash (${modelDuration}, ${newJob.aspectRatio}, ${newJob.resolution}). Est. Cost: $${estimatedUsd}`,
    severity: 'info',
    targetType: 'job',
    targetId: jobId,
  });

  // Respond immediately with the queued job so client can track/poll progress
  res.status(202).json({
    success: true,
    jobId,
    status: 'AI_VIDEO_JOB_QUEUED',
    job: newJob,
    message: 'Generation job submitted to Google Video API engine.',
  });

  // Execute external API call asynchronously
  (async () => {
    const job = videoJobsStore.find(j => j.id === jobId);
    if (!job) return;

    job.status = 'VIDEO_GENERATING';
    job.progressPercent = 25;
    job.updatedAt = new Date().toISOString();

    try {
      console.log(`[Google Video API] Invoking gemini-omni-1.1-flash for job ${jobId}...`);

      const interaction = await ai.interactions.create({
        model: 'gemini-omni-1.1-flash',
        input: job.prompt,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: job.aspectRatio,
          duration: modelDuration,
          resolution: job.resolution,
        },
      }, { timeout: 300000 });

      job.progressPercent = 85;

      const outputVideo = interaction.output_video;

      if (outputVideo?.data) {
        // Base64 MP4 binary returned
        const videoBuffer = Buffer.from(outputVideo.data, 'base64');
        const filename = `${jobId}.mp4`;
        const filePath = path.join(STORAGE_DIR, filename);

        await fs.promises.writeFile(filePath, videoBuffer);

        job.videoUrl = `/api/storage/videos/${filename}`;
        job.thumbnailUrl = undefined;
        job.status = 'WAITING_FOR_APPROVAL';
        job.progressPercent = 100;
        job.cost.actualUsd = estimatedUsd;
        job.updatedAt = new Date().toISOString();

        budgetStore.currentDaySpentUsd = parseFloat((budgetStore.currentDaySpentUsd + estimatedUsd).toFixed(2));
        budgetStore.currentMonthSpentUsd = parseFloat((budgetStore.currentMonthSpentUsd + estimatedUsd).toFixed(2));

        auditLogsStore.unshift({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'REAL_VIDEO_GENERATED_SUCCESS',
          actor: 'gemini-omni-1.1-flash',
          details: `Generated and stored real MP4 video (${videoBuffer.length} bytes) to storage/videos/${filename}. Cost: $${estimatedUsd}`,
          severity: 'info',
          targetType: 'job',
          targetId: jobId,
        });

        console.log(`[Google Video API] Successfully generated and stored video for job ${jobId}`);
      } else if (outputVideo?.uri) {
        // Remote URI returned
        job.videoUrl = outputVideo.uri;
        job.status = 'WAITING_FOR_APPROVAL';
        job.progressPercent = 100;
        job.cost.actualUsd = estimatedUsd;
        job.updatedAt = new Date().toISOString();

        budgetStore.currentDaySpentUsd = parseFloat((budgetStore.currentDaySpentUsd + estimatedUsd).toFixed(2));
        budgetStore.currentMonthSpentUsd = parseFloat((budgetStore.currentMonthSpentUsd + estimatedUsd).toFixed(2));

        auditLogsStore.unshift({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'REAL_VIDEO_GENERATED_SUCCESS',
          actor: 'gemini-omni-1.1-flash',
          details: `Generated video with URI: ${outputVideo.uri}. Cost: $${estimatedUsd}`,
          severity: 'info',
          targetType: 'job',
          targetId: jobId,
        });
      } else {
        // Strict anti-hallucination constraint: do not simulate success if no video data returned
        throw new Error('Google Interactions API completed without returning video binary or URI in output_video.');
      }
    } catch (err: any) {
      console.error(`[Google Video API Error] Job ${jobId} failed:`, err?.message || err);

      // Strict anti-hallucination constraint: preserve exact error reason and mark FAILED
      job.status = 'FAILED';
      job.progressPercent = 0;
      job.errorReason = err?.message || 'External video generation call failed';
      job.updatedAt = new Date().toISOString();

      auditLogsStore.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'REAL_VIDEO_GENERATION_FAILED',
        actor: 'gemini-omni-1.1-flash',
        details: `External API call failed for job ${jobId}: ${job.errorReason}`,
        severity: 'critical',
        targetType: 'job',
        targetId: jobId,
      });
    }
  })();
});

app.post('/api/jobs/create', async (req, res) => {
  if (budgetStore.emergencyStopActive) {
    return res.status(403).json({ error: 'EMERGENCY_STOP_ACTIVE: All generation and publishing jobs are suspended.' });
  }

  const {
    prompt,
    negativePrompt,
    targetPageId,
    durationSeconds = 15,
    resolution = '1080p',
    aspectRatio = '9:16',
    modelUsed = 'Google Veo-2',
    scheduleTime,
    autoPublishOnApproval = true,
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const targetPage = pagesStore.find(p => p.id === targetPageId) || pagesStore[0];
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const idempotencyKey = `idem_${crypto.randomBytes(8).toString('hex')}`;
  const approvalToken = `sig_${crypto.randomBytes(16).toString('hex')}`;

  const costPerSecond = modelUsed === 'Google Veo-2' ? 0.022 : 0.018;
  const estimatedUsd = parseFloat((durationSeconds * costPerSecond).toFixed(2));

  const sampleVideos = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
  ];
  const videoUrl = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

  const sampleThumbs = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  ];
  const thumbnailUrl = sampleThumbs[Math.floor(Math.random() * sampleThumbs.length)];

  const newJob: VideoJob = {
    id: jobId,
    idempotencyKey,
    targetPageId: targetPage.id,
    targetPageName: targetPage.name,
    niche: targetPage.niche,
    prompt,
    negativePrompt: negativePrompt || 'blurry, low quality, artifacts, watermark',
    aspectRatio,
    durationSeconds: Number(durationSeconds) as 8 | 10 | 15 | 30,
    resolution,
    modelUsed,
    videoUrl,
    thumbnailUrl,
    status: 'AI_VIDEO_JOB_QUEUED',
    progressPercent: 0,
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      title: `${targetPage.niche}: ${prompt.slice(0, 35)}...`,
      caption: `Discover how ${prompt.slice(0, 60)} is transforming the space! Follow for daily ${targetPage.niche} Reels.`,
      hashtags: targetPage.defaultHashtags,
      alternativeTitles: [`Next-Gen ${targetPage.niche}`, `Watch This Before You Start`],
      tone: 'Inspiring & Engaging',
    },
    whatsappReview: {
      recipientPhone: '+1 (555) 902-1849',
      status: 'pending',
      signedApprovalToken: approvalToken,
      signedPreviewUrl: `/api/whatsapp/review-link/${jobId}?token=${approvalToken}`,
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    },
    schedule: {
      scheduledFor: scheduleTime || new Date(Date.now() + 3 * 3600000).toISOString(),
      timezone: targetPage.timezone,
      autoPublishOnApproval: Boolean(autoPublishOnApproval),
    },
    cost: {
      estimatedUsd,
      actualUsd: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  videoJobsStore.unshift(newJob);

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'JOB_CREATED',
    actor: 'Admin Console',
    details: `Created video job "${newJob.id}" for page "${targetPage.name}". Est. Cost: $${estimatedUsd}`,
    severity: 'info',
    targetType: 'job',
    targetId: jobId,
  });

  res.status(201).json({ success: true, job: newJob });
});

// Advance Job Progress State Machine Simulation
app.post('/api/jobs/:id/simulate-step', async (req, res) => {
  const { id } = req.params;
  const job = videoJobsStore.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Transitions:
  // AI_VIDEO_JOB_QUEUED -> VIDEO_GENERATING
  // VIDEO_GENERATING -> VIDEO_READY
  // VIDEO_READY -> METADATA_READY
  // METADATA_READY -> WAITING_FOR_APPROVAL
  // POST_SCHEDULED -> FACEBOOK_UPLOAD_STARTED -> PUBLISHED
  let nextStatus = job.status;
  let nextProgress = job.progressPercent;

  if (job.status === 'PROMPT_CREATED' || job.status === 'AI_VIDEO_JOB_QUEUED') {
    nextStatus = 'VIDEO_GENERATING';
    nextProgress = 35;
  } else if (job.status === 'VIDEO_GENERATING') {
    nextStatus = 'VIDEO_READY';
    nextProgress = 100;
    job.cost.actualUsd = job.cost.estimatedUsd;
    budgetStore.currentDaySpentUsd += job.cost.actualUsd;
    budgetStore.currentMonthSpentUsd += job.cost.actualUsd;
  } else if (job.status === 'VIDEO_READY') {
    nextStatus = 'METADATA_READY';
    nextProgress = 100;
  } else if (job.status === 'METADATA_READY') {
    nextStatus = 'WAITING_FOR_APPROVAL';
    job.whatsappReview.status = 'delivered';
    job.whatsappReview.sentAt = new Date().toISOString();
    job.whatsappReview.messageId = `wamid_${Date.now()}`;
  } else if (job.status === 'POST_SCHEDULED') {
    nextStatus = 'FACEBOOK_UPLOAD_STARTED';
    nextProgress = 75;
  } else if (job.status === 'FACEBOOK_UPLOAD_STARTED') {
    nextStatus = 'PUBLISHED';
    nextProgress = 100;
    job.publishResult = {
      facebookReelId: `reel_fb_${Date.now()}`,
      facebookPostUrl: `https://facebook.com/reel/${Date.now()}`,
      publishedAt: new Date().toISOString(),
      viewsCount: 120,
      reachCount: 250,
    };
    const targetPage = pagesStore.find(p => p.id === job.targetPageId);
    if (targetPage) {
      targetPage.reelsPublishedTotal += 1;
      targetPage.postsPublishedToday += 1;
    }
  }

  job.status = nextStatus;
  job.progressPercent = nextProgress;
  job.updatedAt = new Date().toISOString();

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: `JOB_STATE_${nextStatus}`,
    actor: 'State Machine Engine',
    details: `Job ${job.id} transitioned to ${nextStatus}`,
    severity: 'info',
    targetType: 'job',
    targetId: job.id,
  });

  res.json({ success: true, job });
});

// Update Job Metadata manually before approval
app.post('/api/jobs/:id/update-metadata', (req, res) => {
  const { id } = req.params;
  const { title, caption, hashtags, scheduledFor } = req.body;
  const job = videoJobsStore.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (title) job.metadata.title = title;
  if (caption) job.metadata.caption = caption;
  if (Array.isArray(hashtags)) job.metadata.hashtags = hashtags;
  if (scheduledFor) job.schedule.scheduledFor = scheduledFor;

  job.updatedAt = new Date().toISOString();

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'METADATA_EDITED_BY_USER',
    actor: 'Admin Console',
    details: `Edited metadata for job ${job.id}`,
    severity: 'info',
    targetType: 'job',
    targetId: job.id,
  });

  res.json({ success: true, job });
});

// 5. WhatsApp Business Platform API Routes & Review Workflow

// A. Send or Re-send WhatsApp Review Notification
app.post('/api/whatsapp/send-notification', async (req, res) => {
  const { jobId } = req.body;
  const job = videoJobsStore.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const result = await sendWhatsAppReviewNotification(job);
  res.json({
    success: true,
    notificationResult: result,
    job,
    whatsappReview: job.whatsappReview,
  });
});

// B. WhatsApp Cloud API Connection Test (Strict: no fake claim until real credentials pass)
app.post('/api/whatsapp/test-connection', async (req, res) => {
  const { accessToken, phoneNumberId, recipientPhone, businessAccountId, verifyToken } = req.body;

  if (accessToken) whatsAppConfig.accessToken = accessToken.trim();
  if (phoneNumberId) whatsAppConfig.phoneNumberId = phoneNumberId.trim();
  if (recipientPhone) whatsAppConfig.recipientPhone = recipientPhone.trim();
  if (businessAccountId) whatsAppConfig.businessAccountId = businessAccountId.trim();
  if (verifyToken) whatsAppConfig.verifyToken = verifyToken.trim();

  if (!whatsAppConfig.accessToken || !whatsAppConfig.phoneNumberId) {
    whatsAppConfig.isLiveConnected = false;
    return res.status(400).json({
      success: false,
      error: 'CREDENTIALS_MISSING: Access Token and Phone Number ID are required to test WhatsApp Cloud API.',
      isLiveConnected: false,
    });
  }

  try {
    // 1. Verify credentials by querying Meta Graph API for Phone Number metadata
    console.log(`[WhatsApp Test] Validating Phone Number ID: ${whatsAppConfig.phoneNumberId}...`);
    const metaVerifyRes = await fetch(`https://graph.facebook.com/v21.0/${whatsAppConfig.phoneNumberId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`, {
      headers: {
        'Authorization': `Bearer ${whatsAppConfig.accessToken}`,
      },
    });

    const metaVerifyData = await metaVerifyRes.json();

    if (!metaVerifyRes.ok) {
      whatsAppConfig.isLiveConnected = false;
      whatsAppConfig.lastTestError = metaVerifyData.error?.message || 'Meta Graph API token rejected';
      whatsAppConfig.lastTestedAt = new Date().toISOString();

      auditLogsStore.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'WHATSAPP_TEST_FAILED',
        actor: 'Admin Console',
        details: `WhatsApp credentials verification failed: ${whatsAppConfig.lastTestError}`,
        severity: 'warning',
        targetType: 'whatsapp',
      });

      return res.status(400).json({
        success: false,
        error: whatsAppConfig.lastTestError,
        metaError: metaVerifyData.error,
        isLiveConnected: false,
      });
    }

    // 2. Send live verification ping to recipient phone
    const pingRecipient = whatsAppConfig.recipientPhone.replace(/[^0-9]/g, '');
    const pingPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: pingRecipient,
      type: 'text',
      text: {
        preview_url: false,
        body: '🔔 *ReelFlow Studio Test Ping*: WhatsApp Business Platform connection verified successfully! Video review alerts and interactive fast-track approval links are active.'
      }
    };

    const pingRes = await fetch(`https://graph.facebook.com/v21.0/${whatsAppConfig.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsAppConfig.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pingPayload),
    });

    const pingData = await pingRes.json();

    if (pingRes.ok && pingData.messages?.[0]?.id) {
      whatsAppConfig.isLiveConnected = true;
      whatsAppConfig.verifiedName = metaVerifyData.verified_name || 'Verified WhatsApp Business';
      whatsAppConfig.displayPhoneNumber = metaVerifyData.display_phone_number || whatsAppConfig.phoneNumberId;
      whatsAppConfig.lastTestedAt = new Date().toISOString();
      whatsAppConfig.lastTestError = undefined;

      auditLogsStore.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'WHATSAPP_TEST_SUCCEEDED',
        actor: 'Admin Console',
        details: `WhatsApp Business Platform verified live for ${whatsAppConfig.displayPhoneNumber} (Verified Name: ${whatsAppConfig.verifiedName}). Test message: ${pingData.messages[0].id}`,
        severity: 'info',
        targetType: 'whatsapp',
      });

      return res.json({
        success: true,
        isLiveConnected: true,
        verifiedName: whatsAppConfig.verifiedName,
        displayPhoneNumber: whatsAppConfig.displayPhoneNumber,
        messageId: pingData.messages[0].id,
        message: 'Live WhatsApp connection established and verified with Meta Graph API.',
      });
    } else {
      whatsAppConfig.isLiveConnected = false;
      whatsAppConfig.lastTestError = pingData.error?.message || 'Failed to deliver test ping message';
      whatsAppConfig.lastTestedAt = new Date().toISOString();

      return res.status(400).json({
        success: false,
        isLiveConnected: false,
        error: whatsAppConfig.lastTestError,
        metaError: pingData.error,
      });
    }
  } catch (err: any) {
    whatsAppConfig.isLiveConnected = false;
    whatsAppConfig.lastTestError = err?.message || 'Network error reaching Meta Graph API';
    whatsAppConfig.lastTestedAt = new Date().toISOString();
    return res.status(500).json({
      success: false,
      isLiveConnected: false,
      error: whatsAppConfig.lastTestError,
    });
  }
});

// C. Get WhatsApp Configuration (Safe/Masked)
app.get('/api/whatsapp/config', (req, res) => {
  const appBaseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  res.json({
    isLiveConnected: whatsAppConfig.isLiveConnected,
    configured: Boolean(whatsAppConfig.accessToken && whatsAppConfig.phoneNumberId),
    phoneNumberId: whatsAppConfig.phoneNumberId ? `${whatsAppConfig.phoneNumberId.slice(0, 4)}...${whatsAppConfig.phoneNumberId.slice(-4)}` : '',
    rawPhoneNumberId: whatsAppConfig.phoneNumberId,
    businessAccountId: whatsAppConfig.businessAccountId,
    recipientPhone: whatsAppConfig.recipientPhone,
    displayPhoneNumber: whatsAppConfig.displayPhoneNumber,
    verifiedName: whatsAppConfig.verifiedName,
    verifyToken: whatsAppConfig.verifyToken,
    webhookUrl: `${appBaseUrl}/api/whatsapp/webhook`,
    lastTestedAt: whatsAppConfig.lastTestedAt,
    lastTestError: whatsAppConfig.lastTestError,
  });
});

// D. Save WhatsApp Configuration
app.post('/api/whatsapp/config', (req, res) => {
  const { accessToken, phoneNumberId, businessAccountId, recipientPhone, verifyToken } = req.body;

  if (accessToken !== undefined) whatsAppConfig.accessToken = accessToken.trim();
  if (phoneNumberId !== undefined) whatsAppConfig.phoneNumberId = phoneNumberId.trim();
  if (businessAccountId !== undefined) whatsAppConfig.businessAccountId = businessAccountId.trim();
  if (recipientPhone !== undefined) whatsAppConfig.recipientPhone = recipientPhone.trim();
  if (verifyToken !== undefined) whatsAppConfig.verifyToken = verifyToken.trim();

  // Reset live connected flag when credentials change until re-tested
  whatsAppConfig.isLiveConnected = false;

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'WHATSAPP_CONFIG_UPDATED',
    actor: 'Admin Console',
    details: `Updated WhatsApp configuration (Phone Number ID: ${whatsAppConfig.phoneNumberId ? 'Provided' : 'Cleared'}). Re-verification required.`,
    severity: 'info',
    targetType: 'whatsapp',
  });

  res.json({
    success: true,
    message: 'Configuration saved. Run a connection test to verify.',
    config: {
      configured: Boolean(whatsAppConfig.accessToken && whatsAppConfig.phoneNumberId),
      isLiveConnected: whatsAppConfig.isLiveConnected,
      recipientPhone: whatsAppConfig.recipientPhone,
    }
  });
});

// E. Standalone Secure Expiring Review Landing View
app.get('/api/whatsapp/review-link/:id', (req, res) => {
  const { id } = req.params;
  const { token } = req.query;
  const job = videoJobsStore.find(j => j.id === id);

  if (!job) {
    return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Review Not Found</title>
  <style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:30px;display:flex;justify-content:center;}.box{max-width:440px;background:#1e293b;padding:24px;border-radius:16px;border:1px solid #334155;text-align:center;}</style>
</head>
<body><div class="box"><h2 style="color:#ef4444;">404 Not Found</h2><p>This video review does not exist or has been removed.</p></div></body></html>`);
  }

  // Token validation (prevent forged access)
  if (token && job.whatsappReview.signedApprovalToken !== token) {
    return res.status(403).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invalid Security Token</title>
  <style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:30px;display:flex;justify-content:center;}.box{max-width:440px;background:#1e293b;padding:24px;border-radius:16px;border:1px solid #ef4444;text-align:center;}</style>
</head>
<body><div class="box"><h2 style="color:#ef4444;">Access Denied</h2><p>The cryptographic approval token provided does not match the active review token for this job.</p></div></body></html>`);
  }

  // Expiration Check (Secure Expiring Links)
  const isExpired = new Date() > new Date(job.whatsappReview.expiresAt);
  const formattedSchedule = job.schedule.scheduledFor 
    ? new Date(job.schedule.scheduledFor).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) 
    : 'Immediate on Approval';

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp Review: ${job.metadata.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 16px; }
    .card { max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 20px; padding: 20px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #00a884; color: white; margin-bottom: 14px; letter-spacing: 0.5px; }
    .badge-expired { background: #ef4444; }
    .video-container { width: 100%; border-radius: 14px; overflow: hidden; background: #000; max-height: 440px; display: flex; justify-content: center; border: 1px solid #475569; position: relative; }
    video { width: 100%; height: auto; max-height: 440px; object-fit: contain; }
    h2 { font-size: 18px; margin: 14px 0 6px; line-height: 1.35; font-weight: 700; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 8px 0; }
    .tags { color: #38bdf8; font-size: 12px; font-mono; font-weight: 500; margin-top: 6px; }
    .meta-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px; margin: 14px 0; font-size: 12px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-label { color: #64748b; }
    .meta-val { color: #f1f5f9; font-weight: 600; }
    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; }
    button { padding: 14px; border: none; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: opacity 0.2s, transform 0.1s; }
    button:active { transform: scale(0.98); }
    .btn-approve { background: #10b981; color: white; grid-column: span 2; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
    .btn-reject { background: #ef4444; color: white; }
    .btn-regen { background: #334155; color: #cbd5e1; }
    .status-box { padding: 14px; background: #0f172a; border-radius: 12px; margin-top: 16px; font-size: 13px; text-align: center; border: 1px solid #334155; }
    .alert-expired { background: #450a0a; border: 1px solid #991b1b; padding: 14px; border-radius: 12px; color: #fca5a5; font-size: 13px; line-height: 1.5; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge ${isExpired ? 'badge-expired' : ''}">
      <span>WHATSAPP SECURE REVIEW</span>
      <span>•</span>
      <span>${isExpired ? 'EXPIRED' : 'VALID'}</span>
    </div>

    <div class="video-container">
      <video controls autoplay muted playsinline poster="${job.thumbnailUrl || ''}" src="${job.videoUrl || ''}"></video>
    </div>

    <h2>${job.metadata.title}</h2>
    <p>${job.metadata.caption}</p>
    <div class="tags">${job.metadata.hashtags.join(' ')}</div>

    <div class="meta-box">
      <div class="meta-row">
        <span class="meta-label">Target Page:</span>
        <span class="meta-val">${job.targetPageName} (${job.niche})</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Scheduled Time:</span>
        <span class="meta-val">${formattedSchedule} (${job.schedule.timezone})</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Link Valid Until:</span>
        <span class="meta-val" style="color: ${isExpired ? '#ef4444' : '#38bdf8'}; font-family: monospace;">${new Date(job.whatsappReview.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${new Date(job.whatsappReview.expiresAt).toLocaleDateString()})</span>
      </div>
    </div>

    <div id="actionArea">
      ${isExpired ? `
        <div class="alert-expired">
          <strong>⚠️ Link Expired (24h Window Passed)</strong><br>
          For security against stale publishing, this review token has expired. Please re-trigger a review notification from the ReelFlow Studio dashboard.
        </div>
      ` : job.whatsappReview.decision ? `
        <div class="status-box">
          Decision Recorded: <strong style="color: ${job.whatsappReview.decision === 'APPROVED' ? '#10b981' : '#ef4444'};">${job.whatsappReview.decision}</strong><br>
          <span style="font-size: 11px; color: #64748b;">${new Date(job.whatsappReview.decisionTimestamp || '').toLocaleString()} by ${job.whatsappReview.reviewerName}</span>
        </div>
      ` : `
        <div class="actions">
          <button class="btn-approve" onclick="submitDecision('APPROVED')">✓ APPROVE FOR FACEBOOK PUBLISHING</button>
          <button class="btn-reject" onclick="submitDecision('REJECTED')">✕ REJECT</button>
          <button class="btn-regen" onclick="submitDecision('REGENERATE')">↻ REGENERATE</button>
        </div>
      `}
    </div>
  </div>

  <script>
    async function submitDecision(decision) {
      if (!confirm('Confirm ' + decision + ' for Facebook Reel publish?')) return;
      try {
        const res = await fetch('/api/whatsapp/review-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: '${job.id}',
            token: '${token || job.whatsappReview.signedApprovalToken}',
            decision: decision,
            reviewerName: 'WhatsApp Browser Reviewer'
          })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('actionArea').innerHTML = '<div class="status-box" style="color: #10b981; font-weight: bold;">✓ Decision Recorded: ' + decision + '! You may close this tab.</div>';
        } else {
          alert('Error: ' + (data.error || 'Failed to submit decision'));
        }
      } catch (err) {
        alert('Network error submitting decision');
      }
    }
  </script>
</body>
</html>`);
});

// F. Record WhatsApp Review Decision (Validates Signature Token & Expiration)
app.post('/api/whatsapp/review-action', (req, res) => {
  const { jobId, token, decision, reason, reviewerName = 'WhatsApp Mobile Reviewer' } = req.body;

  const job = videoJobsStore.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Token validation (prevent forged actions)
  if (token && job.whatsappReview.signedApprovalToken !== token) {
    return res.status(403).json({ error: 'INVALID_SIGNATURE: Signed approval token mismatch.' });
  }

  // Expiration validation
  if (new Date() > new Date(job.whatsappReview.expiresAt)) {
    return res.status(403).json({ error: 'TOKEN_EXPIRED: Signed approval link has expired (24h limit).' });
  }

  if (!['APPROVED', 'REJECTED', 'REGENERATE'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision. Must be APPROVED, REJECTED, or REGENERATE.' });
  }

  job.whatsappReview.decision = decision;
  job.whatsappReview.decisionTimestamp = new Date().toISOString();
  job.whatsappReview.decisionReason = reason || (decision === 'APPROVED' ? 'Approved via WhatsApp interactive review' : 'Rejected by reviewer');
  job.whatsappReview.reviewerName = reviewerName;
  job.whatsappReview.status = decision === 'APPROVED' ? 'approved' : decision === 'REJECTED' ? 'rejected' : 'regenerated';

  if (decision === 'APPROVED') {
    job.status = 'POST_SCHEDULED';
  } else if (decision === 'REJECTED') {
    job.status = 'REJECTED';
  } else if (decision === 'REGENERATE') {
    job.status = 'REGENERATION_QUEUED';
    job.progressPercent = 0;
  }

  job.updatedAt = new Date().toISOString();

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: `WHATSAPP_REVIEW_${decision}`,
    actor: reviewerName,
    details: `Review decision for job ${job.id}: ${decision}. Reason: ${job.whatsappReview.decisionReason}. Valid approval record established.`,
    severity: decision === 'REJECTED' ? 'warning' : 'info',
    targetType: 'whatsapp',
    targetId: job.id,
  });

  res.json({ success: true, job, decision });
});

// G. Official WhatsApp Cloud API Webhook verification (GET)
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === whatsAppConfig.verifyToken) {
    console.log('[WhatsApp Webhook] Verification successful with token:', token);
    auditLogsStore.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'WHATSAPP_WEBHOOK_VERIFIED',
      actor: 'Meta Cloud API',
      details: 'WhatsApp Webhook verification challenge responded with 200 OK',
      severity: 'info',
      targetType: 'whatsapp',
    });
    return res.status(200).send(challenge);
  } else {
    console.warn('[WhatsApp Webhook] Verification failed. Token mismatch.');
    return res.sendStatus(403);
  }
});

// H. Official WhatsApp Cloud API Inbound message / interactive button webhook (POST)
app.post('/api/whatsapp/webhook', (req, res) => {
  const body = req.body;

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'WHATSAPP_WEBHOOK_PAYLOAD_RECEIVED',
    actor: 'Meta Cloud API',
    details: `Inbound webhook payload received. Object: ${body.object || 'unknown'}`,
    severity: 'info',
    targetType: 'whatsapp',
  });

  // Parse interactive button replies: APPROVE_<jobId>_<token>
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (Array.isArray(messages) && messages.length > 0) {
      const msg = messages[0];
      let actionStr = '';
      if (msg.interactive?.type === 'button_reply') {
        actionStr = msg.interactive.button_reply.id;
      } else if (msg.text?.body) {
        actionStr = msg.text.body.trim().toUpperCase();
      }

      // Expected format: APPROVE_<jobId>_<token> or user texting "APPROVE <jobId>"
      const parts = actionStr.split('_');
      if (parts.length >= 2) {
        const verb = parts[0];
        const jobId = parts[1];
        const token = parts[2] || '';
        if (['APPROVE', 'REJECT', 'REGENERATE'].includes(verb)) {
          const decision = verb === 'APPROVE' ? 'APPROVED' : verb === 'REJECT' ? 'REJECTED' : 'REGENERATE';
          const job = videoJobsStore.find(j => j.id === jobId);
          if (job && (!token || job.whatsappReview.signedApprovalToken === token)) {
            job.whatsappReview.decision = decision;
            job.whatsappReview.decisionTimestamp = new Date().toISOString();
            job.whatsappReview.reviewerName = `WhatsApp Interactive (${msg.from || 'Mobile'})`;
            job.whatsappReview.status = decision === 'APPROVED' ? 'approved' : decision === 'REJECTED' ? 'rejected' : 'regenerated';
            job.status = decision === 'APPROVED' ? 'POST_SCHEDULED' : decision === 'REJECTED' ? 'REJECTED' : 'REGENERATION_QUEUED';
            job.updatedAt = new Date().toISOString();

            auditLogsStore.unshift({
              id: `log_${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: `WHATSAPP_WEBHOOK_DECISION_${decision}`,
              actor: 'Meta Inbound Webhook',
              details: `Recorded decision ${decision} for job ${job.id} from user ${msg.from}`,
              severity: 'info',
              targetType: 'whatsapp',
              targetId: job.id,
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Error parsing inbound WhatsApp webhook:', err?.message);
  }

  res.status(200).json({ status: 'received' });
});

// 6. Facebook Reels Publishing Engine (Meta Graph API)
app.post('/api/facebook/publish-now', (req, res) => {
  const { jobId } = req.body;
  const job = videoJobsStore.find(j => j.id === jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (budgetStore.emergencyStopActive) {
    return res.status(403).json({ error: 'EMERGENCY_STOP_ACTIVE: Cannot publish while emergency stop is active.' });
  }

  // Safety constraint: Never publish without explicit approval record
  if (job.whatsappReview.decision !== 'APPROVED') {
    return res.status(403).json({
      error: 'APPROVAL_REQUIRED: Video has not received explicit WhatsApp or admin approval. Publishing is strictly blocked.',
      currentDecision: job.whatsappReview.decision || 'PENDING',
    });
  }

  if (!job.whatsappReview.decisionTimestamp) {
    return res.status(403).json({
      error: 'INVALID_APPROVAL_RECORD: Missing verified timestamp on approval record.',
    });
  }

  const targetPage = pagesStore.find(p => p.id === job.targetPageId) || pagesStore[0];

  // Daily limit check
  if (targetPage.postsPublishedToday >= targetPage.dailyLimit) {
    return res.status(429).json({
      error: `DAILY_LIMIT_REACHED: Page "${targetPage.name}" has already reached its daily limit of ${targetPage.dailyLimit} posts.`,
    });
  }

  // Execute Reel upload sequence
  const reelId = `reel_fb_${Date.now()}`;
  job.status = 'PUBLISHED';
  job.progressPercent = 100;
  job.publishResult = {
    facebookReelId: reelId,
    facebookPostUrl: `https://facebook.com/reel/${Date.now()}`,
    publishedAt: new Date().toISOString(),
    viewsCount: 1,
    reachCount: 1,
  };
  job.updatedAt = new Date().toISOString();

  targetPage.reelsPublishedTotal += 1;
  targetPage.postsPublishedToday += 1;

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'FACEBOOK_REEL_PUBLISHED',
    actor: 'AutoReels Meta Publishing Worker',
    details: `Published Reel to "${targetPage.name}" (Page ID: ${targetPage.pageId}). Reel ID: ${reelId}. Approved by: ${job.whatsappReview.reviewerName} at ${job.whatsappReview.decisionTimestamp}`,
    severity: 'info',
    targetType: 'job',
    targetId: job.id,
  });

  res.json({
    success: true,
    reelId,
    postUrl: job.publishResult.facebookPostUrl,
    page: targetPage.name,
    job,
  });
});

  const targetPage = pagesStore.find(p => p.id === job.targetPageId) || pagesStore[0];

  // Daily limit check
  if (targetPage.postsPublishedToday >= targetPage.dailyLimit) {
    return res.status(429).json({
      error: `DAILY_LIMIT_REACHED: Page "${targetPage.name}" has already reached its daily limit of ${targetPage.dailyLimit} posts.`,
    });
  }

  // Execute Reel upload sequence
  const reelId = `reel_fb_${Date.now()}`;
  job.status = 'PUBLISHED';
  job.progressPercent = 100;
  job.publishResult = {
    facebookReelId: reelId,
    facebookPostUrl: `https://facebook.com/reel/${Date.now()}`,
    publishedAt: new Date().toISOString(),
    viewsCount: 1,
    reachCount: 1,
  };
  job.updatedAt = new Date().toISOString();

  targetPage.reelsPublishedTotal += 1;
  targetPage.postsPublishedToday += 1;

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'FACEBOOK_REEL_PUBLISHED',
    actor: 'AutoReels Meta Publishing Worker',
    details: `Published Reel to "${targetPage.name}" (Page ID: ${targetPage.pageId}). Reel ID: ${reelId}. Idempotency Key: ${job.idempotencyKey}`,
    severity: 'info',
    targetType: 'job',
    targetId: job.id,
  });

  res.json({
    success: true,
    reelId,
    postUrl: job.publishResult.facebookPostUrl,
    page: targetPage.name,
    job,
  });
});

// 7. Retry Failed Job (Idempotent recovery)
app.post('/api/jobs/:id/retry', (req, res) => {
  const { id } = req.params;
  const job = videoJobsStore.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.retryCount >= job.maxRetries) {
    return res.status(400).json({ error: `MAX_RETRIES_EXCEEDED: Job has reached maximum retry attempts (${job.maxRetries}).` });
  }

  job.retryCount += 1;
  job.status = 'AI_VIDEO_JOB_QUEUED';
  job.progressPercent = 0;
  job.errorReason = undefined;
  job.updatedAt = new Date().toISOString();

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'JOB_RETRY_INITIATED',
    actor: 'Admin Console',
    details: `Retrying job ${job.id} (Attempt ${job.retryCount} of ${job.maxRetries})`,
    severity: 'info',
    targetType: 'job',
    targetId: job.id,
  });

  res.json({ success: true, job });
});

// 8. Emergency Stop & Budget Controls
app.post('/api/system/emergency-stop', (req, res) => {
  const { activate } = req.body;
  budgetStore.emergencyStopActive = Boolean(activate);

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: budgetStore.emergencyStopActive ? 'EMERGENCY_STOP_ENGAGED' : 'EMERGENCY_STOP_DISENGAGED',
    actor: 'Security Admin',
    details: budgetStore.emergencyStopActive 
      ? 'CRITICAL: Global emergency stop engaged. All active video generation and Facebook publishing frozen.' 
      : 'Emergency stop disengaged. System resumed normal operation.',
    severity: budgetStore.emergencyStopActive ? 'critical' : 'warning',
    targetType: 'security',
  });

  res.json({ success: true, emergencyStopActive: budgetStore.emergencyStopActive });
});

app.post('/api/system/budget', (req, res) => {
  const { dailyLimitUsd, monthlyLimitUsd, concurrentJobsLimit, lowCostDevMode } = req.body;

  if (dailyLimitUsd !== undefined) budgetStore.dailyLimitUsd = Number(dailyLimitUsd);
  if (monthlyLimitUsd !== undefined) budgetStore.monthlyLimitUsd = Number(monthlyLimitUsd);
  if (concurrentJobsLimit !== undefined) budgetStore.concurrentJobsLimit = Number(concurrentJobsLimit);
  if (lowCostDevMode !== undefined) budgetStore.lowCostDevMode = Boolean(lowCostDevMode);

  auditLogsStore.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'BUDGET_CONFIG_UPDATED',
    actor: 'Billing Admin',
    details: `Updated budget caps: Daily $${budgetStore.dailyLimitUsd}, Monthly $${budgetStore.monthlyLimitUsd}, Dev Mode: ${budgetStore.lowCostDevMode}`,
    severity: 'info',
    targetType: 'system',
  });

  res.json({ success: true, budget: budgetStore });
});

// 9. Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const { limit = '50', severity } = req.query;
  let results = [...auditLogsStore];

  if (severity && severity !== 'all') {
    results = results.filter(l => l.severity === severity);
  }

  const limitNum = parseInt(String(limit), 10) || 50;
  res.json({ total: results.length, logs: results.slice(0, limitNum) });
});

// Vite Middleware for development
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Production static server
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AutoReels Server running on http://0.0.0.0:${PORT}`);
});
