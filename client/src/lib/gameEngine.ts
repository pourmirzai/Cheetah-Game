import Phaser from "phaser";
import { GameData, GameResults, GameObject, Obstacle, Resource } from "@/types/game";
import { trackEvent } from "@/lib/analytics";
import {
  createMotherCheetahSprite,
  createCubSprite,
  createDogObstacleSprite,
  createCamelObstacleSprite,
  createWaterResourceSprite,
  createGazelleResourceSprite,
  createRabbitResourceSprite,
  createBackgroundTexture
} from "@/lib/spriteGenerator";
import { AudioManager } from "@/lib/audioManager";
import { backgroundManager } from "@/lib/backgroundManager";
import { GAME_ASSETS } from "@/lib/assetConfig";

interface GameScene extends Phaser.Scene {
  gameData: GameData;
  onUpdateGameData: (updates: Partial<GameData>) => void;
  onGameEnd: (results: Partial<GameResults>) => void;
  sessionId: string;

  // Audio
  audioManager?: AudioManager;

  // Game objects
  motherCheetah?: Phaser.GameObjects.Sprite;
  cubs: Phaser.GameObjects.Sprite[];
  obstacles: Phaser.GameObjects.Group;
  resources: Phaser.GameObjects.Group;
  background?: Phaser.GameObjects.TileSprite;

  // Game state
  lanes: number[];
  currentLane: number;
  lastLaneChange?: number;
  farBackground?: Phaser.GameObjects.TileSprite;
  isStopped?: boolean;
  gameSpeed: number;
  lastSpeedBurst: number;
  gameTimer?: Phaser.Time.TimerEvent;
  monthTimer?: Phaser.Time.TimerEvent;
  spawnTimer?: Phaser.Time.TimerEvent;

  // Game control
  gameStarted: boolean;

  // Input
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  pointer?: Phaser.Input.Pointer;
  lastTap: number;
  startX: number;
}

export function initializeGame(
  scene: Phaser.Scene,
  gameData: GameData,
  onUpdateGameData: (updates: Partial<GameData>) => void,
  onGameEnd: (results: Partial<GameResults>) => void,
  sessionId: string
) {
  const gameScene = scene as GameScene;
  gameScene.gameData = gameData;
  gameScene.onUpdateGameData = onUpdateGameData;
  gameScene.onGameEnd = onGameEnd;
  gameScene.sessionId = sessionId;
  gameScene.cubs = [];
  gameScene.lanes = [120, 240, 360, 480]; // Lane positions
  gameScene.currentLane = 1;
  gameScene.gameSpeed = 200;
  gameScene.lastSpeedBurst = 0;
  gameScene.lastTap = 0;
  gameScene.startX = 0;
  gameScene.gameStarted = false; // Game starts paused until tutorial is completed

  // Load game assets first
  loadAssets(scene);

  // Wait for all assets to load before creating the game world
  scene.load.on('complete', () => {
    console.log('🎮 All assets loaded, creating game world...');
    createGameWorld(gameScene);
    setupInput(gameScene);
    // Don't start timers yet - wait for tutorial completion
  });
}

export function startActualGame(scene: Phaser.Scene) {
  const gameScene = scene as GameScene;
  if (!gameScene.gameStarted) {
    console.log('🚀 Starting actual game after tutorial completion!');
    gameScene.gameStarted = true;
    startGameTimers(gameScene);
  }
}

