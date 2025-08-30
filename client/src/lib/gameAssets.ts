// Game asset definitions and sprite configurations
export interface SpriteConfig {
  key: string;
  width: number;
  height: number;
  color: number;
  scale?: number;
}

export const CHEETAH_SPRITES: Record<string, SpriteConfig> = {
  mother: {
    key: 'mother-cheetah',
    width: 32,
    height: 24,
    color: 0xff8c42, // Cheetah orange
    scale: 1.5
  },
  cub: {
    key: 'cub',
    width: 16,
    height: 12,
    color: 0xff8c42,
    scale: 1.2
  }
};

export const OBSTACLE_SPRITES: Record<string, SpriteConfig> = {
  dog: {
    key: 'dog',
    width: 24,
    height: 20,
    color: 0x8b4513 // Brown
  },
  trap: {
    key: 'trap',
    width: 20,
    height: 20,
    color: 0x696969 // Gray
  },
  fence: {
    key: 'fence',
    width: 30,
    height: 40,
    color: 0x654321 // Dark brown
  },
  poacher: {
    key: 'poacher',
    width: 24,
    height: 32,
    color: 0x000000 // Black
  },
  road: {
    key: 'road',
    width: 400,
    height: 20,
    color: 0x2f2f2f // Dark gray
  }
};

export const RESOURCE_SPRITES: Record<string, SpriteConfig> = {
  water: {
    key: 'water',
    width: 20,
    height: 20,
    color: 0x4169e1 // Blue
  },
  gazelle: {
    key: 'gazelle',
    width: 20,
    height: 16,
    color: 0xd2691e // Brown
  },
  rabbit: {
    key: 'rabbit',
    width: 12,
    height: 10,
    color: 0x8fbc8f // Light green
  }
};

export const BACKGROUND_CONFIGS = {
  spring: {
    topColor: 0x87ceeb, // Sky blue
    bottomColor: 0x90ee90 // Light green
  },
  summer: {
    topColor: 0xffd700, // Gold
    bottomColor: 0xf4a460 // Sandy brown
  },
  autumn: {
    topColor: 0xff8c00, // Dark orange
    bottomColor: 0xd2691e // Chocolate
  },
  winter: {
    topColor: 0x778899, // Light slate gray
    bottomColor: 0xf5f5dc // Beige
  }
};

export const SOUND_EFFECTS = {
  gameStart: 'start',
  pickup: 'pickup',
  collision: 'collision',
  speedBurst: 'burst',
  monthChange: 'month',
  gameOver: 'gameover',
  achievement: 'achievement'
};

// Resource values for health restoration
export const RESOURCE_VALUES = {
  water: 15,
  gazelle: 25,
  rabbit: 10
};

// Obstacle spawn rates by season
export const OBSTACLE_SPAWN_RATES = {
  spring: {
    dog: 0.4,
    trap: 0.2,
    fence: 0.3,
    poacher: 0.1
  },
  summer: {
    dog: 0.2,
    trap: 0.3,
    fence: 0.2,
    poacher: 0.3,
    road: 0.2
  },
  autumn: {
    dog: 0.3,
    trap: 0.3,
    fence: 0.3,
    poacher: 0.1
  },
  winter: {
    dog: 0.5,
    trap: 0.2,
    fence: 0.2,
    poacher: 0.1
  }
};

// Resource spawn rates by season
export const RESOURCE_SPAWN_RATES = {
  spring: {
    water: 0.4,
    gazelle: 0.4,
    rabbit: 0.2
  },
  summer: {
    water: 0.6,
    gazelle: 0.2,
    rabbit: 0.2
  },
  autumn: {
    water: 0.3,
    gazelle: 0.4,
    rabbit: 0.3
  },
  winter: {
    water: 0.4,
    gazelle: 0.1,
    rabbit: 0.5
  }
};

// Game balance constants
export const GAME_CONFIG = {
  LANES: [120, 240, 360, 480],
  BASE_SPEED: 200,
  SPEED_BURST_MULTIPLIER: 2,
  SPEED_BURST_DURATION: 2000,
  HEALTH_DECAY_RATE: 5, // Health lost per 3 seconds
  ENERGY_RECHARGE_RATE: 10, // Energy gained per 3 seconds
  SPAWN_INTERVAL: 2000, // Milliseconds between spawns
  MONTH_DURATION: [6000, 8000], // Random range for month duration
  TOTAL_GAME_TIME: 120000, // 120 seconds in milliseconds
  TOTAL_MONTHS: 18
};

export function createSpriteTexture(scene: Phaser.Scene, config: SpriteConfig): void {
  if (config.key.includes('water')) {
    // Create circular sprite for water
    scene.add.graphics()
      .fillStyle(config.color)
      .fillCircle(config.width / 2, config.height / 2, config.width / 2)
      .generateTexture(config.key, config.width, config.height);
  } else {
    // Create rectangular sprite for others
    scene.add.graphics()
      .fillStyle(config.color)
      .fillRect(0, 0, config.width, config.height)
      .generateTexture(config.key, config.width, config.height);
  }
}

export function loadAllAssets(scene: Phaser.Scene): void {
  // Load all sprite textures
  Object.values(CHEETAH_SPRITES).forEach(config => createSpriteTexture(scene, config));
  Object.values(OBSTACLE_SPRITES).forEach(config => createSpriteTexture(scene, config));
  Object.values(RESOURCE_SPRITES).forEach(config => createSpriteTexture(scene, config));
  
  // Create background textures for each season
  Object.entries(BACKGROUND_CONFIGS).forEach(([season, colors]) => {
    scene.add.graphics()
      .fillGradientStyle(colors.topColor, colors.topColor, colors.bottomColor, colors.bottomColor, 1)
      .fillRect(0, 0, scene.scale.width, scene.scale.height)
      .generateTexture(`background-${season}`, scene.scale.width, scene.scale.height);
  });
}
