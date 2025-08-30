import { GameResults } from "@/types/game";

interface GameOverProps {
  results: GameResults;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onShare: () => void;
}

export default function GameOver({ results, onPlayAgain, onBackToMenu, onShare }: GameOverProps) {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6" data-testid="game-over-screen">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 text-center space-y-6">
        <h2 className="text-3xl font-bold text-primary">پایان بازی</h2>
        
        {/* Results summary */}
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">نتایج شما</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">توله‌های نجات‌یافته</div>
                <div className="text-xl font-bold text-accent" data-testid="text-survived-cubs">{results.cubsSurvived}</div>
              </div>
              <div>
                <div className="text-muted-foreground">ماه طی‌شده</div>
                <div className="text-xl font-bold text-secondary" data-testid="text-months-completed">{results.monthsCompleted}</div>
              </div>
            </div>
          </div>
          
          {/* Achievement title */}
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="text-lg font-bold text-primary" data-testid="text-achievement-title">{results.achievementTitle}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {results.cubsSurvived === 4 ? 'شما توانستید تمام خانواده را نجات دهید!' : 
               results.cubsSurvived >= 2 ? 'شما توانستید بیشتر خانواده را نجات دهید' :
               'شما شاهد این مسابقه سخت بودید'}
            </div>
          </div>
          
          {/* Conservation message */}
          <div className="bg-secondary/10 rounded-lg p-4 text-right">
            <p className="text-sm text-secondary font-medium" data-testid="text-conservation-message">
              {results.conservationMessage}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3">
          <button 
            onClick={onShare} 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-6 rounded-lg w-full"
            data-testid="button-share-results"
          >
            اشتراک‌گذاری نتایج
          </button>
          <button 
            onClick={onPlayAgain} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg w-full"
            data-testid="button-play-again"
          >
            بازی مجدد
          </button>
          <button 
            onClick={onBackToMenu} 
            className="bg-muted hover:bg-muted/90 text-muted-foreground font-medium py-2 px-4 rounded-lg w-full"
            data-testid="button-back-to-menu"
          >
            بازگشت به منو
          </button>
        </div>
      </div>
    </div>
  );
}