function loadAssets(scene: Phaser.Scene) {
  console.log('🎮 Loading game assets from centralized configuration...');

  // Load character sprites
  GAME_ASSETS.loadConfig.characters.forEach(({ texture, path }) => {
    console.log(`🔄 Loading character: ${path} → ${texture}`);
    scene.load.image(texture, path);
  });

  // Load obstacle sprites
  GAME_ASSETS.loadConfig.obstacles.forEach(({ texture, path }) => {
    console.log(`🔄 Loading obstacle: ${path} → ${texture}`);
    scene.load.image(texture, path);
  });

  // Load resource sprites
  GAME_ASSETS.loadConfig.resources.forEach(({ texture, path }) => {
    console.log(`🔄 Loading resource: ${path} → ${texture}`);
    scene.load.image(texture, path);
  });

  // Load background images
  GAME_ASSETS.loadConfig.backgrounds.forEach(({ texture, path }) => {
    console.log(`🔄 Loading seasonal background: ${path} → ${texture}`);
    scene.load.image(texture, path);
  });
}




function getSeasonColor(season: string): number {
  switch (season) {
    case 'spring': return 0x90EE90; // Light green
    case 'summer': return 0xF4A460; // Sandy brown  
    case 'autumn': return 0xDEB887; // Burlywood
    case 'winter': return 0xF5F5DC; // Beige
    default: return 0x90EE90; // Default to spring
  }
}

