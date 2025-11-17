/**
 * D3.js Helper Utilities
 * =======================
 * Reusable D3.js components and utilities extracted from common patterns
 * across Birth Control, COVID, and Pharmaceutical projects.
 *
 * Usage:
 *   import { createTooltip, NetworkGraph, TimelineChart } from '/shared/utils/d3-helpers.js';
 *
 * Dependencies:
 *   - D3.js v7 must be loaded (use d3-loader.js)
 */

/**
 * Create a reusable tooltip element
 * @param {string} id - Unique ID for the tooltip
 * @param {Object} styles - Optional custom styles
 * @returns {HTMLElement} Tooltip element
 */
export function createTooltip(id = 'tooltip', styles = {}) {
  // Remove existing tooltip if present
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  const tooltip = document.createElement('div');
  tooltip.id = id;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-hidden', 'true');

  // Default styles
  const defaultStyles = {
    position: 'absolute',
    padding: '0.5rem',
    background: 'var(--bg-card, #f5f5f5)',
    color: 'var(--text-primary, #2a2a2a)',
    border: '2px solid var(--gb-darkest, #0f380f)',
    borderRadius: '2px',
    boxShadow: 'var(--shadow-md, 4px 4px 0 rgba(0,0,0,0.15))',
    pointerEvents: 'none',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.75rem',
    zIndex: '100',
    display: 'none',
    maxWidth: '300px',
  };

  Object.assign(tooltip.style, defaultStyles, styles);
  document.body.appendChild(tooltip);

  return tooltip;
}

/**
 * Tooltip controller with show/hide/move methods
 * @param {HTMLElement} tooltip - Tooltip element
 * @returns {Object} Controller methods
 */
export function createTooltipController(tooltip) {
  return {
    show(content, x, y) {
      tooltip.innerHTML = content;
      tooltip.style.display = 'block';
      tooltip.style.left = x + 10 + 'px';
      tooltip.style.top = y - 10 + 'px';
      tooltip.setAttribute('aria-hidden', 'false');
    },

    hide() {
      tooltip.style.display = 'none';
      tooltip.setAttribute('aria-hidden', 'true');
    },

    move(x, y) {
      tooltip.style.left = x + 10 + 'px';
      tooltip.style.top = y - 10 + 'px';
    },
  };
}

/**
 * Add zoom and pan behavior to an SVG
 * @param {d3.Selection} svg - D3 selection of SVG element
 * @param {d3.Selection} g - D3 selection of group element to transform
 * @param {Object} options - Zoom configuration
 * @returns {d3.ZoomBehavior} Zoom behavior instance
 */
export function addZoomBehavior(svg, g, options = {}) {
  const { scaleExtent = [0.5, 3], onZoom = null } = options;

  const zoom = d3
    .zoom()
    .scaleExtent(scaleExtent)
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
      if (onZoom) {
        onZoom(event);
      }
    });

  svg.call(zoom);

  return zoom;
}

/**
 * Format numbers for display
 * @param {number} value - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number
 */
export function formatNumber(value, options = {}) {
  const { decimals = 0, suffix = '', prefix = '', locale = 'en-US' } = options;

  if (value === null || value === undefined) {
    return 'N/A';
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return prefix + formatted + suffix;
}

/**
 * Format percentages
 * @param {number} value - Value between 0-100 or 0-1
 * @param {Object} options - Formatting options
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, options = {}) {
  const {
    decimals = 1,
    isDecimal = false, // true if value is 0-1, false if 0-100
  } = options;

  const percentage = isDecimal ? value * 100 : value;

  return formatNumber(percentage, { decimals, suffix: '%' });
}

/**
 * Create color scale for data visualization
 * @param {Array} domain - Data domain [min, max]
 * @param {Array} range - Color range
 * @param {string} type - Scale type: 'linear', 'log', 'quantize'
 * @returns {d3.Scale} D3 scale function
 */
export function createColorScale(domain, range, type = 'linear') {
  switch (type) {
    case 'log':
      return d3.scaleLog().domain(domain).range(range).clamp(true);
    case 'quantize':
      return d3.scaleQuantize().domain(domain).range(range);
    case 'linear':
    default:
      return d3.scaleLinear().domain(domain).range(range).clamp(true);
  }
}

/**
 * Create responsive SVG that maintains aspect ratio
 * @param {string} containerId - Container element ID
 * @param {Object} dimensions - Width and height
 * @returns {d3.Selection} SVG selection
 */
export function createResponsiveSVG(containerId, dimensions = {}) {
  const { width = 800, height = 600 } = dimensions;

  const container = d3.select(`#${containerId}`);

  const svg = container
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  return svg;
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 100) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Wrap text in SVG to fit width
 * @param {d3.Selection} text - D3 text selection
 * @param {number} width - Maximum width
 */
export function wrapText(text, width) {
  text.each(function () {
    const textElement = d3.select(this);
    const words = textElement.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const y = textElement.attr('y');
    const dy = parseFloat(textElement.attr('dy') || 0);

    let tspan = textElement
      .text(null)
      .append('tspan')
      .attr('x', 0)
      .attr('y', y)
      .attr('dy', dy + 'em');

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = textElement
          .append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

/**
 * Calculate optimal font size for responsive text
 * @param {number} containerWidth - Container width in pixels
 * @param {number} baseSize - Base font size
 * @param {number} minSize - Minimum font size
 * @param {number} maxSize - Maximum font size
 * @returns {number} Calculated font size
 */
export function calculateResponsiveFontSize(
  containerWidth,
  baseSize = 16,
  minSize = 10,
  maxSize = 24
) {
  const scaleFactor = containerWidth / 1000; // Assuming 1000px as base width
  const calculated = baseSize * scaleFactor;
  return Math.max(minSize, Math.min(maxSize, calculated));
}

/**
 * Export utilities object for convenience
 */
export default {
  createTooltip,
  createTooltipController,
  addZoomBehavior,
  formatNumber,
  formatPercentage,
  createColorScale,
  createResponsiveSVG,
  debounce,
  wrapText,
  calculateResponsiveFontSize,
};
