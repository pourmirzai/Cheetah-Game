import type { Express } from "express";
import { storage } from "./storage";
import { insertGameSessionSchema, insertGameEventSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { createCanvas, loadImage } from "canvas";
import { Redis } from '@upstash/redis';
import * as fs from "fs";
import * as path from "path";

// Initialize Upstash Redis client
const redis = Redis.fromEnv();

export function registerRoutes(app: Express): Express {
  // Game session routes
  app.post("/api/game/start", async (req, res) => {
    try {
      const sessionId = nanoid();
      const deviceType = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
      const ip = req.ip || req.connection.remoteAddress || 'unknown';

      const session = await storage.createGameSession({
        sessionId,
        cubsSurvived: 4,
        monthsCompleted: 0,
        finalScore: 0,
        gameTime: 0,
        deviceType,
        achievements: []
      });

      // Track session for daily stats
      const today = new Date().toISOString().split('T')[0];
      await redis.sadd(`daily_sessions:${today}`, sessionId);

      // Track game start event
      await storage.createGameEvent({
        sessionId,
        eventType: 'game_start',
        eventData: { deviceType }
      });

      // Update global stats
      await storage.incrementUniqueUsers(ip);
      await storage.incrementTotalGames();

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

      // Update global stats
      await storage.incrementTotalCheetahsSaved(session.cubsSurvived);

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
      const { bg, text, style } = req.query;

      // Get game session data
      const session = await storage.getGameSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Update global stats
      await storage.incrementTotalStoryDownloads();

      // Create canvas for share card with original dimensions to prevent resizing
      const canvas = createCanvas(768, 1344); // Original dimensions to match card size
      const ctx = canvas.getContext('2d');

      // Enable high quality rendering
      ctx.imageSmoothingEnabled = true;

      // Use custom background if provided, otherwise use default gradient
      if (bg && typeof bg === 'string') {
        try {
          // Load background image
          const backgroundPath = path.join(process.cwd(), 'public', bg);
          const backgroundImage = await loadImage(backgroundPath);

          // Draw background image directly to fill the canvas
          ctx.drawImage(backgroundImage, 0, 0, 768, 1344);
        } catch (error) {
          console.warn('Failed to load background image, using default gradient:', error);
          // Fallback to default gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, 1344);
          gradient.addColorStop(0, '#1a365d'); // Dark blue
          gradient.addColorStop(0.5, '#2d3748'); // Gray
          gradient.addColorStop(1, '#1a202c'); // Dark gray
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 768, 1344);
        }
      } else {
        // Default gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, 1344);
        gradient.addColorStop(0, '#1a365d'); // Dark blue
        gradient.addColorStop(0.5, '#2d3748'); // Gray
        gradient.addColorStop(1, '#1a202c'); // Dark gray
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 768, 1344);
      }

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('نجات یوز ایران', 384, 150); // Centered horizontally

      // Subtitle
      ctx.fillStyle = '#a0aec0';
      ctx.font = '36px Arial';
      ctx.fillText('بازی حفاظت از یوزپلنگ آسیایی', 384, 220); // Centered horizontally

      // Results section
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(`${session.cubsSurvived} توله نجات یافت`, 384, 350); // Centered horizontally

      ctx.fillStyle = '#68d391';
      ctx.font = '48px Arial';
      ctx.fillText(`در ${session.monthsCompleted} ماه`, 384, 420); // Centered horizontally

      // Achievement title
      const achievementTitle = getAchievementTitle(session.cubsSurvived, session.monthsCompleted);
      ctx.fillStyle = '#fbb6ce';
      ctx.font = 'bold 42px Arial';
      ctx.fillText(achievementTitle, 384, 500); // Centered horizontally

      // Cubs visualization
      const cubSize = 60;
      const totalCubWidth = session.cubsSurvived * cubSize;
      const startX = (768 - totalCubWidth) / 2; // Center cubs horizontally
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i < session.cubsSurvived ? '#68d391' : '#4a5568';
        ctx.fillRect(startX + i * cubSize, 580, cubSize - 10, 40);
      }

      // Custom text overlay if provided
      if (text && typeof text === 'string') {
        // Draw text directly on background without effects
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';

        // Word wrap the text
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        const maxWidth = 700; // Adjusted max width for text

        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        // Draw each line
        lines.forEach((line, index) => {
          ctx.fillText(line, 384, 700 + (index * 35)); // Centered horizontally
        });
      } else {
        // Default stats section
        ctx.fillStyle = '#ffffff';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center'; // Centered horizontally
        ctx.fillText(`زمان بازی: ${Math.floor(session.gameTime / 60)}:${(session.gameTime % 60).toString().padStart(2, '0')}`, 384, 720);
        ctx.fillText(`امتیاز نهایی: ${session.finalScore.toLocaleString()}`, 384, 780);
      }

      // Call to action
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbb6ce';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('شما هم بازی کنید!', 384, 900); // Centered horizontally

      ctx.fillStyle = '#a0aec0';
      ctx.font = '36px Arial';
      ctx.fillText('و در نجات یوزپلنگ آسیایی سهیم شوید', 384, 960); // Centered horizontally

      // Hashtags
      ctx.fillStyle = '#60a5fa';
      ctx.font = '32px Arial';
      ctx.fillText('#نجات_یوز_ایران #حفاظت_طبیعت', 384, 1050); // Centered horizontally

      // Logo/Branding
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('سروین', 384, 1150); // Centered horizontally

      // Date
      ctx.fillStyle = '#a0aec0';
      ctx.font = '28px Arial';
      const date = session.createdAt ? new Date(session.createdAt).toLocaleDateString('fa-IR') : new Date().toLocaleDateString('fa-IR');
      ctx.fillText(date, 384, 1200); // Centered horizontally

      // Decorative elements
      ctx.strokeStyle = '#68d391';
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, 668, 1244); // Adjusted to fit within 768x1344 and centered

      // Convert canvas to buffer and send as response with no compression
      const buffer = canvas.toBuffer('image/png', { compressionLevel: 0 });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="share-card.png"');
      res.send(buffer);

    } catch (error) {
      console.error('Error generating share card image:', error);
      res.status(500).json({ error: 'Failed to generate share card image' });
    }
  });

  // New endpoint for client-side image download
  app.post("/api/download-client-image", async (req, res) => {
    try {
      const { imageDataUrl, filename } = req.body;

      if (!imageDataUrl || !filename) {
        return res.status(400).json({ error: 'Image data URL and filename are required' });
      }

      // Decode base64 image data
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');

      // Force download by setting Content-Type to application/octet-stream
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);

    } catch (error) {
      console.error('Error downloading client image:', error);
      res.status(500).json({ error: 'Failed to download client image' });
    }
  });

  // Global stats endpoint
  app.get("/api/stats/global", async (req, res) => {
    try {
      const stats = await storage.getGlobalStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching global stats:', error);
      res.status(500).json({ error: 'Failed to fetch global stats' });
    }
  });

  return app;
}

function getAchievementTitle(cubsSurvived: number, monthsCompleted: number): string {
  if (cubsSurvived === 4 && monthsCompleted >= 18) {
    return "مادر قهرمان";
  } else if (cubsSurvived >= 2) {
    return "مادر نجات‌دهنده";
  } else {
    return "شاهد مسابقه";
  }
}
