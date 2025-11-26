/**
 * AI Healthcare Fundamentals - Main App
 * Handles navigation and initialization
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSmoothScroll();
});

/**
 * Initialize section navigation
 */
function initNavigation() {
  const navPills = document.querySelectorAll('.nav-pill');
  const sections = document.querySelectorAll('.content-section');

  navPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const targetSection = pill.dataset.section;

      // Update active pill
      navPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      // Show target section
      sections.forEach((section) => {
        if (section.id === targetSection) {
          section.classList.add('active');
          // Scroll to top of section
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          section.classList.remove('active');
        }
      });

      // Update URL hash without jumping
      window.history.pushState(null, null, `#${targetSection}`);
    });
  });

  // Handle direct URL hash navigation
  handleHashNavigation();
  window.addEventListener('hashchange', handleHashNavigation);
}

/**
 * Handle navigation from URL hash
 */
function handleHashNavigation() {
  const hash = window.location.hash.substring(1); // Remove #
  if (hash) {
    const targetPill = document.querySelector(`[data-section="${hash}"]`);
    if (targetPill) {
      targetPill.click();
    }
  }
}

/**
 * Initialize smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
}
