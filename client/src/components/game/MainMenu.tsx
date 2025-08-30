interface MainMenuProps {
  onStartGame: () => void;
  onShowTutorial: () => void;
  onShowLeaderboard: () => void;
}

export default function MainMenu({ onStartGame, onShowTutorial, onShowLeaderboard }: MainMenuProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center" data-testid="main-menu">
      {/* Persian landscape background with cheetah silhouette */}
      <div className="absolute inset-0 game-container parallax-bg"></div>
      
      {/* Main title and logo */}
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-black text-primary drop-shadow-lg">نجات یوز ایران</h1>
          <p className="text-lg md:text-xl text-secondary font-medium">بازی حفاظت از یوزپلنگ آسیایی</p>
        </div>
        
        {/* Cheetah family illustration */}
        <div className="relative my-8">
          {/* Mother cheetah with spots */}
          <div className="w-20 h-12 bg-accent cheetah-spots rounded-full mx-auto mb-4 relative">
            <div className="absolute top-1 right-2 w-2 h-2 bg-foreground rounded-full"></div>
            <div className="absolute top-1 left-2 w-2 h-2 bg-foreground rounded-full"></div>
            <div className="absolute bottom-1 right-6 w-1 h-1 bg-foreground rounded-full"></div>
          </div>
          {/* Four cubs following */}
          <div className="flex justify-center space-x-2 space-x-reverse">
            <div className="w-8 h-6 bg-accent cheetah-spots rounded-full cub-follow"></div>
            <div className="w-8 h-6 bg-accent cheetah-spots rounded-full cub-follow" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-8 h-6 bg-accent cheetah-spots rounded-full cub-follow" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-8 h-6 bg-accent cheetah-spots rounded-full cub-follow" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
        
        {/* Game description */}
        <div className="bg-muted/80 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground leading-relaxed">
            مادر یوزپلنگ خود و ۴ توله‌اش را در ۱۸ ماه سخت به استقلال برسان. از موانع دوری کن، منابع جمع‌آوری کن و خانواده را نجات بده.
          </p>
        </div>
        
        {/* Start game button */}
        <button 
          onClick={onStartGame}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          data-testid="button-start-game"
        >
          شروع بازی
        </button>
        
        {/* Tutorial and info buttons */}
        <div className="flex gap-4 justify-center mt-4">
          <button 
            onClick={onShowTutorial} 
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-2 px-4 rounded-md"
            data-testid="button-tutorial"
          >
            آموزش
          </button>
          <button 
            onClick={onShowLeaderboard} 
            className="bg-muted hover:bg-muted/90 text-muted-foreground font-medium py-2 px-4 rounded-md"
            data-testid="button-leaderboard"
          >
            جدول امتیازات
          </button>
        </div>
      </div>
    </div>
  );
}
