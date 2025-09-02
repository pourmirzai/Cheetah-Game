# 🧩 Component Documentation

مستندات کامپوننت‌های React بازی نجات یوز ایران

## 📋 نمای کلی

این پروژه از معماری کامپوننت‌محور استفاده می‌کند. تمام کامپوننت‌ها با TypeScript نوشته شده‌اند و از Material Design Expressive پیروی می‌کنند.

## 🏗️ ساختار کامپوننت‌ها

```
client/src/components/
├── game/                    # کامپوننت‌های بازی
│   ├── GameContainer.tsx   # مدیریت وضعیت بازی
│   ├── GameUI.tsx          # رابط کاربری بازی
│   ├── MainMenu.tsx        # منوی اصلی
│   ├── PhaserGame.tsx      # wrapper برای Phaser
│   ├── GameOver.tsx        # صفحه پایان بازی
│   └── ShareCard.tsx       # کارت اشتراک‌گذاری
├── ui/                     # کامپوننت‌های UI عمومی
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── aspect-ratio.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── breadcrumb.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── carousel.tsx
│   ├── chart.tsx
│   ├── checkbox.tsx
│   ├── collapsible.tsx
│   ├── command.tsx
│   ├── context-menu.tsx
│   ├── dialog.tsx
│   ├── drawer.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── hover-card.tsx
│   ├── input-otp.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── menubar.tsx
│   ├── navigation-menu.tsx
│   ├── pagination.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── resizable.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx
│   ├── skeleton.tsx
│   ├── slider.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── toggle-group.tsx
│   ├── toggle.tsx
│   ├── tooltip.tsx
│   └── ...
└── pages/                  # صفحات اصلی
    ├── game.tsx
    └── not-found.tsx
```

## 🎮 Game Components

### GameContainer

**مسیر:** `client/src/components/game/GameContainer.tsx`

**توضیحات:** کامپوننت اصلی مدیریت وضعیت بازی. مسئول routing بین صفحات مختلف بازی است.

**Props:**
```typescript
interface GameContainerProps {
  // بدون props - مدیریت داخلی state
}
```

**State Management:**
```typescript
interface GameState {
  currentScreen: 'menu' | 'game' | 'tutorial' | 'gameOver' | 'leaderboard' | 'shareCard';
  isPlaying: boolean;
  sessionId: string | null;
}

interface GameData {
  cubs: number;              // تعداد توله‌های زنده (۱-۴)
  currentMonth: number;      // ماه فعلی (۱-۱۸)
  health: number;            // سلامتی مادر (۰-۱۰۰)
  score: number;             // امتیاز کل
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  position: { x: number; y: number };
  lane: number;              // مسیر فعلی (۰-۳)
  speed: number;             // سرعت فعلی
  speedBurstActive: boolean; // وضعیت جهش سرعت (deprecated)
}
```

**متدها:**
- `startGame()`: شروع بازی جدید
- `endGame()`: پایان بازی
- `showScreen()`: تغییر صفحه
- `updateGameData()`: بروزرسانی داده‌های بازی

### GameUI

**مسیر:** `client/src/components/game/GameUI.tsx`

**توضیحات:** رابط کاربری بازی شامل نوارهای وضعیت، کنترل‌ها و آموزش

**Props:**
```typescript
interface GameUIProps {
  gameData: GameData;
  onTutorialComplete?: () => void;
}
```

**ویژگی‌ها:**
- نوار وضعیت در پایین (ماه، فصل، سلامتی) با موقعیت‌یابی responsive
- راهنمای مسیرها در مرکز
- مدال آموزش تعاملی قبل از شروع بازی
- هشدار سلامتی کم با کاهش سرعت
- پشتیبانی کامل از موبایل و دسکتاپ با طراحی adaptive
- نوار وضعیت با ارتفاع بهینه برای جلوگیری از پوشش شخصیت‌ها

**State:**
```typescript
const [showLowHealthWarning, setShowLowHealthWarning] = useState(false);
const [burstReadyPulse, setBurstReadyPulse] = useState(false);
const [showGuideModal, setShowGuideModal] = useState(true);
```

### MainMenu

**مسیر:** `client/src/components/game/MainMenu.tsx`

**توضیحات:** صفحه اصلی بازی با انتخاب پس‌زمینه

