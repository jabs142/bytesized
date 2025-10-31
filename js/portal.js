/**
 * Portal - Main application logic for Game Boy cartridge portal
 */

class Portal {
  constructor() {
    this.cartridges = [];
    this.selectedCartridge = null;
    this.focusedIndex = -1; // Track keyboard focus, start unfocused
  }

  /**
   * Initialize the portal
   */
  async init() {
    try {
      // Scroll to top of page on load
      window.scrollTo(0, 0);

      // Load cartridge data
      await this.loadCartridges();

      // Render cartridges
      this.renderCartridges();

      // Setup event listeners
      this.setupEventListeners();

      // Play boot sequence
      Animations.playBootSequence();

      console.log('Portal initialized successfully');
    } catch (error) {
      console.error('Failed to initialize portal:', error);
      this.showError('Failed to load cartridges. Please refresh the page.');
    }
  }

  /**
   * Load cartridges from JSON file
   */
  async loadCartridges() {
    try {
      const response = await fetch('/data/cartridges.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.cartridges = await response.json();
    } catch (error) {
      console.error('Error loading cartridges:', error);
      throw error;
    }
  }

  /**
   * Render cartridges to the shelf
   */
  renderCartridges() {
    const grid = document.getElementById('cartridgeGrid');
    if (!grid) return;

    grid.innerHTML = '';

    this.cartridges.forEach((cartridge, index) => {
      const cartridgeElement = this.createCartridgeElement(cartridge, index);
      grid.appendChild(cartridgeElement);
    });

    // Stagger animation for cartridges appearing
    const cartridgeElements = grid.querySelectorAll('.cartridge');
    Animations.staggerAnimation(cartridgeElements, 'pixel-fade-in', 150);
  }

  /**
   * Create cartridge DOM element
   * @param {Object} cartridge - Cartridge data
   * @param {number} index - Cartridge index
   */
  createCartridgeElement(cartridge, index) {
    const div = document.createElement('div');
    div.className = `cartridge ${cartridge.status === 'coming_soon' ? 'coming-soon' : ''}`;
    div.dataset.id = cartridge.id;
    div.dataset.index = index;

    // Create connector pins (8 gold contacts)
    const pinsHTML = Array(8).fill('<div class="connector-pin"></div>').join('');

    div.innerHTML = `
      <div class="cartridge-body ${cartridge.pattern ? `pattern-${cartridge.pattern}` : ''}" style="--cartridge-glow: ${cartridge.color}50;">
        <div class="cartridge-notch"></div>
        <div class="cartridge-label" style="--label-color: ${cartridge.color};">
          ${cartridge.icon ? `<div class="cartridge-icon">${cartridge.icon}</div>` : ''}
          <div class="cartridge-title">${cartridge.title}</div>
          <div class="cartridge-subtitle">${cartridge.subtitle}</div>
          <div class="cartridge-description">${cartridge.description}</div>
          <div class="cartridge-label-text">${cartridge.labelText}</div>
        </div>
        <div class="cartridge-connector">
          <div class="connector-pins">
            ${pinsHTML}
          </div>
        </div>
        ${cartridge.status === 'coming_soon' ?
          '<div class="coming-soon-badge">COMING SOON</div>' :
          ''
        }
      </div>
    `;

    return div;
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Cartridge hover/click events
    const cartridgeGrid = document.getElementById('cartridgeGrid');
    if (cartridgeGrid) {
      cartridgeGrid.addEventListener('mouseenter', (e) => this.handleCartridgeHover(e), false);
      cartridgeGrid.addEventListener('mouseleave', (e) => this.handleCartridgeLeave(e), false);
      cartridgeGrid.addEventListener('click', (e) => this.handleCartridgeClick(e));
    }

    // Mute toggle
    const muteBtn = document.getElementById('muteToggle');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => this.toggleMute());
    }

    // D-pad interactions - left/right navigate, up/down are decorative
    const dpadLeft = document.querySelector('.dpad-left');
    const dpadRight = document.querySelector('.dpad-right');
    const dpadUp = document.querySelector('.dpad-up');
    const dpadDown = document.querySelector('.dpad-down');

