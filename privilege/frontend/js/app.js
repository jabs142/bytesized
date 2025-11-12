/**
 * Global Privilege Calculator - ByteSized
 * Quiz logic and smart conditional probability calculations
 */

// Quiz state
let currentQuestion = 0;
let answers = {};
let quizData = {};
let calculator = null;
let countriesData = null;

// DOM elements
const welcomeScreen = document.getElementById('welcomeScreen');
const questionScreen = document.getElementById('questionScreen');
const resultsScreen = document.getElementById('resultsScreen');
const startButton = document.getElementById('startQuiz');
const retakeButton = document.getElementById('retakeQuiz');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const privilegeScore = document.getElementById('privilegeScore');
const breakdownContainer = document.getElementById('breakdownContainer');

// Quiz questions with global statistics
// Each question includes:
// - question text
// - options with percentages (what % of global population falls into each category)
// - source for the statistic
// - value field that matches calculator.js expectations
const questions = [
    {
        id: 'location',
        question: 'Which country do you live in?',
        type: 'country',
        source: 'World Bank',
        helpText: 'We use this to understand your country\'s economic classification'
    },
    {
        id: 'education',
        question: 'What is your highest level of education completed?',
        options: [
            { text: 'University degree or higher', percentile: 10, value: 'university', source: 'UNESCO' },
            { text: 'Secondary school (high school)', percentile: 50, value: 'secondary', source: 'UNESCO' },
            { text: 'Primary school', percentile: 30, value: 'primary', source: 'UNESCO' },
            { text: 'No formal education', percentile: 10, value: 'none', source: 'UNESCO' }
        ]
    },
    {
        id: 'income',
        question: 'What is your annual household income?',
        options: [
            { text: 'Above $50,000 USD', percentile: 10, value: 'above_50k', source: 'World Bank' },
            { text: '$20,000 - $50,000 USD', percentile: 20, value: '20k_to_50k', source: 'World Bank' },
            { text: '$5,000 - $20,000 USD', percentile: 40, value: '5k_to_20k', source: 'World Bank' },
            { text: 'Below $5,000 USD', percentile: 30, value: 'below_5k', source: 'World Bank' }
        ]
    },
    {
        id: 'water',
        question: 'Do you have access to clean drinking water at home?',
        options: [
            { text: 'Yes, always', percentile: 71, value: 'always', source: 'WHO/UNICEF' },
            { text: 'Yes, but sometimes unreliable', percentile: 20, value: 'sometimes_unreliable', source: 'WHO/UNICEF' },
            { text: 'No, must collect from elsewhere', percentile: 9, value: 'must_collect', source: 'WHO/UNICEF' }
        ]
    },
    {
        id: 'healthcare',
        question: 'Can you afford to see a doctor when sick?',
        options: [
            { text: 'Yes, easily', percentile: 30, value: 'easily', source: 'WHO' },
            { text: 'Yes, but it\'s a financial strain', percentile: 40, value: 'financial_strain', source: 'WHO' },
            { text: 'No, cannot afford', percentile: 30, value: 'cannot_afford', source: 'WHO' }
        ]
    },
    {
        id: 'hunger',
        question: 'In the past year, how often did you worry about having enough food?',
        options: [
            { text: 'Never', percentile: 60, value: 'never', source: 'FAO' },
            { text: 'Occasionally', percentile: 20, value: 'occasionally', source: 'FAO' },
            { text: 'Frequently', percentile: 20, value: 'frequently', source: 'FAO' }
        ]
    },
    {
        id: 'internet',
        question: 'Do you have regular internet access?',
        options: [
            { text: 'Yes, high-speed at home', percentile: 35, value: 'high_speed_home', source: 'ITU' },
            { text: 'Yes, but limited/mobile only', percentile: 30, value: 'limited_mobile', source: 'ITU' },
            { text: 'No', percentile: 35, value: 'none', source: 'ITU' }
        ]
    },
    {
        id: 'safety',
        question: 'Do you feel safe walking alone at night in your neighborhood?',
        options: [
            { text: 'Yes, very safe', percentile: 40, value: 'very_safe', source: 'Gallup World Poll' },
            { text: 'Somewhat safe', percentile: 35, value: 'somewhat_safe', source: 'Gallup World Poll' },
            { text: 'No, unsafe', percentile: 25, value: 'unsafe', source: 'Gallup World Poll' }
        ]
    },
    {
        id: 'discrimination',
        question: 'Have you experienced discrimination in the past year?',
        options: [
            { text: 'No', percentile: 70, value: 'no', source: 'Gallup World Poll' },
            { text: 'Yes, occasionally', percentile: 20, value: 'occasionally', source: 'Gallup World Poll' },
            { text: 'Yes, frequently', percentile: 10, value: 'frequently', source: 'Gallup World Poll' }
        ]
    },
    {
        id: 'savings',
        question: 'Do you have savings to cover 3 months of expenses?',
        options: [
            { text: 'Yes, more than 3 months', percentile: 20, value: 'more_than_3mo', source: 'World Bank Global Findex' },
            { text: 'Yes, about 3 months', percentile: 15, value: 'about_3mo', source: 'World Bank Global Findex' },
            { text: 'Less than 3 months', percentile: 25, value: 'less_than_3mo', source: 'World Bank Global Findex' },
            { text: 'No savings', percentile: 40, value: 'none', source: 'World Bank Global Findex' }
        ]
    }
];

