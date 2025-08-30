// Sprite Generator for Pixel Art Assets
// Creates pixel-perfect sprites programmatically for the Save Cheetah game

export function createMotherCheetahSprite(graphics: Phaser.GameObjects.Graphics): string {
  // Create mother cheetah sprite (32x24 pixels)
  const colors = {
    body: 0xff8c42,    // Orange
    spots: 0x8b4513,   // Dark brown
    eyes: 0x000000,    // Black
    outline: 0x654321  // Brown outline
  };

  // Body outline
  graphics.fillStyle(colors.outline);
  graphics.fillRect(0, 0, 32, 24);

  // Main body
  graphics.fillStyle(colors.body);
  graphics.fillRect(2, 2, 28, 20);

  // Spots pattern
  graphics.fillStyle(colors.spots);
  // Row 1
  graphics.fillRect(4, 4, 2, 2);
  graphics.fillRect(8, 4, 2, 2);
  graphics.fillRect(12, 4, 2, 2);
  graphics.fillRect(18, 4, 2, 2);
  graphics.fillRect(22, 4, 2, 2);
  graphics.fillRect(26, 4, 2, 2);

  // Row 2
  graphics.fillRect(6, 8, 2, 2);
  graphics.fillRect(10, 8, 2, 2);
  graphics.fillRect(14, 8, 2, 2);
  graphics.fillRect(20, 8, 2, 2);
  graphics.fillRect(24, 8, 2, 2);

  // Row 3
  graphics.fillRect(4, 12, 2, 2);
  graphics.fillRect(8, 12, 2, 2);
  graphics.fillRect(12, 12, 2, 2);
  graphics.fillRect(18, 12, 2, 2);
  graphics.fillRect(22, 12, 2, 2);
  graphics.fillRect(26, 12, 2, 2);

  // Eyes
  graphics.fillStyle(colors.eyes);
  graphics.fillRect(6, 6, 2, 2);
  graphics.fillRect(24, 6, 2, 2);

  return 'mother-cheetah-pixel';
}

export function createCubSprite(graphics: Phaser.GameObjects.Graphics): string {
  // Create cub sprite (16x12 pixels)
  const colors = {
    body: 0xff8c42,    // Orange
    spots: 0x8b4513,   // Dark brown
    eyes: 0x000000,    // Black
    outline: 0x654321  // Brown outline
  };

  // Body outline
  graphics.fillStyle(colors.outline);
  graphics.fillRect(0, 0, 16, 12);

  // Main body
  graphics.fillStyle(colors.body);
  graphics.fillRect(1, 1, 14, 10);

  // Spots
  graphics.fillStyle(colors.spots);
  graphics.fillRect(3, 3, 1, 1);
  graphics.fillRect(6, 3, 1, 1);
  graphics.fillRect(9, 3, 1, 1);
  graphics.fillRect(12, 3, 1, 1);

  graphics.fillRect(4, 6, 1, 1);
  graphics.fillRect(7, 6, 1, 1);
  graphics.fillRect(10, 6, 1, 1);

  // Eyes
  graphics.fillStyle(colors.eyes);
  graphics.fillRect(3, 2, 1, 1);
  graphics.fillRect(12, 2, 1, 1);

  return 'cub-pixel';
}

export function createDogObstacleSprite(graphics: Phaser.GameObjects.Graphics): string {
  // Create dog obstacle sprite (24x20 pixels)
  const colors = {
    body: 0x8b4513,    // Brown
    ears: 0x654321,    // Dark brown
    eyes: 0xff0000,    // Red (aggressive)
    outline: 0x4a4a4a  // Dark gray outline
  };

  // Body outline
  graphics.fillStyle(colors.outline);
  graphics.fillRect(0, 0, 24, 20);

  // Main body
  graphics.fillStyle(colors.body);
  graphics.fillRect(2, 2, 20, 16);

  // Ears
  graphics.fillStyle(colors.ears);
  graphics.fillRect(4, 2, 4, 6);
  graphics.fillRect(16, 2, 4, 6);

  // Eyes
  graphics.fillStyle(colors.eyes);
  graphics.fillRect(6, 6, 2, 2);
  graphics.fillRect(16, 6, 2, 2);

  // Snout
  graphics.fillStyle(colors.outline);
  graphics.fillRect(10, 12, 4, 4);

  return 'dog-obstacle-pixel';
}

