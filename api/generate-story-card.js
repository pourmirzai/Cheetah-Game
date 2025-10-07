export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}