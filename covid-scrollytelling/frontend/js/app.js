/**
 * Main application orchestrator
 * Initializes all modules and coordinates the visualization
 */

import { loadD3WithTopoJSON } from '../../../shared/utils/d3-loader.js';
import { DataLoader } from './dataLoader.js';
import { MapRenderer } from './map.js';
import { ScrollHandler } from './scrollHandler.js';
import { SCENES } from './config.js';

class COVIDStoryApp {
  constructor() {
    this.dataLoader = null;
    this.mapRenderer = null;
    this.scrollHandler = null;
    this.isReady = false;
  }

  /**
   * Initialize application
   */
  async init() {
    // console.log('COVID-19 Scrollytelling Visualization');
    // console.log('=====================================');

    try {
      // Show loading screen
      this.showLoading(true);

      // Step 0: Load D3.js and TopoJSON libraries
      // console.log('\n0. Loading visualization libraries...');
      this.updateLoadingMessage('Loading visualization libraries...');
      try {
        const { d3, topojson } = await loadD3WithTopoJSON();
        window.d3 = d3; // Make available globally
        window.topojson = topojson; // Make available globally
      } catch (error) {
        throw new Error(`Failed to load D3.js/TopoJSON libraries: ${error.message}`);
      }

      // Step 1: Load data
      // console.log('\n1. Loading data...');
      this.updateLoadingMessage('Loading COVID-19 data...');
      try {
        this.dataLoader = new DataLoader();
        await this.dataLoader.loadAll();
      } catch (error) {
        throw new Error(`Failed to load data files: ${error.message}`);
      }

      // Step 2: Initialize map
      // console.log('\n2. Initializing map...');
      this.updateLoadingMessage('Initializing world map...');
      try {
        this.mapRenderer = new MapRenderer('#map-container', this.dataLoader);
        this.mapRenderer.renderMap();
      } catch (error) {
        throw new Error(`Failed to initialize map: ${error.message}`);
      }

      // Step 3: Set initial state (first scene)
      // console.log('\n3. Setting initial scene...');
      this.updateLoadingMessage('Setting up timeline...');
      try {
        const firstScene = SCENES[0];
        this.mapRenderer.updateMap(firstScene.date, firstScene.showVaccinations);
        this.updateStats(firstScene.date);
      } catch (error) {
        throw new Error(`Failed to set initial scene: ${error.message}`);
      }

      // Step 4: Initialize scroll handler
      // console.log('\n4. Initializing scroll handler...');
      this.updateLoadingMessage('Preparing scrollytelling...');
      try {
        this.scrollHandler = new ScrollHandler(this.mapRenderer, this.dataLoader);
        this.scrollHandler.init();

        // Register callbacks
        this.scrollHandler.onSceneChange((scene, index) => {
          this.onSceneChange(scene, index);
        });
      } catch (error) {
        throw new Error(`Failed to initialize scroll handler: ${error.message}`);
      }

      // Step 5: Generate timeline markers
      // console.log('\n5. Generating timeline...');
      this.updateLoadingMessage('Generating timeline markers...');
      try {
        this.generateTimelineMarkers();
      } catch (error) {
        throw new Error(`Failed to generate timeline: ${error.message}`);
      }

      // Hide loading screen
      this.showLoading(false);

      this.isReady = true;
      // console.log('\n✓ Application ready!');
      // console.log('Scroll down to begin the journey...\n');

      // Optional: Show intro animation
      this.playIntroAnimation();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError(error.message, error);
    }
  }

  /**
   * Handle scene change
   * @param {Object} _scene - Scene object
   * @param {number} _index - Scene index
   */
  onSceneChange(_scene, _index) {
    // console.log(`Scene ${_index}: ${_scene.title} (${_scene.date})`);
    // Optional: Track analytics, update URL hash, etc.
    // window.location.hash = `scene-${_index}`;
  }

