export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageDataUrl, filename } = req.body;

    if (!imageDataUrl || !filename) {
      return res.status(400).json({ error: 'Image data URL and filename are required' });
    }

    // For serverless environments, just return success
    // Client-side download is handled by the browser
    res.json({ success: true, message: 'Image download handled client-side' });

  } catch (error) {
    console.error('Error with client image:', error);
    res.status(500).json({ error: 'Failed to process client image' });
  }
}