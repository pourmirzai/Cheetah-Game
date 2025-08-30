import Phaser from "phaser";
import { GameData, GameResults, GameObject, Obstacle, Resource } from "@/types/game";
import { trackEvent } from "@/lib/analytics";

interface GameScene extends Phaser.Scene {
  gameData: GameData;
  onUpdateGameData: (updates: Partial<GameData>) => void;
  onGameEnd: (results: Partial<GameResults>) => void;
  sessionId: string;
  
  // Game objects
  motherCheetah?: Phaser.GameObjects.Sprite;
  cubs: Phaser.GameObjects.Sprite[];
  obstacles: Phaser.GameObjects.Group;
  resources: Phaser.GameObjects.Group;
  background?: Phaser.GameObjects.TileSprite;
  
  // Game state
  lanes: number[];
  currentLane: number;
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
  // Create simple colored rectangles as sprites for now
  // In production, these would be actual sprite images
  
  // Create mother cheetah sprite
  scene.add.graphics()
    .fillStyle(0xff8c42) // Cheetah orange
    .fillRect(0, 0, 32, 24)
    .generateTexture('mother-cheetah', 32, 24);

  // Create cub sprite
  scene.add.graphics()
    .fillStyle(0xff8c42)
    .fillRect(0, 0, 16, 12)
    .generateTexture('cub', 16, 12);

  // Create obstacle sprites
  scene.add.graphics()
    .fillStyle(0x8b4513) // Brown for dogs
    .fillRect(0, 0, 24, 20)
    .generateTexture('dog', 24, 20);

  scene.add.graphics()
    .fillStyle(0x696969) // Gray for traps
    .fillRect(0, 0, 20, 20)
    .generateTexture('trap', 20, 20);

  scene.add.graphics()
    .fillStyle(0x654321) // Dark brown for fences
    .fillRect(0, 0, 30, 40)
    .generateTexture('fence', 30, 40);

  scene.add.graphics()
    .fillStyle(0x000000) // Black for poachers
    .fillRect(0, 0, 24, 32)
    .generateTexture('poacher', 24, 32);

  // Create resource sprites
  scene.add.graphics()
    .fillStyle(0x4169e1) // Blue for water
    .fillCircle(10, 10, 10)
    .generateTexture('water', 20, 20);

  scene.add.graphics()
    .fillStyle(0xd2691e) // Brown for gazelle
    .fillRect(0, 0, 20, 16)
    .generateTexture('gazelle', 20, 16);

  scene.add.graphics()
    .fillStyle(0x8fbc8f) // Green for rabbit
    .fillRect(0, 0, 12, 10)
    .generateTexture('rabbit', 12, 10);

  // Create background texture
  scene.add.graphics()
    .fillGradientStyle(0x87ceeb, 0x87ceeb, 0xf4a460, 0xf4a460, 1) // Sky to sand gradient
    .fillRect(0, 0, scene.scale.width, scene.scale.height)
    .generateTexture('background', scene.scale.width, scene.scale.height);
}

function createGameWorld(scene: GameScene) {
  // Create scrolling background
  scene.background = scene.add.tileSprite(0, 0, scene.scale.width, scene.scale.height, 'background');
  scene.background.setOrigin(0, 0);

  // Create mother cheetah
  scene.motherCheetah = scene.add.sprite(scene.lanes[scene.currentLane], scene.scale.height - 150, 'mother-cheetah');
  scene.motherCheetah.setScale(1.5);

  // Create cubs following behind
  for (let i = 0; i < scene.gameData.cubs; i++) {
    const cub = scene.add.sprite(
      scene.lanes[scene.currentLane] + (i % 2 === 0 ? -20 : 20),
      scene.scale.height - 100 - (i * 30),
      'cub'
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
  const obstacleTypes = ['dog', 'trap', 'fence', 'poacher'];
  const type = obstacleTypes[Phaser.Math.Between(0, obstacleTypes.length - 1)];
  
  const obstacle = scene.add.sprite(x, y, type);
  scene.obstacles.add(obstacle);
  scene.physics.world.enable(obstacle);
  
  // Move obstacle down
  scene.tweens.add({
    targets: obstacle,
    y: scene.scale.height + 50,
    duration: 5000 / (scene.gameSpeed / 200),
    onComplete: () => {
      obstacle.destroy();
    }
  });

  // Collision detection
  scene.physics.add.overlap(scene.motherCheetah!, obstacle, () => {
    endGame(scene, type);
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
        obstacleType: type,
        month: scene.gameData.currentMonth 
      });
      
      if (scene.gameData.cubs === 0) {
        endGame(scene, 'all_cubs_lost');
      }
    });
  });
}

function spawnResource(scene: GameScene, x: number, y: number) {
  const resourceTypes = ['water', 'gazelle', 'rabbit'];
  const type = resourceTypes[Phaser.Math.Between(0, resourceTypes.length - 1)];
  
  const resource = scene.add.sprite(x, y, type);
  scene.resources.add(resource);
  scene.physics.world.enable(resource);
  
  // Move resource down
  scene.tweens.add({
    targets: resource,
    y: scene.scale.height + 50,
    duration: 5000 / (scene.gameSpeed / 200),
    onComplete: () => {
      resource.destroy();
    }
  });

  // Collection detection
  scene.physics.add.overlap(scene.motherCheetah!, resource, () => {
    collectResource(scene, type);
    resource.destroy();
  });
}

function collectResource(scene: GameScene, type: string) {
  let healthGain = 0;
  
  switch (type) {
    case 'water':
      healthGain = 15;
      break;
    case 'gazelle':
      healthGain = 25;
      break;
    case 'rabbit':
      healthGain = 10;
      break;
  }
  
  scene.gameData.health = Math.min(100, scene.gameData.health + healthGain);
  scene.gameData.score += healthGain * 10;
  
  scene.onUpdateGameData({ 
    health: scene.gameData.health, 
    score: scene.gameData.score 
  });

  trackEvent('pickup', { 
    sessionId: scene.sessionId, 
    type, 
    healthGain,
    month: scene.gameData.currentMonth 
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
  
  // Check for starvation
  if (scene.gameData.health <= 0) {
    endGame(scene, 'starvation');
  }
}

function endGame(scene: GameScene, cause: string) {
  // Stop timers
  scene.gameTimer?.destroy();
  scene.monthTimer?.destroy();
  
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
  
  scene.onGameEnd(results);
}

// Update scene every frame
export function updateGame(scene: GameScene) {
  // Scroll background
  if (scene.background) {
    scene.background.tilePositionY -= scene.gameSpeed / 60;
  }
  
  // Apply health effects
  if (scene.gameData.health < 25) {
    // Add vignette effect for low health
    scene.cameras.main.setAlpha(0.7);
  } else {
    scene.cameras.main.setAlpha(1);
  }
}
