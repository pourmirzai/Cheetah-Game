import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertGameEventSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { createCanvas } from "canvas";
import * as fs from "fs";
import * as path from "path";

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

      // Calculate achievement title
      const achievementTitle = getAchievementTitle(session.cubsSurvived, session.monthsCompleted);

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

  // Server-side share card image generation
  app.get("/api/share-card/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Get game session data
      const session = await storage.getGameSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Create canvas for share card (1080x1920 as per documentation)
      const canvas = createCanvas(1080, 1920);
      const ctx = canvas.getContext('2d');

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, '#1a365d'); // Dark blue
      gradient.addColorStop(0.5, '#2d3748'); // Gray
      gradient.addColorStop(1, '#1a202c'); // Dark gray
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('نجات یوز ایران', 540, 150);

      // Subtitle
      ctx.fillStyle = '#a0aec0';
      ctx.font = '36px Arial';
      ctx.fillText('بازی حفاظت از یوزپلنگ آسیایی', 540, 220);

      // Results section
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(`${session.cubsSurvived} توله نجات یافت`, 540, 350);

      ctx.fillStyle = '#68d391';
      ctx.font = '48px Arial';
      ctx.fillText(`در ${session.monthsCompleted} ماه`, 540, 420);

      // Achievement title
      const achievementTitle = getAchievementTitle(session.cubsSurvived, session.monthsCompleted);
      ctx.fillStyle = '#fbb6ce';
      ctx.font = 'bold 42px Arial';
      ctx.fillText(achievementTitle, 540, 500);

      // Cubs visualization
      const cubSize = 60;
      const startX = 540 - (session.cubsSurvived * cubSize) / 2;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i < session.cubsSurvived ? '#68d391' : '#4a5568';
        ctx.fillRect(startX + i * cubSize, 580, cubSize - 10, 40);
      }

      // Stats
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`زمان بازی: ${Math.floor(session.gameTime / 60)}:${(session.gameTime % 60).toString().padStart(2, '0')}`, 100, 720);
      ctx.fillText(`امتیاز نهایی: ${session.finalScore.toLocaleString()}`, 100, 780);

      // Call to action
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbb6ce';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('شما هم بازی کنید!', 540, 900);

      ctx.fillStyle = '#a0aec0';
      ctx.font = '36px Arial';
      ctx.fillText('و در نجات یوزپلنگ آسیایی سهیم شوید', 540, 960);

      // Hashtags
      ctx.fillStyle = '#60a5fa';
      ctx.font = '32px Arial';
      ctx.fillText('#نجات_یوز_ایران #حفاظت_طبیعت', 540, 1050);

      // Logo/Branding
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('سروین', 540, 1150);

      // Date
      ctx.fillStyle = '#a0aec0';
      ctx.font = '28px Arial';
      const date = session.createdAt ? new Date(session.createdAt).toLocaleDateString('fa-IR') : new Date().toLocaleDateString('fa-IR');
      ctx.fillText(date, 540, 1200);

      // Decorative elements
      ctx.strokeStyle = '#68d391';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, 980, 1820);

      // Convert canvas to buffer and send as response
      const buffer = canvas.toBuffer('image/png');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="share-card.png"');
      res.send(buffer);

    } catch (error) {
      console.error('Error generating share card image:', error);
      res.status(500).json({ error: 'Failed to generate share card image' });
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
