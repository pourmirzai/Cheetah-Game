import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertGameEventSchema, insertLeaderboardSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game session routes
  app.post("/api/game/start", async (req, res) => {
    try {
      const sessionId = nanoid();
      const deviceType = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
      
      const session = await storage.createGameSession({
        sessionId,
        cubsSurvived: 4,
        monthsCompleted: 0,
        finalScore: 0,
        gameTime: 0,
        deviceType,
        achievements: []
      });

      // Track game start event
      await storage.createGameEvent({
        sessionId,
        eventType: 'game_start',
        eventData: { deviceType }
      });

      res.json({ sessionId, success: true });
    } catch (error) {
      console.error('Error starting game:', error);
      res.status(500).json({ error: 'Failed to start game' });
    }
  });

  app.post("/api/game/end", async (req, res) => {
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
        return res.status(404).json({ error: 'Session not found' });
      }

      // Create leaderboard entry only if it doesn't exist
      const achievementTitle = getAchievementTitle(validatedData.cubsSurvived, validatedData.monthsCompleted);
      try {
        await storage.createLeaderboardEntry({
          sessionId: validatedData.sessionId,
          cubsSurvived: validatedData.cubsSurvived,
          monthsCompleted: validatedData.monthsCompleted,
          finalScore: validatedData.finalScore,
          province: validatedData.province,
          achievementTitle
        });
      } catch (error: any) {
        // Ignore if leaderboard entry already exists
        if (!error.code || error.code !== '23505') {
          throw error;
        }
      }

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      await storage.updateDailyStats(today);

      res.json({ success: true, session, achievementTitle });
    } catch (error) {
      console.error('Error ending game:', error);
      res.status(500).json({ error: 'Failed to end game' });
    }
  });

  app.post("/api/game/event", async (req, res) => {
    try {
      const validatedData = insertGameEventSchema.parse(req.body);
      
      const event = await storage.createGameEvent(validatedData);
      res.json({ success: true, event });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topPlayers = await storage.getTopPlayers(limit);
      const todayStats = await storage.getTodayStats();
      
      res.json({
        topPlayers,
        stats: todayStats
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Story card generation
  app.post("/api/generate-story-card", async (req, res) => {
    try {
      const { sessionId, cubsSurvived, monthsCompleted, achievementTitle } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }

      // Generate story card data
      const storyCardData = {
        cubsSurvived,
        monthsCompleted,
        achievementTitle,
        shareText: `${cubsSurvived} توله نجات یافت در ${monthsCompleted} ماه! ${achievementTitle}`,
        hashtags: ['#نجات_یوز_ایران', '#حفاظت_طبیعت', '#یوزپلنگ_آسیایی'],
        date: new Date().toLocaleDateString('fa-IR')
      };

      res.json(storyCardData);
    } catch (error) {
      console.error('Error generating story card:', error);
      res.status(500).json({ error: 'Failed to generate story card' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getAchievementTitle(cubsSurvived: number, monthsCompleted: number): string {
  if (cubsSurvived === 4 && monthsCompleted >= 18) {
    return "مادر خط‌شکن";
  } else if (cubsSurvived >= 2) {
    return "نگهبان مسیر";
  } else {
    return "شاهد مسابقه";
  }
}
