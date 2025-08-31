import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainMenu from "./MainMenu";
import GameUI from "./GameUI";
import GameOver from "./GameOver";
import ShareCard from "./ShareCard";
import PhaserGame from "./PhaserGame";
import { GameState, GameData, GameResults } from "@/types/game";
import { trackEvent } from "@/lib/analytics";
import { backgroundManager, BackgroundConfig } from "@/lib/backgroundManager";
import { updateBestScore, incrementConsecutiveLosses, resetConsecutiveLosses, getBestScore } from "@/lib/cookieStorage";

const initialGameState: GameState = {
  currentScreen: 'menu',
  isPlaying: false,
  isPaused: false,
  sessionId: null
};

interface BestScore {
  cubsSurvived: number;
  monthsCompleted: number;
  finalScore: number;
  achievementTitle: string;
  date: string;
}

const initialGameData: GameData = {
  cubs: 4,
  currentMonth: 1,
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
  const [bestScoreForDownload, setBestScoreForDownload] = useState<BestScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("در حال بارگذاری...");

  const showScreen = useCallback((screenId: GameState['currentScreen']) => {
    setGameState(prev => ({ ...prev, currentScreen: screenId }));
  }, []);

  const startGame = useCallback(async (preserveGameData: boolean = false) => {
    try {
      // Set loading state
      setIsLoading(true);
      setLoadingProgress(0);
      setLoadingMessage("شروع بارگذاری بازی...");

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

      // Only reset gameData if not preserving it (for playAgain)
      if (!preserveGameData) {
        setGameData(initialGameData);
      }
      setGameStarted(false); // Reset game started flag

      trackEvent('game_start', { sessionId });
    } catch (error) {
      console.error('Error starting game:', error);
      setIsLoading(false);
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
        gameTime: 0, // No time limit, so game time is not relevant
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

      // Track consecutive losses
      if (results.deathCause === undefined) {
        // Game completed successfully - reset consecutive losses
        resetConsecutiveLosses();
        console.log('🎉 Game completed successfully - resetting consecutive losses');
      } else {
        // Game lost - increment consecutive losses
        const newLossCount = incrementConsecutiveLosses();
        console.log(`💔 Game lost - consecutive losses: ${newLossCount}`);
      }

      // Save best score to cookies
      const isNewBest = updateBestScore({
        cubsSurvived: finalResults.cubsSurvived,
        monthsCompleted: finalResults.monthsCompleted,
        finalScore: finalResults.finalScore,
        achievementTitle: finalResults.achievementTitle
      });

      if (isNewBest) {
        console.log('🎉 New best score saved!');
      }

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
    // Reset all values including month to start fresh
    const resetGameData: GameData = {
      ...initialGameData,
      currentMonth: 1 // Ensure month resets to 1
    };

    setGameData(resetGameData);
    setGameResults(null);
    startGame(true); // Preserve the gameData we just set
  }, [startGame]);

  const backToMenu = useCallback(() => {
    setGameState(initialGameState);
    setGameData(initialGameData);
    setGameResults(null);
    setGameStarted(false);
  }, []);

  const handleDownloadStory = useCallback((bestScore: BestScore) => {
    setBestScoreForDownload(bestScore);
    setGameState(prev => ({ ...prev, currentScreen: 'downloadStory' }));
  }, []);

  const onTutorialComplete = useCallback(() => {
    console.log('🎯 onTutorialComplete called in GameContainer');
    console.log('Setting game state to playing...');
    setGameState(prev => ({ ...prev, isPlaying: true }));
    console.log('Setting gameStarted to true...');

    // Unlock audio context when tutorial is completed
    console.log('🎵 Unlocking audio context on tutorial completion...');
    try {
      // Try to find the Phaser scene and unlock audio through audioManager
      const canvas = document.querySelector('canvas');
      if (canvas) {
        // Get the Phaser game instance from the canvas
        const game = (canvas as any).game;
        if (game && game.scene) {
          const scene = game.scene.getScene('default');
          if (scene && 'audioManager' in scene) {
            const gameScene = scene as any;
            if (gameScene.audioManager && gameScene.audioManager.initializeAudioContext) {
              console.log('🎵 Unlocking audio through audioManager on tutorial completion');
              gameScene.audioManager.initializeAudioContext();
            }
          }
        }
      }
    } catch (error) {
      console.warn('❌ Error unlocking audio context:', error);
    }

    setGameStarted(true);
    console.log('✅ Tutorial completion process finished');
  }, []);

  const handleLoadingProgress = useCallback((progress: number, message: string) => {
    setLoadingProgress(progress);
    setLoadingMessage(message);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    setLoadingProgress(100);
    setLoadingMessage("بارگذاری کامل شد!");
  }, []);

  return (
    <div className="relative w-full h-dvh overflow-hidden" data-testid="game-container">
      {/* Main Menu Screen */}
      {gameState.currentScreen === 'menu' && (
        <MainMenu
          onStartGame={startGame}
          onDownloadStory={handleDownloadStory}
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
            onLoadingProgress={handleLoadingProgress}
            onLoadingComplete={handleLoadingComplete}
          />
          <GameUI
            gameData={gameData}
            onTutorialComplete={onTutorialComplete}
            gameStarted={gameStarted}
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            loadingMessage={loadingMessage}
          />
        </>
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


      {/* Share Card Screen */}
      {gameState.currentScreen === 'shareCard' && gameResults && (
        <ShareCard
          results={gameResults}
          bestScore={getBestScore() || undefined}
          onClose={() => showScreen('gameOver')}
          onPlayAgain={playAgain}
          onBackToMenu={backToMenu}
        />
      )}

      {/* Download Story Screen */}
      {gameState.currentScreen === 'downloadStory' && bestScoreForDownload && (
        <ShareCard
          bestScore={bestScoreForDownload}
          onClose={() => showScreen('menu')}
          onPlayAgain={playAgain}
          onBackToMenu={backToMenu}
        />
      )}
    </div>
  );
}

function getConservationMessage(deathCause?: string): string {
  switch (deathCause) {
    case 'road':
      return 'جاده‌ها، خط پایان بسیاری از یوزها هستند. ایمن‌سازی جاده‌ها یکی از مهمترین اقدامات برای نجات یوزپلنگ است.';
    case 'smuggler':
      return 'حذف توله‌ها از طبیعت توسط قاچاقچیان و افراد نا‌اگاه یکی از مهمترین عوامل تهدید یوزپلنگ در جهان است.';
    case 'dog':
      return 'سگ‌های رها شده و سگ گله، بلای جان توله یوزها. کنترل جمعیت سگ‌های رها‌شده در زیستگاه ضروری است.';
    case 'starvation':
      return 'تکه‌تکه شدن زیستگاه، یعنی کاهش دسترسی به آب و غذا و نهایتا گرسنگی و انقراض.';
    case 'all_cubs_lost':
      return 'از دست دادن توله‌ها، پایان نسل یوزپلنگ را به همراه دارد. حفاظت از زیستگاه‌های امن ضروری است.';
    default:
      return 'یوزپلنگ آسیایی در معرض خطر انقراض است. با حمایت از حفاظت طبیعت به نجات این گونه کمک کنید.';
  }
}
