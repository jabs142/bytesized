/**
 * Audio Manager - Handles 8-bit sound effects
 * Uses Web Audio API for authentic retro gaming sounds
 */

class AudioManager {
  constructor() {
    this.context = null;
    this.isMuted = true; // Start muted by default (better UX)
    this.sounds = {};
    this.initialized = false;
  }

  /**
   * Initialize Audio Context
   * Must be called after user interaction due to browser autoplay policies
   */
  async init() {
    if (this.initialized) return;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('Audio system initialized');
    } catch (error) {
      console.warn('Could not initialize audio:', error);
    }
  }

  /**
   * Generate 8-bit style beep sound using Web Audio API
   * @param {number} frequency - Sound frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {string} type - Waveform type ('square', 'triangle', 'sine', 'sawtooth')
   */
  playBeep(frequency = 440, duration = 0.1, type = 'square') {
    if (this.isMuted || !this.initialized) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Envelope for natural sound
    gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  /**
   * Play hover sound (short beep)
   */
  playHover() {
    this.playBeep(800, 0.05, 'square');
  }

  /**
   * Play selection sound (confirm)
   */
  playSelect() {
    if (this.isMuted || !this.initialized) return;

    // Two-tone confirmation sound
    this.playBeep(600, 0.08, 'square');
    setTimeout(() => {
      this.playBeep(800, 0.08, 'square');
    }, 80);
  }

  /**
   * Play cartridge insert sound
   */
  playInsert() {
    if (this.isMuted || !this.initialized) return;

    // Cartridge click + startup chime
    this.playBeep(200, 0.05, 'square');
    setTimeout(() => {
      this.playStartupChime();
    }, 100);
  }

  /**
   * Play Game Boy startup chime (iconic ding!)
   */
  playStartupChime() {
    if (this.isMuted || !this.initialized) return;

    const notes = [
      { freq: 988, duration: 0.1 },   // B5
      { freq: 1319, duration: 0.15 }, // E6
      { freq: 1976, duration: 0.1 },  // B6
      { freq: 2637, duration: 0.4 }   // E7 (held)
    ];

    let currentTime = this.context.currentTime;

    notes.forEach(({ freq, duration }, index) => {
      const delay = index === 0 ? 0 : 0.1;
      currentTime += delay;

      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      oscillator.type = 'square';
      oscillator.frequency.value = freq;

      // Envelope
      gainNode.gain.setValueAtTime(0.2, currentTime);
      if (index === notes.length - 1) {
        // Final note fades out
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
      } else {
        gainNode.gain.setValueAtTime(0.2, currentTime + duration);
      }

      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
    });
  }

  /**
   * Play error/cancel sound
   */
  playError() {
    if (this.isMuted || !this.initialized) return;

    this.playBeep(200, 0.15, 'sawtooth');
  }

  /**
   * Play power on sound
   */
  playPowerOn() {
    if (this.isMuted || !this.initialized) return;

    // Rising frequency sweep
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(100, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.2, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.5);
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMuted(muted) {
    this.isMuted = muted;
  }

  /**
   * Check if audio is muted
   */
  getMuted() {
    return this.isMuted;
  }
}

// Create global audio manager instance
const audioManager = new AudioManager();

// Initialize on first user interaction
document.addEventListener('click', () => {
  audioManager.init();
}, { once: true });

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