function createGameWorld(scene: GameScene) {
  // Initialize audio manager
  scene.audioManager = new AudioManager(scene);
  scene.audioManager.playMusic('ambient');

  // Set default season if not set
  if (!scene.gameData.season) {
    scene.gameData.season = 'spring';
  }

  // Initialize jump bar to 0/3 (not charged)
  if (scene.gameData.burstEnergy >= 100) {
    scene.gameData.burstEnergy = 0;
  }
  if (scene.gameData.rabbitsCollected !== 0) {
    scene.gameData.rabbitsCollected = 0;
  }

  // Get seasonal background based on current season
  const seasonToTexture = {
    'spring': 'spring-bg',
    'summer': 'summer-bg',
    'autumn': 'autumn-bg',
    'winter': 'winter-bg'
  };
  const bgTexture = seasonToTexture[scene.gameData.season as keyof typeof seasonToTexture] || 'spring-bg';
  console.log(`🎨 Initializing seasonal background: ${bgTexture} for season ${scene.gameData.season}`);

  // Create responsive background layers that scale properly
  const screenWidth = scene.scale.width;
  const screenHeight = scene.scale.height;

  // Create single background using tileSprite for better performance and scaling
  scene.background = scene.add.tileSprite(0, 0, screenWidth, screenHeight, bgTexture);
  scene.background.setOrigin(0, 0);

  // Scale background to cover the entire screen without distortion
  const bgImage = scene.textures.get(bgTexture);
  if (bgImage) {
    const bgFrame = bgImage.getSourceImage();
    if (bgFrame) {
      const bgAspectRatio = bgFrame.width / bgFrame.height;
      const screenAspectRatio = screenWidth / screenHeight;

      let scaleX, scaleY;
      if (screenAspectRatio > bgAspectRatio) {
        // Screen is wider than background - scale to cover width
        scaleX = screenWidth / bgFrame.width;
        scaleY = scaleX;
      } else {
        // Screen is taller than background - scale to cover height
        scaleY = screenHeight / bgFrame.height;
        scaleX = scaleY;
      }

      scene.background.setScale(scaleX, scaleY);
    }
  }

  // Remove farBackground to eliminate green overlay
  scene.farBackground = undefined;

  // Create mother cheetah with enhanced visibility
  scene.motherCheetah = scene.add.sprite(scene.lanes[scene.currentLane], scene.scale.height - 150, 'mother-cheetah-pixel');

  // Scale mother cheetah to better visibility (increased size: max 64x48 pixels)
  const motherMaxWidth = 64;
  const motherMaxHeight = 48;
  const motherOriginalWidth = scene.motherCheetah.width;
  const motherOriginalHeight = scene.motherCheetah.height;

  if (motherOriginalWidth > motherMaxWidth || motherOriginalHeight > motherMaxHeight) {
    const scaleX = motherMaxWidth / motherOriginalWidth;
    const scaleY = motherMaxHeight / motherOriginalHeight;
    const scale = Math.min(scaleX, scaleY);
    scene.motherCheetah.setScale(scale);
  } else {
    // If image is smaller than max, use a minimum scale for visibility
    scene.motherCheetah.setScale(Math.max(1.2, motherOriginalWidth / motherMaxWidth));
  }

  // Add glow effect for better visibility
  scene.motherCheetah.setTint(0xffffff);
  scene.motherCheetah.preFX?.addGlow(0xffd700, 0.3, 0, false);

  // Create cubs following behind with enhanced visibility
  for (let i = 0; i < scene.gameData.cubs; i++) {
    const cub = scene.add.sprite(
      scene.lanes[scene.currentLane] + (i % 2 === 0 ? -25 : 25),
      scene.scale.height - 100 - (i * 35),
      'cub-pixel'
    );

    // Scale cubs for better visibility (increased size: max 40x28 pixels)
    const cubMaxWidth = 40;
    const cubMaxHeight = 28;
    const cubOriginalWidth = cub.width;
    const cubOriginalHeight = cub.height;

    if (cubOriginalWidth > cubMaxWidth || cubOriginalHeight > cubMaxHeight) {
      const scaleX = cubMaxWidth / cubOriginalWidth;
      const scaleY = cubMaxHeight / cubOriginalHeight;
      const scale = Math.min(scaleX, scaleY);
      cub.setScale(scale);
    } else {
      // If image is smaller than max, use a minimum scale for visibility
      cub.setScale(Math.max(1.0, cubOriginalWidth / cubMaxWidth));
    }

    // Add glow effect for better visibility
    cub.setTint(0xffffff);
    cub.preFX?.addGlow(0xffa500, 0.25, 0, false);

    // Add gentle bobbing animation for cuteness and visibility
    scene.tweens.add({
      targets: cub,
      y: cub.y - 4,
      duration: 1200 + (i * 300),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add subtle pulsing effect
    scene.tweens.add({
      targets: cub,
      alpha: 0.8,
      duration: 800 + (i * 200),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    scene.cubs.push(cub);
  }

  // Create groups for obstacles and resources
  scene.obstacles = scene.add.group();
  scene.resources = scene.add.group();

  // Enable physics
  scene.physics.world.enable([scene.motherCheetah, ...scene.cubs]);
  
  // Set collision boundaries
  if (scene.motherCheetah?.body) {
    (scene.motherCheetah.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }
}

function setupInput(scene: GameScene) {
  // Keyboard input
  scene.cursors = scene.input.keyboard?.createCursorKeys();

  // Touch/mouse input
  scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    scene.startX = pointer.x;
    
    // Double tap detection for speed burst
    const currentTime = Date.now();
    if (currentTime - scene.lastTap < 500) {
      triggerSpeedBurst(scene);
    }
    scene.lastTap = currentTime;
  });

  scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    if (pointer.isDown) {
      const deltaX = pointer.x - scene.startX;
      
      // Lane switching based on swipe
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0 && scene.currentLane < scene.lanes.length - 1) {
          changeLane(scene, scene.currentLane + 1);
        } else if (deltaX < 0 && scene.currentLane > 0) {
          changeLane(scene, scene.currentLane - 1);
        }
        scene.startX = pointer.x;
      }
    }
  });
}

function changeLane(scene: GameScene, newLane: number) {
  scene.currentLane = newLane;
  const targetX = scene.lanes[newLane];
  
  // Smooth movement to new lane
  scene.tweens.add({
    targets: scene.motherCheetah,
    x: targetX,
    duration: 200,
    ease: 'Power2'
  });

  // Move cubs to follow
  scene.cubs.forEach((cub, index) => {
    scene.tweens.add({
      targets: cub,
      x: targetX + (index % 2 === 0 ? -20 : 20),
      duration: 250 + (index * 50),
      ease: 'Power2'
    });
  });

  trackEvent('lane_change', { 
    sessionId: scene.sessionId, 
    newLane, 
    month: scene.gameData.currentMonth 
  });
}

