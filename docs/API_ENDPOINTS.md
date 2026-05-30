# VentureFlow AI - Complete API Endpoints Reference

## API Overview

**Base URL**: `https://api.ventureflow.io/api/v1`
**Authentication**: Bearer Token (JWT)
**Response Format**: JSON
**Rate Limit**: 1000 requests/hour per API key

---

## Authentication Endpoints

### POST /auth/signup
Register a new user account.

```bash
curl -X POST https://api.ventureflow.io/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "organizationName": "My Company"
  }'
```

**Response** (201 Created)
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "org_123",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "createdAt": "2024-06-15T10:30:00Z"
}
```

### POST /auth/signin
Sign in with email and password.

```bash
curl -X POST https://api.ventureflow.io/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response** (200 OK)
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### POST /auth/magic-link
Request a magic link for passwordless authentication.

```bash
curl -X POST https://api.ventureflow.io/api/v1/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response** (200 OK)
```json
{
  "message": "Magic link sent to email",
  "expiresIn": 3600
}
```

### POST /auth/refresh
Refresh access token using refresh token.

```bash
curl -X POST https://api.ventureflow.io/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGc..."}'
```

**Response** (200 OK)
```json
{
  "accessToken": "eyJhbGc..."
}
```

### POST /auth/logout
Invalidate current session.

```bash
curl -X POST https://api.ventureflow.io/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (204 No Content)

### POST /auth/oauth/:provider/callback
OAuth provider callback (Google, Microsoft, LinkedIn, GitHub).

```bash
curl -X POST https://api.ventureflow.io/api/v1/auth/oauth/google/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "authorization_code", "redirectUri": "https://app.ventureflow.io/callback"}'
```

---

## Investor Database Endpoints

### GET /investors
List all investors with filtering and pagination.

```bash
curl "https://api.ventureflow.io/api/v1/investors?page=1&pageSize=20&sector=AI&stage=SeriesA" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)
- `sector`: Filter by sector (AI, FinTech, HealthTech, etc.)
- `stage`: Filter by stage (Pre-Seed, Seed, SeriesA, SeriesB, etc.)
- `geography`: Filter by country/region
- `minCheckSize`: Minimum investment amount
- `maxCheckSize`: Maximum investment amount
- `search`: Full-text search on name/email

**Response** (200 OK)
```json
{
  "data": [
    {
      "id": "inv_123",
      "firstName": "Sarah",
      "lastName": "Chen",
      "title": "Partner",
      "firm": "Accel Partners",
      "email": "sarah@accel.com",
      "sectors": ["AI", "SaaS"],
      "stages": ["SeriesA", "SeriesB"],
      "typicalCheckSize": 500000,
      "portfolioCompanies": 12,
      "createdAt": "2024-06-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 245,
    "pages": 13
  }
}
```

### POST /investors
Create a new investor record.

```bash
curl -X POST https://api.ventureflow.io/api/v1/investors \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Chen",
    "email": "sarah@accel.com",
    "title": "Partner",
    "firm": "Accel Partners",
    "sectors": ["AI", "SaaS"],
    "stages": ["SeriesA", "SeriesB"],
    "typicalCheckSize": 500000
  }'
```

### GET /investors/:id
Get detailed investor profile.

```bash
curl "https://api.ventureflow.io/api/v1/investors/inv_123" \
  -H "Authorization: Bearer eyJhbGc..."
```

### PUT /investors/:id
Update investor information.

```bash
curl -X PUT https://api.ventureflow.io/api/v1/investors/inv_123 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"sectors": ["AI", "SaaS", "Blockchain"]}'
```

### DELETE /investors/:id
Soft delete investor (marks as deleted, doesn't remove).

```bash
curl -X DELETE https://api.ventureflow.io/api/v1/investors/inv_123 \
  -H "Authorization: Bearer eyJhbGc..."
```

### POST /investors/bulk-import
Import multiple investors from CSV.

```bash
curl -X POST https://api.ventureflow.io/api/v1/investors/bulk-import \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@investors.csv"
```

---

## Startup Management Endpoints

### GET /startups
List all startups.

```bash
curl "https://api.ventureflow.io/api/v1/startups?page=1&stage=SeriesA&industry=AI" \
  -H "Authorization: Bearer eyJhbGc..."
```

### POST /startups
Create a new startup record.

```bash
curl -X POST https://api.ventureflow.io/api/v1/startups \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Startup Inc",
    "description": "Building AI solutions",
    "industry": "AI",
    "currentStage": "SeriesA",
    "targetAmount": 5000000,
    "raised": 2000000
  }'
```

### GET /startups/:id
Get startup details.

```bash
curl "https://api.ventureflow.io/api/v1/startups/startup_123" \
  -H "Authorization: Bearer eyJhbGc..."
```

### PUT /startups/:id
Update startup information.

```bash
curl -X PUT https://api.ventureflow.io/api/v1/startups/startup_123 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"raised": 3000000}'
```

---

## CRM Pipeline Endpoints

### GET /crm/pipeline
Get CRM pipeline for a startup.

```bash
curl "https://api.ventureflow.io/api/v1/crm/pipeline?startupId=startup_123" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (200 OK)
```json
{
  "stages": [
    {
      "stage": "target",
      "count": 45,
      "investors": [...]
    },
    {
      "stage": "contacted",
      "count": 12,
      "investors": [...]
    },
    {
      "stage": "meeting",
      "count": 5,
      "investors": [...]
    },
    {
      "stage": "interested",
      "count": 3,
      "investors": [...]
    },
    {
      "stage": "term_sheet",
      "count": 1,
      "investors": [...]
    },
    {
      "stage": "closed",
      "count": 0,
      "investors": [...]
    }
  ]
}
```

