# 🎮 نجات یوز ایران (Save Cheetah Iran)

بازی تحت وب تعاملی برای روز ملی یوزپلنگ (۹ شهریور ۱۴۰۴) جهت افزایش آگاهی درباره حفاظت از یوزپلنگ آسیایی.

## 📋 نمای کلی پروژه

### هدف بازی
بازی تعاملی و وایرال برای افزایش آگاهی درباره حفاظت از یوزپلنگ آسیایی با استفاده از مکانیک‌های بازی جذاب و آموزشی.

### سبک بازی
- **Vertical Scroller** شبیه به بازی River Raid
- **کنترل یک‌انگشتی** (لمس/سوایپ چپ‌راست)
- **سازگار با موبایل و دسکتاپ**
- **داستان‌محور** با پیام‌های حفاظتی

### داستان بازی
بازیکن نقش مادر یوزپلنگ را دارد که باید ۴ توله را در ۱۲۰ ثانیه (معادل ۱۸ ماه) به استقلال برساند، از موانع دوری کند و منابع (آب/غذا) جمع‌آوری کند.

## 🏗️ معماری فنی

### تکنولوژی‌های استفاده شده
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Game Engine**: Phaser.js 3.70.0
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon Database)
- **ORM**: Drizzle ORM
- **UI Framework**: Material Design Expressive
- **Build Tool**: Vite
- **Deployment**: Liara Cloud

### ساختار پروژه
```
save-cheetah/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and game logic
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS and styling
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── db.ts             # Database configuration
│   └── storage.ts        # File storage utilities
├── shared/                 # Shared types and schemas
├── migrations/            # Database migrations
├── docs/                  # Documentation
└── public/                # Shared static assets
```

## 🚀 راه‌اندازی و نصب

### پیش‌نیازها
- Node.js 18+
- npm یا yarn
- PostgreSQL database (Neon recommended)

### مراحل نصب

1. **کلون کردن پروژه**
```bash
git clone <repository-url>
cd save-cheetah
```

2. **نصب وابستگی‌ها**
```bash
npm install
```

3. **تنظیم متغیرهای محیطی**
```bash
# کپی کردن فایل نمونه
cp .env.example .env

# ویرایش متغیرهای محیطی
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development
```

4. **راه‌اندازی پایگاه داده**
```bash
# اجرای migrationها
npm run db:push
```

5. **اجرای سرور توسعه**
```bash
npm run dev
```

6. **باز کردن در مرورگر**
```
http://localhost:3000
```

## 🎯 مکانیک‌های بازی

### شخصیت‌ها
- **مادر یوزپلنگ**: شخصیت قابل کنترل بازیکن
- **۴ توله**: باید تا پایان بازی زنده بمانند
- **موانع**: ماشین‌ها، شکارچیان، سگ‌ها، تله‌ها
- **منابع**: آب، غزاله، خرگوش

### کنترل‌ها
- **لمس/کلیک**: تغییر مسیر به چپ یا راست
- **دابل تپ**: فعال کردن جهش سرعت (نیاز به ۳ خرگوش)
- **سوایپ**: کنترل روان مسیر

### سیستم امتیازدهی
- **امتیاز پایه**: ۱۰ امتیاز برای هر منبع جمع‌آوری شده
- **امتیاز زمان**: امتیاز بیشتر برای تکمیل سریع‌تر
- **امتیاز زنده ماندن**: امتیاز برای زنده ماندن توله‌ها

### پیشرفت بازی
- **۱۸ ماه**: مدت زمان کل بازی
- **۴ فصل**: بهار، تابستان، پاییز، زمستان
- **تغییر پس‌زمینه**: پس‌زمینه با تغییر فصل تغییر می‌کند

## 🎨 طراحی رابط کاربری

### Material Design Expressive
- **رنگ‌بندی معنادار**: استفاده از رنگ‌های مرتبط با طبیعت
- **تایپوگرافی**: فونت Vazirmatn برای متن فارسی
- **انیمیشن‌ها**: transitions روان و معنادار
- **دسترسی‌پذیری**: contrast مناسب و اندازه متن readable

