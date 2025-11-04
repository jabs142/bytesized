/**
 * Unique Insights Visualization
 * Renders simultaneous discovery and hype analysis
 */

let simultaneousData = null;
let hypeData = null;

/**
 * Load unique insights data
 */
async function loadUniqueInsightsData() {
    try {
        const [simultaneousRes, hypeRes] = await Promise.all([
            fetch('data/unique_angles/simultaneous_discoveries.json').catch(() => null),
            fetch('data/unique_angles/hype_analysis.json').catch(() => null)
        ]);

        if (simultaneousRes && simultaneousRes.ok) {
            simultaneousData = await simultaneousRes.json();
            console.log('Simultaneous discovery data loaded');
        }

        if (hypeRes && hypeRes.ok) {
            hypeData = await hypeRes.json();
            console.log('Hype analysis data loaded');
        }
    } catch (error) {
        console.error('Error loading unique insights data:', error);
    }
}

/**
 * Render all unique insights
 */
function renderUniqueInsights() {
    if (simultaneousData) {
        renderSimultaneousDiscoveries(simultaneousData);
    }

    if (hypeData) {
        renderHypeAnalysis(hypeData);
    }
}

/**
 * Render simultaneous discoveries section
 */
function renderSimultaneousDiscoveries(data) {
    const container = document.getElementById('simultaneous-discoveries');

    if (!container) return;

    if (!data || data.total_patents_analyzed === 0) {
        container.innerHTML = '<div class="loading">No simultaneous discovery data available</div>';
        return;
    }

    let html = `
        <div class="insight-summary">
            <h3>Overview</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-label">Patents Analyzed</div>
                    <div class="stat-value">${data.total_patents_analyzed.toLocaleString()}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Simultaneous Pairs</div>
                    <div class="stat-value">${data.simultaneous_pairs_found.toLocaleString()}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Simultaneity Rate</div>
                    <div class="stat-value">${(data.simultaneity_rate * 100).toFixed(1)}%</div>
                </div>
            </div>
        </div>
    `;

    // Cluster correlation hypothesis
    if (data.cluster_correlation && data.cluster_correlation.result) {
        const result = data.cluster_correlation;
        const isSupported = result.result === 'supported';

        html += `
            <div class="hypothesis-card ${isSupported ? 'supported' : 'not-supported'}">
                <h4>Hypothesis: ${result.hypothesis}</h4>
                <div class="hypothesis-result">
                    ${isSupported ? '✅ Supported' : '❌ Not Supported'}
                </div>
        `;

        if (result.evidence && result.evidence.ratio) {
            html += `
                <p>
                    Simultaneous discoveries occur <strong>${result.evidence.ratio.toFixed(1)}x more frequently</strong>
                    during innovation cluster periods compared to normal periods.
                </p>
                <div class="evidence-details">
                    <div>Pairs in clusters: ${result.evidence.pairs_in_clusters}</div>
                    <div>Pairs outside clusters: ${result.evidence.pairs_outside_clusters}</div>
                </div>
            `;
        }

        html += '</div>';
    }

    // Famous examples
    if (data.famous_examples && data.famous_examples.length > 0) {
        html += `
            <div class="famous-examples">
                <h4>Notable Examples</h4>
                <div class="examples-list">
        `;

        data.famous_examples.slice(0, 5).forEach(example => {
            html += `
                <div class="example-card">
                    <div class="example-year">${example.year || 'N/A'}</div>
                    <div class="example-content">
                        <div class="example-title">
                            <strong>Patent 1:</strong> ${example.title_1}
                        </div>
                        <div class="example-title">
                            <strong>Patent 2:</strong> ${example.title_2}
                        </div>
                        <div class="example-meta">
                            <span>Similarity: ${(example.similarity * 100).toFixed(0)}%</span>
                            <span>Time gap: ${example.time_gap} years</span>
                            <span>${example.category}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
    }

    // Patterns analysis
    if (data.patterns) {
        html += '<div class="patterns-section">';

        // By category
        if (data.patterns.by_category && Object.keys(data.patterns.by_category).length > 0) {
            html += '<h4>By Technology Category</h4><div class="category-bars">';

            const categories = Object.entries(data.patterns.by_category);
            const maxCount = Math.max(...categories.map(([_, count]) => count));

            categories.forEach(([category, count]) => {
                const percentage = (count / maxCount) * 100;
                html += `
                    <div class="category-bar-row">
                        <div class="category-label">${category.replace('_', ' ')}</div>
                        <div class="category-bar-container">
                            <div class="category-bar-fill" style="width: ${percentage}%"></div>
                            <div class="category-bar-value">${count}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        }

        html += '</div>';
    }

    container.innerHTML = html;
}

/**
 * Render hype analysis section
 */
function renderHypeAnalysis(data) {
    const container = document.getElementById('hype-analysis');

    if (!container) return;

    if (!data || !data.hype_cycles || data.hype_cycles.length === 0) {
        container.innerHTML = '<div class="loading">No hype analysis data available</div>';
        return;
    }

    let html = '';

    // Hype accuracy summary
    if (data.hype_accuracy && data.hype_accuracy.summary) {
        const summary = data.hype_accuracy.summary;

        html += `
            <div class="insight-summary">
                <h3>Prediction Accuracy</h3>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-label">Predictions Analyzed</div>
                        <div class="stat-value">${summary.total_predictions_analyzed}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Accurate</div>
                        <div class="stat-value">${summary.accurate_predictions}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Accuracy Rate</div>
                        <div class="stat-value">${(summary.accuracy_rate * 100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        `;

        // Key insights
        if (data.hype_accuracy.insights) {
            html += '<div class="key-insights">';
            html += '<h4>Key Insights</h4>';

            data.hype_accuracy.insights.forEach(insight => {
                html += `
                    <div class="insight-item">
                        <div class="insight-finding">${insight.finding}</div>
                        <div class="insight-explanation">${insight.explanation}</div>
                    </div>
                `;
            });

            html += '</div>';
        }
    }

    // Hype cycles
    html += `
        <div class="hype-cycles">
            <h3>Major Hype Cycles (1990-2024)</h3>
            <div class="hype-timeline">
    `;

    data.hype_cycles.forEach(cycle => {
        const hypeLevel = cycle.hype_level.replace('_', ' ');
        const actualLevel = cycle.actual_innovation.replace('_', ' ');

        // Determine if overhyped
        const hypeScore = getHypeScore(cycle.hype_level);
        const actualScore = getInnovationScore(cycle.actual_innovation);
        const isOverhyped = hypeScore > actualScore + 1;

        html += `
            <div class="hype-cycle-card ${isOverhyped ? 'overhyped' : 'justified'}">
                <div class="cycle-header">
                    <div class="cycle-period">${cycle.period}</div>
                    <div class="cycle-badge ${isOverhyped ? 'badge-overhyped' : 'badge-justified'}">
                        ${isOverhyped ? '⚠️ Overhyped' : '✅ Justified'}
                    </div>
                </div>
                <h4>${cycle.theme}</h4>
                <p>${cycle.description}</p>
                <div class="cycle-metrics">
                    <div class="metric">
                        <span class="metric-label">Hype Level:</span>
                        <span class="metric-value">${hypeLevel}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Actual Innovation:</span>
                        <span class="metric-value">${actualLevel}</span>
                    </div>
                </div>
                <div class="cycle-outcome">
                    <strong>Outcome:</strong> ${cycle.outcome}
                </div>
        `;

        // Show data validation if available
        if (cycle.data_validation) {
            html += `
                <div class="data-validation">
                    <strong>Data:</strong>
                    ${cycle.data_validation.fda_approvals} FDA approvals,
                    ${cycle.data_validation.breakthrough_patents} patents
                </div>
            `;
        }

        html += '</div>';
    });

    html += '</div></div>';

    // Predictions vs Reality
    if (data.predictions_vs_reality && data.predictions_vs_reality.length > 0) {
        html += `
            <div class="predictions-section">
                <h3>Famous Predictions vs Reality</h3>
                <div class="predictions-list">
        `;

        data.predictions_vs_reality.forEach(pred => {
            const accuracyClass = pred.accuracy.includes('accurate') ? 'accurate' : 'inaccurate';

            html += `
                <div class="prediction-card ${accuracyClass}">
                    <div class="prediction-year">${pred.prediction_year}</div>
                    <div class="prediction-content">
                        <div class="prediction-text">"${pred.prediction}"</div>
                        <div class="prediction-source">— ${pred.predictor}</div>
                        <div class="prediction-reality">
                            <strong>Reality:</strong> ${pred.reality}
                        </div>
                        <div class="prediction-accuracy">
                            ${pred.accuracy === 'accurate' ? '✅ Accurate' :
                              pred.accuracy === 'overhyped' ? '⚠️ Overhyped' :
                              pred.accuracy === 'significantly_overhyped' ? '❌ Significantly Overhyped' :
                              '⏰ Timing Error'}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
    }

    container.innerHTML = html;
}

/**
 * Convert hype level to numeric score
 */
function getHypeScore(level) {
    const scores = {
        'low': 1,
        'moderate': 2,
        'high': 3,
        'very_high': 4,
        'extreme': 5
    };
    return scores[level] || 0;
}

/**
 * Convert innovation level to numeric score
 */
function getInnovationScore(level) {
    const scores = {
        'low': 1,
        'low_to_moderate': 1.5,
        'moderate': 2,
        'high': 3,
        'very_high': 4
    };
    return scores[level] || 0;
}
