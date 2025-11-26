/**
 * AI Healthcare Fundamentals - Interactive Demonstrations
 * All interactive visualizations and demos
 */

// Initialize all demos when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initDistributionShiftDemo();
  initROCDemo();
  initCalibrationDemo();
  initPrevalenceDemo();
});

/* ============================================
   DISTRIBUTION SHIFT DEMO
   ============================================ */

function initDistributionShiftDemo() {
  const container = document.getElementById('distribution-shift-demo');
  if (!container) {
    return;
  }

  // Create demo HTML
  container.innerHTML = `
    <div class="demo-controls">
      <label>
        Year: <span id="year-display" style="color: var(--gb-darkest); font-size: 1rem;">2019</span>
      </label>
      <input type="range" id="year-slider" min="2015" max="2024" value="2019" step="1">

      <div class="shift-toggles">
        <label>
          <input type="checkbox" id="covid-impact">
          Add COVID-19 Impact (2020+)
        </label>
        <label>
          <input type="checkbox" id="ehr-change">
          EHR System Change (2022+)
        </label>
      </div>
    </div>

    <div class="metrics-display">
      <div class="metric-card" title="Area Under the Receiver Operating Characteristic curve - measures how well the model ranks predictions (0.5 = random, 1.0 = perfect)">
        <div class="metric-value" id="auroc-value">0.85</div>
        <div class="metric-label">AUROC</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" id="calibration-value">Good</div>
        <div class="metric-label">Calibration</div>
      </div>
      <div class="metric-card" title="Positive Predictive Value - probability that a positive test result is correct">
        <div class="metric-value" id="ppv-value">75%</div>
        <div class="metric-label">PPV</div>
      </div>
    </div>

    <canvas id="shift-chart" width="600" height="200"></canvas>
  `;

  // Get elements
  const yearSlider = document.getElementById('year-slider');
  const yearDisplay = document.getElementById('year-display');
  const covidCheckbox = document.getElementById('covid-impact');
  const ehrCheckbox = document.getElementById('ehr-change');
  const canvas = document.getElementById('shift-chart');
  const ctx = canvas.getContext('2d');

  // Adjust canvas for retina displays
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 600 * dpr;
  canvas.height = 200 * dpr;
  canvas.style.width = '600px';
  canvas.style.height = '200px';
  ctx.scale(dpr, dpr);

  // Update function
  function updateShift() {
    const year = parseInt(yearSlider.value);
    const covidImpact = covidCheckbox.checked;
    const ehrChange = ehrCheckbox.checked;

    yearDisplay.textContent = year;

    // Calculate performance metrics
    const metrics = calculateShiftMetrics(year, covidImpact, ehrChange);

    // Update metric displays
    document.getElementById('auroc-value').textContent = metrics.auroc.toFixed(2);
    document.getElementById('calibration-value').textContent = metrics.calibration;
    document.getElementById('ppv-value').textContent = `${metrics.ppv}%`;

    // Draw chart
    drawShiftChart(ctx, year, covidImpact, ehrChange);
  }

  // Event listeners
  yearSlider.addEventListener('input', updateShift);
  covidCheckbox.addEventListener('change', updateShift);
  ehrCheckbox.addEventListener('change', updateShift);

  // Initial render
  updateShift();
}

function calculateShiftMetrics(year, covidImpact, ehrChange) {
  let auroc = 0.85; // Baseline from training (2015-2018)
  let ppv = 75;

  // Temporal drift: 2% per year after training
  const yearsSinceTraining = Math.max(0, year - 2018);
  auroc -= yearsSinceTraining * 0.02;
  ppv -= yearsSinceTraining * 2;

  // COVID impact
  if (covidImpact && year >= 2020) {
    auroc -= 0.15;
    ppv -= 15;
  }

  // EHR system change
  if (ehrChange && year >= 2022) {
    auroc -= 0.08;
    ppv -= 10;
  }

  // Bound values
  auroc = Math.max(0.5, Math.min(1.0, auroc));
  ppv = Math.max(30, Math.min(90, ppv));

  // Determine calibration status
  let calibration = 'Good';
  if (auroc < 0.7) {
    calibration = 'Poor';
  } else if (auroc < 0.75) {
    calibration = 'Fair';
  }

  return { auroc, ppv, calibration };
}

