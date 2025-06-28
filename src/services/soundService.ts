class SoundService {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled: boolean = true;

  constructor() {
    this.loadSounds();
    this.enabled = localStorage.getItem('sound_enabled') !== 'false';
  }

  private loadSounds() {
    // Create simple beep sounds using Web Audio API
    this.sounds = {
      success: this.createBeep(800, 0.1, 'sine'),
      error: this.createBeep(300, 0.2, 'square'),
      click: this.createBeep(600, 0.05, 'sine'),
      notification: this.createBeep(500, 0.15, 'triangle'),
    };
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType): HTMLAudioElement {
    // Create a simple audio element with data URL
    const audio = new Audio();
    
    // Generate a simple beep using Web Audio API and convert to data URL
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      // For demo purposes, use a simple data URL
      audio.src = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT`;
      audio.volume = 0.3;
    } catch (error) {
      // Fallback for browsers without Web Audio API
      audio.src = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT`;
      audio.volume = 0.3;
    }
    
    return audio;
  }

  playSound(type: 'success' | 'error' | 'click' | 'notification') {
    if (!this.enabled) return;
    
    try {
      const sound = this.sounds[type];
      if (sound) {
        sound.currentTime = 0;
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Ignore autoplay restrictions
          });
        }
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  toggleSound(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('sound_enabled', this.enabled.toString());
    
    // Play test sound when enabling
    if (this.enabled) {
      setTimeout(() => this.playSound('notification'), 100);
    }
    
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('sound_enabled', enabled.toString());
  }
}

export const soundService = new SoundService();