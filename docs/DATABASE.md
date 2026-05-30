# VentureFlow AI - Database Schema Design

## Overview

PostgreSQL is the primary database for VentureFlow AI. The schema is designed for multi-tenancy, audit trails, event sourcing, and complex analytical queries.

## Core Principles

1. **Multi-Tenancy** - Organization-based isolation with RLS
2. **Soft Deletes** - All deletes use `deletedAt` timestamps
3. **Audit Trails** - All changes tracked in audit logs
4. **Timestamps** - Created/Updated timestamps on all entities
5. **Relationships** - Clear foreign key relationships
6. **Indexes** - Optimized for common queries
7. **JSONB** - For flexible schema attributes
8. **Vector Embeddings** - pgvector for AI features

## Entity Relationship Diagram

```
┌─────────────────┐
│   Organization  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬─────────────┐
    │         │          │             │
┌───▼──────┐ ┌▼────────┐ │  ┌────────┐ │
│  Team    │ │User     │ │  │Investor││
└────┬─────┘ └─────────┘ │  │Database││
     │                   │  └────────┘│
┌────▼────────────────────────────────┴──────┐
│              Startup Domain                  │
│  ┌────────────┬────────────┬──────────────┐ │
│  │ Startup    │ CRM        │ Pitch Deck   │ │
│  │ Profile    │ Investor   │ Tracking     │ │
│  └────────────┴────────────┴──────────────┘ │
└─────────────────────────────────────────────┘
     │                │              │
┌────▼──────────┬─────▼──────┬──────▼─────┐
│ Activities    │ Notes      │ Documents  │
│ Timeline      │ Comments   │ Data Room  │
└───────────────┴────────────┴────────────┘
     │                │              │
┌────▼──────────┬─────▼──────┬──────▼─────┐
│ Notifications │ Tasks      │ Analytics  │
│ Events        │ Workflows  │ Metrics    │
└───────────────┴────────────┴────────────┘
```

## Schema Definition

### Identity & Access Management

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255),
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  avatar VARCHAR(500),
  bio TEXT,
  title VARCHAR(100),
  socialLinks JSONB DEFAULT '{}',
  
  -- Authentication
  emailVerified TIMESTAMP,
  lastSignIn TIMESTAMP,
  totpEnabled BOOLEAN DEFAULT false,
  totpSecret VARCHAR(255),
  
  -- Settings
  preferredLanguage VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  settings JSONB DEFAULT '{}',
  
  -- Organization & Roles
  defaultOrganizationId UUID,
  role VARCHAR(50) DEFAULT 'user',
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (defaultOrganizationId) REFERENCES organizations(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deletedAt ON users(deletedAt);
```

#### organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  website VARCHAR(255),
  
  -- Organization type
  type VARCHAR(50) NOT NULL, -- 'startup', 'vc_firm', 'angel_group', 'accelerator'
  
  -- Settings
  features JSONB DEFAULT '{}', -- Enabled features
  settings JSONB DEFAULT '{}', -- Organization-specific settings
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  subscriptionTier VARCHAR(50) DEFAULT 'free',
  stripeCustomerId VARCHAR(255),
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_type ON organizations(type);
```

#### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar VARCHAR(500),
  
  -- Permissions
  permissions JSONB DEFAULT '{}',
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  UNIQUE(organizationId, name)
);

CREATE INDEX idx_teams_organizationId ON teams(organizationId);
```

#### organization_members
```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  userId UUID NOT NULL,
  teamId UUID,
  
  -- Role and permissions
  role VARCHAR(50) NOT NULL, -- 'owner', 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{}', -- Custom permissions
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'invited', 'inactive'
  invitedAt TIMESTAMP,
  acceptedAt TIMESTAMP,
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (teamId) REFERENCES teams(id),
  UNIQUE(organizationId, userId)
);

