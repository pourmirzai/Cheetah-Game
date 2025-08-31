# 🚀 Development Guide

راهنمای کامل توسعه بازی نجات یوز ایران

## 📋 پیش‌نیازها

### سیستم مورد نیاز
- **Node.js**: نسخه ۱۸ یا بالاتر
- **npm**: نسخه ۸ یا بالاتر
- **Git**: برای مدیریت کد
- **PostgreSQL Database**: Neon یا محلی

### ابزارهای توسعه
- **VS Code**: محیط توسعه پیشنهادی
- **ESLint**: بررسی کیفیت کد
- **Prettier**: فرمت‌بندی کد
- **TypeScript**: بررسی تایپ

## 🛠️ راه‌اندازی محیط توسعه

### ۱. کلون کردن پروژه
```bash
git clone <repository-url>
cd save-cheetah
```

### ۲. نصب وابستگی‌ها
```bash
npm install
```

### ۳. تنظیم متغیرهای محیطی
```bash
# کپی فایل نمونه
cp .env.example .env

# ویرایش متغیرهای محیطی
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development
```

### ۴. راه‌اندازی پایگاه داده
```bash
# اجرای migrationها
npm run db:push

# بررسی اتصال
npm run db:check
```

### ۵. اجرای سرور توسعه
```bash
# اجرای سرور
npm run dev

# یا با تنظیم مستقیم متغیرها
set "DATABASE_URL=postgresql://..." && npx tsx server/index.ts
```

### ۶. دسترسی به بازی
```
http://localhost:3000
```

## 📁 ساختار پروژه

```
save-cheetah/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # کامپوننت‌های React
│   │   ├── lib/           # Utilities و منطق بازی
│   │   ├── pages/         # صفحات برنامه
│   │   ├── styles/        # CSS و استایل‌ها
│   │   └── types/         # تعریف تایپ‌ها
│   ├── public/            # فایل‌های static
│   └── index.html
├── server/                 # Backend Express
│   ├── index.ts           # سرور اصلی
│   ├── routes.ts          # API routes
│   ├── db.ts             # اتصال پایگاه داده
│   └── storage.ts        # مدیریت فایل‌ها
├── shared/                 # کد مشترک
├── migrations/            # Migrationهای پایگاه داده
├── docs/                  # مستندات
└── package.json
```

## 🔧 اسکریپت‌های مفید

### توسعه
```bash
npm run dev          # اجرای سرور توسعه
npm run build        # ساخت برای production
npm run preview      # پیش‌نمایش build
```

### پایگاه داده
```bash
npm run db:push      # اجرای migrationها
npm run db:studio    # Drizzle Studio
npm run db:check     # بررسی اتصال
```

### کیفیت کد
```bash
npm run check        # بررسی TypeScript
npm run lint         # بررسی ESLint
npm run format       # فرمت‌بندی کد
```

## 🎨 معماری و طراحی

### الگوی طراحی

**Frontend (React + TypeScript):**
- کامپوننت‌محور با hooks
- مدیریت state با Context/Redux
- TypeScript برای type safety
- Material Design برای UI

**Backend (Node.js + Express):**
- RESTful API
- Session-based authentication
- Database ORM با Drizzle
- Error handling متمرکز

### اصول توسعه

#### ۱. کامپوننت‌ها
```typescript
// ✅ خوب
interface GameUIProps {
  gameData: GameData;
  onTutorialComplete?: () => void;
}

export default function GameUI({ gameData, onTutorialComplete }: GameUIProps) {
  // منطق کامپوننت
}
```

#### ۲. مدیریت state
```typescript
// استفاده از custom hooks
function useGameState() {
  const [gameData, setGameData] = useState<GameData>(initialGameData);

  const updateGameData = useCallback((updates: Partial<GameData>) => {
    setGameData(prev => ({ ...prev, ...updates }));
  }, []);

  return { gameData, updateGameData };
}
```

#### ۳. API calls
```typescript
// استفاده از React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['leaderboard'],
  queryFn: () => fetch('/api/leaderboard').then(res => res.json())
});
```

## 🧪 تست و کیفیت کد

### اجرای تست‌ها
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### ساختار تست
```
__tests__/
├── components/
│   ├── GameUI.test.tsx
│   └── MainMenu.test.tsx
├── lib/
│   ├── gameEngine.test.ts
│   └── backgroundManager.test.ts
└── api/
    ├── game.test.ts
    └── analytics.test.ts
```

### مثال تست کامپوننت
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import GameUI from '../GameUI';

test('shows tutorial modal initially', () => {
  const mockGameData = { /* ... */ };
  render(<GameUI gameData={mockGameData} />);

  expect(screen.getByText('آموزش بازی')).toBeInTheDocument();
});

