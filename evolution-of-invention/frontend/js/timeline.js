/**
 * Evolution of Invention - Timeline Controller
 */

// State
let data = null;
let currentIndex = 0;
let isPlaying = false;
let playInterval = null;
let graphBars = []; // Store bar positions for interactivity

// Elements
const slider = document.getElementById('timeline-slider');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const playText = document.getElementById('playText');
const currentYearEl = document.getElementById('currentYear');
const nextYearEl = document.getElementById('nextYear');
const yearGapEl = document.getElementById('yearGap');
const eraNameEl = document.getElementById('era-name');
const eraDescEl = document.getElementById('era-description');
const eraIconEl = document.querySelector('.era-icon');
const timelineProgress = document.getElementById('timeline-progress');
const timelineMarkers = document.getElementById('timeline-markers');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');

// Era icons mapping
const eraIcons = {
    'stone': '🪨',
    'ancient': '🏛️',
    'renaissance': '📚',
    'industrial': '⚙️',
    'modern': '🚀',
    'digital': '💻',
    'ai': '🤖'
};

// Load data
async function loadData() {
    try {
        const response = await fetch('data/inventions.json');
        data = await response.json();
        initializeTimeline();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Initialize timeline
function initializeTimeline() {
    createMarkers();
    updateDisplay(0);
    drawAccelerationGraph();
}

// Create timeline markers
function createMarkers() {
    const inventions = data.inventions;
    const minYear = inventions[0].year;
    const maxYear = inventions[inventions.length - 1].year;
    const range = maxYear - minYear;

    inventions.forEach((invention, index) => {
        const marker = document.createElement('div');
        marker.className = `timeline-marker ${invention.dismissed ? 'dismissed' : 'accepted'}`;
        marker.innerHTML = invention.icon;
        marker.dataset.index = index;

        // Calculate position
        const position = ((invention.year - minYear) / range) * 100;
        marker.style.left = `${position}%`;

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'marker-tooltip';
        tooltip.textContent = `${invention.name} (${formatYear(invention.year)})`;
        marker.appendChild(tooltip);

        // Add click handler
        if (invention.dismissed) {
            marker.style.cursor = 'pointer';
            marker.addEventListener('click', () => showModal(invention));
        }

        timelineMarkers.appendChild(marker);
    });
}

// Update display based on slider position
function updateDisplay(percentage) {
    const inventions = data.inventions;
    const totalInventions = inventions.length - 1;
    const index = Math.floor((percentage / 100) * totalInventions);

    currentIndex = index;
    const currentInvention = inventions[index];
    const nextInvention = inventions[Math.min(index + 1, totalInventions)];

    // Update progress bar
    timelineProgress.style.width = `${percentage}%`;

    // Update year display
    currentYearEl.textContent = formatYear(currentInvention.year);
    nextYearEl.textContent = formatYear(nextInvention.year);

    // Calculate and display year gap
    const gap = Math.abs(nextInvention.year - currentInvention.year);
    if (gap >= 1000) {
        yearGapEl.textContent = `${(gap / 1000).toFixed(1)}k years`;
    } else if (gap >= 1) {
        yearGapEl.textContent = `${gap} years`;
    } else {
        yearGapEl.textContent = `< 1 year`;
    }

    // Update era
    updateEra(currentInvention);
}

// Update era display
function updateEra(invention) {
    const era = data.eras.find(e => e.id === invention.era);
    if (era) {
        eraNameEl.textContent = era.name.toLowerCase();
        eraDescEl.textContent = era.description;
        eraIconEl.textContent = eraIcons[era.id] || '⚙️';
    }
}

// Format year for display
function formatYear(year) {
    if (year < 0) {
        return `${Math.abs(year).toLocaleString()} BCE`;
    } else if (year < 100) {
        return `${year} CE`;
    } else {
        return year.toString();
    }
}

// Show modal for dismissed inventions
function showModal(invention) {
    document.getElementById('modal-icon').textContent = invention.icon;
    document.getElementById('modal-title').textContent = invention.name;
    document.getElementById('modal-quote').textContent = `"${invention.dismissalQuote}"`;
    document.getElementById('modal-who').textContent = `— ${invention.dismissedBy}`;
    document.getElementById('modal-when').textContent = `(${invention.dismissalYear})`;
    document.getElementById('modal-impact').textContent = invention.impact;
    document.getElementById('modal-fact').textContent = invention.funFact;

    modal.classList.add('show');
}

// Close modal
function closeModal() {
    modal.classList.remove('show');
}

// Play/pause animation
function togglePlay() {
    isPlaying = !isPlaying;

    if (isPlaying) {
        playIcon.textContent = '⏸';
        playText.textContent = 'pause';
        startPlaying();
    } else {
        playIcon.textContent = '▶';
        playText.textContent = 'play';
        stopPlaying();
    }
}

function startPlaying() {
    playInterval = setInterval(() => {
        let currentValue = parseFloat(slider.value);
        currentValue += 0.5; // Speed of playback

        if (currentValue >= 100) {
            currentValue = 0; // Loop back to start
        }

        slider.value = currentValue;
        updateDisplay(currentValue);
    }, 50); // 50ms interval for smooth animation
}

function stopPlaying() {
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
}

// Draw acceleration graph
function drawAccelerationGraph() {
    const canvas = document.getElementById('acceleration-graph');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const inventions = data.inventions;
    const padding = 40;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#F7F6F3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate gaps between inventions (in years)
    const gaps = [];
    for (let i = 0; i < inventions.length - 1; i++) {
        const gap = Math.abs(inventions[i + 1].year - inventions[i].year);
        gaps.push({ gap, index: i });
    }

    // Find max gap for scaling (log scale)
    const maxGap = Math.max(...gaps.map(g => g.gap));
    const minGap = Math.min(...gaps.map(g => g.gap));

    // Draw bars and store positions
    const barWidth = graphWidth / gaps.length;
    graphBars = []; // Reset

    gaps.forEach((item, i) => {
        // Log scale for better visualization
        const logGap = Math.log10(item.gap + 1);
        const maxLog = Math.log10(maxGap + 1);
        const height = (logGap / maxLog) * graphHeight;

        const x = padding + i * barWidth;
        const y = padding + graphHeight - height;

        // Store bar info for interactivity
        const invention = inventions[item.index];
        const nextInvention = inventions[item.index + 1];
        graphBars.push({
            x, y, width: barWidth - 2, height,
            invention,
            nextInvention,
            gap: item.gap
        });

        // Color based on era
        const era = data.eras.find(e => e.id === invention.era);
        ctx.fillStyle = era ? era.color : '#5C9EAD';

        ctx.fillRect(x, y, barWidth - 2, height);
    });

    // Draw axes
    ctx.strokeStyle = '#E9E9E7';
    ctx.lineWidth = 2;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#787774';
    ctx.font = '12px SF Mono, Monaco, monospace';
    ctx.textAlign = 'right';

    // Y-axis label
    ctx.fillText('years between', padding - 5, padding - 10);

    // X-axis label (time progression)
    ctx.textAlign = 'center';
    ctx.fillText('time →', canvas.width / 2, canvas.height - 5);
}

// Show graph tooltip
function showGraphTooltip(bar, mouseX, mouseY) {
    const canvas = document.getElementById('acceleration-graph');
    const tooltip = document.getElementById('graph-tooltip');

    if (!tooltip) return;

    // Format gap for display
    let gapText;
    if (bar.gap >= 1000) {
        gapText = `${(bar.gap / 1000).toFixed(1)}k years`;
    } else if (bar.gap >= 1) {
        gapText = `${bar.gap} years`;
    } else {
        gapText = `< 1 year`;
    }

    tooltip.innerHTML = `
        <strong>${bar.invention.name}</strong> → ${bar.nextInvention.name}<br>
        Gap: ${gapText}
    `;

    // Position tooltip near mouse
    const rect = canvas.getBoundingClientRect();
    tooltip.style.left = `${mouseX + 10}px`;
    tooltip.style.top = `${mouseY - 10}px`;
    tooltip.style.display = 'block';
}

function hideGraphTooltip() {
    const tooltip = document.getElementById('graph-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Event listeners
slider.addEventListener('input', (e) => {
    updateDisplay(parseFloat(e.target.value));
});

playBtn.addEventListener('click', togglePlay);
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
    } else if (e.key === 'ArrowLeft') {
        slider.value = Math.max(0, parseFloat(slider.value) - 1);
        updateDisplay(parseFloat(slider.value));
    } else if (e.key === 'ArrowRight') {
        slider.value = Math.min(100, parseFloat(slider.value) + 1);
        updateDisplay(parseFloat(slider.value));
    }
});

// Resize handler for graph
window.addEventListener('resize', () => {
    if (data) {
        drawAccelerationGraph();
    }
});

// Graph interactivity
const graphCanvas = document.getElementById('acceleration-graph');
graphCanvas.addEventListener('mousemove', (e) => {
    const rect = graphCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find which bar is being hovered
    let hoveredBar = null;
    for (const bar of graphBars) {
        if (mouseX >= bar.x && mouseX <= bar.x + bar.width &&
            mouseY >= bar.y && mouseY <= bar.y + bar.height) {
            hoveredBar = bar;
            break;
        }
    }

    if (hoveredBar) {
        graphCanvas.style.cursor = 'pointer';
        showGraphTooltip(hoveredBar, e.clientX, e.clientY);
    } else {
        graphCanvas.style.cursor = 'default';
        hideGraphTooltip();
    }
});

graphCanvas.addEventListener('mouseleave', () => {
    hideGraphTooltip();
});

graphCanvas.addEventListener('click', (e) => {
    const rect = graphCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find which bar was clicked
    for (const bar of graphBars) {
        if (mouseX >= bar.x && mouseX <= bar.x + bar.width &&
            mouseY >= bar.y && mouseY <= bar.y + bar.height) {
            // If dismissed, show modal
            if (bar.invention.dismissed) {
                showModal(bar.invention);
            }
            break;
        }
    }
});

// Initialize on load
loadData();
