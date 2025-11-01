/**
 * EjectButton Web Component
 * Reusable "eject cartridge" button to return to homepage
 *
 * Usage:
 * <eject-button></eject-button>
 * <eject-button href="/custom-path"></eject-button>
 * <eject-button theme="dark"></eject-button>
 *
 * Attributes:
 * - href: URL to navigate to (defaults to "/")
 * - theme: "light" (default) or "dark" for dark theme variant
 */
class EjectButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const href = this.getAttribute('href') || '/';
    const theme = this.getAttribute('theme') || 'light';
    const buttonClass = theme === 'dark' ? 'eject-button eject-button-dark' : 'eject-button';

    this.innerHTML = `
      <a href="${href}" class="${buttonClass}">
        <span class="eject-icon">◄</span>
        <span class="eject-text">EJECT</span>
      </a>
    `;
  }
}

// Register the custom element
customElements.define('eject-button', EjectButton);
