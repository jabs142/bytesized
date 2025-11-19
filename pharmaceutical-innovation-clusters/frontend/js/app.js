/**
 * Pharmaceutical Innovation Clusters - Frontend Dashboard
 * Handles data loading, filtering, and rendering
 */

// Import D3 lazy loader
import { loadD3 } from '/shared/utils/d3-loader.js';

let clusterData = null;
let statsData = null;
let vizData = null;

/**
 * Convert markdown bold syntax to HTML
 */
function markdownToHtml(text) {
  if (!text) {
    return '';
  }
  // Convert **text** to <strong>text</strong>
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Lazy-load D3.js library first
  const d3 = await loadD3();
  window.d3 = d3; // Make available globally for all viz scripts

  await loadData();
  await loadUniqueInsightsData();
  initializeFilters();
  renderDashboard();
});

/**
 * Load all data files from JSON
 */
async function loadData() {
  try {
    // Track failed files for better error reporting
    const failedFiles = [];

    // Helper function to fetch with error tracking
    const fetchWithTracking = async (url, isRequired = false) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
      } catch (error) {
        const errorMsg = `Failed to load ${url}: ${error.message}`;
        console.error(errorMsg);
        failedFiles.push({ file: url, error: error.message, required: isRequired });
        return null;
      }
    };

    // Load all pharmaceutical data files in parallel
    const [
      clustersRes,
      statsRes,
      therapeuticRes,
      neglectRes,
      fdaPharmRes,
      enrichedClustersRes,
      clusterContextRes,
    ] = await Promise.all([
      fetchWithTracking('data/clusters.json', true),
      fetchWithTracking('data/statistical_results.json', false),
      fetchWithTracking('data/therapeutic_trends.json', false),
      fetchWithTracking('data/neglected_diseases.json', false),
      fetchWithTracking('data/fda_pharm_classes.json', false),
      fetchWithTracking('data/enriched_clusters.json', false),
      fetchWithTracking('data/cluster_context.json', false),
    ]);

    // Parse responses (only if fetch succeeded)
    if (clustersRes) {
      clusterData = await clustersRes.json();
      // console.log('✓ Cluster data loaded');
    }

    if (statsRes) {
      statsData = await statsRes.json();
      // console.log('✓ Statistical data loaded');
    }

    if (therapeuticRes) {
      window.therapeuticData = await therapeuticRes.json();
      // console.log('✓ Therapeutic data loaded');
    }

    if (neglectRes) {
      window.neglectData = await neglectRes.json();
      // console.log('✓ Neglect data loaded');
    }

    // Note: Timeline data is now loaded lazily by therapeutic-timeline.js
    // See timeline-data-loader.js for on-demand decade loading

    if (fdaPharmRes) {
      window.fdaPharmClasses = await fdaPharmRes.json();
      // console.log('✓ FDA Pharm Classes loaded');
    }

    if (enrichedClustersRes) {
      window.enrichedClusters = await enrichedClustersRes.json();
      // console.log('✓ Enriched clusters loaded');
    }

    if (clusterContextRes) {
      window.clusterContext = await clusterContextRes.json();
      // console.log('✓ Cluster context loaded');
    }

    // Use clusters.json for visualization if available
    if (clusterData) {
      vizData = clusterData;
    }

    // Report any failed files
    if (failedFiles.length > 0) {
      console.warn(`${failedFiles.length} file(s) failed to load:`, failedFiles);

      // Check if any required files failed
      const requiredFailures = failedFiles.filter((f) => f.required);
      if (requiredFailures.length > 0) {
        const fileList = requiredFailures.map((f) => f.file).join(', ');
        throw new Error(`Required data files missing: ${fileList}`);
      }
    }

    // If none loaded, show error
    if (!clusterData && !statsData) {
      throw new Error('No data files found. Please run the analysis pipeline to generate data.');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    const errorMessage =
      error.message || 'Failed to load data. Please run the analysis pipeline first.';
    showError(errorMessage);
  }
}

/**
 * Initialize filter buttons
 */
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      // Re-render with filter
      renderClusters();
    });
  });
}

/**
 * Render complete dashboard
 */
