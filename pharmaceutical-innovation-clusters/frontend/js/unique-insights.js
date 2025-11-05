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
 * Render bottom 10 individual diseases by approval count
 */
function renderPharmaceuticalNeglect() {
    const container = document.getElementById('pharmaceutical-neglect');

    if (!container) return;

    if (!window.neglectData) {
        container.innerHTML = '<div class="loading">No disease data available</div>';
        return;
    }

    // Collect all individual diseases (neglected + common)
    const allDiseases = [];

    // Add neglected diseases
    if (window.neglectData.neglected_diseases) {
        Object.entries(window.neglectData.neglected_diseases).forEach(([name, data]) => {
            allDiseases.push({
                name,
                total: data.total_approvals || 0,
                category: 'neglected'
            });
        });
    }

    // Add common diseases
    if (window.neglectData.common_diseases) {
        Object.entries(window.neglectData.common_diseases).forEach(([name, data]) => {
            allDiseases.push({
                name,
                total: data.total_approvals || 0,
                category: 'common'
            });
        });
    }

    // Sort by total approvals (ascending) and take bottom 10
    const bottom10 = allDiseases
        .sort((a, b) => a.total - b.total)
        .slice(0, 10);

    const maxCount = Math.max(...bottom10.map(d => d.total));

    let html = `
        <div class="patterns-section">
            <div class="category-bars">
    `;

    bottom10.forEach(disease => {
        const percentage = maxCount > 0 ? (disease.total / maxCount) * 100 : 0;
        const barColor = '#3498db';

        html += `
            <div class="category-bar-row">
                <div class="category-label">${disease.name}</div>
                <div class="category-bar-container">
                    <div class="category-bar-fill" style="width: ${percentage}%; background: ${barColor};"></div>
                    <div class="category-bar-value">${disease.total.toLocaleString()}</div>
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
 * Render top therapeutic areas by approval count as horizontal bar chart
 */
function renderTopTherapeuticAreas() {
    const container = document.getElementById('top-therapeutic-areas');

    if (!container) return;

    if (!window.therapeuticData || !window.therapeuticData.neglect_analysis) {
        container.innerHTML = '<div class="loading">No therapeutic areas data available</div>';
        return;
    }

    // Get all therapeutic areas and sort by approvals (descending)
    const therapeuticAreas = window.therapeuticData.neglect_analysis.most_developed || [];

    if (therapeuticAreas.length === 0) {
        container.innerHTML = '<div class="loading">No therapeutic areas data available</div>';
        return;
    }

    // Take top 10 therapeutic areas
    const top10 = therapeuticAreas.slice(0, 10);
    const maxCount = Math.max(...top10.map(area => area.approvals));

    let html = `
        <div class="patterns-section">
            <div class="category-bars">
    `;

    top10.forEach(area => {
        const percentage = maxCount > 0 ? (area.approvals / maxCount) * 100 : 0;
        const barColor = '#3498db';

        html += `
            <div class="category-bar-row">
                <div class="category-label">${area.area}</div>
                <div class="category-bar-container">
                    <div class="category-bar-fill" style="width: ${percentage}%; background: ${barColor};"></div>
                    <div class="category-bar-value">${area.approvals.toLocaleString()}</div>
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
