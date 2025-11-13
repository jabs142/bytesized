/**
 * Validation Page - Display validated side effects with evidence tiers
 */

// Medical term glossary for tooltips
const MEDICAL_GLOSSARY = {
  menorrhagia: 'heavy menstrual bleeding',
  pmdd: 'Premenstrual Dysphoric Disorder - severe PMS symptoms',
  'emotional lability': 'rapid, exaggerated changes in mood',
  libido: 'sex drive',
  hirsutism: 'excessive hair growth',
  amenorrhea: 'absence of menstrual periods',
  dysmenorrhea: 'painful menstruation',
  oligomenorrhea: 'infrequent menstrual periods',
  spotting: 'light bleeding between periods',
  'breakthrough bleeding': 'unexpected bleeding while on birth control',
};

// Function to add layman tooltips to medical terms
function addMedicalTooltips(text) {
  const lowerText = text.toLowerCase();

  // Check each medical term
  for (const [term, definition] of Object.entries(MEDICAL_GLOSSARY)) {
    if (lowerText.includes(term.toLowerCase())) {
      // Return text with inline definition
      return `${text} <span class="medical-term-definition">(${definition})</span>`;
    }
  }

  return text;
}

// Calculate surprise classification from surprise score
function getSurpriseClassification(surpriseScore) {
  if (surpriseScore >= 0.015) {
    return '🔥 VERY SURPRISING';
  }
  if (surpriseScore >= 0.008) {
    return '⚠️ SOMEWHAT SURPRISING';
  }
  return '✓ EXPECTED';
}

// Get classification color class
function getClassificationColor(classification) {
  if (classification.includes('VERY')) {
    return 'very-surprising';
  }
  if (classification.includes('SOMEWHAT')) {
    return 'somewhat-surprising';
  }
  return 'expected';
}

// Build surprise factors from data
function buildSurpriseFactors(item) {
  const factors = [];
  if (item.paper_count < 3) {
    factors.push('Limited research coverage despite patient reports');
  }
  if (item.frequency > 0.05) {
    factors.push(`High patient report frequency (${(item.frequency * 100).toFixed(1)}% of posts)`);
  }
  if (item.evidence_tier === 4 || item.tier_label?.includes('Tier 4')) {
    factors.push('Not officially documented in medical literature');
  }
  if (item.paper_count > 0 && item.paper_count < 3) {
    factors.push('Some research validation exists but needs more study');
  }
  if (!item.fda_listed && item.fda_listed !== undefined) {
    factors.push('Not listed in FDA official documentation');
  }
  return factors;
}

// Transform data to PCOS format
function transformDataForDisplay(item) {
  const surpriseScore = item.surprise_score || 0;
  const classification = getSurpriseClassification(surpriseScore);

  return {
    ...item,
    surprise_classification: classification,
    classification_color: getClassificationColor(classification),
    evidence: {
      reddit_mentions: item.mention_count,
      reddit_posts: item.post_count || Math.ceil(item.mention_count / 2),
      reddit_frequency: item.frequency,
      pubmed_papers: item.paper_count || 0,
    },
    surprise_factors: buildSurpriseFactors(item),
    sample_quotes: item.examples || [],
  };
}

let allSideEffects = [];
let currentFilter = 'all';

// Load validation data
async function loadValidationData() {
  try {
    // Try to load validated data first
    const response = await fetch('data/validation_summary.json');
    if (!response.ok) {
      // Fallback to mock data if validation hasn't been run yet
      displayPlaceholderMessage();
      return;
    }

    const data = await response.json();
    allSideEffects = data.top_side_effects || [];

    displayHighSurpriseSideEffects(data.hidden_gems || []);
    displayValidatedSideEffects(allSideEffects);
  } catch (error) {
    console.error('Error loading validation data:', error);
    displayPlaceholderMessage();
  }
}

function displayPlaceholderMessage() {
  const highSurpriseList = document.getElementById('high-surprise-list');
  const validatedList = document.getElementById('validated-side-effects-list');

  const message = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div class="text-4xl mb-3">🔬</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Validation Pipeline Not Yet Run</h3>
            <p class="text-gray-700 mb-4">
                To see validated side effects with evidence tiers, run the validation scripts:
            </p>
            <pre class="bg-gray-800 text-green-400 p-4 rounded text-left text-sm mb-4">
# 1. Extract side effects with LLM
python src/analysis/llm_side_effect_extractor.py

# 2. Validate with PubMed
python src/validation/evidence_validator.py

# 3. Run statistical analysis
python src/analysis/statistical_validator.py

# 4. View in Jupyter
jupyter notebook notebooks/03_validation_analysis.ipynb
            </pre>
            <p class="text-gray-600 text-sm">
                This will create validated_side_effects_database.json and validation_summary.json
            </p>
        </div>
    `;

  highSurpriseList.innerHTML = message;
  validatedList.innerHTML = '';
}

function displayHighSurpriseSideEffects(hiddenGems) {
  const container = document.getElementById('high-surprise-list');

  if (!hiddenGems || hiddenGems.length === 0) {
    container.innerHTML =
      '<p class="text-gray-600 text-center py-4">No high surprise side effects found yet. Run validation pipeline first.</p>';
    return;
  }

  container.innerHTML = hiddenGems
    .slice(0, 5)
    .map(
      (item) => `
        <div class="bg-white rounded-lg p-4 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 capitalize">${addMedicalTooltips(item.side_effect)}</h3>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">Patient Reports:</span>
                            <span class="font-semibold text-indigo-600">${item.mention_count}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Research Papers:</span>
                            <span class="font-semibold text-purple-600">${item.paper_count}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join('');
}

