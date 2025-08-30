import { GameData } from "@/types/game";

interface GameUIProps {
  gameData: GameData;
}

export default function GameUI({ gameData }: GameUIProps) {
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
      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto">
        {/* Month indicator and timer */}
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-4 space-x-reverse">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">ماه</div>
            <div className="text-lg font-bold text-primary" data-testid="text-current-month">{gameData.currentMonth}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">زمان</div>
            <div className="text-lg font-bold text-foreground" data-testid="text-time-remaining">{gameData.timeRemaining}</div>
          </div>
          {/* Season indicator */}
          <div className="season-indicator">
            <div className={`w-6 h-6 rounded-full ${seasonColors[gameData.season]}`} data-testid="season-indicator"></div>
            <div className="text-xs text-center mt-1" data-testid="text-season-name">{seasonNames[gameData.season]}</div>
          </div>
        </div>
        
        {/* Cubs survived counter */}
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-muted-foreground text-center mb-1">توله‌های باقی‌مانده</div>
          <div className="flex space-x-1 space-x-reverse justify-center">
            {Array.from({ length: 4 }, (_, i) => (
              <div 
                key={i}
                className={`w-6 h-4 rounded-full cheetah-spots ${i < gameData.cubs ? 'bg-accent' : 'bg-muted opacity-50'}`}
                data-testid={`cub-indicator-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Health and energy bars */}
      <div className="absolute top-20 left-4 right-4 space-y-2">
        {/* Family health bar */}
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">جان خانواده</span>
            <span className="text-xs text-muted-foreground" data-testid="text-health-percentage">{Math.round(gameData.health)}٪</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={`h-3 rounded-full health-bar-animation ${gameData.health < 25 ? 'bg-destructive pulse-danger' : 'bg-secondary'}`} 
              style={{ width: healthWidth }}
              data-testid="health-bar"
            />
          </div>
        </div>
        
        {/* Speed burst energy */}
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">انرژی جهش</span>
            <span className={`text-xs ${burstReady ? 'text-primary' : 'text-muted-foreground'}`} data-testid="text-burst-status">
              {burstReady ? 'آماده' : 'در حال شارژ'}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${burstReady ? 'bg-accent speed-burst-ready' : 'bg-accent'}`}
              style={{ width: burstWidth }}
              data-testid="burst-energy-bar"
            />
          </div>
        </div>
      </div>
      
      {/* Lane guides (subtle) */}
      <div className="absolute top-32 bottom-0 left-1/2 transform -translate-x-1/2 w-80 max-w-full">
        <div className="flex h-full">
          <div className="flex-1 lane"></div>
          <div className="flex-1 lane"></div>
          <div className="flex-1 lane"></div>
          <div className="flex-1"></div>
        </div>
      </div>
      
      {/* Game controls hint */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2">
          <p className="text-xs text-muted-foreground">لمس کنید و چپ-راست حرکت دهید • دوبار تپ برای جهش سرعت</p>
        </div>
      </div>
    </div>
  );
}
