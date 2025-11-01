/**
 * PCOS Surprising Symptoms Discovery - Frontend App
 * Displays symptoms ranked by surprise factor
 */

// Medical Term Glossary (factual definitions)
const MEDICAL_TERMS = {
    'hirsutism': 'excessive hair growth in areas typical of male pattern',
    'insulin resistance': 'reduced cellular response to insulin',
    'hyperandrogenism': 'elevated androgen hormone levels',
    'anovulation': 'absence of ovulation',
    'oligo-ovulation': 'infrequent ovulation',
    'oligoovulation': 'infrequent ovulation',
    'polycystic ovaries': 'ovaries with multiple follicular cysts',
    'androgen': 'male sex hormone (e.g., testosterone)',
    'testosterone': 'primary male sex hormone',
    'acanthosis nigricans': 'darkened, thickened skin patches',
    'metabolic syndrome': 'cluster of metabolic risk factors',
    'amenorrhea': 'absence of menstrual periods',
    'oligomenorrhea': 'infrequent menstrual periods',
    'dysmenorrhea': 'painful menstruation'
};

// State
let allSymptoms = [];
let currentFilter = 'all';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

/**
 * Load symptom data from JSON
 */
async function loadData() {
    try {
        const response = await fetch('data/surprise_rankings.json');

        if (!response.ok) {
            throw new Error('Data not yet available. Please run the pipeline first.');
        }

        const data = await response.json();
        allSymptoms = data;

        renderSymptoms();

    } catch (error) {
        document.getElementById('symptomsList').innerHTML = `
            <div class="error-message">
                <h3>⚠️ Data Not Available Yet</h3>
                <p>${error.message}</p>
                <p>To generate data, run: <code>./run_pipeline.sh</code></p>
            </div>
        `;
    }
}

/**
 * Render symptoms list based on current filter
 */
function renderSymptoms() {
    const container = document.getElementById('symptomsList');

    // Filter symptoms
    const filtered = filterSymptoms(allSymptoms, currentFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-results">No symptoms match this filter</div>';
        return;
    }

    // Generate HTML
    const html = filtered.map((symptom, index) => createSymptomCard(symptom, index + 1)).join('');
    container.innerHTML = html;

    // Add click listeners for expandable cards
    document.querySelectorAll('.symptom-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('expanded'));
    });
}

/**
 * Filter symptoms based on classification
 */
function filterSymptoms(symptoms, filter) {
    if (filter === 'all') return symptoms;

    return symptoms.filter(symptom => {
        const classification = symptom.surprise_classification;
        if (filter === 'very') return classification.includes('VERY SURPRISING');
        if (filter === 'somewhat') return classification.includes('SOMEWHAT SURPRISING');
        if (filter === 'expected') return classification.includes('Expected');
        return true;
    });
}

/**
 * Create HTML for a symptom card
 */
function createSymptomCard(symptom, rank) {
    const evidence = symptom.evidence || {};
    const tier = symptom.tier || 4;
    const tierLabel = symptom.tier_label || 'Unknown';

    // Get classification emoji and color
    let classEmoji = '✓';
    let classColor = 'expected';
    if (symptom.surprise_classification.includes('VERY')) {
        classEmoji = '🔥';
        classColor = 'very-surprising';
    } else if (symptom.surprise_classification.includes('SOMEWHAT')) {
        classEmoji = '⚠️';
        classColor = 'somewhat-surprising';
    }

    // Format symptom name with medical term definition if available
    const rawSymptomName = symptom.symptom.replace(/_/g, ' ');
    const symptomName = rawSymptomName.replace(/\b\w/g, l => l.toUpperCase());
    const lowerSymptom = rawSymptomName.toLowerCase();
    const definition = MEDICAL_TERMS[lowerSymptom] ? ` (${MEDICAL_TERMS[lowerSymptom]})` : '';

    // Build evidence list
    const evidenceItems = [];
    if (evidence.reddit_posts) {
        evidenceItems.push(`${evidence.reddit_posts} patient reports (${(evidence.reddit_frequency * 100).toFixed(1)}%)`);
    }
    if (evidence.surprise_signals > 0) {
        evidenceItems.push(`${evidence.surprise_signals} patients expressed surprise`);
    }
    if (evidence.pubmed_papers > 0) {
        evidenceItems.push(`${evidence.pubmed_papers} research papers found`);
    }

    // Build surprise factors
    const factors = symptom.surprise_factors || {};
    const surpriseFactorsList = [];
    if (factors.not_in_criteria) surpriseFactorsList.push('Not in diagnostic criteria');
    if (factors.low_public_awareness) surpriseFactorsList.push('Low public awareness');
    if (factors.high_surprise_signals) surpriseFactorsList.push('Patients frequently surprised');
    if (factors.research_validated) surpriseFactorsList.push('Research validated');

    // Sample quotes
    const quotes = symptom.sample_quotes || [];
    const quotesHTML = quotes.length > 0 ? `
        <div class="quotes-section">
            <h4>Patient Quotes:</h4>
            ${quotes.map(q => `<blockquote>"${q}"</blockquote>`).join('')}
        </div>
    ` : '';

    return `
        <div class="symptom-card ${classColor}" data-classification="${classColor}">
            <div class="symptom-header">
                <div class="symptom-rank">#${rank}</div>
                <div class="symptom-info">
                    <h3>${classEmoji} ${symptomName}${definition ? `<span class="medical-term-definition">${definition}</span>` : ''}</h3>
                    <div class="symptom-meta">
                        <span class="surprise-score">Score: ${symptom.surprise_score.toFixed(2)}</span>
                        <span class="tier-badge tier-${tier}">${tierLabel}</span>
                    </div>
                </div>
                <div class="expand-icon">▼</div>
            </div>

            <div class="symptom-details">
                <div class="classification-badge ${classColor}">
                    ${symptom.surprise_classification}
                </div>

                ${symptom.tier_description ? `
                    <p class="tier-description">${symptom.tier_description}</p>
                ` : ''}

                <div class="evidence-section">
                    <h4>Evidence:</h4>
                    <ul>
                        ${evidenceItems.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>

                ${surpriseFactorsList.length > 0 ? `
                    <div class="surprise-factors-section">
                        <h4>Why Surprising:</h4>
                        <ul>
                            ${surpriseFactorsList.map(factor => `<li>${factor}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${quotesHTML}
            </div>
        </div>
    `;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Update filter and re-render
            currentFilter = e.target.dataset.filter;
            renderSymptoms();
        });
    });
}
