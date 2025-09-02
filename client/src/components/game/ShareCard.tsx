import { useState, useEffect, useRef } from "react";
import { GameResults } from "@/types/game";

// Helper function to convert numbers to Persian digits
function toPersianDigits(num: number): string {
  return num.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
}

// Background selection logic
function getBackgroundForResults(results: GameResults, style?: 'digital' | 'miniature'): string {
  const selectedStyle = style || 'digital'; // Default to digital style

  if (results.monthsCompleted >= 18) {
    // Select background based on cubs survived using specific ShareCards
    const cubCount = Math.min(results.cubsSurvived, 4); // Ensure max 4
    return `/assets/ShareCards/${selectedStyle}-${cubCount}cub.png`;
  } else {
    // For users who didn't reach 18 months, use 0cub template
    return `/assets/ShareCards/${selectedStyle}-0cub.png`;
  }
}

// Generate motivational text based on results
function getMotivationalText(results: GameResults): string {
  if (results.monthsCompleted >= 18) {
    const cubsPersian = toPersianDigits(results.cubsSurvived);
    return `خوشبختانه من موفق شدم یوزپلنگ مادر رو با ${cubsPersian} توله نجات بدم. شما هم برای نجات یوزپلنگ بازی کنید!`;
  } else {
    const monthsPersian = toPersianDigits(results.monthsCompleted);
    return `متاسفانه من فقط ${monthsPersian} ماه تونستم خانواده یوزپلنگ را زنده نگه دارم و در نهایت اونهارو از دست دادم. شما هم برای نجات یوزپلنگ بازی کنید!`;
  }
}

// Style selector component for users who reached 18 months
function StyleSelector({ onSelect, selected }: { onSelect: (style: 'digital' | 'miniature') => void, selected: 'digital' | 'miniature' }) {
  const styles = [
    { id: 'digital', name: 'دیجیتال', description: 'سبک مدرن و دیجیتال' },
    { id: 'miniature', name: 'نگارگری ایرانی', description: 'سبک سنتی ایرانی' },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-center text-primary">انتخاب سبک تصویر</h4>
      <div className="grid grid-cols-2 gap-3">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id as 'digital' | 'miniature')}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              selected === style.id
                ? 'border-accent bg-accent/10'
                : 'border-muted hover:border-accent/50'
            }`}
          >
            <h5 className="font-bold text-sm">{style.name}</h5>
            <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}


interface ShareCardProps {
  results?: GameResults;
  bestScore?: {
    cubsSurvived: number;
    monthsCompleted: number;
    finalScore: number;
    achievementTitle: string;
    date: string;
  };
  onClose: () => void;
  onPlayAgain?: () => void;
  onBackToMenu?: () => void;
}

// A new component for client-side fallback preview
function ClientSideSharePreview({ results, selectedStyle }: { results: GameResults, selectedStyle?: 'digital' | 'miniature' }) {
  const backgroundImage = getBackgroundForResults(results, selectedStyle);
  const motivationalText = getMotivationalText(results);

  return (
    <div
      className="relative w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Main message box - positioned at 100px from top */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-[100px] w-11/12 max-w-md">
        <div className="p-2">

            <div className="text-xs text-white font-bold leading-relaxed text-center" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9), 0px 0px 4px rgba(0,0,0,1)', textAlign: 'center' }}>
              {motivationalText}
            </div>
          </div>
        </div>
      

      {/* Footer at 1240px from top */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-[430px] text-center">
        <div className="text-xs text-white/90 font-small py-1 text-center">۹ شهریور <br/>روز ملی یوزپلنگ ایرانی</div>
      </div>
    </div>
  );
}

export default function ShareCard({ results, bestScore, onClose, onPlayAgain, onBackToMenu }: ShareCardProps) {
  // Always use bestScore if provided, otherwise use results
  const gameResults: GameResults = bestScore ? {
    cubsSurvived: bestScore.cubsSurvived,
    monthsCompleted: bestScore.monthsCompleted,
    finalScore: bestScore.finalScore,
    gameTime: 0, // Not available in bestScore
    deathCause: undefined,
    achievements: [],
    achievementTitle: bestScore.achievementTitle,
    conservationMessage: 'یوزپلنگ آسیایی در معرض خطر انقراض است. با حمایت از حفاظت طبیعت به نجات این گونه کمک کنید.'
  } : results!;

  const [isSharing, setIsSharing] = useState(false);
  const [shareImageDataUrl, setShareImageDataUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'digital' | 'miniature'>('digital');
  const previewRef = useRef<HTMLDivElement>(null);

  const generateShareText = () => {
    const motivationalText = getMotivationalText(gameResults);

    if (gameResults.monthsCompleted >= 18) {
      return `${toPersianDigits(gameResults.cubsSurvived)} توله یوزپلنگ نجات یافت در ${toPersianDigits(gameResults.monthsCompleted)} ماه! ${gameResults.achievementTitle}

${motivationalText}

