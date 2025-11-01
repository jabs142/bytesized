/**
 * Data Loader Utility
 * Standardized data loading with error handling
 */

/**
 * Load JSON data from a file
 * @param {string} url - Path to JSON file
 * @param {Object} options - Loading options
 * @param {string} options.errorMessage - Custom error message
 * @param {HTMLElement} options.errorContainer - DOM element to show error in
 * @returns {Promise<any>} Parsed JSON data
 */
export async function loadJSON(url, options = {}) {
  const {
    errorMessage = 'Failed to load data',
    errorContainer = null
  } = options;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`Error loading ${url}:`, error);

    // If error container provided, display error there
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="error-message">
          <h3>⚠️ ${errorMessage}</h3>
          <p>${error.message}</p>
        </div>
      `;
    }

    throw error;
  }
}

/**
 * Load multiple JSON files in parallel
 * @param {Object} files - Object mapping keys to file URLs
 * @returns {Promise<Object>} Object with same keys, values are loaded data
 *
 * Example:
 *   const data = await loadMultipleJSON({
 *     stats: 'data/stats.json',
 *     symptoms: 'data/symptoms.json'
 *   });
 *   // Returns: { stats: {...}, symptoms: [...] }
 */
export async function loadMultipleJSON(files) {
  const entries = Object.entries(files);
  const promises = entries.map(([key, url]) =>
    loadJSON(url).then(data => [key, data])
  );

  const results = await Promise.all(promises);
  return Object.fromEntries(results);
}

/**
 * Show loading state while data loads
 * @param {HTMLElement} container - Container to show loading state in
 * @param {Function} loadFn - Async function that loads data
 * @returns {Promise<any>} Result from loadFn
 */
export async function withLoading(container, loadFn) {
  if (!container) {
    return await loadFn();
  }

  // Show loading state
  const originalContent = container.innerHTML;
  container.innerHTML = `
    <div class="loading-state">
      <div class="pixel-text-sm">LOADING...</div>
    </div>
  `;

  try {
    const result = await loadFn();
    return result;
  } catch (error) {
    // Restore original content on error
    container.innerHTML = originalContent;
    throw error;
  }
}
