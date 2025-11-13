// Network Visualization JavaScript
// Interactive D3.js force-directed graph for symptom relationships

let networkData = null;
let networkStatsData = null;
let svg = null;
let simulation = null;
let selectedNode = null;

// Filter state
let filters = {
  search: '',
  type: 'all',
  minConfidence: 0,
  minLift: 1.0,
};

// Original unfiltered data
let allNodes = [];
let allEdges = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [networkResponse, statsResponse] = await Promise.all([
      fetch('data/symptom_network.json'),
      fetch('data/stats.json'),
    ]);

    networkData = await networkResponse.json();
    networkStatsData = await statsResponse.json();

    if (networkData.nodes.length === 0) {
      document.getElementById('no-data').classList.remove('hidden');
      return;
    }

    initializeNetwork();
    setupEventListeners();
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('no-data').classList.remove('hidden');
  }
});

function setupEventListeners() {
  // Toggle filters panel
  document.getElementById('toggle-filters-btn').addEventListener('click', toggleFiltersPanel);

  // Reset view
  document.getElementById('reset-btn').addEventListener('click', resetView);

  // Search
  document.getElementById('symptom-search').addEventListener('input', handleSearch);

  // Filters
  document.getElementById('type-filter').addEventListener('change', handleTypeFilter);
  document.getElementById('confidence-slider').addEventListener('input', handleConfidenceFilter);
  document.getElementById('lift-slider').addEventListener('input', handleLiftFilter);
  document.getElementById('clear-filters-btn').addEventListener('click', clearAllFilters);
}

function toggleFiltersPanel() {
  const panel = document.getElementById('controls-panel');
  const btn = document.getElementById('toggle-filters-btn');

  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    btn.textContent = '⚙️ Hide Filters';
    btn.setAttribute('aria-expanded', 'true');
  } else {
    panel.classList.add('hidden');
    btn.textContent = '⚙️ Filters';
    btn.setAttribute('aria-expanded', 'false');
  }
}

function handleSearch(event) {
  filters.search = event.target.value.toLowerCase().trim();

  if (filters.search === '') {
    // Clear highlight
    resetView();
    return;
  }

  // Find matching nodes
  const matchingNodes = allNodes.filter((node) => node.id.toLowerCase().includes(filters.search));

  if (matchingNodes.length === 0) {
    // No matches - fade all
    d3.selectAll('.node').classed('faded', true);
    d3.selectAll('.link').classed('faded', true);
    d3.selectAll('.node-label').style('opacity', 0.2);
    updateVisibleStats();
    return;
  }

  // Highlight matches
  const matchingIds = new Set(matchingNodes.map((n) => n.id));

  d3.selectAll('.node')
    .classed('faded', (d) => !matchingIds.has(d.id))
    .classed('connected', (d) => matchingIds.has(d.id));

  d3.selectAll('.link').classed(
    'faded',
    (d) => !matchingIds.has(d.source.id) && !matchingIds.has(d.target.id)
  );

  d3.selectAll('.node-label').style('opacity', (d) => (matchingIds.has(d.id) ? 1 : 0.2));

  updateVisibleStats();
}

function handleTypeFilter(event) {
  filters.type = event.target.value;
  applyFilters();
}

function handleConfidenceFilter(event) {
  const value = parseInt(event.target.value);
  filters.minConfidence = value / 100;
  document.getElementById('confidence-value').textContent = value + '%';
  event.target.setAttribute('aria-valuenow', value);
  applyFilters();
}

function handleLiftFilter(event) {
  const value = parseInt(event.target.value) / 10;
  filters.minLift = value;
  document.getElementById('lift-value').textContent = value.toFixed(1) + 'x';
  event.target.setAttribute('aria-valuenow', event.target.value);
  applyFilters();
}

function clearAllFilters() {
  // Reset filter state
  filters = {
    search: '',
    type: 'all',
    minConfidence: 0,
    minLift: 1.0,
  };

  // Reset UI controls
  document.getElementById('symptom-search').value = '';
  document.getElementById('type-filter').value = 'all';
  document.getElementById('confidence-slider').value = 0;
  document.getElementById('lift-slider').value = 10;
  document.getElementById('confidence-value').textContent = '0%';
  document.getElementById('lift-value').textContent = '1.0x';

  // Reset view
  resetView();
  applyFilters();
}

