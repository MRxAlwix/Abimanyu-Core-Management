class SoundService {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled: boolean = true;

  constructor() {
    this.loadSounds();
    this.enabled = localStorage.getItem('sound_enabled') !== 'false';
  }

  private loadSounds() {
    // Create audio elements with data URLs for different sounds
    this.sounds = {
      success: this.createAudioElement('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      error: this.createAudioElement('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      click: this.createAudioElement('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
      notification: this.createAudioElement('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
    };
  }

  private createAudioElement(src: string): HTMLAudioElement {
    const audio = new Audio(src);
    audio.volume = 0.3;
    audio.preload = 'auto';
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
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('sound-settings-change', { 
      detail: { enabled: this.enabled } 
    }));
    
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
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('sound-settings-change', { 
      detail: { enabled: this.enabled } 
    }));
  }
}

export const soundService = new SoundService();