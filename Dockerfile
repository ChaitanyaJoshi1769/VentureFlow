# Multi-stage build for VentureFlow AI

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

COPY package*.json ./
COPY .npmrc* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy from dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source
COPY . .

# Build
RUN npm run build:prod

# Stage 3: Runtime
FROM node:20-alpine
WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy package.json
COPY package*.json ./

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000 4000

# Default command (override in docker-compose)
CMD ["npm", "run", "start"]
