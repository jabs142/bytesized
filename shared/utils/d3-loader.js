/**
 * D3.js Lazy Loader
 * =================
 * Dynamically loads D3.js library only when needed to improve initial page load performance.
 *
 * Usage:
 *   import { loadD3, loadTopoJSON } from '/shared/utils/d3-loader.js';
 *
 *   const d3 = await loadD3();
 *   const topojson = await loadTopoJSON();
 *
 * Projects using this:
 * - Birth Control Side Effects (D3.js for network visualization)
 * - COVID Scrollytelling (D3.js + TopoJSON for world map)
 * - Pharmaceutical Innovation (D3.js for timeline & scatter plots)
 */

// Library versions and CDN URLs (with fallbacks)
const D3_VERSION = '7';
const D3_CDN_URLS = [
  `https://d3js.org/d3.v${D3_VERSION}.min.js`,
  `https://cdn.jsdelivr.net/npm/d3@${D3_VERSION}`,
  `https://unpkg.com/d3@${D3_VERSION}`,
];
const TOPOJSON_CDN_URLS = [
  'https://unpkg.com/topojson@3',
  'https://cdn.jsdelivr.net/npm/topojson@3',
];

// Timeout for script loading (10 seconds)
const SCRIPT_TIMEOUT = 10000;

// Cache loaded libraries
let d3Promise = null;
let topojsonPromise = null;

/**
 * Load a script with timeout and fallback CDN support
 * @param {string[]} urls - Array of CDN URLs to try
 * @param {string} globalName - Name of the global object (e.g., 'd3', 'topojson')
 * @param {string} libraryName - Human-readable library name for error messages
 * @returns {Promise<Object>} The loaded library object
 */
async function loadScriptWithFallback(urls, globalName, libraryName) {
  let lastError = null;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    // console.log(`Attempting to load ${libraryName} from: ${url}`);

    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        let timeoutId = null;
        let resolved = false;

        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          resolved = true;
        };

        script.onload = () => {
          if (resolved) {
            return;
          }
          cleanup();

          if (typeof window[globalName] !== 'undefined') {
            // console.log(`✓ Successfully loaded ${libraryName} from ${url}`);
            resolve(window[globalName]);
          } else {
            reject(new Error(`${libraryName} loaded but not available on window object`));
          }
        };

        script.onerror = () => {
          if (resolved) {
            return;
          }
          cleanup();
          reject(new Error(`Failed to load ${libraryName} from ${url}`));
        };

        // Set timeout
        timeoutId = setTimeout(() => {
          if (resolved) {
            return;
          }
          cleanup();
          script.remove();
          reject(new Error(`Timeout loading ${libraryName} from ${url}`));
        }, SCRIPT_TIMEOUT);

        document.head.appendChild(script);
      });

      // Success - return the loaded library
      return window[globalName];
    } catch (error) {
      lastError = error;
      console.warn(`Failed to load ${libraryName} from ${url}:`, error.message);

      // If not the last URL, continue to next fallback
      if (i < urls.length - 1) {
        // console.log(`Trying fallback CDN for ${libraryName}...`);
        continue;
      }
    }
  }

  // All CDNs failed
  throw new Error(
    `Failed to load ${libraryName} from all CDN sources. ` +
      `Last error: ${lastError?.message || 'Unknown error'}. ` +
      `Please check your internet connection.`
  );
}

/**
 * Load D3.js library dynamically
 * @returns {Promise<Object>} D3.js library object
 */
export async function loadD3() {
  // Return cached promise if already loading or loaded
  if (d3Promise) {
    return d3Promise;
  }

  // Check if D3 is already available globally (loaded via script tag)
  if (typeof window.d3 !== 'undefined') {
    return Promise.resolve(window.d3);
  }

  // Create new loading promise with fallback support
  d3Promise = loadScriptWithFallback(D3_CDN_URLS, 'd3', 'D3.js').catch((error) => {
    d3Promise = null; // Reset promise so retry is possible
    throw error;
  });

  return d3Promise;
}

/**
 * Load TopoJSON library dynamically
 * @returns {Promise<Object>} TopoJSON library object
 */
export async function loadTopoJSON() {
  // Return cached promise if already loading or loaded
  if (topojsonPromise) {
    return topojsonPromise;
  }

  // Check if TopoJSON is already available globally
  if (typeof window.topojson !== 'undefined') {
    return Promise.resolve(window.topojson);
  }

  // Create new loading promise with fallback support
  topojsonPromise = loadScriptWithFallback(TOPOJSON_CDN_URLS, 'topojson', 'TopoJSON').catch(
    (error) => {
      topojsonPromise = null; // Reset promise so retry is possible
      throw error;
    }
  );

  return topojsonPromise;
}

/**
 * Load both D3.js and TopoJSON together
 * Useful for map visualizations
 * @returns {Promise<{d3: Object, topojson: Object}>}
 */
export async function loadD3WithTopoJSON() {
  const [d3, topojson] = await Promise.all([loadD3(), loadTopoJSON()]);

  return { d3, topojson };
}

/**
 * Preload D3.js for faster subsequent usage
 * Call this early if you know D3 will be needed soon
 */
export function preloadD3() {
  if (!d3Promise) {
    loadD3().catch((err) => console.warn('D3 preload failed:', err));
  }
}

/**
 * Check if D3.js is loaded
 * @returns {boolean}
 */
export function isD3Loaded() {
  return typeof window.d3 !== 'undefined';
}

/**
 * Check if TopoJSON is loaded
 * @returns {boolean}
 */
export function isTopoJSONLoaded() {
  return typeof window.topojson !== 'undefined';
}
