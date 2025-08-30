import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull().unique(),
  cubsSurvived: integer("cubs_survived").notNull().default(0),
  monthsCompleted: integer("months_completed").notNull().default(0),
  finalScore: integer("final_score").notNull().default(0),
  gameTime: integer("game_time").notNull().default(0), // in seconds
  deathCause: text("death_cause"), // 'road', 'poacher', 'dog', 'starvation', 'completed'
  deviceType: text("device_type"), // 'mobile', 'desktop'
  province: text("province"), // Optional for regional stats
  achievements: jsonb("achievements").default('[]'), // Array of achievement names
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameEvents = pgTable("game_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(), // 'game_start', 'month_reached', 'pickup', 'collision', 'speed_burst'
  eventData: jsonb("event_data"), // Additional event details
  timestamp: timestamp("timestamp").defaultNow(),
});

export const leaderboard = pgTable("leaderboard", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull().unique(),
  playerName: text("player_name").default("بازیکن ناشناس"),
  cubsSurvived: integer("cubs_survived").notNull(),
  monthsCompleted: integer("months_completed").notNull(),
  finalScore: integer("final_score").notNull(),
  province: text("province"),
  achievementTitle: text("achievement_title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  totalGames: integer("total_games").notNull().default(0),
  avgCubsSurvived: decimal("avg_cubs_survived", { precision: 3, scale: 1 }).default("0.0"),
  avgMonthsCompleted: decimal("avg_months_completed", { precision: 3, scale: 1 }).default("0.0"),
  mostCommonDeathCause: text("most_common_death_cause"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  events: many(gameEvents),
}));

export const gameEventsRelations = relations(gameEvents, ({ one }) => ({
  session: one(gameSessions, {
    fields: [gameEvents.sessionId],
    references: [gameSessions.sessionId],
  }),
}));

export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
  session: one(gameSessions, {
    fields: [leaderboard.sessionId],
    references: [gameSessions.sessionId],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
});

export const insertGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true,
  timestamp: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({
  id: true,
  createdAt: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;
export type GameEvent = typeof gameEvents.$inferSelect;

export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;

export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;
