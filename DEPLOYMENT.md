# Deployment Guide

This guide covers deployment options for the Threat Monitoring System Frontend.

## Prerequisites

- Node.js 18+
- Backend API server running
- Environment variables configured
- SSL certificates (for production)

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com

# Authentication
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://yourdomain.com

# External Services
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Build Process

### 1. Install Dependencies
```bash
npm ci --only=production
```

### 2. Type Check
```bash
npm run type-check
```

### 3. Lint Code
```bash
npm run lint
```

### 4. Build Application
```bash
npm run build
```

### 5. Test Build
```bash
npm start
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides seamless Next.js deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_SOCKET_URL": "@socket-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

### 2. Docker Deployment

**Dockerfile**:
```dockerfile
# Multi-stage build
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001/api
      - NEXT_PUBLIC_SOCKET_URL=http://backend:3001
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - backend
    networks:
      - threat-monitor

  backend:
    image: threat-monitor-backend:latest
    ports:
      - "3001:3001"
    networks:
      - threat-monitor

networks:
  threat-monitor:
    driver: bridge
```

**Build and Run**:
```bash
# Build image
docker build -t threat-monitor-frontend .

# Run container
docker run -p 3000:3000 threat-monitor-frontend

# Using Docker Compose
docker-compose up -d
```

### 3. AWS Deployment

#### AWS Amplify
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### AWS EC2
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd threat-monitoring-frontend

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "threat-monitor" -- start
pm2 startup
pm2 save
```

### 4. Nginx Configuration

**Nginx Config** (`/etc/nginx/sites-available/threat-monitor`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location /_next/static/ {
        alias /app/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Performance Optimization

### 1. Build Optimization

**Next.js Config** (`next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. CDN Configuration

Use a CDN for static assets:
- Cloudflare
- AWS CloudFront
- Azure CDN
- Google Cloud CDN

### 3. Monitoring

#### Application Monitoring
```javascript
// Sentry configuration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Performance Monitoring
```javascript
// Web Vitals
export function reportWebVitals(metric) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
    });
  }
}
```

## Security Considerations

### 1. Environment Security
- Use secure secret management
- Rotate secrets regularly
- Limit environment variable exposure
- Use HTTPS in production

### 2. Content Security Policy
```javascript
// CSP headers
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

### 3. API Security
- Implement rate limiting
- Use CORS properly
- Validate all inputs
- Sanitize outputs

## Backup and Recovery

### 1. Database Backups
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump threat_monitor > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### 2. Application Backups
- Source code in version control
- Environment configurations
- SSL certificates
- Static assets

## Monitoring and Logging

### 1. Application Logs
```javascript
// Structured logging
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  error: (message, error, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};
```

### 2. Health Checks
```javascript
// Health check endpoint
export async function GET() {
  try {
    // Check database connection
    // Check external services
    // Check memory usage
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 });
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify environment variables
   - Clear `.next` cache

2. **Runtime Errors**
   - Check browser console
   - Verify API connectivity
   - Check WebSocket connection

3. **Performance Issues**
   - Analyze bundle size
   - Check memory usage
   - Monitor API response times

### Debug Commands
```bash
# Check build output
npm run build 2>&1 | tee build.log

# Analyze bundle
npm run analyze

# Check dependencies
npm audit

# Memory usage
node --inspect npm start
```

## Rollback Strategy

### 1. Blue-Green Deployment
- Maintain two identical environments
- Switch traffic between environments
- Quick rollback capability

### 2. Version Management
```bash
# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Rollback to previous version
git checkout v0.9.0
npm run build
npm start
```

### 3. Database Migrations
- Always backup before migrations
- Test migrations in staging
- Have rollback scripts ready

This deployment guide ensures a robust, secure, and scalable deployment of your Threat Monitoring System Frontend.
