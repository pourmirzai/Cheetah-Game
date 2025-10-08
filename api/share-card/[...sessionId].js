export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return a simple placeholder image or redirect to client-side generation
    res.status(200).json({
      message: 'Share card generation is handled client-side',
      useClientSide: true
    });
  } catch (error) {
    console.error('Error with share card:', error);
    res.status(500).json({ error: 'Share card not available' });
  }
}