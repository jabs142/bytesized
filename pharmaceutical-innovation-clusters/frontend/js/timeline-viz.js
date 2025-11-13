/**
 * Timeline Visualization
 * Renders master timeline and industry comparisons
 */

/**
 * Render master timeline for FDA drug approvals
 */
function renderTimeline(vizData) {
  const container = document.getElementById('master-timeline');

  // Use FDA clusters data from clusterData
  if (!vizData || !vizData.fda_clusters || !vizData.fda_clusters.yearly_counts) {
    container.innerHTML = '<div class="loading">No FDA timeline data available</div>';
    return;
  }

  const yearlyCounts = vizData.fda_clusters.yearly_counts;
  const years = Object.keys(yearlyCounts)
    .map(Number)
    .sort((a, b) => a - b);
  const clusters = vizData.fda_clusters.clusters || [];

  // Create simple timeline visualization
  const html = `
        <div class="timeline-viz">
            <div class="timeline-legend">
                <div class="legend-item"><span class="legend-color fda"></span>FDA Drug Approvals</div>
            </div>

            <div class="timeline-chart">
                ${renderFDALineChart(years, yearlyCounts, clusters)}
            </div>

            <div class="timeline-footer">
                <span>${years[0]}</span>
                <span>${years[Math.floor(years.length / 2)]}</span>
                <span>${years[years.length - 1]}</span>
            </div>
        </div>
    `;

  container.innerHTML = html;

  // Add custom hover tooltips to bars
  setTimeout(() => {
    const bars = container.querySelectorAll('.bar.fda');

    // Create tooltip element if it doesn't exist
    let tooltip = document.getElementById('timeline-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'timeline-tooltip';
      tooltip.className = 'timeline-tooltip';
      tooltip.style.display = 'none';
      document.body.appendChild(tooltip);
    }

    bars.forEach((bar) => {
      bar.addEventListener('mouseenter', (e) => {
        const total = parseInt(e.target.dataset.total);
        const start = e.target.dataset.start;
        const end = e.target.dataset.end;

        tooltip.innerHTML = `
                    <strong>${total.toLocaleString()} drugs approved</strong><br/>
                    <span style="color: var(--text-secondary); font-size: 0.85em;">from ${start}-${end}</span>
                `;
        tooltip.style.display = 'block';
      });

      bar.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 40 + 'px';
      });

      bar.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  }, 0);
}

/**
 * Render FDA drug approval line chart by decade
 */
function renderFDALineChart(years, yearlyCounts, clusters) {
  // Aggregate FDA data by decade
  const decadeData = aggregateFDAByDecade(years, yearlyCounts);

  let html = '<div class="decade-chart">';

  const maxValue = Math.max(...decadeData.map((d) => d.total));

  decadeData.forEach((decade) => {
    const scaleHeight = (value) => Math.min((value / maxValue) * 100, 100);
    const height = scaleHeight(decade.total);

    html += `
            <div class="decade-column">
                <div class="bars">
                    <div class="bar fda" style="height: ${height}%"
                         data-decade="${decade.decade}"
                         data-total="${decade.total}"
                         data-start="${decade.decade}"
                         data-end="${decade.decade + 9}"></div>
                </div>
                <div class="decade-label">${decade.decade}s</div>
            </div>
        `;
  });

  html += '</div>';

  // Add cluster highlights info if available
  if (clusters && clusters.length > 0) {
    html += '<div class="cluster-highlights-info">';
    html += '<h4>Significant Cluster Periods:</h4>';
    html += '<ul>';
    clusters.slice(0, 5).forEach((cluster) => {
      const total = cluster.total_count || cluster.total_innovations || 0;
      const avgPerYear =
        cluster.avg_per_year != null ? ` (avg ${cluster.avg_per_year.toFixed(0)}/year)` : '';
      const sigmaInfo =
        cluster.sigma_above_mean != null
          ? ` - ${cluster.sigma_above_mean.toFixed(1)}σ above mean`
          : '';
      html += `<li>${cluster.start_year}-${cluster.end_year}: ${total.toLocaleString()} approvals${avgPerYear}${sigmaInfo}</li>`;
    });
    html += '</ul>';
    html += '</div>';
  } else {
    html += '<div class="cluster-highlights-info">';
    html +=
      '<p style="color: var(--text-secondary); font-size: 0.9rem;">No significant clustering periods detected</p>';
    html += '</div>';
  }

  return html;
}

/**
 * Aggregate FDA yearly data by decade
 */
function aggregateFDAByDecade(years, yearlyCounts) {
  const decades = {};

  years.forEach((year) => {
    const decade = Math.floor(year / 10) * 10;
    const count = yearlyCounts[year] || 0;

    if (!decades[decade]) {
      decades[decade] = {
        decade: decade,
        total: 0,
        years_count: 0,
      };
    }

    decades[decade].total += count;
    decades[decade].years_count += 1;
  });

  // Calculate average per year for each decade
  return Object.values(decades).map((d) => ({
    ...d,
    avg_per_year: d.total / d.years_count,
  }));
}

/**
 * Render industry comparison charts
 */
function renderIndustryComparison(vizData) {
  if (!vizData || !vizData.comparison) {
    return;
  }

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

    const trendIcon =
      {
        growing: '📈',
        declining: '📉',
        stable: '➡️',
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
  if (!vizData || !vizData.summary_cards) {
    return;
  }

  const cards = vizData.summary_cards;

  // Update the existing stat cards if they exist
  cards.forEach((card, index) => {
    if (index === 0) {
      // Total innovations (already exists)
      const totalEl = document.getElementById('total-innovations');
      if (totalEl) {
        totalEl.textContent = card.value;
      }
    }
  });

  // Could add more cards dynamically if needed
}
