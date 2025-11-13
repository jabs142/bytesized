/**
 * Data Validation Tests
 * Validates the integrity and correctness of data files used by the calculator
 */

const fs = require('fs');
const path = require('path');
const LifeStatsCalculator = require('../frontend/js/calculator.js');

describe('Data Validation Tests', () => {
  let countriesData;
  let conditionalProbabilities;
  let calculator;

  beforeAll(() => {
    // Load data files
    const countriesPath = path.join(__dirname, '../frontend/data/countries.json');
    const cpPath = path.join(__dirname, '../frontend/data/conditional-probabilities.json');

    countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
    conditionalProbabilities = JSON.parse(fs.readFileSync(cpPath, 'utf8'));

    calculator = new LifeStatsCalculator();
    calculator.initialized = true;
    calculator.data = conditionalProbabilities;
  });

  // ============================================
  // COUNTRIES.JSON VALIDATION
  // ============================================

  describe('Countries Data Validation', () => {
    test('countries.json has required structure', () => {
      expect(countriesData).toHaveProperty('_metadata');
      expect(countriesData).toHaveProperty('countries');
      expect(countriesData).toHaveProperty('popular_countries');
    });

    test('all countries have required fields', () => {
      const requiredFields = ['income_group', 'region'];

      for (const [countryName, countryData] of Object.entries(countriesData.countries)) {
        for (const field of requiredFields) {
          expect(countryData).toHaveProperty(field);
          expect(countryData[field]).not.toBe('');
        }
      }
    });

    test('all income groups are valid', () => {
      const validGroups = [
        'high-income',
        'upper-middle-income',
        'lower-middle-income',
        'low-income',
      ];

      for (const [countryName, countryData] of Object.entries(countriesData.countries)) {
        expect(validGroups).toContain(countryData.income_group);
      }
    });

    test('popular countries array is valid', () => {
      expect(Array.isArray(countriesData.popular_countries)).toBe(true);
      expect(countriesData.popular_countries.length).toBeGreaterThan(0);

      // All popular countries should exist in main countries object
      for (const countryName of countriesData.popular_countries) {
        expect(countriesData.countries).toHaveProperty(countryName);
      }
    });

    test('income group distribution is reasonable', () => {
      const distribution = {
        'high-income': 0,
        'upper-middle-income': 0,
        'lower-middle-income': 0,
        'low-income': 0,
      };

      for (const countryData of Object.values(countriesData.countries)) {
        distribution[countryData.income_group]++;
      }

      // Each category should have at least some countries
      expect(distribution['high-income']).toBeGreaterThan(0);
      expect(distribution['upper-middle-income']).toBeGreaterThan(0);
      expect(distribution['lower-middle-income']).toBeGreaterThan(0);
      expect(distribution['low-income']).toBeGreaterThan(0);

      console.log('Income group distribution:', distribution);
    });

    test('no duplicate country names exist', () => {
      const countryNames = Object.keys(countriesData.countries);
      const uniqueNames = new Set(countryNames);

      expect(countryNames.length).toBe(uniqueNames.size);
    });

    test('metadata includes source information', () => {
      expect(countriesData._metadata).toHaveProperty('source');
      expect(countriesData._metadata.source).toBeDefined();
      expect(countriesData._metadata.source).not.toBe('');
    });
  });

  // ============================================
  // CONDITIONAL PROBABILITIES VALIDATION
  // ============================================

  describe('Conditional Probabilities Data Validation', () => {
    test('conditional-probabilities.json has required structure', () => {
      expect(conditionalProbabilities).toHaveProperty('_metadata');
      expect(conditionalProbabilities._metadata).toHaveProperty('version');
      expect(conditionalProbabilities._metadata).toHaveProperty('description');
    });

    test('location percentile base exists and has valid values', () => {
      expect(conditionalProbabilities).toHaveProperty('location_percentile_base');

      const base = conditionalProbabilities.location_percentile_base;
      expect(base['high-income']).toBe(84);
      expect(base['upper-middle-income']).toBe(49);
      expect(base['lower-middle-income']).toBe(9);
      expect(base['low-income']).toBe(1);
    });

    test('all percentile values are in valid range [0-100]', () => {
      function checkPercentiles(obj, path = '') {
        for (const [key, value] of Object.entries(obj)) {
          if (key.startsWith('_')) {
            continue;
          } // Skip metadata

          if (
            typeof value === 'number' &&
            (key.includes('percentile') || path.includes('percentile'))
          ) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(100);
          } else if (typeof value === 'object' && value !== null) {
            checkPercentiles(value, `${path}.${key}`);
          }
        }
      }

      checkPercentiles(conditionalProbabilities);
    });

    test('probability distributions sum to approximately 1.0', () => {
      // Check education_given_location distributions
      if (conditionalProbabilities.education_given_location) {
        for (const [incomeGroup, eduDist] of Object.entries(
          conditionalProbabilities.education_given_location
        )) {
          if (incomeGroup.startsWith('_')) {
            continue;
          }

          const sum = Object.values(eduDist).reduce((a, b) => a + b, 0);
          expect(sum).toBeCloseTo(1.0, 2);
        }
      }

      // Check water_given_location distributions
      if (conditionalProbabilities.water_given_location) {
        for (const [incomeGroup, waterDist] of Object.entries(
          conditionalProbabilities.water_given_location
        )) {
          if (incomeGroup.startsWith('_')) {
            continue;
          }

          const sum = Object.values(waterDist).reduce((a, b) => a + b, 0);
          expect(sum).toBeCloseTo(1.0, 2);
        }
      }
    });

    test('required data sections exist', () => {
      const requiredSections = [
        'location_percentile_base',
        'education_given_location',
        'water_given_location',
        'healthcare_given_location',
        'internet_given_location',
        'hunger_given_location',
      ];

      for (const section of requiredSections) {
        expect(conditionalProbabilities).toHaveProperty(section);
      }
    });

    test('metadata includes data sources', () => {
      expect(conditionalProbabilities._metadata).toHaveProperty('last_updated');
      expect(conditionalProbabilities._metadata).toHaveProperty('methodology');

      // Check that at least some data sections have source metadata
      if (conditionalProbabilities.education_given_location) {
        expect(conditionalProbabilities.education_given_location).toHaveProperty('_source');
      }
    });
  });

  // ============================================
  // CALCULATOR CONSTANTS VALIDATION
  // ============================================

  describe('Calculator Constants Validation', () => {
    test('all percentile mappings are defined', () => {
      // Test that calculator has mappings for all expected values
      const testAnswers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
        water: { option: { value: 'always', text: 'Always' } },
        healthcare: { option: { value: 'easily', text: 'Easily' } },
        hunger: { option: { value: 'never', text: 'Never' } },
        internet: { option: { value: 'high_speed_home', text: 'High-speed' } },
      };

      // Should not throw errors
      const result = calculator.calculateLifeStatsScore(testAnswers);
      expect(result).toBeDefined();
      expect(result.percentile).toBeGreaterThan(0);
    });

    test('weights are positive numbers', () => {
      for (const [factor, weight] of Object.entries(calculator.WEIGHTS)) {
        expect(weight).toBeGreaterThan(0);
        expect(weight).toBeLessThanOrEqual(1);
      }
    });

    test('weights sum to exactly 1.0', () => {
      const sum = Object.values(calculator.WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });

    test('all expected factors have weights', () => {
      const expectedFactors = [
        'income',
        'education',
        'healthcare',
        'water',
        'location',
        'hunger',
        'internet',
      ];

      for (const factor of expectedFactors) {
        expect(calculator.WEIGHTS).toHaveProperty(factor);
      }
    });

    test('factor labels exist for all weighted factors', () => {
      for (const factor of Object.keys(calculator.WEIGHTS)) {
        const label = calculator.getFactorLabel(factor);
        expect(label).toBeDefined();
        expect(label).not.toBe('');
      }
    });
  });

  // ============================================
  // CROSS-REFERENCE VALIDATION
  // ============================================

  describe('Cross-Reference Validation', () => {
    test('all quiz answer values map to calculator percentiles', () => {
      // All possible answer values from the quiz
      const quizAnswerValues = {
        location: ['high-income', 'upper-middle-income', 'lower-middle-income', 'low-income'],
        education: ['university', 'secondary', 'primary', 'none'],
        income: ['above_50k', '20k_to_50k', '5k_to_20k', 'below_5k'],
        water: ['always', 'sometimes_unreliable', 'must_collect'],
        healthcare: ['easily', 'financial_strain', 'cannot_afford'],
        hunger: ['never', 'occasionally', 'frequently'],
        internet: ['high_speed_home', 'limited_mobile', 'none'],
      };

      // Test each value produces a valid percentile
      for (const [factor, values] of Object.entries(quizAnswerValues)) {
        for (const value of values) {
          const answers = {
            location: { option: { value: 'high-income' } },
            [factor]: { option: { value: value, text: value } },
          };

          const result = calculator.calculateLifeStatsScore(answers);
          expect(result.percentiles[factor]).toBeDefined();
          expect(result.percentiles[factor]).toBeGreaterThanOrEqual(0);
          expect(result.percentiles[factor]).toBeLessThanOrEqual(100);
        }
      }
    });

    test('countries income groups match calculator location values', () => {
      const calcLocationValues = [
        'high-income',
        'upper-middle-income',
        'lower-middle-income',
        'low-income',
      ];
      const countryIncomeGroups = new Set();

      for (const countryData of Object.values(countriesData.countries)) {
        countryIncomeGroups.add(countryData.income_group);
      }

      for (const group of countryIncomeGroups) {
        expect(calcLocationValues).toContain(group);
      }
    });

    test('all country income groups produce valid percentiles', () => {
      const incomeGroups = new Set();

      for (const countryData of Object.values(countriesData.countries)) {
        incomeGroups.add(countryData.income_group);
      }

      for (const incomeGroup of incomeGroups) {
        const answers = {
          location: { option: { value: incomeGroup } },
        };

        const result = calculator.calculateLifeStatsScore(answers);
        expect(result.percentiles.location).toBeDefined();
        expect(result.percentiles.location).toBeGreaterThanOrEqual(0);
        expect(result.percentiles.location).toBeLessThanOrEqual(100);
      }
    });
  });

  // ============================================
  // DATA CONSISTENCY CHECKS
  // ============================================

  describe('Data Consistency Checks', () => {
    test('percentile rankings are logically ordered', () => {
      // Higher advantage should mean higher percentile
      const answers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
      };
      const highResult = calculator.calculateLifeStatsScore(answers);

      const answers2 = {
        location: { option: { value: 'low-income' } },
        education: { option: { value: 'none', text: 'None' } },
      };
      const lowResult = calculator.calculateLifeStatsScore(answers2);

      expect(highResult.percentile).toBeGreaterThan(lowResult.percentile);
    });

    test('similar circumstances produce similar scores', () => {
      const answers1 = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };

      const answers2 = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: '20k_to_50k', text: '$20k-$50k' } }, // Slightly different income
      };

      const result1 = calculator.calculateLifeStatsScore(answers1);
      const result2 = calculator.calculateLifeStatsScore(answers2);

      // Scores should be within 15 percentile points
      expect(Math.abs(result1.percentile - result2.percentile)).toBeLessThan(15);
    });

    test('weight changes appropriately affect final score', () => {
      // Test high-weight factor (income: 25%)
      const baseAnswers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'above_50k', text: 'Above $50k' } },
      };
      const baseResult = calculator.calculateLifeStatsScore(baseAnswers);

      const changedAnswers = {
        location: { option: { value: 'high-income' } },
        education: { option: { value: 'university', text: 'University' } },
        income: { option: { value: 'below_5k', text: 'Below $5k' } }, // Much lower income
      };
      const changedResult = calculator.calculateLifeStatsScore(changedAnswers);

      // Income change should have significant impact (25% weight)
      expect(baseResult.percentile - changedResult.percentile).toBeGreaterThan(10);
    });

    test('metadata includes appropriate context', () => {
      expect(conditionalProbabilities._metadata.methodology).toBeDefined();
      expect(conditionalProbabilities._metadata.methodology).toContain('statistics');
    });
  });
});