function drawShiftChart(ctx, currentYear, covidImpact, ehrChange) {
  const width = 600;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // Draw axes
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Draw y-axis labels (AUROC)
  ctx.fillStyle = '#2a2a2a';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 10; i++) {
    const y = height - padding - (i / 10) * chartHeight;
    const value = (0.5 + i * 0.05).toFixed(2);
    ctx.fillText(value, padding - 10, y + 4);
  }

  // Y-axis label
  ctx.save();
  ctx.translate(8, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('AUROC', 0, 0);
  ctx.restore();

  // Draw x-axis labels (Years)
  ctx.textAlign = 'center';
  for (let year = 2015; year <= 2024; year++) {
    const x = padding + ((year - 2015) / 9) * chartWidth;
    ctx.fillText(year.toString(), x, height - padding + 20);
  }

  // X-axis label
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Year', width / 2, height - 10);

  // Draw performance line
  ctx.strokeStyle = '#306230';
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let year = 2015; year <= 2024; year++) {
    const metrics = calculateShiftMetrics(
      year,
      covidImpact && year >= 2020,
      ehrChange && year >= 2022
    );
    const x = padding + ((year - 2015) / 9) * chartWidth;
    const y = height - padding - ((metrics.auroc - 0.5) / 0.5) * chartHeight;

    if (year === 2015) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Highlight current year
  const metrics = calculateShiftMetrics(currentYear, covidImpact, ehrChange);
  const currentX = padding + ((currentYear - 2015) / 9) * chartWidth;
  const currentY = height - padding - ((metrics.auroc - 0.5) / 0.5) * chartHeight;

  ctx.fillStyle = '#8bac0f';
  ctx.beginPath();
  ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#0f380f';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw event markers
  if (covidImpact) {
    const covidX = padding + ((2020 - 2015) / 9) * chartWidth;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(covidX, padding);
    ctx.lineTo(covidX, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('COVID-19', covidX, padding - 10);
  }

  if (ehrChange) {
    const ehrX = padding + ((2022 - 2015) / 9) * chartWidth;
    ctx.strokeStyle = '#f57c00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ehrX, padding);
    ctx.lineTo(ehrX, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f57c00';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('EHR Change', ehrX, padding - 10);
  }

  // Training period indicator
  ctx.fillStyle = 'rgba(139, 172, 15, 0.2)';
  const trainStart = padding;
  const trainEnd = padding + ((2018 - 2015) / 9) * chartWidth;
  ctx.fillRect(trainStart, padding, trainEnd - trainStart, chartHeight);

  ctx.fillStyle = '#306230';
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Training Period', (trainStart + trainEnd) / 2, padding + 15);
}

/* ============================================
   ROC CURVE DEMO
   ============================================ */

function initROCDemo() {
  const container = document.getElementById('roc-demo-container');
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="demo-controls">
      <label>
        Decision Threshold: <span id="threshold-display">0.50</span>
      </label>
      <input type="range" id="threshold-slider" min="0" max="100" value="50" step="1">
    </div>

    <div class="metrics-display">
      <div class="metric-card">
        <div class="metric-value" id="sensitivity-value">80%</div>
        <div class="metric-label">Sensitivity</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" id="specificity-value">80%</div>
        <div class="metric-label">Specificity</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" id="roc-auroc-value">0.88</div>
        <div class="metric-label">AUROC</div>
      </div>
    </div>

    <canvas id="roc-canvas" width="400" height="400"></canvas>
  `;

  const thresholdSlider = document.getElementById('threshold-slider');
  const thresholdDisplay = document.getElementById('threshold-display');
  const canvas = document.getElementById('roc-canvas');
  const ctx = canvas.getContext('2d');

  // Adjust canvas for retina
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 400 * dpr;
  canvas.height = 400 * dpr;
  canvas.style.width = '400px';
  canvas.style.height = '400px';
  ctx.scale(dpr, dpr);

  function updateROC() {
    const threshold = parseInt(thresholdSlider.value) / 100;
    thresholdDisplay.textContent = threshold.toFixed(2);

    // Calculate metrics at this threshold
    const metrics = calculateROCMetrics(threshold);

    document.getElementById('sensitivity-value').textContent =
      `${Math.round(metrics.sensitivity * 100)}%`;
    document.getElementById('specificity-value').textContent =
      `${Math.round(metrics.specificity * 100)}%`;

    drawROCCurve(ctx, threshold);
  }

  thresholdSlider.addEventListener('input', updateROC);
  updateROC();
}

function calculateROCMetrics(threshold) {
  // Simulated relationship between threshold and sensitivity/specificity
  // Higher threshold = more conservative = lower sensitivity, higher specificity
  const sensitivity = 1 - threshold * 0.9; // Decreases as threshold increases
  const specificity = threshold * 0.9; // Increases as threshold increases

  return { sensitivity, specificity };
}

function drawROCCurve(ctx, currentThreshold) {
  const size = 400;
  const padding = 50;
  const chartSize = size - 2 * padding;

  // Clear
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Draw diagonal (random classifier)
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, size - padding);
  ctx.lineTo(size - padding, padding);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw ROC curve
  ctx.strokeStyle = '#306230';
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let fpr = 0; fpr <= 1; fpr += 0.01) {
    // Simulated ROC curve (convex, above diagonal)
    const tpr = 1 - Math.pow(1 - fpr, 1.5);
    const x = padding + fpr * chartSize;
    const y = size - padding - tpr * chartSize;

    if (fpr === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Highlight current operating point
  const metrics = calculateROCMetrics(currentThreshold);
  const fpr = 1 - metrics.specificity;
  const tpr = metrics.sensitivity;
  const pointX = padding + fpr * chartSize;
  const pointY = size - padding - tpr * chartSize;

  ctx.fillStyle = '#8bac0f';
  ctx.beginPath();
  ctx.arc(pointX, pointY, 8, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#0f380f';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw axes
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, size - padding);
  ctx.lineTo(size - padding, size - padding);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#2a2a2a';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';

  // X-axis
  for (let i = 0; i <= 10; i++) {
    const x = padding + (i / 10) * chartSize;
    const label = (i / 10).toFixed(1);
    ctx.fillText(label, x, size - padding + 20);
  }
  ctx.font = 'bold 16px Arial';
  ctx.fillText('False Positive Rate (1 - Specificity)', size / 2, size - 15);

  // Y-axis
  ctx.font = '14px Arial';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 10; i++) {
    const y = size - padding - (i / 10) * chartSize;
    const label = (i / 10).toFixed(1);
    ctx.fillText(label, padding - 10, y + 5);
  }

  ctx.save();
  ctx.translate(15, size / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('True Positive Rate (Sensitivity)', 0, 0);
  ctx.restore();

  // AUROC label
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#306230';
  ctx.fillText('AUROC = 0.88', padding + 20, padding + 30);
}

/* ============================================
   CALIBRATION DEMO
   ============================================ */

function initCalibrationDemo() {
  const container = document.getElementById('calibration-demo-container');
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
      <div>
        <h4 style="font-family: var(--font-pixel); font-size: 0.5rem; margin-bottom: 0.5rem; text-align: center;">Well-Calibrated Model</h4>
        <canvas id="calibration-good" width="300" height="300"></canvas>
      </div>
      <div>
        <h4 style="font-family: var(--font-pixel); font-size: 0.5rem; margin-bottom: 0.5rem; text-align: center;">Poorly-Calibrated Model</h4>
        <canvas id="calibration-poor" width="300" height="300"></canvas>
      </div>
    </div>
  `;

  const goodCanvas = document.getElementById('calibration-good');
  const poorCanvas = document.getElementById('calibration-poor');

  drawCalibrationPlot(goodCanvas, true);
  drawCalibrationPlot(poorCanvas, false);
}

function drawCalibrationPlot(canvas, wellCalibrated) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 300 * dpr;
  canvas.height = 300 * dpr;
  canvas.style.width = '300px';
  canvas.style.height = '300px';
  ctx.scale(dpr, dpr);

  const size = 300;
  const padding = 45;
  const chartSize = size - 2 * padding;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Perfect calibration line
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, size - padding);
  ctx.lineTo(size - padding, padding);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw calibration curve
  ctx.strokeStyle = wellCalibrated ? '#306230' : '#e74c3c';
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let pred = 0; pred <= 1; pred += 0.1) {
    let actual;
    if (wellCalibrated) {
      // Add small random noise
      actual = pred + (Math.random() - 0.5) * 0.1;
      actual = Math.max(0, Math.min(1, actual));
    } else {
      // Systematic over-prediction
      actual = pred * 0.6 + 0.1;
    }

    const x = padding + pred * chartSize;
    const y = size - padding - actual * chartSize;

    if (pred === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    // Draw points
    ctx.fillStyle = wellCalibrated ? '#8bac0f' : '#c62828';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Axes
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, size - padding);
  ctx.lineTo(size - padding, size - padding);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#2a2a2a';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Predicted Probability', size / 2, size - 10);

  ctx.save();
  ctx.translate(15, size / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Actual Probability', 0, 0);
  ctx.restore();
}

/* ============================================
   PREVALENCE DEMO
   ============================================ */

function initPrevalenceDemo() {
  const container = document.getElementById('prevalence-demo-container');
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="demo-controls">
      <label>
        Disease Prevalence: <span id="prevalence-display">10%</span>
      </label>
      <input type="range" id="prevalence-slider" min="1" max="50" value="10" step="1">
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">
        Assumes test with 90% sensitivity and 90% specificity
      </p>
    </div>

    <div class="metrics-display">
      <div class="metric-card">
        <div class="metric-value" id="ppv-demo-value">50%</div>
        <div class="metric-label">PPV</div>
        <div style="font-size: 0.75rem; margin-top: 0.25rem; color: var(--text-secondary);">Positive Predictive Value</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" id="npv-demo-value">99%</div>
        <div class="metric-label">NPV</div>
        <div style="font-size: 0.75rem; margin-top: 0.25rem; color: var(--text-secondary);">Negative Predictive Value</div>
      </div>
    </div>

    <canvas id="prevalence-canvas" width="450" height="350"></canvas>
  `;

  const slider = document.getElementById('prevalence-slider');
  const display = document.getElementById('prevalence-display');
  const canvas = document.getElementById('prevalence-canvas');

  function updatePrevalence() {
    const prevalence = parseInt(slider.value) / 100;
    display.textContent = `${Math.round(prevalence * 100)}%`;

    const metrics = calculatePPVNPV(prevalence, 0.9, 0.9);
    document.getElementById('ppv-demo-value').textContent = `${Math.round(metrics.ppv * 100)}%`;
    document.getElementById('npv-demo-value').textContent = `${Math.round(metrics.npv * 100)}%`;

    drawConfusionMatrix(canvas, prevalence, 0.9, 0.9);
  }

  slider.addEventListener('input', updatePrevalence);
  updatePrevalence();
}

function calculatePPVNPV(prevalence, sensitivity, specificity) {
  const tp = prevalence * sensitivity;
  const fp = (1 - prevalence) * (1 - specificity);
  const fn = prevalence * (1 - sensitivity);
  const tn = (1 - prevalence) * specificity;

  const ppv = tp / (tp + fp);
  const npv = tn / (tn + fn);

  return { ppv, npv, tp, fp, fn, tn };
}

function drawConfusionMatrix(canvas, prevalence, sensitivity, specificity) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 450 * dpr;
  canvas.height = 350 * dpr;
  canvas.style.width = '450px';
  canvas.style.height = '350px';
  ctx.scale(dpr, dpr);

  const metrics = calculatePPVNPV(prevalence, sensitivity, specificity);
  const total = 1000; // Population size for visualization

  const tp = Math.round(metrics.tp * total);
  const fp = Math.round(metrics.fp * total);
  const fn = Math.round(metrics.fn * total);
  const tn = Math.round(metrics.tn * total);

  // Clear
  ctx.clearRect(0, 0, 450, 350);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 450, 350);

  // Draw confusion matrix (compact layout)
  const boxSize = 100;
  const startX = 125;
  const startY = 70;
  const gap = 30;

  // True Positive (top-left)
  ctx.fillStyle = '#81c784';
  ctx.fillRect(startX, startY, boxSize, boxSize);
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, boxSize, boxSize);

  ctx.fillStyle = '#1b5e20';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('True Positive', startX + boxSize / 2, startY + 22);
  ctx.font = 'bold 24px Arial';
  ctx.fillText(tp.toString(), startX + boxSize / 2, startY + boxSize / 2 + 8);

  // False Positive (top-right)
  ctx.fillStyle = '#ffab91';
  ctx.fillRect(startX + boxSize + gap, startY, boxSize, boxSize);
  ctx.strokeStyle = '#2a2a2a';
  ctx.strokeRect(startX + boxSize + gap, startY, boxSize, boxSize);

  ctx.fillStyle = '#bf360c';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('False Positive', startX + boxSize + gap + boxSize / 2, startY + 22);
  ctx.font = 'bold 24px Arial';
  ctx.fillText(fp.toString(), startX + boxSize + gap + boxSize / 2, startY + boxSize / 2 + 8);

  // False Negative (bottom-left)
  ctx.fillStyle = '#ffab91';
  ctx.fillRect(startX, startY + boxSize + gap, boxSize, boxSize);
  ctx.strokeStyle = '#2a2a2a';
  ctx.strokeRect(startX, startY + boxSize + gap, boxSize, boxSize);

  ctx.fillStyle = '#bf360c';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('False Negative', startX + boxSize / 2, startY + boxSize + gap + 22);
  ctx.font = 'bold 24px Arial';
  ctx.fillText(fn.toString(), startX + boxSize / 2, startY + boxSize + gap + boxSize / 2 + 8);

  // True Negative (bottom-right)
  ctx.fillStyle = '#81c784';
  ctx.fillRect(startX + boxSize + gap, startY + boxSize + gap, boxSize, boxSize);
  ctx.strokeStyle = '#2a2a2a';
  ctx.strokeRect(startX + boxSize + gap, startY + boxSize + gap, boxSize, boxSize);

  ctx.fillStyle = '#1b5e20';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('True Negative', startX + boxSize + gap + boxSize / 2, startY + boxSize + gap + 22);
  ctx.font = 'bold 24px Arial';
  ctx.fillText(
    tn.toString(),
    startX + boxSize + gap + boxSize / 2,
    startY + boxSize + gap + boxSize / 2 + 8
  );

  // Labels
  ctx.fillStyle = '#2a2a2a';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';

  // Top label
  ctx.fillText('ACTUAL CONDITION', 225, 25);

  // Column labels
  ctx.fillText('Disease', startX + boxSize / 2, 55);
  ctx.fillText('No Disease', startX + boxSize + gap + boxSize / 2, 55);

  // Row labels
  ctx.save();
  ctx.translate(70, 170);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('TEST RESULT', 0, 0);
  ctx.restore();

  ctx.textAlign = 'right';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('Positive:', startX - 15, startY + boxSize / 2 + 5);
  ctx.fillText('Negative:', startX - 15, startY + boxSize + gap + boxSize / 2 + 5);

  // Population note
  ctx.textAlign = 'center';
  ctx.font = '11px Arial';
  ctx.fillStyle = '#5a5a5a';
  ctx.fillText(
    `Out of ${total} people with ${Math.round(prevalence * 100)}% disease prevalence`,
    225,
    320
  );
}