function triggerSpeedBurst(scene: GameScene) {
  if (scene.gameData.burstEnergy >= 100) {
    scene.gameData.speedBurstActive = true;
    scene.gameSpeed *= 2;

    scene.onUpdateGameData({
      burstEnergy: 0,
      speedBurstActive: true
    });

    // Audio effect
    scene.audioManager?.onSpeedBurst();

    // Visual effect
    scene.cameras.main.flash(200, 255, 255, 0);

    // End speed burst after 2 seconds
    scene.time.delayedCall(2000, () => {
      scene.gameData.speedBurstActive = false;
      scene.gameSpeed /= 2;
      scene.onUpdateGameData({ speedBurstActive: false });
    });

    trackEvent('speed_burst', {
      sessionId: scene.sessionId,
      month: scene.gameData.currentMonth
    });
  }
}

function startGameTimers(scene: GameScene) {
  // Main game timer (120 seconds)
  scene.gameTimer = scene.time.addEvent({
    delay: 1000,
    callback: () => {
      scene.gameData.timeRemaining--;
      scene.onUpdateGameData({ timeRemaining: scene.gameData.timeRemaining });
      
      if (scene.gameData.timeRemaining <= 0) {
        endGame(scene, 'completed');
      }
    },
    loop: true
  });

  // Month progression timer (every 6-8 seconds)
  scene.monthTimer = scene.time.addEvent({
    delay: Phaser.Math.Between(6000, 8000),
    callback: () => {
      scene.gameData.currentMonth++;
      updateSeason(scene);
      scene.onUpdateGameData({ 
        currentMonth: scene.gameData.currentMonth,
        season: scene.gameData.season 
      });
      
      trackEvent('month_reached', { 
        sessionId: scene.sessionId, 
        month: scene.gameData.currentMonth 
      });
      
      // Check for victory condition - reached month 18 (independence)
      if (scene.gameData.currentMonth >= 18) {
        endGame(scene, 'completed');
      }
    },
    loop: true
  });

  // Spawn obstacles and resources
  scene.time.addEvent({
    delay: 2000,
    callback: () => spawnGameObject(scene),
    loop: true
  });

  // Update health and energy
  scene.time.addEvent({
    delay: 3000,
    callback: () => updateHealthAndEnergy(scene),
    loop: true
  });
}

function updateSeason(scene: GameScene) {
  const month = scene.gameData.currentMonth;
  let newSeason: string;

  if (month <= 3 || (month >= 13 && month <= 15)) {
    newSeason = 'spring';
  } else if (month <= 6 || (month >= 16 && month <= 18)) {
    newSeason = 'summer';
  } else if (month <= 9) {
    newSeason = 'autumn';
  } else {
    newSeason = 'winter';
  }

  // Only update if season actually changed
  if (scene.gameData.season !== newSeason) {
    const oldSeason = scene.gameData.season;
    scene.gameData.season = newSeason as "spring" | "summer" | "autumn" | "winter";
    console.log(`🌸 Season changed from ${oldSeason} to ${newSeason} (Month: ${month})`);

    // Update background immediately when season changes
    updateBackgroundForSeason(scene, newSeason);
  }
}

function updateBackgroundForSeason(scene: GameScene, season: string) {
  const seasonToTexture = {
    'spring': 'spring-bg',
    'summer': 'summer-bg',
    'autumn': 'autumn-bg',
    'winter': 'winter-bg'
  };

  const newBgTexture = seasonToTexture[season as keyof typeof seasonToTexture] || 'spring-bg';

  if (scene.background) {
    console.log(`🔄 Changing background to: ${newBgTexture} for season ${season}`);

    // Update background texture
    scene.background.setTexture(newBgTexture);

    // Re-scale background to maintain cover mode
    const screenWidth = scene.scale.width;
    const screenHeight = scene.scale.height;
    const bgImage = scene.textures.get(newBgTexture);

    if (bgImage) {
      const bgFrame = bgImage.getSourceImage();
      if (bgFrame) {
        const bgAspectRatio = bgFrame.width / bgFrame.height;
        const screenAspectRatio = screenWidth / screenHeight;

        let scaleX, scaleY;
        if (screenAspectRatio > bgAspectRatio) {
          scaleX = screenWidth / bgFrame.width;
          scaleY = scaleX;
        } else {
          scaleY = screenHeight / bgFrame.height;
          scaleX = scaleY;
        }

        scene.background.setScale(scaleX, scaleY);
      }
    }
  }
}