    if (dpadLeft) {
      dpadLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentFocus = this.focusedIndex;

        // Wrap around: if at first item or unfocused, go to last
        if (this.focusedIndex <= 0) {
          this.focusedIndex = this.cartridges.length - 1;
        } else {
          this.focusedIndex--;
        }

        if (currentFocus !== this.focusedIndex) {
          this.updateFocusedCartridge();
        }
      });
    }

    if (dpadRight) {
      dpadRight.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentFocus = this.focusedIndex;

        // Wrap around: if at last item, go to first; if unfocused, go to first
        if (this.focusedIndex >= this.cartridges.length - 1 || this.focusedIndex === -1) {
          this.focusedIndex = 0;
        } else {
          this.focusedIndex++;
        }

        if (currentFocus !== this.focusedIndex) {
          this.updateFocusedCartridge();
        }
      });
    }

    // Up and down just play beep (decorative)
    if (dpadUp) {
      dpadUp.addEventListener('click', (e) => {
        e.stopPropagation();
        audioManager.playBeep(600, 0.05);
      });
    }

    if (dpadDown) {
      dpadDown.addEventListener('click', (e) => {
        e.stopPropagation();
        audioManager.playBeep(600, 0.05);
      });
    }

    // A button - select focused cartridge (same as Enter)
    const btnA = document.querySelector('.btn-a');
    if (btnA) {
      btnA.addEventListener('click', (e) => {
        e.stopPropagation();
        const cartridgeElements = document.querySelectorAll('.cartridge');
        const focusedElement = cartridgeElements[this.focusedIndex];

        if (focusedElement && this.focusedIndex >= 0) {
          focusedElement.click();
        }
      });
    }

    // B button - just decorative for now
    const btnB = document.querySelector('.btn-b');
    if (btnB) {
      btnB.addEventListener('click', (e) => {
        e.stopPropagation();
        audioManager.playBeep(400, 0.05);
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Handle cartridge hover
   */
  handleCartridgeHover(e) {
    const cartridge = e.target.closest('.cartridge');
    if (!cartridge) return;

    const index = parseInt(cartridge.dataset.index);
    const cartridgeData = this.cartridges[index];

    if (cartridgeData.status !== 'coming_soon') {
      audioManager.playHover();
    }

    cartridge.classList.add('previewing');
    Animations.showCartridgePreview(cartridgeData);
  }

  /**
   * Handle cartridge leave
   */
  handleCartridgeLeave(e) {
    const cartridge = e.target.closest('.cartridge');
    if (!cartridge) return;

    cartridge.classList.remove('previewing');

    // If there's a keyboard-focused cartridge, show its preview instead of clearing
    const focusedCartridge = document.querySelector('.cartridge.keyboard-focused');
    if (focusedCartridge) {
      const focusedData = this.cartridges[this.focusedIndex];
      if (focusedData) {
        Animations.showCartridgePreview(focusedData);
        return;
      }
    }

    // Otherwise, restore default screen
    Animations.showDefaultScreen();
  }

  /**
   * Handle cartridge click
   */
  handleCartridgeClick(e) {
    const cartridge = e.target.closest('.cartridge');
    if (!cartridge) return;

    const index = parseInt(cartridge.dataset.index);
    const cartridgeData = this.cartridges[index];

    if (cartridgeData.status === 'coming_soon') {
      // Show "coming soon" message
      Animations.screenShake();
      return;
    }

    // Select and load cartridge
    this.selectCartridge(cartridge, cartridgeData);
  }

  /**
   * Select and load a cartridge
   * @param {HTMLElement} cartridgeElement - DOM element of cartridge
   * @param {Object} cartridgeData - Cartridge data
   */
  selectCartridge(cartridgeElement, cartridgeData) {
    // Prevent multiple selections
    if (this.selectedCartridge) return;

    this.selectedCartridge = cartridgeData;

    // Mark as selected
    cartridgeElement.classList.add('selected');

    // Play selection sound
    audioManager.playSelect();

    // Animate insertion
    Animations.insertCartridge(cartridgeElement, () => {
      // Navigate to cartridge page
      this.loadCartridgePage(cartridgeData.url);
    });
  }

  /**
   * Load cartridge page
   * @param {string} url - Page URL to load
   */
  loadCartridgePage(url) {
    if (url && url !== '#') {
      window.location.href = url;
    }
  }

  /**
   * Toggle audio mute
   */
  toggleMute() {
    const isMuted = audioManager.toggleMute();
    const muteBtn = document.getElementById('muteToggle');

    if (muteBtn) {
      const icon = muteBtn.querySelector('.sound-icon');
      icon.textContent = isMuted ? '🔇' : '🔊';
    }

    if (!isMuted) {
      // Play test sound when unmuting
      audioManager.playSelect();
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboard(e) {
    // Press 'M' to toggle mute
    if (e.key === 'm' || e.key === 'M') {
      this.toggleMute();
      return;
    }

    // Arrow key navigation
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault(); // Prevent page scroll

      const currentFocus = this.focusedIndex;
      const gridColumns = window.innerWidth <= 768 ? 2 : 4; // Match CSS grid

      switch(e.key) {
        case 'ArrowLeft':
          this.focusedIndex = Math.max(0, this.focusedIndex - 1);
          break;
        case 'ArrowRight':
          this.focusedIndex = Math.min(this.cartridges.length - 1, this.focusedIndex + 1);
          break;
        case 'ArrowUp':
          this.focusedIndex = Math.max(0, this.focusedIndex - gridColumns);
          break;
        case 'ArrowDown':
          this.focusedIndex = Math.min(this.cartridges.length - 1, this.focusedIndex + gridColumns);
          break;
      }

      if (currentFocus !== this.focusedIndex) {
        this.updateFocusedCartridge();
      }
    }

    // Enter or Space to select focused cartridge
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const cartridgeElements = document.querySelectorAll('.cartridge');
      const focusedElement = cartridgeElements[this.focusedIndex];

      if (focusedElement) {
        focusedElement.click();
      }
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    const grid = document.getElementById('cartridgeGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="error-message pixel-text-sm" style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: var(--button-red);
        ">
          <p>${message}</p>
        </div>
      `;
    }
  }

  /**
   * Update visual focus for keyboard navigation
   */
  updateFocusedCartridge() {
    const cartridgeElements = document.querySelectorAll('.cartridge');

    // Remove focus from all cartridges
    cartridgeElements.forEach(el => el.classList.remove('keyboard-focused'));

    // Add focus to current cartridge
    const focusedElement = cartridgeElements[this.focusedIndex];
    if (focusedElement) {
      focusedElement.classList.add('keyboard-focused');

      // Get cartridge data and show preview
      const cartridgeData = this.cartridges[this.focusedIndex];
      if (cartridgeData && cartridgeData.status !== 'coming_soon') {
        audioManager.playHover();
      }
      Animations.showCartridgePreview(cartridgeData);

      // Don't scroll - keep focus on Game Boy screen
    }
  }
}

// Initialize portal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const portal = new Portal();
  portal.init();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Portal;
}
