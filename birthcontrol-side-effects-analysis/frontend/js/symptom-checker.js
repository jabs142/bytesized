// Symptom Checker JavaScript
// Interactive symptom selection and pattern discovery

let checkerStatsData = null;
let patternsData = null;
const selectedSymptoms = new Set();

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [statsResponse, patternsResponse] = await Promise.all([
      fetch('data/stats.json'),
      fetch('data/discovered_patterns.json'),
    ]);

    checkerStatsData = await statsResponse.json();
    patternsData = await patternsResponse.json();

    displayPopularSymptoms();
    displayAllSymptoms();
    setupEventListeners();
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Failed to load data. Please refresh the page.');
  }
});

function setupEventListeners() {
  // Search box
  document.getElementById('symptom-search-checker').addEventListener('input', handleSearch);

  // Analyze button
  document.getElementById('analyze-btn').addEventListener('click', analyzePatterns);
}

function displayPopularSymptoms() {
  if (!checkerStatsData || !checkerStatsData.top_symptoms) {
    return;
  }

  const container = document.getElementById('popular-symptoms');
  const topSymptoms = Object.entries(checkerStatsData.top_symptoms).slice(0, 8);

  container.innerHTML = topSymptoms
    .map(([symptom, count]) => {
      const percentage = ((count / checkerStatsData.posts_with_symptoms) * 100).toFixed(0);
      return `
            <button
                class="symptom-pill bg-white border-2 border-gray-300 hover:border-indigo-500 px-4 py-2 rounded-full text-sm font-medium transition"
                data-symptom="${symptom}"
                onclick="toggleSymptom('${symptom}')"
            >
                <span class="capitalize">${symptom.replace(/_/g, ' ')}</span>
                <span class="text-xs text-gray-500 ml-1">${percentage}%</span>
            </button>
        `;
    })
    .join('');
}

function displayAllSymptoms() {
  if (!checkerStatsData || !checkerStatsData.top_symptoms) {
    return;
  }

  const container = document.getElementById('all-symptoms');
  const allSymptoms = Object.entries(checkerStatsData.top_symptoms);

  container.innerHTML = allSymptoms
    .map(([symptom, count]) => {
      return `
            <label class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                    type="checkbox"
                    class="symptom-checkbox w-4 h-4 text-indigo-600 rounded"
                    data-symptom="${symptom}"
                    onchange="toggleSymptom('${symptom}')"
                />
                <span class="ml-2 text-sm capitalize flex-1">${symptom.replace(/_/g, ' ')}</span>
                <span class="text-xs text-gray-500">${count}</span>
            </label>
        `;
    })
    .join('');
}

function toggleSymptom(symptom) {
  if (selectedSymptoms.has(symptom)) {
    selectedSymptoms.delete(symptom);
  } else {
    selectedSymptoms.add(symptom);
  }

  updateSelectedDisplay();
  updateAnalyzeButton();
  updateCheckboxStates();
}

function updateSelectedDisplay() {
  const container = document.getElementById('selected-symptoms');
  const emptyState = document.getElementById('empty-state');
  const countElement = document.getElementById('selected-count');

  countElement.textContent = selectedSymptoms.size;

  if (selectedSymptoms.size === 0) {
    emptyState.classList.remove('hidden');
    container.querySelectorAll('.selected-symptom-tag').forEach((el) => el.remove());
  } else {
    emptyState.classList.add('hidden');

    // Remove existing tags without destroying the empty state element
    const existingTags = container.querySelectorAll('.selected-symptom-tag');
    existingTags.forEach((el) => el.remove());

    // Create a document fragment to add all new tags at once
    const fragment = document.createDocumentFragment();

    selectedSymptoms.forEach((symptom) => {
      const tag = document.createElement('span');
      tag.className =
        'selected-symptom-tag inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2';

      const symptomText = document.createElement('span');
      symptomText.className = 'capitalize';
      symptomText.textContent = symptom.replace(/_/g, ' ');

      const removeBtn = document.createElement('button');
      removeBtn.className = 'ml-2 text-indigo-600 hover:text-indigo-800';
      removeBtn.textContent = '✕';
      removeBtn.onclick = () => toggleSymptom(symptom);

      tag.appendChild(symptomText);
      tag.appendChild(removeBtn);
      fragment.appendChild(tag);
    });

    container.appendChild(fragment);
  }
}

function updateAnalyzeButton() {
  const analyzeBtn = document.getElementById('analyze-btn');
  analyzeBtn.disabled = selectedSymptoms.size === 0;

  if (selectedSymptoms.size > 0) {
    analyzeBtn.textContent = `Analyze Patterns (${selectedSymptoms.size} selected)`;
  } else {
    analyzeBtn.textContent = 'Analyze Patterns';
  }
}

