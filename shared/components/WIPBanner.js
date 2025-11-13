/**
 * WIPBanner Web Component
 * Displays a work-in-progress banner at the top of the page
 * Automatically detects if current page should show banner based on cartridges.json
 *
 * Usage:
 * <wip-banner></wip-banner>
 * <wip-banner dismissible="true"></wip-banner>
 *
 * Attributes:
 * - dismissible: "true" to allow closing the banner (defaults to "false")
 */
class WIPBanner extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      // Check if this page should show WIP banner
      const shouldShowBanner = await this.checkIfWIP();

      if (!shouldShowBanner) {
        return; // Don't render banner
      }

      const dismissible = this.getAttribute('dismissible') === 'true';
      const bannerId = `wip-banner-${Math.random().toString(36).substr(2, 9)}`;

      // Check if banner was dismissed (if dismissible)
      if (dismissible && localStorage.getItem(bannerId) === 'dismissed') {
        return;
      }

      this.innerHTML = `
        <div class="wip-banner" id="${bannerId}">
          <div class="wip-banner-content">
            <span class="wip-banner-icon">🚧</span>
            <div class="wip-banner-text">
              <strong>Work in Progress</strong>
              <span class="wip-banner-message">This page may contain bugs or incomplete features</span>
            </div>
            ${dismissible ? '<button class="wip-banner-close" onclick="this.closest(\'.wip-banner\').remove(); localStorage.setItem(\'' + bannerId + "', 'dismissed');\">✕</button>" : ''}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('WIPBanner: Failed to check WIP status', error);
      // Fail silently - don't show banner if we can't determine status
    }
  }

  /**
   * Check if current page belongs to a WIP cartridge
   * @returns {Promise<boolean>} True if page should show WIP banner
   */
  async checkIfWIP() {
    try {
      // Fetch cartridges data
      const response = await fetch('/data/cartridges.json');
      if (!response.ok) {
        return false;
      }

      const cartridges = await response.json();
      const currentPath = window.location.pathname;

      // Find matching cartridge by comparing paths
      for (const cartridge of cartridges) {
        // Extract project directory from cartridge URL
        // e.g., "./privilege/frontend/index.html" -> "privilege"
        const urlMatch = cartridge.url.match(/\.\/([^/]+)\//);
        if (urlMatch) {
          const projectDir = urlMatch[1];

          // Check if current path includes this project directory
          if (currentPath.includes(`/${projectDir}/`)) {
            return cartridge.wip === true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('WIPBanner: Error checking WIP status', error);
      return false;
    }
  }
}

// Register the custom element
customElements.define('wip-banner', WIPBanner);
