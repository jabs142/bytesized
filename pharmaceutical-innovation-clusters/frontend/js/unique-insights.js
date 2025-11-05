/**
 * Pharmaceutical Insights Visualization
 * Renders pharmaceutical neglect and therapeutic area trends
 */

/**
 * Load pharmaceutical insights data (already loaded in app.js as window.neglectData and window.therapeuticData)
 */
async function loadUniqueInsightsData() {
    // Data is already loaded by app.js
    console.log('Pharmaceutical insights data loaded from app.js');
}

/**
 * Render all pharmaceutical insights
 */
function renderUniqueInsights() {
    renderPharmaceuticalNeglect();
    renderTopTherapeuticAreas();
    renderTherapeuticTrends();
}

/**
 * Render bottom 10 FDA pharmacological classes (market gaps / innovation opportunities)
 */
function renderPharmaceuticalNeglect() {
    const container = document.getElementById('pharmaceutical-neglect');

    if (!container) return;

    if (!window.fdaPharmClasses || !window.fdaPharmClasses.bottom_10_pharm_classes) {
        container.innerHTML = '<div class="loading">Loading therapeutic areas data...</div>';
        return;
    }

    // Get bottom 10 FDA pharmacological classes
    const bottom10 = window.fdaPharmClasses.bottom_10_pharm_classes;

    // Reverse to show from bottom up (least drugs at top)
    const reversed = [...bottom10].reverse();

    // Use a fixed reference scale of 50 drugs for bottom 10
    // This way, 1 drug = 2%, 10 drugs = 20%, 50 drugs = 100%
    // Gives truthful visual representation of "few drugs"
    const referenceScale = 50;

    let html = `
        <div class="patterns-section">
            <div class="category-bars">
    `;

    reversed.forEach(pharmClass => {
        // Scale based on fixed reference, with minimum 2% for visibility
        const percentage = Math.max(2, (pharmClass.count / referenceScale) * 100);
        const barColor = '#e74c3c'; // Red color for neglected/underserved areas

        // Create detailed tooltip with layman-friendly information
        const tooltipHtml = `title="${pharmClass.simple_name}
${pharmClass.description}

Used for: ${pharmClass.uses}
Examples: ${pharmClass.examples}
Total drugs: ${pharmClass.count}"`;

        html += `
            <div class="category-bar-row" ${tooltipHtml} style="cursor: help;">
                <div class="category-label">${pharmClass.simple_name} <span style="color: var(--text-secondary); font-size: 0.85em;">(${pharmClass.category})</span></div>
                <div class="category-bar-container">
                    <div class="category-bar-fill" style="width: ${percentage}%; background: ${barColor};"></div>
                    <div class="category-bar-value">${pharmClass.count.toLocaleString()}</div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Render top 10 FDA pharmacological classes (saturated markets / established drugs)
 */
function renderTopTherapeuticAreas() {
    const container = document.getElementById('top-therapeutic-areas');

    if (!container) return;

    if (!window.fdaPharmClasses || !window.fdaPharmClasses.top_10_pharm_classes) {
        container.innerHTML = '<div class="loading">Loading therapeutic areas data...</div>';
        return;
    }

    // Get top 10 FDA pharmacological classes
    const top10 = window.fdaPharmClasses.top_10_pharm_classes;

    const maxCount = Math.max(...top10.map(d => d.count));

    let html = `
        <div class="patterns-section">
            <div class="category-bars">
    `;

    top10.forEach(pharmClass => {
        const percentage = maxCount > 0 ? Math.max(5, (pharmClass.count / maxCount) * 100) : 0;
        const barColor = '#3498db'; // Blue for saturated/developed areas

        // Create detailed tooltip with layman-friendly information
        const tooltipHtml = `title="${pharmClass.simple_name}
${pharmClass.description}

Used for: ${pharmClass.uses}
Examples: ${pharmClass.examples}
Total drugs: ${pharmClass.count}"`;

        html += `
            <div class="category-bar-row" ${tooltipHtml} style="cursor: help;">
                <div class="category-label">${pharmClass.simple_name} <span style="color: var(--text-secondary); font-size: 0.85em;">(${pharmClass.category})</span></div>
                <div class="category-bar-container">
                    <div class="category-bar-fill" style="width: ${percentage}%; background: ${barColor};"></div>
                    <div class="category-bar-value">${pharmClass.count.toLocaleString()}</div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Render therapeutic area trends section
 */
function renderTherapeuticTrends() {
    const container = document.getElementById('therapeutic-trends');

    if (!container) return;

    if (!window.therapeuticData || !window.therapeuticData.therapeutic_trends) {
        container.innerHTML = '<div class="loading">No therapeutic trends data available</div>';
        return;
    }

    const trends = window.therapeuticData.therapeutic_trends;
    const neglectAnalysis = window.therapeuticData.neglect_analysis;

    let html = `
        <div class="insight-summary">
            <h3>Therapeutic Landscape</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-label">Total Drugs Analyzed</div>
                    <div class="stat-value">${window.therapeuticData.total_drugs_analyzed.toLocaleString()}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Therapeutic Areas</div>
                    <div class="stat-value">${Object.keys(trends).length}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Date Range</div>
                    <div class="stat-value">${window.therapeuticData.summary.date_range}</div>
                </div>
            </div>
        </div>

        <!-- Timeline Visualization -->
        <div id="therapeutic-timeline-container"></div>
    `;

    // Fun fact cards
    html += renderFunFactCards();

    container.innerHTML = html;

    // Render interactive timeline after HTML is set
    setTimeout(() => {
        if (typeof renderTherapeuticTimeline === 'function') {
            renderTherapeuticTimeline();
        }
    }, 0);
}

/**
 * Render fun fact cards showing interesting therapeutic area patterns
 */
function renderFunFactCards() {
    const stories = [
        {
            icon: '🎯',
            title: 'The Pain Paradox',
            insight: '63% of all FDA drug approvals',
            description: 'Pain & Analgesia dominates pharmaceutical development with 2,277 approvals since 1952 - more than all other therapeutic areas combined.'
        },
        {
            icon: '⚠️',
            title: 'The Antibiotic Crisis',
            insight: '2/3 developed in 1940-60s',
            description: 'The Antibiotic Golden Age produced most effective antibiotics we still use today. Modern development has nearly stopped.'
        },
        {
            icon: '🌬️',
            title: 'Respiratory Collapse',
            insight: '82% decline from 1990s peak',
            description: 'Respiratory medicine exploded to 105 approvals in the 1990s, then collapsed to just 4 in the 2020s. COVID treatments are classified under Infectious Disease, not Respiratory.',
            hasDisclaimer: true
        },
        {
            icon: '🦠',
            title: 'Infectious Disease Boom',
            insight: '47% approved in 1990s alone',
            description: 'Nearly half of all infection-fighting drugs were approved in a single decade, driven by the HIV/AIDS crisis and antibiotic development.'
        },
        {
            icon: '🧬',
            title: 'Cancer Immunotherapy',
            insight: '127 approvals since 2010',
            description: 'The newest frontier in pharmaceutical innovation. Checkpoint inhibitors and CAR-T therapies are transforming cancer treatment.'
        }
    ];

    let html = `
        <div class="methodology-section" style="margin-top: 40px;">
            <div class="container">
                <h3>📚 Pharmaceutical Innovation Stories</h3>
                <p class="section-subtitle">Five data-driven insights into therapeutic breakthroughs</p>
                <div class="methodology-grid">
    `;

    stories.forEach(story => {
        html += `
                    <div class="method-card">
                        <div class="story-icon">${story.icon}</div>
                        <h4>${story.title}</h4>
                        <div class="story-insight">${story.insight}</div>
                        <p>${story.description}</p>
                        ${story.hasDisclaimer ? '<div class="covid-disclaimer">* Note: COVID-19 vaccines/treatments are classified under Infectious Disease</div>' : ''}
                    </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>
    `;

    return html;
}
