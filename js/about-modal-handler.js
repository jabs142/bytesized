/**
 * About Modal Handler
 * Handles opening/closing the About modal
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const aboutToggle = document.getElementById('aboutToggle');
    const aboutModal = document.getElementById('aboutModal');

    if (!aboutToggle || !aboutModal) {
        console.warn('About button or modal not found');
        return;
    }

    // Open modal when About button is clicked
    aboutToggle.addEventListener('click', () => {
        aboutModal.open();
    });
});
