import { storage } from "../../server/storage.js";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = nanoid();
    const deviceType = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

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

    // Update global stats
    await storage.incrementUniqueUsers(ip);
    await storage.incrementTotalGames();

    res.json({ sessionId, success: true });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
}