import { GameData } from "@/types/game";
import { useEffect, useState } from "react";
import "@/styles/game-ui.css";

interface GameUIProps {
  gameData: GameData;
  onTutorialComplete?: () => void;
}

export default function GameUI({ gameData, onTutorialComplete }: GameUIProps) {
  const [showLowHealthWarning, setShowLowHealthWarning] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(true);

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


  const seasonColors = {
    spring: 'bg-primary-container border-primary',
    summer: 'bg-tertiary-container border-tertiary',
    autumn: 'bg-secondary-container border-secondary',
    winter: 'bg-surface-variant border-outline'
  };

  const seasonNames = {
    spring: 'بهار',
    summer: 'تابستان',
    autumn: 'پاییز',
    winter: 'زمستان'
  };

  const healthWidth = `${gameData.health}%`;


  return (
    <div className="game-ui-container" data-testid="game-ui">
      {/* Low health warning overlay */}
      {showLowHealthWarning && (
        <div className="warning-overlay" />
      )}

      {/* Consolidated Top UI Bar - Mobile Optimized */}
      <div className="top-ui-bar-mobile">
        <div className="game-ui-card-mobile w-full max-w-none">
          <div className="flex items-center justify-between px-2 py-1">
            {/* Left Section: Health Bar - Mobile Compact */}
            <div className="flex items-center space-x-1 space-x-reverse flex-1">
              <div className="flex items-center space-x-1 space-x-reverse">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">💚</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">سلامت</span>
              </div>
              <div className="flex-1 max-w-16">
                <div className="health-bar-container-mobile">
                  <div
                    className={`health-bar-fill-mobile transition-all duration-300 ${
                      gameData.health < 25
                        ? 'bg-gradient-to-r from-red-400 to-red-500 shadow-red-200'
                        : gameData.health < 50
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-yellow-200'
                        : 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-200'
                    }`}
                    style={{ width: healthWidth }}
                    data-testid="health-bar"
                  />
                </div>
              </div>
              <span className={`text-xs font-bold min-w-[2rem] text-center ${
                gameData.health < 25 ? 'text-red-600' :
                gameData.health < 50 ? 'text-yellow-600' : 'text-green-600'
              }`} data-testid="text-health-percentage">
                {Math.round(gameData.health)}%
              </span>
            </div>

            {/* Center Section: Game Status - Mobile Compact */}
            <div className="flex items-center space-x-2 space-x-reverse flex-1 justify-center">
              {/* Month & Timer - Compact */}
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="text-xs text-gray-600 font-medium">ماه</span>
                <span className="text-sm font-bold text-orange-600" data-testid="text-current-month">{gameData.currentMonth}</span>
                <span className="text-xs text-gray-600 font-medium">زمان</span>
                <span className="text-sm font-bold text-gray-800" data-testid="text-time-remaining">{gameData.timeRemaining}</span>
              </div>

              {/* Season - Compact */}
              <div className="flex items-center space-x-1 space-x-reverse">
                <div className={`w-5 h-5 rounded border ${seasonColors[gameData.season]} flex items-center justify-center`} data-testid="season-indicator">
                  <span className="text-xs">
                    {gameData.season === 'spring' && '🌸'}
                    {gameData.season === 'summer' && '☀️'}
                    {gameData.season === 'autumn' && '🍂'}
                    {gameData.season === 'winter' && '❄️'}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-600" data-testid="text-season-name">{seasonNames[gameData.season]}</span>
              </div>

            </div>

          </div>

          {/* Low health warning - Mobile Compact */}
          {gameData.health < 25 && (
            <div className="mt-1 text-center border-t border-red-200 pt-1">
              <span className="text-xs text-red-600 font-medium animate-pulse">⚠️ سلامت در وضعیت خطرناک!</span>
            </div>
          )}
        </div>
      </div>

      {/* Lane Guides - Centered in Game Area */}
      <div className="center-middle w-96 h-32 pointer-events-none">
        <div className="flex h-full space-x-4 space-x-reverse justify-center items-end">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`flex-1 lane-guide rounded-2xl transition-all duration-300 ${
                i === gameData.lane ? 'active' : ''
              }`}
            />
          ))}
        </div>
      </div>


      {/* Guide Modal - Show before game starts */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">آموزش بازی</h2>
              <p className="text-sm text-gray-600">قبل از شروع بازی، کنترل‌ها را یاد بگیرید</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 space-x-reverse p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">👆</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">حرکت</h3>
                  <p className="text-xs text-gray-600">برای تغییر مسیر مادر یوز و توله‌ها لمس کنید</p>
                </div>
              </div>

              {/* Dangers Section - Ultra Compact */}
              <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-1 flex items-center text-sm">
                  <span className="text-base mr-1">⚠️</span>
                  خطرات
                </h3>
                <div className="flex justify-center space-x-2 space-x-reverse mb-1">
                  <img src="/assets/sprites/obstacles/pocher.png" alt="قاچاقچی" className="w-6 h-6 object-contain" />
                  <img src="/assets/sprites/obstacles/car.png" alt="ماشین" className="w-6 h-6 object-contain" />
                  <img src="/assets/sprites/obstacles/camel.png" alt="شتر" className="w-6 h-6 object-contain" />
                  <img src="/assets/sprites/obstacles/dog.png" alt="سگ" className="w-6 h-6 object-contain" />
                </div>
                <p className="text-xs text-red-700 text-center font-medium leading-tight">
                  ⚠️ شتر، قاچاقچی و سگ دارای منطقه مرگ دایره‌ای هستند<br/>
                  از فاصله دور اجتناب کنید!<br/>
                  برخورد توله‌ها = مرگ<br/>
                  برخورد مادر = پایان بازی
                </p>
              </div>

              {/* Resources Section - Ultra Compact */}
              <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-1 flex items-center text-sm">
                  <span className="text-base mr-1">🌿</span>
                  منابع غذایی، آب و سلامت خانواده
                </h3>
                <div className="flex justify-center space-x-2 space-x-reverse mb-1">
                  <img src="/assets/sprites/resources/gazelle.png" alt="آهو" className="w-6 h-6 object-contain" />
                  <img src="/assets/sprites/resources/rabbit.png" alt="خرگوش" className="w-6 h-6 object-contain" />
                  <img src="/assets/sprites/resources/water.png" alt="آب" className="w-6 h-6 object-contain" />
                </div>
                <div className="text-center mb-2">
                  <svg width="80" height="20" viewBox="0 0 80 20" className="inline-block">
                    <rect x="5" y="8" width="70" height="4" fill="#e5e7eb" rx="2"/>
                    <rect x="5" y="8" width="56" height="4" fill="#10b981" rx="2"/>
                    <text x="40" y="6" textAnchor="middle" className="text-xs font-semibold fill-gray-700">نمودار سلامتی</text>
                  </svg>
                </div>
                <p className="text-xs text-red-600 text-center font-medium mb-1">
                  ⚠️ حواستان به سلامتی خانواده باشد!
                </p>
                <p className="text-xs text-green-700 text-center font-medium">
دریافت منابع غذایی  و آب، نمودار سلامت را پر می‌کند. اگر آب و غذا نخورید، خانواده ضعیف می‌شود.
                </p>
              </div>

              {/* Seasons Section */}
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-1 flex items-center text-sm">
                  <span className="text-base mr-1">🌸</span>
                  تغییر فصل‌ها
                </h3>
                <div className="flex justify-center space-x-1 space-x-reverse mb-1">
                  <img src="/assets/backgrounds/spring-bg.png" alt="بهار" className="w-8 h-6 object-cover rounded" />
                  <img src="/assets/backgrounds/summer-bg.png" alt="تابستان" className="w-8 h-6 object-cover rounded" />
                  <img src="/assets/backgrounds/autumn-bg.png" alt="پاییز" className="w-8 h-6 object-cover rounded" />
                  <img src="/assets/backgrounds/winter-bg.png" alt="زمستان" className="w-8 h-6 object-cover rounded" />
                </div>
                <p className="text-xs text-blue-700 text-center font-medium">
                  در فصول مختلف منابع و تهدیدات کم یا زیاد می‌شوند. تغییر فصل را در پس زمینه بازی مشاهده کنید.
                </p>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">🎯</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">هدف</h3>
                  <p className="text-xs text-gray-600">به مادر یوزها کمک کنید توله‌های بیشتری به ۱۸ ماهگی و سن استقلال برساند.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                console.log('Tutorial button clicked!');
                setShowGuideModal(false);
                console.log('Calling onTutorialComplete...');
                onTutorialComplete?.();
                console.log('Tutorial completed successfully');
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
            >
              شروع بازی! 🎮
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
