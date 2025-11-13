// EDS Symptom Discovery Dashboard
// Load and visualize symptom data

let symptomData = null;
let fullDatabase = null;
let allSymptoms = null;
let currentPage = 1;
let pageSize = 50;

// Load data when page loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load summary data
    const summaryResponse = await fetch('data/symptom_summary.json');
    symptomData = await summaryResponse.json();

    // Load full validated database (30 symptoms)
    const dbResponse = await fetch('data/llm_symptom_database.json');
    fullDatabase = await dbResponse.json();

    // Load ALL symptoms (751 cleaned - removed non-medical terms)
    const allSymptomsResponse = await fetch('data/llm_symptom_stats_cleaned.json');
    allSymptoms = await allSymptomsResponse.json();

    // Initialize dashboard
    // updateSummaryCards(); // Summary cards removed from HTML
    renderTopSymptomsChart();
    renderHiddenGemsTable();
    renderSurpriseScatterChart();
    renderOutliersSection();
    renderAllSymptomsTable();

    // Add filter listeners
    document.getElementById('filterValidated').addEventListener('change', () => {
      currentPage = 1;
      renderAllSymptomsTable();
    });
    document.getElementById('filterUnvalidated').addEventListener('change', () => {
      currentPage = 1;
      renderAllSymptomsTable();
    });

    // Pagination listeners
    document.getElementById('prevPage').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderAllSymptomsTable();
      }
    });
    document.getElementById('nextPage').addEventListener('click', () => {
      currentPage++;
      renderAllSymptomsTable();
    });
    document.getElementById('pageSize').addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value);
      currentPage = 1;
      renderAllSymptomsTable();
    });
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Error loading symptom data. Please ensure the data files are available.');
  }
});

// Update summary cards
function updateSummaryCards() {
  document.getElementById('total-symptoms').textContent = symptomData.total_symptoms;
  document.getElementById('high-surprise').textContent = symptomData.high_surprise_count;
  document.getElementById('research-gaps').textContent = symptomData.research_gaps_count;
}

// Render Top Symptoms Bar Chart
function renderTopSymptomsChart() {
  const ctx = document.getElementById('topSymptomsChart').getContext('2d');

  const symptoms = symptomData.top_symptoms;
  const labels = symptoms.map((s) => s.symptom);
  const data = symptoms.map((s) => s.mention_count);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Patient Mentions',
          data: data,
          backgroundColor: 'rgba(37, 99, 235, 0.7)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            afterLabel: function (context) {
              const surprise = symptoms[context.dataIndex].surprise_score;
              return `Surprise Score: ${surprise.toFixed(3)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Mentions',
          },
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  });
}

// Render Hidden Gems Table
function renderHiddenGemsTable() {
  const tbody = document.querySelector('#hidden-gems-table tbody');
  tbody.innerHTML = '';

  // Take top 10 hidden gems
  const gems = symptomData.hidden_gems.slice(0, 10);

  gems.forEach((gem) => {
    const row = document.createElement('tr');

    // Calculate research gap percentage
    const researchGap = Math.round(gem.surprise_score * 100);

    row.innerHTML = `
            <td><strong>${gem.symptom}</strong></td>
            <td>${gem.mention_count}</td>
            <td>${gem.paper_count}</td>
            <td>${gem.surprise_score.toFixed(3)}</td>
            <td>
                <div class="progress-bar" title="${researchGap}% gap">
                    <div class="progress-fill" style="width: ${researchGap}%"></div>
                </div>
            </td>
        `;

    tbody.appendChild(row);
  });
}

// Render Surprise Score Scatter Chart
function renderSurpriseScatterChart() {
  if (!fullDatabase) {
    console.warn('Full database not loaded yet');
    return;
  }

  const ctx = document.getElementById('surpriseScatterChart').getContext('2d');

  // Prepare scatter data
  const scatterData = fullDatabase.map((symptom) => ({
    x: symptom.reddit_data.frequency,
    y: symptom.pubmed_data.paper_count,
    label: symptom.symptom,
    surprise: symptom.surprise_score,
  }));

  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Symptoms',
          data: scatterData,
          backgroundColor: scatterData.map((d) => {
            // Color by surprise score
            const alpha = Math.min(d.surprise * 5, 1);
            return `rgba(239, 68, 68, ${alpha})`;
          }),
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
          pointRadius: scatterData.map((d) => 5 + d.surprise * 50), // Size by surprise
          pointHoverRadius: scatterData.map((d) => 7 + d.surprise * 50),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const point = context.raw;
              return [
                `Symptom: ${point.label}`,
                `Patient Frequency: ${(point.x * 100).toFixed(1)}%`,
                `Research Papers: ${point.y}`,
                `Surprise Score: ${point.surprise.toFixed(3)}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Patient Report Frequency',
          },
          ticks: {
            callback: function (value) {
              return (value * 100).toFixed(0) + '%';
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Number of Research Papers',
          },
          beginAtZero: true,
        },
      },
    },
  });
}

