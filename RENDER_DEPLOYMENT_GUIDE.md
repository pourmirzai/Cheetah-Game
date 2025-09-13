# راهنمای دیپلوی کامل روی Render

## مرحله ۱: آماده‌سازی حساب Render

### ۱.۱ ایجاد حساب Render
1. بروید به [render.com](https://render.com)
2. با GitHub یا GitLab یا ایمیل ثبت‌نام کنید
3. حساب خود را verify کنید

### ۱.۲ اتصال به GitHub
1. در داشبورد Render، روی "New" کلیک کنید
2. "Connect GitHub" را انتخاب کنید
3. اجازه دسترسی به repository پروژه را بدهید

---

## مرحله ۲: راه‌اندازی دیتابیس PostgreSQL

### ۲.۱ ایجاد دیتابیس
1. در داشبورد Render، روی "New" > "PostgreSQL" کلیک کنید
2. نام سرویس: `save-cheetah-db`
3. انتخاب پلن: **Starter** (رایگان)
4. Region: انتخاب نزدیک‌ترین منطقه (مثل Europe یا US East)
5. روی "Create Database" کلیک کنید

### ۲.۲ تنظیم دیتابیس
1. صبر کنید تا دیتابیس ایجاد شود (۲-۳ دقیقه)
2. در صفحه دیتابیس، قسمت "Connections" را پیدا کنید
3. **Internal Database URL** را کپی کنید (برای استفاده داخلی)
4. **External Database URL** را کپی کنید (برای اتصال خارجی)

---

## مرحله ۳: راه‌اندازی Redis (Upstash)

### ۳.۱ ایجاد حساب Upstash
1. بروید به [upstash.com](https://upstash.com)
2. با GitHub ثبت‌نام کنید
3. یک دیتابیس Redis ایجاد کنید:
   - Name: `save-cheetah-redis`
   - Region: انتخاب منطقه نزدیک
   - Type: **Pay as you go** یا **Free** اگر موجود باشد

### ۳.۲ تنظیم Redis
1. در داشبورد Upstash، دیتابیس خود را انتخاب کنید
2. قسمت "REST API" را پیدا کنید
3. **UPSTASH_REDIS_REST_URL** را کپی کنید
4. **UPSTASH_REDIS_REST_TOKEN** را کپی کنید

---

## مرحله ۴: دیپلوی بک‌اند

### ۴.۱ ایجاد سرویس وب
1. در داشبورد Render، روی "New" > "Web Service" کلیک کنید
2. GitHub repository خود را انتخاب کنید
3. تنظیمات زیر را وارد کنید:

**Basic Settings:**
- Name: `save-cheetah-backend`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

**Environment:**
- Environment: `Production`

**Advanced:**
- Health Check Path: `/health`
- Auto-Deploy: `Yes` (برای دیپلوی خودکار با push)

### ۴.۲ تنظیم Environment Variables
در قسمت Environment Variables، موارد زیر را اضافه کنید:

```
NODE_ENV=production
DATABASE_URL=[Internal Database URL از مرحله ۲]
UPSTASH_REDIS_REST_URL=[UPSTASH_REDIS_REST_URL از مرحله ۳]
UPSTASH_REDIS_REST_TOKEN=[UPSTASH_REDIS_REST_TOKEN از مرحله ۳]
```

### ۴.۳ دیپلوی
1. روی "Create Web Service" کلیک کنید
2. صبر کنید تا build و deploy کامل شود (۵-۱۰ دقیقه)
3. URL سرویس را کپی کنید (مثل: `https://save-cheetah-backend.onrender.com`)

---

## مرحله ۵: دیپلوی فرانت‌اند روی Vercel

### ۵.۱ اتصال به Vercel
1. بروید به [vercel.com](https://vercel.com)
2. با GitHub ثبت‌نام کنید
3. روی "Import Project" کلیک کنید
4. GitHub repository خود را انتخاب کنید

### ۵.۲ تنظیمات Vercel
**Project Settings:**
- Framework Preset: `Vite`
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

**Environment Variables:**
```
VITE_API_BASE_URL=https://save-cheetah-backend.onrender.com
```

### ۵.۳ دیپلوی
1. روی "Deploy" کلیک کنید
2. صبر کنید تا build کامل شود
3. URL پروژه را کپی کنید (مثل: `https://save-cheetah.vercel.app`)

---

## مرحله ۶: تست نهایی

### ۶.۱ تست Health Check
```bash
curl https://save-cheetah-backend.onrender.com/health
```
باید پاسخ JSON دریافت کنید:
```json
{"status":"healthy","timestamp":"...","uptime":...}
```

### ۶.۲ تست خودکار با اسکریپت
```bash
# تست همه endpointها به صورت خودکار
npm run test:deployment https://save-cheetah-backend.onrender.com
```

### ۶.۳ تست دستی API
```bash
# تست game start
curl -X POST https://save-cheetah-backend.onrender.com/api/game/start \
  -H "Content-Type: application/json"

# تست ping
curl https://save-cheetah-backend.onrender.com/api/ping

# تست global stats
curl https://save-cheetah-backend.onrender.com/api/stats/global
```

### ۶.۳ تست فرانت‌اند
1. به URL Vercel بروید
2. مطمئن شوید بازی لود می‌شود
3. یک بازی تست کنید

---

## مرحله ۷: تنظیمات CORS (اختیاری)

اگر نیاز به تنظیم CORS دارید، در `server/index.ts` قسمت CORS را بروز کنید:

```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://save-cheetah.vercel.app', // URL واقعی Vercel خود را قرار دهید
    /\.vercel\.app$/
  ],
  credentials: true,
  // ... بقیه تنظیمات
};
```

---

## عیب‌یابی مشکلات رایج

### مشکل: Build شکست می‌خورد
**راه حل:**
- مطمئن شوید `package.json` در root پروژه است
- چک کنید dependencies درست نصب شوند
- لاگ‌های build را بررسی کنید

### مشکل: Database connection شکست می‌خورد
**راه حل:**
- مطمئن شوید DATABASE_URL درست تنظیم شده
- چک کنید دیتابیس Render در حال اجراست
- Internal URL را امتحان کنید

### مشکل: Redis connection شکست می‌خورد
**راه حل:**
- مطمئن شوید UPSTASH_REDIS_REST_URL و TOKEN درست هستند
- چک کنید Upstash دیتابیس فعال است

### مشکل: CORS error
**راه حل:**
- مطمئن شوید origin در CORS settings درست تنظیم شده
- چک کنید VITE_API_BASE_URL در Vercel درست است

---

## هزینه‌ها

### Render (رایگان تا حد معقول):
- Web Service: ۷۵۰ ساعت رایگان در ماه
- PostgreSQL: ۷۵۶ ساعت رایگان در ماه
- اگر از حد رایگان عبور کنید، هزینه کم است

### Upstash (رایگان تا حد معقول):
- Redis: حدود ۱۰،۰۰۰ درخواست رایگان در ماه

### Vercel:
- رایگان برای پروژه‌های شخصی
- Hobby پلن: حدود $۷ در ماه

---

## نکات مهم

1. **Backup**: همیشه از دیتابیس backup بگیرید
2. **Monitoring**: از Render dashboard برای مانیتورینگ استفاده کنید
3. **Logs**: لاگ‌های Render را برای debugging چک کنید
4. **Environment Variables**: هرگز secretها را در کد کامیت نکنید
5. **Auto-deploy**: مطمئن شوید auto-deploy فعال است

اگر مشکلی داشتید، لاگ‌های Render را چک کنید و در صورت نیاز با پشتیبانی تماس بگیرید.