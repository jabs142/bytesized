/**
 * Pharmaceutical Insights Visualization
 * Renders pharmaceutical neglect and therapeutic area trends
 */

/**
 * Load pharmaceutical insights data (already loaded in app.js as window.neglectData and window.therapeuticData)
 */
async function loadUniqueInsightsData() {
  // Data is already loaded by app.js
  // console.log('Pharmaceutical insights data loaded from app.js');
}

/**
 * Render all pharmaceutical insights
 */
function renderUniqueInsights() {
  // Render temporal clustering timeline
  if (typeof renderTherapeuticTimeline === 'function') {
    renderTherapeuticTimeline();
  }

  renderTopTherapeuticAreas();
  renderPharmaceuticalNeglect();
  renderTherapeuticPeaks();
  renderPharmaceuticalStories();
}

/**
 * Render bottom 10 FDA pharmacological classes (market gaps / innovation opportunities)
 */
function renderPharmaceuticalNeglect() {
  const container = document.getElementById('pharmaceutical-neglect');

  if (!container) {
    return;
  }

  if (!window.fdaPharmClasses || !window.fdaPharmClasses.bottom_10_pharm_classes) {
    container.innerHTML = '<div class="loading">Loading therapeutic areas data...</div>';
    return;
  }

  // Get bottom 10 FDA pharmacological classes
  const bottom10 = window.fdaPharmClasses.bottom_10_pharm_classes;

  // Reverse to show from bottom up (least drugs at top)
  const reversed = [...bottom10].reverse();

  // Use a fixed reference scale of 50 drugs for bottom 10
  // This way, 1 drug = 2%, 10 drugs = 20%, 50 drugs = 100%
  // Gives truthful visual representation of "few drugs"
  const referenceScale = 50;

  let html = `
        <div class="patterns-section">
            <div class="category-bars">
    `;

  reversed.forEach((pharmClass) => {
    // Scale based on fixed reference, with minimum 2% for visibility
    const percentage = Math.max(2, (pharmClass.count / referenceScale) * 100);
    const barColor = '#E4ACB2'; // Dusty rose from therapeutic palette for emerging areas

    // Create detailed tooltip with layman-friendly information
    const tooltipContent = `${pharmClass.simple_name}
${pharmClass.description}

Used for: ${pharmClass.uses}
Examples: ${pharmClass.examples}
Total drugs: ${pharmClass.count}`;

    html += `
            <div class="category-bar-row custom-tooltip" data-tooltip="${tooltipContent.replace(/"/g, '&quot;')}" style="cursor: help;">
                <div class="category-label">
                    <strong>${pharmClass.simple_name}</strong>
                    <span style="color: var(--text-secondary); font-size: 0.75em; display: block; margin-top: 2px;">
                        for ${pharmClass.category.toLowerCase()}
                    </span>
                </div>
                <div class="category-bar-container">
                    <div class="category-bar-fill" style="width: ${percentage}%; background: ${barColor};"></div>
                    <div class="category-bar-value">${pharmClass.count.toLocaleString()}</div>
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
 * Render top 10 FDA pharmacological classes (saturated markets / established drugs)
 */
function renderTopTherapeuticAreas() {
  const container = document.getElementById('top-therapeutic-areas');

  if (!container) {
    return;
  }

  if (!window.fdaPharmClasses || !window.fdaPharmClasses.top_10_pharm_classes) {
    container.innerHTML = '<div class="loading">Loading therapeutic areas data...</div>';
    return;
  }

  // Get top 10 FDA pharmacological classes
  const top10 = window.fdaPharmClasses.top_10_pharm_classes;

  const maxCount = Math.max(...top10.map((d) => d.count));

  let html = `
        <div class="patterns-section">
            <div class="category-bars">
    `;

  top10.forEach((pharmClass) => {
    const percentage = maxCount > 0 ? Math.max(5, (pharmClass.count / maxCount) * 100) : 0;
    const barColor = '#99BAB9'; // Blue-gray from therapeutic palette for established areas

    // Create detailed tooltip with layman-friendly information
    const tooltipContent = `${pharmClass.simple_name}
${pharmClass.description}

Used for: ${pharmClass.uses}
Examples: ${pharmClass.examples}
Total drugs: ${pharmClass.count}`;

    html += `
            <div class="category-bar-row custom-tooltip" data-tooltip="${tooltipContent.replace(/"/g, '&quot;')}" style="cursor: help;">
                <div class="category-label">${pharmClass.simple_name} <span style="color: var(--text-secondary); font-size: 0.85em;">(${pharmClass.category})</span></div>
                <div class="category-bar-container">
                    <div class="category-bar-fill" style="width: ${percentage}%; background: ${barColor};"></div>
                    <div class="category-bar-value">${pharmClass.count.toLocaleString()}</div>
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
 * Render therapeutic peaks chart
 */
function renderTherapeuticPeaks() {
  // Render peaks chart if function exists
  setTimeout(() => {
    if (typeof renderTherapeuticPeaksChart === 'function') {
      renderTherapeuticPeaksChart();
    }
  }, 0);
}

/**
 * Render pharmaceutical innovation stories
 */
function renderPharmaceuticalStories() {
  const container = document.getElementById('pharmaceutical-stories');

  if (!container) {
    return;
  }

  const storiesHtml = renderFunFactCards();
  container.innerHTML = storiesHtml;
}

/**
 * Render fun fact cards showing interesting therapeutic area patterns
 */
function renderFunFactCards() {
  const stories = [
    {
      icon: '🧠',
      title: 'The 1980s Boom',
      insight: '15,987 drugs approved',
      description:
        'The decade with the most drug approvals in history, averaging 1,600 per year. However, 37% were generic drugs following the Hatch-Waxman Act (1984), while 63% were innovative new molecules.',
      tooltip:
        'The Hatch-Waxman Act (1984) created the modern generic drug approval pathway, no longer requiring full clinical trials for bioequivalent drugs. Combined with the biotech revolution, this created the highest-volume decade for drug approvals.',
    },
    {
      icon: '🦠',
      title: 'Infectious Disease Surge',
      insight: '19% approved in 1990s',
      description:
        'The HIV/AIDS crisis drove a surge in infectious disease drug development. The 1990s saw 389 approvals out of 2,045 total, concentrated in a single decade of urgent medical need.',
    },
    {
      icon: '🌬️',
      title: 'Respiratory Decline',
      insight: '76% decline from peak',
      description:
        'Respiratory medicine peaked at 34 approvals in the 2010s, then declined to 8 in the 2020s—a 76% drop in development activity.',
      hasDisclaimer: true,
    },
    {
      icon: '🧬',
      title: 'Oncology Acceleration',
      insight: '526 approvals since 2010',
      description:
        'Cancer treatment entered a new era. The 2010s and 2020s combined saw 526 oncology drug approvals, driven by immunotherapy breakthroughs, checkpoint inhibitors, and CAR-T therapies.',
    },
    {
      icon: '🔬',
      title: 'Rare Disease Revolution',
      insight: '71% in the 2010s',
      description:
        'Rare and orphan diseases saw concentrated development in the 2010s, with 71% of all rare disease drugs approved in a single decade, transforming previously untreatable conditions.',
    },
    {
      icon: '💊',
      title: 'Cardiovascular Evolution',
      insight: '23% peak concentration',
      description:
        'Cardiovascular drugs show the most distributed development pattern, with the 2010s peak representing only 23% of total approvals—indicating steady innovation across decades.',
    },
  ];

  let html = `
        <div class="methodology-section" style="margin-top: 40px;">
            <div class="container">
                <h3>📚 Pharmaceutical Innovation Stories</h3>
                <p class="section-subtitle">Six data-driven insights into therapeutic breakthroughs</p>
                <div class="methodology-grid">
    `;

  stories.forEach((story) => {
    const tooltipAttr = story.tooltip ? `title="${story.tooltip}"` : '';
    html += `
                    <div class="method-card" ${tooltipAttr}>
                        <div class="story-icon">${story.icon}</div>
                        <h4>${story.title}</h4>
                        <div class="story-insight">${story.insight}</div>
                        <p>${story.description}</p>
                        ${story.hasDisclaimer ? '<div class="covid-disclaimer">* Note: COVID-19 vaccines/treatments are classified under Infectious Disease</div>' : ''}
                    </div>
        `;
  });

  html += `
                </div>
            </div>
        </div>
    `;

  return html;
}
