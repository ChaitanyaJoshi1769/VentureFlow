# VentureFlow AI - Development Setup Guide

## Prerequisites

- **Node.js**: 20.10.0 or higher
- **npm**: 10.2.4 or higher
- **Docker**: Latest version
- **Git**: Latest version
- **PostgreSQL**: 16 (or Docker)
- **Redis**: 7 (or Docker)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/ChaitanyaJoshi1769/VentureFlow.git
cd VentureFlow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy example environment file
cp .env.example .env.local

# Update .env.local with your configuration
# Make sure DATABASE_URL, REDIS_URL, etc. are set
```

### 4. Start Services (Docker)

```bash
# Start all services (PostgreSQL, Redis, Elasticsearch, etc.)
npm run docker:up

# Wait for services to be healthy
# Check logs if needed
docker-compose logs -f

# You can now access:
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Elasticsearch: localhost:9200
# - Kibana: localhost:5601
# - PgAdmin: localhost:5050
```

### 5. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed sample data
npm run db:seed
```

### 6. Start Development Servers

```bash
# Start all apps in development mode
npm run dev

# This will start:
# - Next.js web app on http://localhost:3000
# - NestJS API on http://localhost:4000
```

## Project Structure

```
VentureFlow/
├── apps/
│   ├── web/                 # Next.js 16 frontend
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities
│   │   └── styles/         # Global styles
│   ├── api/                # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/   # Feature modules
│   │   │   ├── common/    # Shared utilities
│   │   │   └── main.ts    # Entry point
│   ├── admin/              # Admin dashboard (Next.js)
│   ├── investor-portal/    # Investor portal (Next.js)
│   └── mobile/             # React Native mobile app
├── packages/
│   ├── database/           # Prisma schemas
│   ├── ui/                 # Shared UI components
│   ├── types/              # TypeScript types
│   ├── auth/               # Authentication
│   ├── notifications/      # Notifications service
│   ├── search/             # Search service
│   ├── analytics/          # Analytics
│   ├── ai/                 # AI services
│   └── integrations/       # Third-party integrations
├── infrastructure/         # Terraform, K8s manifests
├── docs/                   # Documentation
├── scripts/                # Automation scripts
└── docker-compose.yml      # Docker configuration
```

## Available Commands

### Root Level

```bash
# Development
npm run dev                 # Start all apps in dev mode
npm run build              # Build all apps for production
npm run build:prod         # Build excluding storybook

# Linting & Formatting
npm run lint               # Lint all code
npm run lint:fix           # Fix linting issues
npm run format             # Format with Prettier
npm run type-check         # TypeScript type checking

# Testing
npm run test               # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report

# Database
npm run db:generate       # Generate Prisma client
npm run db:migrate        # Run migrations
npm run db:seed           # Seed database

# Docker
npm run docker:build      # Build Docker images
npm run docker:up         # Start all services
npm run docker:down       # Stop all services

# Deployment
npm run deploy:staging    # Deploy to staging
npm run deploy:production # Deploy to production
```

### Package-Specific Commands

Each package has its own npm scripts. You can run them from the root using:

```bash
# Run a script in a specific package
npm -w @ventureflow/web run dev

# Or navigate to the package directory
cd apps/web
npm run dev
```

## Development Workflow

### 1. Creating a New Feature

```bash
# Create a feature branch
git checkout -b feat/investor-search

# Make changes
# Edit files...

# Format and lint
npm run lint:fix
npm run format

# Test changes
npm run test

# Build to verify
npm run build
```

### 2. Running Tests

```bash
# All tests
npm run test

# Watch mode for specific package
npm -w @ventureflow/api run test:watch

# With coverage
npm run test:coverage
```

### 3. Database Migrations

```bash
# Create a migration
npm -w @ventureflow/database prisma migrate dev --name add_investor_table

# Review generated migration in packages/database/prisma/migrations

# Deploy to database
npm run db:migrate
```

### 4. Debugging

```bash
# Debug NestJS API
node --inspect-brk -r tsconfig-paths/register -r ts-node/register dist/main.js

# Debug Next.js app
npm -w @ventureflow/web run dev  # Then open chrome://inspect

# Access logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

## Environment Variables

Key environment variables (see .env.example for full list):

```
# Database
DATABASE_URL=postgresql://...

# Cache
REDIS_URL=redis://...

# Search
ELASTICSEARCH_URL=http://localhost:9200

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=ventureflow-prod
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Authentication
JWT_SECRET=your-secret-key

# OAuth (optional for development)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AI Services
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

## Useful URLs (Development)

- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:4000/api/docs
- **GraphQL**: http://localhost:4000/graphql
- **PostgreSQL** (PgAdmin): http://localhost:5050
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601

## Troubleshooting

### Port Already in Use

```bash
# Find process using port (e.g., 3000)
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Remove all Docker containers and volumes
npm run docker:down
docker volume prune
npm run docker:up

# Rebuild images
npm run docker:build
```

### Database Connection

```bash
# Test PostgreSQL connection
psql -h localhost -U ventureflow -d ventureflow_dev

# Check migrations
npm -w @ventureflow/database prisma migrate status

# Reset database (CAUTION: Deletes all data)
npm -w @ventureflow/database prisma migrate reset
```

### Module Import Issues

```bash
# Regenerate Prisma client
npm run db:generate

# Clear turbo cache
npm run clean

# Reinstall dependencies
rm -rf node_modules
npm install
```

## CI/CD Pipeline

### GitHub Actions

Automatic checks on every push:
- Lint
- Type check
- Test
- Build
- Deploy to staging (on main)

See `.github/workflows` for configuration.

### Local CI Check

```bash
# Run all CI checks locally
npm run lint
npm run type-check
npm run test
npm run build
```

## Performance Optimization

### Development Mode

```bash
# Start with source maps for debugging
npm run dev

# Monitor builds
npm run build -- --verbose
```

### Production Build

```bash
# Build optimized bundles
npm run build:prod

# Analyze bundle size
npm -w @ventureflow/web npm run analyze
```

## Git Workflow

```bash
# Feature branch
git checkout -b feat/feature-name

# Make commits with conventional commits
git commit -m "feat: add investor search functionality"
git commit -m "fix: correct email validation"
git commit -m "docs: update setup guide"

# Push to remote
git push origin feat/feature-name

# Create Pull Request
# (On GitHub, link to issues and request reviews)

# After approval, merge and delete branch
```

## Next Steps

1. **Understand Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Database Design**: Review [DATABASE.md](./DATABASE.md)
3. **Implementation Plan**: Check [ROADMAP.md](./ROADMAP.md)
4. **Start Development**: Pick a task from the roadmap and begin coding

## Support & Documentation

- **Architecture Docs**: `docs/ARCHITECTURE.md`
- **Database Schema**: `docs/DATABASE.md`
- **Implementation Plan**: `docs/ROADMAP.md`
- **API Documentation**: `http://localhost:4000/api/docs` (running)
- **GitHub Issues**: [Issues Page](https://github.com/ChaitanyaJoshi1769/VentureFlow/issues)

## Team

VentureFlow AI is built by an elite team of engineers and designers. Contributions welcome!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