function updateCheckboxStates() {
  // Update checkboxes
  document.querySelectorAll('.symptom-checkbox').forEach((checkbox) => {
    const symptom = checkbox.dataset.symptom;
    checkbox.checked = selectedSymptoms.has(symptom);
  });

  // Update pills
  document.querySelectorAll('.symptom-pill').forEach((pill) => {
    const symptom = pill.dataset.symptom;
    if (selectedSymptoms.has(symptom)) {
      pill.classList.remove('border-gray-300', 'bg-white');
      pill.classList.add('border-indigo-500', 'bg-indigo-100');
    } else {
      pill.classList.remove('border-indigo-500', 'bg-indigo-100');
      pill.classList.add('border-gray-300', 'bg-white');
    }
  });
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim();
  const checkboxes = document.querySelectorAll('.symptom-checkbox');

  checkboxes.forEach((checkbox) => {
    const label = checkbox.parentElement;
    const symptomText = checkbox.dataset.symptom.replace(/_/g, ' ');

    if (query === '' || symptomText.includes(query)) {
      label.style.display = 'flex';
    } else {
      label.style.display = 'none';
    }
  });
}

function analyzePatterns() {
  if (selectedSymptoms.size === 0) {
    return;
  }

  const resultsSection = document.getElementById('results-section');
  const noResultsSection = document.getElementById('no-results');
  const resultsContent = document.getElementById('results-content');

  // Find matching patterns
  const matchingPatterns = findMatchingPatterns(Array.from(selectedSymptoms));

  if (matchingPatterns.length === 0) {
    // No patterns found
    resultsSection.classList.add('hidden');
    noResultsSection.classList.remove('hidden');
  } else {
    // Display patterns
    noResultsSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    resultsContent.innerHTML = matchingPatterns
      .map((pattern, index) => {
        const liftColor = pattern.lift >= 2.0 ? 'red' : pattern.lift >= 1.5 ? 'orange' : 'yellow';
        const liftEmoji = pattern.lift >= 2.0 ? '🔴' : pattern.lift >= 1.5 ? '🟠' : '🟡';

        return `
                <div class="border-l-4 border-${liftColor}-500 bg-gray-50 p-5 rounded mb-4">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">
                                Pattern #${index + 1}
                            </h3>
                            <div class="text-base mb-2">
                                <span class="font-medium text-gray-700 capitalize">
                                    ${pattern.antecedent.map((s) => s.replace(/_/g, ' ')).join(' + ')}
                                </span>
                                <span class="text-gray-500 mx-2">→</span>
                                <span class="font-medium text-indigo-700 capitalize">
                                    ${pattern.consequent.map((s) => s.replace(/_/g, ' ')).join(' + ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div class="bg-white p-3 rounded">
                            <div class="text-xs text-gray-600 mb-1">Confidence</div>
                            <div class="text-2xl font-bold text-gray-900">
                                ${(pattern.confidence * 100).toFixed(0)}%
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                of people with the first symptom(s) also report the second
                            </div>
                        </div>

                        <div class="bg-white p-3 rounded">
                            <div class="text-xs text-gray-600 mb-1">Likelihood ${liftEmoji}</div>
                            <div class="text-2xl font-bold text-gray-900">
                                ${pattern.lift.toFixed(1)}x
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                more likely than random
                            </div>
                        </div>

                        <div class="bg-white p-3 rounded">
                            <div class="text-xs text-gray-600 mb-1">Support</div>
                            <div class="text-2xl font-bold text-gray-900">
                                ${pattern.support}
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                posts (${pattern.support_pct.toFixed(1)}% of dataset)
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>What this means:</strong> In our dataset, when people report
                        <span class="font-semibold capitalize">${pattern.antecedent.map((s) => s.replace(/_/g, ' ')).join(' and ')}</span>,
                        there's a <strong>${(pattern.confidence * 100).toFixed(0)}%</strong> chance they also experience
                        <span class="font-semibold capitalize">${pattern.consequent.map((s) => s.replace(/_/g, ' ')).join(' and ')}</span>.
                        This pattern appears in <strong>${pattern.support} posts</strong>.
                    </div>
                </div>
            `;
      })
      .join('');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function findMatchingPatterns(selectedSymptoms) {
  if (!patternsData) {
    return [];
  }

  // Find patterns where the antecedent contains at least one of the selected symptoms
  const matches = patternsData.filter((pattern) => {
    const antecedentMatches = pattern.antecedent.some((symptom) =>
      selectedSymptoms.includes(symptom)
    );
    return antecedentMatches;
  });

  // Sort by lift (strongest patterns first)
  return matches.sort((a, b) => b.lift - a.lift);
}
