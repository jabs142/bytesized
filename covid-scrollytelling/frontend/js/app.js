/**
 * Main application orchestrator
 * Initializes all modules and coordinates the visualization
 */

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
    console.log('COVID-19 Scrollytelling Visualization');
    console.log('=====================================');

    try {
      // Show loading screen
      this.showLoading(true);

      // Step 1: Load data
      console.log('\n1. Loading data...');
      this.dataLoader = new DataLoader();
      await this.dataLoader.loadAll();

      // Step 2: Initialize map
      console.log('\n2. Initializing map...');
      this.mapRenderer = new MapRenderer('#map-container', this.dataLoader);
      this.mapRenderer.renderMap();

      // Step 3: Set initial state (first scene)
      console.log('\n3. Setting initial scene...');
      const firstScene = SCENES[0];
      this.mapRenderer.updateMap(firstScene.date, firstScene.showVaccinations);
      this.updateStats(firstScene.date);

      // Step 4: Initialize scroll handler
      console.log('\n4. Initializing scroll handler...');
      this.scrollHandler = new ScrollHandler(this.mapRenderer, this.dataLoader);
      this.scrollHandler.init();

      // Register callbacks
      this.scrollHandler.onSceneChange((scene, index) => {
        this.onSceneChange(scene, index);
      });

      // Step 5: Generate timeline markers
      console.log('\n5. Generating timeline...');
      this.generateTimelineMarkers();

      // Hide loading screen
      this.showLoading(false);

      this.isReady = true;
      console.log('\n✓ Application ready!');
      console.log('Scroll down to begin the journey...\n');

      // Optional: Show intro animation
      this.playIntroAnimation();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError(error.message);
    }
  }

  /**
   * Handle scene change
   * @param {Object} scene - Scene object
   * @param {number} index - Scene index
   */
  onSceneChange(scene, index) {
    console.log(`Scene ${index}: ${scene.title} (${scene.date})`);

    // Optional: Track analytics, update URL hash, etc.
    // window.location.hash = `scene-${index}`;
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

    let monthCount = 0;

    while (currentDate <= endDate) {
      const month = document.createElement('div');
      month.className = 'timeline-month';
      month.dataset.date = currentDate.toISOString().split('T')[0];

      // Format: "Jan 2020"
      const monthLabel = currentDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });

      month.innerHTML = `
        <div class="timeline-month-marker"></div>
        <div class="timeline-month-label">${monthLabel}</div>
      `;

      markersContainer.appendChild(month);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      monthCount++;
    }

    console.log(`✓ Generated ${monthCount} monthly timeline markers`);
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
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <h2>Error Loading Visualization</h2>
      <p>${message}</p>
      <p>Please refresh the page to try again.</p>
    `;

    document.body.appendChild(errorDiv);
    this.showLoading(false);
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
    console.log('Page hidden');
  } else {
    console.log('Page visible');
    // Optional: Resume any paused animations
  }
});

// Export for debugging
export { COVIDStoryApp };
