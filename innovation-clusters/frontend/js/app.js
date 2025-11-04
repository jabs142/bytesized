/**
 * Innovation Clusters - Frontend Dashboard
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
        // Load all data files in parallel
        const [clustersRes, statsRes, vizRes] = await Promise.all([
            fetch('data/clusters.json'),
            fetch('data/statistical_results.json').catch(() => null),
            fetch('data/timeline_viz.json').catch(() => null)
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

        if (vizRes && vizRes.ok) {
            vizData = await vizRes.json();
            console.log('Visualization data loaded');
        }

        // If none loaded, show error
        if (!clusterData && !statsData && !vizData) {
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

    // Render timeline and comparisons
    if (vizData) {
        renderTimeline(vizData);
        renderIndustryComparison(vizData);
        renderSummaryCards(vizData);
    }

    // Render cluster sections
    renderClusters();
    renderTechCategories();

    // Render unique insights
    renderUniqueInsights();
}

/**
 * Render statistics cards
 */
function renderStats() {
    const summary = clusterData.summary || {};

    // Total innovations
    const totalInnovations = (summary.total_drug_approvals || 0) +
                            (summary.total_breakthrough_patents || 0);
    document.getElementById('total-innovations').textContent =
        formatNumber(totalInnovations);

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

    // Render major overlapping clusters
    if (currentFilter === 'all') {
        renderMajorClusters();
    } else {
        document.getElementById('cluster-list').innerHTML =
            '<div class="loading">Filter to "All Innovations" to see overlapping clusters</div>';
    }

    // Render FDA clusters
    if (currentFilter === 'all' || currentFilter === 'drugs') {
        renderFDAClusters();
    } else {
        document.getElementById('fda-cluster-list').innerHTML = '';
    }

    // Render patent clusters
    if (currentFilter === 'all' || currentFilter === 'patents') {
        renderPatentClusters();
    } else {
        document.getElementById('patent-cluster-list').innerHTML = '';
    }
}

/**
 * Render major overlapping cluster periods
 */
function renderMajorClusters() {
    const container = document.getElementById('cluster-list');
    const clusters = clusterData.major_cluster_periods || [];

    if (clusters.length === 0) {
        container.innerHTML = '<div class="loading">No overlapping cluster periods found</div>';
        return;
    }

    const html = clusters.map(cluster => {
        const period = cluster.period || `${cluster.start_year}–${cluster.end_year}`;
        const overlapScore = (cluster.overlap_score * 100).toFixed(0);

        const fdaCluster = cluster.fda_cluster || {};
        const patentCluster = cluster.patent_cluster || {};

        return `
            <div class="cluster-card" onclick="toggleCluster(this)">
                <div class="cluster-header">
                    <div class="cluster-period">${period}</div>
                    <div class="cluster-info">
                        <h3>Multi-Domain Innovation Surge</h3>
                        <div class="cluster-meta">
                            <span class="cluster-badge">Overlap: ${overlapScore}%</span>
                            <span>${fdaCluster.total_innovations || 0} drugs</span>
                            <span>${patentCluster.total_innovations || 0} patents</span>
                        </div>
                    </div>
                    <div class="expand-icon">▼</div>
                </div>
                <div class="cluster-details">
                    <h4>FDA Drug Approvals</h4>
                    <p>
                        <strong>${fdaCluster.total_innovations || 0} drugs</strong> approved over
                        ${fdaCluster.duration_years || 0} years
                        (${fdaCluster.start_year}–${fdaCluster.end_year})
                    </p>
                    <p>
                        Peak year: ${fdaCluster.peak_year} with ${fdaCluster.peak_count} approvals
                    </p>

                    <h4>Patent Filings</h4>
                    <p>
                        <strong>${patentCluster.total_innovations || 0} breakthrough patents</strong>
                        filed over ${patentCluster.duration_years || 0} years
                        (${patentCluster.start_year}–${patentCluster.end_year})
                    </p>
                    <p>
                        Peak year: ${patentCluster.peak_year} with ${patentCluster.peak_count} patents
                    </p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
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
 * Render patent cluster list
 */
function renderPatentClusters() {
    const container = document.getElementById('patent-cluster-list');
    const clusters = clusterData.patent_clusters?.clusters || [];

    if (clusters.length === 0) {
        container.innerHTML = '<div class="loading">No patent clusters identified</div>';
        return;
    }

    const html = clusters.map(cluster => {
        return `
            <div class="cluster-card" onclick="toggleCluster(this)">
                <div class="cluster-header">
                    <div class="cluster-period">${cluster.start_year}–${cluster.end_year}</div>
                    <div class="cluster-info">
                        <h3>${cluster.duration_years} Year Patent Surge</h3>
                        <div class="cluster-meta">
                            <span>${cluster.total_innovations} patents</span>
                            <span>Avg: ${cluster.avg_per_year.toFixed(1)}/year</span>
                        </div>
                    </div>
                    <div class="expand-icon">▼</div>
                </div>
                <div class="cluster-details">
                    <h4>Details</h4>
                    <p>
                        This period generated <strong>${cluster.total_innovations} breakthrough patents</strong>
                        over ${cluster.duration_years} years, averaging ${cluster.avg_per_year.toFixed(1)}
                        high-impact patents per year.
                    </p>
                    <p>
                        Peak year: <strong>${cluster.peak_year}</strong> with ${cluster.peak_count} patents
                    </p>
                    <p>
                        These breakthrough patents (top 10% by citation count) represent fundamental
                        technological advances across pharmaceuticals, semiconductors, telecommunications,
                        and computing.
                    </p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Render technology category breakdown
 */
function renderTechCategories() {
    const container = document.getElementById('tech-categories');

    // This would be populated from patent data
    // For now, show placeholder
    const categories = [
        { name: 'Pharmaceuticals', count: 0, code: 'A61K' },
        { name: 'Semiconductors', count: 0, code: 'H01L' },
        { name: 'Telecommunications', count: 0, code: 'H04' },
        { name: 'Computing', count: 0, code: 'G06F' }
    ];

    const html = categories.map(cat => `
        <div class="tech-card">
            <h3>${cat.name}</h3>
            <div class="tech-count">${formatNumber(cat.count)}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
                CPC: ${cat.code}
            </div>
        </div>
    `).join('');

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
        'cluster-list',
        'fda-cluster-list',
        'patent-cluster-list',
        'tech-categories'
    ];

    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = `
                <div class="loading" style="color: #e74c3c;">
                    <p><strong>⚠️ ${message}</strong></p>
                    <p style="font-size: 0.875rem; margin-top: 1rem;">
                        Please run the data collection pipeline first:
                    </p>
                    <p style="font-size: 0.75rem; font-family: monospace; margin-top: 0.5rem;">
                        python src/data_collection/fda_collector.py<br>
                        python src/data_collection/patent_collector.py<br>
                        python src/analysis/cluster_analyzer.py<br>
                        python src/analysis/export_frontend_data.py
                    </p>
                </div>
            `;
        }
    });
}
