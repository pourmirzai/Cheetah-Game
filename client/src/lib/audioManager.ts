// Audio Manager for Save Cheetah Game
// Handles sound effects, background music, and audio settings

export class AudioManager {
  private scene: Phaser.Scene;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private ambientTimer?: Phaser.Time.TimerEvent;
  private ambientSounds: string[] = ['car-horn', 'dog-bark', 'angry-grunt'];
  private isSoundPlaying: boolean = false; // Prevents duplicate sound playback

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    console.log('🎵 AudioManager initialized');
  }

  // Load audio files during Phaser preload phase
  loadAudioFiles() {
    console.log('🎵 Checking audio files...');

    // Check if audio files are already loaded (they should be loaded in gameEngine.ts)
    const audioKeys = ['bg-music', 'car-horn', 'dog-bark', 'angry-grunt', 'applause'];
    let allLoaded = true;

    audioKeys.forEach(audioKey => {
      if (!this.scene.sound.get(audioKey)) {
        console.warn(`⚠️ Audio file '${audioKey}' not found in sound cache`);
        allLoaded = false;
      } else {
        console.log(`✅ Audio file found: ${audioKey}`);
      }
    });

    if (allLoaded) {
      console.log('🎵 All audio files are properly loaded');
    } else {
      console.warn('⚠️ Some audio files may not be loaded properly');
    }
  }

  // Public methods
  playSound(soundName: string, volume?: number) {
    if (this.isMuted) {
      console.log(`🔇 Sound '${soundName}' not played - audio is muted`);
      return;
    }

    try {
      const soundVolume = volume !== undefined ? volume : this.sfxVolume;
      const finalVolume = soundVolume * this.masterVolume;

      console.log(`🔊 Attempting to play sound: ${soundName} at volume ${finalVolume}`);

      // Prevent duplicate sound playback
      if (!this.isSoundPlaying) {
        this.isSoundPlaying = true;

        // Try to play the sound directly - Phaser will handle the rest
        try {
          const sound = this.scene.sound.play(soundName, { volume: finalVolume });
          console.log(`✅ Sound '${soundName}' played successfully`);
          this.isSoundPlaying = false;
          return sound;
        } catch (playError) {
          console.warn(`❌ Failed to play sound '${soundName}':`, playError);

          // Try to add the sound to the sound manager first
          try {
            if (this.scene.cache.audio.exists(soundName)) {
              console.log(`🔄 Adding sound '${soundName}' to sound manager...`);
              this.scene.sound.add(soundName);
              const sound = this.scene.sound.play(soundName, { volume: finalVolume });
              console.log(`✅ Sound '${soundName}' added and played successfully`);
              this.isSoundPlaying = false;
              return sound;
            } else {
              console.warn(`❌ Audio file '${soundName}' not found in audio cache`);
            }
          } catch (addError) {
            console.warn(`❌ Failed to add sound '${soundName}' to sound manager:`, addError);
          }

          // Debug: Check what's available
          console.log('🔍 Checking audio cache...');
          try {
            const audioKeys = this.scene.cache.audio.getKeys();
            console.log('📋 Available audio keys:', audioKeys);
          } catch (cacheError) {
            console.warn('❌ Could not check audio cache:', cacheError);
          }
        }
      } else {
        console.log(`⏭️ Sound '${soundName}' is already playing`);
      }
    } catch (error) {
      console.warn('❌ Error playing sound:', error);
    }
  }

  playMusic(musicType: 'ambient' | 'intense' | 'victory' = 'ambient') {
    if (this.isMuted) return;

    try {
      // Stop existing music
      this.stopMusic();

      if (musicType === 'ambient') {
        // Try to add the music to sound manager if not already there
        try {
          if (!this.scene.sound.get('bg-music') && this.scene.cache.audio.exists('bg-music')) {
            console.log('🔄 Adding bg-music to sound manager...');
            this.scene.sound.add('bg-music');
          }

          this.backgroundMusic = this.scene.sound.add('bg-music', {
            volume: this.musicVolume * this.masterVolume,
            loop: true
          });
          this.backgroundMusic.play();
          console.log('🎵 Background music started successfully');
        } catch (musicError) {
          console.warn('❌ Failed to play background music:', musicError);
        }
      }
    } catch (error) {
      console.warn('Error playing music:', error);
    }
  }

  stopMusic() {
    try {
      if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
        this.backgroundMusic.stop();
      }
    } catch (error) {
      console.warn('Error stopping music:', error);
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolume();
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolume();
  }

  private updateMusicVolume() {
    if (this.backgroundMusic) {
      (this.backgroundMusic as Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound).setVolume(this.musicVolume * this.masterVolume);
    }
  }

  mute() {
    this.isMuted = true;
    this.stopMusic();
    this.stopAmbientSounds();
  }

  unmute() {
    this.isMuted = false;
    this.playMusic('ambient');
    this.startAmbientSounds();
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // Game event audio triggers
  onCollectResource(resourceType: string) {
    // Play eat sound when collecting any resource
    this.playSound('eat');
  }

  onHitObstacle(obstacleType: string) {
    // Play die sound for lethal obstacles
    if (obstacleType === 'car' || obstacleType === 'road' || obstacleType === 'dog' || obstacleType === 'smuggler') {
      this.playSound('die');
    }

    // Also play specific sounds for some obstacles
    switch (obstacleType) {
      case 'car':
      case 'road':
        this.playSound('car-horn');
        break;
      case 'dog':
        this.playSound('dog-bark');
        break;
      case 'smuggler':
        this.playSound('angry-grunt');
        break;
      default:
        // Generic collision sound could be added here
        break;
    }
  }

  onSpeedBurst() {
    // Could add speed burst sound here if needed
  }

  onLowHealth() {
    // Could add warning sound here if needed
  }

  onGameOver() {
    this.stopMusic();
    this.stopAmbientSounds();
  }

  onVictory() {
    this.stopAmbientSounds();
    // Play victory applause sound
    this.playSound('applause', 0.8); // Slightly louder for celebration
  }

  onButtonClick() {
    // Could add button sound here if needed
  }

  startRunningSound() {
    // Could add running sound here if needed
  }

  // Start random ambient sounds
  startAmbientSounds() {
    if (this.isMuted || this.ambientTimer) return;

    this.ambientTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(8000, 15000), // Random delay between 8-15 seconds
      callback: () => {
        this.playRandomAmbientSound();
        // Schedule next ambient sound
        this.ambientTimer = this.scene.time.addEvent({
          delay: Phaser.Math.Between(8000, 15000),
          callback: () => this.playRandomAmbientSound(),
          loop: false
        });
      },
      loop: false
    });
  }

  private playRandomAmbientSound() {
    if (this.isMuted) return;

    const randomSound = Phaser.Utils.Array.GetRandom(this.ambientSounds);
    this.playSound(randomSound, 0.4); // Lower volume for ambient sounds
  }

  private stopAmbientSounds() {
    if (this.ambientTimer) {
      this.ambientTimer.destroy();
      this.ambientTimer = undefined;
    }
  }

  // Initialize audio context (required for some browsers)
  initializeAudioContext() {
    console.log('🎵 Initializing audio context...');
    try {
      // Try to unlock audio context for Web Audio API
      const soundManager = this.scene.sound as any;
      if (soundManager.context && soundManager.context.state === 'suspended') {
        soundManager.context.resume().then(() => {
          console.log('✅ Audio context resumed successfully');
        }).catch((error: any) => {
          console.warn('❌ Failed to resume audio context:', error);
        });
      }

      console.log('✅ Audio context initialization completed');
    } catch (error) {
      console.warn('❌ Error initializing audio context:', error);
    }
  }

  // Test method to verify audio is working
  testAudio() {
    console.log('🎵 Testing audio functionality...');
    this.playSound('car-horn');
    setTimeout(() => this.playSound('dog-bark'), 1000);
    setTimeout(() => this.playSound('angry-grunt'), 2000);
  }

  destroy() {
    this.stopMusic();
    this.stopAmbientSounds();
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