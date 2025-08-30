export interface BackgroundConfig {
  id: string;
  name: string;
  path: string;
  type: 'image' | 'gradient' | 'pattern';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export class BackgroundManager {
  private static instance: BackgroundManager;
  private backgrounds: Map<string, BackgroundConfig> = new Map();

  private constructor() {
    this.initializeBackgrounds();
  }

  static getInstance(): BackgroundManager {
    if (!BackgroundManager.instance) {
      BackgroundManager.instance = new BackgroundManager();
    }
    return BackgroundManager.instance;
  }

  private initializeBackgrounds() {
    // Seasonal backgrounds
    const seasonalBackgrounds: BackgroundConfig[] = [
      {
        id: 'spring-bg',
        name: 'بهار',
        path: '/assets/backgrounds/spring-bg.jpg',
        type: 'image',
        season: 'spring'
      },
      {
        id: 'summer-bg',
        name: 'تابستان',
        path: '/assets/backgrounds/summer-bg.png',
        type: 'image',
        season: 'summer'
      },
      {
        id: 'autumn-bg',
        name: 'پاییز',
        path: '/assets/backgrounds/autumn-bg.png',
        type: 'image',
        season: 'autumn'
      },
      {
        id: 'winter-bg',
        name: 'زمستان',
        path: '/assets/backgrounds/winter-bg.jpg',
        type: 'image',
        season: 'winter'
      }
    ];

    // Default gradient background
    const defaultBackground: BackgroundConfig = {
      id: 'default',
      name: 'پیش‌فرض',
      path: '/assets/backgrounds/main.png',
      type: 'image'
    };

    // Persian landscape pattern
    const persianPattern: BackgroundConfig = {
      id: 'persian-landscape',
      name: 'چشم‌انداز ایرانی',
      path: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.2)),
             url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><path d="M0 15 Q25 10 50 15 T100 15 V20 H0 Z" fill="%23654321" opacity="0.3"/></svg>')`,
      type: 'pattern'
    };

    // Add all backgrounds
    this.backgrounds.set(defaultBackground.id, defaultBackground);
    this.backgrounds.set(persianPattern.id, persianPattern);
    seasonalBackgrounds.forEach(bg => this.backgrounds.set(bg.id, bg));
  }

  getBackground(id: string): BackgroundConfig | undefined {
    return this.backgrounds.get(id);
  }

  getAllBackgrounds(): BackgroundConfig[] {
    return Array.from(this.backgrounds.values());
  }

  getCurrentBackground(): BackgroundConfig | undefined {
    // Return default background for main menu
    return this.backgrounds.get('default');
  }

  getSeasonalBackground(currentMonth: number): BackgroundConfig | undefined {
    // Determine season based on month according to game documentation
    let season: 'spring' | 'summer' | 'autumn' | 'winter';

    if (currentMonth <= 3 || (currentMonth >= 13 && currentMonth <= 15)) {
      season = 'spring';
    } else if (currentMonth <= 6 || (currentMonth >= 16 && currentMonth <= 18)) {
      season = 'summer';
    } else if (currentMonth <= 9) {
      season = 'autumn';
    } else {
      season = 'winter';
    }

    return this.backgrounds.get(`${season}-bg`);
  }

  getBackgroundStyle(config: BackgroundConfig): React.CSSProperties {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };

    switch (config.type) {
      case 'image':
        return {
          ...baseStyle,
          backgroundImage: `url('${config.path}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        };
      case 'gradient':
        return {
          ...baseStyle,
          background: config.path
        };
      case 'pattern':
        return {
          ...baseStyle,
          background: config.path,
          backgroundSize: '200px 40px, cover',
          animation: 'parallaxScroll 8s linear infinite'
        };
      default:
        return baseStyle;
    }
  }

  // Initialize method for compatibility
  initialize() {
    // No initialization needed for automatic backgrounds
  }
}

// Export singleton instance
export const backgroundManager = BackgroundManager.getInstance();