// Initialize quiz
async function init() {
    // Initialize the life statistics calculator
    calculator = new LifeStatsCalculator();
    try {
        await calculator.initialize();
        console.log('Life Stats calculator initialized successfully');
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
        alert('Failed to load calculator. Please refresh the page.');
        return;
    }

    // Load countries data
    try {
        const response = await fetch('data/countries.json');
        countriesData = await response.json();
        console.log('Countries data loaded successfully');
    } catch (error) {
        console.error('Failed to load countries data:', error);
        alert('Failed to load countries list. Please refresh the page.');
        return;
    }

    startButton.addEventListener('click', startQuiz);
    retakeButton.addEventListener('click', resetQuiz);
}

// Start quiz
function startQuiz() {
    currentQuestion = 0;
    answers = {};
    showScreen('question');
    displayQuestion();
}

// Display current question
function displayQuestion() {
    const question = questions[currentQuestion];

    // Update progress
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;

    // Display question
    questionText.textContent = question.question;

    // Clear options container
    optionsContainer.innerHTML = '';

    // Handle different question types
    if (question.type === 'number') {
        // Number input for birth year
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `input-${question.id}`;
        input.min = question.min;
        input.max = question.max;
        input.placeholder = question.placeholder;
        input.className = 'number-input';
        input.required = true;

        const helpText = document.createElement('p');
        helpText.className = 'help-text';
        helpText.textContent = question.helpText;

        const nextButton = document.createElement('button');
        nextButton.className = 'btn-primary';
        nextButton.textContent = 'NEXT ▶';
        nextButton.addEventListener('click', () => {
            const value = parseInt(input.value);
            if (value && value >= question.min && value <= question.max) {
                selectAnswer(null, value);
            } else {
                alert(`Please enter a valid year between ${question.min} and ${question.max}`);
            }
        });

        // Allow Enter key to submit
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                nextButton.click();
            }
        });

        inputGroup.appendChild(input);
        inputGroup.appendChild(helpText);
        inputGroup.appendChild(nextButton);
        optionsContainer.appendChild(inputGroup);

        // Focus on input
        setTimeout(() => input.focus(), 100);
    } else if (question.type === 'country') {
        // Country selection with searchable dropdown
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const select = document.createElement('select');
        select.id = `select-${question.id}`;
        select.className = 'country-select';
        select.required = true;

        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = '-- Select your country --';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        select.appendChild(placeholderOption);

        // Add all countries alphabetically
        const sortedCountries = Object.keys(countriesData.countries).sort();
        sortedCountries.forEach(countryName => {
            const option = document.createElement('option');
            option.value = countryName;
            option.textContent = countryName;
            select.appendChild(option);
        });

        const helpText = document.createElement('p');
        helpText.className = 'help-text';
        helpText.textContent = question.helpText;

        const nextButton = document.createElement('button');
        nextButton.className = 'btn-primary';
        nextButton.textContent = 'NEXT ▶';
        nextButton.addEventListener('click', () => {
            const selectedCountry = select.value;
            if (selectedCountry && countriesData.countries[selectedCountry]) {
                selectAnswer(null, selectedCountry, 'country');
            } else {
                alert('Please select a country from the list');
            }
        });

        inputGroup.appendChild(select);
        inputGroup.appendChild(helpText);
        inputGroup.appendChild(nextButton);
        optionsContainer.appendChild(inputGroup);

        // Focus on select
        setTimeout(() => select.focus(), 100);
    } else {
        // Multiple choice options
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option.text;
            button.addEventListener('click', () => selectAnswer(index));
            optionsContainer.appendChild(button);
        });
    }
}