شما هم برای نجات یوزپلنگ آسیایی بازی کنید:
#نجات_یوز_ایران #حفاظت_طبیعت #یوزپلنگ_آسیایی`;
    } else {
      return `مقاومت ${toPersianDigits(gameResults.monthsCompleted)} ماهه در نجات خانواده یوزپلنگ!

${motivationalText}

شما هم برای نجات یوزپلنگ آسیایی بازی کنید:
#نجات_یوز_ایران #حفاظت_طبیعت #یوزپلنگ_آسیایی`;
    }
  };

  // Compose a high-resolution image (768x1344) entirely on the client to avoid downscaling
  useEffect(() => {
    const composeHighResShare = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 768;
      canvas.height = 1344;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;

      const backgroundPath = getBackgroundForResults(gameResults, selectedStyle);
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 768, 1344);

          // Draw motivational text block
          const text = getMotivationalText(gameResults);
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.direction = 'rtl';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 5;
          ctx.font = 'bold 36px Vazirmatn, IRANSans, Arial';

          // Simple word wrap
          const maxWidth = 640; // a bit of margin
          const lineHeight = 50;
          const words = text.split(' ');
          const lines: string[] = [];
          let currentLine = '';
          for (const w of words) {
            const test = currentLine ? `${currentLine} ${w}` : w;
            const m = ctx.measureText(test);
            if (m.width > maxWidth) {
              if (currentLine) lines.push(currentLine);
              currentLine = w;
            } else {
              currentLine = test;
            }
          }
          if (currentLine) lines.push(currentLine);

          // Draw lines centered around y=340 (roughly matching template)
          const startY = 400 - Math.floor(lines.length / 2) * lineHeight;
          lines.forEach((ln, idx) => ctx.fillText(ln, 384, startY + idx * lineHeight));
          ctx.restore();

          // Footer
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.direction = 'rtl';
          ctx.font = 'bold 32px Vazirmatn, IRANSans, Arial';
          ctx.fillText('۹ شهریور', 384, 1180);
          ctx.font = 'bold 32px Vazirmatn, IRANSans, Arial';
          ctx.fillText('روز ملی یوزپلنگ ایرانی', 384, 1228);
          ctx.restore();

          const dataUrl = canvas.toDataURL('image/png');
          setShareImageDataUrl(dataUrl);
          resolve();
        };
        img.onerror = () => reject(new Error('failed to load background'));
        img.src = backgroundPath;
      });
    };

    composeHighResShare().catch(() => setShareImageDataUrl(null));
  }, [gameResults, selectedStyle]);


  const downloadImage = async () => {
    setIsSharing(true);
    try {
      if (!shareImageDataUrl) return;
      const a = document.createElement('a');
      a.href = shareImageDataUrl;
      a.download = 'share-card.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('خطا در دانلود تصویر');
    } finally {
      setIsSharing(false);
    }
  };

  const copyGameLink = async () => {
    const gameUrl = 'https://game.sarvinwildlife.com/';

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(gameUrl);
        alert('لینک بازی کپی شد!');
        return;
      }
    } catch (error) {
      console.warn('Modern clipboard API failed, trying fallback:', error);
    }

    // Fallback for older browsers or mobile devices
    try {
      // Create a temporary input element
      const textArea = document.createElement('textarea');
      textArea.value = gameUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // Try to copy using document.execCommand
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        alert('لینک بازی کپی شد!');
      } else {
        throw new Error('execCommand failed');
      }
    } catch (fallbackError) {
      console.error('Fallback copy method also failed:', fallbackError);
      // Last resort: show the URL for manual copying
      alert(`لینک بازی: ${gameUrl}\nلطفا آن را کپی کنید.`);
    }
  };

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto" data-testid="share-card-screen">
      <div className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4 overflow-y-auto">
        <h3 className="text-xl font-bold text-center text-primary">اشتراک‌گذاری نتایج</h3>

        {/* Style selector - always visible for all users */}
        <StyleSelector
          onSelect={setSelectedStyle}
          selected={selectedStyle}
        />

        {/* Generated story card preview (9:16 aspect ratio) */}
        <div ref={previewRef} className="bg-gradient-to-b from-accent/20 to-secondary/20 rounded-lg p-4 aspect-[9/16] flex flex-col justify-center items-center">
          {shareImageDataUrl ? (
            <img
              src={shareImageDataUrl}
              alt="Share Card"
              className="w-full h-full object-contain rounded-lg shadow-lg"
            />
          ) : (
            // Loading state
            <div className="flex flex-col justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground mt-2">در حال تولید تصویر...</p>
            </div>
          )}
        </div>

        {/* Share buttons - always show */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://www.instagram.com/sarvinwildlife/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg text-sm text-center hover:from-purple-600 hover:to-pink-600 transition-all"
            data-testid="button-follow-instagram"
          >
              اینستاگرام ما
          </a>
          <button
            onClick={downloadImage}
            disabled={isSharing}
            className="bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-sm disabled:opacity-50"
            data-testid="button-download-image"
          >
            دانلود تصویر
          </button>
        </div>

        {/* Game link section */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-center text-primary">لینک بازی</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value="https://game.sarvinwildlife.com/"
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-lg bg-muted"
            />
            <button
              onClick={copyGameLink}
              className="bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg text-sm hover:bg-primary/90"
            >
              کپی
            </button>
          </div>
        </div>


        {/* Direct navigation buttons */}
        {(onPlayAgain || onBackToMenu) && (
          <div className="grid grid-cols-2 gap-3">
            {onPlayAgain && (
              <button
                onClick={onPlayAgain}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg text-sm"
              >
                بازی مجدد
              </button>
            )}
            {onBackToMenu && (
              <button
                onClick={onBackToMenu}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-3 px-4 rounded-lg text-sm"
              >
                بازگشت به منوی اصلی
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
