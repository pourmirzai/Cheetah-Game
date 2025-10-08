// Simple in-memory storage for Vercel serverless functions
// Note: This won't persist across different Vercel instances
class InMemoryStorage {
  constructor() {
    if (!global.gameSessions) {
      global.gameSessions = [];
    }
    if (!global.gameEvents) {
      global.gameEvents = [];
    }
    if (!global.gameStatsData) {
      global.gameStatsData = [];
    }
    if (!global.globalStats) {
      global.globalStats = {
        uniqueUsers: 0,
        totalGames: 0,
        totalStoryDownloads: 0,
        totalCheetahsSaved: 0,
        userIPs: []
      };
    }

    this.users = [];
    this.gameSessions = global.gameSessions;
    this.gameEvents = global.gameEvents;
    this.gameStatsData = global.gameStatsData;
    this.globalStats = global.globalStats;
  }

  async createGameSession(session) {
    const gameSession = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: session.sessionId,
      cubsSurvived: session.cubsSurvived ?? 0,
      monthsCompleted: session.monthsCompleted ?? 0,
      finalScore: session.finalScore ?? 0,
      gameTime: session.gameTime ?? 0,
      deathCause: session.deathCause ?? null,
      deviceType: session.deviceType ?? null,
      province: session.province ?? null,
      achievements: session.achievements ?? [],
      createdAt: new Date()
    };
    this.gameSessions.push(gameSession);
    return gameSession;
  }

  async getGameSession(sessionId) {
    return this.gameSessions.find(session => session.sessionId === sessionId);
  }

  async updateGameSession(sessionId, updates) {
    const sessionIndex = this.gameSessions.findIndex(session => session.sessionId === sessionId);
    if (sessionIndex === -1) return undefined;

    this.gameSessions[sessionIndex] = { ...this.gameSessions[sessionIndex], ...updates };
    return this.gameSessions[sessionIndex];
  }

  async createGameEvent(event) {
    const gameEvent = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: event.sessionId,
      eventType: event.eventType,
      eventData: event.eventData ?? null,
      timestamp: new Date()
    };
    this.gameEvents.push(gameEvent);
    return gameEvent;
  }

  async updateDailyStats(date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const daySessions = this.gameSessions.filter(
      session => session.createdAt && session.createdAt >= startDate && session.createdAt < endDate
    );

    if (daySessions.length === 0) return;

    const totalGames = daySessions.length;
    const avgSurvived = daySessions.reduce((sum, session) => sum + session.cubsSurvived, 0) / totalGames;
    const avgMonths = daySessions.reduce((sum, session) => sum + session.monthsCompleted, 0) / totalGames;

    // Count death causes
    const deathCauseCount = {};
    daySessions.forEach(session => {
      if (session.deathCause) {
        deathCauseCount[session.deathCause] = (deathCauseCount[session.deathCause] || 0) + 1;
      }
    });

    const mostCommonCause = Object.entries(deathCauseCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    const existingStatsIndex = this.gameStatsData.findIndex(stats => stats.date === date);

    const stats = {
      id: existingStatsIndex >= 0 ? this.gameStatsData[existingStatsIndex].id : Math.random().toString(36).substr(2, 9),
      date,
      totalGames,
      avgCubsSurvived: avgSurvived.toFixed(1),
      avgMonthsCompleted: avgMonths.toFixed(1),
      mostCommonDeathCause: mostCommonCause,
      updatedAt: new Date()
    };

    if (existingStatsIndex >= 0) {
      this.gameStatsData[existingStatsIndex] = stats;
    } else {
      this.gameStatsData.push(stats);
    }
  }

  async incrementUniqueUsers(ip) {
    if (!this.globalStats.userIPs.includes(ip)) {
      this.globalStats.userIPs.push(ip);
      this.globalStats.uniqueUsers++;
    }
  }

  async incrementTotalGames() {
    this.globalStats.totalGames++;
  }

  async incrementTotalCheetahsSaved(count) {
    this.globalStats.totalCheetahsSaved += count;
  }

  async incrementTotalStoryDownloads() {
    this.globalStats.totalStoryDownloads++;
  }

  async getGlobalStats() {
    return this.globalStats;
  }
}

export const storage = new InMemoryStorage();

// Simple schema validation
export const insertGameSessionSchema = {
  parse: (data) => {
    // Basic validation
    if (!data || typeof data !== 'object') throw new Error('Invalid data');
    if (!data.sessionId) throw new Error('Session ID required');
    return data;
  }
};

export const insertGameEventSchema = {
  parse: (data) => {
    // Basic validation
    if (!data || typeof data !== 'object') throw new Error('Invalid data');
    if (!data.sessionId) throw new Error('Session ID required');
    if (!data.eventType) throw new Error('Event type required');
    return data;
  }
};

function getAchievementTitle(cubsSurvived, monthsCompleted) {
  if (cubsSurvived === 4 && monthsCompleted >= 18) {
    return "مادر قهرمان";
  } else if (cubsSurvived >= 2) {
    return "مادر نجات‌دهنده";
  } else {
    return "شاهد مسابقه";
  }
}

export { getAchievementTitle };