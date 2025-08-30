import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameData, GameResults } from "@/types/game";
import { initializeGame, updateGame } from "@/lib/gameEngine";

interface PhaserGameProps {
  gameData: GameData;
  onUpdateGameData: (updates: Partial<GameData>) => void;
  onGameEnd: (results: Partial<GameResults>) => void;
  sessionId: string;
}

export default function PhaserGame({ gameData, onUpdateGameData, onGameEnd, sessionId }: PhaserGameProps) {
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
          updateGame(this);
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
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={gameRef} 
      className="absolute inset-0 phaser-canvas"
      data-testid="phaser-game-container"
    />
  );
}
