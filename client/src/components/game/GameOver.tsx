import { useEffect, useState } from "react";
import { GameResults } from "@/types/game";
import { getBestScore } from "@/lib/cookieStorage";

interface GameOverProps {
  results: GameResults;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onShare: () => void;
}

export default function GameOver({ results, onPlayAgain, onBackToMenu, onShare }: GameOverProps) {
  const [bestScore, setBestScore] = useState<any>(null);

  useEffect(() => {
    console.log('📊 GameOver rendering with results:', results);
    const savedBestScore = getBestScore();
    setBestScore(savedBestScore);
  }, [results]);

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4" data-testid="game-over-screen">
      <div className="bg-background rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-5">

        {/* Main Result - Prominent */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-primary">پایان بازی</h2>

          {/* Achievement and Stats in one clean section */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-5 border border-primary/20">
            <div className="text-xl font-bold text-primary mb-2" data-testid="text-achievement-title">
              {results.monthsCompleted >= 18 ?
                (results.cubsSurvived === 4 ? 'قهرمان نجات خانواده!' :
                 results.cubsSurvived >= 2 ? 'نجات‌دهنده ماهر!' :
                 'شاهد نجات بخشی از خانواده') :
                <span className="text-red-500">شکست در نجات خانواده</span>}
            </div>

            {/* Stats in compact grid */}
            <div className={`grid gap-3 text-sm ${results.monthsCompleted >= 18 ? 'grid-cols-2' : 'grid-cols-1'} mt-4`}>
              {results.monthsCompleted >= 18 && (
                <div className="text-center">
                  <div className="text-muted-foreground text-xs">توله‌های نجات‌یافته</div>
                  <div className="text-2xl font-bold text-accent" data-testid="text-survived-cubs">{results.cubsSurvived}</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-muted-foreground text-xs">زمان طی شده</div>
                <div className="text-2xl font-bold text-secondary" data-testid="text-months-completed">{results.monthsCompleted} ماه</div>
              </div>
            </div>

            {results.monthsCompleted < 18 && (
              <div className="mt-3 p-2 bg-red-50/80 border border-red-200/50 rounded-lg">
                <p className="text-red-700 text-xs font-medium">متاسفانه خانواده یوزپلنگ از بین رفتند 😢 </p>
              </div>
            )}

            {/* Cub Loss Statistics - Only show if there were losses */}
            {results.cubLossStats && results.cubLossStats.total > 0 && (
              <div className="mt-4 p-3 bg-orange-50/80 border border-orange-200/50 rounded-lg">
                <h3 className="text-sm font-bold text-orange-800 mb-2 text-center">توله‌ها به چه دلیل از دست رفتند؟</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {results.cubLossStats.dogs > 0 && (
                    <div className="text-center">
                      <div className="text-muted-foreground">سگ‌ها</div>
                      <div className="text-lg font-bold text-red-600">{results.cubLossStats.dogs}</div>
                    </div>
                  )}
                  {results.cubLossStats.smugglers > 0 && (
                    <div className="text-center">
                      <div className="text-muted-foreground">قاچاقچیان</div>
                      <div className="text-lg font-bold text-red-600">{results.cubLossStats.smugglers}</div>
                    </div>
                  )}
                  {results.cubLossStats.roads > 0 && (
                    <div className="text-center">
                      <div className="text-muted-foreground">جاده‌ها</div>
                      <div className="text-lg font-bold text-red-600">{results.cubLossStats.roads}</div>
                    </div>
                  )}
                  {results.cubLossStats.starvation > 0 && (
                    <div className="text-center">
                      <div className="text-muted-foreground">گرسنگی</div>
                      <div className="text-lg font-bold text-red-600">{results.cubLossStats.starvation}</div>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  مجموع: {results.cubLossStats.total} توله از دست رفت
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Impactful Conservation Message */}
        <div className="bg-secondary/5 rounded-lg p-4 border-l-4 border-secondary">
          <p className="text-sm text-secondary font-medium text-right leading-relaxed" data-testid="text-conservation-message">
            {results.conservationMessage}
          </p>
        </div>

        {/* Best Score - Compact and optional */}
        {bestScore && (
          <div className="bg-tertiary/5 rounded-lg p-3 border border-tertiary/20">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">بهترین رکورد:</span>
              <span className="font-bold text-tertiary">
                {bestScore.monthsCompleted >= 18 ? `${bestScore.cubsSurvived} توله` : `${bestScore.monthsCompleted} ماه`}
              </span>
            </div>
          </div>
        )}

        {/* Primary Action Buttons - Featured prominently */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onShare}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              data-testid="button-share-results"
            >
              اشتراک‌گذاری
            </button>
            <button
              onClick={onPlayAgain}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              data-testid="button-play-again"
            >
              بازی مجدد
            </button>
          </div>

          <button
            onClick={onBackToMenu}
            className="bg-muted/50 hover:bg-muted/70 text-muted-foreground font-medium py-2 px-4 rounded-lg w-full text-sm transition-colors duration-200"
            data-testid="button-back-to-menu"
          >
            بازگشت به منو
          </button>
        </div>
      </div>
    </div>
  );
}
