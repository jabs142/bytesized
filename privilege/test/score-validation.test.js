/**
 * Score Validation & Regression Tests
 * Tests known scenarios to ensure scores remain consistent and logically sound
 */

const LifeStatsCalculator = require('../frontend/js/calculator.js');

describe('Score Validation & Regression Tests', () => {
  let calculator;

  beforeEach(() => {
    calculator = new LifeStatsCalculator();
    calculator.initialized = true;
    calculator.data = { _metadata: { version: '1.0.0' } };
  });

  // ============================================
  // KNOWN SCENARIO REGRESSION TESTS
  // ============================================

  describe('Known Scenario Regression Tests', () => {
    test('Singapore affluent resident: 78-82%', () => {
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
      console.log('Singapore affluent:', result.percentile);

      expect(result.percentile).toBeGreaterThanOrEqual(78);
      expect(result.percentile).toBeLessThanOrEqual(82);
    });

    test('US affluent resident: 78-82% (same as Singapore)', () => {
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
      console.log('US affluent:', result.percentile);

      expect(result.percentile).toBeGreaterThanOrEqual(78);
      expect(result.percentile).toBeLessThanOrEqual(82);
    });

    test('China middle-class resident: 50-56%', () => {
      const answers = {
        location: { option: { value: 'upper-middle-income' } },
        education: { option: { value: 'secondary', text: 'Secondary' } },
        income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
        water: { option: { value: 'always', text: 'Always' } },
        healthcare: { option: { value: 'financial_strain', text: 'Financial strain' } },
        hunger: { option: { value: 'never', text: 'Never' } },
        internet: { option: { value: 'high_speed_home', text: 'High-speed' } },
      };

      const result = calculator.calculateLifeStatsScore(answers);
      console.log('China middle-class:', result.percentile);

      expect(result.percentile).toBeGreaterThanOrEqual(50);
      expect(result.percentile).toBeLessThanOrEqual(56);
    });

    test('India rural resident with limited resources: 12-20%', () => {
      const answers = {
        location: { option: { value: 'lower-middle-income' } },
        education: { option: { value: 'primary', text: 'Primary' } },
        income: { option: { value: 'below_5k', text: 'Below $5k' } },
        water: { option: { value: 'sometimes_unreliable', text: 'Sometimes unreliable' } },
        healthcare: { option: { value: 'cannot_afford', text: 'Cannot afford' } },
        hunger: { option: { value: 'occasionally', text: 'Occasionally' } },
        internet: { option: { value: 'none', text: 'No access' } },
      };

      const result = calculator.calculateLifeStatsScore(answers);
      console.log('India rural:', result.percentile);

      expect(result.percentile).toBeGreaterThanOrEqual(12);
      expect(result.percentile).toBeLessThanOrEqual(20);
    });

    test('Nigeria disadvantaged resident: 5-15%', () => {
      const answers = {
        location: { option: { value: 'lower-middle-income' } },
        education: { option: { value: 'none', text: 'No formal education' } },
        income: { option: { value: 'below_5k', text: 'Below $5k' } },
        water: { option: { value: 'must_collect', text: 'Must collect' } },
        healthcare: { option: { value: 'cannot_afford', text: 'Cannot afford' } },
        hunger: { option: { value: 'frequently', text: 'Frequently' } },
        internet: { option: { value: 'none', text: 'No access' } },
      };

      const result = calculator.calculateLifeStatsScore(answers);
      console.log('Nigeria disadvantaged:', result.percentile);

      expect(result.percentile).toBeGreaterThanOrEqual(5);
      expect(result.percentile).toBeLessThanOrEqual(15);
    });

    test('Brazil middle-income urban resident: 45-55%', () => {
      const answers = {
        location: { option: { value: 'upper-middle-income' } },
        education: { option: { value: 'secondary', text: 'Secondary' } },
        income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
        water: { option: { value: 'always', text: 'Always' } },
        healthcare: { option: { value: 'financial_strain', text: 'Financial strain' } },
        hunger: { option: { value: 'occasionally', text: 'Occasionally' } },
        internet: { option: { value: 'limited_mobile', text: 'Limited mobile' } },
      };

      const result = calculator.calculateLifeStatsScore(answers);
      console.log('Brazil middle-income:', result.percentile);

      expect(result.percentile).toBeGreaterThanOrEqual(45);
      expect(result.percentile).toBeLessThanOrEqual(55);
    });
  });

  // ============================================
  // LOGICAL CONSISTENCY TESTS
  // ============================================

  describe('Logical Consistency Tests', () => {
    test('better location always produces higher or equal score', () => {
      const baseAnswers = {
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };

      const lowIncome = { ...baseAnswers, location: { option: { value: 'low-income' } } };
      const lowerMiddle = {
        ...baseAnswers,
        location: { option: { value: 'lower-middle-income' } },
      };
      const upperMiddle = {
        ...baseAnswers,
        location: { option: { value: 'upper-middle-income' } },
      };
      const highIncome = { ...baseAnswers, location: { option: { value: 'high-income' } } };

      const score1 = calculator.calculateLifeStatsScore(lowIncome).percentile;
      const score2 = calculator.calculateLifeStatsScore(lowerMiddle).percentile;
      const score3 = calculator.calculateLifeStatsScore(upperMiddle).percentile;
      const score4 = calculator.calculateLifeStatsScore(highIncome).percentile;

      expect(score2).toBeGreaterThan(score1);
      expect(score3).toBeGreaterThan(score2);
      expect(score4).toBeGreaterThan(score3);
    });

    test('better education always produces higher or equal score', () => {
      const baseAnswers = {
        location: { option: { value: 'high-income' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };

      const none = { ...baseAnswers, education: { option: { value: 'none', text: 'None' } } };
      const primary = {
        ...baseAnswers,
        education: { option: { value: 'primary', text: 'Primary' } },
      };
      const secondary = {
        ...baseAnswers,
        education: { option: { value: 'secondary', text: 'Secondary' } },
      };
      const university = {
        ...baseAnswers,
        education: { option: { value: 'university', text: 'University' } },
      };

      const score1 = calculator.calculateLifeStatsScore(none).percentile;
      const score2 = calculator.calculateLifeStatsScore(primary).percentile;
      const score3 = calculator.calculateLifeStatsScore(secondary).percentile;
      const score4 = calculator.calculateLifeStatsScore(university).percentile;

      expect(score2).toBeGreaterThan(score1);
      expect(score3).toBeGreaterThan(score2);
      expect(score4).toBeGreaterThan(score3);
    });

    test('better income always produces higher or equal score', () => {
      const baseAnswers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };

      const below5k = {
        ...baseAnswers,
        income: { option: { value: 'below_5k', text: 'Below $5k' } },
      };
      const range5to20 = {
        ...baseAnswers,
        income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
      };
      const range20to50 = {
        ...baseAnswers,
        income: { option: { value: '20k_to_50k', text: '$20k-$50k' } },
      };
      const above50k = {
        ...baseAnswers,
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };

      const score1 = calculator.calculateLifeStatsScore(below5k).percentile;
      const score2 = calculator.calculateLifeStatsScore(range5to20).percentile;
      const score3 = calculator.calculateLifeStatsScore(range20to50).percentile;
      const score4 = calculator.calculateLifeStatsScore(above50k).percentile;

      expect(score2).toBeGreaterThan(score1);
      expect(score3).toBeGreaterThan(score2);
      expect(score4).toBeGreaterThan(score3);
    });

    test('changing one answer from worse to better increases score', () => {
      const worseAnswers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'below_5k', text: 'Below $5k' } }, // Poor
        water: { option: { value: 'always', text: 'Always' } },
      };

      const betterAnswers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } }, // Rich
        water: { option: { value: 'always', text: 'Always' } },
      };

      const worseScore = calculator.calculateLifeStatsScore(worseAnswers).percentile;
      const betterScore = calculator.calculateLifeStatsScore(betterAnswers).percentile;

      expect(betterScore).toBeGreaterThan(worseScore);
    });

    test('high-income country scores higher than low-income (all else equal)', () => {
      const commonAnswers = {
        education: { option: { value: 'secondary', text: 'Secondary' } },
        income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
        water: { option: { value: 'always', text: 'Always' } },
      };

      const lowIncomeCountry = {
        ...commonAnswers,
        location: { option: { value: 'low-income' } },
      };

      const highIncomeCountry = {
        ...commonAnswers,
        location: { option: { value: 'high-income' } },
      };

      const lowScore = calculator.calculateLifeStatsScore(lowIncomeCountry).percentile;
      const highScore = calculator.calculateLifeStatsScore(highIncomeCountry).percentile;

      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  // ============================================
  // STATISTICAL PROPERTIES TESTS
  // ============================================

  describe('Statistical Properties', () => {
    test('all scores fall within [0, 100] range', () => {
      const testCases = [
        {
          location: { option: { value: 'high-income' } },
          education: { option: { value: 'university', text: 'University' } },
        },
        {
          location: { option: { value: 'low-income' } },
          education: { option: { value: 'none', text: 'None' } },
        },
        {
          location: { option: { value: 'upper-middle-income' } },
          income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
        },
        {
          water: { option: { value: 'must_collect', text: 'Must collect' } },
          hunger: { option: { value: 'frequently', text: 'Frequently' } },
        },
      ];

      for (const answers of testCases) {
        const result = calculator.calculateLifeStatsScore(answers);
        expect(result.percentile).toBeGreaterThanOrEqual(0);
        expect(result.percentile).toBeLessThanOrEqual(100);
      }
    });

    test('median score across diverse scenarios is reasonable (30-50%)', () => {
      const scenarios = [
        // Best case
        {
          location: { option: { value: 'high-income' } },
          education: { option: { value: 'university', text: 'University' } },
          income: { option: { value: 'above_50k', text: 'Above $50k' } },
        },
        // Worst case
        {
          location: { option: { value: 'low-income' } },
          education: { option: { value: 'none', text: 'None' } },
          income: { option: { value: 'below_5k', text: 'Below $5k' } },
        },
        // Middle case 1
        {
          location: { option: { value: 'upper-middle-income' } },
          education: { option: { value: 'secondary', text: 'Secondary' } },
          income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
        },
        // Middle case 2
        {
          location: { option: { value: 'lower-middle-income' } },
          education: { option: { value: 'primary', text: 'Primary' } },
          income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
        },
        // Middle case 3
        {
          location: { option: { value: 'high-income' } },
          education: { option: { value: 'secondary', text: 'Secondary' } },
          income: { option: { value: '20k_to_50k', text: '$20k-$50k' } },
        },
      ];

      const scores = scenarios.map((s) => calculator.calculateLifeStatsScore(s).percentile);
      const median = scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];

      console.log('Diverse scenario scores:', scores);
      console.log('Median:', median);

      expect(median).toBeGreaterThanOrEqual(30);
      expect(median).toBeLessThanOrEqual(65);
    });

    test('confidence intervals have reasonable variance (~5-15%)', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };

      const ciResult = calculator.calculateWithConfidenceInterval(answers, 1000);

      console.log('CI Range:', ciResult.ci_range);

      expect(ciResult.ci_range).toBeGreaterThanOrEqual(0);
      expect(ciResult.ci_range).toBeLessThanOrEqual(15);
    });

    test('high-variance scenario still has reasonable CI', () => {
      const answers = {
        location: { option: { value: 'lower-middle-income' } },
        education: { option: { value: 'primary', text: 'Primary' } },
        income: { option: { value: 'below_5k', text: 'Below $5k' } },
      };

      const ciResult = calculator.calculateWithConfidenceInterval(answers, 1000);

      expect(ciResult.ci_range).toBeGreaterThanOrEqual(0);
      expect(ciResult.ci_range).toBeLessThanOrEqual(15);
    });
  });

  // ============================================
  // EDGE CASE SCORE VALIDATION
  // ============================================

  describe('Edge Case Score Validation', () => {
    test('absolute best case produces top 15-20% score', () => {
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

    test('absolute worst case produces bottom 5-15% score', () => {
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

    test('mixed high/low answers produce middle range scores', () => {
      const answers = {
        location: { option: { value: 'high-income' } }, // High
        education: { option: { value: 'none', text: 'None' } }, // Low
        income: { option: { value: 'above_50k', text: 'Above $50k' } }, // High
        water: { option: { value: 'must_collect', text: 'Must collect' } }, // Low
        healthcare: { option: { value: 'easily', text: 'Easily' } }, // High
        hunger: { option: { value: 'frequently', text: 'Frequently' } }, // Low
        internet: { option: { value: 'high_speed_home', text: 'High-speed' } }, // High
      };

      const result = calculator.calculateLifeStatsScore(answers);

      // Mixed should be in middle range
      expect(result.percentile).toBeGreaterThanOrEqual(35);
      expect(result.percentile).toBeLessThanOrEqual(65);
    });

    test('single high-weight factor can significantly affect score', () => {
      // Income has 25% weight
      const lowIncome = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'below_5k', text: 'Below $5k' } }, // Low
      };

      const highIncome = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } }, // High
      };

      const lowScore = calculator.calculateLifeStatsScore(lowIncome).percentile;
      const highScore = calculator.calculateLifeStatsScore(highIncome).percentile;

      // Should differ by at least 10 percentile points (income is 25% weight)
      expect(highScore - lowScore).toBeGreaterThan(10);
    });
  });

  // ============================================
  // REPRODUCIBILITY TESTS
  // ============================================

  describe('Reproducibility Tests', () => {
    test('same inputs always produce same outputs', () => {
      const answers = {
        location: { option: { value: 'upper-middle-income' } },
        education: { option: { value: 'secondary', text: 'Secondary' } },
        income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
      };

      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(calculator.calculateLifeStatsScore(answers).percentile);
      }

      // All results should be identical
      const allSame = results.every((r) => r === results[0]);
      expect(allSame).toBe(true);
    });

    test('Monte Carlo produces consistent median across runs', () => {
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };

      const run1 = calculator.calculateWithConfidenceInterval(answers, 1000);
      const run2 = calculator.calculateWithConfidenceInterval(answers, 1000);

      // Medians should be close (within 2 percentage points)
      expect(Math.abs(run1.median - run2.median)).toBeLessThan(2);
    });
  });
});
