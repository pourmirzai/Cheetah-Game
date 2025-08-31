import {
  users, gameSessions, gameEvents, gameStats,
  type User, type InsertUser, type GameSession, type InsertGameSession,
  type GameEvent, type InsertGameEvent,
  type GameStats, type InsertGameStats
} from "@shared/schema";
// Temporarily disabled database imports for in-memory storage
// import { db } from "./db";
// import { eq, desc, asc, and, gte, lt, count, avg, sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const STATS_FILE = path.join(__dirname, 'globalStats.json');

async function loadGlobalStats(): Promise<any> {
  try {
    const data = fs.readFileSync(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      uniqueUsers: 0,
      totalGames: 0,
      totalStoryDownloads: 0,
      totalCheetahsSaved: 0,
      userIPs: []
    };
  }
}

async function saveGlobalStats(stats: any): Promise<void> {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

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

export class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private gameSessions: GameSession[] = [];
  private gameEvents: GameEvent[] = [];
  private gameStatsData: GameStats[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...insertUser
    };
    this.users.push(user);
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
    this.gameSessions.push(gameSession);
    return gameSession;
  }

  async getGameSession(sessionId: string): Promise<GameSession | undefined> {
    return this.gameSessions.find(session => session.sessionId === sessionId);
  }

  async updateGameSession(sessionId: string, updates: Partial<InsertGameSession>): Promise<GameSession | undefined> {
    const sessionIndex = this.gameSessions.findIndex(session => session.sessionId === sessionId);
    if (sessionIndex === -1) return undefined;

    this.gameSessions[sessionIndex] = { ...this.gameSessions[sessionIndex], ...updates };
    return this.gameSessions[sessionIndex];
  }

  async createGameEvent(event: InsertGameEvent): Promise<GameEvent> {
    const gameEvent: GameEvent = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: event.sessionId,
      eventType: event.eventType,
      eventData: event.eventData ?? null,
      timestamp: new Date()
    };
    this.gameEvents.push(gameEvent);
    return gameEvent;
  }

  async getGameEvents(sessionId: string): Promise<GameEvent[]> {
    return this.gameEvents
      .filter(event => event.sessionId === sessionId)
      .sort((a, b) => (a.timestamp?.getTime() ?? 0) - (b.timestamp?.getTime() ?? 0));
  }


  async getTodayStats(): Promise<{ totalGames: number; avgSurvived: number; avgMonths: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = this.gameSessions.filter(session => session.createdAt && session.createdAt >= today);

    if (todaySessions.length === 0) {
      return { totalGames: 0, avgSurvived: 0, avgMonths: 0 };
    }

    const totalGames = todaySessions.length;
    const avgSurvived = todaySessions.reduce((sum, session) => sum + session.cubsSurvived, 0) / totalGames;
    const avgMonths = todaySessions.reduce((sum, session) => sum + session.monthsCompleted, 0) / totalGames;

    return {
      totalGames,
      avgSurvived: Math.round(avgSurvived * 10) / 10,
      avgMonths: Math.round(avgMonths * 10) / 10
    };
  }

  async updateDailyStats(date: string): Promise<void> {
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
    const deathCauseCount: { [key: string]: number } = {};
    daySessions.forEach(session => {
      if (session.deathCause) {
        deathCauseCount[session.deathCause] = (deathCauseCount[session.deathCause] || 0) + 1;
      }
    });

    const mostCommonCause = Object.entries(deathCauseCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    const existingStatsIndex = this.gameStatsData.findIndex(stats => stats.date === date);

    const stats: GameStats = {
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

  async getGameStats(date: string): Promise<GameStats | undefined> {
    return this.gameStatsData.find(stats => stats.date === date);
  }

  async incrementUniqueUsers(ip: string): Promise<void> {
    const stats = await loadGlobalStats();
    if (!stats.userIPs.includes(ip)) {
      stats.userIPs.push(ip);
      stats.uniqueUsers++;
      await saveGlobalStats(stats);
    }
  }

  async incrementTotalGames(): Promise<void> {
    const stats = await loadGlobalStats();
    stats.totalGames++;
    await saveGlobalStats(stats);
  }

  async incrementTotalCheetahsSaved(count: number): Promise<void> {
    const stats = await loadGlobalStats();
    stats.totalCheetahsSaved += count;
    await saveGlobalStats(stats);
  }

  async incrementTotalStoryDownloads(): Promise<void> {
    const stats = await loadGlobalStats();
    stats.totalStoryDownloads++;
    await saveGlobalStats(stats);
  }

  async getGlobalStats(): Promise<any> {
    return await loadGlobalStats();
  }
}

export const storage = new InMemoryStorage();
