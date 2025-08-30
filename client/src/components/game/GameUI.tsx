import { GameData } from "@/types/game";
import { useEffect, useState } from "react";
import "@/styles/game-ui.css";

interface GameUIProps {
  gameData: GameData;
  onTutorialComplete?: () => void;
}

export default function GameUI({ gameData, onTutorialComplete }: GameUIProps) {
  const [showLowHealthWarning, setShowLowHealthWarning] = useState(false);
  const [burstReadyPulse, setBurstReadyPulse] = useState(false);
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
  const burstWidth = `${gameData.burstEnergy}%`;
  const burstReady = gameData.burstEnergy >= 100;

  // Calculate rabbit progress for jump bar
  const rabbitProgress = gameData.rabbitsCollected || 0;
  const maxRabbits = 3;

  return (
    <div className="game-ui-container" data-testid="game-ui">
      {/* Low health warning overlay */}
      {showLowHealthWarning && (
        <div className="warning-overlay" />
      )}

      {/* Compact Top Status Bar */}
      <div className="center-top">
        <div className="game-ui-card max-w-4xl">
          <div className="flex items-center justify-between">
            {/* Left Section: Month & Timer */}
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="text-center">
                <div className="text-xs text-gray-600 font-medium mb-1">ماه</div>
                <div className="text-xl font-bold text-orange-600" data-testid="text-current-month">{gameData.currentMonth}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 font-medium mb-1">زمان</div>
                <div className="text-xl font-bold text-gray-800" data-testid="text-time-remaining">{gameData.timeRemaining}</div>
              </div>
            </div>

            {/* Center Section: Season */}
            <div className="text-center">
              <div className={`w-10 h-10 rounded-xl border-2 ${seasonColors[gameData.season]} shadow-lg flex items-center justify-center mx-auto mb-2`} data-testid="season-indicator">
                <span className="text-xl">
                  {gameData.season === 'spring' && '🌸'}
                  {gameData.season === 'summer' && '☀️'}
                  {gameData.season === 'autumn' && '🍂'}
                  {gameData.season === 'winter' && '❄️'}
                </span>
              </div>
              <div className="text-xs font-medium text-gray-600" data-testid="text-season-name">{seasonNames[gameData.season]}</div>
            </div>

            {/* Right Section: Cubs & Score */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-center">
                <div className="text-xs text-gray-600 font-medium mb-1">امتیاز</div>
                <div className="text-lg font-bold text-yellow-600" data-testid="text-score">{gameData.score.toLocaleString()}</div>
              </div>
              <div className="flex space-x-1 space-x-reverse">
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      i < gameData.cubs
                        ? 'bg-orange-100 border-orange-400 shadow-sm'
                        : 'bg-gray-100 border-gray-300 opacity-50'
                    }`}
                    data-testid={`cub-indicator-${i}`}
                  >
                    <span className="text-xs">
                      {i < gameData.cubs ? '🐾' : '⚪'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Bar - Top Left */}
      <div className="top-left-panel">
        <div className={`game-ui-card w-72 ${showLowHealthWarning ? 'animate-pulse ring-2 ring-red-300' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg">💚</span>
              </div>
              <span className="text-lg font-semibold text-gray-700">جان خانواده</span>
            </div>
            <span className={`text-xl font-bold ${
              gameData.health < 25 ? 'text-red-600' :
              gameData.health < 50 ? 'text-yellow-600' : 'text-green-600'
            }`} data-testid="text-health-percentage">
              {Math.round(gameData.health)}%
            </span>
          </div>
          <div className="health-bar-container">
            <div
              className={`health-bar-fill transition-all duration-300 ${
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
          {gameData.health < 25 && (
            <div className="mt-2 text-center">
              <span className="text-xs text-red-600 font-medium animate-pulse">⚠️ جان کم است!</span>
            </div>
          )}
        </div>
      </div>

      {/* Rabbit Progress Bar - Top Right */}
      <div className="top-right-panel">
        <div className={`game-ui-card w-72 ${burstReadyPulse ? 'success-overlay' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-lg">⚡</span>
              </div>
              <span className="text-lg font-semibold text-gray-700">انرژی جهش سرعت</span>
            </div>
            <span className={`text-xl font-bold ${burstReady ? 'text-blue-600' : 'text-gray-600'}`} data-testid="text-burst-status">
              {burstReady ? 'آماده!' : `${rabbitProgress}/${maxRabbits}`}
            </span>
          </div>
          <div className="flex space-x-2 space-x-reverse justify-center">
            {Array.from({ length: maxRabbits }, (_, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  i < rabbitProgress
                    ? 'bg-orange-100 border-orange-400 shadow-lg animate-pulse'
                    : 'bg-gray-100 border-gray-300'
                }`}
                data-testid={`rabbit-indicator-${i}`}
              >
                <span className="text-2xl">
                  {i < rabbitProgress ? '🐰' : '⚪'}
                </span>
              </div>
            ))}
          </div>
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

      {/* Bottom Controls - Only show when guide is dismissed */}
      {!showGuideModal && (
        <div className="center-bottom">
          <div className="game-ui-card">
            <div className="flex items-center justify-center space-x-12 space-x-reverse">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="control-button w-14 h-14 bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-2xl">👆</span>
                </div>
                <span className="text-gray-700 font-semibold text-lg">حرکت</span>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="control-button w-14 h-14 bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">⚡</span>
                </div>
                <span className="text-gray-700 font-semibold text-lg">جهش سرعت</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal - Show before game starts */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">آموزش بازی</h2>
              <p className="text-gray-600">قبل از شروع بازی، کنترل‌ها را یاد بگیرید</p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-center space-x-4 space-x-reverse p-4 bg-orange-50 rounded-xl">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xl">👆</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">حرکت</h3>
                  <p className="text-sm text-gray-600">برای تغییر مسیر مادر یوز و توله‌ها لمس کنید یا کلیک کنید</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">جهش سرعت</h3>
                  <p className="text-sm text-gray-600">برای حرکت سریع‌تر دو بار لمس کنید (نیاز به ۳ خرگوش)</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">هدف</h3>
                  <p className="text-sm text-gray-600">مادر یوز را با ۴ توله در ۱۸ ماه به استقلال برسانید</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowGuideModal(false);
                onTutorialComplete?.();
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              شروع بازی! 🎮
            </button>
          </div>
        </div>
      )}

      {/* Speed Burst Indicator */}
      {gameData.speedBurstActive && (
        <div className="perfect-center pointer-events-none z-30">
          <div className="bg-blue-500/90 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-500/50 animate-bounce">
            🚀 جهش سرعت فعال!
          </div>
        </div>
      )}

    </div>
  );
}
