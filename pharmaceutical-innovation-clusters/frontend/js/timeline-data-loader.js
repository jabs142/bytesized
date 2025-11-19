/**
 * Lazy Loader for Therapeutic Timeline Data
 * Loads decade data on-demand as user navigates
 */

// Cache for loaded decade data
const decadeCache = new Map();
let summaryData = null;

/**
 * Load timeline summary (metadata only)
 * @returns {Promise<Object>} Summary data with decade list
 */
async function loadTimelineSummary() {
  if (summaryData) {
    return summaryData;
  }

  try {
    const response = await fetch('data/therapeutic_timeline_summary.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    summaryData = await response.json();
    // Timeline summary loaded successfully
    return summaryData;
  } catch (error) {
    console.error('Failed to load timeline summary:', error.message);
    throw error;
  }
}

/**
 * Load data for a specific decade
 * @param {number} decade - Decade year (e.g., 1990)
 * @returns {Promise<Object>} Decade data with approvals
 */
async function loadDecadeData(decade) {
  // Check cache first
  if (decadeCache.has(decade)) {
    return decadeCache.get(decade);
  }

  try {
    // Load from file
    const response = await fetch(`data/decades/${decade}s.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    decadeCache.set(decade, data);
    // Decade data loaded successfully

    return data;
  } catch (error) {
    console.error(`Failed to load decade ${decade}s:`, error.message);
    throw error;
  }
}

/**
 * Preload adjacent decades for smooth navigation
 * @param {number} currentDecade - Current decade being viewed
 */
async function preloadAdjacentDecades(currentDecade) {
  const prevDecade = currentDecade - 10;
  const nextDecade = currentDecade + 10;

  // Preload in background (don't await)
  if (!decadeCache.has(prevDecade)) {
    loadDecadeData(prevDecade).catch((error) => {
      console.warn(`Preload failed for decade ${prevDecade}s:`, error.message);
    });
  }
  if (!decadeCache.has(nextDecade)) {
    loadDecadeData(nextDecade).catch((error) => {
      console.warn(`Preload failed for decade ${nextDecade}s:`, error.message);
    });
  }
}

/**
 * Clear the decade cache (useful for memory management)
 */
function clearDecadeCache() {
  decadeCache.clear();
}

/**
 * Get cache statistics
 * @returns {Object} Cache info
 */
function getCacheInfo() {
  return {
    cachedDecades: Array.from(decadeCache.keys()).sort(),
    cacheSize: decadeCache.size,
  };
}

// Explicitly expose functions as global for use by other scripts
window.loadTimelineSummary = loadTimelineSummary;
window.loadDecadeData = loadDecadeData;
window.preloadAdjacentDecades = preloadAdjacentDecades;
window.clearDecadeCache = clearDecadeCache;
window.getCacheInfo = getCacheInfo;
