/**
 * Therapeutic Peaks Visualization
 * Shows which decade each therapeutic area peaked
 */

/**
 * Render "When Did Each Therapeutic Area Peak?" visualization
 */
function renderTherapeuticPeaksChart() {
    const container = document.getElementById('therapeutic-peaks-chart');

    if (!container) return;

    if (!window.therapeuticData || !window.therapeuticData.peak_concentration_ranking) {
        container.innerHTML = '<div class="loading">No therapeutic peak data available</div>';
        return;
    }

    const peaks = window.therapeuticData.peak_concentration_ranking;

    // Color scheme by decade
    const decadeColors = {
        '1950': '#8B7355', // Brown - 1950s
        '1960': '#A0826D', // Light brown - 1960s
        '1970': '#9BA38C', // Olive - 1970s
        '1980': '#99BAB9', // Blue-gray - 1980s
        '1990': '#84A98C', // Sage green - 1990s
        '2000': '#6F9B88', // Teal - 2000s
        '2010': '#588B76', // Dark teal - 2010s
        '2020': '#4A7766'  // Deep teal - 2020s
    };

    let html = `
        <div class="peaks-visualization">
            <div class="peaks-explanation" style="margin-bottom: var(--spacing-md); padding: var(--spacing-sm); background: #f0f0f0; border-radius: var(--radius-pixel); border: 2px solid var(--gb-dark);">
                <p style="font-size: 0.875rem; line-height: 1.6; margin: 0; color: var(--text-primary);">
                    <strong>How to read this chart:</strong> Each bar shows what percentage of that therapeutic area's total drug approvals
                    occurred in its peak decade. For example, <strong>71%</strong> means that 71% of all Rare & Orphan Disease drugs
                    were approved in the 2010s, indicating highly concentrated development in that single decade.
                </p>
            </div>
            <div class="peaks-grid">
    `;

    peaks.forEach(item => {
        const peak = item.peak_decade;
        const percentage = peak.concentration_percent;
        const barColor = decadeColors[peak.decade] || '#99BAB9';

        html += `
            <div class="peak-row">
                <div class="peak-label">
                    <span class="area-name">${item.area}</span>
                    <span class="peak-decade-badge" style="background: ${barColor};">${peak.decade_label}</span>
                </div>
                <div class="peak-bar-container">
                    <div class="peak-bar-fill" style="width: ${percentage}%; background: ${barColor};"></div>
                    <div class="peak-bar-value">${percentage}%</div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
            <div class="peaks-insight">
                <h4>💡 Key Insight</h4>
                <p>
                    Most therapeutic areas peaked in the <strong>2010s</strong>, driven by advances in precision medicine,
                    immunotherapy, and orphan drug development. Rare diseases (71%), Alzheimer's (65%), and oncology (39%)
                    all saw their highest concentration of approvals in this decade, representing a shift toward
                    cutting-edge therapeutic breakthroughs for previously challenging conditions.
                </p>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Auto-render when data is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(renderTherapeuticPeaksChart, 100);
    });
} else {
    setTimeout(renderTherapeuticPeaksChart, 100);
}
