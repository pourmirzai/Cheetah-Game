// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var InMemoryStorage = class {
  users = [];
  gameSessions = [];
  gameEvents = [];
  gameStatsData = [];
  globalStats = {
    uniqueUsers: 0,
    totalGames: 0,
    totalStoryDownloads: 0,
    totalCheetahsSaved: 0,
    userIPs: []
  };
  async getUser(id) {
    return this.users.find((user) => user.id === id);
  }
  async getUserByUsername(username) {
    return this.users.find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      ...insertUser
    };
    this.users.push(user);
    return user;
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
      createdAt: /* @__PURE__ */ new Date()
    };
    this.gameSessions.push(gameSession);
    return gameSession;
  }
  async getGameSession(sessionId) {
    return this.gameSessions.find((session) => session.sessionId === sessionId);
  }
  async updateGameSession(sessionId, updates) {
    const sessionIndex = this.gameSessions.findIndex((session) => session.sessionId === sessionId);
    if (sessionIndex === -1) return void 0;
    this.gameSessions[sessionIndex] = { ...this.gameSessions[sessionIndex], ...updates };
    return this.gameSessions[sessionIndex];
  }
  async createGameEvent(event) {
    const gameEvent = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: event.sessionId,
      eventType: event.eventType,
      eventData: event.eventData ?? null,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.gameEvents.push(gameEvent);
    return gameEvent;
  }
  async getGameEvents(sessionId) {
    return this.gameEvents.filter((event) => event.sessionId === sessionId).sort((a, b) => (a.timestamp?.getTime() ?? 0) - (b.timestamp?.getTime() ?? 0));
  }
  async getTodayStats() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = this.gameSessions.filter((session) => session.createdAt && session.createdAt >= today);
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
  async updateDailyStats(date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    const daySessions = this.gameSessions.filter(
      (session) => session.createdAt && session.createdAt >= startDate && session.createdAt < endDate
    );
    if (daySessions.length === 0) return;
    const totalGames = daySessions.length;
    const avgSurvived = daySessions.reduce((sum, session) => sum + session.cubsSurvived, 0) / totalGames;
    const avgMonths = daySessions.reduce((sum, session) => sum + session.monthsCompleted, 0) / totalGames;
    const deathCauseCount = {};
    daySessions.forEach((session) => {
      if (session.deathCause) {
        deathCauseCount[session.deathCause] = (deathCauseCount[session.deathCause] || 0) + 1;
      }
    });
    const mostCommonCause = Object.entries(deathCauseCount).sort(([, a], [, b]) => b - a)[0]?.[0] || null;
    const existingStatsIndex = this.gameStatsData.findIndex((stats2) => stats2.date === date);
    const stats = {
      id: existingStatsIndex >= 0 ? this.gameStatsData[existingStatsIndex].id : Math.random().toString(36).substr(2, 9),
      date,
      totalGames,
      avgCubsSurvived: avgSurvived.toFixed(1),
      avgMonthsCompleted: avgMonths.toFixed(1),
      mostCommonDeathCause: mostCommonCause,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (existingStatsIndex >= 0) {
      this.gameStatsData[existingStatsIndex] = stats;
    } else {
      this.gameStatsData.push(stats);
    }
  }
  async getGameStats(date) {
    return this.gameStatsData.find((stats) => stats.date === date);
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
};
var storage = new InMemoryStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull().unique(),
  cubsSurvived: integer("cubs_survived").notNull().default(0),
  monthsCompleted: integer("months_completed").notNull().default(0),
  finalScore: integer("final_score").notNull().default(0),
  gameTime: integer("game_time").notNull().default(0),
  // in seconds
  deathCause: text("death_cause"),
  // 'road', 'smuggler', 'dog', 'starvation', 'completed'
  deviceType: text("device_type"),
  // 'mobile', 'desktop'
  province: text("province"),
  // Optional for regional stats
  achievements: jsonb("achievements").default("[]"),
  // Array of achievement names
  createdAt: timestamp("created_at").defaultNow()
});
var gameEvents = pgTable("game_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(),
  // 'game_start', 'month_reached', 'pickup', 'collision', 'speed_burst'
  eventData: jsonb("event_data"),
  // Additional event details
  timestamp: timestamp("timestamp").defaultNow()
});
var gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(),
  // YYYY-MM-DD format
  totalGames: integer("total_games").notNull().default(0),
  avgCubsSurvived: decimal("avg_cubs_survived", { precision: 3, scale: 1 }).default("0.0"),
  avgMonthsCompleted: decimal("avg_months_completed", { precision: 3, scale: 1 }).default("0.0"),
  mostCommonDeathCause: text("most_common_death_cause"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  events: many(gameEvents)
}));
var gameEventsRelations = relations(gameEvents, ({ one }) => ({
  session: one(gameSessions, {
    fields: [gameEvents.sessionId],
    references: [gameSessions.sessionId]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true
});
var insertGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true,
  timestamp: true
});
var insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  updatedAt: true
});

