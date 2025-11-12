/**
 * AboutModal Web Component
 * Displays README content in a Game Boy styled modal overlay
 */
class AboutModal extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
        this.focusedElementBeforeModal = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="about-modal-backdrop" id="aboutBackdrop" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                <div class="about-modal-container">
                    <!-- Modal Header -->
                    <div class="about-modal-header">
                        <h2 id="modalTitle" class="modal-title">ABOUT BYTESIZED</h2>
                        <button class="modal-close-btn" id="closeModal" aria-label="Close modal">
                            <span class="close-icon">✕</span>
                        </button>
                    </div>

                    <!-- Modal Content -->
                    <div class="about-modal-content">
                        <!-- Hero Section -->
                        <div class="modal-section">
                            <p class="modal-tagline">Data explorations for the curious</p>
                            <p class="modal-intro">A collection of personal explorations driven by questions that kept me up at night or sparked during random conversations. These projects are my attempts to understand interesting patterns in the world.</p>
                        </div>

                        <!-- Projects Section -->
                        <div class="modal-section">
                            <h3 class="section-title">PROJECTS</h3>

                            <!-- Pharmaceutical Innovation -->
                            <details class="project-details">
                                <summary class="project-summary">
                                    <span class="summary-icon">💊</span>
                                    <span class="summary-text">Temporal Clustering of Economic Breakthroughs</span>
                                </summary>
                                <div class="project-content">
                                    <p>Economist Joseph Schumpeter developed the theory of "creative destruction" to explain how innovation unfolds in waves rather than continuously. Turns out, major breakthroughs often happen almost simultaneously by different people working independently—like Darwin and Wallace both developing evolution theory in the 1850s, or Newton and Leibniz both discovering calculus around the same time. Bell and Gray even filed telephone patents on the exact same day in 1876.</p>

                                    <p>The pharmaceutical industry had its own remarkable cluster. During the <strong>Golden Age of Antibiotics</strong> (roughly 1940s to mid-1960s), scientists discovered nearly two-thirds of all the antibiotic classes we still use today—an explosion of discovery packed into just a couple of decades.</p>

                                    <p>Using patent data, I analyzed trends in the types of patents being filed over time. I also looked at FDA drug approvals to see if this clustering pattern holds up and whether we can spot similar innovation waves in drug discovery.</p>

                                    <p class="key-concept"><em>Key concept: Multiple discovery suggests that when the time is right—when enough foundational knowledge exists—breakthroughs become almost inevitable, discovered by multiple people working independently.</em></p>
                                </div>
                            </details>

                            <!-- Social Media Mining -->
                            <details class="project-details">
                                <summary class="project-summary">
                                    <span class="summary-icon">💬</span>
                                    <span class="summary-text">Mining Social Media for Under-Reported Drug Side Effects</span>
                                </summary>
                                <div class="project-content">
                                    <p>In pharma, side effects are usually discovered through clinical trials and formal adverse event reports that doctors and patients fill out. But let's be honest—that's a huge barrier.</p>

                                    <p>Social media, on the other hand, has a much lower barrier to reporting. People freely share their health experiences online every day. I got curious: could we find side effects that are under-reported or under-researched by listening to what people are already saying?</p>

                                    <p>I built a tool to analyze Reddit discussions and uncover potential connections between drugs and side effects that might be flying under the radar of traditional pharmacovigilance systems.</p>
                                </div>
                            </details>

                            <!-- Personal Statistics -->
                            <details class="project-details">
                                <summary class="project-summary">
                                    <span class="summary-icon">📊</span>
                                    <span class="summary-text">Personal Statistics & Existential Math</span>
                                </summary>
                                <div class="project-content">
                                    <p>Some questions just pop into your head and won't leave. These projects explore the mathematical side of existence—the statistical privileges we take for granted and the curious milestones we pass without noticing.</p>

                                    <ul class="project-list">
                                        <li>What are the odds I was born in my country versus somewhere without clean water or reliable electricity?</li>
                                        <li>When did my heart beat for the millionth time?</li>
                                        <li>What's my statistical death date based on actuarial tables?</li>
                                    </ul>
                                </div>
                            </details>
                        </div>

                        <!-- Accuracy Note -->
                        <div class="modal-section modal-note">
                            <h3 class="section-title">A NOTE ON ACCURACY</h3>
                            <p>These are passion projects born from curiosity, not rigorous academic research. I'm learning as I go, and while I try to be accurate, I'm not an expert in these fields :) If you spot errors or have suggestions, I'd love to hear them!</p>
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div class="about-modal-footer">
                        <button class="modal-btn-primary" id="closeModalBtn">
                            <span class="btn-text">GOT IT!</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Close button
        const closeBtn = this.querySelector('#closeModal');
        const closeBtnFooter = this.querySelector('#closeModalBtn');
        const backdrop = this.querySelector('#aboutBackdrop');

        closeBtn?.addEventListener('click', () => this.close());
        closeBtnFooter?.addEventListener('click', () => this.close());

        // Click outside to close
        backdrop?.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                this.close();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Trap focus within modal
        backdrop?.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.isOpen) {
                this.trapFocus(e);
            }
        });
    }

    open() {
        const backdrop = this.querySelector('#aboutBackdrop');
        if (!backdrop) return;

        // Save currently focused element
        this.focusedElementBeforeModal = document.activeElement;

        // Show modal
        backdrop.classList.add('active');
        this.isOpen = true;

        // Lock body scroll
        document.body.style.overflow = 'hidden';

        // Focus first focusable element
        setTimeout(() => {
            const firstFocusable = backdrop.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            firstFocusable?.focus();
        }, 100);

        // Announce to screen readers
        this.setAttribute('aria-hidden', 'false');
    }

    close() {
        const backdrop = this.querySelector('#aboutBackdrop');
        if (!backdrop) return;

        // Hide modal
        backdrop.classList.remove('active');
        this.isOpen = false;

        // Unlock body scroll
        document.body.style.overflow = '';

        // Return focus to trigger button
        if (this.focusedElementBeforeModal) {
            this.focusedElementBeforeModal.focus();
        }

        // Announce to screen readers
        this.setAttribute('aria-hidden', 'true');
    }

    trapFocus(event) {
        const backdrop = this.querySelector('#aboutBackdrop');
        if (!backdrop) return;

        const focusableElements = backdrop.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                event.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                event.preventDefault();
            }
        }
    }
}

// Define custom element
customElements.define('about-modal', AboutModal);
