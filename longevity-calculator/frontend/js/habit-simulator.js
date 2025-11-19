/**
 * Habit Impact Simulator
 * Interactive controls to explore how lifestyle changes affect life expectancy
 */

class HabitSimulator {
  constructor(containerId, calculator, baselineAnswers, baselineLifeExpectancy) {
    this.container = document.getElementById(containerId);
    this.calculator = calculator;
    this.baselineAnswers = baselineAnswers;
    this.baselineLifeExpectancy = baselineLifeExpectancy;

    // Current modified lifestyle (starts same as baseline)
    this.modifiedLifestyle = {
      smoking: baselineAnswers.smoking,
      exercise: baselineAnswers.exercise,
      bmi: baselineAnswers.bmi,
      sleep: baselineAnswers.sleep,
      diet: baselineAnswers.diet,
      alcohol: baselineAnswers.alcohol,
    };

    this.factors = ['smoking', 'exercise', 'bmi', 'sleep', 'diet', 'alcohol'];
  }

  /**
   * Render habit controls
   */
  render() {
    this.container.innerHTML = '';

    this.factors.forEach((factor) => {
      const factorInfo = this.calculator.getFactorInfo(factor);
      if (!factorInfo) {
        return;
      }

      const control = this.createHabitControl(factor, factorInfo);
      this.container.appendChild(control);
    });

    // Update initial comparison
    this.updateComparison();
  }

  /**
   * Create control for a single habit
   */
  createHabitControl(factor, factorInfo) {
    const control = document.createElement('div');
    control.className = 'habit-control';

    // Get sorted levels by hazard ratio (best to worst)
    const sortedLevels = [...factorInfo.levels].sort((a, b) => a.hazardRatio - b.hazardRatio);

    // Find current level index
    const currentLevelKey = this.modifiedLifestyle[factor];
    const currentIndex = sortedLevels.findIndex((l) => l.key === currentLevelKey);

    // Create label
    const label = document.createElement('div');
    label.className = 'habit-label';

    const labelText = document.createElement('span');
    labelText.textContent = factorInfo.label;

    const valueText = document.createElement('span');
    valueText.className = 'habit-value';
    valueText.textContent = sortedLevels[currentIndex].label;
    valueText.id = `${factor}-value`;

    label.appendChild(labelText);
    label.appendChild(valueText);
    control.appendChild(label);

    // Create select dropdown (more intuitive than slider for discrete options)
    const select = document.createElement('select');
    select.className = 'habit-select';
    select.id = `${factor}-select`;

    sortedLevels.forEach((level, index) => {
      const option = document.createElement('option');
      option.value = level.key;
      option.textContent = level.label;
      if (level.key === currentLevelKey) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      this.handleHabitChange(factor, e.target.value);
    });

    control.appendChild(select);

    // Add description
    const description = document.createElement('div');
    description.className = 'habit-description';
    description.textContent = sortedLevels[currentIndex].description;
    description.id = `${factor}-description`;
    control.appendChild(description);

    return control;
  }

  /**
   * Handle habit change
   */
  handleHabitChange(factor, newLevel) {
    // Update modified lifestyle
    this.modifiedLifestyle[factor] = newLevel;

    // Update value display
    const factorInfo = this.calculator.getFactorInfo(factor);
    const levelInfo = factorInfo.levels.find((l) => l.key === newLevel);

    const valueEl = document.getElementById(`${factor}-value`);
    if (valueEl) {
      valueEl.textContent = levelInfo.label;
    }

    const descEl = document.getElementById(`${factor}-description`);
    if (descEl) {
      descEl.textContent = levelInfo.description;
    }

    // Recalculate and update comparison
    this.updateComparison();
  }

  /**
   * Update comparison display
   */
  updateComparison() {
    // Calculate new life expectancy with modified lifestyle
    const modifiedResult = this.calculator.calculateLifeExpectancy(
      this.baselineAnswers.age,
      this.baselineAnswers.sex,
      this.baselineAnswers.location,
      this.modifiedLifestyle
    );

    const difference = modifiedResult.lifeExpectancy - this.baselineLifeExpectancy;
    const diffFormatted = difference >= 0 ? `+${difference.toFixed(1)}` : difference.toFixed(1);

    // Update display
    document.getElementById('baselineAge').textContent =
      `${this.baselineLifeExpectancy.toFixed(1)} years`;
    document.getElementById('modifiedAge').textContent =
      `${modifiedResult.lifeExpectancy.toFixed(1)} years`;
    document.getElementById('ageDifference').textContent = `${diffFormatted} years`;

    // Color code difference
    const diffEl = document.getElementById('ageDifference');
    if (difference > 0) {
      diffEl.style.color = 'var(--gb-accent)';
    } else if (difference < 0) {
      diffEl.style.color = '#e74c3c';
    } else {
      diffEl.style.color = 'var(--gb-darkest)';
    }
  }
}

export { HabitSimulator };
