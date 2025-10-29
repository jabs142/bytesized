/**
 * Validation Page - Display validated side effects with evidence tiers
 */

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
        container.innerHTML = '<p class="text-gray-600 text-center py-4">No high surprise side effects found yet. Run validation pipeline first.</p>';
        return;
    }

    container.innerHTML = hiddenGems.slice(0, 5).map(item => `
        <div class="bg-white rounded-lg p-4 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 capitalize">${item.side_effect}</h3>
                        <span class="text-sm px-2 py-1 rounded ${getTierBadgeClass(item.tier_label)}">
                            ${item.tier_label}
                        </span>
                    </div>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">Surprise Score:</span>
                            <span class="font-semibold text-orange-600">${(item.surprise_score * 100).toFixed(1)}%</span>
                        </div>
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
                <div class="ml-4">
                    <div class="text-3xl">${getSurpriseEmoji(item.surprise_score)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayValidatedSideEffects(sideEffects) {
    const container = document.getElementById('validated-side-effects-list');

    if (!sideEffects || sideEffects.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">No validated side effects available. Run validation pipeline first.</p>';
        return;
    }

    // Filter by tier if needed
    let filteredEffects = sideEffects;
    if (currentFilter !== 'all') {
        filteredEffects = sideEffects.filter(item => {
            // Extract tier number from tier_label
            const tierMatch = item.tier_label?.match(/Tier (\d)/);
            if (tierMatch) {
                return parseInt(tierMatch[1]) === currentFilter;
            }
            return false;
        });
    }

    if (filteredEffects.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">No side effects found for this tier.</p>';
        return;
    }

    container.innerHTML = filteredEffects.map((item, index) => `
        <div class="border rounded-lg p-5 hover:shadow-md transition side-effect-card" data-tier="${getTierNumber(item.tier_label)}">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-bold text-gray-900 capitalize">${item.side_effect}</h3>
                        <span class="text-sm px-3 py-1 rounded-full ${getTierBadgeClass(item.tier_label)}">
                            ${item.tier_label}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div class="bg-indigo-50 rounded p-2">
                            <div class="text-gray-600 text-xs">Patient Reports</div>
                            <div class="text-lg font-bold text-indigo-700">${item.mention_count}</div>
                        </div>
                        <div class="bg-purple-50 rounded p-2">
                            <div class="text-gray-600 text-xs">Frequency</div>
                            <div class="text-lg font-bold text-purple-700">${(item.frequency * 100).toFixed(1)}%</div>
                        </div>
                        <div class="bg-orange-50 rounded p-2">
                            <div class="text-gray-600 text-xs">Surprise Score</div>
                            <div class="text-lg font-bold text-orange-700">${(item.surprise_score * 100).toFixed(1)}%</div>
                        </div>
                        <div class="bg-green-50 rounded p-2">
                            <div class="text-gray-600 text-xs">Research Papers</div>
                            <div class="text-lg font-bold text-green-700">${item.paper_count || 0}</div>
                        </div>
                    </div>
                </div>
                <div class="ml-4 text-right">
                    <div class="text-2xl mb-1">${getCategoryEmoji(item.category)}</div>
                    <div class="text-xs text-gray-500 capitalize">${item.category || 'unknown'}</div>
                </div>
            </div>

            ${item.paper_count > 0 ? `
                <button onclick="togglePapers(${index})" class="text-sm text-indigo-600 hover:text-indigo-800 mt-2">
                    View ${item.paper_count} Research Paper${item.paper_count > 1 ? 's' : ''} →
                </button>
                <div id="papers-${index}" class="hidden mt-3 pl-4 border-l-2 border-indigo-200">
                    <p class="text-sm text-gray-600 italic">Research papers will be loaded from validated database</p>
                </div>
            ` : `
                <div class="mt-2 text-sm text-gray-500 italic">
                    ⚠️ Research gap: High patient reports but limited research coverage
                </div>
            `}
        </div>
    `).join('');
}

function filterTier(tier) {
    currentFilter = tier;

    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-indigo-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    event.target.classList.remove('bg-gray-200', 'text-gray-700');
    event.target.classList.add('active', 'bg-indigo-600', 'text-white');

    displayValidatedSideEffects(allSideEffects);
}

function togglePapers(index) {
    const papersDiv = document.getElementById(`papers-${index}`);
    papersDiv.classList.toggle('hidden');
}

function getTierNumber(tierLabel) {
    if (!tierLabel) return 4;
    const match = tierLabel.match(/Tier (\d)/);
    return match ? parseInt(match[1]) : 4;
}

function getTierBadgeClass(tierLabel) {
    if (!tierLabel) return 'bg-gray-100 text-gray-700';

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
    if (!category) return '❓';
    if (category.includes('mental')) return '🧠';
    if (category.includes('physical')) return '💊';
    if (category.includes('both')) return '🧠💊';
    return '❓';
}

function getSurpriseEmoji(score) {
    if (score >= 0.7) return '🚨';
    if (score >= 0.5) return '⚡';
    if (score >= 0.3) return '💡';
    return '📊';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadValidationData);
