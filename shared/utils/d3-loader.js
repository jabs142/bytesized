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

// Library versions
const D3_VERSION = '7';
const D3_CDN_URL = `https://d3js.org/d3.v${D3_VERSION}.min.js`;
const TOPOJSON_CDN_URL = 'https://unpkg.com/topojson@3';

// Cache loaded libraries
let d3Promise = null;
let topojsonPromise = null;

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

  // Create new loading promise
  d3Promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = D3_CDN_URL;
    script.async = true;

    script.onload = () => {
      if (typeof window.d3 !== 'undefined') {
        resolve(window.d3);
      } else {
        reject(new Error('D3.js loaded but not available on window object'));
      }
    };

    script.onerror = () => {
      d3Promise = null; // Reset promise so retry is possible
      reject(new Error('Failed to load D3.js from CDN'));
    };

    document.head.appendChild(script);
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

  // Create new loading promise
  topojsonPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TOPOJSON_CDN_URL;
    script.async = true;

    script.onload = () => {
      if (typeof window.topojson !== 'undefined') {
        resolve(window.topojson);
      } else {
        reject(new Error('TopoJSON loaded but not available on window object'));
      }
    };

    script.onerror = () => {
      topojsonPromise = null; // Reset promise so retry is possible
      reject(new Error('Failed to load TopoJSON from CDN'));
    };

    document.head.appendChild(script);
  });

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
