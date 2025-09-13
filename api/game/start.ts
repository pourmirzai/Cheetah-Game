import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    res.status(200).json({ message: "Game started" });
  } else {
    res.status(405).end(); // Method not allowed
  }
}