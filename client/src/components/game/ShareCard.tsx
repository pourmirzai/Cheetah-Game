import { useState } from "react";
import { GameResults } from "@/types/game";

interface ShareCardProps {
  results: GameResults;
  onClose: () => void;
}

export default function ShareCard({ results, onClose }: ShareCardProps) {
  const [isSharing, setIsSharing] = useState(false);

  const generateShareText = () => {
    return `${results.cubsSurvived} توله یوزپلنگ نجات یافت در ${results.monthsCompleted} ماه! ${results.achievementTitle}

شما هم برای نجات یوزپلنگ آسیایی بازی کنید:
#نجات_یوز_ایران #حفاظت_طبیعت #یوزپلنگ_آسیایی`;
  };

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
        
        {/* Generated story card preview (9:16 aspect ratio) */}
        <div className="bg-gradient-to-b from-accent/20 to-secondary/20 rounded-lg p-6 aspect-[9/16] flex flex-col justify-between text-center">
          <div>
            <h2 className="text-lg font-bold text-primary">نجات یوز ایران</h2>
            <p className="text-xs text-muted-foreground mt-1">نتایج من در بازی حفاظت</p>
          </div>
          
          <div className="space-y-4">
            {/* Cubs result visualization */}
            <div className="flex justify-center space-x-2 space-x-reverse">
              {Array.from({ length: 4 }, (_, i) => (
                <div 
                  key={i}
                  className={`w-8 h-6 rounded-full cheetah-spots ${i < results.cubsSurvived ? 'bg-accent' : 'bg-muted opacity-50'}`}
                />
              ))}
            </div>
            
            <div>
              <div className="text-2xl font-bold text-primary" data-testid="text-share-result">
                {results.cubsSurvived} توله نجات یافت
              </div>
              <div className="text-sm text-muted-foreground" data-testid="text-share-title">
                {results.achievementTitle}
              </div>
            </div>
            
            <div className="text-xs text-secondary font-medium">
              شما هم برای نجات یوزپلنگ بازی کنید!
            </div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground">#نجات_یوز_ایران</div>
            <div className="text-xs text-muted-foreground">
              سروین | {new Date().toLocaleDateString('fa-IR')}
            </div>
          </div>
        </div>
        
        {/* Share buttons */}
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
      </div>
    </div>
  );
}
