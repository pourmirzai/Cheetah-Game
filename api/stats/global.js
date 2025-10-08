export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return mock stats since we don't have persistent storage
    const stats = {
      uniqueUsers: 100,
      totalGames: 500,
      totalStoryDownloads: 50,
      totalCheetahsSaved: 200
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Failed to fetch global stats' });
  }
}