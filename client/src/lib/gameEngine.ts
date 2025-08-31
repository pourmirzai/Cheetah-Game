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
import { getThreatLevelMultiplier } from "@/lib/cookieStorage";

const MOTHER_CHEETAH_SCALE = 0.6;
const CUB_SCALE = 0.5;
const OBSTACLE_SCALE = 0.25; // 0.56 * 0.7 = 0.392 (additional 30% smaller)
const RESOURCE_SCALE = 0.25; // 0.42 * 0.7 = 0.294 (additional 30% smaller)
const CAR_SCALE = 0.25; // 0.343 * 0.8 = 0.274 (additional 20% smaller)

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
  background?: Phaser.GameObjects.Sprite;

  // Game state
  lanes: number[];
  currentLane: number;
  lastLaneChange?: number;
  farBackground?: Phaser.GameObjects.Sprite;
  isStopped?: boolean;
  gameSpeed: number;
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
  sessionId: string,
  onLoadingProgress?: (progress: number, message: string) => void,
  onLoadingComplete?: () => void
) {
  // Safety check for scene
  if (!scene) {
    console.error('Scene is undefined in initializeGame');
    return;
  }

  const gameScene = scene as GameScene;
  gameScene.gameData = gameData;
  // Wrap onUpdateGameData to keep scene's gameData in sync
  gameScene.onUpdateGameData = (updates: Partial<GameData>) => {
    gameScene.gameData = { ...gameScene.gameData, ...updates };
    onUpdateGameData(updates);
  };
  gameScene.onGameEnd = onGameEnd;
  gameScene.sessionId = sessionId;
  gameScene.cubs = [];
  // Calculate lane positions based on full screen width
  const screenWidth = scene.scale.width;
  const laneSpacing = screenWidth / 4; // Divide screen into 4 equal lanes
  gameScene.lanes = [
    laneSpacing * 0.5,     // Lane 1: 12.5% from left
    laneSpacing * 1.5,     // Lane 2: 37.5% from left
    laneSpacing * 2.5,     // Lane 3: 62.5% from left
    laneSpacing * 3.5      // Lane 4: 87.5% from left
  ];
  gameScene.currentLane = 1;
  gameScene.gameSpeed = 200;
  gameScene.lastTap = 0;
  gameScene.startX = 0;
  gameScene.gameStarted = false; // Game starts paused until tutorial is completed

  // Store progress callback for event handlers
  const progressCallback = onLoadingProgress;

  // Load game assets first with progress tracking
  loadAssets(scene, progressCallback);

  // Wait for all assets to load before creating the game world
  scene.load.on('complete', () => {
    try {
      console.log('🎮 All assets loaded, creating game world...');
      onLoadingComplete?.();
      createGameWorld(gameScene);
      setupInput(gameScene);
      // Don't start timers yet - wait for tutorial completion
    } catch (error) {
      console.error('Error in asset load complete callback:', error);
    }
  });

  // Add error handling for asset loading failures
  scene.load.on('filecomplete', (key: string) => {
    console.log(`✅ Asset loaded: ${key}`);
  });

  scene.load.on('filecomplete-failed', (key: string) => {
    console.error(`❌ Failed to load asset: ${key}`);
    // Try to retry loading the asset
    retryAssetLoad(scene, key, progressCallback);
  });

  // Add progress tracking
  scene.load.on('progress', (progress: number) => {
    const progressPercent = Math.round(progress * 100);
    progressCallback?.(progressPercent, `بارگذاری دارایی‌ها... ${progressPercent}%`);
  });
}

function retryAssetLoad(scene: Phaser.Scene, key: string, progressCallback?: (progress: number, message: string) => void, retryCount: number = 0) {
  const maxRetries = 3;
  const retryDelay = 1000 * (retryCount + 1); // Exponential backoff

  if (retryCount >= maxRetries) {
    console.error(`❌ Max retries reached for asset: ${key}, creating fallback texture`);
    // Create fallback texture
    if (!scene.textures.exists(key)) {
      scene.add.graphics()
        .fillStyle(0xff6b6b) // Red fallback color
        .fillRect(0, 0, 32, 32)
        .generateTexture(key, 32, 32);
    }
    return;
  }

  console.log(`🔄 Retrying asset load (${retryCount + 1}/${maxRetries}): ${key}`);

  // Find the asset path from our configuration
  let assetPath = '';
  let assetType = '';

  // Check characters
  const characterAsset = GAME_ASSETS.loadConfig.characters.find(c => c.texture === key);
  if (characterAsset) {
    assetPath = characterAsset.path;
    assetType = 'image';
  }

  // Check obstacles
  const obstacleAsset = GAME_ASSETS.loadConfig.obstacles.find(o => o.texture === key);
  if (obstacleAsset) {
    assetPath = obstacleAsset.path;
    assetType = 'image';
  }

  // Check resources
  const resourceAsset = GAME_ASSETS.loadConfig.resources.find(r => r.texture === key);
  if (resourceAsset) {
    assetPath = resourceAsset.path;
    assetType = 'image';
  }

  // Check backgrounds
  const backgroundAsset = GAME_ASSETS.loadConfig.backgrounds.find(b => b.texture === key);
  if (backgroundAsset) {
    assetPath = backgroundAsset.path;
    assetType = 'image';
  }

  if (assetPath && assetType === 'image') {
    // Retry loading after delay
    scene.time.delayedCall(retryDelay, () => {
      scene.load.image(key, assetPath);
      scene.load.once(`filecomplete-${key}`, () => {
        console.log(`✅ Asset retry successful: ${key}`);
      });
      scene.load.once(`filecomplete-failed-${key}`, () => {
        retryAssetLoad(scene, key, progressCallback, retryCount + 1);
      });
      scene.load.start();
    });
  } else {
    // If we can't find the asset path, create fallback immediately
    if (!scene.textures.exists(key)) {
      scene.add.graphics()
        .fillStyle(0xff6b6b)
        .fillRect(0, 0, 32, 32)
        .generateTexture(key, 32, 32);
    }
  }
}