function displayValidatedSideEffects(sideEffects) {
  const container = document.getElementById('validated-side-effects-list');

  if (!sideEffects || sideEffects.length === 0) {
    container.innerHTML =
      '<p class="text-gray-600 text-center py-8">No validated side effects available. Run validation pipeline first.</p>';
    return;
  }

  // Transform all items to PCOS format and sort by surprise score
  const transformedEffects = sideEffects
    .map((item) => transformDataForDisplay(item))
    .sort((a, b) => (b.surprise_score || 0) - (a.surprise_score || 0));

  // Filter by surprise level if needed
  let filteredEffects = transformedEffects;
  if (currentFilter !== 'all') {
    filteredEffects = transformedEffects.filter((item) => {
      const classification = item.surprise_classification.toLowerCase();
      if (currentFilter === 'very') {
        return classification.includes('very');
      }
      if (currentFilter === 'somewhat') {
        return classification.includes('somewhat');
      }
      if (currentFilter === 'expected') {
        return classification.includes('expected');
      }
      return true;
    });
  }

  if (filteredEffects.length === 0) {
    container.innerHTML =
      '<p class="text-gray-600 text-center py-8">No side effects found for this surprise level.</p>';
    return;
  }

  container.innerHTML = filteredEffects
    .map((item, index) => {
      const tierNumber = getTierNumber(item.tier_label);
      const rawName = item.side_effect.toLowerCase();
      const displayName = item.side_effect.charAt(0).toUpperCase() + item.side_effect.slice(1);
      const definition = MEDICAL_GLOSSARY[rawName] || '';

      // Get surprise emoji based on classification
      let surpriseEmoji = '✓';
      if (item.surprise_classification.includes('VERY')) {
        surpriseEmoji = '🔥';
      } else if (item.surprise_classification.includes('SOMEWHAT')) {
        surpriseEmoji = '⚠️';
      }

      const surpriseScore = (item.surprise_score || 0).toFixed(3);

      return `
            <div class="side-effect-card ${item.classification_color}" data-classification="${item.classification_color}">
                <!-- Collapsed Header -->
                <div class="side-effect-header">
                    <div class="side-effect-rank">${index + 1}</div>
                    <div class="side-effect-info">
                        <h3>
                            ${surpriseEmoji} ${displayName}
                            ${definition ? `<span class="medical-term-definition" style="display: block; font-size: 0.75rem; color: var(--text-secondary); font-weight: normal; margin-top: 0.25rem; font-style: italic;">(${definition})</span>` : ''}
                        </h3>
                        <div class="side-effect-meta">
                            <span class="surprise-score">Score: ${surpriseScore}</span>
                            <span class="tier-badge-compact tier-${tierNumber}">${item.tier_label}</span>
                        </div>
                    </div>
                    <div class="expand-icon">▼</div>
                </div>

                <!-- Expanded Details -->
                <div class="side-effect-details">
                    <!-- Classification Badge -->
                    <div class="classification-badge ${item.classification_color}">
                        ${item.surprise_classification}
                    </div>

                    <!-- Tier Description -->
                    <div class="tier-description">
                        <h4>${item.tier_label}</h4>
                        <p>${getTierDescription(tierNumber)}</p>
                    </div>

                    <!-- Evidence Section -->
                    <div class="evidence-section">
                        <h4>📊 Evidence:</h4>
                        <ul>
                            <li><strong>${item.evidence.reddit_mentions}</strong> patient mentions across <strong>${item.evidence.reddit_posts}</strong> Reddit posts</li>
                            <li>Reported by <strong>${(item.evidence.reddit_frequency * 100).toFixed(1)}%</strong> of users discussing symptoms</li>
                            <li><strong>${item.evidence.pubmed_papers}</strong> PubMed research papers found</li>
                            ${item.fda_listed !== undefined ? `<li>FDA Official Documentation: <strong>${item.fda_listed ? 'Yes' : 'No'}</strong></li>` : ''}
                        </ul>
                    </div>

                    <!-- Severity Breakdown Section -->
                    ${
                      item.severity_breakdown
                        ? `
                    <div class="evidence-section">
                        <h4>🔢 Severity Breakdown:</h4>
                        <ul>
                            <li><strong>Mild:</strong> ${item.severity_breakdown.mild || 0} cases</li>
                            <li><strong>Moderate:</strong> ${item.severity_breakdown.moderate || 0} cases</li>
                            <li><strong>Severe:</strong> ${item.severity_breakdown.severe || 0} cases</li>
                            ${item.avg_severity ? `<li><strong>Average Severity:</strong> ${item.avg_severity.toFixed(2)} / 3.0</li>` : ''}
                        </ul>
                    </div>
                    `
                        : ''
                    }

                    <!-- Why This Matters Section -->
                    ${
                      item.surprise_factors.length > 0
                        ? `
                    <div class="surprise-factors-section">
                        <h4>💡 Why This Matters:</h4>
                        <ul>
                            ${item.surprise_factors.map((factor) => `<li>${factor}</li>`).join('')}
                        </ul>
                    </div>
                    `
                        : ''
                    }

                    <!-- Patient Quotes Section -->
                    ${
                      item.sample_quotes.length > 0
                        ? `
                    <div class="quotes-section">
                        <h4>💬 Patient Reports:</h4>
                        ${item.sample_quotes
                          .slice(0, 3)
                          .map(
                            (quote) => `
                            <blockquote>"${quote}"</blockquote>
                        `
                          )
                          .join('')}
                    </div>
                    `
                        : ''
                    }
                </div>
            </div>
        `;
    })
    .join('');

  // Add click listeners for expandable cards
  document.querySelectorAll('.side-effect-card').forEach((card) => {
    card.addEventListener('click', () => card.classList.toggle('expanded'));
  });
}

