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

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    console.log('🎵 AudioManager initialized');
  }

  // Load audio files during Phaser preload phase
  loadAudioFiles() {
    console.log('🎵 Checking audio files...');

    // Check if audio files are already loaded (they should be loaded in gameEngine.ts)
    const audioKeys = ['bg-music', 'car-horn', 'dog-bark', 'angry-grunt'];
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

      // Check if sound exists in cache
      const soundExists = this.scene.sound.get(soundName);
      if (soundExists) {
        console.log(`✅ Sound '${soundName}' found in cache, playing...`);
        const sound = this.scene.sound.play(soundName, { volume: finalVolume });
        console.log(`✅ Sound '${soundName}' played successfully`);
        return sound;
      } else {
        console.warn(`❌ Audio file '${soundName}' not found in sound cache`);
        console.log('🔍 Checking all available sounds...');

        // Try to list all sounds (safely)
        try {
          const allSounds = (this.scene.sound as any)._sounds || {};
          const soundKeys = Object.keys(allSounds);
          console.log('📋 Available sound keys:', soundKeys);

          if (soundKeys.length === 0) {
            console.warn('⚠️ No sounds loaded at all! Audio files may not be loading properly.');
          }
        } catch (listError) {
          console.warn('❌ Could not list available sounds:', listError);
        }
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

      if (musicType === 'ambient' && this.scene.sound.get('bg-music')) {
        this.backgroundMusic = this.scene.sound.add('bg-music', {
          volume: this.musicVolume * this.masterVolume,
          loop: true
        });
        this.backgroundMusic.play();
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
    // Could add collection sounds here if needed
  }

  onHitObstacle(obstacleType: string) {
    // Play specific death sounds based on obstacle type
    switch (obstacleType) {
      case 'car':
      case 'road':
        this.playSound('car-horn');
        break;
      case 'dog':
        this.playSound('dog-bark');
        break;
      case 'poacher':
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
    // Could add victory sound here if needed
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