// Handle answer selection
function selectAnswer(optionIndex, directValue = null, questionType = null) {
    const question = questions[currentQuestion];

    // Store answer based on question type
    if (question.type === 'number') {
        // Store direct value for number inputs
        answers[question.id] = {
            value: directValue
        };
    } else if (question.type === 'country' || questionType === 'country') {
        // Store country name and look up income group
        const countryName = directValue;
        const countryInfo = countriesData.countries[countryName];
        answers[question.id] = {
            country: countryName,
            incomeGroup: countryInfo.income_group,
            region: countryInfo.region,
            option: {
                text: countryName,
                value: countryInfo.income_group // This is what the calculator needs
            }
        };
    } else {
        // Store selected option for multiple choice
        const selectedOption = question.options[optionIndex];
        answers[question.id] = {
            option: selectedOption,
            index: optionIndex
        };
    }

    // Move to next question or show results
    currentQuestion++;

    if (currentQuestion < questions.length) {
        setTimeout(() => {
            displayQuestion();
        }, 200);
    } else {
        setTimeout(() => {
            calculateResults();
            showResults();
        }, 200);
    }
}

// Calculate life statistics score using weighted average
function calculateResults() {
    console.log('Calculating life stats score with answers:', answers);

    try {
        // Calculate base score
        const baseResult = calculator.calculateLifeStatsScore(answers);
        console.log('Base result:', baseResult);

        // Calculate confidence interval
        const ciResult = calculator.calculateWithConfidenceInterval(answers, 1000);
        console.log('Confidence interval:', ciResult);

        // Calculate factor contributions
        const contributions = calculator.calculateFactorContributions(answers);
        console.log('Factor contributions:', contributions);

        // Store in quizData
        quizData.lifeStatsScore = ciResult.median;
        quizData.confidenceInterval = {
            lower: ciResult.ci_lower,
            upper: ciResult.ci_upper,
            median: ciResult.median,
            mean: ciResult.mean,
            range: ciResult.ci_range
        };
        quizData.factorContributions = contributions;
        quizData.calculationMethod = baseResult.metadata.calculationMethod;
        quizData.factorDetails = baseResult.factorDetails;

        // Create breakdown of factors for display
        quizData.breakdown = Object.entries(answers).map(([questionId, answer]) => {
            const question = questions.find(q => q.id === questionId);
            if (question.type === 'number') {
                return {
                    category: question.question,
                    answer: answer.value.toString(),
                    source: question.source
                };
            } else if (question.type === 'country') {
                return {
                    category: question.question,
                    answer: answer.country,
                    source: question.source
                };
            } else {
                return {
                    category: question.question,
                    answer: answer.option.text,
                    globalPercentage: answer.option.percentile,
                    source: answer.option.source
                };
            }
        });

    } catch (error) {
        console.error('Error calculating results:', error);
        alert('Failed to calculate results. Please try again.');
        throw error;
    }
}

