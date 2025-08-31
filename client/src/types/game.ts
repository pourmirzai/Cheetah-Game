export interface GameState {
  currentScreen: 'menu' | 'game' | 'tutorial' | 'gameOver' | 'shareCard' | 'downloadStory';
  isPlaying: boolean;
  isPaused: boolean;
  sessionId: string | null;
}

export interface GameData {
  cubs: number;
  currentMonth: number;
  timeRemaining: number;
  health: number;
  burstEnergy: number;
  score: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  position: { x: number; y: number };
  lane: number;
  speed: number;
  speedBurstActive: boolean;
  rabbitsCollected?: number;
}

export interface GameResults {
  cubsSurvived: number;
  monthsCompleted: number;
  finalScore: number;
  gameTime: number;
  deathCause?: string;
  achievements: string[];
  achievementTitle: string;
  conservationMessage: string;
}


export interface GameObject {
  id: string;
  type: 'cheetah' | 'cub' | 'obstacle' | 'resource';
  x: number;
  y: number;
  width: number;
  height: number;
  sprite?: string;
  data?: any;
}

export interface Obstacle extends GameObject {
  type: 'obstacle';
  subtype: 'dog' | 'smuggler' | 'road';
  dangerous: boolean;
}

export interface Resource extends GameObject {
  type: 'resource';
  subtype: 'water' | 'gazelle' | 'rabbit';
  value: number;
}

export interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
}
