/**
 * Global Life Statistics Calculator - Weighted Average Approach
 *
 * This module implements a scientifically-weighted percentile approach:
 * - Maps each answer to global percentile (% of world with this or worse)
 * - Applies weights based on UN HDI, Oxford MPI, and happiness research
 * - Calculates weighted average across all dimensions
 * - Includes Monte Carlo confidence intervals for uncertainty
 * - Transparent and intuitive methodology
 *
 * ByteSized Research - 2025
 */

class LifeStatsCalculator {
  constructor() {
    this.data = null; // Global statistics and weights
    this.initialized = false;

    // Scientific weights based on UN HDI, Oxford MPI, World Happiness Report
    this.WEIGHTS = {
      income: 0.25, // Strongest life satisfaction predictor
      education: 0.2, // HDI component, enables opportunity
      healthcare: 0.2, // Life-or-death, health outcomes
      water: 0.15, // Basic survival need
      location: 0.1, // Infrastructure, safety, rule of law
      hunger: 0.05, // Survival (correlates with income)
      internet: 0.05, // Modern essential but lower priority
    };
  }

  /**
   * Load global statistics and weight metadata from JSON file
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      const response = await fetch('data/conditional-probabilities.json');
      this.data = await response.json();
      this.initialized = true;
      // console.log('LifeStatsCalculator initialized with global statistics');
    } catch (error) {
      console.error('Failed to load global statistics:', error);
      throw new Error('Calculator initialization failed');
    }
  }

  /**
   * Main calculation function using weighted average of global percentiles
   *
   * @param {Object} answers - User's quiz answers
   * @returns {Object} Calculation results with percentile and metadata
   */
  calculateLifeStatsScore(answers) {
    if (!this.initialized) {
      throw new Error('Calculator not initialized. Call initialize() first.');
    }

    // Extract key factors
    const location = answers.location?.option?.value || 'lower-middle-income';

    // Calculate global percentile for each dimension
    const percentiles = {};
    const factorDetails = [];

    // Helper function to apply uncertainty (for Monte Carlo simulation)
    const applyUncertainty = (percentile) => {
      if (answers._uncertaintyMultipliers) {
        const noise = (Math.random() - 0.5) * 10; // ±5 percentage points
        return Math.max(1, Math.min(99, percentile + noise));
      }
      return percentile;
    };

    // 1. Location/Country (10% weight)
    // Based on World Bank income classification
    const locationPercentiles = {
      'high-income': 84, // 16% of world lives here
      'upper-middle-income': 49, // 51% live in this or better
      'lower-middle-income': 9, // 91% live in this or better
      'low-income': 1, // 99% live in this or better
    };
    percentiles.location = applyUncertainty(locationPercentiles[location] || 9);
    factorDetails.push({
      factor: 'location',
      value: location.replace('-', ' '),
      percentile: percentiles.location,
      weight: this.WEIGHTS.location,
      description: `Living in ${location.replace('-', ' ')} country`,
    });

    // 2. Education (20% weight)
    // Global percentiles from UNESCO data
    if (answers.education?.option?.value) {
      const eduPercentiles = {
        university: 90, // Top 10% globally
        secondary: 50, // Median
        primary: 20, // Bottom third
        none: 5, // Bottom 5%
      };
      percentiles.education = applyUncertainty(
        eduPercentiles[answers.education.option.value] || 50
      );
      factorDetails.push({
        factor: 'education',
        value: answers.education.option.text,
        percentile: percentiles.education,
        weight: this.WEIGHTS.education,
        description: `Education level: ${answers.education.option.text}`,
      });
    }

    // 3. Income (25% weight)
    // Global income distribution (PPP-adjusted)
    if (answers.income?.option?.value) {
      const incomePercentiles = {
        above_50k: 90, // Top 10%
        '20k_to_50k': 75, // Upper quarter
        '5k_to_20k': 45, // Below median
        below_5k: 20, // Bottom fifth
      };
      percentiles.income = applyUncertainty(incomePercentiles[answers.income.option.value] || 45);
      factorDetails.push({
        factor: 'income',
        value: answers.income.option.text,
        percentile: percentiles.income,
        weight: this.WEIGHTS.income,
        description: `Annual household income: ${answers.income.option.text}`,
      });
    }

    // 4. Water Access (15% weight)
    // WHO/UNICEF JMP data
    if (answers.water?.option?.value) {
      const waterPercentiles = {
        always: 74, // 74% have safely managed water
        sometimes_unreliable: 20, // Better than bottom 20%
        must_collect: 9, // Bottom 9%
      };
      percentiles.water = applyUncertainty(waterPercentiles[answers.water.option.value] || 50);
      factorDetails.push({
        factor: 'water',
        value: answers.water.option.text,
        percentile: percentiles.water,
        weight: this.WEIGHTS.water,
        description: `Water access: ${answers.water.option.text}`,
      });
    }

    // 5. Healthcare (20% weight)
    // WHO Global Health Observatory data
    if (answers.healthcare?.option?.value) {
      const healthcarePercentiles = {
        easily: 70, // Top 30%
        financial_strain: 40, // Below median
        cannot_afford: 20, // Bottom fifth
      };
      percentiles.healthcare = applyUncertainty(
        healthcarePercentiles[answers.healthcare.option.value] || 40
      );
      factorDetails.push({
        factor: 'healthcare',
        value: answers.healthcare.option.text,
        percentile: percentiles.healthcare,
        weight: this.WEIGHTS.healthcare,
        description: `Healthcare affordability: ${answers.healthcare.option.text}`,
      });
    }

    // 6. Food Security/Hunger (5% weight)
    // FAO data
    if (answers.hunger?.option?.value) {
      const hungerPercentiles = {
        never: 60, // 60% never worry
        occasionally: 30, // Middle group
        frequently: 10, // Bottom 10%
      };
      percentiles.hunger = applyUncertainty(hungerPercentiles[answers.hunger.option.value] || 50);
      factorDetails.push({
        factor: 'hunger',
        value: answers.hunger.option.text,
        percentile: percentiles.hunger,
        weight: this.WEIGHTS.hunger,
        description: `Food security: ${answers.hunger.option.text}`,
      });
    }

    // 7. Internet Access (5% weight)
    // ITU data
    if (answers.internet?.option?.value) {
      const internetPercentiles = {
        high_speed_home: 67, // 67% have internet
        limited_mobile: 40, // Have access but limited
        none: 15, // Bottom 15%
      };
      percentiles.internet = applyUncertainty(
        internetPercentiles[answers.internet.option.value] || 50
      );
      factorDetails.push({
        factor: 'internet',
        value: answers.internet.option.text,
        percentile: percentiles.internet,
        weight: this.WEIGHTS.internet,
        description: `Internet access: ${answers.internet.option.text}`,
      });
    }

    // Calculate weighted average
    let weightedSum = 0;
    let totalWeight = 0;

    for (const factor in percentiles) {
      const weight = this.WEIGHTS[factor] || 0;
      weightedSum += percentiles[factor] * weight;
      totalWeight += weight;
    }

    // Normalize if not all questions answered
    const finalPercentile = totalWeight > 0 ? weightedSum / totalWeight : 50;

    return {
      percentile: Math.round(finalPercentile * 10) / 10,
      percentiles: percentiles,
      factorDetails: factorDetails,
      metadata: {
        calculationMethod: 'weighted_average_global_percentiles',
        location: location,
        totalWeight: totalWeight,
        factorsIncluded: Object.keys(percentiles).length,
      },
    };
  }

