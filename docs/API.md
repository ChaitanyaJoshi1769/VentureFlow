# VentureFlow AI - API Design

## Overview

VentureFlow AI provides both REST and GraphQL APIs for accessing platform functionality. The API is designed for performance, scalability, and developer experience.

## API Architecture

### Base URLs

- **Development**: `http://localhost:4000`
- **Staging**: `https://api-staging.ventureflow.io`
- **Production**: `https://api.ventureflow.io`

### API Versions

```
/api/v1/...     # Current stable API
/api/v2/...     # Next generation API (in development)
/graphql        # GraphQL endpoint
/ws             # WebSocket endpoint for real-time updates
```

## Authentication

### JWT Bearer Token

```bash
curl -H "Authorization: Bearer <token>" \
  https://api.ventureflow.io/api/v1/me
```

### OAuth 2.0 Flow

1. Redirect user to `/auth/oauth/:provider`
2. User authenticates with provider
3. Receive authorization code
4. Exchange code for access token
5. Access token returned in response

### API Keys

For server-to-server communication:

```bash
curl -H "X-API-Key: <api_key>" \
  https://api.ventureflow.io/api/v1/investors
```

## REST API Endpoints

### Authentication

```
POST   /api/v1/auth/signup              Register new user
POST   /api/v1/auth/login               Login with email/password
POST   /api/v1/auth/logout              Logout current user
POST   /api/v1/auth/refresh             Refresh access token
POST   /api/v1/auth/forgot-password     Request password reset
POST   /api/v1/auth/reset-password      Reset password with token
POST   /api/v1/auth/verify-email        Verify email address
POST   /api/v1/auth/oauth/:provider     OAuth login
GET    /api/v1/auth/me                  Get current user profile
PUT    /api/v1/auth/me                  Update current user
```

### Users & Organizations

```
GET    /api/v1/users/:id                Get user profile
PUT    /api/v1/users/:id                Update user profile
DELETE /api/v1/users/:id                Delete user account

GET    /api/v1/organizations            List user organizations
POST   /api/v1/organizations            Create organization
GET    /api/v1/organizations/:id        Get organization details
PUT    /api/v1/organizations/:id        Update organization
DELETE /api/v1/organizations/:id        Delete organization

GET    /api/v1/organizations/:id/members    List members
POST   /api/v1/organizations/:id/members    Invite member
DELETE /api/v1/organizations/:id/members/:userId    Remove member
PUT    /api/v1/organizations/:id/members/:userId    Update member role
```

### Investors

```
GET    /api/v1/investors                List investors
POST   /api/v1/investors                Create investor record
GET    /api/v1/investors/:id            Get investor profile
PUT    /api/v1/investors/:id            Update investor
DELETE /api/v1/investors/:id            Delete investor

GET    /api/v1/investors/search         Search investors
POST   /api/v1/investors/import         Import investors from source
GET    /api/v1/investors/:id/portfolio  Get investor portfolio
```

### Startups

```
GET    /api/v1/startups                 List startups
POST   /api/v1/startups                 Create startup profile
GET    /api/v1/startups/:id             Get startup profile
PUT    /api/v1/startups/:id             Update startup profile
DELETE /api/v1/startups/:id             Delete startup profile

GET    /api/v1/startups/:id/crm         Get CRM pipeline
POST   /api/v1/startups/:id/crm         Add investor to pipeline
```

### CRM

```
GET    /api/v1/crm/investors            List all CRM records
GET    /api/v1/crm/investors/:id        Get CRM record
PUT    /api/v1/crm/investors/:id        Update CRM record
DELETE /api/v1/crm/investors/:id        Delete CRM record

GET    /api/v1/crm/investors/filter     Advanced filtering
POST   /api/v1/crm/bulk-update          Bulk update records

GET    /api/v1/activities               List activities
POST   /api/v1/activities               Create activity
GET    /api/v1/activities/:id           Get activity details
PUT    /api/v1/activities/:id           Update activity
DELETE /api/v1/activities/:id           Delete activity

GET    /api/v1/notes                    List notes
POST   /api/v1/notes                    Create note
PUT    /api/v1/notes/:id                Update note
DELETE /api/v1/notes/:id                Delete note
```

### Pitch Decks

```
GET    /api/v1/decks                    List decks
POST   /api/v1/decks                    Upload deck
GET    /api/v1/decks/:id                Get deck details
PUT    /api/v1/decks/:id                Update deck
DELETE /api/v1/decks/:id                Delete deck

GET    /api/v1/decks/:id/views          Get view analytics
POST   /api/v1/decks/:id/share          Create share link
GET    /api/v1/decks/:token/viewer      Public viewer (no auth)

POST   /api/v1/decks/:id/watermark      Apply watermark
```

### Documents

```
GET    /api/v1/documents                List documents
POST   /api/v1/documents                Upload document
GET    /api/v1/documents/:id            Get document
PUT    /api/v1/documents/:id            Update document metadata
DELETE /api/v1/documents/:id            Delete document

GET    /api/v1/documents/:id/download   Download document
POST   /api/v1/documents/:id/share      Share document
```

### Email Campaigns

```
GET    /api/v1/campaigns                List campaigns
POST   /api/v1/campaigns                Create campaign
GET    /api/v1/campaigns/:id            Get campaign
PUT    /api/v1/campaigns/:id            Update campaign
DELETE /api/v1/campaigns/:id            Delete campaign

POST   /api/v1/campaigns/:id/send       Send campaign
POST   /api/v1/campaigns/:id/schedule   Schedule campaign
GET    /api/v1/campaigns/:id/analytics  Get campaign analytics

GET    /api/v1/emails                   List emails
POST   /api/v1/emails/send              Send single email
GET    /api/v1/emails/:id               Get email details
```

