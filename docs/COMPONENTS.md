# 🧩 Component Documentation

React components documentation for Save Cheetah Iran game

## 📋 Overview

This project uses a component-based architecture. All components are written in TypeScript and follow Material Design Expressive.

## 🏗️ Component Structure

```
client/src/components/
├── game/                    # Game components
│   ├── GameContainer.tsx   # Game state management
│   ├── GameUI.tsx          # Game user interface
│   ├── MainMenu.tsx        # Main menu
│   ├── PhaserGame.tsx      # Phaser wrapper
│   ├── GameOver.tsx        # Game over screen
│   └── ShareCard.tsx       # Share card
├── ui/                     # General UI components
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
└── pages/                  # Main pages
    ├── game.tsx
    └── not-found.tsx
```

## 🎮 Game Components

### GameContainer

**Path:** `client/src/components/game/GameContainer.tsx`

**Description:** Main component for game state management. Responsible for routing between different game screens.

**Props:**
```typescript
interface GameContainerProps {
  // No props - internal state management
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
  cubs: number;              // Number of surviving cubs (1-4)
  currentMonth: number;      // Current month (1-18)
  health: number;            // Mother health (0-100)
  score: number;             // Total score
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  position: { x: number; y: number };
  lane: number;              // Current lane (0-3)
  speed: number;             // Current speed
  speedBurstActive: boolean; // Speed burst status (deprecated)
}
```

**Methods:**
- `startGame()`: Start new game
- `endGame()`: End game
- `showScreen()`: Change screen
- `updateGameData()`: Update game data

### GameUI

**Path:** `client/src/components/game/GameUI.tsx`

**Description:** Game user interface including status bars, controls, and tutorial

**Props:**
```typescript
interface GameUIProps {
  gameData: GameData;
  onTutorialComplete?: () => void;
}
```

**Features:**
- Bottom status bar (month, season, health) with responsive positioning
- Center lane guide
- Interactive tutorial modal before starting game
- Low health warning with speed reduction
- Full mobile and desktop support with adaptive design
- Status bar with optimal height to prevent character coverage

**State:**
```typescript
const [showLowHealthWarning, setShowLowHealthWarning] = useState(false);
const [burstReadyPulse, setBurstReadyPulse] = useState(false);
const [showGuideModal, setShowGuideModal] = useState(true);
```

### MainMenu

**Path:** `client/src/components/game/MainMenu.tsx`

**Description:** Main game menu with background selection

**Props:**
```typescript
interface MainMenuProps {
  onStartGame: () => void;
  onDownloadStory?: (bestScore: BestScore) => void;
}
```

**Features:**
- Game title and description with animation
- Mother cheetah and cubs image with floating animation
- Start game button
- Educational information button about cheetahs (accordion)
- Story download button for returning users
- Dynamic background with background management system

### PhaserGame

**Path:** `client/src/components/game/PhaserGame.tsx`

**Description:** Wrapper for Phaser.js game engine

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

**Features:**
- Game canvas management
- Responsive size control
- Phaser lifecycle management
- Connection to gameEngine

## 🎨 UI Components

### Button

**Usage:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="lg">
  Start Game
</Button>
```

**Variants:**
- `primary`: Primary button (orange)
- `secondary`: Secondary button (green)
- `outline`: Outline button
- `ghost`: Transparent button

### Card

**Usage:**
```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <h3>Game Stats</h3>
  </CardHeader>
  <CardContent>
    <p>Score: 1000</p>
  </CardContent>
</Card>
```

### Dialog

**Usage:**
```tsx
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <h2>Title</h2>
    <p>Content</p>
  </DialogContent>
</Dialog>
```

## 📱 Page Components

### Game Page

**Path:** `client/src/pages/game.tsx`

**Description:** Main game page that renders GameContainer

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

**Path:** `client/src/lib/backgroundManager.ts`

**Description:** Dynamic background system management

```typescript
import { backgroundManager } from "@/lib/backgroundManager";

// Get current background
const currentBg = backgroundManager.getCurrentBackground();

// Change background
backgroundManager.setCurrentBackground('spring-bg');

// Get CSS style
const style = backgroundManager.getBackgroundStyle(currentBg);
```

### AssetConfig

**Path:** `client/src/lib/assetConfig.ts`

**Description:** Centralized game assets management

```typescript
import { GAME_ASSETS } from "@/lib/assetConfig";

// Access assets
const character = GAME_ASSETS.characters.mother;
const obstacle = GAME_ASSETS.obstacles.dog;
```

## 🎯 Game Mechanics Components

### Game Engine

**Path:** `client/src/lib/gameEngine.ts`

**Description:** Main game logic, physics, and entity management

**GameScene Class:**
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
  // ... other fields
}
```

**Methods:**
- `initializeGame()`: Game setup and asset loading
- `startActualGame()`: Start actual game after tutorial
- `updateGame()`: Update each frame
- `spawnGameObject()`: Spawn obstacles and resources
- `updateHealthAndEnergy()`: Health management
- `changeLane()`: Lane change

### Audio Manager

**Path:** `client/src/lib/audioManager.ts`

**Description:** Game audio management

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
  max-height: 18vh; /* Optimization to prevent character coverage */
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
1. `GameContainer` mounts
2. Initial state is set
3. `MainMenu` renders

### Game Start
1. User clicks "Start Game"
2. `startGame()` is called
3. API call to create session
4. `PhaserGame` loads and initializes
5. `GameUI` renders with `showGuideModal: true`
6. User reads tutorial and clicks
7. `onTutorialComplete()` is called
8. `gameStarted` changes to `true`
9. Actual game starts

### Game End
1. Game end conditions are met (month 18 or death)
2. `endGame()` is called
3. API call to save results
4. `GameOver` component displays
5. Best score saved in cookie

## 📊 Performance Considerations

### Optimization Tips
- Use `React.memo()` for heavy components
- Use `useCallback()` for event handler functions
- Use `useMemo()` for heavy calculations
- Lazy loading for non-essential components

### Memory Management
- Clean up event listeners in `useEffect` cleanup
- Proper state management to prevent memory leaks
- Use `AbortController` to cancel requests

## 🧪 Testing

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import GameUI from './GameUI';

test('renders game UI correctly', () => {
  const mockGameData = { /* ... */ };
  render(<GameUI gameData={mockGameData} />);
  expect(screen.getByText('Family Health')).toBeInTheDocument();
});
```

### Integration Tests
```typescript
test('game flow works correctly', async () => {
  // Test complete game flow from start to finish
  const { user } = render(<GameContainer />);
  await user.click(screen.getByText('Start Game'));
  // ... continue testing
});
```

## 🔧 Development Guidelines

### Naming Conventions
- Components: `PascalCase` (GameUI, MainMenu)
- Files: `kebab-case` (game-ui.tsx, main-menu.tsx)
- Variables: `camelCase` (gameData, currentMonth)
- Constants: `UPPER_SNAKE_CASE` (GAME_ASSETS, MAX_HEALTH)

### Code Organization
- Each component in separate file
- Related logic in custom hooks
- TypeScript interfaces in separate files
- Tests alongside component files

### Best Practices
- Use functional components
- Use hooks instead of class components
- TypeScript strict mode
- ESLint and Prettier
- Proper code commenting

---

**For more questions, contact the development team**
