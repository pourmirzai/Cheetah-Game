import { useState, useEffect } from "react";
import { GameResults } from "@/types/game";

// Background selection logic
function getBackgroundForResults(results: GameResults, selectedTemplate?: string | null, style?: 'digital' | 'miniature'): string {
  const selectedStyle = style || 'digital'; // Default to digital style

  if (results.monthsCompleted >= 18) {
    // Select background based on cubs survived using specific ShareCards
    const cubCount = Math.min(results.cubsSurvived, 4); // Ensure max 4
    return `/assets/ShareCards/${selectedStyle}-${cubCount}cub.png`;
  } else {
    // For users who didn't reach 18 months, use 0cub template or selected template
    return selectedTemplate || `/assets/ShareCards/${selectedStyle}-0cub.png`;
  }
}

// Generate motivational text based on results
function getMotivationalText(results: GameResults): string {
  if (results.monthsCompleted >= 18) {
    const cubsText = results.cubsSurvived === 4 ? 'تمام خانواده' :
                    results.cubsSurvived >= 2 ? 'بیشتر خانواده' : 'بخشی از خانواده';

    return `یوزپلنگ آسیایی نماد قدرت و استقامت است. شما توانستید ${cubsText} را تا ۱۸ ماهگی زنده نگه دارید. این نشان‌دهنده اهمیت حفاظت از محیط زیست و حیات وحش است.`;
  } else {
    return `یوزپلنگ آسیایی نماد قدرت و استقامت است. شما ${results.monthsCompleted} ماه توانستید خانواده را زنده نگه دارید. هر تلاشی برای حفاظت از طبیعت ارزشمند است.`;
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

// Template selection component for users who didn't reach 18 months
function TemplateSelector({ onSelect, selected }: { onSelect: (template: string) => void, selected: string | null }) {
  const templates = [
    { id: 'digital-0cub', name: 'دیجیتال', image: '/assets/ShareCards/digital-0cub.png' },
    { id: 'miniature-0cub', name: 'نگارگری ایرانی', image: '/assets/ShareCards/miniature-0cub.png' },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-center text-primary">انتخاب تصویر پس‌زمینه</h4>
      <p className="text-sm text-center text-muted-foreground">برای رسیدن به تصاویر بهتر، دوباره بازی کنید!</p>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.image)}
            className={`p-2 rounded-lg border-2 transition-all ${
              selected === template.image
                ? 'border-accent bg-accent/10'
                : 'border-muted hover:border-accent/50'
            }`}
          >
            <img
              src={template.image}
              alt={template.name}
              className="w-full h-32 object-contain rounded"
            />
            <p className="text-xs text-center mt-1">{template.name}</p>
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
}

// A new component for client-side fallback preview
function ClientSideSharePreview({ results, selectedTemplate, selectedStyle }: { results: GameResults, selectedTemplate?: string | null, selectedStyle?: 'digital' | 'miniature' }) {
  const backgroundImage = getBackgroundForResults(results, selectedTemplate, selectedStyle);
  const motivationalText = getMotivationalText(results);

  return (
    <div
      className="flex flex-col justify-between text-center h-full p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10">
        <h2 className="text-lg font-bold text-white">نجات یوز ایران</h2>
        <p className="text-xs text-white/80 mt-1">نتایج من در بازی حفاظت</p>
      </div>

      <div className="space-y-4 relative z-10">
        {results.monthsCompleted >= 18 && (
          <div className="flex justify-center space-x-2 space-x-reverse">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-6 rounded-full ${
                  i < results.cubsSurvived ? 'bg-yellow-400' : 'bg-white/30'
                }`}
              ></div>
            ))}
          </div>
        )}

        <div>
          <div className="text-2xl font-bold text-white">
            {results.monthsCompleted >= 18
              ? `${results.cubsSurvived} توله نجات یافت`
              : `${results.monthsCompleted} ماه مقاومت`}
          </div>
          <div className="text-sm text-white/90 mt-2 px-2">
            {results.monthsCompleted >= 18
              ? results.achievementTitle
              : `مقاومت ${results.monthsCompleted} ماهه`}
          </div>
        </div>

        <div className="text-xs text-white/80 font-medium px-2 leading-relaxed">
          {motivationalText}
        </div>

        <div className="text-xs text-white font-medium">شما هم برای نجات یوزپلنگ بازی کنید!</div>
      </div>

      <div className="relative z-10">
        <div className="text-xs text-white/70">#نجات_یوز_ایران</div>
        <div className="text-xs text-white/70">سروین | {new Date().toLocaleDateString('fa-IR')}</div>
      </div>
    </div>
  );
}

export default function ShareCard({ results, bestScore, onClose }: ShareCardProps) {
  // Convert bestScore to GameResults format if provided
  const gameResults: GameResults = results || {
    cubsSurvived: bestScore!.cubsSurvived,
    monthsCompleted: bestScore!.monthsCompleted,
    finalScore: bestScore!.finalScore,
    gameTime: 0, // Not available in bestScore
    deathCause: undefined,
    achievements: [],
    achievementTitle: bestScore!.achievementTitle,
    conservationMessage: 'یوزپلنگ آسیایی در معرض خطر انقراض است. با حمایت از حفاظت طبیعت به نجات این گونه کمک کنید.'
  };

  const [isSharing, setIsSharing] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'digital' | 'miniature'>('digital');
  const [showTemplateSelector, setShowTemplateSelector] = useState(gameResults.monthsCompleted < 18);
  const [showStyleSelector, setShowStyleSelector] = useState(gameResults.monthsCompleted >= 18);

  const generateShareText = () => {
    const motivationalText = getMotivationalText(gameResults);

    if (gameResults.monthsCompleted >= 18) {
      return `${gameResults.cubsSurvived} توله یوزپلنگ نجات یافت در ${gameResults.monthsCompleted} ماه! ${gameResults.achievementTitle}

${motivationalText}

شما هم برای نجات یوزپلنگ آسیایی بازی کنید:
#نجات_یوز_ایران #حفاظت_طبیعت #یوزپلنگ_آسیایی`;
    } else {
      return `مقاومت ${gameResults.monthsCompleted} ماهه در نجات خانواده یوزپلنگ!

${motivationalText}

شما هم برای نجات یوزپلنگ آسیایی بازی کنید:
#نجات_یوز_ایران #حفاظت_طبیعت #یوزپلنگ_آسیایی`;
    }
  };

  // Generate share image URL when component mounts or selections change
  useEffect(() => {
    // In a real implementation, you'd get the sessionId from props or context
    // For now, we'll use a placeholder
    const sessionId = 'placeholder-session-id';
    const backgroundImage = getBackgroundForResults(gameResults, selectedTemplate, selectedStyle);
    const motivationalText = getMotivationalText(gameResults);

    // For now, we'll use the client-side preview since we don't have server-side image generation
    // In production, this would call an API to generate the image with the selected background
    setShareImageUrl(`/api/share-card/${sessionId}?bg=${encodeURIComponent(backgroundImage)}&text=${encodeURIComponent(motivationalText)}&style=${selectedStyle}`);
  }, [gameResults, selectedTemplate, selectedStyle]);

  const shareToTelegram = async () => {
    setIsSharing(true);
    try {
      const shareText = generateShareText();
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`;
      window.open(telegramUrl, '_blank');
    } catch (error) {
      console.error('Error sharing to Telegram:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const shareToInstagram = async () => {
    setIsSharing(true);
    try {
      // For Instagram, we'll use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'نجات یوز ایران',
          text: generateShareText(),
          url: window.location.origin
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(generateShareText());
        alert('متن در کلیپ‌بورد کپی شد! آن را در اینستاگرام استوری خود پیست کنید.');
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6" data-testid="share-card-screen">
      <div className="bg-background rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
        <h3 className="text-xl font-bold text-center text-primary">اشتراک‌گذاری نتایج</h3>

        {/* Style selector for users who reached 18 months */}
        {showStyleSelector && (
          <StyleSelector
            onSelect={(style) => {
              setSelectedStyle(style);
              setShowStyleSelector(false);
            }}
            selected={selectedStyle}
          />
        )}

        {/* Template selector for users who didn't reach 18 months */}
        {showTemplateSelector && (
          <TemplateSelector
            onSelect={(template) => {
              setSelectedTemplate(template);
              setShowTemplateSelector(false);
            }}
            selected={selectedTemplate}
          />
        )}

        {/* Generated story card preview (9:16 aspect ratio) */}
        {!showTemplateSelector && (
          <div className="bg-gradient-to-b from-accent/20 to-secondary/20 rounded-lg p-4 aspect-[9/16] flex flex-col justify-center items-center">
            {shareImageUrl && !imageLoadFailed ? (
              <img
                src={shareImageUrl}
                alt="Share Card"
                className="w-full h-full object-contain rounded-lg shadow-lg"
                onError={() => setImageLoadFailed(true)}
              />
            ) : imageLoadFailed ? (
              // Fallback to client-side rendering on image error
              <ClientSideSharePreview results={gameResults} selectedTemplate={selectedTemplate} selectedStyle={selectedStyle} />
            ) : (
              // Loading state
              <div className="flex flex-col justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground mt-2">در حال تولید تصویر...</p>
              </div>
            )}
          </div>
        )}

        {/* Share buttons - only show when selections are complete */}
        {!showTemplateSelector && !showStyleSelector && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareToInstagram}
                disabled={isSharing}
                className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg text-sm disabled:opacity-50"
                data-testid="button-share-instagram"
              >
                اینستاگرام
              </button>
              <button
                onClick={shareToTelegram}
                disabled={isSharing}
                className="bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-sm disabled:opacity-50"
                data-testid="button-share-telegram"
              >
                تلگرام
              </button>
            </div>

            <button
              onClick={onClose}
              className="bg-muted hover:bg-muted/90 text-muted-foreground font-medium py-2 px-4 rounded-lg w-full"
              data-testid="button-close-share-card"
            >
              بستن
            </button>
          </>
        )}

        {/* Back button for selections */}
        {(showTemplateSelector || showStyleSelector) && (
          <button
            onClick={onClose}
            className="bg-muted hover:bg-muted/90 text-muted-foreground font-medium py-2 px-4 rounded-lg w-full"
          >
            بازگشت
          </button>
        )}
      </div>
    </div>
  );
}
