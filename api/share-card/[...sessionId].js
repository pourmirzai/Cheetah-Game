import { storage } from "../../server/storage.js";
import { createCanvas, loadImage } from "canvas";
import * as fs from "fs";
import * as path from "path";

function getAchievementTitle(cubsSurvived, monthsCompleted) {
  if (cubsSurvived === 4 && monthsCompleted >= 18) {
    return "مادر قهرمان";
  } else if (cubsSurvived >= 2) {
    return "مادر نجات‌دهنده";
  } else {
    return "شاهد مسابقه";
  }
}

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;
    const sessionIdString = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    const { bg, text, style } = req.query;

    // Get game session data
    const session = await storage.getGameSession(sessionIdString);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update global stats
    await storage.incrementTotalStoryDownloads();

    // Create canvas for share card with original dimensions to prevent resizing
    const canvas = createCanvas(768, 1344); // Original dimensions to match card size
    const ctx = canvas.getContext('2d');

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;

    // Use custom background if provided, otherwise use default gradient
    if (bg && typeof bg === 'string') {
      try {
        // Load background image
        const backgroundPath = path.join(process.cwd(), 'public', bg);
        const backgroundImage = await loadImage(backgroundPath);

        // Draw background image directly to fill the canvas
        ctx.drawImage(backgroundImage, 0, 0, 768, 1344);
      } catch (error) {
        console.warn('Failed to load background image, using default gradient:', error);
        // Fallback to default gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 1344);
        gradient.addColorStop(0, '#1a365d'); // Dark blue
        gradient.addColorStop(0.5, '#2d3748'); // Gray
        gradient.addColorStop(1, '#1a202c'); // Dark gray
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 768, 1344);
      }
    } else {
      // Default gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, 1344);
      gradient.addColorStop(0, '#1a365d'); // Dark blue
      gradient.addColorStop(0.5, '#2d3748'); // Gray
      gradient.addColorStop(1, '#1a202c'); // Dark gray
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 768, 1344);
    }

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('نجات یوز ایران', 384, 150); // Centered horizontally

    // Subtitle
    ctx.fillStyle = '#a0aec0';
    ctx.font = '36px Arial';
    ctx.fillText('بازی حفاظت از یوزپلنگ آسیایی', 384, 220); // Centered horizontally

    // Results section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.fillText(`${session.cubsSurvived} توله نجات یافت`, 384, 350); // Centered horizontally

    ctx.fillStyle = '#68d391';
    ctx.font = '48px Arial';
    ctx.fillText(`در ${session.monthsCompleted} ماه`, 384, 420); // Centered horizontally

    // Achievement title
    const achievementTitle = getAchievementTitle(session.cubsSurvived, session.monthsCompleted);
    ctx.fillStyle = '#fbb6ce';
    ctx.font = 'bold 42px Arial';
    ctx.fillText(achievementTitle, 384, 500); // Centered horizontally

    // Cubs visualization
    const cubSize = 60;
    const totalCubWidth = session.cubsSurvived * cubSize;
    const startX = (768 - totalCubWidth) / 2; // Center cubs horizontally
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i < session.cubsSurvived ? '#68d391' : '#4a5568';
      ctx.fillRect(startX + i * cubSize, 580, cubSize - 10, 40);
    }

    // Custom text overlay if provided
    if (text && typeof text === 'string') {
      // Draw text directly on background without effects
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';

      // Word wrap the text
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      const maxWidth = 700; // Adjusted max width for text

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // Draw each line
      lines.forEach((line, index) => {
        ctx.fillText(line, 384, 700 + (index * 35)); // Centered horizontally
      });
    } else {
      // Default stats section
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center'; // Centered horizontally
      ctx.fillText(`زمان بازی: ${Math.floor(session.gameTime / 60)}:${(session.gameTime % 60).toString().padStart(2, '0')}`, 384, 720);
      ctx.fillText(`امتیاز نهایی: ${session.finalScore.toLocaleString()}`, 384, 780);
    }

    // Call to action
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbb6ce';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('شما هم بازی کنید!', 384, 900); // Centered horizontally

    ctx.fillStyle = '#a0aec0';
    ctx.font = '36px Arial';
    ctx.fillText('و در نجات یوزپلنگ آسیایی سهیم شوید', 384, 960); // Centered horizontally

    // Hashtags
    ctx.fillStyle = '#60a5fa';
    ctx.font = '32px Arial';
    ctx.fillText('#نجات_یوز_ایران #حفاظت_طبیعت', 384, 1050); // Centered horizontally

    // Logo/Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('سروین', 384, 1150); // Centered horizontally

    // Date
    ctx.fillStyle = '#a0aec0';
    ctx.font = '28px Arial';
    const date = session.createdAt ? new Date(session.createdAt).toLocaleDateString('fa-IR') : new Date().toLocaleDateString('fa-IR');
    ctx.fillText(date, 384, 1200); // Centered horizontally

    // Decorative elements
    ctx.strokeStyle = '#68d391';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 668, 1244); // Adjusted to fit within 768x1344 and centered

    // Convert canvas to buffer and send as response with no compression
    const buffer = canvas.toBuffer('image/png', { compressionLevel: 0 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="share-card.png"');
    res.send(buffer);

  } catch (error) {
    console.error('Error generating share card image:', error);
    res.status(500).json({ error: 'Failed to generate share card image' });
  }
}