### Analytics

```
GET    /api/v1/analytics/dashboard      Get dashboard metrics
GET    /api/v1/analytics/funnel         Get fundraising funnel
GET    /api/v1/analytics/pipeline       Get pipeline analytics
GET    /api/v1/analytics/geography      Get geographic analysis
GET    /api/v1/analytics/custom         Get custom metrics
POST   /api/v1/analytics/export         Export analytics data
```

### Search & Discovery

```
GET    /api/v1/search                   Global search
GET    /api/v1/search/investors         Search investors (semantic + FTS)
GET    /api/v1/search/startups          Search startups
GET    /api/v1/autocomplete             Autocomplete suggestions
```

### AI Services

```
POST   /api/v1/ai/chat                  Chat with AI copilot
GET    /api/v1/ai/conversations         List conversations
POST   /api/v1/ai/analyze-deck          Analyze pitch deck
POST   /api/v1/ai/match-investors       AI investor matching
POST   /api/v1/ai/generate-email        Generate email copy
POST   /api/v1/ai/readiness-score       Calculate founder readiness
```

### Notifications

```
GET    /api/v1/notifications            List notifications
POST   /api/v1/notifications/:id/read   Mark as read
DELETE /api/v1/notifications/:id        Delete notification
PUT    /api/v1/notifications/preferences Update notification settings
```

### Webhooks

```
GET    /api/v1/webhooks                 List webhooks
POST   /api/v1/webhooks                 Create webhook
PUT    /api/v1/webhooks/:id             Update webhook
DELETE /api/v1/webhooks/:id             Delete webhook

GET    /api/v1/webhooks/:id/logs        Get webhook delivery logs
POST   /api/v1/webhooks/:id/retry       Retry webhook delivery
```

## GraphQL API

### Query Examples

```graphql
# Get current user
query {
  me {
    id
    email
    firstName
    lastName
    organizations {
      id
      name
      type
    }
  }
}

# Search investors
query {
  searchInvestors(
    query: "AI investors in San Francisco"
    limit: 20
  ) {
    edges {
      node {
        id
        name
        title
        matchScore
      }
    }
  }
}

# Get startup pipeline
query {
  startup(id: "startup_123") {
    id
    name
    crmInvestors {
      edges {
        node {
          id
          investor {
            name
          }
          stage
          relationshipScore
        }
      }
    }
  }
}
```

### Mutation Examples

```graphql
# Create CRM record
mutation {
  createCrmInvestor(
    input: {
      startupId: "startup_123"
      investorId: "investor_456"
      stage: CONTACTED
    }
  ) {
    crmInvestor {
      id
      stage
    }
  }
}

# Update pipeline stage
mutation {
  updateCrmInvestor(
    input: {
      id: "crm_789"
      stage: MEETING_SCHEDULED
      relationshipScore: 7.5
    }
  ) {
    crmInvestor {
      id
      stage
    }
  }
}
```

### Subscriptions

```graphql
# Real-time CRM updates
subscription {
  crmInvestorUpdated(startupId: "startup_123") {
    id
    stage
    relationshipScore
    updatedAt
  }
}

# Real-time notifications
subscription {
  notificationReceived {
    id
    type
    title
    message
  }
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "investor_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    { "id": "investor_1", "name": "Investor 1" },
    { "id": "investor_2", "name": "Investor 2" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "hasMore": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "INVALID_REQUEST",
  "message": "Email is required",
  "details": {
    "field": "email",
    "constraint": "required"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_REQUEST | 400 | Invalid request parameters |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

### Limits

- **Free Plan**: 100 requests/minute
- **Professional**: 1,000 requests/minute
- **Enterprise**: Custom

### Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705326600
```

## Pagination

### Query Parameters

```
?page=1&pageSize=20&sort=createdAt:desc
```

### Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 500,
    "hasMore": true
  }
}
```

## Webhooks

### Events

```
investor.created
investor.updated
startup.created
crm_investor.created
crm_investor.updated
deck.shared
email.opened
email.clicked
meeting.scheduled
```

### Payload

```json
{
  "event": "investor.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "organizationId": "org_123",
  "data": {
    "id": "investor_456",
    "name": "Jane Smith"
  }
}
```

## SDKs

### JavaScript/TypeScript

```typescript
import { VentureFlowClient } from '@ventureflow/sdk';

const client = new VentureFlowClient({
  apiKey: 'your-api-key',
});

const investors = await client.investors.list({
  sectors: ['AI', 'FinTech'],
  limit: 20,
});
```

### Python

```python
from ventureflow import VentureFlowClient

client = VentureFlowClient(api_key='your-api-key')
investors = client.investors.list(sectors=['AI', 'FinTech'], limit=20)
```

## API Documentation

Full API documentation available at:

- **Development**: http://localhost:4000/api/docs
- **Staging**: https://api-staging.ventureflow.io/api/docs
- **Production**: https://api.ventureflow.io/api/docs

## Best Practices

1. **Use GraphQL** for complex queries with multiple levels
2. **Use REST** for simple CRUD operations
3. **Cache responses** using ETag headers
4. **Implement exponential backoff** for retries
5. **Use webhooks** for real-time events instead of polling
6. **Batch requests** when possible to reduce API calls
7. **Implement proper error handling** and logging

## Security

- **All requests** must use HTTPS
- **API keys** must be kept secret
- **Rate limiting** is enforced per API key
- **CORS** is configured for authorized domains only
- **Signed requests** for sensitive operations
