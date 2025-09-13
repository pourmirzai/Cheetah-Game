import type { Redis } from '@upstash/redis';
import {
  users, gameSessions, gameEvents, gameStats,
  type User, type InsertUser, type GameSession, type InsertGameSession,
  type GameEvent, type InsertGameEvent,
  type GameStats, type InsertGameStats
} from "@shared/schema";

// Initialize Upstash Redis client
let redis: any;

// In-memory stores for development
const inMemoryStore = new Map<string, string>();
const inMemorySets = new Map<string, Set<string>>();

// Initialize Redis based on environment
async function initializeRedisClient() {
  if (process.env.NODE_ENV === 'production') {
    const { Redis } = await import('@upstash/redis');
    redis = Redis.fromEnv();
  } else {
    // In-memory storage for development
    redis = {
      get: async (key: string) => inMemoryStore.get(key),
      set: async (key: string, value: any) => inMemoryStore.set(key, value),
      sadd: async (setKey: string, member: string) => inMemorySets.get(setKey)?.add(member) || inMemorySets.set(setKey, new Set([member])),
      smembers: async (setKey: string) => Array.from(inMemorySets.get(setKey) || []),
      incr: async (key: string) => {
        const current = parseInt(inMemoryStore.get(key) || '0');
        const newVal = current + 1;
        inMemoryStore.set(key, newVal.toString());
        return newVal;
      },
      incrby: async (key: string, increment: number) => {
        const current = parseInt(inMemoryStore.get(key) || '0');
        const newVal = current + increment;
        inMemoryStore.set(key, newVal.toString());
        return newVal;
      }
    };
  }
}

// No longer call initializeRedis() at top level here

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Game sessions
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSession(sessionId: string): Promise<GameSession | undefined>;
  updateGameSession(sessionId: string, updates: Partial<InsertGameSession>): Promise<GameSession | undefined>;

  // Game events
  createGameEvent(event: InsertGameEvent): Promise<GameEvent>;
  getGameEvents(sessionId: string): Promise<GameEvent[]>;

  // Statistics
  updateDailyStats(date: string): Promise<void>;
  getGameStats(date: string): Promise<GameStats | undefined>;

  // Global stats
  incrementUniqueUsers(ip: string): Promise<void>;
  incrementTotalGames(): Promise<void>;
  incrementTotalCheetahsSaved(count: number): Promise<void>;
  incrementTotalStoryDownloads(): Promise<void>;
  getGlobalStats(): Promise<any>;
}