// Render Outliers Section
function renderOutliersSection() {
  if (!allSymptoms) {
    return;
  }

  const grid = document.getElementById('outliers-grid');
  grid.innerHTML = '';

  // Get symptoms mentioned only once
  const outliers = allSymptoms.filter((s) => s.mention_count === 1);

  // Pick interesting medical outliers (diverse, unexpected)
  const interestingOutliers = [
    outliers.find((s) => s.symptom.includes('autism')),
    outliers.find((s) => s.symptom.includes('ADHD')),
    outliers.find((s) => s.symptom.includes('periodontal')),
    outliers.find((s) => s.symptom.includes('weather')),
    outliers.find((s) => s.symptom.includes('hearing loss')),
    outliers.find((s) => s.symptom.includes('vomiting')),
    outliers.find((s) => s.symptom.includes('inability to cry')),
    outliers.find((s) => s.symptom.includes('passive suicidality')),
    outliers.find((s) => s.symptom.includes('mast cell')),
    outliers.find((s) => s.symptom.includes('cold sensitivity')),
    outliers.find((s) => s.symptom.includes('loss of appetite')),
    outliers.find((s) => s.symptom.includes('tachy-brady')),
  ]
    .filter(Boolean)
    .slice(0, 12);

  interestingOutliers.forEach((symptom) => {
    const card = document.createElement('div');
    card.className = 'outlier-card';
    card.innerHTML = `
            <div class="outlier-symptom">${symptom.symptom}</div>
            <div class="outlier-example">"${symptom.examples[0]}"</div>
            <div class="outlier-badge">1 mention</div>
        `;
    grid.appendChild(card);
  });
}

// Render All Symptoms Table with Pagination
function renderAllSymptomsTable() {
  if (!allSymptoms) {
    return;
  }

  const tbody = document.querySelector('#all-symptoms-table tbody');
  tbody.innerHTML = '';

  // Get filter states
  const showValidated = document.getElementById('filterValidated').checked;
  const showUnvalidated = document.getElementById('filterUnvalidated').checked;

  // Create set of validated symptom names
  const validatedNames = new Set(fullDatabase.map((s) => s.symptom));

  // Filter symptoms based on checkboxes
  const symptomsToShow = allSymptoms.filter((symptom) => {
    const isValidated = validatedNames.has(symptom.symptom);
    if (isValidated && showValidated) {
      return true;
    }
    if (!isValidated && showUnvalidated) {
      return true;
    }
    return false;
  });

  // Pagination
  const totalPages = Math.ceil(symptomsToShow.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, symptomsToShow.length);
  const paginatedSymptoms = symptomsToShow.slice(startIndex, endIndex);

  paginatedSymptoms.forEach((symptom, index) => {
    const row = document.createElement('tr');
    const isValidated = validatedNames.has(symptom.symptom);

    // Get surprise score if validated
    let statusBadge = '<span class="badge badge-info">Not validated</span>';
    if (isValidated) {
      const validatedData = fullDatabase.find((s) => s.symptom === symptom.symptom);
      const surpriseScore = validatedData.surprise_score;
      let badgeClass = 'badge-success';
      if (surpriseScore > 0.1) {
        badgeClass = 'badge-warning';
      }
      if (surpriseScore > 0.3) {
        badgeClass = 'badge-info';
      }

      statusBadge = `<span class="badge ${badgeClass}">Validated (surprise: ${surpriseScore.toFixed(3)})</span>`;
    }

    row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td><strong>${symptom.symptom}</strong></td>
            <td>${symptom.mention_count}</td>
            <td>${statusBadge}</td>
        `;

    tbody.appendChild(row);
  });

  // Update pagination controls
  document.getElementById('pageInfo').textContent =
    `Page ${currentPage} of ${totalPages} (${symptomsToShow.length} symptoms)`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage >= totalPages;
}
