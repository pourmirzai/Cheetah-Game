export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Game end request received:', req.body);

    // Simple validation
    const data = req.body;
    if (!data || !data.sessionId) {
      console.error('Invalid request data:', data);
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Calculate achievement title based on results
    const cubsSurvived = data.cubsSurvived || 0;
    const monthsCompleted = data.monthsCompleted || 0;

    let achievementTitle = "شاهد مسابقه";
    if (cubsSurvived === 4 && monthsCompleted >= 18) {
      achievementTitle = "مادر قهرمان";
    } else if (cubsSurvived >= 2) {
      achievementTitle = "مادر نجات‌دهنده";
    }

    console.log('Game ended successfully:', { sessionId: data.sessionId, achievementTitle });

    res.json({ success: true, achievementTitle });
  } catch (error) {
    console.error('Error ending game:', error);
    res.status(500).json({ error: 'Failed to end game', details: error.message });
  }
}