/**
 * Animations Module - Handles all visual effects and transitions
 */

const Animations = {
  /**
   * Show boot sequence on first load
   */
  playBootSequence() {
    const bootElement = document.getElementById('bootSequence');
    if (!bootElement) return;

    // Play power on sound
    setTimeout(() => {
      audioManager.playPowerOn();
    }, 100);

    // Play startup chime
    setTimeout(() => {
      audioManager.playStartupChime();
    }, 800);

    // Hide boot sequence after animation
    setTimeout(() => {
      bootElement.classList.add('hidden');
    }, 3500);
  },

  /**
   * Animate cartridge insertion
   * @param {HTMLElement} cartridgeElement - The cartridge DOM element
   * @param {Function} callback - Function to call after animation completes
   */
  insertCartridge(cartridgeElement, callback) {
    // Add flash effect to screen
    this.screenFlash();

    // Play insert sound
    audioManager.playInsert();

    // Calculate position to Game Boy screen
    const cartridgeRect = cartridgeElement.getBoundingClientRect();
    const gameBoy = document.querySelector('.gameboy-device');
    const gameBoyRect = gameBoy.getBoundingClientRect();

    const deltaX = gameBoyRect.left + (gameBoyRect.width / 2) - cartridgeRect.left;
    const deltaY = gameBoyRect.top - cartridgeRect.top;

    // Set CSS custom property for animation
    cartridgeElement.style.setProperty('--gameboy-x', `${deltaX}px`);

    // Add inserting class to trigger animation
    cartridgeElement.classList.add('inserting');

    // Show loading transition after cartridge disappears
    setTimeout(() => {
      this.showLoadingTransition();
    }, 1200);

    // Call callback after full animation
    setTimeout(() => {
      if (callback) callback();
    }, 2000);
  },

  /**
   * Screen flash effect
   */
  screenFlash() {
    const screen = document.querySelector('.screen-glass');
    if (!screen) return;

    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    screen.appendChild(flash);

    setTimeout(() => {
      flash.remove();
    }, 300);
  },

  /**
   * Show loading transition screen
   */
  showLoadingTransition() {
    const transition = document.getElementById('loadingTransition');
    if (transition) {
      transition.classList.remove('hidden');
    }
  },

  /**
   * Hide loading transition screen
   */
  hideLoadingTransition() {
    const transition = document.getElementById('loadingTransition');
    if (transition) {
      transition.classList.add('hidden');
    }
  },

  /**
   * Map cartridge ID to mascot CSS class
   * @param {string} cartridgeId - Cartridge ID
   * @returns {string} Mascot class name
   */
  getMascotClass(cartridgeId) {
    const mascotMap = {
      'pcos-symptoms': 'mascot-pcos',
      'covid-timeline': 'mascot-covid',
      'birth-control': 'mascot-birth-control',
      'eds-syndrome': 'mascot-eds',
      'evolution-invention': 'mascot-evolution'
    };
    return mascotMap[cartridgeId] || 'mascot-default';
  },

  /**
   * Update entire Game Boy screen with cartridge preview
   * @param {Object} cartridgeData - Cartridge data object
   */
  showCartridgePreview(cartridgeData) {
    const screenTitle = document.getElementById('screenTitle');
    const mascotContainer = document.getElementById('mascotContainer');
    const screenSubtitle = document.getElementById('screenSubtitle');

    if (!screenTitle || !mascotContainer || !screenSubtitle) return;

    // Update title with cartridge name
    screenTitle.innerHTML = `
      <div class="pixel-text-lg">${cartridgeData.title.toUpperCase()}</div>
    `;

    // Show icon if available, otherwise show mascot character
    if (cartridgeData.icon) {
      mascotContainer.innerHTML = `
        <div class="mascot-icon" style="font-size: 64px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          ${cartridgeData.icon}
        </div>
      `;
    } else {
      // Update mascot to topic-specific character
      const mascotClass = this.getMascotClass(cartridgeData.id);
      mascotContainer.innerHTML = `
        <div class="mascot-character ${mascotClass}">
          <div class="mascot-head"></div>
          <div class="mascot-body"></div>
          <div class="mascot-arms"></div>
        </div>
      `;
    }

    // Update subtitle with description
    screenSubtitle.innerHTML = `
      <p class="pixel-text-sm" style="margin-bottom: 6px;">${cartridgeData.subtitle}</p>
      <p class="pixel-text-xs" style="opacity: 0.8; line-height: 1.5;">${cartridgeData.description}</p>
      ${cartridgeData.status === 'coming_soon' ?
        '<p class="pixel-text-xs" style="margin-top: 8px; color: var(--gb-dark);">COMING SOON</p>' :
        '<p class="pixel-text-xs" style="margin-top: 8px;">PRESS ENTER TO START</p>'
      }
    `;

    // Add fade-in animation
    const screenContent = document.getElementById('screenContent');
    if (screenContent) {
      screenContent.classList.add('pixel-fade-in');
      setTimeout(() => {
        screenContent.classList.remove('pixel-fade-in');
      }, 600);
    }
  },

  /**
   * Restore default Game Boy screen (T-Rex + BYTESIZED)
   */
  showDefaultScreen() {
    const screenTitle = document.getElementById('screenTitle');
    const mascotContainer = document.getElementById('mascotContainer');
    const screenSubtitle = document.getElementById('screenSubtitle');

    if (!screenTitle || !mascotContainer || !screenSubtitle) return;

    // Restore default title
    screenTitle.innerHTML = `
      <div class="pixel-text-lg">BYTESIZED</div>
    `;

    // Restore T-Rex mascot
    mascotContainer.innerHTML = `
      <div class="mascot-character mascot-default">
        <div class="mascot-head"></div>
        <div class="mascot-body"></div>
        <div class="mascot-arms"></div>
      </div>
    `;

    // Restore default instructions
    screenSubtitle.innerHTML = `
      <p class="pixel-text-sm">SELECT A CARTRIDGE</p>
      <p class="pixel-text-xs">◄ ► TO SCROLL  •  ENTER TO SELECT</p>
    `;
  },

  /**
   * Clear screen preview (deprecated - use showDefaultScreen instead)
   */
  clearPreview() {
    this.showDefaultScreen();
  },

  /**
   * Shake screen effect (for errors or blocked actions)
   */
  screenShake() {
    const screen = document.querySelector('.screen-glass');
    if (!screen) return;

    audioManager.playError();
    screen.classList.add('screen-shake');
    setTimeout(() => {
      screen.classList.remove('screen-shake');
    }, 500);
  },

  /**
   * Typewriter effect for text
   * @param {HTMLElement} element - Element to apply effect to
   * @param {string} text - Text to type
   * @param {number} speed - Typing speed in ms per character
   */
  typewriter(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;

    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };

    type();
  },

  /**
   * Stagger animation for multiple elements
   * @param {NodeList|Array} elements - Elements to animate
   * @param {string} animationClass - CSS class to add
   * @param {number} delay - Delay between each element in ms
   */
  staggerAnimation(elements, animationClass, delay = 100) {
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add(animationClass);
      }, index * delay);
    });
  },

  /**
   * Pulse animation for element
   * @param {HTMLElement} element - Element to pulse
   */
  pulse(element) {
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = 'pulse 0.5s ease-out';
    }, 10);
  },

  /**
   * LED power indicator blink
   */
  ledBlink() {
    const led = document.querySelector('.led-light');
    if (!led) return;

    led.style.animation = 'none';
    setTimeout(() => {
      led.style.animation = 'ledPulse 2s ease-in-out infinite';
    }, 10);
  },

  /**
   * Glitch effect on text
   * @param {HTMLElement} element - Element to glitch
   * @param {number} duration - Duration in ms
   */
  glitch(element, duration = 300) {
    const originalText = element.textContent;
    element.setAttribute('data-text', originalText);
    element.classList.add('glitch');

    setTimeout(() => {
      element.classList.remove('glitch');
      element.removeAttribute('data-text');
    }, duration);
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Animations;
}
