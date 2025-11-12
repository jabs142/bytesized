/**
 * Integration Tests for Life Statistics Quiz
 * Tests the complete quiz flow, answer transformation, and end-to-end scenarios
 */

const LifeStatsCalculator = require('../frontend/js/calculator.js');
const fs = require('fs');
const path = require('path');

describe('Integration Tests', () => {
    let calculator;
    let countriesData;

    beforeAll(() => {
        // Load countries data for integration tests
        const countriesPath = path.join(__dirname, '../frontend/data/countries.json');
        countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
    });

    beforeEach(() => {
        calculator = new LifeStatsCalculator();
        calculator.initialized = true;
        calculator.data = { _metadata: { version: '1.0.0' } };
    });

    // ============================================
    // ANSWER TRANSFORMATION TESTS
    // ============================================

    describe('Answer Transformation', () => {
        test('country selection maps to correct income group', () => {
            // Simulate selecting Singapore (high-income)
            const selectedCountry = 'Singapore';
            const countryInfo = countriesData.countries[selectedCountry];

            const answers = {
                location: {
                    country: selectedCountry,
                    incomeGroup: countryInfo.income_group,
                    region: countryInfo.region,
                    option: {
                        text: selectedCountry,
                        value: countryInfo.income_group
                    }
                }
            };

            const result = calculator.calculateLifeStatsScore(answers);

            expect(answers.location.option.value).toBe('high-income');
            expect(result.percentiles.location).toBe(84);
            expect(result.metadata.location).toBe('high-income');
        });

        test('multiple choice answer extraction works correctly', () => {
            const answers = {
                location: { option: { value: 'high-income' } },
                education: {
                    option: {
                        text: 'University degree or higher',
                        percentile: 10,
                        value: 'university',
                        source: 'UNESCO'
                    },
                    index: 0
                }
            };

            const result = calculator.calculateLifeStatsScore(answers);

            expect(result.percentiles.education).toBe(90);
            expect(result.factorDetails.find(f => f.factor === 'education').value).toBe('University degree or higher');
        });

        test('all quiz question types can be processed', () => {
            const answers = {
                location: { option: { value: 'upper-middle-income' } },
                education: { option: { value: 'secondary', text: 'Secondary school' } },
                income: { option: { value: '20k_to_50k', text: '$20k-$50k' } },
                water: { option: { value: 'always', text: 'Yes, always' } },
                healthcare: { option: { value: 'financial_strain', text: 'Yes, but financial strain' } },
                hunger: { option: { value: 'occasionally', text: 'Occasionally' } },
                internet: { option: { value: 'limited_mobile', text: 'Limited/mobile only' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);

            expect(result.metadata.factorsIncluded).toBe(7);
            expect(Object.keys(result.percentiles)).toHaveLength(7);
        });
    });

    // ============================================
    // END-TO-END QUIZ FLOW TESTS
    // ============================================

    describe('End-to-End Quiz Flow', () => {
        test('complete quiz produces valid result structure', () => {
            const answers = {
                location: { option: { value: 'high-income' } },
                education: { option: { value: 'university', text: 'University' } },
                income: { option: { value: 'above_50k', text: 'Above $50k' } },
                water: { option: { value: 'always', text: 'Always' } },
                healthcare: { option: { value: 'easily', text: 'Easily' } },
                hunger: { option: { value: 'never', text: 'Never' } },
                internet: { option: { value: 'high_speed_home', text: 'High-speed' } }
            };

            // Base calculation
            const baseResult = calculator.calculateLifeStatsScore(answers);
            expect(baseResult).toBeDefined();
            expect(baseResult.percentile).toBeGreaterThan(0);
            expect(baseResult.percentile).toBeLessThanOrEqual(100);

            // Confidence interval
            const ciResult = calculator.calculateWithConfidenceInterval(answers, 100);
            expect(ciResult).toBeDefined();
            expect(ciResult.median).toBeDefined();
            expect(ciResult.ci_lower).toBeDefined();
            expect(ciResult.ci_upper).toBeDefined();

            // Factor contributions
            const contributions = calculator.calculateFactorContributions(answers);
            expect(contributions).toBeDefined();
            expect(Array.isArray(contributions)).toBe(true);
            expect(contributions.length).toBeGreaterThan(0);
        });

        test('partial quiz completion works correctly', () => {
            const answers = {
                location: { option: { value: 'high-income' } },
                education: { option: { value: 'university', text: 'University' } }
                // User stopped here - only 2 questions answered
            };

            const result = calculator.calculateLifeStatsScore(answers);

            expect(result).toBeDefined();
            expect(result.metadata.factorsIncluded).toBe(2);
            expect(result.percentile).toBeGreaterThan(0);
        });

        test('quiz results are consistent across multiple calculations', () => {
            const answers = {
                location: { option: { value: 'high-income' } },
                education: { option: { value: 'university', text: 'University' } },
                income: { option: { value: 'above_50k', text: 'Above $50k' } }
            };

            const result1 = calculator.calculateLifeStatsScore(answers);
            const result2 = calculator.calculateLifeStatsScore(answers);
            const result3 = calculator.calculateLifeStatsScore(answers);

            expect(result1.percentile).toBe(result2.percentile);
            expect(result2.percentile).toBe(result3.percentile);
        });
    });

    // ============================================
    // COUNTRIES DATA VALIDATION
    // ============================================

    describe('Countries Data Validation', () => {
        test('all countries have valid income groups', () => {
            const validIncomeGroups = [
                'high-income',
                'upper-middle-income',
                'lower-middle-income',
                'low-income'
            ];

            for (const [countryName, countryData] of Object.entries(countriesData.countries)) {
                expect(validIncomeGroups).toContain(countryData.income_group);
            }
        });

        test('all countries have region defined', () => {
            for (const [countryName, countryData] of Object.entries(countriesData.countries)) {
                expect(countryData.region).toBeDefined();
                expect(countryData.region).not.toBe('');
            }
        });

        test('no duplicate country names', () => {
            const countryNames = Object.keys(countriesData.countries);
            const uniqueNames = new Set(countryNames);
            expect(countryNames.length).toBe(uniqueNames.size);
        });

        test('popular countries list contains valid countries', () => {
            expect(countriesData.popular_countries).toBeDefined();
            expect(Array.isArray(countriesData.popular_countries)).toBe(true);

            for (const countryName of countriesData.popular_countries) {
                expect(countriesData.countries[countryName]).toBeDefined();
            }
        });

        test('sample countries map to expected income groups', () => {
            // Test a few known countries
            expect(countriesData.countries['United States'].income_group).toBe('high-income');
            expect(countriesData.countries['Singapore'].income_group).toBe('high-income');
            expect(countriesData.countries['China'].income_group).toBe('upper-middle-income');
            expect(countriesData.countries['India'].income_group).toBe('lower-middle-income');
            expect(countriesData.countries['Nigeria'].income_group).toBe('lower-middle-income');
        });
    });

    // ============================================
    // ERROR HANDLING TESTS
    // ============================================

    describe('Error Handling', () => {
        test('uninitialized calculator throws helpful error', () => {
            const uninitCalc = new LifeStatsCalculator();

            expect(() => {
                uninitCalc.calculateLifeStatsScore({});
            }).toThrow(/not initialized/i);
        });

        test('malformed answer structure is handled gracefully', () => {
            const answers = {
                location: { option: { value: 'high-income' } },
                education: { text: 'University' }, // Missing 'option' wrapper
                income: 'above_50k' // Wrong format entirely
            };

            // Should not crash
            const result = calculator.calculateLifeStatsScore(answers);
            expect(result).toBeDefined();

            // Only location should be counted
            expect(result.metadata.factorsIncluded).toBe(1);
        });

        test('invalid country name handled with default', () => {
            const answers = {
                location: { option: { value: 'invalid-country-xyz' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);

            // Should default to lower-middle-income (9th percentile)
            expect(result.percentiles.location).toBe(9);
        });

        test('missing required fields use defaults', () => {
            const answers = {
                education: { option: { value: 'university', text: 'University' } }
                // No location specified
            };

            const result = calculator.calculateLifeStatsScore(answers);

            // Should use default location
            expect(result.percentiles.location).toBe(9);
            expect(result.percentiles.education).toBe(90);
        });
    });

    // ============================================
    // REAL-WORLD SCENARIOS
    // ============================================

    describe('Real-World Scenarios', () => {
        test('affluent Singapore resident', () => {
            const answers = {
                location: {
                    country: 'Singapore',
                    option: { value: 'high-income' }
                },
                education: { option: { value: 'university', text: 'University' } },
                income: { option: { value: 'above_50k', text: 'Above $50k' } },
                water: { option: { value: 'always', text: 'Always' } },
                healthcare: { option: { value: 'easily', text: 'Easily' } },
                hunger: { option: { value: 'never', text: 'Never' } },
                internet: { option: { value: 'high_speed_home', text: 'High-speed' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);
            expect(result.percentile).toBeGreaterThanOrEqual(78);
            expect(result.percentile).toBeLessThanOrEqual(85);
        });

        test('middle-class China resident', () => {
            const answers = {
                location: {
                    country: 'China',
                    option: { value: 'upper-middle-income' }
                },
                education: { option: { value: 'secondary', text: 'Secondary' } },
                income: { option: { value: '5k_to_20k', text: '$5k-$20k' } },
                water: { option: { value: 'always', text: 'Always' } },
                healthcare: { option: { value: 'financial_strain', text: 'Financial strain' } },
                hunger: { option: { value: 'never', text: 'Never' } },
                internet: { option: { value: 'high_speed_home', text: 'High-speed' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);
            expect(result.percentile).toBeGreaterThanOrEqual(50);
            expect(result.percentile).toBeLessThanOrEqual(65);
        });

        test('rural India resident with limited resources', () => {
            const answers = {
                location: {
                    country: 'India',
                    option: { value: 'lower-middle-income' }
                },
                education: { option: { value: 'primary', text: 'Primary' } },
                income: { option: { value: 'below_5k', text: 'Below $5k' } },
                water: { option: { value: 'sometimes_unreliable', text: 'Sometimes unreliable' } },
                healthcare: { option: { value: 'cannot_afford', text: 'Cannot afford' } },
                hunger: { option: { value: 'occasionally', text: 'Occasionally' } },
                internet: { option: { value: 'none', text: 'No access' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);
            expect(result.percentile).toBeGreaterThanOrEqual(10);
            expect(result.percentile).toBeLessThanOrEqual(25);
        });

        test('disadvantaged Nigeria resident', () => {
            const answers = {
                location: {
                    country: 'Nigeria',
                    option: { value: 'lower-middle-income' }
                },
                education: { option: { value: 'none', text: 'No formal education' } },
                income: { option: { value: 'below_5k', text: 'Below $5k' } },
                water: { option: { value: 'must_collect', text: 'Must collect' } },
                healthcare: { option: { value: 'cannot_afford', text: 'Cannot afford' } },
                hunger: { option: { value: 'frequently', text: 'Frequently' } },
                internet: { option: { value: 'none', text: 'No access' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);
            expect(result.percentile).toBeGreaterThanOrEqual(5);
            expect(result.percentile).toBeLessThanOrEqual(15);
        });

        test('typical US middle-class resident', () => {
            const answers = {
                location: {
                    country: 'United States',
                    option: { value: 'high-income' }
                },
                education: { option: { value: 'secondary', text: 'Secondary' } },
                income: { option: { value: '20k_to_50k', text: '$20k-$50k' } },
                water: { option: { value: 'always', text: 'Always' } },
                healthcare: { option: { value: 'financial_strain', text: 'Financial strain' } },
                hunger: { option: { value: 'never', text: 'Never' } },
                internet: { option: { value: 'high_speed_home', text: 'High-speed' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);
            expect(result.percentile).toBeGreaterThanOrEqual(60);
            expect(result.percentile).toBeLessThanOrEqual(75);
        });
    });

    // ============================================
    // FACTOR BREAKDOWN GENERATION
    // ============================================

    describe('Factor Breakdown Generation', () => {
        test('breakdown includes all answered questions', () => {
            const answers = {
                location: { option: { value: 'high-income' } },
                education: { option: { value: 'university', text: 'University degree' } },
                income: { option: { value: 'above_50k', text: 'Above $50,000 USD' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);

            expect(result.factorDetails).toHaveLength(3);

            const factors = result.factorDetails.map(f => f.factor);
            expect(factors).toContain('location');
            expect(factors).toContain('education');
            expect(factors).toContain('income');
        });

        test('breakdown includes percentiles for display', () => {
            const answers = {
                location: { option: { value: 'high-income' } },
                education: { option: { value: 'university', text: 'University' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);

            for (const detail of result.factorDetails) {
                expect(detail.percentile).toBeGreaterThanOrEqual(0);
                expect(detail.percentile).toBeLessThanOrEqual(100);
            }
        });

        test('breakdown includes user-friendly text values', () => {
            const answers = {
                location: { option: { value: 'high-income' } },
                education: { option: { value: 'university', text: 'University degree or higher' } }
            };

            const result = calculator.calculateLifeStatsScore(answers);

            const eduDetail = result.factorDetails.find(f => f.factor === 'education');
            expect(eduDetail.value).toBe('University degree or higher');
        });
    });
});