CREATE INDEX idx_organization_members_userId ON organization_members(userId);
CREATE INDEX idx_organization_members_organizationId ON organization_members(organizationId);
```

### Investor Domain

#### investors
```sql
CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  
  -- Profile
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phoneNumber VARCHAR(20),
  title VARCHAR(100),
  firmId UUID,
  
  -- Professional info
  bio TEXT,
  avatar VARCHAR(500),
  linkedinUrl VARCHAR(500),
  twitterUrl VARCHAR(500),
  angellistUrl VARCHAR(500),
  
  -- Investment info
  geography JSONB, -- { countries: ['US', 'IN'], states: ['CA', 'NY'] }
  sectors JSONB DEFAULT '[]', -- ['AI', 'FinTech', 'ClimaTech']
  stages JSONB DEFAULT '[]', -- ['seed', 'series_a', 'series_b']
  checkSizeMin NUMERIC(15, 2),
  checkSizeMax NUMERIC(15, 2),
  investmentThesis TEXT,
  leadInvestor BOOLEAN DEFAULT false,
  
  -- Engagement
  tags JSONB DEFAULT '[]',
  customFields JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active', -- 'warm', 'cold', 'interested', 'not_interested'
  lastEngagementAt TIMESTAMP,
  
  -- Data
  portfolio JSONB DEFAULT '[]', -- Recent portfolio companies
  recentInvestments JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  
  -- Metadata
  source VARCHAR(100), -- 'linkedin_import', 'crunchbase', 'manual', 'api'
  sourceId VARCHAR(255), -- External ID from source
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (firmId) REFERENCES investors(id)
);

CREATE INDEX idx_investors_organizationId ON investors(organizationId);
CREATE INDEX idx_investors_firmId ON investors(firmId);
CREATE INDEX idx_investors_email ON investors(email);
CREATE INDEX idx_investors_status ON investors(status);
CREATE INDEX idx_investors_sectors ON investors USING GIN(sectors);
CREATE INDEX idx_investors_geography ON investors USING GIN(geography);
```

#### investor_embeddings
```sql
CREATE TABLE investor_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investorId UUID NOT NULL UNIQUE,
  
  -- Embeddings for semantic search
  profileEmbedding vector(1536), -- OpenAI embedding of investor profile
  thesisEmbedding vector(1536),
  portfolioEmbedding vector(1536),
  
  -- Metadata
  embeddingModel VARCHAR(100) DEFAULT 'text-embedding-3-small',
  embeddedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (investorId) REFERENCES investors(id) ON DELETE CASCADE
);

CREATE INDEX idx_investor_embeddings_profile ON investor_embeddings USING HNSW(profileEmbedding);
CREATE INDEX idx_investor_embeddings_thesis ON investor_embeddings USING HNSW(thesisEmbedding);
```

### Startup Domain

#### startups
```sql
CREATE TABLE startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  
  -- Profile
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  logo VARCHAR(500),
  website VARCHAR(255),
  
  -- Business info
  industry VARCHAR(100),
  subIndustry VARCHAR(100),
  description TEXT,
  elevator_pitch TEXT,
  
  -- Traction
  revenue NUMERIC(15, 2),
  mrr NUMERIC(15, 2),
  users NUMERIC(15, 0),
  growth_rate NUMERIC(5, 2), -- Percentage
  
  -- Fundraising
  currentStage VARCHAR(50), -- 'idea', 'mvp', 'seed', 'series_a', etc.
  targetRound VARCHAR(50),
  targetAmount NUMERIC(15, 2),
  raisedToDate NUMERIC(15, 2),
  
  -- Team
  founderIds JSONB DEFAULT '[]', -- Array of user IDs
  teamSize NUMERIC(3, 0),
  
  -- Media
  videoPitch VARCHAR(500),
  pitchDeckUrl VARCHAR(500),
  
  -- Privacy
  visibility VARCHAR(50) DEFAULT 'private', -- 'public', 'private', 'anonymous'
  
  -- Metadata
  customFields JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE INDEX idx_startups_organizationId ON startups(organizationId);
CREATE INDEX idx_startups_slug ON startups(slug);
CREATE INDEX idx_startups_visibility ON startups(visibility);
```

#### startup_embeddings
```sql
CREATE TABLE startup_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startupId UUID NOT NULL UNIQUE,
  
  profileEmbedding vector(1536),
  pitchEmbedding vector(1536),
  
  embeddingModel VARCHAR(100) DEFAULT 'text-embedding-3-small',
  embeddedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (startupId) REFERENCES startups(id) ON DELETE CASCADE
);

