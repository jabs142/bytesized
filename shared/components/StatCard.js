/**
 * StatCard Web Component
 * Reusable stat card with retro Game Boy aesthetic
 *
 * Usage:
 * <stat-card value="1,234" label="Total Symptoms"></stat-card>
 *
 * Attributes:
 * - value: The numeric value to display (can include commas)
 * - label: The label text below the value
 * - color: Optional color accent (defaults to --gb-dark)
 */
class StatCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const value = this.getAttribute('value') || '0';
    const label = this.getAttribute('label') || 'Stat';
    const color = this.getAttribute('color') || 'var(--gb-dark)';

    this.innerHTML = `
      <div class="stat-card">
        <div class="stat-value" style="color: ${color};">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    `;
  }

  // Allow dynamic updates
  static get observedAttributes() {
    return ['value', 'label', 'color'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.connectedCallback();
    }
  }
}

// Register the custom element
customElements.define('stat-card', StatCard);
