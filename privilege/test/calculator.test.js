/**
 * Unit Tests for LifeStatsCalculator
 * Comprehensive test suite for calculator logic, weighted averages, and edge cases
 */

const LifeStatsCalculator = require('../frontend/js/calculator.js');

describe('LifeStatsCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new LifeStatsCalculator();
    // Mock initialize to avoid fetch calls
    calculator.initialized = true;
    calculator.data = { _metadata: { version: '1.0.0' } };
  });

  // ============================================
  // CONSTRUCTOR & INITIALIZATION TESTS
  // ============================================

  describe('Constructor & Initialization', () => {
    test('constructor initializes with correct weights', () => {
      expect(calculator.WEIGHTS).toBeDefined();
      expect(calculator.WEIGHTS.income).toBe(0.25);
      expect(calculator.WEIGHTS.education).toBe(0.2);
      expect(calculator.WEIGHTS.healthcare).toBe(0.2);
      expect(calculator.WEIGHTS.water).toBe(0.15);
      expect(calculator.WEIGHTS.location).toBe(0.1);
      expect(calculator.WEIGHTS.hunger).toBe(0.05);
      expect(calculator.WEIGHTS.internet).toBe(0.05);
    });

    test('weights sum to exactly 1.0', () => {
      const weights = calculator.WEIGHTS;
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    test('constructor initializes with initialized=false', () => {
      const newCalc = new LifeStatsCalculator();
      expect(newCalc.initialized).toBe(false);
      expect(newCalc.data).toBeNull();
    });

    test('calculateLifeStatsScore throws error if not initialized', () => {
      const uninitCalc = new LifeStatsCalculator();
      expect(() => {
        uninitCalc.calculateLifeStatsScore({});
      }).toThrow('Calculator not initialized');
    });
  });

  // ============================================
  // INDIVIDUAL FACTOR CALCULATION TESTS
  // ============================================

  describe('Location Factor Calculations', () => {
    test('high-income location scores 84th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.location).toBe(84);
    });

    test('upper-middle-income location scores 49th percentile', () => {
      const answers = {
        location: { option: { value: 'upper-middle-income' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.location).toBe(49);
    });

    test('lower-middle-income location scores 9th percentile', () => {
      const answers = {
        location: { option: { value: 'lower-middle-income' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.location).toBe(9);
    });

    test('low-income location scores 1st percentile', () => {
      const answers = {
        location: { option: { value: 'low-income' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.location).toBe(1);
    });

    test('missing location defaults to lower-middle-income (9th percentile)', () => {
      const answers = {};
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.location).toBe(9);
    });
  });

  describe('Education Factor Calculations', () => {
    test('university education scores 90th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.education).toBe(90);
    });

    test('secondary education scores 50th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'secondary', text: 'Secondary' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.education).toBe(50);
    });

    test('primary education scores 20th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'primary', text: 'Primary' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.education).toBe(20);
    });

    test('no formal education scores 5th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'none', text: 'None' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.education).toBe(5);
    });
  });

  describe('Income Factor Calculations', () => {
    test('income above $50k scores 90th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.income).toBe(90);
    });

    test('income $20k-$50k scores 75th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        income: { option: { value: '20k_to_50k', text: '$20k-$50k' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.income).toBe(75);
    });

    test('income $5k-$20k scores 45th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.income).toBe(45);
    });

    test('income below $5k scores 20th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        income: { option: { value: 'below_5k', text: 'Below $5k' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.income).toBe(20);
    });
  });

  describe('Water Access Factor Calculations', () => {
    test('always have clean water scores 74th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        water: { option: { value: 'always', text: 'Yes, always' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.water).toBe(74);
    });

    test('sometimes unreliable water scores 20th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        water: { option: { value: 'sometimes_unreliable', text: 'Sometimes unreliable' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.water).toBe(20);
    });

    test('must collect water scores 9th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        water: { option: { value: 'must_collect', text: 'Must collect' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.water).toBe(9);
    });
  });

  describe('Healthcare Factor Calculations', () => {
    test('easily afford healthcare scores 70th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        healthcare: { option: { value: 'easily', text: 'Yes, easily' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.healthcare).toBe(70);
    });

    test('healthcare with financial strain scores 40th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        healthcare: { option: { value: 'financial_strain', text: 'Financial strain' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.healthcare).toBe(40);
    });

    test('cannot afford healthcare scores 20th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        healthcare: { option: { value: 'cannot_afford', text: 'Cannot afford' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.healthcare).toBe(20);
    });
  });

  describe('Food Security Factor Calculations', () => {
    test('never worry about food scores 60th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        hunger: { option: { value: 'never', text: 'Never' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.hunger).toBe(60);
    });

    test('occasionally worry about food scores 30th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        hunger: { option: { value: 'occasionally', text: 'Occasionally' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.hunger).toBe(30);
    });

    test('frequently worry about food scores 10th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        hunger: { option: { value: 'frequently', text: 'Frequently' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.hunger).toBe(10);
    });
  });

  describe('Internet Access Factor Calculations', () => {
    test('high-speed internet at home scores 67th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        internet: { option: { value: 'high_speed_home', text: 'High-speed home' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.internet).toBe(67);
    });

    test('limited/mobile internet scores 40th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        internet: { option: { value: 'limited_mobile', text: 'Limited mobile' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.internet).toBe(40);
    });

    test('no internet access scores 15th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        internet: { option: { value: 'none', text: 'No access' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.internet).toBe(15);
    });
  });

  // ============================================
  // WEIGHTED AVERAGE CALCULATION TESTS
  // ============================================

  describe('Weighted Average Calculations', () => {
    test('all best answers produce high score (78-85%)', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
        water: { option: { value: 'always', text: 'Always' } },
        healthcare: { option: { value: 'easily', text: 'Easily' } },
        hunger: { option: { value: 'never', text: 'Never' } },
        internet: { option: { value: 'high_speed_home', text: 'High-speed' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentile).toBeGreaterThanOrEqual(78);
      expect(result.percentile).toBeLessThanOrEqual(85);
    });

    test('all worst answers produce low score (5-15%)', () => {
      const answers = {
        location: { option: { value: 'low-income' } },
        education: { option: { value: 'none', text: 'None' } },
        income: { option: { value: 'below_5k', text: 'Below $5k' } },
        water: { option: { value: 'must_collect', text: 'Must collect' } },
        healthcare: { option: { value: 'cannot_afford', text: 'Cannot afford' } },
        hunger: { option: { value: 'frequently', text: 'Frequently' } },
        internet: { option: { value: 'none', text: 'No access' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentile).toBeGreaterThanOrEqual(5);
      expect(result.percentile).toBeLessThanOrEqual(15);
    });

    test('partial answers normalize weights correctly', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);

      // Should only include location (10%) and education (20%)
      expect(result.metadata.factorsIncluded).toBe(2);
      expect(result.metadata.totalWeight).toBeCloseTo(0.3, 5);

      // Weighted average: (84 * 0.10 + 90 * 0.20) / 0.30 = 26.4 / 0.30 = 88
      expect(result.percentile).toBeCloseTo(88, 0);
    });

    test('single answer uses that factor weight', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);

      expect(result.metadata.factorsIncluded).toBe(1);
      expect(result.metadata.totalWeight).toBe(0.1);
      expect(result.percentile).toBe(84);
    });
  });

  // ============================================
  // EDGE CASES & ERROR HANDLING
  // ============================================

  describe('Edge Cases', () => {
    test('empty answers object uses defaults', () => {
      const answers = {};
      const result = calculator.calculateLifeStatsScore(answers);

      expect(result).toBeDefined();
      expect(result.percentile).toBeDefined();
      expect(result.percentiles.location).toBe(9); // Default location
    });

    test('null answer values are ignored', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: null,
        income: undefined,
      };
      const result = calculator.calculateLifeStatsScore(answers);

      expect(result.metadata.factorsIncluded).toBe(1); // Only location
    });

    test('missing option property is handled gracefully', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { value: 'university' }, // Missing 'option' wrapper
      };
      const result = calculator.calculateLifeStatsScore(answers);

      // Should only count location since education is malformed
      expect(result.metadata.factorsIncluded).toBe(1);
    });

    test('unknown income group defaults to 9th percentile', () => {
      const answers = {
        location: { option: { value: 'unknown-income-group' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.location).toBe(9);
    });

    test('unknown education value defaults to 50th percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'masters', text: 'Masters' } }, // Not in mapping
      };
      const result = calculator.calculateLifeStatsScore(answers);
      expect(result.percentiles.education).toBe(50);
    });
  });

  // ============================================
  // HELPER METHOD TESTS
  // ============================================

  describe('Helper Methods', () => {
    test('addUncertaintyNoise creates deep copy', () => {
      const original = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };
      const noisy = calculator.addUncertaintyNoise(original);

      // Modify noisy copy
      noisy.location.option.value = 'low-income';

      // Original should be unchanged
      expect(original.location.option.value).toBe('high-income');
      expect(noisy._uncertaintyMultipliers).toBe(true);
    });

    test('sampleNormal generates values with reasonable distribution', () => {
      const samples = [];
      for (let i = 0; i < 1000; i++) {
        samples.push(calculator.sampleNormal(0, 1));
      }

      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const variance = samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;

      // Mean should be close to 0
      expect(mean).toBeGreaterThan(-0.2);
      expect(mean).toBeLessThan(0.2);

      // Variance should be close to 1
      expect(variance).toBeGreaterThan(0.8);
      expect(variance).toBeLessThan(1.2);
    });

    test('getFactorLabel returns correct labels for all factors', () => {
      expect(calculator.getFactorLabel('location')).toBe('Geographic Location');
      expect(calculator.getFactorLabel('education')).toBe('Education Level');
      expect(calculator.getFactorLabel('income')).toBe('Household Income');
      expect(calculator.getFactorLabel('water')).toBe('Clean Water Access');
      expect(calculator.getFactorLabel('healthcare')).toBe('Healthcare Access');
      expect(calculator.getFactorLabel('internet')).toBe('Internet Access');
      expect(calculator.getFactorLabel('hunger')).toBe('Food Security');
    });

    test('getFactorLabel returns original key for unknown factor', () => {
      expect(calculator.getFactorLabel('unknown_factor')).toBe('unknown_factor');
    });
  });

  // ============================================
  // FACTOR CONTRIBUTIONS TESTS
  // ============================================

  describe('Factor Contributions', () => {
    test('contributions when normalized sum to final percentile', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);
      const contributions = calculator.calculateFactorContributions(answers);

      // Sum of weighted contributions
      const sum = contributions.reduce((total, c) => total + c.weightedContribution, 0);

      // Total weight used (for normalization)
      const totalWeight = contributions.reduce((total, c) => total + c.weight, 0);

      // Normalized sum should equal final percentile
      const normalizedSum = sum / totalWeight;
      expect(normalizedSum).toBeCloseTo(result.percentile, 1);
    });

    test('contributions are sorted by weighted contribution (highest first)', () => {
      const answers = {
        location: { option: { value: 'high-income' } }, // 84 * 0.10 = 8.4
        education: { option: { value: 'university', text: 'University' } }, // 90 * 0.20 = 18
        income: { option: { value: 'above_50k', text: 'Above $50k' } }, // 90 * 0.25 = 22.5
      };
      const contributions = calculator.calculateFactorContributions(answers);

      // Income should be first (highest contribution)
      expect(contributions[0].factor).toBe('income');
      expect(contributions[0].weightedContribution).toBeCloseTo(22.5, 1);

      // Education should be second
      expect(contributions[1].factor).toBe('education');

      // Location should be last
      expect(contributions[2].factor).toBe('location');
    });

    test('all factors included in contributions', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };
      const contributions = calculator.calculateFactorContributions(answers);

      expect(contributions).toHaveLength(3);
      expect(contributions.every((c) => c.percentile !== undefined)).toBe(true);
      expect(contributions.every((c) => c.weight !== undefined)).toBe(true);
      expect(contributions.every((c) => c.weightedContribution !== undefined)).toBe(true);
    });

    test('contribution includes correct weight for each factor', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };
      const contributions = calculator.calculateFactorContributions(answers);

      const incomeContribution = contributions.find((c) => c.factor === 'income');
      expect(incomeContribution.weight).toBe(0.25);

      const locationContribution = contributions.find((c) => c.factor === 'location');
      expect(locationContribution.weight).toBe(0.1);
    });
  });

  // ============================================
  // CONFIDENCE INTERVAL TESTS
  // ============================================

  describe('Confidence Intervals', () => {
    test('median falls within CI bounds', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };
      const ciResult = calculator.calculateWithConfidenceInterval(answers, 100);

      expect(ciResult.median).toBeGreaterThanOrEqual(ciResult.ci_lower);
      expect(ciResult.median).toBeLessThanOrEqual(ciResult.ci_upper);
    });

    test('distribution is sorted ascending', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
      };
      const ciResult = calculator.calculateWithConfidenceInterval(answers, 100);

      for (let i = 1; i < ciResult.distribution.length; i++) {
        expect(ciResult.distribution[i]).toBeGreaterThanOrEqual(ciResult.distribution[i - 1]);
      }
    });

    test('CI range equals ci_upper - ci_lower', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
      };
      const ciResult = calculator.calculateWithConfidenceInterval(answers, 100);

      expect(ciResult.ci_range).toBeCloseTo(ciResult.ci_upper - ciResult.ci_lower, 1);
    });

    test('iterations=1 produces narrow CI', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
      };
      const ciResult = calculator.calculateWithConfidenceInterval(answers, 1);

      // With only 1 iteration, CI should be very narrow or zero
      expect(ciResult.ci_range).toBeLessThan(1);
    });

    test('large iterations produce consistent results', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };
      const ciResult = calculator.calculateWithConfidenceInterval(answers, 1000);

      // Median should be close to point estimate (no uncertainty)
      const pointEstimate = calculator.calculateLifeStatsScore(answers).percentile;
      expect(Math.abs(ciResult.median - pointEstimate)).toBeLessThan(5);
    });

    test('mean is calculated correctly', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
      };
      const ciResult = calculator.calculateWithConfidenceInterval(answers, 100);

      const manualMean =
        ciResult.distribution.reduce((a, b) => a + b, 0) / ciResult.distribution.length;
      expect(ciResult.mean).toBeCloseTo(manualMean, 5);
    });
  });

  // ============================================
  // RESULT STRUCTURE TESTS
  // ============================================

  describe('Result Structure', () => {
    test('result has correct structure', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);

      expect(result).toHaveProperty('percentile');
      expect(result).toHaveProperty('percentiles');
      expect(result).toHaveProperty('factorDetails');
      expect(result).toHaveProperty('metadata');

      expect(result.metadata).toHaveProperty('calculationMethod');
      expect(result.metadata).toHaveProperty('location');
      expect(result.metadata).toHaveProperty('totalWeight');
      expect(result.metadata).toHaveProperty('factorsIncluded');
    });

    test('percentile is rounded to 1 decimal place', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);

      // Check that percentile has at most 1 decimal place
      const decimalPlaces = (result.percentile.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });

    test('factorDetails includes all answered factors', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);

      expect(result.factorDetails).toHaveLength(3);
      expect(result.factorDetails.every((f) => f.factor !== undefined)).toBe(true);
      expect(result.factorDetails.every((f) => f.value !== undefined)).toBe(true);
      expect(result.factorDetails.every((f) => f.percentile !== undefined)).toBe(true);
      expect(result.factorDetails.every((f) => f.weight !== undefined)).toBe(true);
    });

    test('metadata.calculationMethod is correct', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
      };
      const result = calculator.calculateLifeStatsScore(answers);

      expect(result.metadata.calculationMethod).toBe('weighted_average_global_percentiles');
    });
  });
});