  /**
   * Update global statistics display
   * @param {string} date - Date in YYYY-MM-DD format
   */
  updateStats(date) {
    const globalData = this.dataLoader.getGlobalForDate(date);

    // Update counter elements
    const elements = {
      '#total-cases': globalData.totalCases,
      '#total-deaths': globalData.totalDeaths,
      '#total-vaccinations': globalData.totalVaccinations,
      '#current-date': DataLoader.formatDateShort(date),
    };

    for (const [selector, value] of Object.entries(elements)) {
      const element = document.querySelector(selector);
      if (element) {
        if (typeof value === 'number') {
          element.textContent = DataLoader.formatNumber(value);
          element.dataset.value = value;
        } else {
          element.textContent = value;
        }
      }
    }
  }

  /**
   * Generate clean monthly timeline markers
   */
  generateTimelineMarkers() {
    const timeline = document.querySelector('#timeline');
    if (!timeline) {
      console.warn('Timeline element not found');
      return;
    }

    timeline.innerHTML = `
      <div class="timeline-line">
        <div class="timeline-progress"></div>
      </div>
      <div class="timeline-markers"></div>
    `;

    const markersContainer = timeline.querySelector('.timeline-markers');

    // Generate monthly markers from Dec 2019 to Jan 2024
    const startDate = new Date('2019-12-01');
    const endDate = new Date('2024-01-01');
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const month = document.createElement('div');
      month.className = 'timeline-month';
      month.dataset.date = currentDate.toISOString().split('T')[0];

      // Format: "Jan 2020"
      const monthLabel = currentDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      month.innerHTML = `
        <div class="timeline-month-marker"></div>
        <div class="timeline-month-label">${monthLabel}</div>
      `;

      markersContainer.appendChild(month);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  /**
   * Show/hide loading screen
   * @param {boolean} show - Whether to show loading screen
   */
  showLoading(show) {
    const loader = document.querySelector('#loading-screen');
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Update loading message
   * @param {string} message - Loading status message
   */
  updateLoadingMessage(message) {
    const loadingText = document.querySelector('#loading-screen p');
    if (loadingText) {
      loadingText.textContent = message;
    }
  }

  /**
   * Show error message with retry button
   * @param {string} message - Error message
   * @param {Error} error - Original error object (for debugging)
   */
  showError(message, error = null) {
    // Hide loading screen first
    this.showLoading(false);

    // Create error overlay
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-overlay';
    errorDiv.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>Failed to Load Visualization</h2>
        <p class="error-message">${message}</p>
        <div class="error-actions">
          <button class="retry-button" onclick="window.location.reload()">
            <span>🔄</span> Retry
          </button>
          <button class="details-button" onclick="this.nextElementSibling.style.display='block'; this.style.display='none'">
            Show Details
          </button>
          <div class="error-details" style="display:none">
            <pre>${error ? error.stack || error.toString() : 'No additional details available'}</pre>
          </div>
        </div>
        <p class="error-help">
          If this problem persists:
          <br>• Check your internet connection
          <br>• Try a different browser
          <br>• Check the browser console for more details
        </p>
      </div>
    `;

    document.body.appendChild(errorDiv);

    // Log detailed error for debugging
    if (error) {
      console.error('Detailed error information:', {
        message: error.message,
        stack: error.stack,
        error: error,
      });
    }
  }

  /**
   * Play intro animation (optional)
   */
  playIntroAnimation() {
    // Fade in the first scroll section
    const firstSection = document.querySelector('.scroll-section:first-child');
    if (firstSection) {
      firstSection.classList.add('fade-in');
    }

    // Remove hint after first scroll
    let hasScrolled = false;
    window.addEventListener('scroll', () => {
      if (!hasScrolled && window.scrollY > 100) {
        scrollHint.style.opacity = '0';
        setTimeout(() => scrollHint.remove(), 500);
        hasScrolled = true;
      }
    });
  }

  /**
   * Cleanup (if needed)
   */
  destroy() {
    if (this.scrollHandler) {
      this.scrollHandler.destroy();
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.covidApp = new COVIDStoryApp();
    window.covidApp.init();
  });
} else {
  window.covidApp = new COVIDStoryApp();
  window.covidApp.init();
}

// Handle page visibility changes (pause/resume animations if needed)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // console.log('Page hidden');
  } else {
    // console.log('Page visible');
    // Optional: Resume any paused animations
  }
});

// Export for debugging
export { COVIDStoryApp };
