import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameData, GameResults } from "@/types/game";
import { initializeGame, updateGame, startActualGame } from "@/lib/gameEngine";

interface PhaserGameProps {
  gameData: GameData;
  onUpdateGameData: (updates: Partial<GameData>) => void;
  onGameEnd: (results: Partial<GameResults>) => void;
  sessionId: string;
  gameStarted: boolean;
}

export default function PhaserGame({ gameData, onUpdateGameData, onGameEnd, sessionId, gameStarted }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: function() {
          initializeGame(this, gameData, onUpdateGameData, onGameEnd, sessionId);
        },
        create: function() {
          // Game creation logic handled in gameEngine
        },
        update: function() {
          // Game update logic handled in gameEngine
          updateGame(this as any);
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        pixelArt: true
      }
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);

        // Update background scaling if game scene exists
        const scene = phaserGameRef.current.scene.getScene('default');
        if (scene && 'background' in scene && 'farBackground' in scene) {
          const gameScene = scene as any;
          if (gameScene.background && gameScene.farBackground) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Scale background to cover the entire screen
            const scaleX = screenWidth / gameScene.background.width;
            const scaleY = screenHeight / gameScene.background.height;
            const scale = Math.max(scaleX, scaleY);

            gameScene.background.setScale(scale);
            gameScene.farBackground.setScale(scale * 1.1); // Slightly larger for parallax effect

            // Reposition backgrounds to center
            gameScene.background.setPosition(screenWidth / 2, screenHeight / 2);
            gameScene.farBackground.setPosition(screenWidth / 2, screenHeight / 2);
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle game start when tutorial is completed
  useEffect(() => {
    if (gameStarted && phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('default');
      if (scene) {
        startActualGame(scene);
      }
    }
  }, [gameStarted]);

  return (
    <div 
      ref={gameRef} 
      className="absolute inset-0 phaser-canvas"
      data-testid="phaser-game-container"
    />
  );
}
