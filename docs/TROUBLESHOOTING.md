# 🔧 Troubleshooting Guide

راهنمای عیب‌یابی بازی نجات یوز ایران

## 🚨 مشکلات رایج و راه‌حل‌ها

### ۱. سرور اجرا نمی‌شود

#### مشکل: خطای اتصال پایگاه داده
```
Error: DATABASE_URL must be set. Did you forget to provision a database?
```

**راه‌حل:**
```bash
# تنظیم متغیر محیطی
set "DATABASE_URL=postgresql://username:password@host:port/database"

# یا در فایل .env
echo "DATABASE_URL=postgresql://username:password@host:port/database" > .env

# اجرای سرور
npm run dev
```

#### مشکل: پورت ۳۰۰۰ مشغول است
```
Error: listen EADDRINUSE: address already in use :::3000
```

**راه‌حل:**
```bash
# یافتن فرآیند استفاده‌کننده از پورت
netstat -ano | findstr :3000

# یا در Linux/Mac
lsof -i :3000

# متوقف کردن فرآیند
taskkill /PID <PID> /F

# یا تغییر پورت
set PORT=3001 && npm run dev
```

### ۲. بازی بارگذاری نمی‌شود

#### مشکل: خطای ۴۰۴ در مرورگر
```
GET http://localhost:3000/ 404 (Not Found)
```

**علت:** سرور اجرا نشده یا پورت اشتباه

**راه‌حل:**
```bash
# بررسی اجرای سرور
curl http://localhost:3000

# یا باز کردن در مرورگر
start http://localhost:3000
```

#### مشکل: خطای CORS
```
Access to XMLHttpRequest at 'http://localhost:3000/api/game/start'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**راه‌حل:**
```typescript
// اضافه کردن به server/index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000'],
  credentials: true
}));
```

### ۳. خطاهای بازی

#### مشکل: کاراکترها نمایش داده نمی‌شوند
```
Phaser texture not found: mother-cheetah-pixel
```

**علت:** فایل‌های asset بارگذاری نشده

**راه‌حل:**
```bash
# بررسی وجود فایل‌ها
ls -la client/public/assets/sprites/

# پاک کردن cache مرورگر
# Ctrl+Shift+R (Windows/Linux) یا Cmd+Shift+R (Mac)

# بررسی assetConfig.ts
cat client/src/lib/assetConfig.ts
```

#### مشکل: پس‌زمینه نمایش داده نمی‌شود
```
Background texture 'spring-bg' not found
```

**راه‌حل:**
```bash
# بررسی فایل‌های پس‌زمینه
ls -la client/public/assets/backgrounds/

# بررسی assetConfig.ts برای تنظیمات پس‌زمینه
grep -n "backgrounds" client/src/lib/assetConfig.ts
```

#### مشکل: فیزیک بازی کار نمی‌کند
```
Phaser physics body is null
```

**علت:** اشکال در تنظیمات فیزیک Phaser

**راه‌حل:**
```typescript
// بررسی تنظیمات فیزیک در PhaserGame.tsx
scene.physics.world.enable([scene.motherCheetah, ...scene.cubs]);

// بررسی وجود body
if (scene.motherCheetah?.body) {
  (scene.motherCheetah.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
}
```

### ۴. خطاهای پایگاه داده

#### مشکل: اتصال به PostgreSQL شکست خورد
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**راه‌حل:**
```bash
# بررسی اجرای PostgreSQL
sudo systemctl status postgresql

# یا برای Docker
docker ps | grep postgres

# تنظیم DATABASE_URL صحیح
export DATABASE_URL="postgresql://user:password@localhost:5432/save_cheetah"
```

#### مشکل: Migration شکست خورد
```
Error: relation "game_sessions" does not exist
```

**راه‌حل:**
```bash
# اجرای migrationها
npm run db:push

# یا reset database
npm run db:reset
```

#### مشکل: Query timeout
```
Error: Query read timeout
```

**راه‌حل:**
```typescript
// تنظیم timeout در Drizzle
const db = drizzle(pool, {
  logger: true,
  casing: 'snake_case'
});

// یا تنظیم timeout در pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  query_timeout: 10000,
  connectionTimeoutMillis: 5000
});
```

### ۵. خطاهای frontend

#### مشکل: کامپوننت‌ها render نمی‌شوند
```
TypeError: Cannot read property 'map' of undefined
```

**علت:** Props undefined یا null

**راه‌حل:**
```typescript
// اضافه کردن default values
interface GameUIProps {
  gameData?: GameData;
  onTutorialComplete?: () => void;
}