function spawnGameObject(scene: GameScene) {
  const lane = Phaser.Math.Between(0, scene.lanes.length - 1);
  const x = scene.lanes[lane];
  const y = -50;

  // 70% chance for obstacle, 30% for resource
  if (Math.random() < 0.7) {
    spawnObstacle(scene, x, y);
  } else {
    spawnResource(scene, x, y);
  }
}

function spawnObstacle(scene: GameScene, x: number, y: number) {
  // 20% chance for horizontal road (spans across lanes)
  if (Math.random() < 0.2) {
    spawnRoad(scene, y);
    return;
  }

  const obstacleInfo = GAME_ASSETS.obstacles.types[Phaser.Math.Between(0, GAME_ASSETS.obstacles.types.length - 1)];

  const obstacle = scene.add.sprite(x, y, obstacleInfo.texture);

  // Scale obstacles to consistent reasonable size based on type
  const maxSize = GAME_ASSETS.obstacles.sizes[obstacleInfo.type as keyof typeof GAME_ASSETS.obstacles.sizes] || 40;
  const originalWidth = obstacle.width;
  const originalHeight = obstacle.height;

  if (originalWidth > maxSize || originalHeight > maxSize) {
    const scaleX = maxSize / originalWidth;
    const scaleY = maxSize / originalHeight;
    const scale = Math.min(scaleX, scaleY);
    obstacle.setScale(scale);
  }

  scene.obstacles.add(obstacle);
  scene.physics.world.enable(obstacle);
  
  // Special handling for different obstacle types using centralized config
  const specialBehavior = GAME_ASSETS.obstacles.specialBehaviors[obstacleInfo.type as keyof typeof GAME_ASSETS.obstacles.specialBehaviors];

  if (specialBehavior) {
    // Removed poacher spotlight/cone effect completely

    if (specialBehavior.speedMultiplier && specialBehavior.speedMultiplier !== 1.0) {
      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(scene.gameSpeed * specialBehavior.speedMultiplier);
    }
  }
  
  // Set initial velocity for obstacle (will be updated in updateGame)
  const body = obstacle.body as Phaser.Physics.Arcade.Body;
  body.setVelocityY(scene.gameSpeed);
  
  // Remove obstacle when it goes off screen
  obstacle.setData('isMoving', true);

  // Collision detection
  scene.physics.add.overlap(scene.motherCheetah!, obstacle, () => {
    scene.audioManager?.onHitObstacle(obstacleInfo.type);
    endGame(scene, obstacleInfo.type);
  });

  scene.cubs.forEach((cub, index) => {
    scene.physics.add.overlap(cub, obstacle, () => {
      // Remove one cub
      scene.gameData.cubs--;
      cub.destroy();
      scene.cubs.splice(index, 1);
      
      scene.onUpdateGameData({ cubs: scene.gameData.cubs });
      
      trackEvent('collision', { 
        sessionId: scene.sessionId, 
        type: 'cub_lost', 
        obstacleType: obstacleInfo.type,
        month: scene.gameData.currentMonth 
      });
      
      if (scene.gameData.cubs === 0) {
        endGame(scene, 'all_cubs_lost');
      }
    });
  });
}

