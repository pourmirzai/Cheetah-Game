import { GameData } from "@/types/game";
import { useEffect, useState } from "react";
import "@/styles/game-ui.css";

interface GameUIProps {
  gameData: GameData;
  onTutorialComplete?: () => void;
  gameStarted?: boolean;
  isLoading?: boolean;
  loadingProgress?: number;
  loadingMessage?: string;
}

export default function GameUI({ gameData, onTutorialComplete, gameStarted, isLoading = false, loadingProgress = 0, loadingMessage = "در حال بارگذاری..." }: GameUIProps) {
  const [showLowHealthWarning, setShowLowHealthWarning] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Show guide modal when game hasn't started yet (tutorial not completed) and loading is complete
  useEffect(() => {
    if (gameStarted === false && isLoading === false) {
      console.log('🎮 Showing tutorial modal (game not started and loading complete)');
      setShowGuideModal(true);
    } else if (gameStarted === true) {
      console.log('🎮 Hiding tutorial modal (game started)');
      setShowGuideModal(false);
    }
  }, [gameStarted, isLoading]);


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

  // Handle viewport height changes for mobile devices
  useEffect(() => {
    const handleViewportChange = () => {
      // Use requestAnimationFrame to ensure we get the correct height after any layout changes
      requestAnimationFrame(() => {
        const newHeight = window.innerHeight;
        if (Math.abs(newHeight - viewportHeight) > 10) { // Only update if significant change
          setViewportHeight(newHeight);
          // Force a re-render by updating a CSS custom property
          document.documentElement.style.setProperty('--vh', `${newHeight * 0.01}px`);
        }
      });
    };

    // Listen for various events that might cause viewport changes
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    // Also listen for visual viewport changes if supported
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }

    // Set initial custom property
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
    };
  }, [viewportHeight]);


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

  const healthWidth = `${gameData?.health || 100}%`;


  return (
    <div className="game-ui-container" data-testid="game-ui">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Loading Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                </div>
              </div>

              {/* Loading Message */}
              <h2 className="text-xl font-bold text-gray-800 mb-2">بارگذاری بازی</h2>
              <p className="text-sm text-gray-600 mb-6">{loadingMessage}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>

              {/* Progress Percentage */}
              <p className="text-sm font-semibold text-orange-600">{Math.round(loadingProgress)}%</p>

              {/* Loading Tips */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-700 leading-relaxed">
                  💡 <strong>نکته:</strong> برای بهترین تجربه، اتصال اینترنت پایدار داشته باشید
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low health warning overlay */}
      {showLowHealthWarning && (
        <div className="warning-overlay" />
      )}

      {/* Lane Guides - Centered in Game Area */}
      <div className="center-middle w-96 h-32 pointer-events-none">
        <div className="flex h-full space-x-4 space-x-reverse justify-center items-end">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`flex-1 lane-guide rounded-2xl transition-all duration-300 ${
                i === (gameData?.lane || 1) ? 'active' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom UI Bar - All Information in Single Row */}
      <div className="bottom-ui-bar-mobile">
        <div className="game-ui-card-mobile w-full max-w-none">
          <div className="flex items-center justify-between px-3 py-2">
            {/* Left Section: Month and Season */}
            <div className="flex items-center space-x-3 space-x-reverse">
              {/* Month */}
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="text-xs text-gray-600 font-medium">ماه</span>
                <span className="text-base font-bold text-orange-600" data-testid="text-current-month">{gameData?.currentMonth || 1}</span>
              </div>

              {/* Season */}
              <div className="flex items-center space-x-1 space-x-reverse">
                <div className={`w-5 h-5 rounded border ${seasonColors[gameData?.season || 'spring']} flex items-center justify-center`} data-testid="season-indicator">
                  <span className="text-xs">
                    {(gameData?.season === 'spring' || !gameData?.season) && '🌸'}
                    {gameData?.season === 'summer' && '☀️'}
                    {gameData?.season === 'autumn' && '🍂'}
                    {gameData?.season === 'winter' && '❄️'}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-600" data-testid="text-season-name">{seasonNames[gameData?.season || 'spring']}</span>
              </div>
            </div>

            {/* Center Section: Health Bar */}
            <div className="flex items-center space-x-2 space-x-reverse flex-1 max-w-xs">
              <div className="flex items-center space-x-1 space-x-reverse">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">💚</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">سلامت</span>
              </div>
              <div className="flex-1">
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
              <span className={`text-xs font-bold min-w-[2.5rem] text-center ${
                gameData.health < 25 ? 'text-red-600' :
                gameData.health < 50 ? 'text-yellow-600' : 'text-green-600'
              }`} data-testid="text-health-percentage">
                {Math.round(gameData.health)}%
              </span>
            </div>

            {/* Right Section: Low Health Warning */}
            {gameData.health < 25 && (
              <div className="flex items-center">
                <span className="text-xs text-red-600 font-medium animate-pulse whitespace-nowrap">⚠️ خطر!</span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Guide Modal - Show before game starts */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="text-center p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">آموزش بازی</h2>
              <p className="text-sm text-gray-600 font-medium">قبل از شروع بازی، با خطرات و منابع آشنا شوید</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold text-sm">👆</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">حرکت</h3>
                  <p className="text-xs text-gray-600">برای تغییر مسیر، مادر و توله‌ها را لمس کنید</p>
                </div>
              </div>

              {/* Dangers Section - Ultra Compact */}
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center text-sm">
                  <span className="text-base mr-1">⚠️</span>
                  خطرات
                </h3>
                <div className="flex justify-center space-x-3 space-x-reverse mb-3 p-2 bg-white/50 rounded-lg shadow-inner">
                  <div className="flex flex-col items-center">
                    <img src="/assets/sprites/obstacles/smugller.webp" alt="قاچاقچی" className="w-10 h-10 object-contain drop-shadow-md" />
                    <span className="text-xs font-medium mt-1 text-red-700">قاچاقچی</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/assets/sprites/obstacles/car.webp" alt="ماشین" className="w-10 h-10 object-contain drop-shadow-md" />
                    <span className="text-xs font-medium mt-1 text-red-700">ماشین</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/assets/sprites/obstacles/camel.webp" alt="شتر" className="w-10 h-10 object-contain drop-shadow-md" />
                    <span className="text-xs font-medium mt-1 text-red-700">شتر</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/assets/sprites/obstacles/dog.webp" alt="سگ" className="w-10 h-10 object-contain drop-shadow-md" />
                    <span className="text-xs font-medium mt-1 text-red-700">سگ</span>
                  </div>
                </div>
                <p className="text-xs text-red-700 text-center font-medium leading-relaxed">
                  ⚠️ شتر، قاچاقچی و سگ دارای منطقه مرگ دایره‌ای هستند<br/>
                  از فاصله دور اجتناب کنید!<br/>
                  برخورد توله‌ها = مرگ<br/>
                  برخورد مادر = پایان بازی
                </p>
              </div>

              {/* Resources Section - Ultra Compact */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center text-sm">
                  <span className="text-base mr-1">🌿</span>
                  منابع غذایی، آب و سلامت خانواده
                </h3>
                <div className="flex justify-center space-x-4 space-x-reverse mb-3 p-2 bg-white/50 rounded-lg shadow-inner">
                  <div className="flex flex-col items-center">
                    <img src="/assets/sprites/resources/gazelle.webp" alt="آهو" className="w-12 h-12 object-contain drop-shadow-md" />
                    <span className="text-xs font-medium mt-1 text-green-700">آهو</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/assets/sprites/resources/rabbit.webp" alt="خرگوش" className="w-12 h-12 object-contain drop-shadow-md" />
                    <span className="text-xs font-medium mt-1 text-green-700">خرگوش</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="/assets/sprites/resources/water.webp" alt="آب" className="w-12 h-12 object-contain drop-shadow-md" />
                    <span className="text-xs font-medium mt-1 text-green-700">آب</span>
                  </div>
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
                <p className="text-xs text-green-700 text-center font-medium leading-relaxed">
                  دریافت منابع غذایی و آب، نمودار سلامت را پر می‌کند. اگر آب و غذا نخورید، خانواده ضعیف می‌شود.
                </p>
              </div>

              {/* Seasons Section */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center text-sm">
                  <span className="text-xl mr-2">🌸</span>
                  تغییر فصل‌ها
                </h3>
                <div className="flex justify-center space-x-1 space-x-reverse mb-2">
                  <img src="/assets/backgrounds/spring-bg.webp" alt="بهار" className="w-12 h-12 object-contain drop-shadow-md" />
                  <img src="/assets/backgrounds/summer-bg.webp" alt="تابستان" className="w-12 h-12 object-contain drop-shadow-md" />
                  <img src="/assets/backgrounds/autumn-bg.webp" alt="پاییز" className="w-12 h-12 object-contain drop-shadow-md" />
                  <img src="/assets/backgrounds/winter-bg.webp" alt="زمستان" className="w-12 h-12 object-contain drop-shadow-md" />
                </div>
                <p className="text-xs text-blue-700 text-center font-medium leading-relaxed">
                  در فصول مختلف منابع و تهدیدات کم یا زیاد می‌شوند. تغییر فصل را در پس زمینه بازی مشاهده کنید.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
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
        </div>
      )}


    </div>
  );
}