function filterSurprise(level) {
  currentFilter = level;

  // Update button styles
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.remove('active', 'bg-indigo-600', 'text-white');
    btn.classList.add('bg-gray-200', 'text-gray-700');
  });
  event.target.classList.remove('bg-gray-200', 'text-gray-700');
  event.target.classList.add('active', 'bg-indigo-600', 'text-white');

  displayValidatedSideEffects(allSideEffects);
}

function getTierNumber(tierLabel) {
  if (!tierLabel) {
    return 4;
  }

  // Try to extract from "Tier X:" format first
  const tierMatch = tierLabel.match(/Tier (\d)/);
  if (tierMatch) {
    return parseInt(tierMatch[1]);
  }

  // Fallback to emoji/keyword matching
  if (tierLabel.includes('FDA') || tierLabel.includes('🏆')) {
    return 1;
  }
  if (tierLabel.includes('Research') || tierLabel.includes('✅')) {
    return 2;
  }
  if (tierLabel.includes('Patient') || tierLabel.includes('💬')) {
    return 3;
  }
  if (tierLabel.includes('Emerging') || tierLabel.includes('⚠️')) {
    return 4;
  }

  return 4; // Default to tier 4
}

function getTierBadgeClass(tierLabel) {
  if (!tierLabel) {
    return 'bg-gray-100 text-gray-700';
  }

  if (tierLabel.includes('FDA') || tierLabel.includes('Tier 1')) {
    return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
  } else if (tierLabel.includes('Research') || tierLabel.includes('Tier 2')) {
    return 'bg-green-100 text-green-800 border border-green-300';
  } else if (tierLabel.includes('Patient') || tierLabel.includes('Tier 3')) {
    return 'bg-blue-100 text-blue-800 border border-blue-300';
  } else {
    return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
}

function getCategoryEmoji(category) {
  if (!category) {
    return '❓';
  }
  if (category.includes('mental')) {
    return '🧠';
  }
  if (category.includes('physical')) {
    return '💊';
  }
  if (category.includes('both')) {
    return '🧠💊';
  }
  return '❓';
}

function getSurpriseEmoji(score) {
  if (score >= 0.7) {
    return '🚨';
  }
  if (score >= 0.5) {
    return '⚡';
  }
  if (score >= 0.3) {
    return '💡';
  }
  return '📊';
}

function getTierDescription(tierNumber) {
  const descriptions = {
    1: 'This side effect is officially listed by the FDA in drug labeling and prescribing information.',
    2: 'Strong research backing with 3+ peer-reviewed PubMed papers documenting this side effect.',
    3: 'Patient-validated with 50+ mentions in patient reports, but limited research coverage (fewer than 3 papers).',
    4: 'Emerging pattern with significant patient reports but needs more research validation.',
  };
  return descriptions[tierNumber] || descriptions[4];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadValidationData);
