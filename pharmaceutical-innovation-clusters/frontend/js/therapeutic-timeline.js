/**
 * Therapeutic Area Timeline Visualization
 * Scatter plot showing individual drug approvals across time within decades
 */

// Color palette for therapeutic areas (pastel palette for better aesthetics)
const THERAPEUTIC_COLORS = {
    "Alzheimer's & Dementia": "#E4ACB2",    // Dusty rose
    "CNS & Neurology": "#EABCA8",           // Peach
    "Cardiovascular": "#FAEDCD",            // Cream
    "Diabetes & Endocrine": "#CCD5AE",      // Sage green
    "Gastrointestinal": "#99BAB9",          // Blue gray
    "Infectious Disease": "#D4A5A5",        // Rose variation
    "Oncology": "#E8B088",                  // Peach variation
    "Pain & Analgesia": "#F5E5B8",          // Cream variation
    "Rare & Orphan Diseases": "#B8C99A",    // Sage variation
    "Respiratory": "#88A5A4",               // Blue gray variation
    "Immunology & Rheumatology": "#F0D0D0", // Light rose
    "Psychiatry": "#F2D4BA",                // Light peach
    "Dermatology": "#FDF8E8"                // Light cream
};

// State management
let currentDecadeIndex = 6;  // Start at 1990s (middle of dataset)
let decades = [];
let therapeuticAreaIndex = {};

/**
 * Generate decade chunks from data
 */
function generateDecades(startYear, endYear) {
    const chunks = [];
    const startDecade = Math.floor(startYear / 10) * 10;
    const endDecade = Math.floor(endYear / 10) * 10;

    for (let year = startDecade; year <= endDecade; year += 10) {
        chunks.push({
            label: `${year}s`,
            start: year,
            end: year + 9
        });
    }
    return chunks;
}

/**
 * Main function to render the therapeutic area timeline as scatter plot
 */
function renderTherapeuticTimeline() {
    const container = document.getElementById('therapeutic-timeline-container');

    if (!container) {
        console.error('Timeline container not found');
        return;
    }

    if (!window.therapeuticTimeline || !window.therapeuticTimeline.approvals) {
        container.innerHTML = '<div class="loading">No timeline data available</div>';
        return;
    }

    const data = window.therapeuticTimeline;

    // Generate decades from data
    decades = generateDecades(data.date_range.start, data.date_range.end);

    // Create therapeutic area index
    data.therapeutic_areas.forEach((area, i) => {
        therapeuticAreaIndex[area] = i;
    });

    // Clear container
    container.innerHTML = '';

    // Add title and description
    const headerDiv = document.createElement('div');
    headerDiv.className = 'timeline-header';
    container.appendChild(headerDiv);

    // Create navigation controls
    const navDiv = document.createElement('div');
    navDiv.className = 'decade-navigation';
    navDiv.innerHTML = `
        <button id="prev-decade" class="nav-arrow" aria-label="Previous decade">◄</button>
        <select id="decade-dropdown" class="decade-select">
            ${decades.map((d, i) => `<option value="${i}">${d.label}</option>`).join('')}
        </select>
        <button id="next-decade" class="nav-arrow" aria-label="Next decade">►</button>
    `;
    container.appendChild(navDiv);

    // Create scatter plot container
    const scatterDiv = document.createElement('div');
    scatterDiv.id = 'therapeutic-scatter';
    container.appendChild(scatterDiv);

    // Setup navigation handlers
    document.getElementById('prev-decade').addEventListener('click', () => navigateDecade(-1));
    document.getElementById('next-decade').addEventListener('click', () => navigateDecade(1));
    document.getElementById('decade-dropdown').addEventListener('change', (e) => {
        currentDecadeIndex = parseInt(e.target.value);
        renderScatterPlot(decades[currentDecadeIndex]);
    });

    // Render initial decade
    renderScatterPlot(decades[currentDecadeIndex]);

    // Initialize dropdown to match currentDecadeIndex
    document.getElementById('decade-dropdown').value = currentDecadeIndex;
}

/**
 * Navigate between decades
 */
function navigateDecade(direction) {
    const newIndex = currentDecadeIndex + direction;

    if (newIndex >= 0 && newIndex < decades.length) {
        currentDecadeIndex = newIndex;
        document.getElementById('decade-dropdown').value = currentDecadeIndex;
        renderScatterPlot(decades[currentDecadeIndex]);
    }
}

/**
 * Generate scatter plot coordinates for drug approvals
 */
function generateScatterCoordinates(approvals) {
    return approvals.map(approval => {
        const area = approval.therapeutic_area;
        const areaIndex = therapeuticAreaIndex[area] || 0;

        // X: Position within decade (0-9) plus jitter
        const yearInDecade = approval.year % 10;
        const xJitter = (Math.random() - 0.5) * 0.8;

        // Y: Therapeutic area index plus jitter
        const yJitter = (Math.random() - 0.5) * 0.8;

        return {
            x: yearInDecade + xJitter,
            y: areaIndex + yJitter,
            drug: approval.drug_name,
            area: area,
            year: approval.year,
            sponsor: approval.sponsor || 'Unknown',
            color: THERAPEUTIC_COLORS[area] || '#999'
        };
    });
}

/**
 * Render scatter plot using D3.js
 */