test('calls onTutorialComplete when start button clicked', () => {
  const mockOnComplete = jest.fn();
  const mockGameData = { /* ... */ };

  render(
    <GameUI
      gameData={mockGameData}
      onTutorialComplete={mockOnComplete}
    />
  );

  fireEvent.click(screen.getByText('شروع بازی!'));
  expect(mockOnComplete).toHaveBeenCalled();
});
```

## 🔍 دیباگ و عیب‌یابی

### ابزارهای دیباگ

#### React DevTools
```bash
# نصب extension در مرورگر
# یا استفاده از React Developer Tools در VS Code
```

#### Redux DevTools (اگر استفاده شود)
```typescript
// اضافه کردن middleware
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== 'production'
});
```

#### Console logging
```typescript
// Development only logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### مشکلات رایج

#### ۱. خطای اتصال پایگاه داده
```bash
# بررسی متغیرهای محیطی
echo $DATABASE_URL

# تست اتصال
npm run db:check
```

#### ۲. خطای build
```bash
# پاک کردن node_modules
rm -rf node_modules
npm install

# پاک کردن cache
npm run clean
```

#### ۳. خطای TypeScript
```bash
# بررسی تایپ‌ها
npm run check

# Auto-fix مشکلات
npm run lint:fix
```

## 🚀 استقرار (Deployment)

### محیط‌های مختلف

#### Development
```bash
npm run dev
# دسترسی: http://localhost:3000
```

#### Production Build
```bash
npm run build
npm run start
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### پلتفرم‌های استقرار

#### Liara Cloud (پیشنهادی)
```bash
# نصب Liara CLI
npm install -g @liara/cli

# ورود به حساب
liara login

# استقرار
liara deploy
```

#### Vercel
```bash
# نصب Vercel CLI
npm install -g vercel

# استقرار
vercel --prod
```

#### Railway
```bash
# اتصال به Railway
railway login
railway link
railway up
```

## 📊 مانیتورینگ و تحلیل

### ابزارهای مانیتورینگ

#### Application Performance
- **Response Time**: میانگین زمان پاسخ API
- **Error Rate**: نرخ خطا
- **Throughput**: تعداد درخواست‌ها در واحد زمان

#### User Analytics
- **Session Duration**: مدت زمان بازی کاربران
- **Completion Rate**: نرخ تکمیل بازی
- **User Flow**: مسیر حرکت کاربران

### لاگ‌گیری

#### Winston Logger
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('Game started', { sessionId, userId });
```

#### Morgan (HTTP Logging)
```typescript
import morgan from 'morgan';

app.use(morgan('combined'));
```

## 🔒 امنیت

### Best Practices

#### Input Validation
```typescript
import { z } from 'zod';

const gameStartSchema = z.object({
  playerName: z.string().min(1).max(50)
});

app.post('/api/game/start', (req, res) => {
  const result = gameStartSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Process valid data
});
```

#### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

#### CORS
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000'],
  credentials: true
}));
```

## 📚 منابع یادگیری

### مستندات کلیدی
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://typescriptlang.org/docs)
- [Phaser 3 Examples](https://phaser.io/phaser3)
- [Express.js Guide](https://expressjs.com)

### ابزارهای مفید
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [VS Code Extensions](https://marketplace.visualstudio.com)
- [Postman](https://postman.com) - API Testing
- [Drizzle Studio](https://orm.drizzle.team) - Database Management

## 🤝 Workflow توسعه

### Git Workflow
```bash
# ایجاد branch جدید
git checkout -b feature/new-feature

# کامیت تغییرات
git add .
git commit -m "feat: add new feature"

# Push و ایجاد PR
git push origin feature/new-feature
```

### Code Review Checklist
- [ ] TypeScript errors بررسی شده
- [ ] ESLint warnings رفع شده
- [ ] Tests اضافه شده
- [ ] Documentation بروزرسانی شده
- [ ] Performance بررسی شده
- [ ] Security vulnerabilities چک شده

### Release Process
1. **Development**: کامیت در branch develop
2. **Testing**: QA و تست یکپارچه
3. **Staging**: استقرار در محیط staging
4. **Production**: merge به main و استقرار

## 📞 پشتیبانی

### نحوه دریافت کمک
1. **Issues**: استفاده از GitHub Issues
2. **Discussions**: بحث‌های عمومی
3. **Documentation**: بروزرسانی مستندات
4. **Code Reviews**: بررسی کد توسط تیم

### تیم توسعه
- **Frontend**: تیم React و UI/UX
- **Backend**: تیم Node.js و Database
- **Game Design**: تیم مکانیک بازی
- **DevOps**: تیم استقرار و مانیتورینگ

---

**برای سوالات بیشتر با تیم توسعه تماس بگیرید** 🚀