**Props:**
```typescript
interface MainMenuProps {
  onStartGame: () => void;
  onDownloadStory?: (bestScore: BestScore) => void;
}
```

**ویژگی‌ها:**
- عنوان و توضیح بازی با انیمیشن
- تصویر مادر یوز و توله‌ها با انیمیشن شناور
- دکمه شروع بازی
- دکمه اطلاعات آموزشی یوزپلنگ (اکordion)
- دکمه دانلود استوری برای کاربران بازگشته
- پس‌زمینه پویا با سیستم مدیریت پس‌زمینه

### PhaserGame

**مسیر:** `client/src/components/game/PhaserGame.tsx`

**توضیحات:** wrapper برای موتور بازی Phaser.js

**Props:**
```typescript
interface PhaserGameProps {
  gameData: GameData;
  onUpdateGameData: (updates: Partial<GameData>) => void;
  onGameEnd: (results: Partial<GameResults>) => void;
  sessionId: string;
  gameStarted: boolean;
}
```

**ویژگی‌ها:**
- مدیریت canvas بازی
- کنترل اندازه responsive
- مدیریت چرخه حیات Phaser
- اتصال به gameEngine

## 🎨 UI Components

### Button

**استفاده:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="lg">
  شروع بازی
</Button>
```

**Variants:**
- `primary`: دکمه اصلی (نارنجی)
- `secondary`: دکمه ثانویه (سبز)
- `outline`: دکمه خطی
- `ghost`: دکمه شفاف

### Card

**استفاده:**
```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <h3>آمار بازی</h3>
  </CardHeader>
  <CardContent>
    <p>امتیاز: ۱۰۰۰</p>
  </CardContent>
</Card>
```

### Dialog

**استفاده:**
```tsx
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger>باز کردن</DialogTrigger>
  <DialogContent>
    <h2>عنوان</h2>
    <p>محتوا</p>
  </DialogContent>
</Dialog>
```

## 📱 Page Components

### Game Page

**مسیر:** `client/src/pages/game.tsx`

**توضیحات:** صفحه اصلی بازی که GameContainer را render می‌کند

```tsx
export default function Game() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <GameContainer />
    </div>
  );
}
```

## 🔧 Utility Components

### BackgroundManager

**مسیر:** `client/src/lib/backgroundManager.ts`

**توضیحات:** مدیریت سیستم پس‌زمینه‌های پویا

```typescript
import { backgroundManager } from "@/lib/backgroundManager";

// دریافت پس‌زمینه فعلی
const currentBg = backgroundManager.getCurrentBackground();

// تغییر پس‌زمینه
backgroundManager.setCurrentBackground('spring-bg');

// دریافت استایل CSS
const style = backgroundManager.getBackgroundStyle(currentBg);
```

### AssetConfig

**مسیر:** `client/src/lib/assetConfig.ts`

**توضیحات:** مدیریت متمرکز assetهای بازی

```typescript
import { GAME_ASSETS } from "@/lib/assetConfig";

// دسترسی به assetها
const character = GAME_ASSETS.characters.mother;
const obstacle = GAME_ASSETS.obstacles.dog;
```

## 🎯 Game Mechanics Components

### Game Engine

**مسیر:** `client/src/lib/gameEngine.ts`

**توضیحات:** منطق اصلی بازی، فیزیک و مدیریت موجودیت‌ها

**کلاس GameScene:**
```typescript
interface GameScene extends Phaser.Scene {
  gameData: GameData;
  onUpdateGameData: (updates: Partial<GameData>) => void;
  onGameEnd: (results: Partial<GameResults>) => void;
  sessionId: string;
  gameStarted: boolean;
  audioManager?: AudioManager;
  motherCheetah?: Phaser.GameObjects.Sprite;
  cubs: Phaser.GameObjects.Sprite[];
  obstacles: Phaser.GameObjects.Group;
  resources: Phaser.GameObjects.Group;
  lanes: number[];
  currentLane: number;
  gameSpeed: number;
  // ... سایر فیلدها
}
```

**متدها:**
- `initializeGame()`: راه‌اندازی بازی و بارگذاری assetها
- `startActualGame()`: شروع واقعی بازی پس از آموزش
- `updateGame()`: بروزرسانی هر فریم
- `spawnGameObject()`: تولید موانع و منابع
- `updateHealthAndEnergy()`: مدیریت سلامتی
- `changeLane()`: تغییر مسیر

### Audio Manager

**مسیر:** `client/src/lib/audioManager.ts`

**توضیحات:** مدیریت صداهای بازی

```typescript
import { AudioManager } from "@/lib/audioManager";