function spawnRoad(scene: GameScene, y: number) {
  // Create horizontal road spanning all lanes
  const road = scene.add.rectangle(scene.scale.width / 2, y, scene.scale.width, 40, 0x333333);
  scene.physics.world.enable(road);
  
  // Add road markings with physics
  for (let i = 0; i < scene.scale.width; i += 80) {
    const marking = scene.add.rectangle(i, y, 40, 4, 0xffffff);
    scene.physics.world.enable(marking);
    const markingBody = marking.body as Phaser.Physics.Arcade.Body;
    markingBody.setVelocityY(scene.gameSpeed);
    marking.setData('isMoving', true);
  }
  
  // Set initial velocity for road (will be updated in updateGame)
  const body = road.body as Phaser.Physics.Arcade.Body;
  body.setVelocityY(scene.gameSpeed);
  
  // Remove road when it goes off screen
  road.setData('isMoving', true);

  // 50% chance to spawn cars on the road
  if (Math.random() < 0.5) {
    spawnCarsOnRoad(scene, y);
  }
}

function spawnCarsOnRoad(scene: GameScene, roadY: number) {
  // Spawn 1-3 cars randomly across the road
  const numCars = Phaser.Math.Between(1, 3);
  
  for (let i = 0; i < numCars; i++) {
    const carX = Phaser.Math.Between(50, scene.scale.width - 50);
    // Create simple car sprite using graphics
    const carGraphics = scene.add.graphics();
    carGraphics.fillStyle(0xff0000); // Red car
    carGraphics.fillRect(0, 0, 40, 20);
    carGraphics.fillStyle(0x000000); // Black windows
    carGraphics.fillRect(5, 5, 10, 10);
    carGraphics.fillRect(25, 5, 10, 10);
    carGraphics.generateTexture('car-pixel', 40, 20);

    const car = scene.add.sprite(carX, roadY, 'car-pixel');

    // Scale cars to consistent reasonable size (35x20 pixels max)
    const maxCarWidth = 35;
    const maxCarHeight = 20;
    const originalCarWidth = car.width;
    const originalCarHeight = car.height;

    if (originalCarWidth > maxCarWidth || originalCarHeight > maxCarHeight) {
      const scaleX = maxCarWidth / originalCarWidth;
      const scaleY = maxCarHeight / originalCarHeight;
      const scale = Math.min(scaleX, scaleY);
      car.setScale(scale);
    }

    scene.obstacles.add(car);
    scene.physics.world.enable(car);

    // Set initial velocity for car (will be updated in updateGame)
    const body = car.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(scene.gameSpeed);
    body.setVelocityX(Phaser.Math.Between(-50, 50)); // Slight horizontal movement

    // Remove car when it goes off screen
    car.setData('isMoving', true);

    // Car collision detection
    scene.physics.add.overlap(scene.motherCheetah!, car, () => {
      scene.audioManager?.onHitObstacle('road');
      endGame(scene, 'road');
    });

    scene.cubs.forEach((cub, index) => {
      scene.physics.add.overlap(cub, car, () => {
        scene.gameData.cubs--;
        cub.destroy();
        scene.cubs.splice(index, 1);
        scene.onUpdateGameData({ cubs: scene.gameData.cubs });
        
        trackEvent('collision', { 
          sessionId: scene.sessionId, 
          type: 'cub_lost', 
          obstacleType: 'car',
          month: scene.gameData.currentMonth 
        });
        
        if (scene.gameData.cubs === 0) {
          endGame(scene, 'all_cubs_lost');
        }
      });
    });
  }
}

