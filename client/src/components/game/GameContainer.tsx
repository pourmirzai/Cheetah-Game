import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainMenu from "./MainMenu";
import GameUI from "./GameUI";
import Tutorial from "./Tutorial";
import GameOver from "./GameOver";
import Leaderboard from "./Leaderboard";
import ShareCard from "./ShareCard";
import PhaserGame from "./PhaserGame";
import { GameState, GameData, GameResults } from "@/types/game";
import { trackEvent } from "@/lib/analytics";
import { backgroundManager, BackgroundConfig } from "@/lib/backgroundManager";

const initialGameState: GameState = {
  currentScreen: 'menu',
  isPlaying: false,
  isPaused: false,
  sessionId: null
};

const initialGameData: GameData = {
  cubs: 4,
  currentMonth: 1,
  timeRemaining: 120,
  health: 100,
  burstEnergy: 100,
  score: 0,
  season: 'spring',
  position: { x: 0, y: 0 },
  lane: 1,
  speed: 1,
  speedBurstActive: false
};

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameData, setGameData] = useState<GameData>(initialGameData);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const showScreen = useCallback((screenId: GameState['currentScreen']) => {
    setGameState(prev => ({ ...prev, currentScreen: screenId }));
  }, []);

  const startGame = useCallback(async () => {
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to start game');

      const { sessionId } = await response.json();

      setGameState(prev => ({
        ...prev,
        currentScreen: 'game',
        isPlaying: false, // Don't start playing yet - wait for tutorial
        sessionId
      }));

      setGameData(initialGameData);
      setGameStarted(false); // Reset game started flag

      trackEvent('game_start', { sessionId });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }, []);

  const endGame = useCallback(async (results: Partial<GameResults>) => {
    if (!gameState.sessionId) return;

    try {
      const gameEndData = {
        sessionId: gameState.sessionId,
        cubsSurvived: results.cubsSurvived || gameData.cubs,
        monthsCompleted: results.monthsCompleted || gameData.currentMonth,
        finalScore: results.finalScore || gameData.score,
        gameTime: 120 - gameData.timeRemaining,
        deathCause: results.deathCause,
        achievements: results.achievements || []
      };

      const response = await fetch('/api/game/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameEndData)
      });

      if (!response.ok) throw new Error('Failed to end game');

      const { achievementTitle } = await response.json();
      
      const finalResults: GameResults = {
        ...gameEndData,
        achievementTitle,
        conservationMessage: getConservationMessage(results.deathCause)
      };

      setGameResults(finalResults);
      setGameState(prev => ({
        ...prev,
        currentScreen: 'gameOver',
        isPlaying: false
      }));

      trackEvent('game_end', finalResults);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  }, [gameState.sessionId, gameData]);

  const updateGameData = useCallback((updates: Partial<GameData>) => {
    setGameData(prev => ({ ...prev, ...updates }));
  }, []);

  const playAgain = useCallback(() => {
    setGameData(initialGameData);
    setGameResults(null);
    startGame();
  }, [startGame]);

  const backToMenu = useCallback(() => {
    setGameState(initialGameState);
    setGameData(initialGameData);
    setGameResults(null);
    setGameStarted(false);
  }, []);

  const onTutorialComplete = useCallback(() => {
    console.log('Tutorial completed, starting actual game...');
    setGameState(prev => ({ ...prev, isPlaying: true }));
    setGameStarted(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" data-testid="game-container">
      {/* Main Menu Screen */}
      {gameState.currentScreen === 'menu' && (
        <MainMenu 
          onStartGame={startGame}
          onShowTutorial={() => showScreen('tutorial')}
          onShowLeaderboard={() => showScreen('leaderboard')}
        />
      )}

      {/* Game Screen */}
      {gameState.currentScreen === 'game' && (
        <>
          <PhaserGame
            gameData={gameData}
            onUpdateGameData={updateGameData}
            onGameEnd={endGame}
            sessionId={gameState.sessionId!}
            gameStarted={gameStarted}
          />
          <GameUI
            gameData={gameData}
            onTutorialComplete={onTutorialComplete}
          />
        </>
      )}

      {/* Tutorial Overlay */}
      {gameState.currentScreen === 'tutorial' && (
        <Tutorial onClose={() => showScreen('menu')} />
      )}

      {/* Game Over Screen */}
      {gameState.currentScreen === 'gameOver' && gameResults && (
        <GameOver
          results={gameResults}
          onPlayAgain={playAgain}
          onBackToMenu={backToMenu}
          onShare={() => showScreen('shareCard')}
        />
      )}

      {/* Leaderboard Screen */}
      {gameState.currentScreen === 'leaderboard' && (
        <Leaderboard onClose={() => showScreen('menu')} />
      )}

      {/* Share Card Screen */}
      {gameState.currentScreen === 'shareCard' && gameResults && (
        <ShareCard
          results={gameResults}
          onClose={() => showScreen('gameOver')}
        />
      )}
    </div>
  );
}

function getConservationMessage(deathCause?: string): string {
  switch (deathCause) {
    case 'road':
      return 'جاده‌ها، خط پایان بسیاری از یوزها هستند. حفاظت از کریدورهای طبیعی ضروری است.';
    case 'poacher':
      return 'شکار غیرقانونی، آینده یوز را می‌دزدد. گزارش فعالیت‌های مشکوک به حفاظت محیط زیست.';
    case 'dog':
      return 'سگ‌های رها شده و سگ گله، بلای جان توله یوزها. کنترل سگ‌های ولگرد ضروری است.';
    case 'starvation':
      return 'تکه‌تکه شدن زیستگاه، یعنی گرسنگی و انقراض. حفظ کریدورهای طبیعی حیاتی است.';
    default:
      return 'یوزپلنگ آسیایی در معرض خطر انقراض است. با حمایت از حفاظت طبیعت به نجات این گونه کمک کنید.';
  }
}
