// ============================================
// User & Organization Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  title?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified?: Date;
  lastSignIn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  type: OrganizationType;
  status: OrgStatus;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrganizationType {
  STARTUP = 'startup',
  VC_FIRM = 'vc_firm',
  ANGEL_GROUP = 'angel_group',
  ACCELERATOR = 'accelerator',
}

export enum OrgStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  INACTIVE = 'inactive',
}

// ============================================
// Investor Types
// ============================================

export interface Investor {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  title?: string;
  bio?: string;
  avatar?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  geography?: InvestorGeography;
  sectors: string[];
  stages: string[];
  checkSizeMin?: number;
  checkSizeMax?: number;
  investmentThesis?: string;
  leadInvestor: boolean;
  status: InvestorStatus;
  tags: string[];
  customFields: Record<string, any>;
  lastEngagementAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestorGeography {
  countries?: string[];
  states?: string[];
  cities?: string[];
}

export enum InvestorStatus {
  WARM = 'warm',
  COLD = 'cold',
  INTERESTED = 'interested',
  NOT_INTERESTED = 'not_interested',
  ACTIVE = 'active',
}

export interface InvestorSearchFilters {
  sectors?: string[];
  stages?: string[];
  geography?: string[];
  checkSizeMin?: number;
  checkSizeMax?: number;
  leadInvestor?: boolean;
  status?: InvestorStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// Startup Types
// ============================================

export interface Startup {
  id: string;
  organizationId: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  currentStage?: StartupStage;
  revenue?: number;
  mrr?: number;
  users?: number;
  traction?: string;
  founderIds: string[];
  teamSize?: number;
  videoPitch?: string;
  visibility: StartupVisibility;
  targetRound?: number;
  targetAmount?: number;
  raisedToDate?: number;
  customFields: Record<string, any>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum StartupStage {
  IDEA = 'idea',
  MVP = 'mvp',
  SEED = 'seed',
  SERIES_A = 'series_a',
  SERIES_B = 'series_b',
  SERIES_C = 'series_c',
  GROWTH = 'growth',
  LATE_STAGE = 'late_stage',
}

export enum StartupVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ANONYMOUS = 'anonymous',
}

// ============================================
// CRM Types
// ============================================

export interface CrmInvestor {
  id: string;
  startupId: string;
  investorId: string;
  stage: CrmStage;
  relationshipScore: number;
  temperatureScore: number;
  fitScore: number;
  firstContactedAt?: Date;
  lastEngagementAt?: Date;
  nextFollowUpAt?: Date;
  notes?: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum CrmStage {
  TARGET = 'target',
  RESEARCHING = 'researching',
  CONTACTED = 'contacted',
  FOLLOWED_UP = 'followed_up',
  MEETING_SCHEDULED = 'meeting_scheduled',
  PARTNER_MEETING = 'partner_meeting',
  DUE_DILIGENCE = 'due_diligence',
  TERM_SHEET = 'term_sheet',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export interface Activity {
  id: string;
  organizationId: string;
  startupId?: string;
  crmInvestorId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  activityDate: Date;
  duration?: number;
  outcome?: string;
  nextSteps?: string;
  createdAt: Date;
}

export enum ActivityType {
  EMAIL_SENT = 'email_sent',
  EMAIL_RECEIVED = 'email_received',
  CALL = 'call',
  MEETING = 'meeting',
  NOTE_ADDED = 'note_added',
  STATUS_CHANGED = 'status_changed',
}

// ============================================
// Pitch Deck Types
// ============================================

export interface PitchDeck {
  id: string;
  startupId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  s3Key?: string;
  slideCount?: number;
  version: number;
  shareToken?: string;
  isPublic: boolean;
  status: DeckStatus;
  totalViews: number;
  uniqueViewers: number;
  averageTimeSpent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum DeckStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface DeckView {
  id: string;
  deckId: string;
  investorId?: string;
  viewerEmail?: string;
  viewDuration?: number;
  slidesViewed: number[];
  currentSlide?: number;
  country?: string;
  city?: string;
  deviceType?: string;
  viewedAt: Date;
}

// ============================================
// Email & Campaign Types
// ============================================

export interface EmailCampaign {
  id: string;
  startupId: string;
  name: string;
  description?: string;
  subjectLine?: string;
  emailBody?: string;
  status: CampaignStatus;
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  openRate?: number;
  clickRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
}

export interface Email {
  id: string;
  campaignId?: string;
  to: string;
  subject?: string;
  status: EmailStatus;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  createdAt: Date;
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  BOUNCED = 'bounced',
  UNSUBSCRIBED = 'unsubscribed',
}

// ============================================
// Document Types
// ============================================

export interface Document {
  id: string;
  startupId: string;
  name: string;
  description?: string;
  type?: DocumentType;
  fileUrl?: string;
  s3Key?: string;
  accessLevel: AccessLevel;
  allowedInvestorIds: string[];
  watermarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  CAP_TABLE = 'cap_table',
  FINANCIAL_MODEL = 'financial_model',
  LEGAL = 'legal',
  PITCH = 'pitch',
  KPI = 'kpi',
  ROADMAP = 'roadmap',
  BOARD_MATERIALS = 'board_materials',
}

export enum AccessLevel {
  PRIVATE = 'private',
  TEAM = 'team',
  INVESTORS = 'investors',
}

// ============================================
// AI & Analytics Types
// ============================================

export interface AiConversation {
  id: string;
  organizationId: string;
  userId: string;
  startupId?: string;
  title?: string;
  messages: AiMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AnalyticsEvent {
  id: string;
  organizationId: string;
  userId?: string;
  eventName: string;
  eventData: Record<string, any>;
  properties: Record<string, any>;
  createdAt: Date;
}

// ============================================
// API Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  type: 'Bearer';
}

// ============================================
// Notification Types
// ============================================

export enum NotificationType {
  INVESTOR_VIEWED_DECK = 'investor_viewed_deck',
  INVESTOR_REPLIED = 'investor_replied',
  MEETING_SCHEDULED = 'meeting_scheduled',
  CAMPAIGN_SENT = 'campaign_sent',
  COMMENT_MENTIONED = 'comment_mentioned',
  TASK_ASSIGNED = 'task_assigned',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SLACK = 'slack',
  SMS = 'sms',
}

// ============================================
// Search Types
// ============================================

export interface SearchResult<T> {
  id: string;
  type: string;
  title: string;
  description?: string;
  data: T;
  score: number;
}

export interface SearchOptions {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: string;
}

// ============================================
// Workflow Types
// ============================================

export enum WorkflowTrigger {
  INVESTOR_VIEWED_DECK = 'investor_viewed_deck',
  INVESTOR_REPLIED = 'investor_replied',
  MEETING_SCHEDULED = 'meeting_scheduled',
  STATUS_CHANGED = 'status_changed',
  EMAIL_OPENED = 'email_opened',
}

export enum WorkflowAction {
  SEND_EMAIL = 'send_email',
  CREATE_TASK = 'create_task',
  NOTIFY_TEAM = 'notify_team',
  MOVE_STAGE = 'move_stage',
  UPDATE_FIELD = 'update_field',
}