CREATE INDEX idx_startup_embeddings_profile ON startup_embeddings USING HNSW(profileEmbedding);
```

### CRM Domain

#### crm_investors (Startup's CRM records for investors)
```sql
CREATE TABLE crm_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  startupId UUID NOT NULL,
  investorId UUID NOT NULL,
  
  -- Pipeline stage
  stage VARCHAR(50) NOT NULL DEFAULT 'target',
  -- Stages: target, researching, contacted, followed_up, meeting_scheduled,
  -- partner_meeting, due_diligence, term_sheet, closed, rejected
  
  -- Scoring
  relationshipScore NUMERIC(3, 1) DEFAULT 0, -- 0-10
  temperatureScore NUMERIC(3, 1) DEFAULT 0, -- 0-10 (how warm)
  fitScore NUMERIC(3, 1) DEFAULT 0, -- 0-10 (how good a fit)
  
  -- Engagement
  firstContactedAt TIMESTAMP,
  lastEngagementAt TIMESTAMP,
  nextFollowUpAt TIMESTAMP,
  
  -- Data
  notes TEXT,
  customFields JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  
  -- AI
  aiSummary TEXT,
  aiRecommendations JSONB DEFAULT '{}',
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (startupId) REFERENCES startups(id),
  FOREIGN KEY (investorId) REFERENCES investors(id),
  UNIQUE(startupId, investorId)
);

CREATE INDEX idx_crm_investors_stage ON crm_investors(stage);
CREATE INDEX idx_crm_investors_startupId ON crm_investors(startupId);
CREATE INDEX idx_crm_investors_investorId ON crm_investors(investorId);
CREATE INDEX idx_crm_investors_relationshipScore ON crm_investors(relationshipScore DESC);
```

#### activities
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  startupId UUID,
  crmInvestorId UUID,
  
  type VARCHAR(50) NOT NULL,
  -- Types: 'email_sent', 'email_received', 'call', 'meeting', 'note_added', 'status_changed'
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Participants
  initiatedBy UUID NOT NULL,
  participants JSONB DEFAULT '[]', -- Array of user/investor objects
  
  -- Timeline
  activityDate TIMESTAMP NOT NULL,
  duration NUMERIC(5, 0), -- Minutes
  
  -- Results
  outcome VARCHAR(100),
  nextSteps TEXT,
  
  -- Attachments
  attachmentUrls JSONB DEFAULT '[]',
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (startupId) REFERENCES startups(id),
  FOREIGN KEY (crmInvestorId) REFERENCES crm_investors(id),
  FOREIGN KEY (initiatedBy) REFERENCES users(id)
);

CREATE INDEX idx_activities_crmInvestorId ON activities(crmInvestorId);
CREATE INDEX idx_activities_startupId ON activities(startupId);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_date ON activities(activityDate DESC);
```

#### notes
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  crmInvestorId UUID,
  startupId UUID,
  
  content TEXT NOT NULL,
  contentHtml TEXT,
  
  createdBy UUID NOT NULL,
  
  -- Metadata
  tags JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]', -- Mentioned user IDs
  attachments JSONB DEFAULT '[]',
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (crmInvestorId) REFERENCES crm_investors(id),
  FOREIGN KEY (startupId) REFERENCES startups(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE INDEX idx_notes_crmInvestorId ON notes(crmInvestorId);
CREATE INDEX idx_notes_startupId ON notes(startupId);
```

### Pitch Deck Tracking

#### pitch_decks
```sql
CREATE TABLE pitch_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  startupId UUID NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- File storage
  originalFileName VARCHAR(255),
  fileUrl VARCHAR(500),
  fileSize NUMERIC(15, 0),
  fileType VARCHAR(20), -- 'pdf', 'pptx'
  s3Key VARCHAR(500),
  
  -- Versions
  version NUMERIC(3, 0) DEFAULT 1,
  parentDeckId UUID,
  
  -- Sharing
  shareToken VARCHAR(255) UNIQUE,
  shareTokenExpiry TIMESTAMP,
  isPublic BOOLEAN DEFAULT false,
  requiresPassword BOOLEAN DEFAULT false,
  passwordHash VARCHAR(255),
  
  -- Analytics
  totalViews NUMERIC(10, 0) DEFAULT 0,
  uniqueViewers NUMERIC(10, 0) DEFAULT 0,
  averageTimeSpent NUMERIC(10, 2), -- Seconds
  
  -- Metadata
  slideCount NUMERIC(3, 0),
  thumbnail VARCHAR(500),
  tags JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (startupId) REFERENCES startups(id),
  FOREIGN KEY (parentDeckId) REFERENCES pitch_decks(id)
);

