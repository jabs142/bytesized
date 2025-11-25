/**
 * Data loading and preparation module
 * Handles fetching and processing COVID-19 data, map data, and timeline events
 */

/* global AbortController */

import { CONFIG } from './config.js';

// Fetch configuration
const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

export class DataLoader {
  constructor() {
    this.covidData = null;
    this.worldMap = null;
    this.timelineEvents = null;
    this.dataByDate = new Map();
    this.globalByDate = new Map();
  }

  /**
   * Load all required data files
   * @returns {Promise<Object>} Object containing all loaded data
   */
  async loadAll() {
    try {
      // console.log('Loading data files...');

      // Load all files in parallel
      const [covidData, worldMap, timelineEvents] = await Promise.all([
        this.loadJSON(CONFIG.data.covidData),
        this.loadJSON(CONFIG.data.worldMap),
        this.loadJSON(CONFIG.data.timelineEvents),
      ]);

      this.covidData = covidData;
      this.worldMap = worldMap;
      this.timelineEvents = timelineEvents;

      // Index data by date for fast lookups
      this.indexDataByDate();
      this.indexGlobalData();

      // console.log('✓ All data loaded successfully');
      // console.log(`  - Countries: ${Object.keys(this.covidData.countries).length}`);
      // console.log(
      //   `  - Date range: ${this.covidData.metadata.dateRange.start} to ${this.covidData.metadata.dateRange.end}`
      // );
      // console.log(`  - Timeline events: ${this.timelineEvents.length}`);

      return {
        covidData: this.covidData,
        worldMap: this.worldMap,
        timelineEvents: this.timelineEvents,
      };
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  /**
   * Fetch with timeout
   * @param {string} url - URL to fetch
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Response>}
   */
  async fetchWithTimeout(url, timeout = FETCH_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms for: ${url}`);
      }
      throw error;
    }
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Load JSON file with retry logic
   * @param {string} path - Path to JSON file
   * @returns {Promise<Object>}
   */
  async loadJSON(path) {
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // console.log(`Loading ${path} (attempt ${attempt}/${MAX_RETRIES})`);

        const response = await this.fetchWithTimeout(path);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // console.log(`✓ Successfully loaded ${path}`);
        return data;
      } catch (error) {
        lastError = error;
        console.warn(`Failed to load ${path} (attempt ${attempt}/${MAX_RETRIES}):`, error.message);

        // If not the last attempt, wait before retrying (exponential backoff)
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
          // console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to load ${path} after ${MAX_RETRIES} attempts. ` +
        `Last error: ${lastError?.message || 'Unknown error'}. ` +
        `Please check your internet connection and ensure the file exists.`
    );
  }

  /**
   * Index COVID data by date for fast lookups
   * Creates a map: date -> { countryCode: { cases, deaths, etc } }
   */
  indexDataByDate() {
    // console.log('Indexing data by date...');

    for (const [code, countryData] of Object.entries(this.covidData.countries)) {
      for (const entry of countryData.timeline) {
        if (!this.dataByDate.has(entry.date)) {
          this.dataByDate.set(entry.date, {});
        }

        this.dataByDate.get(entry.date)[code] = {
          totalCases: entry.totalCases,
          totalDeaths: entry.totalDeaths,
          casesPerMillion: entry.casesPerMillion,
          deathsPerMillion: entry.deathsPerMillion,
          totalVaccinations: entry.totalVaccinations,
          peopleVaccinated: entry.peopleVaccinated,
          peopleFullyVaccinated: entry.peopleFullyVaccinated,
          name: countryData.name,
          population: countryData.population,
        };
      }
    }

    // console.log(`✓ Indexed ${this.dataByDate.size} unique dates`);
  }

  /**
   * Index global aggregate data by date
   */
  indexGlobalData() {
    for (const entry of this.covidData.global) {
      this.globalByDate.set(entry.date, {
        totalCases: entry.totalCases,
        totalDeaths: entry.totalDeaths,
        totalVaccinations: entry.totalVaccinations,
        peopleFullyVaccinated: entry.peopleFullyVaccinated,
      });
    }
  }

  /**
   * Get data for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object} Country data for that date
   */
  getDataForDate(date) {
    return this.dataByDate.get(date) || {};
  }

  /**
   * Get global aggregates for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object} Global stats for that date
   */
  getGlobalForDate(date) {
    return (
      this.globalByDate.get(date) || {
        totalCases: 0,
        totalDeaths: 0,
        totalVaccinations: 0,
        peopleFullyVaccinated: 0,
      }
    );
  }

  /**
   * Get data for closest date (if exact date not available)
   * @param {string} targetDate - Target date in YYYY-MM-DD format
   * @returns {Object} Country data for closest available date
   */
  getClosestData(targetDate) {
    const target = new Date(targetDate);
    let closestDate = null;
    let minDiff = Infinity;

    for (const date of this.dataByDate.keys()) {
      const diff = Math.abs(new Date(date) - target);
      if (diff < minDiff) {
        minDiff = diff;
        closestDate = date;
      }
    }

    return this.getDataForDate(closestDate);
  }

  /**
   * Get global data for closest date (if exact date not available)
   * @param {string} targetDate - Target date in YYYY-MM-DD format
   * @returns {Object} Global stats for closest available date
   */
  getClosestGlobalData(targetDate) {
    const target = new Date(targetDate);
    let closestDate = null;
    let minDiff = Infinity;

    for (const date of this.globalByDate.keys()) {
      const diff = Math.abs(new Date(date) - target);
      if (diff < minDiff) {
        minDiff = diff;
        closestDate = date;
      }
    }

    return this.getGlobalForDate(closestDate);
  }

  /**
   * Get timeline events within a date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Array} Events within date range
   */
  getEventsInRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.timelineEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    });
  }

  /**
   * Get country data by ISO3 code
   * @param {string} code - ISO3 country code
   * @returns {Object} Country data
   */
  getCountryData(code) {
    return this.covidData.countries[code] || null;
  }

  /**
   * Get all countries sorted by total cases on a given date
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {number} limit - Number of top countries to return
   * @returns {Array} Array of {code, name, cases, deaths}
   */
  getTopCountries(date, limit = 10) {
    const data = this.getDataForDate(date);

    return Object.entries(data)
      .map(([code, stats]) => ({
        code,
        name: stats.name,
        cases: stats.totalCases,
        deaths: stats.totalDeaths,
        casesPerMillion: stats.casesPerMillion,
      }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, limit);
  }

  /**
   * Calculate percentage increase between two dates
   * @param {string} date1 - Earlier date
   * @param {string} date2 - Later date
   * @param {string} metric - 'totalCases' or 'totalDeaths'
   * @returns {number} Percentage increase
   */
  calculateGrowth(date1, date2, metric = 'totalCases') {
    const data1 = this.getGlobalForDate(date1);
    const data2 = this.getGlobalForDate(date2);

    if (data1[metric] === 0) {
      return 0;
    }

    return ((data2[metric] - data1[metric]) / data1[metric]) * 100;
  }

  /**
   * Format number for display
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  /**
   * Format date for display
   * @param {string} dateStr - Date string in YYYY-MM-DD format
   * @returns {string} Formatted date
   */
  static formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Format date for short display
   * @param {string} dateStr - Date string in YYYY-MM-DD format
   * @returns {string} Formatted date (e.g., "Jan 2020")
   */
  static formatDateShort(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  }
}
