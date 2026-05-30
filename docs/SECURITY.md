# VentureFlow AI - Security Framework & Compliance

## Executive Summary

VentureFlow AI is built with enterprise-grade security from the ground up. This document outlines our security architecture, compliance frameworks, and operational security practices.

## Table of Contents
1. [Architecture Security](#architecture-security)
2. [Data Security](#data-security)
3. [Access Control](#access-control)
4. [Compliance Frameworks](#compliance-frameworks)
5. [Incident Response](#incident-response)
6. [Security Operations](#security-operations)

---

## Architecture Security

### Network Security

#### VPC Isolation
- All resources deployed in private subnets
- Public subnets contain only NAT Gateways and ALB
- No direct internet access to compute nodes
- Network ACLs restrict traffic

#### Security Groups
```
API → RDS (port 5432)
API → Redis (port 6379)
API → OpenSearch (port 9200)
LB → API (port 3000)
Internet → LB (port 80, 443)
```

#### DDoS Protection
- AWS Shield Standard (automatic)
- AWS WAF rules on ALB
- Rate limiting on API endpoints
- Geographic restrictions (if needed)

### Encryption

#### At Rest
- **RDS**: Encryption with AWS KMS
  - Customer-managed keys
  - Automated key rotation
  - Separate keys per environment

- **Redis**: TLS for encryption
  - AUTH token required
  - Encrypted snapshots

- **OpenSearch**: Encryption at rest
  - AWS-managed encryption
  - Separate encryption per index

- **EBS Volumes**: Encrypted by default
  - gp3 volumes with encryption

#### In Transit
- **TLS 1.3** for all communications
- **Certificate management** via cert-manager
- **mTLS** between microservices (ready)
- **HTTPS only** (redirect HTTP → HTTPS)

---

## Data Security

### Data Classification

```
Level 1 (Public)
├─ Startup names, descriptions
├─ Public pitch decks
└─ General announcements

Level 2 (Internal)
├─ Investor contact information
├─ Company metrics
├─ Communication history
└─ Notes and comments

Level 3 (Sensitive)
├─ Email addresses, phone numbers
├─ Authentication credentials
├─ API keys and tokens
├─ Financial information
└─ Personal information

Level 4 (PII)
├─ Social security numbers
├─ Bank account information
├─ Medical information
└─ Biometric data
```

### Data Handling

#### Retention Policies
```
Public Data: Indefinite
Internal Data: 7 years
Sensitive Data: Encrypted, 3-year retention
PII: 1 year (minimum compliance)
Deleted Data: 30-day soft delete, then permanent
```

#### Backup Strategy
- RDS: Daily automated backups (30-day retention)
- Redis: Persistence enabled with AOF
- Snapshots: Encrypted and tested monthly
- Cross-region: Ready (configure in Terraform)

#### Data Masking
```
GET /api/v1/investors/:id
{
  "id": "inv_123456",
  "name": "John Doe",
  "email": "j***@example.com",    // Masked for non-admin
  "phone": "+1-***-***-****",     // Masked for non-admin
  "title": "Partner"              // Visible
}
```

### Secrets Management

#### Secrets Hierarchy
1. **Kubernetes Secrets** (encrypted at rest)
2. **AWS Systems Manager Parameter Store**
3. **AWS Secrets Manager** (for rotation)
4. **HashiCorp Vault** (future: advanced rotation)

#### Secret Rotation
```
Database passwords: 90 days
API keys: 180 days
JWT secrets: 365 days
OAuth tokens: Per provider (15-30 days)
```

---

## Access Control

### Authentication

#### Multi-Factor Authentication
- Enabled for all admin accounts
- TOTP-based (RFC 6238)
- Backup codes required
- Recovery phone number

#### OAuth 2.0 Integration
- Google Workspace
- Microsoft Entra ID (Azure AD)
- LinkedIn (for investors)
- GitHub (for team)

#### Session Management
- 24-hour expiration
- Sliding window refresh
- Logout invalidates all sessions
- IP address validation optional

### Authorization (RBAC)

#### Roles
```
Admin
├─ All permissions
├─ User management
├─ Organization settings
└─ Audit logs

Manager
├─ Startup management
├─ Investor management
├─ Team management
└─ View analytics

User
├─ View assigned startups
├─ View assigned investors
├─ Create activities/notes
└─ View shared documents

Investor (External)
├─ View public profiles
├─ Request introductions
├─ Rate startups
└─ Download pitch decks
```

#### Permission Matrix
```
Resource    | Admin | Manager | User | Investor
─────────────────────────────────────────────
Startups    | CRUD  | CRUD    | RU   | R
Investors   | CRUD  | CRUD    | R    | -
Documents   | CRUD  | CRUD    | RU   | R
Activities  | CRUD  | CRUD    | CRU  | -
Analytics   | R     | R       | R    | -
Settings    | CRUD  | -       | -    | -
Users       | CRUD  | -       | -    | -
```

### Audit Logging

#### Events Logged
- User login/logout
- Data access (what, who, when)
- Data modification (before/after)
- Permission changes
- Configuration changes
- Failed access attempts
- Export/download actions

#### Audit Trail Storage
```
{
  "timestamp": "2024-06-15T10:30:00Z",
  "userId": "user_123",
  "action": "UPDATE_STARTUP",
  "resourceId": "startup_456",
  "changes": {
    "targetAmount": {
      "before": 1000000,
      "after": 2000000
    }
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "status": "SUCCESS"
}
```

---

## Compliance Frameworks

### SOC2 Type II

#### Trust Service Criteria

**Security (CC)**
- ✅ Asset management
- ✅ Logical access controls
- ✅ Network controls
- ✅ Encryption
- ✅ Change management
- ✅ Vulnerability management

**Availability (A)**
- ✅ Infrastructure redundancy
- ✅ Auto-scaling
- ✅ Disaster recovery
- ✅ Backup and restoration

**Processing Integrity (PI)**
- ✅ Data validation
- ✅ Error handling
- ✅ Completeness checks
- ✅ Audit logging

**Confidentiality (C)**
- ✅ Access restrictions
- ✅ Encryption
- ✅ Data masking
- ✅ Secure disposal

**Privacy (P)**
- ✅ Data collection policies
- ✅ Consent management
- ✅ Data access rights
- ✅ Data deletion

#### Implementation Timeline
- Q2 2024: Documentation and baseline
- Q3 2024: Audit period (observation)
- Q4 2024: SOC2 Type II certification

### GDPR Compliance

#### Data Subject Rights

**Right to Access (Article 15)**
```
GET /api/v1/users/me/data-export
```

**Right to Rectification (Article 16)**
```
PUT /api/v1/users/me
{ "email": "newemail@example.com" }
```

**Right to Erasure (Article 17)**
```
DELETE /api/v1/users/me
{ "reason": "account_closure" }
```

**Data Portability (Article 20)**
```
GET /api/v1/users/me/data-export?format=json
GET /api/v1/users/me/data-export?format=csv
```

#### Privacy by Design
- Data minimization (only necessary fields)
- Purpose limitation (stated upfront)
- Storage limitation (retention policies)
- Integrity and confidentiality (encryption)

#### Data Processing Agreement (DPA)
- Standard contractual clauses
- Sub-processor list
- International transfers (adequacy/SCCs)
- Joint controller agreement

### CCPA Compliance

#### Consumer Rights

**Right to Know (1798.100)**
- What personal information is collected
- How it's used
- Who it's shared with

**Right to Delete (1798.105)**
- Request deletion of personal information
- 45-day response requirement
- Exceptions for business necessity

**Right to Opt-Out (1798.120)**
- Opt-out of data sales
- Opt-out of processing
- Non-discrimination requirement

**Right to Limit (1798.120)**
- Limit use to stated purposes
- Opt-out of sensitive personal information

#### Implementation
```
Privacy Notice
├─ Collection practices
├─ Usage practices
├─ Sharing practices
├─ Consumer rights
└─ Contact information

Opt-Out Mechanism
├─ "Do Not Sell My Personal Information" link
├─ Verification process
└─ Opt-out confirmation

Deletion Process
├─ Request submission
├─ Verification (email)
├─ Processing (30-45 days)
└─ Confirmation
```

---

## Incident Response

### Incident Classification

**Level 1 (Critical)**
- Data breach affecting 10k+ users
- Service outage > 4 hours
- Ransomware detected
- Active security attack

**Level 2 (High)**
- Data breach affecting 100-10k users
- Service degradation > 1 hour
- Vulnerability exploitation detected
- Unauthorized access

**Level 3 (Medium)**
- Data breach affecting < 100 users
- Service issue 15-60 minutes
- Security policy violation
- Suspicious activity detected

**Level 4 (Low)**
- Failed access attempts
- Configuration drift
- Minor policy violation
- Informational events

### Response Timeline

```
Level 1: 15 min response, 1 hour containment
Level 2: 30 min response, 4 hour containment
Level 3: 2 hour response, 24 hour containment
Level 4: 24 hour response, 7 day resolution
```

### Incident Response Team

- **CISO**: Breach decisions, legal coordination
- **Engineering Lead**: Technical investigation
- **Ops Lead**: Infrastructure assessment
- **Communications**: Notification, transparency
- **Legal**: Regulatory obligations

### Breach Notification

**Timeline**
- Confirmed: Immediately notify CISO
- Investigation: Within 24 hours
- Remediation: Within 72 hours
- Notification: Without unreasonable delay

**Notification Content**
- What was breached
- How many people affected
- What data was exposed
- What you're doing about it
- What users should do

---

## Security Operations

### Vulnerability Management

#### Scanning
- Weekly: Dependency scanning (npm audit, pip audit)
- Weekly: Container scanning (Trivy)
- Monthly: SAST (SonarQube)
- Quarterly: Penetration testing

#### Remediation SLA
```
Critical:  7 days
High:      14 days
Medium:    30 days
Low:       60 days
```

#### Patch Management
- Security patches: Within 48 hours
- Minor updates: Within 2 weeks
- Major updates: Tested, scheduled rollout
- Emergency: As needed

### Monitoring & Alerting

#### Security Monitoring
```
Failed login attempts: Alert > 5/minute
API errors: Alert > 5% error rate
Network anomalies: Baseline + deviation
Data exfiltration: Large downloads/exports
Privilege escalation: Role changes
Configuration drift: Unauthorized changes
```

#### SIEM Configuration
- CloudWatch Logs → Loki
- VPC Flow Logs → OpenSearch
- CloudTrail → CloudWatch → Alert
- WAF Logs → CloudWatch

### Compliance Auditing

#### Monthly Review
- Access logs (who accessed what)
- Privilege changes (who got promoted)
- Failed security events (attacks repelled)
- Configuration changes (authorized vs unauthorized)

#### Quarterly Assessment
- Completeness of audit logs
- Accuracy of access controls
- Effectiveness of monitoring
- Compliance with policies

#### Annual Audit
- Full security assessment
- Penetration testing
- Code review
- Compliance certification

---

## Security Policies

### Password Policy
- Minimum 12 characters
- Must include: uppercase, lowercase, number, special char
- No common passwords (cracklib)
- No reuse of last 5 passwords
- Change every 90 days (with history)

### API Security
- Rate limiting: 1000 req/hour per API key
- Request validation: Schema + content
- Response filtering: Data masking
- CORS: Whitelist allowed origins
- CSRF: Token-based protection

### Code Security
- All PRs require review (2 reviewers for production)
- SAST check (SonarQube) must pass
- Dependency audit must pass
- Secrets scanning must pass

### Infrastructure Security
- Least privilege IAM roles
- Encryption by default
- Network segmentation
- Regular backup testing
- Disaster recovery drills (quarterly)

---

## Security Contact

**Email**: security@ventureflow.io
**Slack**: #security (internal)
**Phone**: Available for critical incidents
**Disclosure**: Responsible disclosure policy at /security.txt

---

## Changelog

| Date | Change | Details |
|------|--------|---------|
| 2024-06-15 | v1.0 | Initial security framework |
| 2024-06-20 | v1.1 | Added compliance details |
| 2024-07-01 | v1.2 | Incident response updates |

---

**Last Updated**: 2024-07-01
**Next Review**: 2024-10-01
**Status**: DRAFT → Review → APPROVED
