import { useEffect, useState } from "react";
import { backgroundManager, BackgroundConfig } from "@/lib/backgroundManager";

interface MainMenuProps {
  onStartGame: () => void;
  onShowTutorial: () => void;
}

export default function MainMenu({ onStartGame, onShowTutorial }: MainMenuProps) {
  const [currentBackground, setCurrentBackground] = useState<BackgroundConfig | null>(null);

  useEffect(() => {
    backgroundManager.initialize();
    const bg = backgroundManager.getCurrentBackground();
    setCurrentBackground(bg || null);
  }, []);

  const backgroundStyle = currentBackground ? backgroundManager.getBackgroundStyle(currentBackground) : {};

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center md-motion-standard min-h-screen" data-testid="main-menu">
      {/* Dynamic background */}
      <div className="absolute inset-0" style={backgroundStyle}></div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-2xl space-y-6 sm:space-y-8 px-4">
        {/* Header section with Material Design card */}
        <div className="md-elevated-card text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-primary leading-tight md-motion-emphasized drop-shadow-lg">
              نجات یوز ایران
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-secondary font-semibold leading-relaxed">
              بازی حفاظت از یوزپلنگ آسیایی
            </p>
          </div>

          {/* Enhanced cheetah family illustration */}
          <div className="relative my-8">
            {/* Mother cheetah with enhanced Material Design styling */}
            <div className="w-48 h-26 bg-gradient-to-br from-tertiary to-tertiary/80   mx-auto mb-8 relative  md-motion-standard">
              <img src="/assets/sprites/characters/mother-cheetah.png" alt="Cheetah Mother" className=""></img>
            </div>
            {/* Four cubs following with Material Design styling */}
            <div className="flex justify-center space-x-4 space-x-reverse">
              <img src="/assets/sprites/characters/cub.png" alt="Cheetah Cub 1" className="w-12 h-8 bg-gradient-to-br from-tertiary to-tertiary/80 cub-follow  md-motion-standard" />
              <img src="/assets/sprites/characters/cub.png" alt="Cheetah Cub 2" className="w-12 h-8 bg-gradient-to-br from-tertiary to-tertiary/80 cub-follow  md-motion-standard" />
              <img src="/assets/sprites/characters/cub.png" alt="Cheetah Cub 3" className="w-12 h-8 bg-gradient-to-br from-tertiary to-tertiary/80 cub-follow  md-motion-standard" />
              <img src="/assets/sprites/characters/cub.png" alt="Cheetah Cub 4" className="w-12 h-8  from-tertiary to-tertiary/80 cub-follow md-motion-standard" />
            </div>
          </div>

        {/* Game description with Material Design card */}
        <div className="md-card max-w-lg mx-auto">
          <p className="text-lg text-on-surface-variant leading-relaxed font-medium text-center">
            مادر یوزپلنگ خود و ۴ توله‌اش را در ۱۸ ماه سخت به استقلال برسان.<br />
            از موانع دوری کن، منابع جمع‌آوری کن و خانواده را نجات بده.
          </p>
        </div>

        {/* Action buttons with Material Design styling */}
        <div className="space-y-6">
          {/* Primary action button */}
          <button
            onClick={onStartGame}
            className="md-filled-button w-full max-w-sm mx-auto text-lg sm:text-xl font-bold py-4 sm:py-5 px-8 sm:px-10 md-motion-emphasized shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            data-testid="button-start-game"
          >
            🎮 شروع بازی
          </button>

          {/* Secondary action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md mx-auto">
            <button
              onClick={onShowTutorial}
              className="md-outlined-button w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg hover:bg-primary hover:text-on-primary transition-all duration-200"
              data-testid="button-tutorial"
            >
              📚 آموزش
            </button>
          </div>
        </div>

        {/* Footer with Material Design styling */}
        <div className="text-center mt-8">
          <p className="text-base text-on-surface-variant font-medium">
            ساخته شده با ❤️ برای حفاظت از یوزپلنگ آسیایی
          </p>
          <div className="mt-4 flex justify-center space-x-6 space-x-reverse">
            <span className="text-sm text-on-surface-variant/70">نسخه ۱.۰.۰</span>
            <span className="text-sm text-on-surface-variant/70">۱۴۰۳</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