export function createCamelObstacleSprite(graphics: Phaser.GameObjects.Graphics): string {
  // Create camel obstacle sprite (32x24 pixels)
  const colors = {
    body: 0xd2b48c,     // Tan
    hump: 0xbc8f8f,     // Rosy brown
    legs: 0xa0522d,     // Sienna
    eyes: 0x000000,     // Black
    outline: 0x8b7355   // Dark tan outline
  };

  // Body outline
  graphics.fillStyle(colors.outline);
  graphics.fillRect(0, 0, 32, 24);

  // Main body
  graphics.fillStyle(colors.body);
  graphics.fillRect(2, 2, 28, 20);

  // Hump
  graphics.fillStyle(colors.hump);
  graphics.fillRect(12, 4, 8, 6);

  // Legs
  graphics.fillStyle(colors.legs);
  graphics.fillRect(6, 22, 3, 2);
  graphics.fillRect(12, 22, 3, 2);
  graphics.fillRect(17, 22, 3, 2);
  graphics.fillRect(23, 22, 3, 2);

  // Eyes
  graphics.fillStyle(colors.eyes);
  graphics.fillRect(8, 8, 2, 2);
  graphics.fillRect(22, 8, 2, 2);

  // Neck
  graphics.fillStyle(colors.body);
  graphics.fillRect(26, 6, 4, 8);

  return 'camel-obstacle-pixel';
}

export function createWaterResourceSprite(graphics: Phaser.GameObjects.Graphics): string {
  // Create water resource sprite (20x20 pixels)
  const colors = {
    water: 0x4169e1,   // Royal blue
    highlight: 0x87ceeb, // Sky blue
    outline: 0x000080   // Navy blue
  };

  // Water drop shape
  graphics.fillStyle(colors.outline);
  graphics.fillRect(0, 0, 20, 20);

  // Main water
  graphics.fillStyle(colors.water);
  graphics.fillRect(2, 2, 16, 16);

  // Highlight
  graphics.fillStyle(colors.highlight);
  graphics.fillRect(4, 4, 6, 6);
  graphics.fillRect(10, 6, 4, 4);

  return 'water-resource-pixel';
}

export function createGazelleResourceSprite(graphics: Phaser.GameObjects.Graphics): string {
  // Create gazelle resource sprite (20x16 pixels)
  const colors = {
    body: 0xd2691e,    // Chocolate
    legs: 0x8b4513,    // Saddle brown
    outline: 0x654321  // Dark brown
  };

  // Body outline
  graphics.fillStyle(colors.outline);
  graphics.fillRect(0, 0, 20, 16);

  // Main body
  graphics.fillStyle(colors.body);
  graphics.fillRect(2, 2, 16, 12);

  // Legs
  graphics.fillStyle(colors.legs);
  graphics.fillRect(4, 14, 2, 2);
  graphics.fillRect(8, 14, 2, 2);
  graphics.fillRect(12, 14, 2, 2);
  graphics.fillRect(16, 14, 2, 2);

  // Head
  graphics.fillStyle(colors.body);
  graphics.fillRect(16, 4, 4, 4);

  return 'gazelle-resource-pixel';
}

export function createRabbitResourceSprite(graphics: Phaser.GameObjects.Graphics): string {
  // Create rabbit resource sprite (12x10 pixels)
  const colors = {
    body: 0x8fbc8f,    // Dark sea green
    ears: 0xffffff,    // White
    eyes: 0x000000,    // Black
    outline: 0x556b2f   // Dark olive green
  };

  // Body outline
  graphics.fillStyle(colors.outline);
  graphics.fillRect(0, 0, 12, 10);

  // Main body
  graphics.fillStyle(colors.body);
  graphics.fillRect(1, 1, 10, 8);

  // Ears
  graphics.fillStyle(colors.ears);
  graphics.fillRect(2, 1, 2, 3);
  graphics.fillRect(8, 1, 2, 3);

  // Eyes
  graphics.fillStyle(colors.eyes);
  graphics.fillRect(3, 3, 1, 1);
  graphics.fillRect(8, 3, 1, 1);

  return 'rabbit-resource-pixel';
}

export function createBackgroundTexture(graphics: Phaser.GameObjects.Graphics, season: string): string {
  const colors = {
    spring: { sky: 0x87ceeb, ground: 0x90EE90, hills: 0x8FBC8F },
    summer: { sky: 0x87ceeb, ground: 0xF4A460, hills: 0xDAA520 },
    autumn: { sky: 0x87ceeb, ground: 0xDEB887, hills: 0x8B7355 },
    winter: { sky: 0xb0c4de, ground: 0xF5F5DC, hills: 0xD3D3D3 }
  };

  const seasonColors = colors[season as keyof typeof colors] || colors.spring;

  // Sky gradient
  graphics.fillGradientStyle(seasonColors.sky, seasonColors.sky, seasonColors.ground, seasonColors.ground, 1);
  graphics.fillRect(0, 0, 800, 600);

  // Ground
  graphics.fillStyle(seasonColors.ground);
  graphics.fillRect(0, 400, 800, 200);

  // Hills in background
  graphics.fillStyle(seasonColors.hills);
  // Simple hill shapes
  graphics.fillTriangle(0, 400, 200, 300, 400, 400);
  graphics.fillTriangle(300, 400, 500, 350, 700, 400);
  graphics.fillTriangle(600, 400, 800, 380, 800, 400);

  return `background-${season}`;
}