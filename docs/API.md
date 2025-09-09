# 📡 API Documentation

Complete API documentation for Save Cheetah Iran game

## 🎯 Overview

The API for this project is designed based on REST and uses Express.js. All endpoints use JSON as the input and output data format.

## 🔗 Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## 📋 Authentication

This project uses session-based authentication. After starting the game, a `sessionId` is created that is used in all requests.

## 🎮 Game Endpoints

### Start New Game

**Endpoint:** `POST /api/game/start`

**Description:** Create a new game session and return sessionId

**Request Body:** Empty

**Response:**
```json
{
  "sessionId": "abc123-def456-ghi789",
  "success": true
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

**Usage Example:**
```javascript
const response = await fetch('/api/game/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const { sessionId } = await response.json();
```

### Record Game Event

**Endpoint:** `POST /api/game/event`

**Description:** Record various game events such as movement, resource collection, obstacle collisions

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

**Event Types:**
- `lane_change`: Lane change
- `resource_collected`: Resource collection
- `collision`: Obstacle collision (including damage type)
- `month_reached`: New month reached

### End Game

**Endpoint:** `POST /api/game/end`

**Description:** End game and save final results

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
  "achievementTitle": "Cheetah Hero",
  "conservationMessage": "You helped save the Asian cheetah!"
}
```

## 📊 Analytics Endpoints

### Track Analytics Event

**Endpoint:** `POST /api/analytics/track`

**Description:** Record analytics events for game improvement

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

### Get Leaderboard

**Endpoint:** `GET /api/leaderboard`

**Description:** Get top 10 players

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `period`: Time period (daily, weekly, monthly, all)

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

### GameResults
```typescript
interface GameResults {
  cubsSurvived: number;
  monthsCompleted: number;
  finalScore: number;
  gameTime: number;          // Game duration (seconds)
  deathCause?: string;       // Game end reason
  achievements: string[];    // Earned achievements
}
```

### Achievement Types
```typescript
type AchievementType =
  | 'perfect_family'     // All cubs survived
  | 'survivor'          // Game completed to the end
  | 'resource_master'   // Collected all possible resources
  | 'season_explorer';  // Experienced all seasons
```

## ⚠️ Error Handling

### Common Errors

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
- Maximum 100 requests per minute per IP
- Maximum 1000 game events per hour per session

### Input Validation
- All inputs are validated using Zod validation
- SQL injection protection with parameterized queries
- XSS protection with sanitization

### Session Management
- Session timeout: 24 hours
- Automatic cleanup of expired sessions
- Secure session ID generation

## 📊 Monitoring

### Metrics
- Response time for each endpoint
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
- Use database indexing
- Caching for leaderboard
- Connection pooling
- Query optimization

### Benchmarks
- Average response time: < 100ms
- 99th percentile: < 500ms
- Error rate: < 1%

---

**For more questions, contact the development team**
