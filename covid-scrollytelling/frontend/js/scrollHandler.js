/**
 * Scroll handling module using Scrollama.js
 * Manages scroll-triggered scene changes and map updates
 */

import { SCENES } from './config.js';

export class ScrollHandler {
  constructor(mapRenderer, dataLoader) {
    this.mapRenderer = mapRenderer;
    this.dataLoader = dataLoader;
    this.scroller = null;
    this.currentSceneIndex = 0;
    this.progressScroller = null;

    // Callbacks
    this.onSceneChangeCallback = null;
    this.onProgressCallback = null;
  }

  /**
   * Initialize Scrollama
   */
  init() {
    // Main step-based scroller with progress tracking
    this.scroller = scrollama();

    this.scroller
      .setup({
        step: '.scroll-section',
        offset: 0.5, // Trigger when section reaches middle of viewport
        progress: true, // Enable progress tracking for smooth interpolation
        debug: false, // Set to true to see trigger lines
      })
      .onStepEnter((response) => {
        this.handleStepEnter(response);
      })
      .onStepExit((response) => {
        this.handleStepExit(response);
      })
      .onStepProgress((response) => {
        // Smooth interpolation as you scroll through each section
        this.handleStepProgress(response);
      });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.scroller.resize();
      this.mapRenderer.resize();
    });

    console.log('✓ Scroll handler initialized with progress tracking');
  }

  /**
   * Handle step enter event
   * @param {Object} response - Scrollama response object
   */
  handleStepEnter(response) {
    const { index, direction } = response;

    console.log(`Scene ${index} entered (${direction})`);

    this.currentSceneIndex = index;
    const scene = SCENES[index];

    if (!scene) {
      console.warn(`No scene found for index ${index}`);
      return;
    }

    // Update narrative card content
    this.updateNarrativeCard(scene);

    // Update map with scene data
    this.mapRenderer.updateMap(scene.date, scene.showVaccinations);

    // Update global stats
    this.updateStats(scene.date);

    // Update timeline marker
    this.updateTimelineMarker(index);

    // Don't show event cards - narrative card handles all content now
    // this.showRelevantEvents(scene);

    // Call callback if set
    if (this.onSceneChangeCallback) {
      this.onSceneChangeCallback(scene, index);
    }
  }

  /**
   * Handle step exit event
   * @param {Object} response - Scrollama response object
   */
  handleStepExit(response) {
    const { index, direction } = response;
    // Optional: Add any exit animations here
  }

  /**
   * Handle step progress (smooth interpolation between scenes)
   * @param {Object} response - Scrollama response object with progress (0-1)
   */
  handleStepProgress(response) {
    const { index, progress } = response;

    // Only interpolate if we have a next scene
    if (index < SCENES.length - 1) {
      const currentScene = SCENES[index];
      const nextScene = SCENES[index + 1];

      // Interpolate between current and next scene dates
      const currentDate = new Date(currentScene.date);
      const nextDate = new Date(nextScene.date);

      // Calculate interpolated date
      const timeDiff = nextDate - currentDate;
      const interpolatedTime = currentDate.getTime() + (timeDiff * progress);
      const interpolatedDate = new Date(interpolatedTime);
      const dateString = interpolatedDate.toISOString().split('T')[0];

      // Get closest available data for interpolated date
      const interpolatedData = this.dataLoader.getClosestData(dateString);

      // Update map smoothly (no transition since we're updating frequently)
      this.mapRenderer.updateMapSmooth(dateString, currentScene.showVaccinations || nextScene.showVaccinations);

      // Update stats smoothly INCLUDING the date display
      const globalData = this.dataLoader.getGlobalForDate(dateString) ||
                        this.dataLoader.getClosestData(dateString);

      if (globalData) {
        // Update counters and date without animation (too frequent)
        this.updateStatsInstant(dateString);
      }

      // Only update progress bar during scroll, not month highlights
      // Month highlights update on scene enter to stay synced with narrative
      this.updateTimelineProgress(interpolatedDate);
    }
  }

  /**
   * Update timeline month highlights based on current date
   * @param {Date} currentDate - Current interpolated date
   */
  updateTimelineMonthHighlights(currentDate) {
    const monthMarkers = document.querySelectorAll('.timeline-month');
    monthMarkers.forEach((marker) => {
      const markerDate = new Date(marker.dataset.date);
      if (markerDate <= currentDate) {
        marker.classList.add('active');
      } else {
        marker.classList.remove('active');
      }
    });
  }

  /**
   * Update narrative card content
   * @param {Object} scene - Scene object
   */
  updateNarrativeCard(scene) {
    const subtitleEl = document.querySelector('#narrative-subtitle');
    const textEl = document.querySelector('#narrative-text');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (!subtitleEl || !textEl) return;

    // Fade out
    subtitleEl.style.opacity = '0';
    textEl.style.opacity = '0';

    // Hide scroll indicator after first scene
    if (scrollIndicator && scene.index > 0) {
      scrollIndicator.style.display = 'none';
    }

    // Update content after fade
    setTimeout(() => {
      subtitleEl.textContent = scene.subtitle;
      textEl.textContent = scene.narrative.trim();

      // Fade in
      subtitleEl.style.opacity = '1';
      textEl.style.opacity = '1';
    }, 300);
  }

  /**
   * Update global statistics display
   * @param {string} date - Date in YYYY-MM-DD format
   */
  updateStats(date) {
    const globalData = this.dataLoader.getGlobalForDate(date);

    // Animate counters
    this.animateCounter('#total-cases', globalData.totalCases);
    this.animateCounter('#total-deaths', globalData.totalDeaths);
  }

  /**
   * Update stats instantly without animation (for progress interpolation)
   * @param {string} date - Date in YYYY-MM-DD format
   */
  updateStatsInstant(date) {
    const globalData = this.dataLoader.getGlobalForDate(date);

    if (!globalData) return;

    // Update counters instantly
    const casesEl = document.querySelector('#total-cases');
    const deathsEl = document.querySelector('#total-deaths');

    if (casesEl) {
      casesEl.textContent = DataLoader.formatNumber(globalData.totalCases);
      casesEl.dataset.value = globalData.totalCases;
    }
    if (deathsEl) {
      deathsEl.textContent = DataLoader.formatNumber(globalData.totalDeaths);
      deathsEl.dataset.value = globalData.totalDeaths;
    }
  }

  /**
   * Animate counter from current value to target
   * @param {string} selector - Element selector
   * @param {number} target - Target value
   */
  animateCounter(selector, target) {
    const element = document.querySelector(selector);
    if (!element) return;

    const current = parseInt(element.dataset.value || 0);

    // Use D3 transition for smooth animation
    d3.select(element)
      .datum(current)
      .transition()
      .duration(1000)
      .tween('text', function () {
        const i = d3.interpolateNumber(current, target);
        return function (t) {
          this.textContent = DataLoader.formatNumber(Math.round(i(t)));
          this.dataset.value = Math.round(i(t));
        };
      });
  }

  /**
   * Update timeline marker position based on current scene
   * @param {number} index - Scene index
   */
  updateTimelineMarker(index) {
    const currentScene = SCENES[index];
    const currentDate = new Date(currentScene.date);

    // Update monthly markers based on current date
    this.updateTimelineMonthHighlights(currentDate);

    // Update progress bar based on current date position in timeline
    this.updateTimelineProgress(currentDate);
  }

  /**
   * Update timeline progress bar to match active month position
   * @param {Date} currentDate - Current date
   */
  updateTimelineProgress(currentDate) {
    const progressBar = document.querySelector('.timeline-progress');
    const timelineContainer = document.querySelector('#timeline');

    if (!progressBar || !timelineContainer) return;

    // Find the currently active month marker
    const activeMonth = document.querySelector('.timeline-month.active');

    if (activeMonth) {
      // Use actual DOM position for perfect alignment
      const monthTop = activeMonth.offsetTop;
      const containerHeight = timelineContainer.scrollHeight;
      const progress = (monthTop / containerHeight) * 100;

      progressBar.style.height = `${Math.min(Math.max(progress, 0), 100)}%`;
    } else {
      // Fallback: calculate based on date if no active month found
      const startDate = new Date('2019-12-01');
      const endDate = new Date('2024-01-01');
      const totalTime = endDate - startDate;
      const currentTime = currentDate - startDate;
      const progress = (currentTime / totalTime) * 100;

      progressBar.style.height = `${Math.min(Math.max(progress, 0), 100)}%`;
    }
  }

  /**
   * Show relevant timeline events for current scene
   * @param {Object} scene - Current scene object
   */
  showRelevantEvents(scene) {
    // Get events within ±30 days of scene date
    const sceneDate = new Date(scene.date);
    const startDate = new Date(sceneDate);
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date(sceneDate);
    endDate.setDate(endDate.getDate() + 30);

    const events = this.dataLoader.getEventsInRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Display events (if any)
    const eventContainer = document.querySelector('#event-cards-container');
    if (eventContainer && events.length > 0) {
      // Clear existing events
      eventContainer.innerHTML = '';

      events.forEach((event, i) => {
        setTimeout(() => {
          this.createEventCard(event, eventContainer);
        }, i * 200); // Stagger animations
      });
    }
  }

  /**
   * Create event card element
   * @param {Object} event - Event data
   * @param {HTMLElement} container - Container element
   */
  createEventCard(event, container) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-icon">${event.icon}</div>
      <div class="event-content">
        <div class="event-date">${this.dataLoader.constructor.formatDate(event.date)}</div>
        <div class="event-title">${event.title}</div>
        <div class="event-description">${event.description}</div>
      </div>
    `;

    container.appendChild(card);

    // Trigger animation
    setTimeout(() => {
      card.classList.add('visible');
    }, 50);

    // Auto-hide after 8 seconds
    setTimeout(() => {
      card.classList.remove('visible');
      setTimeout(() => {
        card.remove();
      }, 600);
    }, 8000);
  }

  /**
   * Register scene change callback
   * @param {Function} callback - Callback function
   */
  onSceneChange(callback) {
    this.onSceneChangeCallback = callback;
  }

  /**
   * Get current scene
   * @returns {Object} Current scene object
   */
  getCurrentScene() {
    return SCENES[this.currentSceneIndex];
  }

  /**
   * Jump to specific scene (programmatically)
   * @param {number} index - Scene index
   */
  goToScene(index) {
    if (index < 0 || index >= SCENES.length) {
      console.warn(`Invalid scene index: ${index}`);
      return;
    }

    const section = document.querySelectorAll('.scroll-section')[index];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Destroy scroller (cleanup)
   */
  destroy() {
    if (this.scroller) {
      this.scroller.destroy();
    }
  }
}

// Reference to DataLoader for formatting (imported in app.js)
import { DataLoader } from './dataLoader.js';
