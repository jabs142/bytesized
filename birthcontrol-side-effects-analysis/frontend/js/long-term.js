/**
 * Long-Term Side Effects Page JavaScript
 * Displays validated long-term birth control side effects with PubMed sources
 */

let allLongTermEffects = [];
let currentFilter = 'all';

// Medical term glossary with layman explanations
const MEDICAL_GLOSSARY = {
    'menorrhagia': 'heavy menstrual bleeding',
    'premenstrual dysphoric disorder': 'severe form of PMS causing mood changes, irritability, and depression before periods',
    'pmdd': 'severe form of PMS causing mood changes, irritability, and depression before periods',
    'emotional lability': 'rapid mood changes',
    'mood swings': 'cyclical changes in mood from happy to sad',
    'emotional instability': 'difficulty regulating emotions, heightened reactions to situations',
    'libido': 'sex drive',
    'hirsutism': 'excessive hair growth',
    'amenorrhea': 'absence of periods',
    'dysmenorrhea': 'painful menstruation',
    'oligomenorrhea': 'infrequent periods',
    'spotting': 'light bleeding between periods',
    'osteopenia': 'low bone density',
    'osteoporosis': 'severe bone loss',
    'thrombosis': 'blood clot formation',
    'VTE': 'venous thromboembolism (blood clot)',
    'MI': 'myocardial infarction (heart attack)',
    'perimenopause': 'transition period before menopause when hormones fluctuate'
};

// Helper function to deduplicate temporal contexts while preserving order
function deduplicateTemporalContexts(contexts) {
    if (!contexts || !Array.isArray(contexts)) {
        return [];
    }

    const seen = new Set();
    const unique = [];

    for (const context of contexts) {
        // Normalize the context by trimming and converting to lowercase for comparison
        const normalized = context.trim().toLowerCase();

        if (normalized && !seen.has(normalized)) {
            seen.add(normalized);
            unique.push(context); // Add the original (not normalized) version
        }
    }

    // Return up to 3 unique contexts
    return unique.slice(0, 3);
}

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/long_term_validation_summary.json');
        if (!response.ok) {
            displayPlaceholderMessage();
            return;
        }

        const data = await response.json();
        allLongTermEffects = data.top_effects || [];

        displayResearchGaps(data.research_gaps || []);
        displayLongTermSideEffects(allLongTermEffects);

    } catch (error) {
        console.error('Error loading long-term data:', error);
        displayPlaceholderMessage();
    }
});

