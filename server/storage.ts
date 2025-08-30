import { 
  users, gameSessions, gameEvents, leaderboard, gameStats,
  type User, type InsertUser, type GameSession, type InsertGameSession,
  type GameEvent, type InsertGameEvent, type LeaderboardEntry, type InsertLeaderboard,
  type GameStats, type InsertGameStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gte, lt, count, avg, sql } from "drizzle-orm";

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
  
  // Leaderboard
  createLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry>;
  getTopPlayers(limit?: number): Promise<LeaderboardEntry[]>;
  getTodayStats(): Promise<{ totalGames: number; avgSurvived: number; avgMonths: number }>;
  
  // Statistics
  updateDailyStats(date: string): Promise<void>;
  getGameStats(date: string): Promise<GameStats | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [gameSession] = await db
      .insert(gameSessions)
      .values(session)
      .returning();
    return gameSession;
  }

  async getGameSession(sessionId: string): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.sessionId, sessionId));
    return session || undefined;
  }

  async updateGameSession(sessionId: string, updates: Partial<InsertGameSession>): Promise<GameSession | undefined> {
    const [session] = await db
      .update(gameSessions)
      .set(updates)
      .where(eq(gameSessions.sessionId, sessionId))
      .returning();
    return session || undefined;
  }

  async createGameEvent(event: InsertGameEvent): Promise<GameEvent> {
    const [gameEvent] = await db
      .insert(gameEvents)
      .values(event)
      .returning();
    return gameEvent;
  }

  async getGameEvents(sessionId: string): Promise<GameEvent[]> {
    return await db
      .select()
      .from(gameEvents)
      .where(eq(gameEvents.sessionId, sessionId))
      .orderBy(asc(gameEvents.timestamp));
  }

  async createLeaderboardEntry(entry: InsertLeaderboard): Promise<LeaderboardEntry> {
    const [leaderboardEntry] = await db
      .insert(leaderboard)
      .values(entry)
      .returning();
    return leaderboardEntry;
  }

  async getTopPlayers(limit: number = 10): Promise<LeaderboardEntry[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(leaderboard)
      .where(gte(leaderboard.createdAt, today))
      .orderBy(desc(leaderboard.cubsSurvived), desc(leaderboard.monthsCompleted), desc(leaderboard.finalScore))
      .limit(limit);
  }

  async getTodayStats(): Promise<{ totalGames: number; avgSurvived: number; avgMonths: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [stats] = await db
      .select({
        totalGames: count(gameSessions.id),
        avgSurvived: avg(gameSessions.cubsSurvived),
        avgMonths: avg(gameSessions.monthsCompleted)
      })
      .from(gameSessions)
      .where(gte(gameSessions.createdAt, today));
    
    return {
      totalGames: stats.totalGames || 0,
      avgSurvived: parseFloat(stats.avgSurvived || "0"),
      avgMonths: parseFloat(stats.avgMonths || "0")
    };
  }

  async updateDailyStats(date: string): Promise<void> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const [stats] = await db
      .select({
        totalGames: count(gameSessions.id),
        avgSurvived: avg(gameSessions.cubsSurvived),
        avgMonths: avg(gameSessions.monthsCompleted)
      })
      .from(gameSessions)
      .where(and(
        gte(gameSessions.createdAt, startDate),
        lt(gameSessions.createdAt, endDate)
      ));

    const mostCommonCause = await db
      .select({
        deathCause: gameSessions.deathCause,
        count: count(gameSessions.id)
      })
      .from(gameSessions)
      .where(and(
        gte(gameSessions.createdAt, startDate),
        lt(gameSessions.createdAt, endDate)
      ))
      .groupBy(gameSessions.deathCause)
      .orderBy(desc(count(gameSessions.id)))
      .limit(1);

    await db
      .insert(gameStats)
      .values({
        date,
        totalGames: stats.totalGames || 0,
        avgCubsSurvived: stats.avgSurvived?.toString() || "0.0",
        avgMonthsCompleted: stats.avgMonths?.toString() || "0.0",
        mostCommonDeathCause: mostCommonCause[0]?.deathCause || null
      })
      .onConflictDoUpdate({
        target: gameStats.date,
        set: {
          totalGames: stats.totalGames || 0,
          avgCubsSurvived: stats.avgSurvived?.toString() || "0.0",
          avgMonthsCompleted: stats.avgMonths?.toString() || "0.0",
          mostCommonDeathCause: mostCommonCause[0]?.deathCause || null,
          updatedAt: new Date()
        }
      });
  }

  async getGameStats(date: string): Promise<GameStats | undefined> {
    const [stats] = await db
      .select()
      .from(gameStats)
      .where(eq(gameStats.date, date));
    return stats || undefined;
  }
}

export const storage = new DatabaseStorage();
