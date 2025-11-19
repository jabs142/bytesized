/**
 * Longevity Calculator
 * Calculates life expectancy using CDC life tables, Gompertz model, and lifestyle hazard ratios
 */

class LongevityCalculator {
  constructor() {
    this.lifeTables = null;
    this.lifestyleFactors = null;
    this.dataLoaded = false;
  }

  /**
   * Load data files
   */
  async loadData() {
    try {
      const [lifeTablesRes, lifestyleRes] = await Promise.all([
        fetch('data/life-tables.json'),
        fetch('data/lifestyle-factors.json'),
      ]);

      this.lifeTables = await lifeTablesRes.json();
      this.lifestyleFactors = await lifestyleRes.json();
      this.dataLoaded = true;
    } catch (error) {
      console.error('Failed to load calculator data:', error);
      throw new Error('Failed to load calculator data');
    }
  }

  /**
   * Get baseline mortality rate for given age and sex
   * Uses linear interpolation for ages between data points
   */
  getBaselineMortality(age, sex) {
    const mortalityRates = this.lifeTables[sex].mortality_rates;
    const ages = Object.keys(mortalityRates)
      .map(Number)
      .sort((a, b) => a - b);

    // If exact age exists, return it
    if (mortalityRates[age] !== undefined) {
      return mortalityRates[age];
    }

    // Find surrounding ages for interpolation
    let lowerAge = ages[0];
    let upperAge = ages[ages.length - 1];

    for (let i = 0; i < ages.length - 1; i++) {
      if (ages[i] <= age && ages[i + 1] > age) {
        lowerAge = ages[i];
        upperAge = ages[i + 1];
        break;
      }
    }

    // Linear interpolation
    const lowerRate = mortalityRates[lowerAge];
    const upperRate = mortalityRates[upperAge];
    const fraction = (age - lowerAge) / (upperAge - lowerAge);

    return lowerRate + fraction * (upperRate - lowerRate);
  }

  /**
   * Calculate mortality using Gompertz model
   * mortality(age) = alpha * exp(beta * age)
   */
  gompertzMortality(age, sex) {
    const params = this.lifeTables.gompertz_parameters[sex];
    return params.alpha * Math.exp(params.beta * age);
  }

  /**
   * Get combined hazard ratio from lifestyle factors
   */
  getCombinedHazardRatio(lifestyle) {
    let combinedHR = 1.0;

    for (const [factor, level] of Object.entries(lifestyle)) {
      if (this.lifestyleFactors.factors[factor]) {
        const hr = this.lifestyleFactors.factors[factor].levels[level].hazard_ratio;
        combinedHR *= hr;
      }
    }

    return combinedHR;
  }

  /**
   * Calculate remaining life expectancy using survival curves
   * @param {number} currentAge - Current age in years
   * @param {string} sex - 'male' or 'female'
   * @param {string} location - Country/location
   * @param {Object} lifestyle - Lifestyle factors {smoking, exercise, bmi, sleep, diet, alcohol}
   * @returns {Object} - {lifeExpectancy, yearsRemaining, weeksLived, weeksRemaining}
   */
  calculateLifeExpectancy(currentAge, sex, location, lifestyle) {
    // Get location adjustment
    const locationAdj = this.lifeTables.location_adjustments[location] || 0;

    // Get combined hazard ratio from lifestyle
    const hazardRatio = this.getCombinedHazardRatio(lifestyle);

    // Calculate adjusted mortality for current age
    const baseMortality = this.getBaselineMortality(currentAge, sex);
    const adjustedMortality = baseMortality * hazardRatio;

    // Simulate survival curve
    let survivalProbability = 1.0;
    let expectedYears = 0;
    const maxAge = 120;

    for (let age = currentAge; age < maxAge; age++) {
      // Get mortality rate for this age (with hazard ratio)
      let mortalityRate = this.getBaselineMortality(age, sex) * hazardRatio;

      // Use Gompertz model for ages beyond our data
      if (age > 100) {
        mortalityRate = this.gompertzMortality(age, sex) * hazardRatio;
      }

      // Update survival probability
      survivalProbability *= 1 - mortalityRate;

      // Add to expected years (weighted by survival probability)
      expectedYears += survivalProbability;

      // Stop if survival probability becomes negligible
      if (survivalProbability < 0.001) {
        break;
      }
    }

    // Apply location adjustment
    const yearsRemaining = expectedYears + locationAdj;
    const lifeExpectancy = currentAge + yearsRemaining;

    // Calculate weeks
    const weeksLived = Math.floor(currentAge * 52.18);
    const weeksRemaining = Math.floor(yearsRemaining * 52.18);

    return {
      lifeExpectancy: Math.round(lifeExpectancy * 10) / 10,
      yearsRemaining: Math.round(yearsRemaining * 10) / 10,
      weeksLived,
      weeksRemaining,
      totalWeeks: weeksLived + weeksRemaining,
    };
  }

  /**
   * Calculate impact of changing one lifestyle factor
   * @returns {number} - Years gained or lost
   */
  calculateHabitImpact(currentAge, sex, location, currentLifestyle, factor, newLevel) {
    // Calculate baseline with current lifestyle
    const baseline = this.calculateLifeExpectancy(currentAge, sex, location, currentLifestyle);

    // Calculate with modified lifestyle
    const modifiedLifestyle = { ...currentLifestyle, [factor]: newLevel };
    const modified = this.calculateLifeExpectancy(currentAge, sex, location, modifiedLifestyle);

    return {
      yearsGained: Math.round((modified.lifeExpectancy - baseline.lifeExpectancy) * 10) / 10,
      baselineAge: baseline.lifeExpectancy,
      modifiedAge: modified.lifeExpectancy,
    };
  }

  /**
   * Get all available levels for a lifestyle factor
   */
  getFactorLevels(factor) {
    if (!this.lifestyleFactors.factors[factor]) {
      return [];
    }

    return Object.entries(this.lifestyleFactors.factors[factor].levels).map(([key, value]) => ({
      key,
      label: value.label,
      description: value.description,
      hazardRatio: value.hazard_ratio,
    }));
  }

  /**
   * Get display info for a lifestyle factor
   */
  getFactorInfo(factor) {
    if (!this.lifestyleFactors.factors[factor]) {
      return null;
    }

    return {
      label: this.lifestyleFactors.factors[factor].label,
      description: this.lifestyleFactors.factors[factor].description,
      levels: this.getFactorLevels(factor),
    };
  }

  /**
   * Get all lifestyle factors
   */
  getAllFactors() {
    return Object.keys(this.lifestyleFactors.factors);
  }

  /**
   * Get available locations
   */
  getLocations() {
    return Object.keys(this.lifeTables.location_adjustments);
  }
}

// Create global instance
const calculator = new LongevityCalculator();

// Export for ES6 modules
export default calculator;
export { LongevityCalculator };
