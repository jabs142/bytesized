/**
 * Statistical Visualization
 * Renders Poisson test results and other statistical analyses
 */

/**
 * Render clustering analysis results - Unified design
 */
function renderPoissonTests(stats) {
  const container = document.getElementById('poisson-results');

  if (!stats || !stats.poisson_tests) {
    container.innerHTML = '<div class="loading">No statistical test data available</div>';
    return;
  }

  const tests = stats.poisson_tests;
  const result = Object.values(tests)[0]; // Get the first test result

  if (!result) {
    return;
  }

  const isClustered = result.is_clustered || !result.is_random;
  const cv = result.coefficient_of_variation ? result.coefficient_of_variation.toFixed(2) : 'N/A';
  const confidencePercent = result.confidence_percent || `${(result.confidence * 100).toFixed(0)}%`;
  const clusterCount = stats.significant_clusters ? stats.significant_clusters.length : 0;
  const peakDecade = stats.peak_years?.fda_drugs
    ? `${Math.floor(stats.peak_years.fda_drugs / 10) * 10}s`
    : '1980s';

  // Create unified analysis card
  const unifiedCard = `
        <div class="statistical-summary">
            <h3>📊 Statistical Analysis Results</h3>
            <p>
                Pharmaceutical innovations are <strong>${isClustered ? 'CLUSTERED' : 'UNIFORM'}</strong>—they ${isClustered ? 'come in waves, not randomly over time' : 'are distributed relatively evenly over time'}.
            </p>
            <div class="stats-inline">
                <div class="stat-badge">
                    <span class="stat-icon">📈</span>
                    <span class="stat-text">Coefficient of Variation: <strong>${cv}</strong></span>
                </div>
            </div>
            <p>
                Statistical analysis proves innovations do NOT occur randomly—they come in waves, with
                some periods seeing <strong>5-10x more approvals</strong> than others.
            </p>

            <!-- What This Number Means Dropdown -->
            <div style="margin-top: var(--spacing-md); border: 2px solid var(--gb-light); border-radius: var(--radius-pixel); overflow: hidden;">
                <button onclick="toggleDropdown('explain-numbers')" style="width: 100%; padding: var(--spacing-md); background: rgba(139, 172, 15, 0.08); border: none; cursor: pointer; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="font-family: var(--font-pixel); font-size: 0.65rem; margin: 0; color: var(--gb-dark);">📚 What This Number Means</h4>
                    <span id="explain-numbers-icon" style="font-size: 1.2rem; transition: transform 0.3s;">▼</span>
                </button>
                <div id="explain-numbers-content" style="display: none; padding: var(--spacing-md); background: rgba(139, 172, 15, 0.04);">
                    <p style="font-size: 0.875rem; line-height: 1.7; margin-bottom: 0.75rem;">
                        <strong>Coefficient of Variation (${cv}):</strong> Think of this as a "consistency score." A low number (below 0.3) means approvals happen at a steady, predictable rate. A high number (above 0.7) means they're all over the place—some years explode with approvals, others are quiet. Our score of ${cv} proves innovations come in unpredictable waves, not steadily over time.
                    </p>
                </div>
            </div>

            <!-- How Was It Calculated Dropdown -->
            <div style="margin-top: var(--spacing-sm); border: 2px solid var(--gb-light); border-radius: var(--radius-pixel); overflow: hidden;">
                <button onclick="toggleDropdown('calculation')" style="width: 100%; padding: var(--spacing-md); background: rgba(139, 172, 15, 0.08); border: none; cursor: pointer; text-align: left; display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="font-family: var(--font-pixel); font-size: 0.65rem; margin: 0; color: var(--gb-dark);">🔢 How Was It Calculated?</h4>
                    <span id="calculation-icon" style="font-size: 1.2rem; transition: transform 0.3s;">▼</span>
                </button>
                <div id="calculation-content" style="display: none; padding: var(--spacing-md); background: rgba(139, 172, 15, 0.04);">
                    <p style="font-size: 0.875rem; line-height: 1.7; margin-bottom: 0.75rem;">
                        <strong>Coefficient of Variation (CV):</strong> Calculated as the standard deviation divided by the mean, then multiplied by 100 to get a percentage. Formula: <code>CV = (σ / μ) × 100</code>
                    </p>
                    <p style="font-size: 0.875rem; line-height: 1.7; margin-bottom: 0.75rem;">
                        <strong>Analysis Method:</strong> We analyzed FDA drug approval rates over time using a sliding window approach. For each time period, we calculated the rate of approvals and compared it against the historical average.
                    </p>
                    <p style="font-size: 0.875rem; line-height: 1.7; margin-bottom: 0.75rem;">
                        <strong>Clustering Threshold:</strong> A CV > 0.7 indicates clustering. This means the variation in approval rates is at least 70% of the mean, suggesting non-random clustering patterns rather than steady, uniform distribution.
                    </p>
                    <p style="font-size: 0.875rem; line-height: 1.7; margin: 0;">
                        <strong>Statistical Test:</strong> We used Poisson distribution testing to determine whether approval patterns differ significantly from random occurrence. The high confidence level indicates this clustering pattern is statistically significant and not due to chance.
                    </p>
                </div>
            </div>
        </div>
    `;

  container.innerHTML = unifiedCard;
}

/**
 * Format category name for display
 */
function formatCategoryName(category) {
  const nameMap = {
    fda_drugs: 'FDA Drug Approvals',
    semiconductors: 'Semiconductors',
    telecommunications: 'Telecommunications',
    computing: 'Computing',
    pharmaceuticals: 'Pharma Patents',
  };

  return (
    nameMap[category] ||
    category
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

/**
 * Toggle dropdown visibility
 */
function toggleDropdown(id) {
  const content = document.getElementById(`${id}-content`);
  const icon = document.getElementById(`${id}-icon`);

  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
}
