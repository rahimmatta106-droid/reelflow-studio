-- ==============================================================================
-- AutoReels Database Schema: PostgreSQL 16+
-- Multi-Tenant Facebook Pages (up to 100+), Video Jobs, WhatsApp Approvals,
-- Audit Logs, and Scheduling Worker Tables
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated Types
CREATE TYPE job_status_enum AS ENUM (
    'PROMPT_CREATED',
    'AI_VIDEO_JOB_QUEUED',
    'VIDEO_GENERATING',
    'VIDEO_READY',
    'METADATA_GENERATING',
    'METADATA_READY',
    'WHATSAPP_REVIEW_SENT',
    'WAITING_FOR_APPROVAL',
    'REJECTED',
    'REGENERATION_QUEUED',
    'POST_SCHEDULED',
    'FACEBOOK_UPLOAD_STARTED',
    'PUBLISHED',
    'FAILED'
);

CREATE TYPE whatsapp_review_status_enum AS ENUM (
    'pending',
    'delivered',
    'read',
    'approved',
    'rejected',
    'regenerated'
);

CREATE TYPE token_status_enum AS ENUM (
    'active',
    'expiring_soon',
    'expired',
    'revoked'
);

CREATE TYPE audit_severity_enum AS ENUM (
    'info',
    'warning',
    'critical'
);

-- 3. Users and Authentication (Admins & Reviewers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'admin', 'content_manager', 'reviewer'
    whatsapp_phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Facebook Pages (Supports up to 100+ Authorized Pages)
CREATE TABLE facebook_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id VARCHAR(100) UNIQUE NOT NULL, -- Meta Graph API Page ID
    name VARCHAR(255) NOT NULL,
    category VARCHAR(150),
    niche VARCHAR(80) NOT NULL,
    followers_count INTEGER NOT NULL DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Encrypted Page Access Token
    encrypted_page_access_token TEXT NOT NULL,
    token_status token_status_enum NOT NULL DEFAULT 'active',
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Scheduling & Automation Rules
    timezone VARCHAR(80) NOT NULL DEFAULT 'America/New_York',
    posting_frequency_hours INTEGER NOT NULL DEFAULT 6,
    daily_limit INTEGER NOT NULL DEFAULT 3,
    posts_published_today INTEGER NOT NULL DEFAULT 0,
    last_published_at TIMESTAMP WITH TIME ZONE,
    
    -- Prompt & Tag Customizations
    custom_prompt_rules TEXT,
    default_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Performance Tracking
    reels_published_total INTEGER NOT NULL DEFAULT 0,
    avg_reels_views INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facebook_pages_niche ON facebook_pages(niche);
CREATE INDEX idx_facebook_pages_is_enabled ON facebook_pages(is_enabled);

-- 5. AI Video Generation Jobs & Pipeline
CREATE TABLE video_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    target_page_id UUID NOT NULL REFERENCES facebook_pages(id) ON DELETE CASCADE,
    
    -- Video Prompt Specifications
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    aspect_ratio VARCHAR(10) NOT NULL DEFAULT '9:16',
    duration_seconds INTEGER NOT NULL DEFAULT 15,
    resolution VARCHAR(20) NOT NULL DEFAULT '1080p',
    model_provider VARCHAR(50) NOT NULL DEFAULT 'Google Veo-2', -- 'Google Veo-2', 'Google Flow / Imagen Video'
    
    -- Asset Storage Paths (Private S3/GCS bucket)
    video_storage_path TEXT,
    video_cdn_url TEXT,
    thumbnail_storage_path TEXT,
    thumbnail_cdn_url TEXT,
    
    -- State Machine
    status job_status_enum NOT NULL DEFAULT 'PROMPT_CREATED',
    progress_percent SMALLINT NOT NULL DEFAULT 0,
    error_reason TEXT,
    retry_count SMALLINT NOT NULL DEFAULT 0,
    max_retries SMALLINT NOT NULL DEFAULT 3,
    
    -- Generated Metadata (Gemini 3.8 Flash)
    generated_title VARCHAR(255),
    generated_caption TEXT,
    generated_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    alternative_titles TEXT[] DEFAULT ARRAY[]::TEXT[],
    tone VARCHAR(80),
    
    -- Cost Metering
    estimated_cost_usd NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
    actual_cost_usd NUMERIC(6, 4) NOT NULL DEFAULT 0.0000,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_video_jobs_status ON video_jobs(status);
CREATE INDEX idx_video_jobs_target_page ON video_jobs(target_page_id);
CREATE INDEX idx_video_jobs_created_at ON video_jobs(created_at DESC);

-- 6. WhatsApp Review & Explicit Approval Audit Records
CREATE TABLE whatsapp_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_job_id UUID UNIQUE NOT NULL REFERENCES video_jobs(id) ON DELETE CASCADE,
    
    -- WhatsApp Cloud API Details
    recipient_phone VARCHAR(30) NOT NULL,
    whatsapp_message_id VARCHAR(150),
    sent_at TIMESTAMP WITH TIME ZONE,
    review_status whatsapp_review_status_enum NOT NULL DEFAULT 'pending',
    
    -- Cryptographic Signature to Prevent Replay Attacks
    signed_approval_token VARCHAR(255) NOT NULL,
    approval_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Explicit Review Record (NEVER publish without this populated)
    decision VARCHAR(20), -- 'APPROVED', 'REJECTED', 'REGENERATE'
    decision_timestamp TIMESTAMP WITH TIME ZONE,
    decision_reason TEXT,
    reviewer_identity VARCHAR(150),
    client_ip VARCHAR(64),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_whatsapp_reviews_token ON whatsapp_reviews(signed_approval_token);

-- 7. Scheduling & Meta Publishing Execution Records
CREATE TABLE publishing_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_job_id UUID UNIQUE NOT NULL REFERENCES video_jobs(id) ON DELETE CASCADE,
    target_page_id UUID NOT NULL REFERENCES facebook_pages(id) ON DELETE CASCADE,
    
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(80) NOT NULL DEFAULT 'America/New_York',
    auto_publish_on_approval BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Meta Graph API Publishing Results
    facebook_video_id VARCHAR(100),
    facebook_reel_id VARCHAR(100),
    facebook_post_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Execution Telemetry
    upload_phase VARCHAR(50), -- 'start', 'upload', 'finish', 'published'
    views_count INTEGER DEFAULT 0,
    reach_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publishing_schedules_scheduled_time ON publishing_schedules(scheduled_time);

-- 8. Immutable Security Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(150) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'job', 'page', 'whatsapp', 'security', 'system'
    target_id VARCHAR(100),
    severity audit_severity_enum NOT NULL DEFAULT 'info',
    details TEXT NOT NULL,
    ip_address VARCHAR(64),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 9. Daily & Monthly Budget Caps
CREATE TABLE budget_controls (
    id SERIAL PRIMARY KEY,
    daily_budget_limit_usd NUMERIC(8, 2) NOT NULL DEFAULT 50.00,
    monthly_budget_limit_usd NUMERIC(8, 2) NOT NULL DEFAULT 1000.00,
    current_day_spent_usd NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    current_month_spent_usd NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    concurrent_generation_limit SMALLINT NOT NULL DEFAULT 5,
    emergency_stop_active BOOLEAN NOT NULL DEFAULT FALSE,
    low_cost_dev_mode BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO budget_controls (id) VALUES (1) ON CONFLICT DO NOTHING;
