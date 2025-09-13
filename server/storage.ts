// server/storage.ts
import { Redis } from '@upstash/redis';

// کلاینت Upstash به صورت خودکار متغیرهای محیطی را می‌خواند
const redis = Redis.fromEnv();

// --- توابع مربوط به جلسات بازی ---

export async function createGameSession(sessionData: any) {
  const sessionId = sessionData.sessionId;
  // اشیاء را به صورت رشته JSON ذخیره می‌کنیم
  await redis.set(`session:${sessionId}`, JSON.stringify(sessionData));
  return sessionData;
}

export async function getGameSession(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`);
  // رشته JSON را دوباره به آبجکت تبدیل می‌کنیم
  return data ? JSON.parse(data as string) : null;
}

export async function updateGameSession(sessionId: string, updates: any) {
  const existingSession = await getGameSession(sessionId);
  if (!existingSession) return null;

  const updatedSession = { ...existingSession, ...updates };
  await redis.set(`session:${sessionId}`, JSON.stringify(updatedSession));
  return updatedSession;
}

// --- توابع مربوط به رویدادهای بازی ---

export async function createGameEvent(eventData: any) {
  const eventId = Math.random().toString(36).substr(2, 9);
  const event = { id: eventId, ...eventData, timestamp: new Date() };
  await redis.lpush(`events:${eventData.sessionId}`, JSON.stringify(event));
  return event;
}

export async function getGameEvents(sessionId: string) {
  const events = await redis.lrange(`events:${sessionId}`, 0, -1);
  return events.map(e => JSON.parse(e)).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// --- توابع مربوط به آمار روزانه ---

export async function updateDailyStats(date: string) {
  // Placeholder - daily stats update logic would be complex
  // For now, just store a simple count
  await redis.incr(`daily:${date}:games`);
}

export async function getGameStats(date: string) {
  const data = await redis.get(`stats:${date}`);
  return data ? JSON.parse(data as string) : null;
}

// --- توابع مربوط به آمار کلی ---

export async function incrementTotalGames() {
  // از دستور incr برای افزایش اتمی یک عدد استفاده می‌کنیم
  return redis.incr('stats:totalGames');
}

export async function incrementTotalCheetahsSaved(count: number) {
  return redis.incrby('stats:totalCheetahsSaved', count);
}

export async function incrementUniqueUsers(ip: string) {
  // از Set برای ذخیره آیتم‌های یکتا استفاده می‌کنیم. sadd اگر آیتم جدید باشد 1 برمی‌گرداند
  const isNewUser = await redis.sadd('stats:uniqueUsers', ip);
  if (isNewUser) {
    // اگر کاربر جدید بود، می‌توانیم یک شمارنده کلی هم داشته باشیم
    await redis.incr('stats:totalUniqueUsers');
  }
}

export async function incrementTotalStoryDownloads() {
  return redis.incr('stats:totalStoryDownloads');
}

export async function getGlobalStats() {
    const [totalGames, totalCheetahsSaved, uniqueUsers, totalStoryDownloads] = await Promise.all([
        redis.get('stats:totalGames'),
        redis.get('stats:totalCheetahsSaved'),
        redis.get('stats:totalUniqueUsers'),
        redis.get('stats:totalStoryDownloads')
    ]);
return {
        totalGames: totalGames ? parseInt(totalGames as string) : 0,
        totalCheetahsSaved: totalCheetahsSaved ? parseInt(totalCheetahsSaved as string) : 0,
        uniqueUsers: uniqueUsers ? parseInt(uniqueUsers as string) : 0,
        totalStoryDownloads: totalStoryDownloads ? parseInt(totalStoryDownloads as string) : 0,
    };
}
