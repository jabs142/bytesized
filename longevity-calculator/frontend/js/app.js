/**
 * Memento Mori - Main Application
 * Handles quiz flow, screen transitions, and user interactions
 */

import calculator from './calculator.js';
import { HabitSimulator } from './habit-simulator.js';
import { LifeCalendar } from './life-calendar.js';

// Application state
const state = {
  currentScreen: 'welcome',
  currentQuestion: 0,
  answers: {
    age: null,
    sex: null,
    location: null,
    smoking: null,
    exercise: null,
    bmi: null,
    sleep: null,
    diet: null,
    alcohol: null,
  },
  results: null,
  habitSimulator: null,
  lifeCalendar: null,
};

// Quiz questions
const questions = [
  {
    id: 'age',
    text: 'What is your current age?',
    type: 'number',
    placeholder: 'Enter age (18-100)',
    min: 18,
    max: 100,
  },
  {
    id: 'sex',
    text: 'What is your biological sex?',
    type: 'select',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  {
    id: 'location',
    text: 'Where do you live?',
    type: 'select',
    options: [], // Will be populated from calculator data
  },
  {
    id: 'smoking',
    text: 'What is your smoking status?',
    type: 'select',
    options: [
      { value: 'never', label: 'Never Smoker' },
      { value: 'former', label: 'Former Smoker' },
      { value: 'current', label: 'Current Smoker' },
    ],
  },
  {
    id: 'exercise',
    text: 'How much do you exercise per week?',
    type: 'select',
    options: [
      { value: 'high', label: 'High (150+ min/week)' },
      { value: 'moderate', label: 'Moderate (75-150 min/week)' },
      { value: 'low', label: 'Low (30-75 min/week)' },
      { value: 'sedentary', label: 'Sedentary (<30 min/week)' },
    ],
  },
  {
    id: 'bmi',
    text: 'What is your Body Mass Index (BMI) category?',
    type: 'select',
    options: [
      { value: 'underweight', label: 'Underweight (<18.5)' },
      { value: 'normal', label: 'Normal (18.5-24.9)' },
      { value: 'overweight', label: 'Overweight (25-29.9)' },
      { value: 'obese', label: 'Obese (30+)' },
    ],
  },
  {
    id: 'sleep',
    text: 'How many hours do you sleep per night?',
    type: 'select',
    options: [
      { value: 'very_short', label: 'Very Short (<6 hours)' },
      { value: 'short', label: 'Short (6-7 hours)' },
      { value: 'optimal', label: 'Optimal (7-8 hours)' },
      { value: 'long', label: 'Long (9+ hours)' },
    ],
  },
  {
    id: 'diet',
    text: 'How would you rate your diet quality?',
    type: 'select',
    options: [
      { value: 'excellent', label: 'Excellent - Mostly whole foods' },
      { value: 'good', label: 'Good - Balanced diet' },
      { value: 'fair', label: 'Fair - Some processed foods' },
      { value: 'poor', label: 'Poor - Mostly processed foods' },
    ],
  },
  {
    id: 'alcohol',
    text: 'How much alcohol do you consume?',
    type: 'select',
    options: [
      { value: 'none', label: 'None (abstainer)' },
      { value: 'moderate', label: 'Moderate (0-1 drinks/day)' },
      { value: 'light', label: 'Light (1-2 drinks/day)' },
      { value: 'heavy', label: 'Heavy (3+ drinks/day)' },
    ],
  },
];

/**
 * Initialize application
 */
async function init() {
  try {
    // Load calculator data
    await calculator.loadData();

    // Populate location options from calculator
    const locationQuestion = questions.find((q) => q.id === 'location');
    const locations = calculator.getLocations();
    locationQuestion.options = locations.map((loc) => ({
      value: loc,
      label: loc,
    }));

    // Setup event listeners
    setupEventListeners();

    // Show welcome screen
    showScreen('welcome');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('Failed to load calculator. Please refresh the page.');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Start button
  document.getElementById('startCalculator')?.addEventListener('click', startQuiz);

  // Results screen buttons
  document
    .getElementById('viewHabitSimulator')
    ?.addEventListener('click', () => showHabitSimulator());
  document.getElementById('viewLifeCalendar')?.addEventListener('click', () => showLifeCalendar());

  // Habit simulator back button
  document.getElementById('backToResults')?.addEventListener('click', () => showScreen('results'));

  // Life calendar buttons
  document
    .getElementById('backToResultsFromCalendar')
    ?.addEventListener('click', () => showScreen('results'));
  document.getElementById('restartCalculator')?.addEventListener('click', restartQuiz);
}

/**
 * Start quiz
 */
function startQuiz() {
  state.currentQuestion = 0;
  state.answers = {
    age: null,
    sex: null,
    location: null,
    smoking: null,
    exercise: null,
    bmi: null,
    sleep: null,
    diet: null,
    alcohol: null,
  };

  showScreen('question');
  renderQuestion();
}

/**
 * Render current question
 */
function renderQuestion() {
  const question = questions[state.currentQuestion];
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  // Update progress
  const progress = ((state.currentQuestion + 1) / questions.length) * 100;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Question ${state.currentQuestion + 1} of ${questions.length}`;

  // Update question text
  questionText.textContent = question.text;

  // Clear previous options
  optionsContainer.innerHTML = '';

  // Render options based on question type
  if (question.type === 'select') {
    question.options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'option-button';
      button.textContent = option.label;
      button.addEventListener('click', () => handleAnswer(question.id, option.value));
      optionsContainer.appendChild(button);
    });
  } else if (question.type === 'number') {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'number-input-group';

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'number-input';
    input.placeholder = question.placeholder;
    input.min = question.min;
    input.max = question.max;
    input.id = 'numberInput';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn-primary';
    submitBtn.innerHTML = '<span class="btn-text">NEXT</span><span class="btn-icon">▶</span>';
    submitBtn.addEventListener('click', () => {
      const value = parseInt(input.value);
      if (value >= question.min && value <= question.max) {
        handleAnswer(question.id, value);
      } else {
        alert(`Please enter a value between ${question.min} and ${question.max}`);
      }
    });

    // Allow Enter key to submit
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });

    inputGroup.appendChild(input);
    inputGroup.appendChild(submitBtn);
    optionsContainer.appendChild(inputGroup);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }
}

/**
 * Handle answer selection
 */
function handleAnswer(questionId, value) {
  state.answers[questionId] = value;

  // Move to next question or show results
  if (state.currentQuestion < questions.length - 1) {
    state.currentQuestion++;
    renderQuestion();
  } else {
    calculateResults();
    showScreen('results');
  }
}

/**
 * Calculate life expectancy results
 */
function calculateResults() {
  const lifestyle = {
    smoking: state.answers.smoking,
    exercise: state.answers.exercise,
    bmi: state.answers.bmi,
    sleep: state.answers.sleep,
    diet: state.answers.diet,
    alcohol: state.answers.alcohol,
  };

  state.results = calculator.calculateLifeExpectancy(
    state.answers.age,
    state.answers.sex,
    state.answers.location,
    lifestyle
  );

  renderResults();
}

/**
 * Render results screen
 */
function renderResults() {
  const { lifeExpectancy, yearsRemaining, weeksLived, weeksRemaining, estimatedDeathDate } =
    state.results;

  // Death date is now the primary display
  document.getElementById('estimatedDeathDate').textContent = estimatedDeathDate || '--';

  // Life expectancy details in sublabel
  document.getElementById('lifeExpectancy').textContent = `${lifeExpectancy} years`;
  document.getElementById('yearsRemaining').textContent = yearsRemaining.toFixed(1);
  document.getElementById('weeksLived').textContent = weeksLived.toLocaleString();
  document.getElementById('weeksRemaining').textContent = weeksRemaining.toLocaleString();
}

/**
 * Show habit simulator
 */
function showHabitSimulator() {
  showScreen('habitSimulator');

  // Initialize habit simulator if not already done
  if (!state.habitSimulator) {
    state.habitSimulator = new HabitSimulator(
      'habitControls',
      calculator,
      state.answers,
      state.results.lifeExpectancy
    );
  }

  state.habitSimulator.render();
}

/**
 * Show life calendar
 */
function showLifeCalendar() {
  showScreen('lifeCalendar');

  // Initialize life calendar if not already done
  if (!state.lifeCalendar) {
    state.lifeCalendar = new LifeCalendar(
      'lifeCalendarGrid',
      state.answers.age,
      state.results.lifeExpectancy
    );
  }

  state.lifeCalendar.render();
}

/**
 * Restart quiz
 */
function restartQuiz() {
  state.habitSimulator = null;
  state.lifeCalendar = null;
  startQuiz();
}

/**
 * Show specific screen
 */
function showScreen(screenName) {
  // Hide all screens
  document.querySelectorAll('.app-screen').forEach((screen) => {
    screen.classList.remove('active');
  });

  // Show target screen
  const screenMap = {
    welcome: 'welcomeScreen',
    question: 'questionScreen',
    results: 'resultsScreen',
    habitSimulator: 'habitSimulatorScreen',
    lifeCalendar: 'lifeCalendarScreen',
  };

  const targetId = screenMap[screenName];
  if (targetId) {
    document.getElementById(targetId)?.classList.add('active');
    state.currentScreen = screenName;
  }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { state, showScreen };