export default function GameUI({ gameData = initialGameData, onTutorialComplete }: GameUIProps) {
  // استفاده از optional chaining
  const cubs = gameData?.cubs ?? 4;
  const health = gameData?.health ?? 100;
}
```

#### مشکل: State بروزرسانی نمی‌شود
```
State not updating in React component
```

**راه‌حل:**
```typescript
// استفاده از functional updates
setGameData(prev => ({ ...prev, health: prev.health - 5 }));

// یا استفاده از useEffect برای side effects
useEffect(() => {
  console.log('Game data updated:', gameData);
}, [gameData]);
```

#### مشکل: Memory leak در useEffect
```
Warning: Can't perform a React state update on an unmounted component
```

**راه‌حل:**
```typescript
useEffect(() => {
  let intervalId: NodeJS.Timeout;

  const startTimer = () => {
    intervalId = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
  };

  if (gameStarted) {
    startTimer();
  }

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [gameStarted]);
```

### ۶. خطاهای build و compilation

#### مشکل: TypeScript errors
```
Property 'cubs' does not exist on type 'GameData'
```

**راه‌حل:**
```typescript
// بررسی interface GameData
interface GameData {
  cubs: number;
  currentMonth: number;
  timeRemaining: number;
  health: number;
  burstEnergy: number;
  score: number;
  season: string;
  lane: number;
  rabbitsCollected?: number;
}

// یا استفاده از type assertion
const gameData = response.data as GameData;
```

#### مشکل: ESLint errors
```
Unexpected any type
```

**راه‌حل:**
```typescript
// تعریف تایپ مناسب
interface GameEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

// یا استفاده از generic
function trackEvent<T extends Record<string, unknown>>(event: string, data: T) {
  // ...
}
```

#### مشکل: Build شکست خورد
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**راه‌حل:**
```bash
# افزایش memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# یا پاک کردن node_modules و reinstall
rm -rf node_modules package-lock.json
npm install
```

### ۷. مشکلات عملکرد (Performance)

#### مشکل: بازی کند است
```
Low FPS in Phaser game
```

**راه‌حل:**
```typescript
// تنظیمات Phaser برای عملکرد بهتر
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false  // غیرفعال کردن debug mode
    }
  },
  render: {
    pixelArt: true,
    antialias: false  // غیرفعال کردن antialiasing
  }
};
```

#### مشکل: Memory usage بالا
```
High memory usage in browser
```

**راه‌حل:**
```typescript
// پاکسازی textureها
scene.textures.remove('unused-texture');

// پاکسازی audio
audioManager.destroy();

// استفاده از object pooling برای Phaser objects
const obstaclePool = scene.add.group({
  defaultKey: 'obstacle',
  maxSize: 20
});
```

#### مشکل: Network requests کند
```
Slow API response times
```

**راه‌حل:**
```typescript
// اضافه کردن caching
const cache = new Map();

async function cachedFetch(url: string) {
  if (cache.has(url)) {
    return cache.get(url);
  }

  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);

  // پاکسازی cache بعد از ۵ دقیقه
  setTimeout(() => cache.delete(url), 5 * 60 * 1000);

  return data;
}
```

### ۸. مشکلات موبایل و responsive

#### مشکل: لمس کار نمی‌کند
```
Touch events not working on mobile
```

**راه‌حل:**
```typescript
// اضافه کردن touch event listeners
scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
  if (pointer.wasTouch) {
    // Handle touch
    handleTouch(pointer);
  } else {
    // Handle mouse
    handleClick(pointer);
  }
});

