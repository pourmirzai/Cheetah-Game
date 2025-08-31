// Centralized Asset Configuration for Save Cheetah Game
// All image paths and configurations in one place for easy management

export const ASSET_PATHS = {
  // Background Images
  backgrounds: {
    spring: '/assets/backgrounds/spring-bg.png',
    summer: '/assets/backgrounds/summer-bg.png',
    autumn: '/assets/backgrounds/autumn-bg.png',
    winter: '/assets/backgrounds/winter-bg.png'
  },

  // Obstacle Images
  obstacles: {
    dog: '/assets/sprites/obstacles/dog.png',
    poacher: '/assets/sprites/obstacles/pocher.png',
    camel: '/assets/sprites/obstacles/camel.png',
    car: '/assets/sprites/obstacles/car.png'
  },

  // Resource Images
  resources: {
    water: '/assets/sprites/resources/water.png',
    gazelle: '/assets/sprites/resources/gazelle.png',
    rabbit: '/assets/sprites/resources/rabbit.png'
  },

  // Character Images
  characters: {
    motherCheetah: '/assets/sprites/characters/mother-cheetah.png',
    cub: '/assets/sprites/characters/cub.png'
  }
} as const;

// Asset Loading Configuration
export const ASSET_LOAD_CONFIG = {
  obstacles: [
    { texture: 'dog-obstacle', path: ASSET_PATHS.obstacles.dog },
    { texture: 'poacher', path: ASSET_PATHS.obstacles.poacher },
    { texture: 'car', path: ASSET_PATHS.obstacles.car },
    { texture: 'camel-obstacle', path: ASSET_PATHS.obstacles.camel }
  ],

  backgrounds: [
    { texture: 'spring-bg', path: ASSET_PATHS.backgrounds.spring },
    { texture: 'summer-bg', path: ASSET_PATHS.backgrounds.summer },
    { texture: 'autumn-bg', path: ASSET_PATHS.backgrounds.autumn },
    { texture: 'winter-bg', path: ASSET_PATHS.backgrounds.winter }
  ],

  resources: [
    { texture: 'water-resource', path: ASSET_PATHS.resources.water },
    { texture: 'gazelle-resource', path: ASSET_PATHS.resources.gazelle },
    { texture: 'rabbit-resource', path: ASSET_PATHS.resources.rabbit }
  ],

  characters: [
    { texture: 'mother-cheetah', path: ASSET_PATHS.characters.motherCheetah },
    { texture: 'cub', path: ASSET_PATHS.characters.cub }
  ]
} as const;

// Obstacle Configuration
export const OBSTACLE_CONFIG = {
  types: [
    { type: 'dog', texture: 'dog-obstacle' },
    { type: 'poacher', texture: 'poacher' },
    { type: 'camel', texture: 'camel-obstacle' }
  ],

  sizes: {
    dog: 62,
    poacher: 68,
    camel: 85
  },

  specialBehaviors: {
    poacher: { hasSpotlight: true, speedMultiplier: 1.0 },
    camel: { hasSpotlight: false, speedMultiplier: 0.8 },
    dog: { hasSpotlight: false, speedMultiplier: 1.0 }
  }
} as const;

// Resource Configuration
export const RESOURCE_CONFIG = {
  types: [
    { type: 'water', texture: 'water-resource', healthGain: 15 },
    { type: 'gazelle', texture: 'gazelle-resource', healthGain: 25 },
    { type: 'rabbit', texture: 'rabbit-resource', healthGain: 10 }
  ],

  maxSize: 30
} as const;

// Background Configuration
export const BACKGROUND_CONFIG = {
  seasonal: {
    spring: { texture: 'spring-bg', color: 0x90EE90 },
    summer: { texture: 'summer-bg', color: 0xF4A460 },
    autumn: { texture: 'autumn-bg', color: 0xDEB887 },
    winter: { texture: 'winter-bg', color: 0xF5F5DC }
  }
} as const;

// Character Configuration
export const CHARACTER_CONFIG = {
  motherCheetah: {
    texture: 'mother-cheetah',
    scale: 0.5
  },

  cub: {
    texture: 'cub',
    scale: 0.5
  }
} as const;

// Export all configurations
export const GAME_ASSETS = {
  paths: ASSET_PATHS,
  loadConfig: ASSET_LOAD_CONFIG,
  obstacles: OBSTACLE_CONFIG,
  resources: RESOURCE_CONFIG,
  backgrounds: BACKGROUND_CONFIG,
  characters: CHARACTER_CONFIG
} as const;