function renderScatterPlot(decade) {
    const container = document.getElementById('therapeutic-scatter');
    container.innerHTML = '';

    // Filter approvals for this decade
    const approvals = window.therapeuticTimeline.approvals.filter(a =>
        a.year >= decade.start && a.year <= decade.end
    );

    if (approvals.length === 0) {
        container.innerHTML = '<div class="no-data">No approvals in this decade</div>';
        return;
    }

    // Generate coordinates
    const points = generateScatterCoordinates(approvals);

    // Dimensions
    const margin = {top: 60, right: 120, bottom: 80, left: 200};
    const width = 900;
    const height = 600;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleLinear()
        .domain([-0.5, 9.5])
        .range([0, plotWidth]);

    const yScale = d3.scaleLinear()
        .domain([-0.5, Object.keys(therapeuticAreaIndex).length - 0.5])
        .range([0, plotHeight]);

    // X-axis (years within decade)
    const xAxis = d3.axisBottom(xScale)
        .tickValues(d3.range(0, 10))
        .tickFormat(d => decade.start + d);

    g.append('g')
        .attr('transform', `translate(0,${plotHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('fill', '#000')
        .style('font-size', '6px')
        .style('font-family', 'Courier New, monospace');

    g.select('.domain').style('stroke', '#333');
    g.selectAll('.tick line').style('stroke', '#333');

    // Y-axis (therapeutic areas)
    const therapeuticAreas = Object.keys(therapeuticAreaIndex).sort((a, b) =>
        therapeuticAreaIndex[a] - therapeuticAreaIndex[b]
    );

    const yAxis = d3.axisLeft(yScale)
        .tickValues(d3.range(0, therapeuticAreas.length))
        .tickFormat((d, i) => therapeuticAreas[i]);

    g.append('g')
        .call(yAxis)
        .selectAll('text')
        .style('fill', '#333')
        .style('font-size', '6px')
        .style('font-weight', 'bold')
        .style('font-family', 'Courier New, monospace');

    g.select('.domain').style('stroke', '#333');
    g.selectAll('.tick line').style('stroke', '#333');

    // Draw points
    g.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 6)
        .attr('fill', d => d.color)
        .attr('opacity', 0.85)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('r', 8)
                .attr('opacity', 1)
                .attr('stroke', '#000')
                .attr('stroke-width', 2);

            showTooltip(event, d);
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('r', 6)
                .attr('opacity', 0.85)
                .attr('stroke', '#333')
                .attr('stroke-width', 1);

            hideTooltip();
        });

    // Add title showing current decade and count
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .style('fill', '#000')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('font-family', 'Courier New, monospace')
        .text(`${decade.label}: ${approvals.length} Drug Approvals`);

    // Add legend
    addLegend(svg, width, height, therapeuticAreas);
}

/**
 * Add legend for therapeutic areas
 */
function addLegend(svg, width, height, therapeuticAreas) {
    const legendX = width - 180;
    const legendY = 60;
    const legendItemHeight = 20;

    const legend = svg.append('g')
        .attr('transform', `translate(${legendX},${legendY})`);

    legend.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('fill', '#000')
        .style('font-size', '9px')
        .style('font-weight', 'bold')
        .style('font-family', 'Courier New, monospace')
        .text('Therapeutic Areas:');

    therapeuticAreas.slice(0, 5).forEach((area, i) => {
        const y = (i + 1) * legendItemHeight;

        legend.append('circle')
            .attr('cx', 5)
            .attr('cy', y - 5)
            .attr('r', 4)
            .attr('fill', THERAPEUTIC_COLORS[area])
            .attr('opacity', 0.7);

        legend.append('text')
            .attr('x', 15)
            .attr('y', y)
            .style('fill', '#aaa')
            .style('font-size', '10px')
            .style('font-family', 'Courier New, monospace')
            .text(area.length > 15 ? area.substring(0, 15) + '...' : area);
    });
}

/**
 * Show tooltip with drug details
 */
function showTooltip(event, data) {
    let tooltip = d3.select('.scatter-tooltip');

    if (tooltip.empty()) {
        tooltip = d3.select('body')
            .append('div')
            .attr('class', 'scatter-tooltip')
            .style('position', 'absolute')
            .style('background', '#ffffff')
            .style('color', '#1a1a1a')
            .style('padding', '12px')
            .style('border-radius', '4px')
            .style('border', '2px solid #333')
            .style('pointer-events', 'none')
            .style('font-size', '12px')
            .style('font-family', 'Courier New, monospace')
            .style('z-index', '10000')
            .style('max-width', '300px')
            .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');
    }

    tooltip.html(`
        <div style="margin-bottom: 8px;">
            <strong style="color: ${data.color}; font-size: 14px;">${data.drug}</strong>
        </div>
        <div style="color: #1a1a1a; margin-bottom: 6px;">
            <strong>${data.year}</strong>
        </div>
        <div style="margin-bottom: 4px;">
            Area: <strong>${data.area}</strong>
        </div>
        <div style="color: #666; font-size: 11px;">
            Sponsor: ${data.sponsor}
        </div>
    `)
    .style('opacity', 1)
    .style('left', (event.pageX + 15) + 'px')
    .style('top', (event.pageY - 28) + 'px');
}

/**
 * Hide tooltip
 */
function hideTooltip() {
    d3.select('.scatter-tooltip')
        .style('opacity', 0);
}
