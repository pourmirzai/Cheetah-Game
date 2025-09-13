# 🎨 Save Cheetah Game Assets Guide

## 📁 Asset Folder Structure

Place your PNG files in the following folders:

```
public/assets/
├── backgrounds/          # Seasonal background images
├── sprites/
│   ├── characters/       # Mother cheetah and cub sprites
│   ├── obstacles/        # Threats and obstacles
│   └── resources/        # Food and water resources
```

## 🖼️ Required Image Files

### 🎭 Characters (`public/assets/sprites/characters/`)
- `mother-cheetah.webp` - Main character (32x24 pixels)
- `cub.webp` - Baby cheetah following mother (16x12 pixels)

### 🌿 Resources (`public/assets/sprites/resources/`)
- `water.webp` - Water resource (20x20 pixels)
- `gazelle.webp` - Gazelle prey (20x16 pixels)
- `rabbit.webp` - Rabbit prey (12x10 pixels)

### ⚠️ Obstacles (`public/assets/sprites/obstacles/`)
- `dog.webp` or `dog.webp` - Guard dog threat (24x20 pixels)
- `smuggler.webp` or `smuggler.webp` - Smuggler wolf with spotlight (24x32 pixels)
- `car.webp` or `car.webp` - Road vehicle (40x20 pixels)

### 🏞️ Backgrounds (`public/assets/backgrounds/`)
**Priority order: JPG → WEBP → PNG (for smaller file sizes)**
- `spring-bg.jpg` or `spring-bg.webp` or `spring-bg.png` - Spring landscape (800x600 pixels)
- `summer-bg.jpg` or `summer-bg.webp` or `summer-bg.png` - Summer landscape (800x600 pixels)
- `autumn-bg.jpg` or `autumn-bg.webp` or `autumn-bg.png` - Autumn landscape (800x600 pixels)
- `winter-bg.jpg` or `winter-bg.webp` or `winter-bg.png` - Winter landscape (800x600 pixels)

## 📐 Image Specifications

### Pixel Art Style
- **Resolution**: Match the sizes above for best results
- **Color Palette**: Use colors that work well with the game theme
- **Style**: Pixel art, 16-bit style recommended

### Format Guidelines
- **Backgrounds**: Use JPG for smallest file size (no transparency needed)
- **Sprites with transparency**: Use PNG or WEBP
- **General sprites**: Use WEBP for good compression

### File Size Comparison
- **JPG**: 50-200KB (best for backgrounds)
- **WEBP**: 30-150KB (good compression + transparency)
- **PNG**: 100-500KB (best quality + transparency)

### Optimization Tips
- Keep file sizes small (< 100KB per image for backgrounds)
- Use JPG for backgrounds to save bandwidth
- Test on mobile devices for performance
- Use WEBP for modern browser optimization

## 🔧 How to Use

1. Place your PNG files in the correct folders
2. The game will automatically load them instead of generated sprites
3. If a PNG file is missing, the game falls back to generated sprites
4. Restart the development server after adding new assets

## 🎵 Audio Files (Future)

When ready to add audio, place in:
```
public/assets/audio/
├── sfx/          # Sound effects
├── music/        # Background music
```

## 📝 Notes

- All images should be in PNG format with transparency
- File names must match exactly as specified above
- The game supports both generated sprites and real PNG files
- PNG files take priority over generated sprites when available