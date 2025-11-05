/**
 * Statistical Visualization
 * Renders Poisson test results and other statistical analyses
 */

/**
 * Render Poisson test results
 */
function renderPoissonTests(stats) {
    const container = document.getElementById('poisson-results');

    if (!stats || !stats.poisson_tests) {
        container.innerHTML = '<div class="loading">No statistical test data available</div>';
        return;
    }

    const tests = stats.poisson_tests;

    // Create test cards
    const cards = Object.entries(tests).map(([category, result]) => {
        const displayName = formatCategoryName(category);
        const isRandom = result.is_random;
        const pValue = result.p_value !== null ? result.p_value.toFixed(4) : 'N/A';

        return `
            <div class="test-card ${isRandom ? 'random' : 'clustered'}">
                <div class="test-icon">${isRandom ? '🎲' : '⚡'}</div>
                <h3>${displayName}</h3>
                <div class="test-result">
                    ${isRandom ? 'Random' : 'Clustered'}
                </div>
                <div class="p-value">p = ${pValue}</div>
                <div class="test-explanation">
                    ${getExplanation(isRandom)}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cards;
}

/**
 * Format category name for display
 */
function formatCategoryName(category) {
    const nameMap = {
        'fda_drugs': 'FDA Drug Approvals',
        'semiconductors': 'Semiconductors',
        'telecommunications': 'Telecommunications',
        'computing': 'Computing',
        'pharmaceuticals': 'Pharma Patents'
    };

    return nameMap[category] || category.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get explanation text
 */
function getExplanation(isRandom) {
    if (isRandom) {
        return 'Innovations are randomly distributed like raindrops';
    } else {
        return 'Innovations cluster significantly (p<0.05)';
    }
}

/**
 * Render summary explanation
 */
function renderStatisticalSummary(stats) {
    if (!stats || !stats.poisson_tests) return;

    const tests = stats.poisson_tests;
    const total = Object.keys(tests).length;
    const nonRandom = Object.values(tests).filter(t => !t.is_random).length;

    const percentage = (nonRandom / total * 100).toFixed(0);

    const summary = document.createElement('div');
    summary.className = 'statistical-summary';
    summary.innerHTML = `
        <h3>Statistical Conclusion</h3>
        <p>
            <strong>${nonRandom} out of ${total}</strong> categories show significant clustering (${percentage}%).
            This proves that innovations do NOT occur randomly—they cluster together in specific time periods.
        </p>
        <p class="methodology-note">
            <em>Method: Poisson goodness-of-fit test with 95% confidence level (p<0.05)</em>
        </p>
    `;

    const container = document.getElementById('poisson-results');
    container.appendChild(summary);
}