function applyFilters() {
  // Filter edges by confidence and lift
  const filteredEdges = allEdges.filter(
    (edge) => edge.confidence >= filters.minConfidence && edge.weight >= filters.minLift
  );

  // Find nodes that are connected by filtered edges
  const connectedNodeIds = new Set();
  filteredEdges.forEach((edge) => {
    connectedNodeIds.add(edge.source.id || edge.source);
    connectedNodeIds.add(edge.target.id || edge.target);
  });

  // Filter nodes by type and connectivity
  const filteredNodes = allNodes.filter((node) => {
    // Must be connected by at least one filtered edge
    if (!connectedNodeIds.has(node.id)) {
      return false;
    }

    // Apply type filter
    if (filters.type === 'mental' && !isMentalSymptom(node.id)) {
      return false;
    }
    if (filters.type === 'physical' && !isPhysicalSymptom(node.id)) {
      return false;
    }

    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  // Update visibility
  d3.selectAll('.node')
    .style('display', (d) => (filteredNodeIds.has(d.id) ? 'block' : 'none'))
    .classed('faded', false);

  d3.selectAll('.link')
    .style('display', (d) => {
      const sourceId = d.source.id || d.source;
      const targetId = d.target.id || d.target;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId) ? 'block' : 'none';
    })
    .classed('faded', false);

  d3.selectAll('.node-label')
    .style('display', (d) => (filteredNodeIds.has(d.id) ? 'block' : 'none'))
    .style('opacity', 1);

  updateVisibleStats(filteredNodes.length, filteredEdges.length);
}

function updateVisibleStats(visibleNodes = null, visibleEdges = null) {
  const statsEl = document.getElementById('visible-stats');

  if (visibleNodes === null) {
    // Count visible elements
    visibleNodes = d3
      .selectAll('.node')
      .filter(function () {
        return d3.select(this).style('display') !== 'none' && !d3.select(this).classed('faded');
      })
      .size();

    visibleEdges = d3
      .selectAll('.link')
      .filter(function () {
        return d3.select(this).style('display') !== 'none' && !d3.select(this).classed('faded');
      })
      .size();
  }

  if (visibleNodes === allNodes.length && visibleEdges === allEdges.length) {
    statsEl.textContent = `Showing all ${visibleNodes} symptoms and ${visibleEdges} connections`;
  } else {
    statsEl.textContent = `Showing ${visibleNodes} of ${allNodes.length} symptoms, ${visibleEdges} of ${allEdges.length} connections`;
  }
}

function isMentalSymptom(symptomId) {
  const mentalSymptoms = [
    'anxiety',
    'depression',
    'mood',
    'panic',
    'brain',
    'fog',
    'nervousness',
    'fear',
    'sadness',
    'crying',
    'emotional',
    'irritability',
    'anger',
    'suicidal',
  ];
  return mentalSymptoms.some((mental) => symptomId.toLowerCase().includes(mental));
}

function isPhysicalSymptom(symptomId) {
  const physicalSymptoms = [
    'acne',
    'weight',
    'hair',
    'cramps',
    'bleeding',
    'spotting',
    'headache',
    'nausea',
    'fatigue',
    'sensitivity',
    'libido',
  ];
  return physicalSymptoms.some((physical) => symptomId.toLowerCase().includes(physical));
}

function initializeNetwork() {
  const container = document.getElementById('network-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Store original data for filtering
  allNodes = networkData.nodes;
  allEdges = networkData.edges;

  // Create accessible description for the visualization
  const description = `Interactive network graph showing ${allNodes.length} symptoms and ${allEdges.length} connections. Node size represents symptom frequency, and line thickness represents connection strength. Use tab to navigate nodes, enter to select, and arrow keys to pan.`;

  // Create SVG
  svg = d3
    .select('#network-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', description);

  // Add zoom behavior
  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // Create container for graph elements
  const g = svg.append('g');

  // Create force simulation
  simulation = d3
    .forceSimulation(networkData.nodes)
    .force(
      'link',
      d3
        .forceLink(networkData.edges)
        .id((d) => d.id)
        .distance(100)
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));

  // Create links
  const link = g
    .append('g')
    .selectAll('line')
    .data(networkData.edges)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('stroke-width', (d) => Math.max(1, d.confidence * 5))
    .on('mouseover', showLinkTooltip)
    .on('mouseout', hideTooltip);

  // Create nodes
  const node = g
    .append('g')
    .selectAll('circle')
    .data(networkData.nodes)
    .enter()
    .append('circle')
    .attr('class', 'node')
    .attr('r', (d) => Math.max(10, Math.sqrt(d.frequency) * 3))
    .attr('fill', (d) => getNodeColor(d.id))
    .attr('tabindex', '0')
    .attr('role', 'button')
    .attr('aria-label', (d) => {
      const percentage = ((d.frequency / networkStatsData.posts_with_symptoms) * 100).toFixed(1);
      return `${formatSymptomName(d.id)}: ${d.frequency} posts, ${percentage}%. Press enter to view connections.`;
    })
    .on('click', handleNodeClick)
    .on('keydown', handleNodeKeydown)
    .on('mouseover', showNodeTooltip)
    .on('mouseout', hideTooltip)
    .call(d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded));

  // Create labels
  const label = g
    .append('g')
    .selectAll('text')
    .data(networkData.nodes)
    .enter()
    .append('text')
    .attr('class', 'node-label')
    .text((d) => formatSymptomName(d.id))
    .attr('dy', (d) => Math.max(10, Math.sqrt(d.frequency) * 3) + 15);

  // Update positions on each tick
  simulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

    label.attr('x', (d) => d.x).attr('y', (d) => d.y);
  });

  // Initialize stats display
  updateVisibleStats(networkData.nodes.length, networkData.edges.length);
}