export function startActualGame(scene: Phaser.Scene) {
  const gameScene = scene as GameScene;
  console.log('🚀 startActualGame called with scene:', scene);
  console.log('🚀 Current gameStarted status:', gameScene.gameStarted);

  if (!gameScene.gameStarted) {
    console.log('🚀 Setting gameStarted to true and starting timers...');
    gameScene.gameStarted = true;
    startGameTimers(gameScene);

    // Start ambient sounds
    if (gameScene.audioManager) {
      gameScene.audioManager.startAmbientSounds();
    }

    console.log('🚀 Game timers and ambient sounds started successfully!');
  } else {
    console.log('🚀 Game was already started, skipping...');
  }
}

function loadAssets(scene: Phaser.Scene, onProgress?: (progress: number, message: string) => void) {
  console.log('🎮 Loading game assets from centralized configuration...');

  // Safety check for scene
  if (!scene || !scene.load) {
    console.error('Scene or scene.load is undefined in loadAssets');
    return;
  }

  // Initialize progress tracking
  let loadedCount = 0;
  let totalAssets = 0;

  // Count total assets to load
  totalAssets += GAME_ASSETS.loadConfig.characters.length;
  totalAssets += GAME_ASSETS.loadConfig.obstacles.length;
  totalAssets += GAME_ASSETS.loadConfig.resources.length;
  totalAssets += GAME_ASSETS.loadConfig.backgrounds.length;
  totalAssets += 4; // Audio files

  // Progress callback function
  const updateProgress = (message: string) => {
    loadedCount++;
    const progress = Math.min((loadedCount / totalAssets) * 100, 100);
    onProgress?.(progress, message);
  };

  // Load audio files first
  console.log('🎵 Loading audio files...');
  onProgress?.(10, 'بارگذاری فایل‌های صوتی...');
  scene.load.audio('bg-music', 'assets/audio/bg-music.mp3');
  scene.load.audio('car-horn', 'assets/audio/car-horn.mp3');
  scene.load.audio('dog-bark', 'assets/audio/dog-bark.mp3');
  scene.load.audio('angry-grunt', 'assets/audio/angry-grunt.mp3');

  // Load character sprites
  onProgress?.(25, 'بارگذاری شخصیت‌ها...');
  GAME_ASSETS.loadConfig.characters.forEach(({ texture, path }) => {
    console.log(`🔄 Loading character: ${path} → ${texture}`);
    scene.load.image(texture, path);
  });

  // Load obstacle sprites
  onProgress?.(50, 'بارگذاری موانع...');
  GAME_ASSETS.loadConfig.obstacles.forEach(({ texture, path }) => {
    console.log(`🔄 Loading obstacle: ${path} → ${texture}`);
    scene.load.image(texture, path);
  });

  // Load resource sprites
  onProgress?.(75, 'بارگذاری منابع...');
  GAME_ASSETS.loadConfig.resources.forEach(({ texture, path }) => {
    console.log(`🔄 Loading resource: ${path} → ${texture}`);
    scene.load.image(texture, path);
  });

  // Load background images
  onProgress?.(90, 'بارگذاری پس‌زمینه‌ها...');
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
  // Safety check for scene
  if (!scene || !scene.add) {
    console.error('Scene is not properly initialized in createGameWorld');
    return;
  }

  // Initialize audio manager (if not already created in preload)
  if (!scene.audioManager) {
    scene.audioManager = new AudioManager(scene);
  }
  scene.audioManager.initializeAudioContext();
  scene.audioManager.playMusic('ambient');

  // Set default season if not set
  if (!scene.gameData.season) {
    scene.gameData.season = 'spring';
  }

  // Removed jump/burst energy initialization

  // Get seasonal background based on current season
  const seasonToTexture = {
    'spring': 'spring-bg',
    'summer': 'summer-bg',
    'autumn': 'autumn-bg',
    'winter': 'winter-bg'
  };
  const bgTexture = seasonToTexture[scene.gameData.season as keyof typeof seasonToTexture] || 'spring-bg';
  console.log(`🎨 Initializing seasonal background: ${bgTexture} for season ${scene.gameData.season}`);

  // Create responsive background that covers the entire screen
  const screenWidth = scene.scale.width;
  const screenHeight = scene.scale.height;

  // Check if texture is loaded before creating sprite
  if (scene.textures.exists(bgTexture)) {
    // Use regular sprite instead of tileSprite for better scaling control
    scene.background = scene.add.sprite(0, 0, bgTexture);
    scene.background.setOrigin(0, 0);
    scene.background.setDepth(0); // Background at base layer

    // Scale background to cover the entire screen without any gaps or margins
    const bgImage = scene.textures.get(bgTexture);
    if (bgImage) {
      const bgFrame = bgImage.getSourceImage();
      if (bgFrame && bgFrame.width && bgFrame.height) {
        const bgAspectRatio = bgFrame.width / bgFrame.height;
        const screenAspectRatio = screenWidth / screenHeight;

        let scaleX, scaleY;
        if (screenAspectRatio > bgAspectRatio) {
          // Screen is wider than background - scale to cover full width
          scaleX = screenWidth / bgFrame.width;
          scaleY = scaleX;
        } else {
          // Screen is taller than background - scale to cover full height
          scaleY = screenHeight / bgFrame.height;
          scaleX = scaleY;
        }

        scene.background.setScale(scaleX, scaleY);
        scene.background.setPosition(0, 0);
        scene.background.setOrigin(0, 0);
      } else {
        // Fallback: create a simple colored background if image fails to load
        console.warn(`Background image for ${bgTexture} failed to load, using fallback`);
        scene.background.setScale(screenWidth / scene.background.width, screenHeight / scene.background.height);
        scene.background.setPosition(0, 0);
        scene.background.setOrigin(0, 0);
      }
    }
  } else {
    console.warn(`Background texture ${bgTexture} not loaded, skipping background creation`);
  }

  // Remove farBackground to eliminate green overlay
  scene.farBackground = undefined;

  // Create mother cheetah with enhanced visibility - adjusted for bottom UI spacing
  scene.motherCheetah = scene.add.sprite(scene.lanes[scene.currentLane], scene.scale.height - 200, 'mother-cheetah');
  scene.motherCheetah.setDepth(6); // Highest layer - above everything

  const motherScale = MOTHER_CHEETAH_SCALE; // Smooth scaling factor
  scene.motherCheetah.setScale(motherScale);

  // Keep the mother cheetah image simple without extra effects

  // Create cubs following behind with enhanced visibility - positioned much lower than mother
  for (let i = 0; i < scene.gameData.cubs; i++) {
    const cub = scene.add.sprite(
      scene.lanes[scene.currentLane] + (i % 2 === 0 ? -12.25 : 12.25), // 17.5 * 0.7 = 12.25 (additional 30% smaller)
      scene.scale.height - 130 - (i * 17.15), // Positioned much lower than mother (130 vs 200) - closer to bottom
      'cub'
    );
    cub.setDepth(5); // Highest layer - above everything

    // Scale cubs for smooth rendering
    const cubScale = CUB_SCALE; // Smooth scaling factor
    cub.setScale(cubScale);

    // Add multiple visual effects for maximum visibility
    cub.setTint(0xffffff);

    // Strong orange glow
    cub.preFX?.addGlow(0xffa500, 0.7, 0, false);


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
    scene.lastTap = Date.now();
  });

  scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    if (pointer.isDown) {
      const deltaX = pointer.x - scene.startX;

      // Lane switching based on swipe (less sensitive for precision)
      if (Math.abs(deltaX) > 50) { // Increased from 30 to 50 for better precision and less accidental lane changes
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
      x: targetX + (index % 2 === 0 ? -12.25 : 12.25), // Match initial cub positioning
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

  // Spawn obstacles and resources (progressive difficulty)
  const spawnGameObjectsProgressive = () => {
    const currentMonth = scene.gameData.currentMonth;
    const progressRatio = Math.min(currentMonth / 18, 1);

    // Survival mode: Fast spawning for intense gameplay
    const baseDelay = 1200;
    const minDelay = 450;
    const currentDelay = baseDelay - (baseDelay - minDelay) * progressRatio;

    spawnGameObject(scene);

    // Schedule next spawn with progressive delay
    scene.time.delayedCall(currentDelay, spawnGameObjectsProgressive);
  };

  // Start the progressive spawning
  spawnGameObjectsProgressive();

  // Update health
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

  if (scene.background && scene.textures.exists(newBgTexture)) {
    console.log(`🔄 Changing background to: ${newBgTexture} for season ${season}`);

    // Update background texture
    scene.background.setTexture(newBgTexture);

    // Re-scale background to maintain cover mode
    const screenWidth = scene.scale.width;
    const screenHeight = scene.scale.height;
    const bgImage = scene.textures.get(newBgTexture);

    if (bgImage) {
      const bgFrame = bgImage.getSourceImage();
      if (bgFrame && bgFrame.width && bgFrame.height) {
        const bgAspectRatio = bgFrame.width / bgFrame.height;
        const screenAspectRatio = screenWidth / screenHeight;

        let scaleX, scaleY;
        if (screenAspectRatio > bgAspectRatio) {
          // Screen is wider than background - scale to cover full width
          scaleX = screenWidth / bgFrame.width;
          scaleY = scaleX;
        } else {
          // Screen is taller than background - scale to cover full height
          scaleY = screenHeight / bgFrame.height;
          scaleX = scaleY;
        }

        scene.background.setScale(scaleX, scaleY);
        scene.background.setPosition(0, 0);
        scene.background.setOrigin(0, 0);
      } else {
        // Fallback scaling if image data is not available
        console.warn(`Background image data for ${newBgTexture} not available, using fallback scaling`);
        scene.background.setScale(screenWidth / scene.background.width, screenHeight / scene.background.height);
        scene.background.setPosition(0, 0);
        scene.background.setOrigin(0, 0);
      }
    }
  } else {
    console.warn(`Cannot update background: background sprite not found or texture ${newBgTexture} not loaded`);
  }
}

function spawnGameObject(scene: GameScene) {
  const currentMonth = scene.gameData.currentMonth;
  const progressRatio = Math.min(currentMonth / 18, 1); // 0 to 1 based on progress

  // Get threat level multiplier based on consecutive losses
  const threatMultiplier = getThreatLevelMultiplier();

  // Survival mode: High difficulty with multiple threats (adjusted by threat multiplier)
  const baseMaxThreats = progressRatio > 0.15 ? (progressRatio > 0.4 ? (progressRatio > 0.7 ? 4 : 3) : 2) : 1;
  const baseMinThreats = progressRatio > 0.3 ? 2 : (progressRatio > 0.1 ? 1 : 1);

  // Apply threat level reduction
  const maxThreats = Math.max(1, Math.floor(baseMaxThreats * threatMultiplier));
  const minThreats = Math.max(1, Math.floor(baseMinThreats * threatMultiplier));
  const numThreats = Phaser.Math.Between(minThreats, maxThreats);

  // Removed screen color flashes - using subtle visual cues instead
  // Multiple threats will be visually apparent from the increased number of objects

  for (let i = 0; i < numThreats; i++) {
    // Survival mode: Intense threat waves
    const delay = i * 180;
    scene.time.delayedCall(delay, () => {
      const lane = Phaser.Math.Between(0, scene.lanes.length - 1);
      const x = scene.lanes[lane];
      const y = -50;

      // Survival mode: Harsh summer conditions (adjusted by threat multiplier)
      const isSummer = scene.gameData.season === 'summer';
      const baseObstacleChance = isSummer ? 0.6 : 0.56; // More obstacles in summer (20% reduction)
      const obstacleChance = Math.max(0.3, baseObstacleChance * threatMultiplier); // Apply threat reduction, minimum 30%

      if (Math.random() < obstacleChance) {
        spawnObstacle(scene, x, y);
      } else {
        // In summer, resources are scarce (only 40% chance to actually spawn)
        if (!isSummer || Math.random() < 0.4) {
          spawnResource(scene, x, y);
        }
      }
    });
  }
}

function spawnObstacle(scene: GameScene, x: number, y: number) {
  // 40% chance for horizontal road (doubled frequency)
  if (Math.random() < 0.4) {
      return spawnRoad(scene, y);
  }

  const obstacleInfo = GAME_ASSETS.obstacles.types[Phaser.Math.Between(0, GAME_ASSETS.obstacles.types.length - 1)];

  // Dangerous obstacles (camel, smuggler, dog) spawn at least 80 pixels away from road
  let obstacle: Phaser.GameObjects.Sprite;
  const texture = obstacleInfo.texture;

  if (obstacleInfo.type === 'camel') {
    // Keep camel 80 pixels away from road
    y = y - 80;
    obstacle = scene.add.sprite(x, y, texture);

    // Disable physics for camel sprite - only warning zone should have collision
    obstacle.setData('noPhysics', true);

    // Create circular warning zone around camel (yellow instead of red)
    const warningZoneRadius = 19.6; // 28 * 0.7 = 19.6 (additional 30% smaller)
    const warningZone = scene.add.circle(x, y, warningZoneRadius, 0xffff00, 0); // Invisible yellow circle
    if (warningZone && scene.physics && scene.physics.world) {
      scene.physics.world.enable(warningZone);
      const warningZoneBody = warningZone.body as Phaser.Physics.Arcade.Body;
      if (warningZoneBody) {
        warningZoneBody.setCircle(warningZoneRadius);
        warningZoneBody.setVelocityY(scene.gameSpeed); // Move with the obstacle
      }
    }

    // Add visual indicator for warning zone (smaller pulsing yellow glow under obstacle)
    const warningZoneGlow = scene.add.circle(x, y, warningZoneRadius, 0xffff00, 0.7);
    if (warningZoneGlow) {
      warningZoneGlow.setDepth(1); // Under obstacles for better visibility

      // Add intense pulsing animation to make warning zone very visible
      if (scene.tweens) {
        scene.tweens.add({
          targets: warningZoneGlow,
          alpha: 1.0,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
      }
    }

    // Add warning border around warning zone (under obstacle)
    const warningZoneBorder = scene.add.circle(x, y, warningZoneRadius, 0xffff00, 0);
    if (warningZoneBorder) {
      warningZoneBorder.setStrokeStyle(4, 0xffff00, 1.0);
      warningZoneBorder.setDepth(2); // Under obstacle

      // Add intense pulsing animation to the border
      if (scene.tweens) {
        scene.tweens.add({
          targets: warningZoneBorder,
          strokeAlpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
      }
    }

    // Add a second inner border for extra visibility (under obstacle)
    const innerBorder = scene.add.circle(x, y, warningZoneRadius - 4.9, 0xffaa00, 0); // 7 * 0.7 = 4.9, darker yellow
    if (innerBorder) {
      innerBorder.setStrokeStyle(2, 0xffaa00, 0.8);
      innerBorder.setDepth(2);

      // Pulse the inner border with different timing
      if (scene.tweens) {
        scene.tweens.add({
          targets: innerBorder,
          strokeAlpha: 0.3,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
      }
    }

    // Store inner border reference for cleanup
    obstacle.setData('innerBorder', innerBorder);

    // Store border reference for cleanup
    obstacle.setData('warningZoneBorder', warningZoneBorder);

    // Store references for cleanup
    obstacle.setData('warningZone', warningZone);
    obstacle.setData('warningZoneGlow', warningZoneGlow);

    // Initialize damage cooldown timestamp
    obstacle.setData('lastDamageTime', 0);

    // Collision detection for warning zone (with enhanced safety checks)
    if (scene.physics && scene.motherCheetah && warningZone && warningZone.active && scene.motherCheetah.active) {
      scene.physics.add.overlap(scene.motherCheetah, warningZone, () => {
        // Double-check objects are still active before processing collision
        if (scene.motherCheetah?.active && warningZone?.active) {
          // Check if 3 seconds have passed since last damage from this camel
          const currentTime = Date.now();
          const lastDamageTime = obstacle.getData('lastDamageTime') || 0;
          const timeSinceLastDamage = currentTime - lastDamageTime;

          if (timeSinceLastDamage >= 3000) { // 3 seconds cooldown
            if (scene.audioManager) scene.audioManager.onHitObstacle(obstacleInfo.type);

            // Reduce health by 30% instead of ending game
            const healthReduction = Math.floor(scene.gameData.health * 0.3);
            scene.gameData.health = Math.max(0, scene.gameData.health - healthReduction);
            scene.onUpdateGameData({ health: scene.gameData.health });

            // Update last damage timestamp
            obstacle.setData('lastDamageTime', currentTime);

            // Check for starvation after health reduction
            if (scene.gameData.health <= 0) {
              endGame(scene, 'starvation');
            }

            trackEvent('collision', {
              sessionId: scene.sessionId,
              type: 'health_reduced',
              obstacleType: obstacleInfo.type,
              healthReduction: healthReduction,
              month: scene.gameData.currentMonth
            });
          }
        }
      });
    }

    if (scene.cubs && scene.physics && warningZone && warningZone.active) {
      scene.cubs.forEach((cub, index) => {
        if (cub && cub.active) {
          scene.physics.add.overlap(cub, warningZone, () => {
            // Double-check objects are still active before processing collision
            if (cub?.active && warningZone?.active && scene.cubs[index] === cub) {
              // Check if 3 seconds have passed since last damage from this camel
              const currentTime = Date.now();
              const lastDamageTime = obstacle.getData('lastDamageTime') || 0;
              const timeSinceLastDamage = currentTime - lastDamageTime;

              if (timeSinceLastDamage >= 3000) { // 3 seconds cooldown
                // Reduce cub's health by 30% instead of removing cub
                // Since cubs don't have individual health, we'll reduce overall health
                const healthReduction = Math.floor(scene.gameData.health * 0.3);
                scene.gameData.health = Math.max(0, scene.gameData.health - healthReduction);
                scene.onUpdateGameData({ health: scene.gameData.health });

                // Update last damage timestamp
                obstacle.setData('lastDamageTime', currentTime);

                // Check for starvation after health reduction
                if (scene.gameData.health <= 0) {
                  endGame(scene, 'starvation');
                }

                trackEvent('collision', {
                  sessionId: scene.sessionId,
                  type: 'cub_health_reduced',
                  obstacleType: obstacleInfo.type,
                  healthReduction: healthReduction,
                  month: scene.gameData.currentMonth
                });
              }
            }
          });
        }
      });
    }

  } else if (obstacleInfo.type === 'smuggler' || obstacleInfo.type === 'dog') {
    // Keep dangerous obstacles 80 pixels away from road
    y = y - 80;
    obstacle = scene.add.sprite(x, y, texture);

    // Create circular death zone around dangerous obstacles (scaled with obstacle size)
    const deathZoneRadius = 19.6; // 28 * 0.7 = 19.6 (additional 30% smaller)
    const deathZone = scene.add.circle(x, y, deathZoneRadius, 0xff0000, 0); // Invisible red circle
    if (deathZone && scene.physics && scene.physics.world) {
      scene.physics.world.enable(deathZone);
      const deathZoneBody = deathZone.body as Phaser.Physics.Arcade.Body;
      if (deathZoneBody) {
        deathZoneBody.setCircle(deathZoneRadius);
        deathZoneBody.setVelocityY(scene.gameSpeed); // Move with the obstacle
      }
    }

    // Add visual indicator for death zone (smaller pulsing red glow under obstacle)
    const deathZoneGlow = scene.add.circle(x, y, deathZoneRadius, 0xff0000, 0.7);
    if (deathZoneGlow) {
      deathZoneGlow.setDepth(1); // Under obstacles for better visibility

      // Add intense pulsing animation to make death zone very visible
      if (scene.tweens) {
        scene.tweens.add({
          targets: deathZoneGlow,
          alpha: 1.0,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
      }
    }

    // Add warning border around death zone (under obstacle)
    const deathZoneBorder = scene.add.circle(x, y, deathZoneRadius, 0xff0000, 0);
    if (deathZoneBorder) {
      deathZoneBorder.setStrokeStyle(4, 0xff0000, 1.0);
      deathZoneBorder.setDepth(2); // Under obstacle

      // Add intense pulsing animation to the border
      if (scene.tweens) {
        scene.tweens.add({
          targets: deathZoneBorder,
            strokeAlpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
      }
    }

    // Add a second inner border for extra visibility (under obstacle)
    const innerBorder = scene.add.circle(x, y, deathZoneRadius - 4.9, 0xff6600, 0); // 7 * 0.7 = 4.9
    if (innerBorder) {
      innerBorder.setStrokeStyle(2, 0xff6600, 0.8);
      innerBorder.setDepth(2);

      // Pulse the inner border with different timing
      if (scene.tweens) {
        scene.tweens.add({
          targets: innerBorder,
          strokeAlpha: 0.3,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
      }
    }

    // Store inner border reference for cleanup
    obstacle.setData('innerBorder', innerBorder);

    // Store border reference for cleanup
    obstacle.setData('deathZoneBorder', deathZoneBorder);


    // Store references for cleanup
    obstacle.setData('deathZone', deathZone);
    obstacle.setData('deathZoneGlow', deathZoneGlow);

    // Collision detection for death zone (with enhanced safety checks)
    if (scene.physics && scene.motherCheetah && deathZone && deathZone.active && scene.motherCheetah.active) {
      scene.physics.add.overlap(scene.motherCheetah, deathZone, () => {
        // Double-check objects are still active before processing collision
        if (scene.motherCheetah?.active && deathZone?.active) {
          if (scene.audioManager) scene.audioManager.onHitObstacle(obstacleInfo.type);
          endGame(scene, obstacleInfo.type);
        }
      });
    }

    if (scene.cubs && scene.physics && deathZone && deathZone.active) {
      scene.cubs.forEach((cub, index) => {
        if (cub && cub.active) {
          scene.physics.add.overlap(cub, deathZone, () => {
            // Double-check objects are still active before processing collision
            if (cub?.active && deathZone?.active && scene.cubs[index] === cub) {
              scene.gameData.cubs--;
              if (cub.active) cub.destroy();
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
            }
          });
        }
      });
    }

  } else {
    // Safe obstacles can spawn in any lane
    obstacle = scene.add.sprite(x, y, texture);
  }

  // Set depth for obstacle to be above halos
  obstacle.setDepth(3);

  // Scale obstacles for smooth rendering (30% smaller)
  const obstacleScale = OBSTACLE_SCALE; // 0.8 * 0.7 = 0.56 (30% smaller)
  obstacle.setScale(obstacleScale);

  // Ensure obstacles group exists before adding (mobile compatibility)
  if (!scene.obstacles) {
    scene.obstacles = scene.add.group();
  }
  scene.obstacles.add(obstacle);

  // Only enable physics for non-camel obstacles
  if (!obstacle.getData('noPhysics')) {
    scene.physics.world.enable(obstacle);
  }
  
  // Special handling for different obstacle types using centralized config
  const specialBehavior = GAME_ASSETS.obstacles.specialBehaviors[obstacleInfo.type as keyof typeof GAME_ASSETS.obstacles.specialBehaviors];

  if (specialBehavior) {
    // Removed smuggler spotlight/cone effect completely

    if (specialBehavior.speedMultiplier && specialBehavior.speedMultiplier !== 1.0 && obstacle.body) {
      const body = obstacle.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(scene.gameSpeed * specialBehavior.speedMultiplier);
    }
  }

  // Set initial velocity for obstacle (will be updated in updateGame)
  // Only set velocity if obstacle has physics (camels don't have physics bodies)
  if (obstacle.body && !obstacle.getData('noPhysics')) {
    const body = obstacle.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(scene.gameSpeed);
  }
  
  // Remove obstacle when it goes off screen
  obstacle.setData('isMoving', true);

  // Collision detection (with enhanced safety checks) - exclude camels from lethal behavior
  if (scene.physics && scene.motherCheetah && obstacle && scene.motherCheetah.active && obstacle.active) {
    scene.physics.add.overlap(scene.motherCheetah, obstacle, () => {
      // Double-check objects are still active before processing collision
      if (scene.motherCheetah?.active && obstacle?.active) {
        scene.audioManager?.onHitObstacle(obstacleInfo.type);
        // Only end game for non-camel obstacles
        if (obstacleInfo.type !== 'camel') {
          endGame(scene, obstacleInfo.type);
        }
      }
    });
  }

  if (scene.cubs && scene.physics && obstacle && obstacle.active) {
    scene.cubs.forEach((cub, index) => {
      if (cub && cub.active) {
        scene.physics.add.overlap(cub, obstacle, () => {
          // Double-check objects are still active before processing collision
          if (cub?.active && obstacle?.active && scene.cubs[index] === cub) {
            // Only remove cub for non-camel obstacles
            if (obstacleInfo.type !== 'camel') {
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
            }
          }
        });
      }
    });
  }
}

function spawnRoad(scene: GameScene, y: number) {
  // Create horizontal road spanning all lanes (mobile optimized: thinner road)
  const road = scene.add.rectangle(scene.scale.width / 2, y, scene.scale.width, 17.5, 0x333333); // 25 * 0.7 = 17.5 (30% smaller)
  road.setDepth(1); // Above background, below cheetahs and cars

  // Add road markings without physics (visual only)
  for (let i = 0; i < scene.scale.width; i += 80) {
    const marking = scene.add.rectangle(i, y, 40, 2, 0xffffff);
    marking.setDepth(1); // Above background, below cheetahs and cars
    marking.setData('isMoving', true);
  }

  // Road is visual only - no physics to prevent unwanted collisions
  road.setData('isMoving', true);
  
  // Remove road when it goes off screen
  road.setData('isMoving', true);

  // Always spawn cars on the road (100% chance)
  spawnCarsOnRoad(scene, y);

  // Note: Road itself does not cause game over - only cars do
}

function spawnCarsOnRoad(scene: GameScene, roadY: number) {
  // Detect mobile device and adjust car count
  const isMobile = window.innerWidth <= 768;
  const baseMinCars = 2;
  const baseMaxCars = 6;

  // Reduce car count by 20% on mobile
  const minCars = isMobile ? Math.max(1, Math.floor(baseMinCars * 0.8)) : baseMinCars;
  const maxCars = isMobile ? Math.max(1, Math.floor(baseMaxCars * 0.8)) : baseMaxCars;

  const numCars = Phaser.Math.Between(minCars, maxCars);

  for (let i = 0; i < numCars; i++) {
    // Ensure cars spawn within visible road area
    const carX = Phaser.Math.Between(60, scene.scale.width - 60);

    // Create simple car sprite using graphics
    const carGraphics = scene.add.graphics();
    carGraphics.fillStyle(0xff0000); // Red car
    carGraphics.fillRect(0, 0, 28, 14); // 40 * 0.7 = 28, 20 * 0.7 = 14 (30% smaller)
    carGraphics.fillStyle(0x000000); // Black windows
    carGraphics.fillRect(3.5, 3.5, 7, 7); // 5 * 0.7 = 3.5, 10 * 0.7 = 7 (30% smaller)
    carGraphics.fillRect(17.5, 3.5, 7, 7); // 25 * 0.7 = 17.5, 10 * 0.7 = 7 (30% smaller)
    carGraphics.generateTexture('car', 28, 14); // 40 * 0.7 = 28, 20 * 0.7 = 14 (30% smaller)

    // Position car properly on the road
    const car = scene.add.sprite(carX, roadY - 5, 'car');
    car.setDepth(2); // Above roads, below cheetahs

    // Scale cars for smooth rendering (50% smaller)
    const carScale = CAR_SCALE; // 0.343 * 0.8 = 0.274 (50% smaller)
    car.setScale(carScale);

    // Ensure obstacles group exists before adding (mobile compatibility)
    if (scene.obstacles) {
      scene.obstacles.add(car);
    }
    scene.physics.world.enable(car);

    // Set initial velocity for car (right to left movement)
    if (car.body) {
      const body = car.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(scene.gameSpeed);
      body.setVelocityX(-30); // Consistent right-to-left movement
    }

    // Remove car when it goes off screen
    car.setData('isMoving', true);

    // Car collision detection (with enhanced safety checks)
    if (scene.physics && scene.motherCheetah && car && scene.motherCheetah.active && car.active) {
      scene.physics.add.overlap(scene.motherCheetah, car, () => {
        // Double-check objects are still active before processing collision
        if (scene.motherCheetah?.active && car?.active) {
          scene.audioManager?.onHitObstacle('road');
          endGame(scene, 'road');
        }
      });
    }

    if (scene.cubs && scene.physics && car && car.active) {
      scene.cubs.forEach((cub, index) => {
        if (cub && cub.active) {
          scene.physics.add.overlap(cub, car, () => {
            // Double-check objects are still active before processing collision
            if (cub?.active && car?.active && scene.cubs[index] === cub) {
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
            }
          });
        }
      });
    }
  }
}

function spawnResource(scene: GameScene, x: number, y: number) {
  const resourceInfo = GAME_ASSETS.resources.types[Phaser.Math.Between(0, GAME_ASSETS.resources.types.length - 1)];

  const resource = scene.add.sprite(x, y, resourceInfo.texture);

  // Scale resources for smooth rendering (30% smaller)
  let resourceScale = RESOURCE_SCALE; // 0.6 * 0.7 = 0.42 (30% smaller)

  // Make gazelle larger (but still 30% smaller than original)
  if (resourceInfo.type === 'gazelle') {
    resourceScale = 0.49; // 0.7 * 0.7 = 0.49 (additional 30% smaller)
  }

  resource.setScale(resourceScale);

  // Ensure resources group exists
  if (!scene.resources) {
    scene.resources = scene.add.group();
  }

  scene.resources.add(resource);
  scene.physics.world.enable(resource);
  
  // Set initial velocity for resource (will be updated in updateGame)
  if (resource.body) {
    const body = resource.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(scene.gameSpeed);
  }
  
  // Remove resource when it goes off screen
  resource.setData('isMoving', true);

  // Collection detection (with safety checks)
  if (scene.motherCheetah && resource && scene.motherCheetah.active && resource.active) {
    scene.physics.add.overlap(scene.motherCheetah, resource, () => {
      // Double-check objects are still active before processing collision
      if (scene.motherCheetah?.active && resource?.active) {
        collectResource(scene, resourceInfo.type);
        trackEvent('pickup', {
          sessionId: scene.sessionId,
          resourceType: resourceInfo.type,
          month: scene.gameData.currentMonth
        });
        resource.destroy();
      }
    });
  }
}

function collectResource(scene: GameScene, type: string) {
  // Find the resource configuration
  const resourceConfig = GAME_ASSETS.resources.types.find(r => r.type === type);
  const healthGain = resourceConfig?.healthGain || 0;

  // Play collection sound
  scene.audioManager?.onCollectResource(type);

  // Removed rabbit energy burst functionality

  scene.gameData.health = Math.min(100, scene.gameData.health + healthGain);
  scene.gameData.score += healthGain * 10;

  scene.onUpdateGameData({
    health: scene.gameData.health,
    score: scene.gameData.score
  });

  console.log(`📊 Resource collected: ${type}, Health: +${healthGain}, Total Health: ${scene.gameData.health}`);
}


function updateHealthAndEnergy(scene: GameScene) {
  // Progressive health decrease based on cub age/maturity
  const currentMonth = scene.gameData.currentMonth;
  const progressRatio = Math.min(currentMonth / 18, 1); // 0 to 1 based on progress

  // Survival mode: Aggressive health decrease for intense challenge
  const baseDecrease = 7;
  const maxDecrease = 15;
  const healthDecrease = baseDecrease + (maxDecrease - baseDecrease) * progressRatio;

  // Decrease health over time (faster as cubs get older)
  scene.gameData.health = Math.max(0, scene.gameData.health - healthDecrease);

  scene.onUpdateGameData({
    health: scene.gameData.health
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
  // Safety check for scene
  if (!scene || !scene.gameData) {
    return;
  }

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
    
    // Space key - removed speed burst functionality
  }

  // Update velocities of all moving objects based on current speed
  if (scene.obstacles && scene.obstacles.children) {
    scene.obstacles.children.entries.forEach((obstacle: any) => {
      // Enhanced safety checks to prevent processing destroyed objects
      if (obstacle && obstacle.active && !obstacle.destroyed && obstacle.getData && obstacle.getData('isMoving')) {
        try {
          // Only update velocity if obstacle has physics body (camels don't have physics)
          if (obstacle.body && !obstacle.getData('noPhysics')) {
            obstacle.body.setVelocityY(scene.gameSpeed);

            // Update horizontal velocity for cars (scale with game speed) - right to left
            if (obstacle.texture && obstacle.texture.key === 'car') {
              const baseHorizontalSpeed = 30;
              const scaledHorizontalSpeed = -(baseHorizontalSpeed * (scene.gameSpeed / 200)); // Negative for right-to-left movement
              obstacle.body.setVelocityX(scaledHorizontalSpeed);
            }
          } else if (obstacle.getData('noPhysics')) {
            // Manually move obstacles without physics (like camels)
            obstacle.y += scene.gameSpeed * (scene.game.loop.delta / 1000);
          }

          // Update positions and velocities of danger/warning halos to match obstacle
          const deathZone = obstacle.getData('deathZone');
          const deathZoneGlow = obstacle.getData('deathZoneGlow');
          const deathZoneBorder = obstacle.getData('deathZoneBorder');
          const warningZone = obstacle.getData('warningZone');
          const warningZoneGlow = obstacle.getData('warningZoneGlow');
          const warningZoneBorder = obstacle.getData('warningZoneBorder');
          const innerBorder = obstacle.getData('innerBorder');

          if (deathZone && deathZone.active && !deathZone.destroyed) {
            deathZone.setPosition(obstacle.x, obstacle.y);
            if (deathZone.body) {
              (deathZone.body as Phaser.Physics.Arcade.Body).setVelocityY(scene.gameSpeed);
            }
          }
          if (deathZoneGlow && deathZoneGlow.active && !deathZoneGlow.destroyed) {
            deathZoneGlow.setPosition(obstacle.x, obstacle.y);
          }
          if (deathZoneBorder && deathZoneBorder.active && !deathZoneBorder.destroyed) {
            deathZoneBorder.setPosition(obstacle.x, obstacle.y);
          }
          if (warningZone && warningZone.active && !warningZone.destroyed) {
            warningZone.setPosition(obstacle.x, obstacle.y);
            if (warningZone.body) {
              (warningZone.body as Phaser.Physics.Arcade.Body).setVelocityY(scene.gameSpeed);
            }
          }
          if (warningZoneGlow && warningZoneGlow.active && !warningZoneGlow.destroyed) {
            warningZoneGlow.setPosition(obstacle.x, obstacle.y);
          }
          if (warningZoneBorder && warningZoneBorder.active && !warningZoneBorder.destroyed) {
            warningZoneBorder.setPosition(obstacle.x, obstacle.y);
          }
          if (innerBorder && innerBorder.active && !innerBorder.destroyed) {
            innerBorder.setPosition(obstacle.x, obstacle.y);
          }

          // Remove if off screen
          if (obstacle.y > scene.scale.height + 100) {
            // Clean up death zones for dangerous obstacles
            if (deathZone && deathZone.active && !deathZone.destroyed) deathZone.destroy();
            if (deathZoneGlow && deathZoneGlow.active && !deathZoneGlow.destroyed) deathZoneGlow.destroy();
            if (deathZoneBorder && deathZoneBorder.active && !deathZoneBorder.destroyed) deathZoneBorder.destroy();
            // Clean up warning zones for camels
            if (warningZone && warningZone.active && !warningZone.destroyed) warningZone.destroy();
            if (warningZoneGlow && warningZoneGlow.active && !warningZoneGlow.destroyed) warningZoneGlow.destroy();
            if (warningZoneBorder && warningZoneBorder.active && !warningZoneBorder.destroyed) warningZoneBorder.destroy();
            if (innerBorder && innerBorder.active && !innerBorder.destroyed) innerBorder.destroy();
            if (obstacle.active && !obstacle.destroyed) obstacle.destroy();
          }
        } catch (error) {
          console.warn('Error updating obstacle:', error);
          // If there's an error, try to destroy the problematic object
          if (obstacle && obstacle.active && !obstacle.destroyed) {
            try {
              obstacle.destroy();
            } catch (destroyError) {
              console.warn('Error destroying obstacle:', destroyError);
            }
          }
        }
      }
    });
  }

  if (scene.resources && scene.resources.children) {
    scene.resources.children.entries.forEach((resource: any) => {
      // Enhanced safety checks to prevent processing destroyed objects
      if (resource && resource.active && !resource.destroyed && resource.getData && resource.getData('isMoving') && resource.body) {
        try {
          resource.body.setVelocityY(scene.gameSpeed);
          // Remove if off screen
          if (resource.y > scene.scale.height + 100) {
            if (resource.active && !resource.destroyed) resource.destroy();
          }
        } catch (error) {
          console.warn('Error updating resource:', error);
          // If there's an error, try to destroy the problematic object
          if (resource && resource.active && !resource.destroyed) {
            try {
              resource.destroy();
            } catch (destroyError) {
              console.warn('Error destroying resource:', destroyError);
            }
          }
        }
      }
    });
  }

  // Update road markings and road surface position (they have no physics)
  if (scene.children && scene.children.list) {
    scene.children.list.forEach((child: any) => {
      // Enhanced safety checks to prevent processing destroyed objects
      if (child && child.active && !child.destroyed && child.getData && child.getData('isMoving')) {
        try {
          if (child.body) {
            // Objects with physics bodies
            if (child.fillColor !== undefined && child.fillColor === 0xffffff) {
              // Road marking with physics (if any)
              child.body.setVelocityY(scene.gameSpeed);
            } else if (child.fillColor !== undefined && child.fillColor === 0x333333) {
              // Road surface with physics (if any)
              child.body.setVelocityY(scene.gameSpeed);
            }
          } else {
            // Visual objects without physics
            if (child.fillColor !== undefined && (child.fillColor === 0xffffff || child.fillColor === 0x333333)) {
              child.y += scene.gameSpeed * (scene.game.loop.delta / 1000);
            }
          }

          // Remove if off screen
          if (child.y > scene.scale.height + 100) {
            if (child.active && !child.destroyed) child.destroy();
          }
        } catch (error) {
          console.warn('Error updating road element:', error);
          // If there's an error, try to destroy the problematic object
          if (child && child.active && !child.destroyed) {
            try {
              child.destroy();
            } catch (destroyError) {
              console.warn('Error destroying road element:', destroyError);
            }
          }
        }
      }
    });
  }

  // Background is static for proper full-screen coverage
  // Removed parallax effect to ensure consistent coverage
  
  // Apply health effects based on specifications
  if (scene.gameData.health < 25) {
    // Reduce speed to 0.5x when health is low
    scene.gameSpeed = Math.max(scene.gameSpeed * 0.5, 100);
    // Add vignette effect for low health
    scene.cameras.main.setAlpha(0.7);
  } else {
    scene.cameras.main.setAlpha(1);
  }

  // Removed speed burst logic
}
