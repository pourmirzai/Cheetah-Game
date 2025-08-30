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
      <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm flex items-center justify-center p-6 md-motion-standard">
        <div className="md-elevated-card max-w-lg w-full">
          <div className="text-center text-on-surface">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  const leaderboardDataTyped = leaderboardData as { topPlayers?: any[], stats?: { totalGames: number, avgSurvived: number, avgMonths: number } } || {};
  const { topPlayers = [], stats = { totalGames: 0, avgSurvived: 0, avgMonths: 0 } } = leaderboardDataTyped;

  return (
    <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm flex items-center justify-center p-6 md-motion-standard" data-testid="leaderboard-screen">
      <div className="md-elevated-card max-w-lg w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary md-motion-emphasized">آمار و جدول امتیازات</h2>
          <p className="text-sm text-on-surface-variant mt-2">آمار ۲۴ ساعت گذشته</p>
        </div>
        
        {/* Global stats with Material Design */}
        <div className="grid grid-cols-3 gap-4">
          <div className="md-card text-center">
            <div className="text-2xl font-bold text-primary md-motion-emphasized" data-testid="text-total-games">{stats.totalGames.toLocaleString('fa-IR')}</div>
            <div className="text-xs text-on-surface-variant mt-1">کل بازی‌ها</div>
          </div>
          <div className="md-card text-center">
            <div className="text-2xl font-bold text-tertiary md-motion-emphasized" data-testid="text-avg-survived">{stats.avgSurvived.toFixed(1)}</div>
            <div className="text-xs text-on-surface-variant mt-1">میانگین نجات</div>
          </div>
          <div className="md-card text-center">
            <div className="text-2xl font-bold text-secondary md-motion-emphasized" data-testid="text-avg-months">{stats.avgMonths.toFixed(1)}</div>
            <div className="text-xs text-on-surface-variant mt-1">میانگین ماه</div>
          </div>
        </div>
        
        {/* Top players with Material Design */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center text-on-surface">برترین بازیکنان امروز</h3>
          {topPlayers.length > 0 ? (
            topPlayers.map((player: any, index: number) => (
              <div key={player.id} className="md-card md-motion-standard" data-testid={`leaderboard-entry-${index}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-on-primary shadow-lg ${
                      index === 0 ? 'bg-primary' : index === 1 ? 'bg-tertiary' : 'bg-secondary'
                    }`}>
                      {(index + 1).toLocaleString('fa-IR')}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-on-surface" data-testid={`player-name-${index}`}>{player.playerName}</div>
                      <div className="text-xs text-on-surface-variant" data-testid={`player-province-${index}`}>{player.province || 'ناشناس'}</div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-tertiary" data-testid={`player-cubs-${index}`}>{player.cubsSurvived} توله</div>
                    <div className="text-xs text-on-surface-variant" data-testid={`player-months-${index}`}>{player.monthsCompleted} ماه</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-on-surface-variant py-8 md-card">
              هنوز بازیکنی در رتبه‌بندی امروز وجود ندارد
            </div>
          )}
        </div>
        
        {/* Iran conservation map with Material Design */}
        <div className="md-card">
          <h4 className="text-sm font-semibold mb-4 text-center text-on-surface">کریدورهای نجات یوزپلنگ</h4>
          {/* Simplified Iran map with conservation corridors */}
          <div className="relative w-full h-32 bg-surface-variant rounded-2xl flex items-center justify-center shadow-inner">
            <div className="text-xs text-on-surface-variant">نقشه نمادین ایران</div>
            {/* Conservation corridor indicators with Material Design */}
            <div className="absolute top-4 left-8 w-3 h-3 bg-secondary rounded-full shadow-lg animate-pulse"></div>
            <div className="absolute bottom-6 right-12 w-3 h-3 bg-tertiary rounded-full shadow-lg animate-pulse"></div>
            <div className="absolute top-8 right-16 w-3 h-3 bg-primary rounded-full shadow-lg animate-pulse"></div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="md-filled-button w-full py-3 px-6 text-lg font-semibold md-motion-emphasized"
          data-testid="button-close-leaderboard"
        >
          بازگشت
        </button>
      </div>
    </div>
  );
}