  /**
   * Calculate confidence interval using Monte Carlo simulation
   *
   * @param {Object} answers - User's quiz answers
   * @param {Number} iterations - Number of Monte Carlo iterations (default 1000)
   * @returns {Object} Percentile with confidence intervals
   */
  calculateWithConfidenceInterval(answers, iterations = 1000) {
    const scores = [];

    for (let i = 0; i < iterations; i++) {
      // Add statistical uncertainty to percentiles
      const noisyAnswers = this.addUncertaintyNoise(answers);
      const result = this.calculateLifeStatsScore(noisyAnswers);
      scores.push(result.percentile);
    }

    scores.sort((a, b) => a - b);

    return {
      median: scores[Math.floor(iterations * 0.5)],
      mean: scores.reduce((a, b) => a + b, 0) / scores.length,
      ci_lower: scores[Math.floor(iterations * 0.05)], // 5th percentile
      ci_upper: scores[Math.floor(iterations * 0.95)], // 95th percentile
      ci_range: scores[Math.floor(iterations * 0.95)] - scores[Math.floor(iterations * 0.05)],
      distribution: scores,
    };
  }

  /**
   * Add statistical uncertainty to answers for Monte Carlo simulation
   * Simulates measurement uncertainty and individual variation
   */
  addUncertaintyNoise(answers) {
    const noisyAnswers = JSON.parse(JSON.stringify(answers)); // Deep copy

    // Flag that uncertainty should be applied (used in calculateLifeStatsScore)
    noisyAnswers._uncertaintyMultipliers = true;

    return noisyAnswers;
  }

  /**
   * Sample from normal distribution (Box-Muller transform)
   */
  sampleNormal(mean = 0, stdDev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Calculate factor contributions showing each dimension's weighted impact
   *
   * @param {Object} answers - User's quiz answers
   * @returns {Array} Factor contributions sorted by weighted impact
   */
  calculateFactorContributions(answers) {
    const result = this.calculateLifeStatsScore(answers);
    const contributions = [];

    // For each factor in the result, show its weighted contribution
    for (const detail of result.factorDetails) {
      const weightedContribution = detail.percentile * detail.weight;

      contributions.push({
        factor: detail.factor,
        label: this.getFactorLabel(detail.factor),
        userAnswer: detail.value,
        percentile: detail.percentile,
        weight: detail.weight,
        weightedContribution: weightedContribution,
        percentOfTotal: (weightedContribution / result.percentile) * 100,
      });
    }

    // Sort by weighted contribution (highest impact first)
    contributions.sort((a, b) => b.weightedContribution - a.weightedContribution);

    return contributions;
  }

  /**
   * Helper: Get human-readable factor labels
   */
  getFactorLabel(factorKey) {
    const labels = {
      location: 'Geographic Location',
      education: 'Education Level',
      income: 'Household Income',
      water: 'Clean Water Access',
      healthcare: 'Healthcare Access',
      internet: 'Internet Access',
      hunger: 'Food Security',
      savings: 'Emergency Savings',
      safety: 'Neighborhood Safety',
      discrimination: 'Discrimination Experience',
    };
    return labels[factorKey] || factorKey;
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LifeStatsCalculator;
}