### POST /crm/investors/:investorId/stage
Move investor to a stage in the pipeline.

```bash
curl -X POST https://api.ventureflow.io/api/v1/crm/investors/inv_123/stage \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "startupId": "startup_123",
    "stage": "meeting",
    "notes": "Scheduled for Tuesday 10am"
  }'
```

### POST /crm/investors/:investorId/score
Update investor relationship score.

```bash
curl -X POST https://api.ventureflow.io/api/v1/crm/investors/inv_123/score \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "startupId": "startup_123",
    "scoreOverall": 85,
    "scoreFit": 90,
    "scoreEngagement": 70,
    "scoreReadiness": 85
  }'
```

---

## Pitch Deck Endpoints

### POST /decks
Upload a new pitch deck.

```bash
curl -X POST https://api.ventureflow.io/api/v1/decks \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@pitch_deck.pdf" \
  -F "startupId=startup_123" \
  -F "title=Pitch Deck Q2 2024"
```

### GET /decks
List all pitch decks.

```bash
curl "https://api.ventureflow.io/api/v1/decks?startupId=startup_123" \
  -H "Authorization: Bearer eyJhbGc..."
```

### GET /decks/:id
Get deck details.

```bash
curl "https://api.ventureflow.io/api/v1/decks/deck_123" \
  -H "Authorization: Bearer eyJhbGc..."
```

### POST /decks/:id/share
Generate a shareable link.

```bash
curl -X POST https://api.ventureflow.io/api/v1/decks/deck_123/share \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"expiresInDays": 30}'
```

**Response** (201 Created)
```json
{
  "shareToken": "share_abc123xyz",
  "shareUrl": "https://ventureflow.io/deck/share_abc123xyz",
  "expiresAt": "2024-07-15T10:30:00Z"
}
```

### GET /deck/:token/viewer
Public deck viewer (no authentication).

```bash
curl "https://api.ventureflow.io/api/v1/deck/share_abc123xyz/viewer?email=investor@example.com&trackView=true"
```

---

## Email Campaign Endpoints

### POST /campaigns
Create an email campaign.

```bash
curl -X POST https://api.ventureflow.io/api/v1/campaigns \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Series A Outreach",
    "subject": "Introducing [Company Name]",
    "template": "fundraising_intro",
    "recipientIds": ["inv_123", "inv_456"]
  }'
```

### GET /campaigns
List all campaigns.

```bash
curl "https://api.ventureflow.io/api/v1/campaigns" \
  -H "Authorization: Bearer eyJhbGc..."
```

### POST /campaigns/:id/send
Send campaign emails.

```bash
curl -X POST https://api.ventureflow.io/api/v1/campaigns/campaign_123/send \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## AI Features Endpoints

### POST /ai/conversations
Start an AI conversation.

```bash
curl -X POST https://api.ventureflow.io/api/v1/ai/conversations \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"startupId": "startup_123"}'
```

### POST /ai/conversations/:conversationId/messages
Send message to AI copilot.

```bash
curl -X POST https://api.ventureflow.io/api/v1/ai/conversations/conv_123/messages \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"message": "How should I approach Series A investors?"}'
```

### GET /matching/investors/startup/:startupId
Get AI-matched investors.

```bash
curl "https://api.ventureflow.io/api/v1/matching/investors/startup/startup_123" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (200 OK)
```json
{
  "startupId": "startup_123",
  "matches": [
    {
      "investorId": "inv_456",
      "name": "Sarah Chen",
      "firm": "Accel Partners",
      "matchScore": 92,
      "sectors": ["AI", "SaaS"],
      "reason": "Invested in 3 AI companies, focuses on SaaS"
    }
  ]
}
```

### GET /pitch-analyzer/decks/:deckId
Analyze pitch deck.

```bash
curl "https://api.ventureflow.io/api/v1/pitch-analyzer/decks/deck_123" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Startup Profiles (Public) Endpoints

### GET /startup-profiles/public
List public startup profiles.

```bash
curl "https://api.ventureflow.io/api/v1/startup-profiles/public?page=1&industry=AI&stage=SeriesA"
```

### GET /startup-profiles/public/:startupId
Get public startup profile (no auth required).

```bash
curl "https://api.ventureflow.io/api/v1/startup-profiles/public/startup_123"
```

### GET /startup-profiles/public/search
Search public profiles.

```bash
curl "https://api.ventureflow.io/api/v1/startup-profiles/public/search?q=AI"
```

---

## Investor Portal Endpoints

### GET /investor-portal/:investorId/dashboard
Get investor dashboard.

```bash
curl "https://api.ventureflow.io/api/v1/investor-portal/inv_123/dashboard"
```

### GET /investor-portal/:investorId/recommendations
Get recommended startups for investor.

```bash
curl "https://api.ventureflow.io/api/v1/investor-portal/inv_123/recommendations"
```

### POST /investor-portal/:investorId/watchlist/:startupId
Add startup to watchlist.

```bash
curl -X POST https://api.ventureflow.io/api/v1/investor-portal/inv_123/watchlist/startup_123 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email",
    "details": {
      "validation": ["email is required"]
    }
  },
  "statusCode": 400,
  "timestamp": "2024-06-15T10:30:00Z"
}
```

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Rate Limiting

- **Standard**: 1000 requests/hour per API key
- **Premium**: 10,000 requests/hour
- **Enterprise**: Unlimited

**Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1687351800
```

---

## Pagination

All list endpoints support pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 245,
    "pages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## API Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2024-06-15 | Initial API |
| v1.1 | 2024-06-20 | Added AI endpoints |
| v1.2 | 2024-07-01 | Added public profiles |

---

**Last Updated**: 2024-07-01
**Total Endpoints**: 100+
**Authentication**: Required (except public endpoints)
