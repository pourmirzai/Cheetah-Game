import { useEffect, useState } from "react";
import { backgroundManager, BackgroundConfig } from "@/lib/backgroundManager";
import { getBestScore } from "@/lib/cookieStorage";

interface BestScore {
  cubsSurvived: number;
  monthsCompleted: number;
  finalScore: number;
  achievementTitle: string;
  date: string;
}

interface MainMenuProps {
  onStartGame: () => void;
  onShowTutorial: () => void;
  onDownloadStory?: (bestScore: BestScore) => void;
}

export default function MainMenu({ onStartGame, onShowTutorial, onDownloadStory }: MainMenuProps) {
  const [currentBackground, setCurrentBackground] = useState<BackgroundConfig | null>(null);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    backgroundManager.initialize();
    const bg = backgroundManager.getCurrentBackground();
    setCurrentBackground(bg || null);

    // Check for existing best score
    const savedBestScore = getBestScore();
    setBestScore(savedBestScore);

    // Trigger animations after component mounts
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const backgroundStyle = currentBackground ? backgroundManager.getBackgroundStyle(currentBackground) : {};

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center md-motion-standard min-h-screen overflow-hidden" data-testid="main-menu">
      {/* Dynamic background with enhanced overlay */}
      <div className="absolute inset-0" style={backgroundStyle}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>

      {/* Animated particles for visual appeal */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main content container with enhanced animations */}
      <div className={`relative z-10 w-full max-w-2xl space-y-6 sm:space-y-8 px-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header section with enhanced Material Design card and glow effect */}
        <div className="md-elevated-card text-center space-y-6 relative">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-lg blur-xl"></div>

          <div className="relative space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-primary leading-tight md-motion-emphasized drop-shadow-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ماموریت ۱۸ ماهه
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-secondary font-semibold leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              بازی حفاظت از یوزپلنگ آسیایی
            </p>
          </div>

          {/* Enhanced cheetah family illustration with better animations */}
          <div className="relative my-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {/* Mother cheetah with enhanced styling and floating animation */}
            <div className="w-48 h-32 bg-gradient-to-br from-tertiary/20 to-tertiary/10 mx-auto mb-8 relative rounded-2xl backdrop-blur-sm border border-tertiary/20 shadow-2xl animate-float">
              <img
                src="/assets/sprites/characters/mother-cheetah.png"
                alt="Cheetah Mother"
                className="w-full h-full object-contain p-2"
              />
            </div>
            {/* Four cubs following with staggered animations */}
            <div className="flex justify-center space-x-3 space-x-reverse">
              <img
                src="/assets/sprites/characters/cub.png"
                alt="Cheetah Cub 1"
                className="w-12 h-10 bg-gradient-to-br from-tertiary/30 to-tertiary/10 rounded-lg p-1 shadow-lg animate-bounce-gentle"
                style={{ animationDelay: '0.8s' }}
              />
              <img
                src="/assets/sprites/characters/cub.png"
                alt="Cheetah Cub 2"
                className="w-12 h-10 bg-gradient-to-br from-tertiary/30 to-tertiary/10 rounded-lg p-1 shadow-lg animate-bounce-gentle"
                style={{ animationDelay: '1s' }}
              />
              <img
                src="/assets/sprites/characters/cub.png"
                alt="Cheetah Cub 3"
                className="w-12 h-10 bg-gradient-to-br from-tertiary/30 to-tertiary/10 rounded-lg p-1 shadow-lg animate-bounce-gentle"
                style={{ animationDelay: '1.2s' }}
              />
              <img
                src="/assets/sprites/characters/cub.png"
                alt="Cheetah Cub 4"
                className="w-12 h-10 bg-gradient-to-br from-tertiary/30 to-tertiary/10 rounded-lg p-1 shadow-lg animate-bounce-gentle"
                style={{ animationDelay: '1.4s' }}
              />
            </div>
          </div>
        </div>

        {/* Game description with enhanced card and better mobile typography */}
        <div className="md-card max-w-lg mx-auto animate-fade-in backdrop-blur-sm bg-background/80" style={{ animationDelay: '0.9s' }}>
          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed font-medium text-center px-2">
            مادر یوزپلنگ خود و ۴ توله‌اش را در ۱۸ ماه سخت به استقلال برسان.<br />
            از موانع دوری کن، منابع جمع‌آوری کن و خانواده را نجات بده.
          </p>
        </div>

        {/* Action buttons with enhanced styling and animations */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '1.1s' }}>
          {/* Primary action button with enhanced effects */}
          <button
            onClick={onStartGame}
            className="md-filled-button w-full max-w-sm mx-auto text-lg sm:text-xl font-bold py-4 sm:py-5 px-8 sm:px-10 md-motion-emphasized shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary relative overflow-hidden group"
            data-testid="button-start-game"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-2xl">🎮</span>
              شروع بازی
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Download story button for returning users */}
          {bestScore && onDownloadStory && (
            <button
              onClick={() => onDownloadStory(bestScore)}
              className="md-outlined-button w-full max-w-sm mx-auto text-base sm:text-lg font-semibold py-3 sm:py-4 px-6 sm:px-8 border-2 border-accent text-accent hover:bg-accent hover:text-on-accent transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse-gentle"
              data-testid="button-download-story"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">📖</span>
                دانلود داستان من
              </span>
            </button>
          )}

          {/* Secondary action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md mx-auto">
            <button
              onClick={onShowTutorial}
              className="md-outlined-button w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg hover:bg-primary hover:text-on-primary transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
              data-testid="button-tutorial"
            >
              <span className="text-xl">📚</span>
              آموزش
            </button>
          </div>
        </div>

        {/* Footer with enhanced styling */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '1.3s' }}>
          <p className="text-base text-on-surface-variant font-medium bg-background/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            ساخته شده با ❤️ برای حفاظت از یوزپلنگ آسیایی
          </p>
          <div className="mt-4 flex justify-center space-x-6 space-x-reverse text-sm text-on-surface-variant/70">
            <span>نسخه ۱.۴.۰</span>
            <span>۹ شهریور ۱۴۰۴</span>
          </div>
        </div>
      </div>
    </div>
  );
}
