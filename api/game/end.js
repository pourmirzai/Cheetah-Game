import { storage } from "../../server/storage.js";
import { insertGameSessionSchema } from "../../shared/schema.js";

function getAchievementTitle(cubsSurvived, monthsCompleted) {
  if (cubsSurvived === 4 && monthsCompleted >= 18) {
    return "مادر قهرمان";
  } else if (cubsSurvived >= 2) {
    return "مادر نجات‌دهنده";
  } else {
    return "شاهد مسابقه";
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}