export class UpstashStorage implements IStorage {
  // For in-memory, ensure Dates are serialized/deserialized properly
  private serialize(value: any): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return JSON.stringify(value);
  }

  private deserialize(value: string | null): any {
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
      if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
      if (parsed.timestamp) parsed.timestamp = new Date(parsed.timestamp);
      return parsed;
    } catch {
      return value;
    }
  }
  async getUser(id: string): Promise<User | undefined> {
    const data = await redis.get(`user:${id}`);
    return this.deserialize(data);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userId = await redis.get(`username:${username}`);
    if (!userId) return undefined;
    return this.getUser(userId as string);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...insertUser
    };

    // Store user data
    await redis.set(`user:${user.id}`, this.serialize(user));
    // Store username to ID mapping
    await redis.set(`username:${user.username}`, user.id);

    return user;
  }

  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const gameSession: GameSession = {
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

    await redis.set(`session:${session.sessionId}`, this.serialize(gameSession));
    return gameSession;
  }

  async getGameSession(sessionId: string): Promise<GameSession | undefined> {
    const data = await redis.get(`session:${sessionId}`);
    if (!data) return undefined;
    return this.deserialize(data);
  }

  async updateGameSession(sessionId: string, updates: Partial<InsertGameSession>): Promise<GameSession | undefined> {
    const existingSession = await this.getGameSession(sessionId);
    if (!existingSession) return undefined;

    const updatedSession = { ...existingSession, ...updates };
    await redis.set(`session:${sessionId}`, this.serialize(updatedSession));
    return updatedSession;
  }

  async createGameEvent(event: InsertGameEvent): Promise<GameEvent> {
    const gameEvent: GameEvent = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: event.sessionId,
      eventType: event.eventType,
      eventData: event.eventData ?? null,
      timestamp: new Date()
    };

    // Store event with a unique key
    await redis.set(`event:${gameEvent.id}`, this.serialize(gameEvent));
    // Add to session's event list
    await redis.sadd(`session_events:${event.sessionId}`, gameEvent.id);

    return gameEvent;
  }

  async getGameEvents(sessionId: string): Promise<GameEvent[]> {
    const eventIds = await redis.smembers(`session_events:${sessionId}`);
    if (!eventIds || eventIds.length === 0) return [];

    const events = await Promise.all(
      eventIds.map(async (eventId: string) => {
        const data = await redis.get(`event:${eventId}`);
        if (!data) return null;
        return this.deserialize(data);
      })
    );

    return events
      .filter(event => event !== null)
      .sort((a, b) => (a.timestamp?.getTime() ?? 0) - (b.timestamp?.getTime() ?? 0));
  }

  async updateDailyStats(date: string): Promise<void> {
    // Get all sessions for the date (this is complex in Redis, simplified approach)
    // For now, we'll store daily stats directly when sessions are created/updated
    // This is a simplified implementation - in production you might want to use Redis sorted sets
    const sessionsKey = `daily_sessions:${date}`;
    const sessionIds = await redis.smembers(sessionsKey);

    if (!sessionIds || sessionIds.length === 0) return;

    const sessions = await Promise.all(
      sessionIds.map((sessionId: string) => this.getGameSession(sessionId))
    );

    const validSessions = sessions.filter(session => session !== undefined) as GameSession[];

    if (validSessions.length === 0) return;

    const totalGames = validSessions.length;
    const avgSurvived = validSessions.reduce((sum, session) => sum + session.cubsSurvived, 0) / totalGames;
    const avgMonths = validSessions.reduce((sum, session) => sum + session.monthsCompleted, 0) / totalGames;

    // Count death causes
    const deathCauseCount: { [key: string]: number } = {};
    validSessions.forEach(session => {
      if (session.deathCause) {
        deathCauseCount[session.deathCause] = (deathCauseCount[session.deathCause] || 0) + 1;
      }
    });

    const mostCommonCause = Object.entries(deathCauseCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    const stats: GameStats = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      totalGames,
      avgCubsSurvived: avgSurvived.toFixed(1),
      avgMonthsCompleted: avgMonths.toFixed(1),
      mostCommonDeathCause: mostCommonCause,
      updatedAt: new Date()
    };

    await redis.set(`stats:${date}`, this.serialize(stats));
  }

  async getGameStats(date: string): Promise<GameStats | undefined> {
    const data = await redis.get(`stats:${date}`);
    return this.deserialize(data);
  }

  async incrementUniqueUsers(ip: string): Promise<void> {
    const isNewUser = await redis.sadd('stats:uniqueUsers', ip);
    if (isNewUser) {
      await redis.incr('stats:totalUniqueUsers');
    }
  }

  async incrementTotalGames(): Promise<void> {
    await redis.incr('stats:totalGames');
  }

  async incrementTotalCheetahsSaved(count: number): Promise<void> {
    await redis.incrby('stats:totalCheetahsSaved', count);
  }

  async incrementTotalStoryDownloads(): Promise<void> {
    await redis.incr('stats:totalStoryDownloads');
  }

  async getGlobalStats(): Promise<any> {
    const [totalGames, totalCheetahsSaved, totalStoryDownloads, uniqueUsers] = await Promise.all([
      redis.get('stats:totalGames'),
      redis.get('stats:totalCheetahsSaved'),
      redis.get('stats:totalStoryDownloads'),
      redis.get('stats:totalUniqueUsers')
    ]);

    return {
      totalGames: totalGames || 0,
      totalCheetahsSaved: totalCheetahsSaved || 0,
      totalStoryDownloads: totalStoryDownloads || 0,
      uniqueUsers: uniqueUsers || 0
    };
  }
}

export async function getStorage(): Promise<IStorage> {
  if (!redis) {
    await initializeRedisClient();
  }
  return new UpstashStorage();
}
