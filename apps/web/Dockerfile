# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the web app
RUN npx nx build web --configuration=production

# Production stage - using Caddy
FROM caddy:2-alpine AS runner

# Copy Caddyfile for static serving
COPY apps/web/Caddyfile /etc/caddy/Caddyfile

# Copy built application
COPY --from=builder /app/dist/apps/web/browser /srv

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
