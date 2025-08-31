# 📡 API Documentation

مستندات کامل APIهای بازی نجات یوز ایران

## 🎯 نمای کلی

API این پروژه بر پایه REST طراحی شده و از Express.js استفاده می‌کند. تمام endpointها JSON را به عنوان فرمت داده ورودی و خروجی استفاده می‌کنند.

## 🔗 Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## 📋 Authentication

برای این پروژه از session-based authentication استفاده می‌شود. پس از شروع بازی، یک `sessionId` ایجاد می‌شود که در تمام درخواست‌ها استفاده می‌شود.

## 🎮 Game Endpoints

### شروع بازی جدید

**Endpoint:** `POST /api/game/start`

**توضیحات:** ایجاد یک جلسه بازی جدید و بازگشت sessionId

**Request Body:** خالی

**Response:**
```json
{
  "sessionId": "abc123-def456-ghi789",
  "success": true
}
```

**Status Codes:**
- `200`: موفقیت
- `500`: خطای سرور

**مثال استفاده:**
```javascript
const response = await fetch('/api/game/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const { sessionId } = await response.json();
```

### ثبت رویداد بازی

**Endpoint:** `POST /api/game/event`

**توضیحات:** ثبت رویدادهای مختلف بازی مانند حرکت، جمع‌آوری منابع، برخورد با موانع

**Request Body:**
```json
{
  "sessionId": "abc123-def456-ghi789",
  "event": {
    "type": "resource_collected",
    "resourceType": "water",
    "month": 5,
    "position": { "x": 240, "y": 300 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "event": {
    "id": "event-uuid",
    "timestamp": "2024-01-01T12:00:00Z",
    "type": "resource_collected"
  }
}
```

**انواع رویداد:**
- `lane_change`: تغییر مسیر
- `resource_collected`: جمع‌آوری منبع
- `obstacle_hit`: برخورد با مانع
- `speed_burst`: استفاده از جهش سرعت
- `month_completed`: تکمیل ماه

### پایان بازی

**Endpoint:** `POST /api/game/end`

**توضیحات:** پایان بازی و ذخیره نتایج نهایی

**Request Body:**
```json
{
  "sessionId": "abc123-def456-ghi789",
  "cubsSurvived": 4,
  "monthsCompleted": 18,
  "finalScore": 2500,
  "gameTime": 120,
  "deathCause": null,
  "achievements": ["perfect_family", "survivor"]
}
```

**Response:**
```json
{
  "success": true,
  "achievementTitle": "قهرمان یوزها",
  "conservationMessage": "شما به نجات یوزپلنگ آسیایی کمک کردید!"
}
```

## 📊 Analytics Endpoints

### ثبت رویداد تحلیلی

**Endpoint:** `POST /api/analytics/track`

**توضیحات:** ثبت رویدادهای تحلیلی برای بهبود بازی

**Request Body:**
```json
{
  "event": "tutorial_completed",
  "data": {
    "duration": 45,
    "completionRate": 100
  },
  "sessionId": "abc123-def456-ghi789"
}
```

**Response:**
```json
{
  "success": true,
  "tracked": true
}
```

## 🏆 Leaderboard Endpoints

### دریافت جدول امتیازات

**Endpoint:** `GET /api/leaderboard`

**توضیحات:** دریافت ۱۰ بازیکن برتر

**Query Parameters:**
- `limit`: تعداد نتایج (پیش‌فرض: 10)
- `period`: دوره زمانی (daily, weekly, monthly, all)

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "score": 5000,
      "cubsSurvived": 4,
      "monthsCompleted": 18,
      "playerName": "Anonymous",
      "achievements": ["perfect_family", "survivor"]
    }
  ]
}
```

## 📝 Data Types

### GameData
```typescript
interface GameData {
  cubs: number;              // تعداد توله‌های زنده (۱-۴)
  currentMonth: number;      // ماه فعلی (۱-۱۸)
  timeRemaining: number;     // زمان باقی‌مانده (ثانیه)
  health: number;            // سلامتی مادر (۰-۱۰۰)
  burstEnergy: number;       // انرژی جهش سرعت (۰-۱۰۰)
  score: number;             // امتیاز کل
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  lane: number;              // مسیر فعلی (۰-۳)
  rabbitsCollected?: number; // خرگوش‌های جمع‌آوری شده (۰-۳)
}
```

### GameResults
```typescript
interface GameResults {
  cubsSurvived: number;
  monthsCompleted: number;
  finalScore: number;
  gameTime: number;          // مدت زمان بازی (ثانیه)
  deathCause?: string;       // دلیل پایان بازی
  achievements: string[];    // دستاوردهای کسب شده
}
```

### Achievement Types
```typescript
type AchievementType =
  | 'perfect_family'     // تمام توله‌ها زنده ماندند
  | 'survivor'          // بازی تا پایان تکمیل شد
  | 'speed_demon'       // استفاده زیاد از جهش سرعت
  | 'resource_master'   // جمع‌آوری تمام منابع ممکن
  | 'season_explorer';  // تجربه تمام فصل‌ها
```

## ⚠️ Error Handling

### خطاهای رایج

#### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": "sessionId is required"
}
```

#### 404 Not Found
```json
{
  "error": "Session not found",
  "details": "The specified session does not exist"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

## 🔒 Security

### Rate Limiting
- حداکثر ۱۰۰ درخواست در دقیقه برای هر IP
- حداکثر ۱۰۰۰ رویداد بازی در ساعت برای هر session

### Input Validation
- تمام ورودی‌ها با استفاده از Zod validation بررسی می‌شوند
- SQL injection protection با استفاده از parameterized queries
- XSS protection با sanitization

### Session Management
- Session timeout: ۲۴ ساعت
- Automatic cleanup of expired sessions
- Secure session ID generation

## 📊 Monitoring

### Metrics
- Response time برای هر endpoint
- Error rate
- Database query performance
- Session activity

### Logging
- Request/Response logging
- Error logging with stack traces
- Game event logging
- Performance monitoring

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### API Tests
```bash
npm run test:api
```

## 📈 Performance

### Optimization Tips
- استفاده از database indexing
- Caching برای leaderboard
- Connection pooling
- Query optimization

### Benchmarks
- Average response time: < 100ms
- 99th percentile: < 500ms
- Error rate: < 1%

---

**برای سوالات بیشتر با تیم توسعه تماس بگیرید**