// تنظیم viewport meta tag در index.html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

#### مشکل: اندازه‌ها در موبایل اشتباه است
```
Incorrect sizing on mobile devices
```

**راه‌حل:**
```typescript
// استفاده از viewport dimensions
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

// تنظیمات responsive برای Phaser
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: viewportWidth,
  height: viewportHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
```

### ۹. مشکلات استقرار (Deployment)

#### مشکل: Environment variables تنظیم نشده
```
DATABASE_URL is not defined
```

**راه‌حل:**
```bash
# برای Liara
liara env:set DATABASE_URL=postgresql://...

# برای Vercel
vercel env add DATABASE_URL

# برای Railway
railway variables set DATABASE_URL=postgresql://...
```

#### مشکل: Build در production شکست خورد
```
Module not found in production
```

**راه‌حل:**
```json
// بررسی package.json
{
  "dependencies": {
    "phaser": "^3.70.0",
    "react": "^18.3.1"
  },
  "devDependencies": {
    "@types/phaser": "^3.70.0"
  }
}

// پاک کردن cache و rebuild
rm -rf node_modules .next
npm install
npm run build
```

## 🛠️ ابزارهای دیباگ

### Browser DevTools

#### Console Logging
```typescript
// Development only logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data);
  console.table(gameData);
  console.time('GameLoop');
  // ... game logic
  console.timeEnd('GameLoop');
}
```

#### Network Tab
- بررسی درخواست‌های API
- زمان پاسخ سرور
- خطاهای network

#### Performance Tab
- CPU usage
- Memory usage
- Frame rate

### React DevTools

#### Component Tree
```bash
# نصب React DevTools
npm install -g react-devtools
```

#### Profiler
- شناسایی کامپوننت‌های کند
- بررسی re-renders غیرضروری
- Memory leaks

### Database Debugging

#### Drizzle Studio
```bash
npm run db:studio
```

#### Query Logging
```typescript
// اضافه کردن logger به Drizzle
const db = drizzle(pool, {
  logger: {
    logQuery: (query, params) => {
      console.log('Query:', query);
      console.log('Params:', params);
    }
  }
});
```

## 📊 مانیتورینگ

### Application Metrics

#### Response Times
```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

#### Error Tracking
```typescript
// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});
```

#### Health Check
```typescript
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.select().from(gameSessions).limit(1);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});
```

## 🚨 Emergency Procedures

### بازی کاملاً خراب شد
```bash
# ۱. متوقف کردن سرور
pkill -f "tsx server/index.ts"

# ۲. پاک کردن cache
rm -rf node_modules/.vite
rm -rf .next

# ۳. Reset database (اگر لازم)
npm run db:reset

# ۴. Reinstall dependencies
npm install

# ۵. اجرای مجدد
npm run dev
```

### Database corruption
```bash
# ۱. Backup current database
pg_dump $DATABASE_URL > emergency_backup.sql

# ۲. Reset database
npm run db:reset

# ۳. Restore from backup if needed
psql $DATABASE_URL < emergency_backup.sql
```

### High traffic issues
```bash
# ۱. Enable rate limiting
# ۲. Scale horizontally
# ۳. Add caching layer
# ۴. Optimize database queries
```

## 📞 دریافت کمک

### منابع کمک
1. **GitHub Issues**: گزارش باگ‌ها و مشکلات
2. **Documentation**: بررسی مستندات موجود
3. **Team Chat**: ارتباط با تیم توسعه
4. **Community**: پرسیدن از جامعه توسعه‌دهندگان

### اطلاعات لازم برای گزارش مشکل
```
- نسخه Node.js
- نسخه npm
- سیستم عامل
- مرورگر و نسخه
- خطای کامل (stack trace)
- مراحل بازتولید مشکل
- فایل‌های پیکربندی مربوطه
```

---

**برای مشکلات فوری با تیم پشتیبانی تماس بگیرید** 🔧