### کامپوننت‌های کلیدی
- **MainMenu**: منوی اصلی با انتخاب پس‌زمینه
- **GameUI**: رابط بازی با نوارهای وضعیت
- **Tutorial**: آموزش تعاملی قبل از شروع
- **GameContainer**: مدیریت وضعیت بازی

## 📚 API Documentation

### Endpoints

#### بازی (Game)
```
POST /api/game/start
- ایجاد جلسه بازی جدید
- Response: { sessionId: string, success: boolean }

POST /api/game/event
- ثبت رویدادهای بازی
- Body: { sessionId: string, event: object }

POST /api/game/end
- پایان بازی و ذخیره نتایج
- Body: { sessionId: string, ...gameResults }
```

#### آمار (Analytics)
```
POST /api/analytics/track
- ثبت رویدادهای تحلیلی
- Body: { event: string, data: object }
```

### انواع داده‌ها

#### GameData
```typescript
interface GameData {
  cubs: number;           // تعداد توله‌های زنده
  currentMonth: number;   // ماه فعلی (۱-۱۸)
  timeRemaining: number;  // زمان باقی‌مانده (ثانیه)
  health: number;         // سلامتی مادر (۰-۱۰۰)
  burstEnergy: number;    // انرژی جهش (۰-۱۰۰)
  score: number;          // امتیاز کل
  season: string;         // فصل فعلی
  lane: number;           // مسیر فعلی
  rabbitsCollected?: number; // خرگوش‌های جمع‌آوری شده
}
```

## 🔧 راهنمای توسعه

### ساختار کد
- **TypeScript**: استفاده از تایپ قوی در کل پروژه
- **ESLint**: بررسی کیفیت کد
- **Prettier**: فرمت‌بندی خودکار کد
- **Husky**: pre-commit hooks

### افزودن ویژگی جدید
1. تعریف interface در `shared/schema.ts`
2. پیاده‌سازی منطق در کامپوننت مربوطه
3. افزودن تست‌های واحد
4. بروزرسانی مستندات

### بهترین روش‌ها
- استفاده از functional components در React
- مدیریت state با hooks
- استفاده از custom hooks برای منطق مشترک
- کامپوننت‌های reusable و composable

## 🚀 راه‌اندازی عملیاتی

### محیط‌های مختلف
- **Development**: `npm run dev`
- **Production**: `npm run build && npm start`
- **Database**: استفاده از Neon Database

### متغیرهای محیطی
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3000
```

### مانیتورینگ
- لاگ‌های سرور در کنسول
- متریک‌های بازی در پایگاه داده
- خطاها در error logs

## 🐛 راهنمای عیب‌یابی

### مشکلات رایج

#### سرور اجرا نمی‌شود
```bash
# بررسی پورت
netstat -ano | findstr :3000

# بررسی متغیرهای محیطی
echo $DATABASE_URL

# بررسی وابستگی‌ها
npm list --depth=0
```

#### بازی بارگذاری نمی‌شود
- بررسی کنسول مرورگر برای خطاها
- بررسی network tab برای درخواست‌های شکست خورده
- بررسی CORS headers

#### مشکلات پایگاه داده
```bash
# اجرای migrationها
npm run db:push

# بررسی اتصال
npm run db:check
```

## 📈 آمار و تحلیل

### متریک‌های کلیدی
- تعداد بازی‌های شروع شده
- نرخ تکمیل بازی
- میانگین امتیاز
- نرخ زنده ماندن توله‌ها
- زمان متوسط بازی

### ابزارهای تحلیل
- Google Analytics برای رویدادهای کاربر
- Custom analytics برای مکانیک‌های بازی
- Database queries برای آمار کلی

## 🤝 مشارکت

### نحوه مشارکت
1. Fork کردن پروژه
2. ایجاد branch جدید
3. اعمال تغییرات
4. ایجاد Pull Request

### استانداردها
- استفاده از conventional commits
- پوشش تست حداقل ۸۰%
- بروزرسانی مستندات
- بررسی امنیتی کد

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## 📞 تماس

برای سوالات و پیشنهادات:
- ایمیل: [your-email@example.com]
- گیت‌هاب: [repository-url]

---

**توسعه یافته با ❤️ برای حفاظت از یوزپلنگ آسیایی**