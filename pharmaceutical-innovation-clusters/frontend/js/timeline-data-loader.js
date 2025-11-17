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
export async function loadTimelineSummary() {
  if (summaryData) {
    return summaryData;
  }

  const response = await fetch('data/therapeutic_timeline_summary.json');
  if (!response.ok) {
    throw new Error(`Failed to load timeline summary: ${response.statusText}`);
  }

  summaryData = await response.json();
  return summaryData;
}

/**
 * Load data for a specific decade
 * @param {number} decade - Decade year (e.g., 1990)
 * @returns {Promise<Object>} Decade data with approvals
 */
export async function loadDecadeData(decade) {
  // Check cache first
  if (decadeCache.has(decade)) {
    return decadeCache.get(decade);
  }

  // Load from file
  const response = await fetch(`data/decades/${decade}s.json`);
  if (!response.ok) {
    throw new Error(`Failed to load decade ${decade}s: ${response.statusText}`);
  }

  const data = await response.json();
  decadeCache.set(decade, data);

  return data;
}

/**
 * Preload adjacent decades for smooth navigation
 * @param {number} currentDecade - Current decade being viewed
 */
export async function preloadAdjacentDecades(currentDecade) {
  const prevDecade = currentDecade - 10;
  const nextDecade = currentDecade + 10;

  // Preload in background (don't await)
  if (!decadeCache.has(prevDecade)) {
    loadDecadeData(prevDecade).catch(() => {}); // Ignore errors for preloading
  }
  if (!decadeCache.has(nextDecade)) {
    loadDecadeData(nextDecade).catch(() => {}); // Ignore errors for preloading
  }
}

/**
 * Clear the decade cache (useful for memory management)
 */
export function clearDecadeCache() {
  decadeCache.clear();
}

/**
 * Get cache statistics
 * @returns {Object} Cache info
 */
export function getCacheInfo() {
  return {
    cachedDecades: Array.from(decadeCache.keys()).sort(),
    cacheSize: decadeCache.size,
  };
}
