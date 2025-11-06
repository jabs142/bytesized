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
        const barColor = '#E4ACB2'; // Dusty rose from therapeutic palette for emerging areas

        // Create detailed tooltip with layman-friendly information
        const tooltipContent = `${pharmClass.simple_name}
${pharmClass.description}

Used for: ${pharmClass.uses}
Examples: ${pharmClass.examples}
Total drugs: ${pharmClass.count}`;

        html += `
            <div class="category-bar-row custom-tooltip" data-tooltip="${tooltipContent.replace(/"/g, '&quot;')}" style="cursor: help;">
                <div class="category-label">
                    <strong>${pharmClass.simple_name}</strong>
                    <span style="color: var(--text-secondary); font-size: 0.75em; display: block; margin-top: 2px;">
                        for ${pharmClass.category.toLowerCase()}
                    </span>
                </div>
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
        const barColor = '#99BAB9'; // Blue-gray from therapeutic palette for established areas

        // Create detailed tooltip with layman-friendly information
        const tooltipContent = `${pharmClass.simple_name}
${pharmClass.description}

Used for: ${pharmClass.uses}
Examples: ${pharmClass.examples}
Total drugs: ${pharmClass.count}`;

        html += `
            <div class="category-bar-row custom-tooltip" data-tooltip="${tooltipContent.replace(/"/g, '&quot;')}" style="cursor: help;">
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
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-label">TOTAL DRUGS ANALYZED</div>
                    <div class="stat-value">${window.therapeuticData.total_drugs_analyzed.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">THERAPEUTIC AREAS</div>
                    <div class="stat-value">${Object.keys(trends).length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">DATE RANGE</div>
                    <div class="stat-value">${window.therapeuticData.summary.date_range}</div>
                </div>
            </div>
        </div>

        <!-- Therapeutic Peaks Chart -->
        <div style="margin-top: var(--spacing-lg);">
            <h4 style="font-family: var(--font-pixel); font-size: 0.8rem; margin-bottom: var(--spacing-md); color: var(--gb-dark);">
                📊 When Did Each Therapeutic Area Peak?
            </h4>
            <div id="therapeutic-peaks-chart"></div>
        </div>

        <!-- Timeline Visualization -->
        <div id="therapeutic-timeline-container"></div>
    `;

    // Fun fact cards
    html += renderFunFactCards();

    container.innerHTML = html;

    // Render visualizations after HTML is set
    setTimeout(() => {
        // Render peaks chart
        if (typeof renderTherapeuticPeaksChart === 'function') {
            renderTherapeuticPeaksChart();
        }

        // Render timeline
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
            description: 'Respiratory medicine exploded to 105 approvals in the 1990s, then collapsed to just 4 in the 2020s.',
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
        },
        {
            icon: '🧠',
            title: 'The 1980s Boom',
            insight: '15,987 drugs approved',
            description: 'The most innovative decade in pharmaceutical history. The 1980s saw unprecedented drug development, averaging 1,600 approvals per year—a record never matched since.',
            tooltip: 'The Hatch-Waxman Act (1984) revolutionized generic drug approvals, no longer requiring full clinical trials. This, combined with the biotech revolution and AIDS crisis, created the most innovative decade in pharmaceutical history.'
        }
    ];

    let html = `
        <div class="methodology-section" style="margin-top: 40px;">
            <div class="container">
                <h3>📚 Pharmaceutical Innovation Stories</h3>
                <p class="section-subtitle">Six data-driven insights into therapeutic breakthroughs</p>
                <div class="methodology-grid">
    `;

    stories.forEach(story => {
        const tooltipAttr = story.tooltip ? `title="${story.tooltip}"` : '';
        html += `
                    <div class="method-card" ${tooltipAttr}>
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