// Show results
function showResults() {
    // Display life stats score with confidence interval
    const ci = quizData.confidenceInterval;
    privilegeScore.textContent = `${quizData.lifeStatsScore}%`;

    // Add confidence interval display
    const scoreContainer = document.querySelector('.privilege-score');
    let ciDisplay = document.getElementById('ci-display');
    if (!ciDisplay) {
        ciDisplay = document.createElement('div');
        ciDisplay.id = 'ci-display';
        ciDisplay.className = 'confidence-interval-display';
        scoreContainer.appendChild(ciDisplay);
    }
    ciDisplay.innerHTML = `
        <div class="ci-label">90% Confidence Interval</div>
        <div class="ci-range">${Math.round(ci.lower)}% - ${Math.round(ci.upper)}%</div>
        <div class="ci-explanation">
            Based on 1,000 simulations accounting for statistical uncertainty
        </div>
    `;

    // Display breakdown
    breakdownContainer.innerHTML = '';

    // Add factor contributions section
    const contributionsSection = document.createElement('div');
    contributionsSection.className = 'contributions-section';
    contributionsSection.innerHTML = `
        <h3 class="section-header">📊 Factor Impact Analysis</h3>
        <p class="section-description">Each factor's weighted contribution to your overall score:</p>
    `;

    const contributionsList = document.createElement('div');
    contributionsList.className = 'contributions-list';

    // Display all factor contributors with new data structure
    const allContributors = quizData.factorContributions; // Show all factors
    allContributors.forEach((contribution, index) => {
        const contributionItem = document.createElement('div');
        contributionItem.className = 'contribution-item';
        contributionItem.innerHTML = `
            <div class="contribution-header">
                <span class="contribution-rank">#${index + 1}</span>
                <span class="contribution-label">${contribution.label}</span>
            </div>
            <div class="contribution-answer">${contribution.userAnswer}</div>
            <div class="contribution-details">
                <span class="contribution-percentile">Your percentile: ${Math.round(contribution.percentile)}%</span>
                <span class="contribution-weight">Weight: ${(contribution.weight * 100).toFixed(0)}%</span>
            </div>
            <div class="contribution-bar-container">
                <div class="contribution-bar" style="width: ${Math.min(100, contribution.percentile)}%"></div>
            </div>
            <div class="contribution-value">Contributes ${contribution.weightedContribution.toFixed(1)} points to final score</div>
        `;
        contributionsList.appendChild(contributionItem);
    });

    contributionsSection.appendChild(contributionsList);
    breakdownContainer.appendChild(contributionsSection);

    // Add answers breakdown section
    const answersSection = document.createElement('div');
    answersSection.className = 'answers-section';
    answersSection.innerHTML = '<h3 class="section-header">📋 Your Answers</h3>';

    quizData.breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = 'breakdown-item';
        div.innerHTML = `
            <div class="breakdown-title">${item.category}</div>
            <div class="breakdown-value">${item.answer}</div>
            ${item.globalPercentage ? `
                <div class="breakdown-meta">
                    ${item.globalPercentage}% of global population • Source: ${item.source}
                </div>
            ` : ''}
        `;
        answersSection.appendChild(div);
    });

    breakdownContainer.appendChild(answersSection);

    // Add comprehensive methodology explanation
    const methodologyNote = document.createElement('details');
    methodologyNote.className = 'methodology-note';
    methodologyNote.innerHTML = `
        <summary>📖 How We Calculate Your Score - Scientific Methodology (Click to expand)</summary>
        <div class="methodology-content">
            <h4>Weighted Average Approach</h4>
            <p>Your final score is calculated as a <strong>weighted average</strong> of your percentile on each dimension:</p>
            <ol>
                <li><strong>Map to global percentile</strong>: For each answer, we determine what % of global population has this circumstance or worse</li>
                <li><strong>Apply scientific weights</strong>: Based on established development indices and happiness research</li>
                <li><strong>Calculate weighted score</strong>: Your final percentile is the weighted average across all dimensions</li>
            </ol>

            <h4>Scientific Weights & Their Justification</h4>
            <div class="weights-breakdown">
                <div class="weight-item">
                    <div class="weight-header">
                        <span class="weight-factor">💰 Income (25%)</span>
                        <div class="weight-bar-bg"><div class="weight-bar" style="width: 25%; background: #4CAF50"></div></div>
                    </div>
                    <p class="weight-justification">
                        Strongest predictor of life satisfaction in regression analysis (β=0.28 in World Happiness Report).
                        <br><strong>Source:</strong> Helliwell, J. F., et al. (2023). <em>World Happiness Report 2023</em>. UN Sustainable Development Solutions Network.
                    </p>
                </div>

                <div class="weight-item">
                    <div class="weight-header">
                        <span class="weight-factor">🎓 Education (20%)</span>
                        <div class="weight-bar-bg"><div class="weight-bar" style="width: 20%; background: #2196F3"></div></div>
                    </div>
                    <p class="weight-justification">
                        Core component of UN Human Development Index (33% weight); enables economic opportunity and social mobility.
                        <br><strong>Source:</strong> UNDP (2023). <em>Human Development Report 2023/2024</em>. United Nations Development Programme.
                    </p>
                </div>

                <div class="weight-item">
                    <div class="weight-header">
                        <span class="weight-factor">🏥 Healthcare Access (20%)</span>
                        <div class="weight-bar-bg"><div class="weight-bar" style="width: 20%; background: #F44336"></div></div>
                    </div>
                    <p class="weight-justification">
                        Life-or-death factor; reflected in life expectancy (HDI component). 85% of global survey respondents rate health as "very important".
                        <br><strong>Source:</strong> WHO (2024). <em>Global Health Observatory</em>. World Health Organization.
                    </p>
                </div>

                <div class="weight-item">
                    <div class="weight-header">
                        <span class="weight-factor">💧 Clean Water Access (15%)</span>
                        <div class="weight-bar-bg"><div class="weight-bar" style="width: 15%; background: #00BCD4"></div></div>
                    </div>
                    <p class="weight-justification">
                        Basic survival need; constitutes 1/6 of MPI Living Standards dimension (16.7% of 33%).
                        <br><strong>Source:</strong> Alkire, S., et al. (2023). <em>Global Multidimensional Poverty Index 2023</em>. Oxford Poverty and Human Development Initiative.
                    </p>
                </div>

                <div class="weight-item">
                    <div class="weight-header">
                        <span class="weight-factor">🏛️ Country Infrastructure (10%)</span>
                        <div class="weight-bar-bg"><div class="weight-bar" style="width: 10%; background: #9C27B0"></div></div>
                    </div>
                    <p class="weight-justification">
                        Rule of law, safety, public services, and social safety nets enable all other factors.
                        <br><strong>Source:</strong> Stern, S., et al. (2023). <em>Social Progress Index 2023</em>. Social Progress Imperative.
                    </p>
                </div>

                <div class="weight-item">
                    <div class="weight-header">
                        <span class="weight-factor">🍽️ Food Security (5%)</span>
                        <div class="weight-bar-bg"><div class="weight-bar" style="width: 5%; background: #FF9800"></div></div>
                    </div>
                    <p class="weight-justification">
                        Survival need, though highly correlated with income. 20% of world experiences moderate-to-severe food insecurity.
                        <br><strong>Source:</strong> FAO (2024). <em>The State of Food Security and Nutrition in the World 2024</em>. Food and Agriculture Organization.
                    </p>
                </div>

                <div class="weight-item">
                    <div class="weight-header">
                        <span class="weight-factor">🌐 Internet Access (5%)</span>
                        <div class="weight-bar-bg"><div class="weight-bar" style="width: 5%; background: #607D8B"></div></div>
                    </div>
                    <p class="weight-justification">
                        Modern essential for education, employment, and civic participation, but lower priority than survival needs.
                        <br><strong>Source:</strong> ITU (2024). <em>Measuring Digital Development: ICT Price Trends 2024</em>. International Telecommunication Union.
                    </p>
                </div>
            </div>

            <h4>Why These Weights?</h4>
            <ol>
                <li><strong>UN Human Development Index (HDI)</strong>: Uses equal 33% weights for health, education, and income as foundational dimensions of human development</li>
                <li><strong>Oxford Multidimensional Poverty Index (MPI)</strong>: Allocates 33% each to health, education, and living standards (water, sanitation, electricity, etc.)</li>
                <li><strong>World Happiness Report</strong>: Regression analysis shows log GDP per capita as strongest predictor (β=0.28), followed by social support and healthy life expectancy</li>
                <li><strong>Pew Global Attitudes Survey</strong>: Cross-cultural surveys show 85% rate health "very important", 80% education, 75% economic opportunity</li>
            </ol>

            <h4>Advantages of This Approach</h4>
            <ul>
                <li>✅ <strong>Fair</strong>: Someone poor in a rich country scores appropriately low</li>
                <li>✅ <strong>Scientifically grounded</strong>: Weights from established development indices</li>
            </ul>

            <h4>Confidence Intervals</h4>
            <p>We run 1,000 Monte Carlo simulations adding statistical noise (±5 percentage points per dimension) to account for measurement uncertainty. The 90% confidence interval means we're 90% confident your true percentile falls within that range.</p>

            <h4>Limitations</h4>
            <ul>
                <li>Based on country-level aggregates, not individual purchasing power within countries</li>
                <li>Does not capture intersectional identities, systemic discrimination, or individual circumstances</li>
                <li>Some statistics are 1-3 years old (most recent available from authoritative sources)</li>
                <li>Educational tool for statistical context, not precise individual assessment</li>
            </ul>

            <h4>Complete Data Sources & References</h4>
            <ul class="references-list">
                <li>Helliwell, J. F., Layard, R., Sachs, J. D., et al. (2023). <em>World Happiness Report 2023</em>. Sustainable Development Solutions Network. <a href="https://worldhappiness.report/" target="_blank">worldhappiness.report</a></li>
                <li>UNDP (2023). <em>Human Development Report 2023/2024: Breaking the Gridlock</em>. United Nations Development Programme. <a href="https://hdr.undp.org/" target="_blank">hdr.undp.org</a></li>
                <li>Alkire, S., Kanagaratnam, U., & Suppa, N. (2023). <em>Global Multidimensional Poverty Index 2023</em>. Oxford Poverty and Human Development Initiative. <a href="https://ophi.org.uk/multidimensional-poverty-index/" target="_blank">ophi.org.uk</a></li>
                <li>Stern, S., Harmacek, J., Htitich, M., & Krylova, P. (2023). <em>Social Progress Index 2023</em>. Social Progress Imperative. <a href="https://www.socialprogress.org/" target="_blank">socialprogress.org</a></li>
                <li>World Bank (2024). <em>World Development Indicators</em>. <a href="https://databank.worldbank.org/" target="_blank">databank.worldbank.org</a></li>
                <li>WHO/UNICEF (2024). <em>Joint Monitoring Programme for Water Supply, Sanitation and Hygiene (JMP)</em>. <a href="https://washdata.org/" target="_blank">washdata.org</a></li>
                <li>FAO, IFAD, UNICEF, WFP and WHO (2024). <em>The State of Food Security and Nutrition in the World 2024</em>. Food and Agriculture Organization. <a href="https://www.fao.org/publications/sofi/" target="_blank">fao.org/publications/sofi</a></li>
                <li>ITU (2024). <em>Measuring Digital Development: Facts and Figures 2024</em>. International Telecommunication Union. <a href="https://www.itu.int/en/ITU-D/Statistics/" target="_blank">itu.int/Statistics</a></li>
            </ul>
        </div>
    `;
    breakdownContainer.appendChild(methodologyNote);

    showScreen('results');
}

// Screen navigation
function showScreen(screen) {
    welcomeScreen.classList.remove('active');
    questionScreen.classList.remove('active');
    resultsScreen.classList.remove('active');

    switch(screen) {
        case 'welcome':
            welcomeScreen.classList.add('active');
            break;
        case 'question':
            questionScreen.classList.add('active');
            break;
        case 'results':
            resultsScreen.classList.add('active');
            break;
    }
}

// Reset quiz
function resetQuiz() {
    showScreen('welcome');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
