import { useEffect, useState } from "react";
import { backgroundManager, BackgroundConfig } from "@/lib/backgroundManager";

interface MainMenuProps {
  onStartGame: () => void;
  onShowTutorial: () => void;
  onShowLeaderboard: () => void;
}

export default function MainMenu({ onStartGame, onShowTutorial, onShowLeaderboard }: MainMenuProps) {
  const [currentBackground, setCurrentBackground] = useState<BackgroundConfig | null>(null);

  useEffect(() => {
    backgroundManager.initialize();
    const bg = backgroundManager.getCurrentBackground();
    setCurrentBackground(bg || null);
  }, []);

  const backgroundStyle = currentBackground ? backgroundManager.getBackgroundStyle(currentBackground) : {};

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center md-motion-standard" data-testid="main-menu">
      {/* Dynamic background */}
      <div className="absolute inset-0" style={backgroundStyle}></div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-2xl space-y-8">
        {/* Header section with Material Design card */}
        <div className="md-elevated-card text-center space-y-4">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-black text-primary leading-tight md-motion-emphasized">
              نجات یوز ایران
            </h1>
            <p className="text-lg md:text-xl text-secondary font-medium leading-relaxed">
              بازی حفاظت از یوزپلنگ آسیایی
            </p>
          </div>

          {/* Enhanced cheetah family illustration */}
          <div className="relative my-6">
            {/* Mother cheetah with enhanced Material Design styling */}
            <div className="w-24 h-14 bg-tertiary cheetah-spots rounded-2xl mx-auto mb-6 relative shadow-lg md-motion-standard">
              <div className="absolute top-2 right-3 w-3 h-3 bg-on-tertiary rounded-full shadow-sm"></div>
              <div className="absolute top-2 left-3 w-3 h-3 bg-on-tertiary rounded-full shadow-sm"></div>
              <div className="absolute bottom-2 right-8 w-2 h-2 bg-on-tertiary rounded-full shadow-sm"></div>
              {/* Enhanced eyes */}
              <div className="absolute top-3 right-4 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <div className="absolute top-3 left-4 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
            </div>

            {/* Four cubs following with Material Design styling */}
            <div className="flex justify-center space-x-3 space-x-reverse">
              <div className="w-10 h-7 bg-tertiary cheetah-spots rounded-xl cub-follow shadow-md md-motion-standard"></div>
              <div className="w-10 h-7 bg-tertiary cheetah-spots rounded-xl cub-follow shadow-md md-motion-standard" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-10 h-7 bg-tertiary cheetah-spots rounded-xl cub-follow shadow-md md-motion-standard" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-10 h-7 bg-tertiary cheetah-spots rounded-xl cub-follow shadow-md md-motion-standard" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
        </div>

        {/* Game description with Material Design card */}
        <div className="md-card">
          <p className="text-base text-on-surface-variant leading-relaxed">
            مادر یوزپلنگ خود و ۴ توله‌اش را در ۱۸ ماه سخت به استقلال برسان. از موانع دوری کن، منابع جمع‌آوری کن و خانواده را نجات بده.
          </p>
        </div>

        {/* Action buttons with Material Design styling */}
        <div className="space-y-4">
          {/* Primary action button */}
          <button
            onClick={onStartGame}
            className="md-filled-button w-full text-lg font-semibold py-4 px-8 md-motion-emphasized"
            data-testid="button-start-game"
          >
            شروع بازی
          </button>

          {/* Secondary action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onShowTutorial}
              className="md-outlined-button px-6 py-3 font-medium"
              data-testid="button-tutorial"
            >
              آموزش
            </button>
            <button
              onClick={onShowLeaderboard}
              className="md-outlined-button px-6 py-3 font-medium"
              data-testid="button-leaderboard"
            >
              جدول امتیازات
            </button>
          </div>
        </div>

        {/* Footer with Material Design styling */}
        <div className="text-center">
          <p className="text-sm text-on-surface-variant">
            ساخته شده با ❤️ برای حفاظت از یوزپلنگ آسیایی
          </p>
        </div>
      </div>
    </div>
  );
}