CREATE INDEX idx_pitch_decks_startupId ON pitch_decks(startupId);
CREATE INDEX idx_pitch_decks_shareToken ON pitch_decks(shareToken);
```

#### deck_views
```sql
CREATE TABLE deck_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deckId UUID NOT NULL,
  investorId UUID,
  viewerEmail VARCHAR(255),
  
  -- Device & location
  userAgent TEXT,
  ipAddress VARCHAR(45),
  country VARCHAR(100),
  city VARCHAR(100),
  deviceType VARCHAR(20),
  
  -- Engagement
  viewDuration NUMERIC(10, 2), -- Seconds
  slidesViewed JSONB DEFAULT '[]', -- Array of slide numbers
  currentSlide NUMERIC(3, 0),
  
  -- Heatmap
  heatmapData JSONB,
  
  viewedAt TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (deckId) REFERENCES pitch_decks(id) ON DELETE CASCADE,
  FOREIGN KEY (investorId) REFERENCES investors(id)
);

CREATE INDEX idx_deck_views_deckId ON deck_views(deckId);
CREATE INDEX idx_deck_views_investorId ON deck_views(investorId);
CREATE INDEX idx_deck_views_viewedAt ON deck_views(viewedAt DESC);
```

### Documents & Data Room

#### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  startupId UUID NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  type VARCHAR(50), -- 'cap_table', 'financial_model', 'legal', 'pitch', etc.
  
  -- File
  fileUrl VARCHAR(500),
  s3Key VARCHAR(500),
  fileSize NUMERIC(15, 0),
  
  -- Access
  accessLevel VARCHAR(50) DEFAULT 'private', -- 'private', 'team', 'investors'
  allowedInvestorIds JSONB DEFAULT '[]',
  
  -- Version
  version NUMERIC(3, 0) DEFAULT 1,
  parentDocumentId UUID,
  
  -- Metadata
  tags JSONB DEFAULT '[]',
  watermarked BOOLEAN DEFAULT false,
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (startupId) REFERENCES startups(id)
);

CREATE INDEX idx_documents_startupId ON documents(startupId);
CREATE INDEX idx_documents_type ON documents(type);
```

### Email & Outreach

#### email_campaigns
```sql
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  startupId UUID NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Template
  subjectLine VARCHAR(255),
  emailBody TEXT,
  emailHtml TEXT,
  
  -- Targeting
  targetInvestorIds JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  
  -- Scheduling
  scheduledFor TIMESTAMP,
  sentAt TIMESTAMP,
  
  -- Personalization
  personalizeFields JSONB DEFAULT '[]',
  
  -- Analytics
  sentCount NUMERIC(10, 0) DEFAULT 0,
  openCount NUMERIC(10, 0) DEFAULT 0,
  clickCount NUMERIC(10, 0) DEFAULT 0,
  replyCount NUMERIC(10, 0) DEFAULT 0,
  
  openRate NUMERIC(5, 2),
  clickRate NUMERIC(5, 2),
  
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sent'
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (startupId) REFERENCES startups(id)
);

CREATE INDEX idx_email_campaigns_startupId ON email_campaigns(startupId);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
```

#### emails
```sql
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaignId UUID,
  organizationId UUID NOT NULL,
  
  to VARCHAR(255) NOT NULL,
  from VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  
  -- Tracking
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  
  -- Analytics
  openCount NUMERIC(5, 0) DEFAULT 0,
  clickCount NUMERIC(5, 0) DEFAULT 0,
  
  links JSONB DEFAULT '[]', -- Tracked links
  
  status VARCHAR(50) DEFAULT 'pending',
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (campaignId) REFERENCES email_campaigns(id),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE INDEX idx_emails_campaignId ON emails(campaignId);
CREATE INDEX idx_emails_status ON emails(status);
```

### AI & Analytics

#### ai_conversations
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  userId UUID NOT NULL,
  startupId UUID,
  
  title VARCHAR(255),
  
  -- Conversation data
  messages JSONB NOT NULL DEFAULT '[]', -- Array of messages
  
  -- Context
  context JSONB DEFAULT '{}',
  
  -- Memory
  summaryKey TEXT,
  keyTakeaways JSONB DEFAULT '[]',
  
  status VARCHAR(50) DEFAULT 'active',
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (startupId) REFERENCES startups(id)
);

