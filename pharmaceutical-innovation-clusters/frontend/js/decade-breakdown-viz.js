/**
 * Decade Breakdown Visualization
 * Shows the shift from innovative to generic drugs over time
 */

/**
 * Load and render decade breakdown
 */
async function renderDecadeBreakdown() {
    const container = document.getElementById('decade-breakdown-chart');

    if (!container) return;

    try {
        // Load decade breakdown data
        const response = await fetch('data/decade_breakdown.json');
        if (!response.ok) {
            throw new Error('Failed to load decade breakdown data');
        }

        const data = await response.json();
        const decades = data.decade_breakdown;

        // Color scheme
        const innovativeColor = '#588B76'; // Teal - innovative drugs
        const genericColor = '#E4ACB2'; // Dusty rose - generic drugs

        let html = `
            <div class="decade-breakdown-visualization">
                <div class="breakdown-chart">
        `;

        // Create stacked bar chart
        decades.forEach(decade => {
            const innov_pct = decade.innovative_percent;
            const gen_pct = decade.generic_percent;

            html += `
                <div class="decade-bar-row">
                    <div class="decade-label">${decade.decade_label}</div>
                    <div class="stacked-bar-container">
                        <div class="stacked-bar">
                            <div class="bar-segment innovative"
                                 style="width: ${innov_pct}%; background: ${innovativeColor};"
                                 title="Innovative: ${decade.innovative.toLocaleString()} (${innov_pct}%)">
                                ${innov_pct > 15 ? `<span class="segment-label">${innov_pct}%</span>` : ''}
                            </div>
                            <div class="bar-segment generic"
                                 style="width: ${gen_pct}%; background: ${genericColor};"
                                 title="Generic: ${decade.generic.toLocaleString()} (${gen_pct}%)">
                                ${gen_pct > 15 ? `<span class="segment-label">${gen_pct}%</span>` : ''}
                            </div>
                        </div>
                        <div class="decade-total">${decade.total.toLocaleString()} total</div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>

                <div class="breakdown-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background: ${innovativeColor};"></span>
                        <span class="legend-text"><strong>Innovative Drugs (NDA/BLA)</strong> - New molecular entities & biologics</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: ${genericColor};"></span>
                        <span class="legend-text"><strong>Generic Drugs (ANDA)</strong> - Bioequivalent copies of approved drugs</span>
                    </div>
                </div>

                <div class="breakdown-revelation">
                    <h4>💡 The Generic Drug Revelation</h4>
                    <div class="revelation-grid">
                        <div class="revelation-card">
                            <div class="revelation-decade">1980s Boom</div>
                            <div class="revelation-stat">${data.key_insights['1980s_boom'].innovative.toLocaleString()} innovative</div>
                            <div class="revelation-stat">${data.key_insights['1980s_boom'].generic.toLocaleString()} generic</div>
                            <p class="revelation-text">
                                The 1980s had the <strong>most innovative drugs in absolute numbers</strong> (10,114),
                                but generics also surged after the Hatch-Waxman Act (1984), making up 37% of approvals.
                            </p>
                        </div>
                        <div class="revelation-card">
                            <div class="revelation-decade">1990s Shift</div>
                            <div class="revelation-stat">${data.decade_breakdown.find(d => d.decade === 1990).generic_percent}% generic</div>
                            <div class="revelation-stat">Generics overtake</div>
                            <p class="revelation-text">
                                Generic drugs <strong>overtook innovative drugs</strong> for the first time,
                                reaching 55% of all approvals as the generic drug industry matured.
                            </p>
                        </div>
                        <div class="revelation-card">
                            <div class="revelation-decade">2000s Reality</div>
                            <div class="revelation-stat">${data.decade_breakdown.find(d => d.decade === 2000).total.toLocaleString()} total approvals</div>
                            <div class="revelation-stat">73% generic</div>
                            <p class="revelation-text">
                                The decade with the <strong>highest proportion of generic drugs</strong> (73%).
                                As patents expired on blockbuster drugs from the 1980s-90s, generics flooded the market.
                            </p>
                        </div>
                        <div class="revelation-card">
                            <div class="revelation-decade">2010s Innovation</div>
                            <div class="revelation-stat">${data.key_insights['2010s_innovation'].innovative.toLocaleString()} innovative</div>
                            <div class="revelation-stat">New frontiers</div>
                            <p class="revelation-text">
                                While fewer in absolute numbers, 2010s innovative drugs represented
                                <strong>cutting-edge breakthroughs</strong>: cancer immunotherapy, gene therapy, rare disease treatments.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading decade breakdown:', error);
        container.innerHTML = '<div class="loading" style="color: #e74c3c;">Failed to load decade breakdown data</div>';
    }
}

// Auto-render when data is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(renderDecadeBreakdown, 100);
    });
} else {
    setTimeout(renderDecadeBreakdown, 100);
}
