import { nanoid } from 'nanoid';

export default function handler(req: any, res: any) {
  try {
    console.log('[Serverless test] /api/game/start invoked, method=', req.method);
    console.log('[Serverless test] headers=', JSON.stringify(req.headers || {}));
  } catch (e) {
    console.log('[Serverless test] logging error', e);
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sessionId = nanoid();
  res.status(200).json({ success: true, sessionId, note: 'serverless-route-test' });
}