function displayPlaceholderMessage() {
    const list = document.getElementById('long-term-side-effects-list');
    const gapsList = document.getElementById('research-gaps-list');

    const message = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div class="text-4xl mb-3">🔬</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Long-Term Analysis Not Yet Run</h3>
            <p class="text-gray-700 mb-4">
                To see long-term side effects analysis, run the pipeline:
            </p>
            <pre class="bg-gray-800 text-green-400 p-4 rounded text-left text-sm mb-4">
# 1. Filter for long-term posts (5+ years)
python src/analysis/long_term_filter.py

# 2. Extract side effects with LLM
python -m src.analysis.long_term_side_effect_extractor

# 3. Validate with PubMed
python -m src.validation.long_term_evidence_validator
            </pre>
        </div>
    `;

    list.innerHTML = message;
    gapsList.innerHTML = '<p class="text-gray-600 text-center">No data available yet.</p>';
}

function displayResearchGaps(gaps) {
    const container = document.getElementById('research-gaps-list');

    if (!gaps || gaps.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center">No significant research gaps identified.</p>';
        return;
    }

    container.innerHTML = gaps.slice(0, 10).map((gap, index) => `
        <div class="bg-white rounded-lg p-4 border-l-4 border-orange-500 shadow-sm">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 capitalize mb-2">
                        ${addMedicalTooltips(gap.side_effect)}
                    </h3>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">Patient Reports:</span>
                            <span class="font-semibold text-orange-600">${gap.reddit_mentions}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Research Papers:</span>
                            <span class="font-semibold text-red-600">${gap.pubmed_papers}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Significance:</span>
                            <span class="font-semibold text-purple-600">${gap.clinical_significance}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayLongTermSideEffects(effects) {
    const container = document.getElementById('long-term-side-effects-list');

    if (!effects || effects.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">No long-term side effects available.</p>';
        return;
    }

    // Filter by status if needed
    let filteredEffects = effects;
    if (currentFilter !== 'all') {
        filteredEffects = effects.filter(item => {
            const status = item.validation_status.toLowerCase();
            if (currentFilter === 'validated') return status === 'validated';
            if (currentFilter === 'limited') return status.includes('limited');
            if (currentFilter === 'no-research') return status.includes('no research');
            return true;
        });
    }

    if (filteredEffects.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">No side effects found for this filter.</p>';
        return;
    }

    container.innerHTML = filteredEffects.map((item, index) => {
        const rawName = item.side_effect.toLowerCase();
        const displayName = item.side_effect.charAt(0).toUpperCase() + item.side_effect.slice(1);
        const definition = MEDICAL_GLOSSARY[rawName] || '';

        // Status emoji and color
        let statusEmoji = '✅';
        let statusColor = 'green';
        if (item.validation_status === 'Limited Evidence') {
            statusEmoji = '⚠️';
            statusColor = 'orange';
        } else if (item.validation_status === 'No Research Found') {
            statusEmoji = '🔍';
            statusColor = 'red';
        }

        // Clinical significance color
        let sigColor = 'gray';
        if (item.clinical_significance === 'High') sigColor = 'red';
        else if (item.clinical_significance === 'Moderate') sigColor = 'orange';

        const surpriseScore = (item.surprise_score || 0).toFixed(3);

        return `
            <div class="side-effect-card" data-status="${item.validation_status.toLowerCase().replace(/ /g, '-')}">
                <!-- Collapsed Header -->
                <div class="side-effect-header">
                    <div class="side-effect-rank">${index + 1}</div>
                    <div class="side-effect-info">
                        <h3>
                            ${statusEmoji} ${displayName}
                            ${definition ? `<span class="medical-term-definition">(${definition})</span>` : ''}
                        </h3>
                        <div class="side-effect-meta">
                            <span class="surprise-score">Surprise: ${surpriseScore}</span>
                            <span class="validation-badge ${statusColor}">${item.validation_status}</span>
                            <span class="clinical-sig-badge ${sigColor}">${item.clinical_significance} Significance</span>
                        </div>
                    </div>
                    <div class="expand-icon">▼</div>
                </div>

                <!-- Expanded Details -->
                <div class="side-effect-details">
                    <!-- Validation Status Badge -->
                    <div class="classification-badge ${statusColor === 'green' ? 'expected' : statusColor === 'orange' ? 'somewhat-surprising' : 'very-surprising'}">
                        ${statusEmoji} ${item.validation_status.toUpperCase()}
                    </div>

                    <!-- Clinical Significance -->
                    ${item.clinical_significance !== 'Low' ? `
                    <div class="alert-box ${sigColor}">
                        <strong>${item.clinical_significance} Clinical Significance:</strong>
                        This side effect may have significant health implications and warrants discussion with a healthcare provider.
                    </div>
                    ` : ''}

                    <!-- Patient Evidence Section -->
                    <div class="evidence-section">
                        <h4>💬 Patient Reports:</h4>
                        <ul>
                            <li><strong>${item.reddit_data.mention_count}</strong> mentions across <strong>${item.reddit_data.post_count}</strong> posts from long-term users</li>
                            <li>Reported by <strong>${(item.reddit_data.frequency * 100).toFixed(1)}%</strong> of long-term users discussing side effects</li>
                            ${item.reddit_data.avg_years_when_appeared ? `<li>Average onset: After <strong>${item.reddit_data.avg_years_when_appeared} years</strong> of use</li>` : ''}
                            ${item.reddit_data.persists_after_stopping === true ? `<li>⚠️ <strong>Reported to persist after stopping</strong> birth control</li>` : ''}
                            ${item.reddit_data.persists_after_stopping === false ? `<li>✓ Typically resolves after stopping birth control</li>` : ''}
                        </ul>
                    </div>

                    <!-- Research Evidence Section -->
                    <div class="evidence-section">
                        <h4>📚 Research Evidence:</h4>
                        ${item.pubmed_data.paper_count > 0 ? `
                            <p class="mb-2"><strong>${item.pubmed_data.paper_count}</strong> peer-reviewed papers found on PubMed:</p>
                            <div class="pubmed-sources">
                                ${item.pubmed_data.papers.map((paper, i) => `
                                    <div class="pubmed-paper">
                                        <span class="paper-number">${i + 1}.</span>
                                        <div class="paper-details">
                                            <a href="${paper.url}" target="_blank" rel="noopener noreferrer" class="paper-title">
                                                ${paper.title}
                                            </a>
                                            <div class="paper-meta">
                                                ${paper.journal ? `${paper.journal} • ` : ''}${paper.year} • PMID: ${paper.pmid}
                                                <a href="${paper.url}" target="_blank" class="view-on-pubmed">View on PubMed →</a>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="no-research-warning">
                                <p>⚠️ <strong>No research papers found.</strong></p>
                                <p class="text-sm mt-2">
                                    This side effect was mentioned by ${item.reddit_data.post_count} long-term users but has limited research.
                                    This doesn't mean it's not real - it may indicate a research gap that needs more study.
                                </p>
                            </div>
                        `}
                    </div>

                    <!-- Patient Quotes Section -->
                    ${item.reddit_data.examples && item.reddit_data.examples.length > 0 ? `
                    <div class="quotes-section">
                        <h4>💭 What Patients Say:</h4>
                        ${item.reddit_data.examples.slice(0, 3).map(quote => `
                            <blockquote>"${quote}"</blockquote>
                        `).join('')}
                    </div>
                    ` : ''}

                    <!-- Temporal Context -->
                    ${item.reddit_data.temporal_contexts && item.reddit_data.temporal_contexts.length > 0 ? `
                    <div class="temporal-context-section">
                        <h4>⏱️ Timing & Duration:</h4>
                        <ul>
                            ${deduplicateTemporalContexts(item.reddit_data.temporal_contexts).map(context => `
                                <li>${context}</li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Add click listeners for expandable cards
    document.querySelectorAll('.side-effect-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('expanded'));
    });
}

function filterStatus(status) {
    currentFilter = status;

    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-indigo-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    event.target.classList.remove('bg-gray-200', 'text-gray-700');
    event.target.classList.add('active', 'bg-indigo-600', 'text-white');

    displayLongTermSideEffects(allLongTermEffects);
}

function addMedicalTooltips(text) {
    const lowerText = text.toLowerCase();

    for (const [term, definition] of Object.entries(MEDICAL_GLOSSARY)) {
        if (lowerText.includes(term.toLowerCase())) {
            return `${text} <span class="medical-term-definition">(${definition})</span>`;
        }
    }

    return text;
}
