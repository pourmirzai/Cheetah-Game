# 🎮 Save Cheetah Iran

An interactive web game for National Cheetah Day (September 9, 2024) to raise awareness about the conservation of the Asian cheetah.

## 📋 Project Overview

### Game Objective
An interactive and viral game to raise awareness about the conservation of the Asian cheetah using engaging and educational game mechanics.

### Game Style
- **Vertical Scroller** similar to River Raid
- **One-finger control** (touch/swipe left-right)
- **Mobile and desktop compatible**
- **Story-driven** with conservation messages

### Game Story
The player takes on the role of a mother cheetah who must raise 4 cubs to independence in 120 seconds (equivalent to 18 months), avoid obstacles, and collect resources (water/food).

## 🏗️ Technical Architecture

### Technologies Used
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Game Engine**: Phaser.js 3.70.0
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon Database)
- **Cache**: Redis (Upstash)
- **ORM**: Drizzle ORM
- **UI Framework**: Material Design Expressive
- **Build Tool**: Vite
- **Deployment**: Liara Cloud

### Project Structure
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

## 🚀 Setup and Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)

### Installation Steps

1. **Clone the project**
```bash
git clone <repository-url>
cd save-cheetah
```

2. **Install dependencies**
```bash
npm install
```

3. **Set environment variables**
```bash
# Copy the sample file
cp .env.example .env

# Edit environment variables
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development
```

4. **Setup database**
```bash
# Run migrations
npm run db:push
```

5. **Run development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:3000
```

## 🎯 Game Mechanics

### Characters
- **Mother Cheetah**: Player-controlled character
- **4 Cubs**: Must survive until the end of the game
- **Obstacles**: Cars, poachers, dogs, traps
- **Resources**: Water, gazelle, rabbit

### Controls
- **Touch/Click**: Change lane left or right
- **Double Tap**: Activate speed burst (requires 3 rabbits)
- **Swipe**: Smooth lane control

### Scoring System
- **Base Score**: 10 points for each resource collected
- **Time Bonus**: Extra points for faster completion
- **Survival Bonus**: Points for cubs surviving

### Game Progress
- **18 Months**: Total game duration
- **4 Seasons**: Spring, summer, autumn, winter
- **Background Changes**: Background changes with season changes

## 🎨 UI Design

### Material Design Expressive
- **Meaningful Colors**: Use of colors related to nature
- **Typography**: Vazirmatn font for Persian text
- **Animations**: Smooth and meaningful transitions
- **Accessibility**: Appropriate contrast and readable text size

### Key Components
- **MainMenu**: Main menu with background selection
- **GameUI**: Game interface with status bars
- **Tutorial**: Interactive tutorial before starting
- **GameContainer**: Game state management

## 📚 API Documentation

### Endpoints

#### Game
```
POST /api/game/start
- Create new game session
- Response: { sessionId: string, success: boolean }

POST /api/game/event
- Record game events
- Body: { sessionId: string, event: object }

POST /api/game/end
- End game and save results
- Body: { sessionId: string, ...gameResults }
```

#### Analytics
```
POST /api/analytics/track
- Record analytics events
- Body: { event: string, data: object }
```

### Data Types

#### GameData
```typescript
interface GameData {
  cubs: number;           // Number of surviving cubs
  currentMonth: number;   // Current month (1-18)
  timeRemaining: number;  // Time remaining (seconds)
  health: number;         // Mother health (0-100)
  burstEnergy: number;    // Burst energy (0-100)
  score: number;          // Total score
  season: string;         // Current season
  lane: number;           // Current lane
  rabbitsCollected?: number; // Rabbits collected
}
```

## 🔧 Development Guide

### Code Structure
- **TypeScript**: Strong typing throughout the project
- **ESLint**: Code quality checking
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks

### Adding New Features
1. Define interface in `shared/schema.ts`
2. Implement logic in the relevant component
3. Add unit tests
4. Update documentation

### Best Practices
- Use functional components in React
- Manage state with hooks
- Use custom hooks for shared logic
- Create reusable and composable components

## 🚀 Production Deployment

### Different Environments
- **Development**: `npm run dev`
- **Production**: `npm run build && npm start`
- **Database**: Using Neon Database

### Environment Variables
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3000
```

### Monitoring
- Server logs in console
- Game metrics in database
- Errors in error logs

## 🐛 Troubleshooting Guide

### Common Issues

#### Server Won't Start
```bash
# Check port
netstat -ano | findstr :3000

# Check environment variables
echo $DATABASE_URL

# Check dependencies
npm list --depth=0
```

#### Game Won't Load
- Check browser console for errors
- Check network tab for failed requests
- Check CORS headers

#### Database Issues
```bash
# Run migrations
npm run db:push

# Check connection
npm run db:check
```

## 📈 Analytics and Statistics

### Key Metrics
- Number of games started
- Game completion rate
- Average score
- Cub survival rate
- Average game time

### Analytics Tools
- Google Analytics for user events
- Custom analytics for game mechanics
- Database queries for overall statistics

## 🤝 Contributing

### How to Contribute
1. Fork the project
2. Create a new branch
3. Make your changes
4. Create a Pull Request

### Standards
- Use conventional commits
- Minimum 80% test coverage
- Update documentation
- Security code review

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

For questions and suggestions:
- Email: [info@sarvinwildlife.com]
- Website: [sarvinwildlife.com/en]


---

**Developed with ❤️ for the conservation of the Asiatic cheetah**