const audioManager = new AudioManager(scene);
audioManager.playMusic('ambient');
audioManager.onCollectResource('water');
```

## 🎨 Styling

### CSS Classes

**Game UI Classes:**
```css
.game-ui-card {
  @apply bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50;
}

.top-left-panel {
  @apply absolute top-4 left-4 z-10;
}

.center-top {
  @apply absolute top-4 left-1/2 transform -translate-x-1/2 z-10;
}

.center-bottom {
  @apply absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10;
}

.bottom-ui-bar-mobile {
  @apply absolute z-20;
  bottom: 8px;
  left: 8px;
  right: 8px;
  max-height: 18vh; /* بهینه‌سازی برای جلوگیری از پوشش شخصیت‌ها */
}
```

### Material Design Tokens

**Color Palette:**
```css
:root {
  --primary: hsl(25, 95%, 53%);     /* Orange */
  --secondary: hsl(142, 76%, 36%);  /* Green */
  --accent: hsl(48, 96%, 89%);      /* Light Yellow */
  --muted: hsl(210, 40%, 98%);      /* Light Gray */
}
```

## 🔄 Component Lifecycle

### Mounting
1. `GameContainer` mount می‌شود
2. State اولیه تنظیم می‌شود
3. `MainMenu` render می‌شود

### Game Start
1. کاربر روی "شروع بازی" کلیک می‌کند
2. `startGame()` فراخوانی می‌شود
3. API call برای ایجاد session
4. `PhaserGame` بارگذاری و راه‌اندازی می‌شود
5. `GameUI` با `showGuideModal: true` render می‌شود
6. کاربر آموزش را می‌خواند و کلیک می‌کند
7. `onTutorialComplete()` فراخوانی می‌شود
8. `gameStarted` به `true` تغییر می‌کند
9. بازی واقعی شروع می‌شود

### Game End
1. شرایط پایان بازی برآورده می‌شود (ماه ۱۸ یا مرگ)
2. `endGame()` فراخوانی می‌شود
3. API call برای ذخیره نتایج
4. `GameOver` component نمایش داده می‌شود
5. بهترین امتیاز در cookie ذخیره می‌شود

## 📊 Performance Considerations

### Optimization Tips
- استفاده از `React.memo()` برای کامپوننت‌های سنگین
- استفاده از `useCallback()` برای توابع event handler
- استفاده از `useMemo()` برای محاسبات سنگین
- Lazy loading برای کامپوننت‌های غیرضروری

### Memory Management
- پاکسازی event listenerها در `useEffect` cleanup
- مدیریت صحیح state برای جلوگیری از memory leaks
- استفاده از `AbortController` برای cancel کردن requestها

## 🧪 Testing

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import GameUI from './GameUI';

test('renders game UI correctly', () => {
  const mockGameData = { /* ... */ };
  render(<GameUI gameData={mockGameData} />);
  expect(screen.getByText('جان خانواده')).toBeInTheDocument();
});
```

### Integration Tests
```typescript
test('game flow works correctly', async () => {
  // Test complete game flow from start to finish
  const { user } = render(<GameContainer />);
  await user.click(screen.getByText('شروع بازی'));
  // ... continue testing
});
```

## 🔧 Development Guidelines

### Naming Conventions
- کامپوننت‌ها: `PascalCase` (GameUI, MainMenu)
- فایل‌ها: `kebab-case` (game-ui.tsx, main-menu.tsx)
- متغیرها: `camelCase` (gameData, currentMonth)
- ثابت‌ها: `UPPER_SNAKE_CASE` (GAME_ASSETS, MAX_HEALTH)

### Code Organization
- هر کامپوننت در فایل جداگانه
- منطق مرتبط در custom hooks
- TypeScript interfaces در فایل‌های جداگانه
- تست‌ها در کنار فایل‌های کامپوننت

### Best Practices
- استفاده از functional components
- استفاده از hooks به جای class components
- TypeScript strict mode
- ESLint و Prettier
- کامنت‌گذاری مناسب کد

---

**برای سوالات بیشتر با تیم توسعه تماس بگیرید**