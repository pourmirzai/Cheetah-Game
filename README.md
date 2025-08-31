# 🎮 نجات یوز ایران (Save Cheetah Iran)

بازی تحت وب تعاملی برای روز ملی یوزپلنگ (۹ شهریور ۱۴۰۴) جهت افزایش آگاهی درباره حفاظت از یوزپلنگ آسیایی.

## 📖 مستندات کامل

برای اطلاعات کامل درباره پروژه، لطفاً به **[مستندات](./docs/)** مراجعه کنید:

### 📋 [راهنمای شروع سریع](./docs/README.md)
- پیش‌نیازها و نصب
- راه‌اندازی محیط توسعه
- اجرای بازی

### 🔌 [API Documentation](./docs/API.md)
- مستندات کامل API
- نمونه کدهای استفاده
- امنیت و authentication

### 🧩 [Component Documentation](./docs/COMPONENTS.md)
- کامپوننت‌های React
- معماری frontend
- UI/UX guidelines

### 🎯 [Game Mechanics](./docs/GAME_MECHANICS.md)
- مکانیک‌های بازی
- شخصیت‌ها و موجودیت‌ها
- سیستم امتیازدهی

### 🚀 [Development Guide](./docs/DEVELOPMENT.md)
- راهنمای توسعه
- تست و کیفیت کد
- دیباگ و عیب‌یابی

### 🚀 [Deployment Guide](./docs/DEPLOYMENT.md)
- راهنمای استقرار
- مانیتورینگ و نگهداری
- بهینه‌سازی عملکرد

### 🔧 [Troubleshooting](./docs/TROUBLESHOOTING.md)
- راهنمای عیب‌یابی
- مشکلات رایج و راه‌حل‌ها
- ابزارهای دیباگ

## 🎯 نمای کلی پروژه

### هدف بازی
بازی تعاملی و وایرال برای افزایش آگاهی درباره حفاظت از یوزپلنگ آسیایی با استفاده از مکانیک‌های بازی جذاب و آموزشی.

### سبک بازی
- **Vertical Scroller** شبیه به بازی River Raid
- **کنترل یک‌انگشتی** (لمس/سوایپ چپ‌راست)
- **سازگار با موبایل و دسکتاپ**
- **داستان‌محور** با پیام‌های حفاظتی

### داستان بازی
بازیکن نقش مادر یوزپلنگ را دارد که باید ۴ توله را در ۱۲۰ ثانیه (معادل ۱۸ ماه) به استقلال برساند، از موانع دوری کند و منابع (آب/غذا) جمع‌آوری کند.

## 🚀 راه‌اندازی سریع

```bash
# کلون کردن پروژه
git clone <repository-url>
cd save-cheetah

# نصب وابستگی‌ها
npm install

# تنظیم متغیرهای محیطی
cp .env.example .env
# ویرایش DATABASE_URL در فایل .env

# اجرای سرور
npm run dev
```

## 🎮 دسترسی به بازی

بعد از راه‌اندازی سرور، بازی در آدرس زیر قابل دسترسی است:
```
http://localhost:3000
```

## 🏗️ معماری فنی

- **Frontend**: React 18, TypeScript, Phaser.js, Material Design
- **Backend**: Node.js, Express.js, PostgreSQL
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Build Tool**: Vite
- **Deployment**: Liara Cloud

## 📞 تماس

برای سوالات و پیشنهادات:
- ایمیل: [your-email@example.com]
- گیت‌هاب: [repository-url]

---

**توسعه یافته با ❤️ برای حفاظت از یوزپلنگ آسیایی**