CREATE INDEX idx_ai_conversations_userId ON ai_conversations(userId);
CREATE INDEX idx_ai_conversations_startupId ON ai_conversations(startupId);
```

#### analytics_events
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  userId UUID,
  
  eventName VARCHAR(100) NOT NULL,
  eventData JSONB DEFAULT '{}',
  
  -- Properties
  properties JSONB DEFAULT '{}',
  
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX idx_analytics_events_organizationId ON analytics_events(organizationId);
CREATE INDEX idx_analytics_events_eventName ON analytics_events(eventName);
CREATE INDEX idx_analytics_events_createdAt ON analytics_events(createdAt DESC);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  userId UUID NOT NULL,
  
  action VARCHAR(100) NOT NULL,
  entityType VARCHAR(100),
  entityId UUID,
  
  changes JSONB DEFAULT '{}',
  
  ipAddress VARCHAR(45),
  userAgent TEXT,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_organizationId ON audit_logs(organizationId);
CREATE INDEX idx_audit_logs_entityId ON audit_logs(entityId);
CREATE INDEX idx_audit_logs_createdAt ON audit_logs(createdAt DESC);
```

### Notifications

#### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  userId UUID NOT NULL,
  
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  
  relatedEntityType VARCHAR(100),
  relatedEntityId UUID,
  
  channels JSONB DEFAULT '["in_app"]', -- Array of channels
  
  -- Read status
  readAt TIMESTAMP,
  
  -- Delivery
  deliveredAt TIMESTAMP,
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX idx_notifications_userId ON notifications(userId);
CREATE INDEX idx_notifications_createdAt ON notifications(createdAt DESC);
```

### Tasks & Workflows

#### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID NOT NULL,
  createdBy UUID NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Assignment
  assignedTo UUID,
  
  -- Priority & Due Date
  priority VARCHAR(50) DEFAULT 'medium',
  dueDate TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'open',
  
  -- Relations
  relatedEntityType VARCHAR(100),
  relatedEntityId UUID,
  
  deletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP,
  
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (assignedTo) REFERENCES users(id)
);

CREATE INDEX idx_tasks_organizationId ON tasks(organizationId);
CREATE INDEX idx_tasks_assignedTo ON tasks(assignedTo);
CREATE INDEX idx_tasks_status ON tasks(status);
```

## Indexes & Performance

### Query Performance Optimization
```sql
-- Complex queries benefit from composite indexes
CREATE INDEX idx_crm_investor_status_date ON crm_investors(stage, lastEngagementAt DESC);
CREATE INDEX idx_activities_type_date ON activities(type, activityDate DESC);
CREATE INDEX idx_deck_views_deck_date ON deck_views(deckId, viewedAt DESC);
CREATE INDEX idx_emails_campaign_status ON emails(campaignId, status);

-- JSONB queries need special handling
CREATE INDEX idx_investors_sectors_ops ON investors USING gin(sectors jsonb_ops);
CREATE INDEX idx_startups_tags_ops ON startups USING gin(tags jsonb_ops);
```

### Vector Search Indexes
```sql
-- pgvector HNSW indexes for semantic search
CREATE INDEX idx_investor_profiles_embedding ON investor_embeddings 
USING hnsw (profileEmbedding vector_cosine_ops) WITH (m=16, ef_construction=200);

CREATE INDEX idx_startup_profiles_embedding ON startup_embeddings 
USING hnsw (profileEmbedding vector_cosine_ops) WITH (m=16, ef_construction=200);
```

## Multi-Tenancy & Security

### Row Level Security (RLS)
```sql
-- Example RLS policy for startups
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY startup_access ON startups
  USING (
    organizationId IN (
      SELECT organizationId FROM organization_members 
      WHERE userId = current_user_id()
    )
  );

-- Example RLS policy for crm_investors
ALTER TABLE crm_investors ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_access ON crm_investors
  USING (
    organizationId IN (
      SELECT organizationId FROM organization_members 
      WHERE userId = current_user_id()
    )
  );
```

## Migrations

Initial migration includes:
1. All core tables
2. Indexes
3. Foreign keys
4. Constraints
5. Triggers for timestamps
6. RLS policies

Use Prisma migrations for version control.

## Next Steps

1. Generate complete Prisma schema
2. Create migrations
3. Set up replication for analytics
4. Configure backups
5. Performance tuning
6. Query optimization
