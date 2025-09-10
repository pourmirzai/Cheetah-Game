import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { GameData, GameResults } from "@/types/game";
import { initializeGame, updateGame, startActualGame } from "@/lib/gameEngine";

interface PhaserGameProps {
  gameData: GameData;
  onUpdateGameData: (updates: Partial<GameData>) => void;
  onGameEnd: (results: Partial<GameResults>) => void;
  sessionId: string;
  gameStarted: boolean;
  onLoadingProgress?: (progress: number, message: string) => void;
  onLoadingComplete?: () => void;
}

export default function PhaserGame({ gameData, onUpdateGameData, onGameEnd, sessionId, gameStarted, onLoadingProgress, onLoadingComplete }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Destroy existing game instance if it exists (for game restarts)
    if (phaserGameRef.current) {
      console.log('🔄 Destroying existing Phaser game instance for restart');
      phaserGameRef.current.destroy(true);
      phaserGameRef.current = null;
    }

    // Add a small delay for mobile devices to ensure DOM is ready
    const initGame = () => {
      if (!gameRef.current || phaserGameRef.current) return;

      // Additional check to ensure parent element is in DOM
      if (!document.body.contains(gameRef.current)) {
        console.warn('Parent element not in DOM, retrying...');
        setTimeout(initGame, 50);
        return;
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.visualViewport ? window.visualViewport.width : window.innerWidth,
        height: window.visualViewport ? window.visualViewport.height : window.innerHeight,
        parent: gameRef.current,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: {
          preload: function() {
            try {
              initializeGame(this, gameData, onUpdateGameData, onGameEnd, sessionId, onLoadingProgress, onLoadingComplete);
            } catch (error) {
              console.error('Error in preload:', error);
            }
          },
          create: function() {
            try {
              // Game creation logic handled in gameEngine
              console.log('Scene created successfully');
            } catch (error) {
              console.error('Error in create:', error);
            }
          },
          update: function() {
            try {
              // Game update logic handled in gameEngine
              updateGame(this as any);
            } catch (error) {
              console.error('Error in update:', error);
            }
          }
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        render: {
          // Remove pixelArt to allow smooth vector graphics
          // pixelArt: true - removed for better mobile quality
          antialias: true,
          antialiasGL: true
        }
      };

      try {
        phaserGameRef.current = new Phaser.Game(config);
        console.log('Phaser game initialized successfully');
      } catch (error) {
        console.error('Error initializing Phaser game:', error);
        // Fallback: show error message to user
        if (gameRef.current) {
          gameRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-family: Arial, sans-serif; text-align: center; padding: 20px;">
              <div>
                <h2>خطا در بارگذاری بازی</h2>
                <p>متاسفانه بازی نتوانست بارگذاری شود. لطفا صفحه را مجددا بارگذاری کنید.</p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                  بارگذاری مجدد
                </button>
              </div>
            </div>
          `;
        }
      }
    };

    // Small delay to ensure DOM is ready, especially on mobile
    const timeoutId = setTimeout(initGame, 100);

    return () => {
      clearTimeout(timeoutId);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [sessionId]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (phaserGameRef.current) {
        // Use visual viewport if available for better mobile support
        const width = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        phaserGameRef.current.scale.resize(width, height);

        // Update background scaling if game scene exists
        const scene = phaserGameRef.current.scene.getScene('default');
        if (scene && 'background' in scene) {
          const gameScene = scene as any;
          if (gameScene.background) {
            const screenWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
            const screenHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

            // Scale background to cover the entire screen using proper aspect ratio
            const bgImage = gameScene.background.texture.getSourceImage();
            if (bgImage) {
              const bgAspectRatio = bgImage.width / bgImage.height;
              const screenAspectRatio = screenWidth / screenHeight;

              let scaleX, scaleY;
              if (screenAspectRatio > bgAspectRatio) {
                // Screen is wider than background - scale to cover full width
                scaleX = screenWidth / bgImage.width;
                scaleY = scaleX;
              } else {
                // Screen is taller than background - scale to cover full height
                scaleY = screenHeight / bgImage.height;
                scaleX = scaleY;
              }

              gameScene.background.setScale(scaleX, scaleY);
              gameScene.background.setPosition(0, 0);
              gameScene.background.setOrigin(0, 0);
            }
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle game start when tutorial is completed
  useEffect(() => {
    console.log('🎮 PhaserGame: gameStarted changed to:', gameStarted);
    if (gameStarted && phaserGameRef.current) {
      console.log('🎮 PhaserGame: Starting actual game...');
      const scene = phaserGameRef.current.scene.getScene('default');
      if (scene) {
        console.log('🎮 PhaserGame: Found scene, calling startActualGame');
        startActualGame(scene);
        console.log('🎮 PhaserGame: startActualGame called successfully');
      } else {
        console.log('🎮 PhaserGame: Scene not found!');
      }
    }
  }, [gameStarted, sessionId]);

  // Update game data in Phaser scene when it changes
  useEffect(() => {
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('default');
      if (scene && 'gameData' in scene) {
        const gameScene = scene as any;
        gameScene.gameData = { ...gameScene.gameData, ...gameData };
        console.log('🎮 Updated Phaser scene gameData:', gameScene.gameData);
      }
    }
  }, [gameData]);


  return (
    <div
      ref={gameRef}
      className="absolute inset-0 w-full h-full phaser-canvas"
      data-testid="phaser-game-container"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
