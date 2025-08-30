// Audio Manager for Save Cheetah Game
// Handles sound effects, background music, and audio settings
// Note: Audio is disabled for now to prevent Phaser errors
// In production, this would be replaced with actual audio files

export class AudioManager {
  private scene: Phaser.Scene;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Audio system is disabled for now to prevent Phaser errors
    // In production, this would load actual audio files
  }

  // Public methods - all disabled for now to prevent Phaser errors
  playSound(soundName: string, volume?: number) {
    // Audio disabled - would play sound in production
  }

  playMusic(musicType: 'ambient' | 'intense' | 'victory' = 'ambient') {
    // Audio disabled - would play music in production
  }

  stopMusic() {
    // Audio disabled - would stop music in production
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  // Game event audio triggers - all disabled for now
  onCollectResource(resourceType: string) {
    // Audio disabled - would play collection sound in production
  }

  onHitObstacle(obstacleType: string) {
    // Audio disabled - would play collision sound in production
  }

  onSpeedBurst() {
    // Audio disabled - would play speed burst sound in production
  }

  onLowHealth() {
    // Audio disabled - would play warning sound in production
  }

  onGameOver() {
    // Audio disabled - would play game over sound in production
  }

  onVictory() {
    // Audio disabled - would play victory sound in production
  }

  onButtonClick() {
    // Audio disabled - would play button sound in production
  }

  startRunningSound() {
    // Audio disabled - would play running sound in production
  }

  destroy() {
    // Audio disabled - cleanup would happen in production
  }
}

// Audio context for Web Audio API fallback
export function initializeWebAudio() {
  // Initialize Web Audio API for browsers that support it
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioContext;
  } catch (error) {
    console.warn('Web Audio API not supported');
    return null;
  }
}