// server/routes.ts
import { nanoid } from "nanoid";
import { createCanvas, loadImage } from "canvas";
import * as path from "path";
async function registerRoutes(app2) {
  app2.post("/api/game/start", async (req, res) => {
    try {
      const sessionId = nanoid();
      const deviceType = req.headers["user-agent"]?.includes("Mobile") ? "mobile" : "desktop";
      const ip = req.ip || req.connection.remoteAddress || "unknown";
      const session = await storage.createGameSession({
        sessionId,
        cubsSurvived: 4,
        monthsCompleted: 0,
        finalScore: 0,
        gameTime: 0,
        deviceType,
        achievements: []
      });
      await storage.createGameEvent({
        sessionId,
        eventType: "game_start",
        eventData: { deviceType }
      });
      await storage.incrementUniqueUsers(ip);
      await storage.incrementTotalGames();
      res.json({ sessionId, success: true });
    } catch (error) {
      console.error("Error starting game:", error);
      res.status(500).json({ error: "Failed to start game" });
    }
  });
  app2.post("/api/game/end", async (req, res) => {
    try {
      const validatedData = insertGameSessionSchema.parse(req.body);
      const session = await storage.updateGameSession(validatedData.sessionId, {
        cubsSurvived: validatedData.cubsSurvived,
        monthsCompleted: validatedData.monthsCompleted,
        finalScore: validatedData.finalScore,
        gameTime: validatedData.gameTime,
        deathCause: validatedData.deathCause,
        achievements: validatedData.achievements
      });
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      const achievementTitle = getAchievementTitle(session.cubsSurvived, session.monthsCompleted);
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await storage.updateDailyStats(today);
      await storage.incrementTotalCheetahsSaved(session.cubsSurvived);
      res.json({ success: true, session, achievementTitle });
    } catch (error) {
      console.error("Error ending game:", error);
      res.status(500).json({ error: "Failed to end game" });
    }
  });
  app2.post("/api/game/event", async (req, res) => {
    try {
      const validatedData = insertGameEventSchema.parse(req.body);
      const event = await storage.createGameEvent(validatedData);
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });
  app2.post("/api/generate-story-card", async (req, res) => {
    try {
      const { sessionId, cubsSurvived, monthsCompleted, achievementTitle } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      const storyCardData = {
        cubsSurvived,
        monthsCompleted,
        achievementTitle,
        shareText: `${cubsSurvived} \u062A\u0648\u0644\u0647 \u0646\u062C\u0627\u062A \u06CC\u0627\u0641\u062A \u062F\u0631 ${monthsCompleted} \u0645\u0627\u0647! ${achievementTitle}`,
        hashtags: ["#\u0646\u062C\u0627\u062A_\u06CC\u0648\u0632_\u0627\u06CC\u0631\u0627\u0646", "#\u062D\u0641\u0627\u0638\u062A_\u0637\u0628\u06CC\u0639\u062A", "#\u06CC\u0648\u0632\u067E\u0644\u0646\u06AF_\u0622\u0633\u06CC\u0627\u06CC\u06CC"],
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR")
      };
      res.json(storyCardData);
    } catch (error) {
      console.error("Error generating story card:", error);
      res.status(500).json({ error: "Failed to generate story card" });
    }
  });
  app2.get("/api/share-card/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { bg, text: text2, style } = req.query;
      const session = await storage.getGameSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      await storage.incrementTotalStoryDownloads();
      const canvas = createCanvas(768, 1344);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      if (bg && typeof bg === "string") {
        try {
          const backgroundPath = path.join(process.cwd(), "public", bg);
          const backgroundImage = await loadImage(backgroundPath);
          ctx.drawImage(backgroundImage, 0, 0, 768, 1344);
        } catch (error) {
          console.warn("Failed to load background image, using default gradient:", error);
          const gradient = ctx.createLinearGradient(0, 0, 0, 1344);
          gradient.addColorStop(0, "#1a365d");
          gradient.addColorStop(0.5, "#2d3748");
          gradient.addColorStop(1, "#1a202c");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 768, 1344);
        }
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, 1344);
        gradient.addColorStop(0, "#1a365d");
        gradient.addColorStop(0.5, "#2d3748");
        gradient.addColorStop(1, "#1a202c");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 768, 1344);
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 72px Arial";
      ctx.textAlign = "center";
      ctx.fillText("\u0646\u062C\u0627\u062A \u06CC\u0648\u0632 \u0627\u06CC\u0631\u0627\u0646", 384, 150);
      ctx.fillStyle = "#a0aec0";
      ctx.font = "36px Arial";
      ctx.fillText("\u0628\u0627\u0632\u06CC \u062D\u0641\u0627\u0638\u062A \u0627\u0632 \u06CC\u0648\u0632\u067E\u0644\u0646\u06AF \u0622\u0633\u06CC\u0627\u06CC\u06CC", 384, 220);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 60px Arial";
      ctx.fillText(`${session.cubsSurvived} \u062A\u0648\u0644\u0647 \u0646\u062C\u0627\u062A \u06CC\u0627\u0641\u062A`, 384, 350);
      ctx.fillStyle = "#68d391";
      ctx.font = "48px Arial";
      ctx.fillText(`\u062F\u0631 ${session.monthsCompleted} \u0645\u0627\u0647`, 384, 420);
      const achievementTitle = getAchievementTitle(session.cubsSurvived, session.monthsCompleted);
      ctx.fillStyle = "#fbb6ce";
      ctx.font = "bold 42px Arial";
      ctx.fillText(achievementTitle, 384, 500);
      const cubSize = 60;
      const totalCubWidth = session.cubsSurvived * cubSize;
      const startX = (768 - totalCubWidth) / 2;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i < session.cubsSurvived ? "#68d391" : "#4a5568";
        ctx.fillRect(startX + i * cubSize, 580, cubSize - 10, 40);
      }
      if (text2 && typeof text2 === "string") {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        const words = text2.split(" ");
        const lines = [];
        let currentLine = "";
        const maxWidth = 700;
        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        lines.forEach((line, index) => {
          ctx.fillText(line, 384, 700 + index * 35);
        });
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`\u0632\u0645\u0627\u0646 \u0628\u0627\u0632\u06CC: ${Math.floor(session.gameTime / 60)}:${(session.gameTime % 60).toString().padStart(2, "0")}`, 384, 720);
        ctx.fillText(`\u0627\u0645\u062A\u06CC\u0627\u0632 \u0646\u0647\u0627\u06CC\u06CC: ${session.finalScore.toLocaleString()}`, 384, 780);
      }
      ctx.textAlign = "center";
      ctx.fillStyle = "#fbb6ce";
      ctx.font = "bold 48px Arial";
      ctx.fillText("\u0634\u0645\u0627 \u0647\u0645 \u0628\u0627\u0632\u06CC \u06A9\u0646\u06CC\u062F!", 384, 900);
      ctx.fillStyle = "#a0aec0";
      ctx.font = "36px Arial";
      ctx.fillText("\u0648 \u062F\u0631 \u0646\u062C\u0627\u062A \u06CC\u0648\u0632\u067E\u0644\u0646\u06AF \u0622\u0633\u06CC\u0627\u06CC\u06CC \u0633\u0647\u06CC\u0645 \u0634\u0648\u06CC\u062F", 384, 960);
      ctx.fillStyle = "#60a5fa";
      ctx.font = "32px Arial";
      ctx.fillText("#\u0646\u062C\u0627\u062A_\u06CC\u0648\u0632_\u0627\u06CC\u0631\u0627\u0646 #\u062D\u0641\u0627\u0638\u062A_\u0637\u0628\u06CC\u0639\u062A", 384, 1050);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px Arial";
      ctx.fillText("\u0633\u0631\u0648\u06CC\u0646", 384, 1150);
      ctx.fillStyle = "#a0aec0";
      ctx.font = "28px Arial";
      const date = session.createdAt ? new Date(session.createdAt).toLocaleDateString("fa-IR") : (/* @__PURE__ */ new Date()).toLocaleDateString("fa-IR");
      ctx.fillText(date, 384, 1200);
      ctx.strokeStyle = "#68d391";
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, 668, 1244);
      const buffer = canvas.toBuffer("image/png", { compressionLevel: 0 });
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", 'inline; filename="share-card.png"');
      res.send(buffer);
    } catch (error) {
      console.error("Error generating share card image:", error);
      res.status(500).json({ error: "Failed to generate share card image" });
    }
  });
  app2.post("/api/download-client-image", async (req, res) => {
    try {
      const { imageDataUrl, filename } = req.body;
      if (!imageDataUrl || !filename) {
        return res.status(400).json({ error: "Image data URL and filename are required" });
      }
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Error downloading client image:", error);
      res.status(500).json({ error: "Failed to download client image" });
    }
  });
  app2.get("/api/stats/global", async (req, res) => {
    try {
      const stats = await storage.getGlobalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching global stats:", error);
      res.status(500).json({ error: "Failed to fetch global stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
function getAchievementTitle(cubsSurvived, monthsCompleted) {
  if (cubsSurvived === 4 && monthsCompleted >= 18) {
    return "\u0645\u0627\u062F\u0631 \u0642\u0647\u0631\u0645\u0627\u0646";
  } else if (cubsSurvived >= 2) {
    return "\u0645\u0627\u062F\u0631 \u0646\u062C\u0627\u062A\u200C\u062F\u0647\u0646\u062F\u0647";
  } else {
    return "\u0634\u0627\u0647\u062F \u0645\u0633\u0627\u0628\u0642\u0647";
  }
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tailwindcss from "@tailwindcss/vite";
var __dirname = path2.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared"),
      "@assets": path2.resolve(__dirname, "attached_assets")
    }
  },
  root: path2.resolve(__dirname, "client"),
  publicDir: path2.resolve(__dirname, "public"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    hmr: {
      overlay: false
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var __dirname2 = path3.dirname(fileURLToPath2(import.meta.url));
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ limit: "50mb", extended: false }));
app.use("/assets", (req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Expires", new Date(Date.now() + 36e5).toUTCString());
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  log(`Attempting to start server on port ${port}`);
  server.on("error", (err) => {
    log(`Server error: ${err.message}`);
    if (err.code === "EADDRINUSE") {
      log(`Port ${port} is already in use. Please kill the process using it or change the port.`);
    }
    process.exit(1);
  });
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`Server successfully started on port ${port}`);
  });
})();
var index_default = app;
export {
  index_default as default
};
