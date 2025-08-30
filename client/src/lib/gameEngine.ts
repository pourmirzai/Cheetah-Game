import Phaser from "phaser";
import { GameData, GameResults, GameObject, Obstacle, Resource } from "@/types/game";
import { trackEvent } from "@/lib/analytics";
import {
  createMotherCheetahSprite,
  createCubSprite,
  createDogObstacleSprite,
  createWaterResourceSprite,
  createGazelleResourceSprite,
  createRabbitResourceSprite,
  createBackgroundTexture
} from "@/lib/spriteGenerator";
import { AudioManager } from "@/lib/audioManager";

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

  // Preload assets
  scene.load.on('complete', () => {
    createGameWorld(gameScene);
    setupInput(gameScene);
    startGameTimers(gameScene);
  });

  // Load game assets
  loadAssets(scene);
}

function loadAssets(scene: Phaser.Scene) {
  // Create pixel art sprites using the sprite generator

  // Create mother cheetah sprite
  const motherGraphics = scene.add.graphics();
  motherGraphics.clear();
  const motherTexture = createMotherCheetahSprite(motherGraphics);
  motherGraphics.generateTexture(motherTexture, 32, 24);

  // Create cub sprite
  const cubGraphics = scene.add.graphics();
  cubGraphics.clear();
  const cubTexture = createCubSprite(cubGraphics);
  cubGraphics.generateTexture(cubTexture, 16, 12);

  // Create obstacle sprites
  const dogGraphics = scene.add.graphics();
  dogGraphics.clear();
  const dogTexture = createDogObstacleSprite(dogGraphics);
  dogGraphics.generateTexture(dogTexture, 24, 20);

  // Create trap sprite (simple geometric shape for now)
  scene.add.graphics()
    .fillStyle(0x696969) // Gray for traps
    .fillRect(0, 0, 20, 20)
    .generateTexture('trap', 20, 20);

  // Create fence sprite (simple vertical lines)
  const fenceGraphics = scene.add.graphics();
  fenceGraphics.fillStyle(0x654321); // Dark brown for fences
  fenceGraphics.fillRect(0, 0, 30, 40);
  // Add vertical lines for fence pattern
  fenceGraphics.fillStyle(0x8B7355);
  for (let i = 5; i < 30; i += 5) {
    fenceGraphics.fillRect(i, 0, 2, 40);
  }
  fenceGraphics.generateTexture('fence', 30, 40);

  // Create poacher sprite (simple silhouette)
  scene.add.graphics()
    .fillStyle(0x000000) // Black for poachers
    .fillRect(0, 0, 24, 32)
    .generateTexture('poacher', 24, 32);

  // Create resource sprites
  const waterGraphics = scene.add.graphics();
  waterGraphics.clear();
  const waterTexture = createWaterResourceSprite(waterGraphics);
  waterGraphics.generateTexture(waterTexture, 20, 20);

  const gazelleGraphics = scene.add.graphics();
  gazelleGraphics.clear();
  const gazelleTexture = createGazelleResourceSprite(gazelleGraphics);
  gazelleGraphics.generateTexture(gazelleTexture, 20, 16);

  const rabbitGraphics = scene.add.graphics();
  rabbitGraphics.clear();
  const rabbitTexture = createRabbitResourceSprite(rabbitGraphics);
  rabbitGraphics.generateTexture(rabbitTexture, 12, 10);

  // Create seasonal background textures
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  seasons.forEach(season => {
    const bgGraphics = scene.add.graphics();
    bgGraphics.clear();
    const bgTexture = createBackgroundTexture(bgGraphics, season);
    bgGraphics.generateTexture(bgTexture, 800, 600);
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

  // Use seasonal background texture
  const bgTexture = `background-${scene.gameData.season}`;

  // Create parallax background layers
  // Far background (hills) - moves slower
  scene.farBackground = scene.add.tileSprite(0, 0, scene.scale.width, scene.scale.height, bgTexture);
  scene.farBackground.setOrigin(0, 0);
  scene.farBackground.setTint(0x8FBC8F); // Dark sea green hills

  // Main background (plains) - normal speed
  scene.background = scene.add.tileSprite(0, 0, scene.scale.width, scene.scale.height, bgTexture);
  scene.background.setOrigin(0, 0);

  // Create mother cheetah
  scene.motherCheetah = scene.add.sprite(scene.lanes[scene.currentLane], scene.scale.height - 150, 'mother-cheetah-pixel');
  scene.motherCheetah.setScale(1.5);

  // Create cubs following behind
  for (let i = 0; i < scene.gameData.cubs; i++) {
    const cub = scene.add.sprite(
      scene.lanes[scene.currentLane] + (i % 2 === 0 ? -20 : 20),
      scene.scale.height - 100 - (i * 30),
      'cub-pixel'
    );
    cub.setScale(1.2);
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
  if (month <= 3 || (month >= 13 && month <= 15)) {
    scene.gameData.season = 'spring';
  } else if (month <= 6 || (month >= 16 && month <= 18)) {
    scene.gameData.season = 'summer';
  } else if (month <= 9) {
    scene.gameData.season = 'autumn';
  } else {
    scene.gameData.season = 'winter';
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
  
  const obstacleTypes = [
    { type: 'dog', texture: 'dog-obstacle-pixel' },
    { type: 'trap', texture: 'trap' },
    { type: 'fence', texture: 'fence' },
    { type: 'poacher', texture: 'poacher' }
  ];
  const obstacleInfo = obstacleTypes[Phaser.Math.Between(0, obstacleTypes.length - 1)];

  const obstacle = scene.add.sprite(x, y, obstacleInfo.texture);
  scene.obstacles.add(obstacle);
  scene.physics.world.enable(obstacle);
  
  // Special handling for poacher with spotlight
  if (obstacleInfo.type === 'poacher') {
    const spotlight = scene.add.graphics();
    spotlight.fillStyle(0xffff00, 0.3);
    spotlight.fillTriangle(x, y + 30, x - 50, y + 120, x + 50, y + 120);
    
    scene.physics.world.enable(spotlight);
    const spotlightBody = spotlight.body as Phaser.Physics.Arcade.Body;
    spotlightBody.setVelocityY(scene.gameSpeed);
    spotlight.setData('isMoving', true);
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
  const resourceTypes = [
    { type: 'water', texture: 'water-resource-pixel' },
    { type: 'gazelle', texture: 'gazelle-resource-pixel' },
    { type: 'rabbit', texture: 'rabbit-resource-pixel' }
  ];
  const resourceInfo = resourceTypes[Phaser.Math.Between(0, resourceTypes.length - 1)];

  const resource = scene.add.sprite(x, y, resourceInfo.texture);
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
  let healthGain = 0;

  switch (type) {
    case 'water':
      healthGain = 15;
      scene.audioManager?.onCollectResource('water');
      break;
    case 'gazelle':
      healthGain = 25;
      scene.audioManager?.onCollectResource('gazelle');
      break;
    case 'rabbit':
      healthGain = 10;
      scene.audioManager?.onCollectResource('rabbit');
      // Track rabbit collection for energy burst
      scene.gameData.rabbitsCollected = (scene.gameData.rabbitsCollected || 0) + 1;

      // Charge burst energy only when 3 rabbits are collected
      if (scene.gameData.rabbitsCollected >= 3) {
        scene.gameData.burstEnergy = 100;
        scene.gameData.rabbitsCollected = 0; // Reset counter
        scene.onUpdateGameData({ burstEnergy: scene.gameData.burstEnergy });
      }
      break;
  }

  scene.gameData.health = Math.min(100, scene.gameData.health + healthGain);
  scene.gameData.score += healthGain * 10;

  scene.onUpdateGameData({
    health: scene.gameData.health,
    score: scene.gameData.score
  });
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

  // Scroll background with parallax effect
  if (scene.background) {
    scene.background.tilePositionY -= scene.gameSpeed / 60;
  }
  // Far background moves slower for parallax effect
  if (scene.farBackground) {
    scene.farBackground.tilePositionY -= (scene.gameSpeed / 60) * 0.3;
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