function getNodeColor(symptomId) {
  // Color nodes based on symptom category using pastel colors
  if (isMentalSymptom(symptomId)) {
    return '#E4ACB2'; // Dusty rose for mental symptoms
  } else if (isPhysicalSymptom(symptomId)) {
    return '#99BAB9'; // Blue gray for physical symptoms
  }
  return '#CCD5AE'; // Sage green for ambiguous/other
}

function formatSymptomName(symptom) {
  return symptom
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function showNodeTooltip(event, d) {
  const tooltip = document.getElementById('tooltip');
  const percentage = ((d.frequency / networkStatsData.posts_with_symptoms) * 100).toFixed(1);

  tooltip.innerHTML = `
        <strong>${formatSymptomName(d.id)}</strong><br>
        Frequency: ${d.frequency} posts (${percentage}%)<br>
        <em>Click to see connections</em>
    `;
  tooltip.style.display = 'block';
  tooltip.style.left = event.pageX + 10 + 'px';
  tooltip.style.top = event.pageY - 10 + 'px';
  tooltip.setAttribute('aria-hidden', 'false');
}

function showLinkTooltip(event, d) {
  const tooltip = document.getElementById('tooltip');

  tooltip.innerHTML = `
        <strong>${formatSymptomName(d.source.id)} → ${formatSymptomName(d.target.id)}</strong><br>
        Confidence: ${(d.confidence * 100).toFixed(0)}%<br>
        Lift: ${d.weight.toFixed(2)}x<br>
        Support: ${d.support} posts
    `;
  tooltip.style.display = 'block';
  tooltip.style.left = event.pageX + 10 + 'px';
  tooltip.style.top = event.pageY - 10 + 'px';
  tooltip.setAttribute('aria-hidden', 'false');
}

function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  tooltip.style.display = 'none';
  tooltip.setAttribute('aria-hidden', 'true');
}

function handleNodeKeydown(event, d) {
  // Handle Enter and Space keys for accessibility
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
    handleNodeClick(event, d);
  }
}

