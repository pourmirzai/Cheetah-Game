import { useQuery } from "@tanstack/react-query";

interface LeaderboardProps {
  onClose: () => void;
}

export default function Leaderboard({ onClose }: LeaderboardProps) {
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
  });

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="bg-background rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="text-center">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  const { topPlayers = [], stats = { totalGames: 0, avgSurvived: 0, avgMonths: 0 } } = leaderboardData || {};

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6" data-testid="leaderboard-screen">
      <div className="bg-background rounded-lg shadow-xl max-w-lg w-full p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">آمار و جدول امتیازات</h2>
          <p className="text-sm text-muted-foreground mt-1">آمار ۲۴ ساعت گذشته</p>
        </div>
        
        {/* Global stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary" data-testid="text-total-games">{stats.totalGames.toLocaleString('fa-IR')}</div>
            <div className="text-xs text-muted-foreground">کل بازی‌ها</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent" data-testid="text-avg-survived">{stats.avgSurvived.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">میانگین نجات</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-secondary" data-testid="text-avg-months">{stats.avgMonths.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">میانگین ماه</div>
          </div>
        </div>
        
        {/* Top players */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center">برترین بازیکنان امروز</h3>
          {topPlayers.length > 0 ? (
            topPlayers.map((player: any, index: number) => (
              <div key={player.id} className="flex items-center justify-between bg-muted rounded-lg p-3" data-testid={`leaderboard-entry-${index}`}>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? 'bg-primary' : index === 1 ? 'bg-accent' : 'bg-secondary'
                  }`}>
                    {(index + 1).toLocaleString('fa-IR')}
                  </div>
                  <div>
                    <div className="font-medium text-sm" data-testid={`player-name-${index}`}>{player.playerName}</div>
                    <div className="text-xs text-muted-foreground" data-testid={`player-province-${index}`}>{player.province || 'ناشناس'}</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-accent" data-testid={`player-cubs-${index}`}>{player.cubsSurvived} توله</div>
                  <div className="text-xs text-muted-foreground" data-testid={`player-months-${index}`}>{player.monthsCompleted} ماه</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              هنوز بازیکنی در رتبه‌بندی امروز وجود ندارد
            </div>
          )}
        </div>
        
        {/* Iran conservation map */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-center">کریدورهای نجات یوزپلنگ</h4>
          {/* Simplified Iran map with conservation corridors */}
          <div className="relative w-full h-32 bg-secondary/20 rounded-lg flex items-center justify-center">
            <div className="text-xs text-muted-foreground">نقشه نمادین ایران</div>
            {/* Conservation corridor indicators */}
            <div className="absolute top-4 left-8 w-2 h-2 bg-secondary rounded-full"></div>
            <div className="absolute bottom-6 right-12 w-2 h-2 bg-accent rounded-full"></div>
            <div className="absolute top-8 right-16 w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg w-full"
          data-testid="button-close-leaderboard"
        >
          بازگشت
        </button>
      </div>
    </div>
  );
}
