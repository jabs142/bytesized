/**
 * Timeline Visualization
 * Renders master timeline and industry comparisons
 */

/**
 * Render master timeline
 */
function renderTimeline(vizData) {
    const container = document.getElementById('master-timeline');

    if (!vizData || !vizData.timeline || !vizData.timeline.years) {
        container.innerHTML = '<div class="loading">No timeline data available</div>';
        return;
    }

    const timeline = vizData.timeline;
    const years = timeline.years;
    const series = timeline.series;

    // Create simple ASCII-style timeline visualization
    const html = `
        <div class="timeline-viz">
            <div class="timeline-legend">
                <div class="legend-item"><span class="legend-color fda"></span>FDA Drugs</div>
                <div class="legend-item"><span class="legend-color semiconductors"></span>Semiconductors</div>
                <div class="legend-item"><span class="legend-color telecom"></span>Telecommunications</div>
                <div class="legend-item"><span class="legend-color computing"></span>Computing</div>
                <div class="legend-item"><span class="legend-color pharma"></span>Pharma Patents</div>
            </div>

            <div class="timeline-chart">
                ${renderSimpleLineChart(years, series, timeline.cluster_highlights || [])}
            </div>

            <div class="timeline-footer">
                <span>${years[0]}</span>
                <span>${years[Math.floor(years.length / 2)]}</span>
                <span>${years[years.length - 1]}</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Render simple line chart using CSS
 */
function renderSimpleLineChart(years, series, highlights) {
    // Simplified visualization approach
    // Shows trend over decades rather than all years

    const decadeData = aggregateByDecade(years, series);

    let html = '<div class="decade-chart">';

    decadeData.forEach((decade, index) => {
        const maxValue = Math.max(...Object.values(decade.totals));
        const scaleHeight = (value) => Math.min((value / maxValue) * 100, 100);

        html += `
            <div class="decade-column">
                <div class="bars">
                    <div class="bar fda" style="height: ${scaleHeight(decade.totals.fda_drugs)}%"
                         title="FDA Drugs: ${decade.totals.fda_drugs}"></div>
                    <div class="bar semiconductors" style="height: ${scaleHeight(decade.totals.semiconductors)}%"
                         title="Semiconductors: ${decade.totals.semiconductors}"></div>
                    <div class="bar telecom" style="height: ${scaleHeight(decade.totals.telecommunications)}%"
                         title="Telecom: ${decade.totals.telecommunications}"></div>
                    <div class="bar computing" style="height: ${scaleHeight(decade.totals.computing)}%"
                         title="Computing: ${decade.totals.computing}"></div>
                    <div class="bar pharma" style="height: ${scaleHeight(decade.totals.pharmaceuticals)}%"
                         title="Pharma Patents: ${decade.totals.pharmaceuticals}"></div>
                </div>
                <div class="decade-label">${decade.decade}s</div>
            </div>
        `;
    });

    html += '</div>';

    // Add cluster highlights info
    if (highlights.length > 0) {
        html += '<div class="cluster-highlights-info">';
        html += '<h4>Significant Cluster Periods:</h4>';
        html += '<ul>';
        highlights.slice(0, 5).forEach(cluster => {
            html += `<li>${cluster.label} (${cluster.start}-${cluster.end}) - ${cluster.sigma}σ above mean</li>`;
        });
        html += '</ul>';
        html += '</div>';
    }

    return html;
}

/**
 * Aggregate yearly data by decade
 */
function aggregateByDecade(years, series) {
    const decades = {};

    years.forEach((year, index) => {
        const decade = Math.floor(year / 10) * 10;

        if (!decades[decade]) {
            decades[decade] = {
                decade: decade,
                totals: {
                    fda_drugs: 0,
                    semiconductors: 0,
                    telecommunications: 0,
                    computing: 0,
                    pharmaceuticals: 0
                }
            };
        }

        decades[decade].totals.fda_drugs += series.fda_drugs[index] || 0;
        decades[decade].totals.semiconductors += series.semiconductors[index] || 0;
        decades[decade].totals.telecommunications += series.telecommunications[index] || 0;
        decades[decade].totals.computing += series.computing[index] || 0;
        decades[decade].totals.pharmaceuticals += series.pharmaceuticals[index] || 0;
    });

    return Object.values(decades);
}

/**
 * Render industry comparison charts
 */
function renderIndustryComparison(vizData) {
    if (!vizData || !vizData.comparison) return;

    const comparison = vizData.comparison;

    // Render total innovations bar chart
    renderIndustryBars(comparison);

    // Render peak years
    renderPeakYears(comparison);
}

/**
 * Render industry bar chart
 */
function renderIndustryBars(comparison) {
    const container = document.getElementById('industry-bars');

    if (!comparison.categories || !comparison.totals) {
        container.innerHTML = '<div class="loading">No comparison data</div>';
        return;
    }

    const maxValue = Math.max(...comparison.totals);

    let html = '<div class="bar-chart">';

    comparison.categories.forEach((category, index) => {
        const total = comparison.totals[index];
        const percentage = (total / maxValue) * 100;

        html += `
            <div class="bar-row">
                <div class="bar-label">${category}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${total.toLocaleString()}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
}

/**
 * Render peak years
 */
function renderPeakYears(comparison) {
    const container = document.getElementById('peak-years');

    if (!comparison.categories || !comparison.peak_years) {
        container.innerHTML = '<div class="loading">No peak year data</div>';
        return;
    }

    let html = '<div class="peak-years-list">';

    comparison.categories.forEach((category, index) => {
        const peakYear = comparison.peak_years[index];
        const trend = comparison.trends[index] || 'stable';

        const trendIcon = {
            'growing': '📈',
            'declining': '📉',
            'stable': '➡️'
        }[trend] || '➡️';

        html += `
            <div class="peak-year-item">
                <div class="peak-category">${category}</div>
                <div class="peak-info">
                    <span class="peak-year-badge">${peakYear}</span>
                    <span class="trend-icon" title="${trend}">${trendIcon}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
}

/**
 * Render summary cards
 */
function renderSummaryCards(vizData) {
    if (!vizData || !vizData.summary_cards) return;

    const cards = vizData.summary_cards;

    // Update the existing stat cards if they exist
    cards.forEach((card, index) => {
        if (index === 0) {
            // Total innovations (already exists)
            const totalEl = document.getElementById('total-innovations');
            if (totalEl) totalEl.textContent = card.value;
        }
    });

    // Could add more cards dynamically if needed
}
