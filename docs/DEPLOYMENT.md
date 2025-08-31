# 🚀 Deployment Guide

راهنمای کامل استقرار بازی نجات یوز ایران

## 📋 نمای کلی

این راهنما نحوه استقرار بازی در محیط‌های مختلف را توضیح می‌دهد.

## 🌐 محیط‌های استقرار

### ۱. Liara Cloud (پیشنهادی)

#### مزایا
- پشتیبانی کامل از Node.js
- PostgreSQL database داخلی
- CDN سریع
- SSL خودکار
- مانیتورینگ داخلی

#### مراحل استقرار

**۱. نصب Liara CLI**
```bash
npm install -g @liara/cli
```

**۲. ورود به حساب**
```bash
liara login
```

**۳. ایجاد برنامه**
```bash
liara deploy --app save-cheetah --platform node
```

**۴. تنظیم متغیرهای محیطی**
```bash
liara env:set DATABASE_URL=postgresql://...
liara env:set NODE_ENV=production
```

**۵. استقرار**
```bash
liara deploy
```

### ۲. Vercel

#### مزایا
- استقرار سریع و آسان
- Preview deployments
- Edge Functions
- Analytics داخلی

#### مراحل استقرار

**۱. نصب Vercel CLI**
```bash
npm install -g vercel
```

**۲. ورود به حساب**
```bash
vercel login
```

**۳. تنظیم پروژه**
```bash
vercel --prod
```

**۴. تنظیم متغیرهای محیطی**
```bash
vercel env add DATABASE_URL
vercel env add NODE_ENV
```

### ۳. Railway

#### مزایا
- PostgreSQL داخلی
- استقرار خودکار از Git
- Environment variables آسان
- Logs و monitoring

#### مراحل استقرار

**۱. اتصال به Railway**
```bash
npm install -g @railway/cli
railway login
```

**۲. ایجاد پروژه**
```bash
railway init
```

**۳. تنظیم متغیرهای محیطی**
```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set NODE_ENV=production
```

**۴. استقرار**
```bash
railway up
```

### ۴. Docker

#### مزایا
- قابل حمل بین پلتفرم‌ها
- Environment consistency
- Scaling آسان

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://db:5432
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=save_cheetah
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### اجرای Docker
```bash
# Build image
docker build -t save-cheetah .

# Run container
docker run -p 3000:3000 save-cheetah

# یا با Docker Compose
docker-compose up -d
```

## ⚙️ تنظیمات پیشرفته

### متغیرهای محیطی

#### ضروری
```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=3000
```

#### اختیاری
```env
SESSION_SECRET=your-secret-key
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### تنظیمات Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

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
}
```

### SSL Certificate (Let's Encrypt)

```bash
# نصب Certbot
sudo apt install certbot python3-certbot-nginx

# دریافت گواهی
sudo certbot --nginx -d yourdomain.com

# تمدید خودکار
sudo crontab -e
# اضافه کردن خط زیر:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 مانیتورینگ و نگهداری

### ابزارهای مانیتورینگ

#### Application Monitoring
```typescript
// اضافه کردن به server/index.ts
import { monitorApplication } from './monitoring';

monitorApplication(app);
```

#### Error Tracking
```typescript
// استفاده از Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

#### Performance Monitoring
```typescript
// اضافه کردن middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

### Logs

#### Centralized Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});
```

#### Log Rotation
```bash
# نصب logrotate
sudo apt install logrotate

# تنظیمات logrotate
sudo nano /etc/logrotate.d/save-cheetah
```

```
/var/log/save-cheetah/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload save-cheetah
    endscript
}
```

## 🔧 بهینه‌سازی عملکرد

### Database Optimization

#### Connection Pooling
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

#### Query Optimization
```sql
-- اضافه کردن indexها
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_events_session_id ON game_events(session_id);
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
```

#### Caching
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const cached = cache.get('leaderboard');
  if (cached) return res.json(cached);

  const leaderboard = await getLeaderboard();
  cache.set('leaderboard', leaderboard);
  res.json(leaderboard);
});
```

### Frontend Optimization

#### Build Optimization
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          phaser: ['phaser']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

#### Asset Optimization
```typescript
// Lazy loading کامپوننت‌ها
const GameOver = lazy(() => import('./components/GameOver'));

// Preloading تصاویر مهم
const preloadImages = () => {
  const images = [
    '/assets/backgrounds/spring-bg.jpg',
    '/assets/sprites/mother-cheetah.png'
  ];

  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};
```

## 🔒 امنیت

### Production Security

#### HTTPS Enforcement
```typescript
// اضافه کردن به server
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

#### Security Headers
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

#### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
```

## 📈 Scaling

### Horizontal Scaling

#### Load Balancer Setup
```nginx
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

#### Session Store
```typescript
import connectRedis from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';

const redisClient = createClient();
const RedisStore = connectRedis(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

### Database Scaling

#### Read Replicas
```typescript
const readPool = new Pool({
  connectionString: process.env.READ_DATABASE_URL
});

const writePool = new Pool({
  connectionString: process.env.WRITE_DATABASE_URL
});
```

#### Database Sharding
```typescript
// Sharding based on user ID
const getShard = (userId: string) => {
  const shardId = parseInt(userId) % SHARD_COUNT;
  return shards[shardId];
};
```

## 🚨 Backup و Recovery

### Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql

# Upload to cloud storage
aws s3 cp backup_$DATE.sql s3://backups/

# Keep only last 7 days
find . -name "backup_*.sql" -mtime +7 -delete
```

#### Point-in-Time Recovery
```sql
-- Restore to specific time
SELECT pg_create_restore_point('before_major_update');

-- Restore command
pg_restore -d database_name backup_file.sql
```

### Application Backup

#### Configuration Backup
```bash
# Backup environment variables
env > .env.backup

# Backup application code
git tag backup-$(date +%Y%m%d)
git push origin --tags
```

## 📞 Troubleshooting

### مشکلات رایج

#### High Memory Usage
```bash
# بررسی memory usage
ps aux --sort=-%mem | head

# تنظیمات Node.js
node --max-old-space-size=4096 server/index.js
```

#### Slow Response Times
```bash
# بررسی database queries
EXPLAIN ANALYZE SELECT * FROM game_sessions;

# اضافه کردن database indexes
CREATE INDEX CONCURRENTLY idx_sessions_created_at ON game_sessions(created_at);
```

#### Connection Timeouts
```typescript
// تنظیمات timeout
const pool = new Pool({
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  query_timeout: 10000
});
```

## 📊 Analytics و Monitoring

### Production Monitoring

#### Application Metrics
```typescript
import promClient from 'prom-client';

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

#### Real-time Monitoring
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🎯 Best Practices

### Deployment Checklist
- [ ] Environment variables تنظیم شده
- [ ] Database migrations اجرا شده
- [ ] SSL certificate نصب شده
- [ ] Monitoring tools تنظیم شده
- [ ] Backup strategy پیاده‌سازی شده
- [ ] Security headers اضافه شده
- [ ] Rate limiting فعال شده

### Maintenance Schedule
- **Daily**: Log review و error monitoring
- **Weekly**: Database backup verification
- **Monthly**: Security updates و dependency updates
- **Quarterly**: Performance optimization review

---

**برای سوالات بیشتر با تیم DevOps تماس بگیرید** 🚀