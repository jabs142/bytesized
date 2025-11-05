/**
 * Pharmaceutical Innovation Clusters - Frontend Dashboard
 * Handles data loading, filtering, and rendering
 */

let clusterData = null;
let statsData = null;
let industryData = null;
let vizData = null;
let currentFilter = 'all';

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
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
        // Load all pharmaceutical data files in parallel
        const [clustersRes, statsRes, therapeuticRes, neglectRes, timelineRes, fdaPharmRes] = await Promise.all([
            fetch('data/clusters.json'),
            fetch('../data/processed/statistical_results.json').catch(() => null),
            fetch('../data/processed/therapeutic_trends.json').catch(() => null),
            fetch('../data/unique_angles/neglected_diseases.json').catch(() => null),
            fetch('../data/processed/therapeutic_timeline.json').catch(() => null),
            fetch('../data/processed/fda_pharm_classes.json').catch(() => null)
        ]);

        // Parse responses
        if (clustersRes.ok) {
            clusterData = await clustersRes.json();
            console.log('Cluster data loaded');
        }

        if (statsRes && statsRes.ok) {
            statsData = await statsRes.json();
            console.log('Statistical data loaded');
        }

        if (therapeuticRes && therapeuticRes.ok) {
            window.therapeuticData = await therapeuticRes.json();
            console.log('Therapeutic data loaded');
        }

        if (neglectRes && neglectRes.ok) {
            window.neglectData = await neglectRes.json();
            console.log('Neglect data loaded:', window.neglectData);
        }

        if (timelineRes && timelineRes.ok) {
            window.therapeuticTimeline = await timelineRes.json();
            console.log('Timeline data loaded:', window.therapeuticTimeline.total_records, 'approvals');
        }

        if (fdaPharmRes && fdaPharmRes.ok) {
            window.fdaPharmClasses = await fdaPharmRes.json();
            console.log('FDA Pharm Classes loaded:', window.fdaPharmClasses.total_pharm_classes, 'classes');
        }

        // Use clusters.json for visualization if available
        if (clusterData) {
            vizData = clusterData;
        }

        // If none loaded, show error
        if (!clusterData && !statsData) {
            throw new Error('No data files found');
        }

    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please run the analysis pipeline first.');
    }
}

/**
 * Initialize filter buttons
 */
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update filter
            currentFilter = button.dataset.category;

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
        renderStatisticalSummary(statsData);
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
    document.getElementById('total-innovations').textContent =
        formatNumber(totalApprovals);

    // Cluster count
    document.getElementById('cluster-count').textContent =
        formatNumber(summary.cluster_count || 0);

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
    if (!clusterData) return;

    // Render FDA drug approval clusters
    renderFDAClusters();
}


/**
 * Render FDA cluster list
 */
function renderFDAClusters() {
    const container = document.getElementById('fda-cluster-list');
    const clusters = clusterData.fda_clusters?.clusters || [];

    if (clusters.length === 0) {
        container.innerHTML = '<div class="loading">No FDA clusters identified</div>';
        return;
    }

    const html = clusters.map(cluster => {
        return `
            <div class="cluster-card" onclick="toggleCluster(this)">
                <div class="cluster-header">
                    <div class="cluster-period">${cluster.start_year}–${cluster.end_year}</div>
                    <div class="cluster-info">
                        <h3>${cluster.duration_years} Year Drug Approval Surge</h3>
                        <div class="cluster-meta">
                            <span>${cluster.total_innovations} approvals</span>
                            <span>Avg: ${cluster.avg_per_year.toFixed(1)}/year</span>
                        </div>
                    </div>
                    <div class="expand-icon">▼</div>
                </div>
                <div class="cluster-details">
                    <h4>Details</h4>
                    <p>
                        This period saw <strong>${cluster.total_innovations} drug approvals</strong>
                        over ${cluster.duration_years} years, averaging ${cluster.avg_per_year.toFixed(1)}
                        approvals per year.
                    </p>
                    <p>
                        Peak year: <strong>${cluster.peak_year}</strong> with ${cluster.peak_count} approvals
                    </p>
                    <p>
                        This cluster represents a period of ${cluster.avg_per_year > 50 ? 'exceptional' : 'elevated'}
                        pharmaceutical innovation, significantly above the historical mean.
                    </p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}


/**
 * Render top 10 individual diseases by approval count as horizontal bar chart
 */
function renderTechCategories() {
    const container = document.getElementById('top-diseases-chart');

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

    // Sort by total approvals (descending) and take top 10
    const top10 = allDiseases
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    const maxCount = Math.max(...top10.map(d => d.total));

    let html = `
        <div class="patterns-section">
            <div class="category-bars">
    `;

    top10.forEach(disease => {
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
 * Toggle cluster card expansion
 */
function toggleCluster(element) {
    element.classList.toggle('expanded');
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
}

/**
 * Show error message
 */
function showError(message) {
    const sections = [
        'fda-cluster-list',
        'tech-categories'
    ];

    sections.forEach(id => {
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
