import { GameData } from "@/types/game";
import { useEffect, useState } from "react";

interface GameUIProps {
  gameData: GameData;
}

export default function GameUI({ gameData }: GameUIProps) {
  const [showLowHealthWarning, setShowLowHealthWarning] = useState(false);
  const [burstReadyPulse, setBurstReadyPulse] = useState(false);
  const [score, setScore] = useState(gameData.score);

  // Handle low health warning animation
  useEffect(() => {
    if (gameData.health < 25) {
      setShowLowHealthWarning(true);
      const interval = setInterval(() => {
        setShowLowHealthWarning(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setShowLowHealthWarning(false);
    }
  }, [gameData.health]);

  // Handle burst ready pulse animation
  useEffect(() => {
    if (gameData.burstEnergy >= 100) {
      setBurstReadyPulse(true);
      const interval = setInterval(() => {
        setBurstReadyPulse(prev => !prev);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setBurstReadyPulse(false);
    }
  }, [gameData.burstEnergy]);

  // Animate score changes
  useEffect(() => {
    setScore(gameData.score);
  }, [gameData.score]);
  const seasonColors = {
    spring: 'bg-green-500',
    summer: 'bg-yellow-500', 
    autumn: 'bg-orange-500',
    winter: 'bg-blue-500'
  };

  const seasonNames = {
    spring: 'بهار',
    summer: 'تابستان',
    autumn: 'پاییز',
    winter: 'زمستان'
  };

  const healthWidth = `${gameData.health}%`;
  const burstWidth = `${gameData.burstEnergy}%`;
  const burstReady = gameData.burstEnergy >= 100;

  return (
    <div className="absolute inset-0 pointer-events-none" data-testid="game-ui">
      {/* Low health warning overlay */}
      {showLowHealthWarning && (
        <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none" />
      )}

      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto">
        {/* Month indicator and timer */}
        <div className="bg-background/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-border/50 flex items-center space-x-4 space-x-reverse transform transition-all duration-300 hover:scale-105">
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-medium">ماه</div>
            <div className="text-xl font-bold text-primary animate-pulse" data-testid="text-current-month">{gameData.currentMonth}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-medium">زمان</div>
            <div className="text-xl font-bold text-foreground" data-testid="text-time-remaining">{gameData.timeRemaining}</div>
          </div>
          {/* Season indicator */}
          <div className="season-indicator text-center">
            <div className={`w-8 h-8 rounded-full ${seasonColors[gameData.season]} shadow-lg animate-bounce`} data-testid="season-indicator"></div>
            <div className="text-xs font-medium mt-1" data-testid="text-season-name">{seasonNames[gameData.season]}</div>
          </div>
        </div>

        {/* Score and Cubs survived counter */}
        <div className="flex space-x-3 space-x-reverse">
          {/* Score display */}
          <div className="bg-background/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-border/50">
            <div className="text-xs text-muted-foreground text-center mb-1 font-medium">امتیاز</div>
            <div className="text-xl font-bold text-yellow-500 animate-pulse" data-testid="text-score">{score.toLocaleString()}</div>
          </div>

          {/* Cubs survived counter */}
          <div className="bg-background/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-border/50">
            <div className="text-xs text-muted-foreground text-center mb-2 font-medium">توله‌های باقی‌مانده</div>
            <div className="flex space-x-1 space-x-reverse justify-center">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className={`w-7 h-5 rounded-full cheetah-spots transition-all duration-300 ${
                    i < gameData.cubs
                      ? 'bg-accent shadow-lg animate-pulse'
                      : 'bg-muted opacity-50'
                  }`}
                  data-testid={`cub-indicator-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Health and energy bars */}
      <div className="absolute top-24 left-4 right-4 space-y-3">
        {/* Family health bar */}
        <div className={`bg-background/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-border/50 transition-all duration-300 ${showLowHealthWarning ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">جان خانواده</span>
            <span className={`text-sm font-bold ${gameData.health < 25 ? 'text-red-500 animate-pulse' : 'text-green-500'}`} data-testid="text-health-percentage">
              {Math.round(gameData.health)}٪
            </span>
          </div>
          <div className="w-full bg-muted/50 rounded-full h-4 shadow-inner overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ease-out shadow-sm ${
                gameData.health < 25
                  ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
                  : gameData.health < 50
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{ width: healthWidth }}
              data-testid="health-bar"
            />
            {/* Health bar glow effect */}
            {gameData.health > 75 && (
              <div className="absolute inset-0 bg-green-400/30 rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Speed burst energy */}
        <div className={`bg-background/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-border/50 transition-all duration-300 ${burstReadyPulse ? 'ring-2 ring-blue-500 shadow-blue-500/50' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">انرژی جهش سرعت</span>
            <span className={`text-sm font-bold ${burstReady ? 'text-blue-500 animate-bounce' : 'text-muted-foreground'}`} data-testid="text-burst-status">
              {burstReady ? 'آماده!' : 'در حال شارژ'}
            </span>
          </div>
          <div className="w-full bg-muted/50 rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-300 ease-out ${
                burstReady
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50 animate-pulse'
                  : 'bg-gradient-to-r from-blue-300 to-blue-500'
              }`}
              style={{ width: burstWidth }}
              data-testid="burst-energy-bar"
            />
            {/* Burst ready particles effect */}
            {burstReady && (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Lane guides with enhanced visuals */}
      <div className="absolute top-40 bottom-20 left-1/2 transform -translate-x-1/2 w-96 max-w-full pointer-events-none">
        <div className="flex h-full space-x-2 space-x-reverse">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`flex-1 lane-guide rounded-lg transition-all duration-300 ${
                i === gameData.lane
                  ? 'bg-primary/30 shadow-lg shadow-primary/50 animate-pulse'
                  : 'bg-muted/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced game controls hint */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-background/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-border/50">
          <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">👆</span>
              </div>
              <span className="text-muted-foreground">حرکت</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <span className="text-accent font-bold">⚡</span>
              </div>
              <span className="text-muted-foreground">جهش سرعت</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speed burst active indicator */}
      {gameData.speedBurstActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-blue-500/90 text-white px-6 py-3 rounded-full font-bold text-lg animate-bounce shadow-lg shadow-blue-500/50">
            🚀 جهش سرعت فعال!
          </div>
        </div>
      )}
    </div>
  );
}