function spawnResource(scene: GameScene, x: number, y: number) {
  const resourceInfo = GAME_ASSETS.resources.types[Phaser.Math.Between(0, GAME_ASSETS.resources.types.length - 1)];

  const resource = scene.add.sprite(x, y, resourceInfo.texture);

  // Scale resources to consistent reasonable size
  const maxSize = GAME_ASSETS.resources.maxSize;
  const originalWidth = resource.width;
  const originalHeight = resource.height;

  if (originalWidth > maxSize || originalHeight > maxSize) {
    const scaleX = maxSize / originalWidth;
    const scaleY = maxSize / originalHeight;
    const scale = Math.min(scaleX, scaleY);
    resource.setScale(scale);
  }

  scene.resources.add(resource);
  scene.physics.world.enable(resource);
  
  // Set initial velocity for resource (will be updated in updateGame)
  const body = resource.body as Phaser.Physics.Arcade.Body;
  body.setVelocityY(scene.gameSpeed);
  
  // Remove resource when it goes off screen
  resource.setData('isMoving', true);

  // Collection detection
  scene.physics.add.overlap(scene.motherCheetah!, resource, () => {
    collectResource(scene, resourceInfo.type);
    trackEvent('pickup', { 
      sessionId: scene.sessionId, 
      resourceType: resourceInfo.type,
      month: scene.gameData.currentMonth 
    });
    resource.destroy();
  });
}

function collectResource(scene: GameScene, type: string) {
  // Find the resource configuration
  const resourceConfig = GAME_ASSETS.resources.types.find(r => r.type === type);
  const healthGain = resourceConfig?.healthGain || 0;

  // Play collection sound
  scene.audioManager?.onCollectResource(type);

  // Special handling for rabbit energy burst
  if (type === 'rabbit') {
    // Initialize rabbitsCollected if not exists
    if (!scene.gameData.rabbitsCollected) {
      scene.gameData.rabbitsCollected = 0;
    }

    scene.gameData.rabbitsCollected += 1;
    console.log(`🐰 Rabbit collected! Total: ${scene.gameData.rabbitsCollected}/3`);

    // Charge burst energy when 3 rabbits are collected
    if (scene.gameData.rabbitsCollected >= 3) {
      scene.gameData.burstEnergy = Math.min(100, scene.gameData.burstEnergy + 100);
      scene.gameData.rabbitsCollected = 0; // Reset counter
      console.log('⚡ Energy burst charged to 100%!');

      scene.onUpdateGameData({
        burstEnergy: scene.gameData.burstEnergy,
        rabbitsCollected: scene.gameData.rabbitsCollected
      });
    } else {
      // Update rabbits collected count
      scene.onUpdateGameData({
        rabbitsCollected: scene.gameData.rabbitsCollected
      });
    }
  }

  scene.gameData.health = Math.min(100, scene.gameData.health + healthGain);
  scene.gameData.score += healthGain * 10;

  scene.onUpdateGameData({
    health: scene.gameData.health,
    score: scene.gameData.score
  });

  console.log(`📊 Resource collected: ${type}, Health: +${healthGain}, Total Health: ${scene.gameData.health}`);
}

function updateHealthAndEnergy(scene: GameScene) {
  // Decrease health over time
  scene.gameData.health = Math.max(0, scene.gameData.health - 5);

  // Increase burst energy
  if (!scene.gameData.speedBurstActive && scene.gameData.burstEnergy < 100) {
    scene.gameData.burstEnergy = Math.min(100, scene.gameData.burstEnergy + 10);
  }

  scene.onUpdateGameData({
    health: scene.gameData.health,
    burstEnergy: scene.gameData.burstEnergy
  });

  // Low health warning
  if (scene.gameData.health < 25 && scene.gameData.health > 0) {
    scene.audioManager?.onLowHealth();
  }

  // Check for starvation
  if (scene.gameData.health <= 0) {
    endGame(scene, 'starvation');
  }
}