function renderDashboard() {
  // Render basic stats
  renderStats();

  // Render new statistical visualizations
  if (statsData) {
    renderPoissonTests(statsData);
  }

  // Render timeline
  if (vizData) {
    renderTimeline(vizData);
  }

  // Render cluster sections
  renderClusters();

  // Render unique insights
  renderUniqueInsights();
}

/**
 * Render statistics cards
 */
function renderStats() {
  const summary = clusterData.summary || {};

  // Total drug approvals
  const totalApprovals = summary.total_drug_approvals || 0;
  document.getElementById('total-innovations').textContent = formatNumber(totalApprovals);

  // Cluster count
  document.getElementById('cluster-count').textContent = formatNumber(summary.cluster_count || 0);

  // Peak decade
  const peakDecade = summary.most_innovative_decade;
  if (peakDecade && peakDecade.decade_label) {
    document.getElementById('peak-decade').textContent = peakDecade.decade_label;
  } else {
    document.getElementById('peak-decade').textContent = 'N/A';
  }
}

/**
 * Render cluster lists based on current filter
 */
function renderClusters() {
  if (!clusterData) {
    return;
  }

  // Render FDA drug approval clusters
  renderFDAClusters();
}

/**
 * Render FDA cluster list with enriched context
 */
function renderFDAClusters() {
  const container = document.getElementById('fda-cluster-list');
  const enrichedClusters =
    window.enrichedClusters?.clusters || clusterData.fda_clusters?.clusters || [];
  const context = window.clusterContext || {};

  if (enrichedClusters.length === 0) {
    container.innerHTML = '<div class="loading">No FDA clusters identified</div>';
    return;
  }

  const html = enrichedClusters
    .map((cluster) => {
      const clusterId = `${cluster.start_year}-${cluster.end_year}`;
      const clusterInfo = context[clusterId] || {};

      // Generate therapeutic breakdown HTML
      const therapeuticHtml = cluster.therapeutic_breakdown
        ? cluster.therapeutic_breakdown
            .slice(0, 5)
            .map(
              (area) => `
                <div class="therapeutic-item">
                    <div class="therapeutic-label">${area.area.replace(/\s*\[EPC\]/g, '')}</div>
                    <div class="therapeutic-bar-container">
                        <div class="therapeutic-bar" style="width: ${area.percentage}%"></div>
                        <div class="therapeutic-value">${area.percentage}% (${area.count.toLocaleString()})</div>
                    </div>
                </div>
            `
            )
            .join('')
        : '<p class="no-data">Therapeutic breakdown not available</p>';

      // Generate sponsors HTML
      const sponsorsHtml = cluster.top_sponsors
        ? cluster.top_sponsors
            .map(
              (sponsor, i) => `
                <li><strong>${i + 1}. ${sponsor.name}</strong> — ${sponsor.approvals} approvals</li>
            `
            )
            .join('')
        : '<p class="no-data">Sponsor data not available</p>';

      // Tooltip definitions for historical events
      const eventTooltips = {
        'Hatch-Waxman Act':
          'Landmark law that revolutionized drug approvals. Allowed generic drugs to skip expensive clinical trials if they proved bioequivalence to brand-name drugs. This single law unleashed the modern generic drug industry and dramatically lowered prescription costs.',
        'First Biotech Drug':
          'Humulin (human insulin) was the first drug made using recombinant DNA technology—essentially programming bacteria to produce human proteins. This breakthrough launched the entire biotech industry and paved the way for modern biologics like cancer immunotherapy.',
        'FDA Accelerated Approval':
          'Created during the AIDS crisis, this pathway allows drugs for life-threatening diseases to get approved based on surrogate endpoints (like CD4 counts) rather than waiting years for survival data. Transformed how the FDA evaluates breakthrough therapies.',
        'First Monoclonal Antibody':
          'Orthoclone OKT3 (1986) was the first therapeutic monoclonal antibody, launching a revolution in precision medicine. Today, monoclonal antibodies are among the most successful drug categories, treating everything from cancer to autoimmune diseases.',
      };

      // Generate key events HTML with tooltips
      const eventsHtml = clusterInfo.key_events
        ? clusterInfo.key_events
            .map((event) => {
              const tooltipText = eventTooltips[event.event] || '';
              const eventNameHtml = tooltipText
                ? `<span class="custom-tooltip" data-tooltip="${tooltipText.replace(/"/g, '&quot;')}">${event.event}</span>`
                : event.event;

              return `
                    <div class="key-event-badge">
                        <span class="event-year">${event.year}</span>
                        <span class="event-name">${eventNameHtml}</span>
                    </div>
                `;
            })
            .join('')
        : '';

      // Add tooltip to title if it contains "HIV/AIDS"
      const titleTooltip =
        "The AIDS crisis in the 1990s transformed drug development. The FDA created fast-track approval pathways for life-threatening diseases, and pharmaceutical companies collaborated in unprecedented ways. HAART (combination therapy) turned HIV from a death sentence into a manageable chronic disease—one of medicine's greatest success stories.";
      const titleText = clusterInfo.title || `${cluster.duration_years} Year Drug Approval Surge`;
      const titleHtml = titleText.includes('HIV/AIDS')
        ? `<span class="custom-tooltip" data-tooltip="${titleTooltip.replace(/"/g, '&quot;')}">${titleText}</span>`
        : titleText;

      return `
            <div class="cluster-card" onclick="toggleCluster(this)">
                <div class="cluster-header">
                    <div class="cluster-period">${cluster.start_year}–${cluster.end_year}</div>
                    <div class="cluster-info">
                        <h3>${titleHtml}</h3>
                        ${clusterInfo.subtitle ? `<p class="cluster-subtitle">${clusterInfo.subtitle}</p>` : ''}
                        <div class="cluster-meta">
                            <span>${cluster.total_innovations || cluster.total_approvals_in_period || 0} approvals</span>
                            <span>Avg: ${(cluster.avg_per_year || 0).toFixed(1)}/year</span>
                        </div>
                    </div>
                    <div class="expand-icon">▼</div>
                </div>
                <div class="cluster-details">
                    ${
                      clusterInfo.description
                        ? `
                        <div class="cluster-context">
                            <h4>📖 Historical Context</h4>
                            <p>${markdownToHtml(clusterInfo.description)}</p>
                            ${eventsHtml ? `<div class="key-events">${eventsHtml}</div>` : ''}
                        </div>
                    `
                        : ''
                    }

                    <div class="cluster-section">
                        <h4>🎯 Top Therapeutic Areas</h4>
                        <div class="therapeutic-breakdown">
                            ${therapeuticHtml}
                        </div>
                    </div>

                    <div class="cluster-section">
                        <h4>🏢 Most Active Companies</h4>
                        <ul class="sponsors-list">
                            ${sponsorsHtml}
                        </ul>
                    </div>

                    ${
                      clusterInfo.notable_drug_classes
                        ? `
                        <div class="cluster-section">
                            <h4>💊 Breakthrough Drug Categories</h4>
                            <div class="drug-classes">
                                ${clusterInfo.notable_drug_classes
                                  .map(
                                    (cls) => `
                                    <span class="drug-class-badge">${cls}</span>
                                `
                                  )
                                  .join('')}
                            </div>
                        </div>
                    `
                        : ''
                    }

                    ${
                      clusterInfo.why_it_matters
                        ? `
                        <div class="cluster-impact">
                            <h4>💡 Why It Matters</h4>
                            <p>${markdownToHtml(clusterInfo.why_it_matters)}</p>
                        </div>
                    `
                        : ''
                    }
                </div>
            </div>
        `;
    })
    .join('');

  container.innerHTML = html;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  if (num === null || num === undefined) {
    return '0';
  }
  return num.toLocaleString();
}

/**
 * Show error message
 */
function showError(message) {
  const sections = ['fda-cluster-list', 'tech-categories'];

  sections.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = `
                <div class="loading" style="color: #e74c3c;">
                    <p><strong>⚠️ ${message}</strong></p>
                    <p style="font-size: 0.875rem; margin-top: 1rem;">
                        Please run the pharmaceutical analysis pipeline:
                    </p>
                    <p style="font-size: 0.75rem; font-family: monospace; margin-top: 0.5rem;">
                        python run_complete_analysis.py
                    </p>
                </div>
            `;
    }
  });
}
