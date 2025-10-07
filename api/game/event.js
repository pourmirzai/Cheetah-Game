import { storage } from "../../server/storage.js";
import { insertGameEventSchema } from "../../shared/schema.js";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = insertGameEventSchema.parse(req.body);

    const event = await storage.createGameEvent(validatedData);
    res.json({ success: true, event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}