function endGame(scene: GameScene, cause: string) {
  // Stop timers
  scene.gameTimer?.destroy();
  scene.monthTimer?.destroy();

  // Audio feedback
  if (cause === 'completed') {
    scene.audioManager?.onVictory();
  } else {
    scene.audioManager?.onGameOver();
  }

  // Calculate final results
  const results: Partial<GameResults> = {
    cubsSurvived: scene.gameData.cubs,
    monthsCompleted: scene.gameData.currentMonth,
    finalScore: scene.gameData.score,
    gameTime: 120 - scene.gameData.timeRemaining,
    deathCause: cause === 'completed' ? undefined : cause,
    achievements: []
  };

  // Add achievements
  if (results.cubsSurvived === 4 && results.monthsCompleted! >= 18) {
    results.achievements!.push('perfect_family');
  }
  if (cause === 'completed') {
    results.achievements!.push('survivor');
  }

  // Cleanup audio
  scene.audioManager?.destroy();

  scene.onGameEnd(results);
}

// Update scene every frame
export function updateGame(scene: GameScene) {
  // Only run game logic if the game has started (tutorial completed)
  if (!scene.gameStarted) {
    return;
  }

  // Play running sound periodically
  if (scene.gameData.timeRemaining > 0 && !scene.isStopped) {
    const currentTime = Date.now();
    // Play running sound every 2 seconds
    if (currentTime % 2000 < 100) {
      scene.audioManager?.startRunningSound();
    }
  }

  // Process keyboard input
  if (scene.cursors) {
    const currentTime = Date.now();
    const timeSinceLastMove = currentTime - (scene.lastLaneChange || 0);
    
    // Left arrow key - move left
    if (scene.cursors.left?.isDown && scene.currentLane > 0 && timeSinceLastMove > 300) {
      changeLane(scene, scene.currentLane - 1);
      scene.lastLaneChange = currentTime;
    }
    
    // Right arrow key - move right  
    if (scene.cursors.right?.isDown && scene.currentLane < scene.lanes.length - 1 && timeSinceLastMove > 300) {
      changeLane(scene, scene.currentLane + 1);
      scene.lastLaneChange = currentTime;
    }
    
    // Up arrow key - increase speed
    if (scene.cursors.up?.isDown && !scene.isStopped) {
      scene.gameSpeed = Math.min(scene.gameSpeed * 1.5, 400);
    }
    
    // Down arrow key - stop/slow down
    if (scene.cursors.down?.isDown) {
      scene.isStopped = true;
      scene.gameSpeed = 50; // Very slow speed when stopped
    } else {
      if (scene.isStopped) {
        scene.isStopped = false;
        scene.gameSpeed = 200; // Resume normal speed
      }
    }
    
    // Space key - speed burst
    if (scene.cursors.space?.isDown && timeSinceLastMove > 500) {
      triggerSpeedBurst(scene);
      scene.lastLaneChange = currentTime;
    }
  }

  // Update velocities of all moving objects based on current speed
  scene.obstacles.children.entries.forEach((obstacle: any) => {
    if (obstacle.getData('isMoving') && obstacle.body) {
      obstacle.body.setVelocityY(scene.gameSpeed);
      // Remove if off screen
      if (obstacle.y > scene.scale.height + 100) {
        obstacle.destroy();
      }
    }
  });

  scene.resources.children.entries.forEach((resource: any) => {
    if (resource.getData('isMoving') && resource.body) {
      resource.body.setVelocityY(scene.gameSpeed);
      // Remove if off screen
      if (resource.y > scene.scale.height + 100) {
        resource.destroy();
      }
    }
  });

  // For single background images, create a subtle parallax effect by adjusting position
  if (scene.background) {
    // Create a subtle vertical movement effect for the background
    const time = scene.time.now * 0.001; // Convert to seconds
    const parallaxOffset = Math.sin(time * 0.3) * 1; // Very subtle sine wave movement
    scene.background.tilePositionY = parallaxOffset;
  }
  
  // Apply health effects based on specifications
  if (scene.gameData.health < 25) {
    // Reduce speed to 0.5x when health is low
    scene.gameSpeed = Math.max(scene.gameSpeed * 0.5, 100);
    // Add vignette effect for low health
    scene.cameras.main.setAlpha(0.7);
  } else {
    scene.cameras.main.setAlpha(1);
  }
}