function handleNodeClick(event, d) {
  event.stopPropagation();

  // If clicking the same node, deselect
  if (selectedNode === d) {
    resetView();
    return;
  }

  selectedNode = d;

  // Get connected nodes and links
  const connectedNodes = new Set([d.id]);
  const connectedLinks = new Set();

  networkData.edges.forEach((edge) => {
    if (edge.source.id === d.id) {
      connectedNodes.add(edge.target.id);
      connectedLinks.add(edge);
    } else if (edge.target.id === d.id) {
      connectedNodes.add(edge.source.id);
      connectedLinks.add(edge);
    }
  });

  // Update node styles
  d3.selectAll('.node')
    .classed('selected', (node) => node.id === d.id)
    .classed('connected', (node) => connectedNodes.has(node.id) && node.id !== d.id)
    .classed('faded', (node) => !connectedNodes.has(node.id));

  // Update link styles
  d3.selectAll('.link')
    .classed('connected', (link) => connectedLinks.has(link))
    .classed('faded', (link) => !connectedLinks.has(link));

  // Update label opacity
  d3.selectAll('.node-label').style('opacity', (node) => (connectedNodes.has(node.id) ? 1 : 0.2));

  // Show details panel
  showDetailsPanel(d, connectedNodes, connectedLinks);
}

function showDetailsPanel(node, connectedNodes, connectedLinks) {
  const panel = document.getElementById('details-panel');
  const content = document.getElementById('details-content');

  const percentage = ((node.frequency / networkStatsData.posts_with_symptoms) * 100).toFixed(1);

  let html = `
        <div class="mb-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2 capitalize">
                ${formatSymptomName(node.id)}
            </h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <div class="text-sm text-gray-600">Frequency</div>
                    <div class="text-2xl font-bold text-indigo-600">${node.frequency}</div>
                    <div class="text-xs text-gray-500">${percentage}% of posts</div>
                </div>
                <div>
                    <div class="text-sm text-gray-600">Connections</div>
                    <div class="text-2xl font-bold text-purple-600">${connectedNodes.size - 1}</div>
                    <div class="text-xs text-gray-500">related symptoms</div>
                </div>
            </div>
        </div>
    `;

  if (connectedLinks.size > 0) {
    html += `
            <div class="mb-4">
                <h4 class="font-semibold text-gray-900 mb-3">Related Symptoms:</h4>
                <div class="space-y-3">
        `;

    const sortedLinks = Array.from(connectedLinks).sort((a, b) => b.confidence - a.confidence);

    sortedLinks.forEach((link) => {
      const relatedNode = link.source.id === node.id ? link.target : link.source;
      const direction = link.source.id === node.id ? '→' : '←';

      html += `
                <div class="border-l-4 border-indigo-500 pl-4 py-2 bg-gray-50 rounded">
                    <div class="font-medium text-gray-900">
                        ${direction} ${formatSymptomName(relatedNode.id)}
                    </div>
                    <div class="grid grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                            <span class="text-gray-600">Confidence:</span>
                            <strong>${(link.confidence * 100).toFixed(0)}%</strong>
                        </div>
                        <div>
                            <span class="text-gray-600">Lift:</span>
                            <strong>${link.weight.toFixed(2)}x</strong>
                        </div>
                        <div>
                            <span class="text-gray-600">Support:</span>
                            <strong>${link.support} posts</strong>
                        </div>
                    </div>
                </div>
            `;
    });

    html += `
                </div>
            </div>
        `;
  }

  content.innerHTML = html;
  panel.classList.remove('hidden');

  // Scroll to panel
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetView() {
  selectedNode = null;

  // Reset all styles
  d3.selectAll('.node')
    .classed('selected', false)
    .classed('connected', false)
    .classed('faded', false)
    .style('display', 'block');

  d3.selectAll('.link')
    .classed('connected', false)
    .classed('faded', false)
    .style('display', 'block');

  d3.selectAll('.node-label').style('opacity', 1).style('display', 'block');

  // Hide details panel
  document.getElementById('details-panel').classList.add('hidden');

  // Reset zoom
  if (svg) {
    svg.transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity);
  }

  // Update stats
  updateVisibleStats();
}

// Drag functions
function dragStarted(event, d) {
  if (!event.active) {
    simulation.alphaTarget(0.3).restart();
  }
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragEnded(event, d) {
  if (!event.active) {
    simulation.alphaTarget(0);
  }
  d.fx = null;
  d.fy = null;
}

// Handle window resize
window.addEventListener('resize', () => {
  if (svg && simulation) {
    const container = document.getElementById('network-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr('width', width).attr('height', height);
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.alpha(0.3).restart();
  }
});
