# 🚀 Development Guide

Complete development guide for Save Cheetah Iran game

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: For code management
- **PostgreSQL Database**: Neon or local

### Development Tools
- **VS Code**: Recommended development environment
- **ESLint**: Code quality checking
- **Prettier**: Code formatting
- **TypeScript**: Type checking

## 🛠️ Setting Up Development Environment

### 1. Clone the project
```bash
git clone <repository-url>
cd save-cheetah
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables
```bash
# Copy sample file
cp .env.example .env

# Edit environment variables
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development
```

### 4. Setup database
```bash
# Run migrations
npm run db:push

# Check connection
npm run db:check
```

### 5. Run development server
```bash
# Run server
npm run dev

# Or with direct variable setting
set "DATABASE_URL=postgresql://..." && npx tsx server/index.ts
```

### 6. Access the game
```
http://localhost:3000
```

## 📁 Project Structure

```
save-cheetah/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and game logic
│   │   ├── pages/         # Application pages
│   │   ├── styles/        # CSS and styles
│   │   └── types/         # Type definitions
│   ├── public/            # Static files
│   └── index.html
├── server/                 # Backend Express
│   ├── index.ts           # Main server
│   ├── routes.ts          # API routes
│   ├── db.ts             # Database connection
│   └── storage.ts        # File management
├── shared/                 # Shared code
├── migrations/            # Database migrations
├── docs/                  # Documentation
└── package.json
```

## 🔧 Useful Scripts

### Development
```bash
npm run dev          # Run development server
npm run build        # Build for production
npm run preview      # Preview build
```

### Database
```bash
npm run db:push      # Run migrations
npm run db:studio    # Drizzle Studio
npm run db:check     # Check connection
```

### Code Quality
```bash
npm run check        # Check TypeScript
npm run lint         # Check ESLint
npm run format       # Format code
```

## 🎨 Architecture and Design

### Design Patterns

**Frontend (React + TypeScript):**
- Component-based with hooks
- State management with Context/Redux
- TypeScript for type safety
- Material Design for UI

**Backend (Node.js + Express):**
- RESTful API
- Session-based authentication
- Database ORM with Drizzle
- Centralized error handling

### Development Principles

#### 1. Components
```typescript
// ✅ Good
interface GameUIProps {
  gameData: GameData;
  onTutorialComplete?: () => void;
}

export default function GameUI({ gameData, onTutorialComplete }: GameUIProps) {
  // Component logic
}
```

#### 2. State Management
```typescript
// Using custom hooks
function useGameState() {
  const [gameData, setGameData] = useState<GameData>(initialGameData);

  const updateGameData = useCallback((updates: Partial<GameData>) => {
    setGameData(prev => ({ ...prev, ...updates }));
  }, []);

  return { gameData, updateGameData };
}
```

#### 3. API Calls
```typescript
// Using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['leaderboard'],
  queryFn: () => fetch('/api/leaderboard').then(res => res.json())
});
```

## 🧪 Testing and Code Quality

### Running Tests
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

### Test Structure
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

### Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import GameUI from '../GameUI';

test('shows tutorial modal initially', () => {
  const mockGameData = { /* ... */ };
  render(<GameUI gameData={mockGameData} />);

  expect(screen.getByText('Game Tutorial')).toBeInTheDocument();
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

  fireEvent.click(screen.getByText('Start Game!'));
  expect(mockOnComplete).toHaveBeenCalled();
});
```

## 🔍 Debugging and Troubleshooting

### Debug Tools

#### React DevTools
```bash
# Install browser extension
# Or use React Developer Tools in VS Code
```

#### Redux DevTools (if used)
```typescript
// Add middleware
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

### Common Problems

#### 1. Database Connection Error
```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
npm run db:check
```

#### 2. Build Error
```bash
# Clear node_modules
rm -rf node_modules
npm install

# Clear cache
npm run clean
```

#### 3. TypeScript Error
```bash
# Check types
npm run check

# Auto-fix issues
npm run lint:fix
```

## 🚀 Deployment

### Different Environments

#### Development
```bash
npm run dev
# Access: http://localhost:3000
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

### Deployment Platforms

#### Liara Cloud (Recommended)
```bash
# Install Liara CLI
npm install -g @liara/cli

# Login to account
liara login

# Deploy
liara deploy
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Railway
```bash
# Connect to Railway
railway login
railway link
railway up
```

## 📊 Monitoring and Analytics

### Monitoring Tools

#### Application Performance
- **Response Time**: Average API response time
- **Error Rate**: Error rate
- **Throughput**: Number of requests per unit time

#### User Analytics
- **Session Duration**: User game session duration
- **Completion Rate**: Game completion rate
- **User Flow**: User movement paths

### Logging

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

## 🔒 Security

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

## 📚 Learning Resources

### Key Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://typescriptlang.org/docs)
- [Phaser 3 Examples](https://phaser.io/phaser3)
- [Express.js Guide](https://expressjs.com)

### Useful Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [VS Code Extensions](https://marketplace.visualstudio.com)
- [Postman](https://postman.com) - API Testing
- [Drizzle Studio](https://orm.drizzle.team) - Database Management

## 🤝 Development Workflow

### Git Workflow
```bash
# Create new branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Code Review Checklist
- [ ] TypeScript errors checked
- [ ] ESLint warnings fixed
- [ ] Tests added
- [ ] Documentation updated
- [ ] Performance checked
- [ ] Security vulnerabilities checked

### Release Process
1. **Development**: Commit in develop branch
2. **Testing**: QA and integration testing
3. **Staging**: Deploy to staging environment
4. **Production**: Merge to main and deploy

## 📞 Support

### How to Get Help
1. **Issues**: Use GitHub Issues
2. **Discussions**: Public discussions
3. **Documentation**: Documentation updates
4. **Code Reviews**: Code review by team

### Development Team
- **Frontend**: React and UI/UX team
- **Backend**: Node.js and Database team
- **Game Design**: Game mechanics team
- **DevOps**: Deployment and monitoring team

---

**For more questions, contact the development team** 🚀
