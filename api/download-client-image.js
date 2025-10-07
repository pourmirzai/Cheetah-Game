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
}