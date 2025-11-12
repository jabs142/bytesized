/**
 * Test script for Global Privilege Calculator
 * Tests calculation logic across different scenarios
 */

// Load the calculator module
const fs = require('fs');
const path = require('path');

// Import LifeStatsCalculator
const LifeStatsCalculator = require('./frontend/js/calculator.js');

// Load conditional probabilities data
const cptData = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend/data/conditional-probabilities.json'), 'utf-8'));

// Create calculator instance
const calculator = new LifeStatsCalculator();
calculator.data = cptData;
calculator.initialized = true;

// Test scenarios
const testScenarios = [
    {
        name: 'Singapore - All best answers',
        answers: {
            location: { option: { value: 'high-income', text: 'Singapore' } },
            education: { option: { value: 'university', text: 'University degree or higher' } },
            income: { option: { value: 'above_50k', text: 'Above $50,000 USD' } },
            water: { option: { value: 'always', text: 'Yes, always' } },
            healthcare: { option: { value: 'easily', text: 'Yes, easily' } },
            hunger: { option: { value: 'never', text: 'Never' } },
            internet: { option: { value: 'high_speed_home', text: 'Yes, high-speed at home' } },
            safety: { option: { percentile: 40, text: 'Yes, very safe' } },
            discrimination: { option: { percentile: 70, text: 'No' } },
            savings: { option: { value: 'more_than_3mo', text: 'Yes, more than 3 months' } }
        },
        expectedRange: [78, 82]  // ~80% with weighted average
    },
    {
        name: 'China - Second best answers',
        answers: {
            location: { option: { value: 'upper-middle-income', text: 'China' } },
            education: { option: { value: 'secondary', text: 'Secondary school (high school)' } },
            income: { option: { value: '20k_to_50k', text: '$20,000 - $50,000 USD' } },
            water: { option: { value: 'always', text: 'Yes, always' } },
            healthcare: { option: { value: 'financial_strain', text: 'Yes, but it\'s a financial strain' } },
            hunger: { option: { value: 'never', text: 'Never' } },
            internet: { option: { value: 'high_speed_home', text: 'Yes, high-speed at home' } },
            safety: { option: { percentile: 35, text: 'Somewhat safe' } },
            discrimination: { option: { percentile: 70, text: 'No' } },
            savings: { option: { value: 'about_3mo', text: 'Yes, about 3 months' } }
        },
        expectedRange: [57, 61]  // ~59% with weighted average
    },
    {
        name: 'United States - Best case scenario',
        answers: {
            location: { option: { value: 'high-income', text: 'United States' } },
            education: { option: { value: 'university', text: 'University degree or higher' } },
            income: { option: { value: 'above_50k', text: 'Above $50,000 USD' } },
            water: { option: { value: 'always', text: 'Yes, always' } },
            healthcare: { option: { value: 'easily', text: 'Yes, easily' } },
            hunger: { option: { value: 'never', text: 'Never' } },
            internet: { option: { value: 'high_speed_home', text: 'Yes, high-speed at home' } },
            safety: { option: { percentile: 40, text: 'Yes, very safe' } },
            discrimination: { option: { percentile: 70, text: 'No' } },
            savings: { option: { value: 'more_than_3mo', text: 'Yes, more than 3 months' } }
        },
        expectedRange: [78, 82]  // ~80% (same as Singapore best)
    },
    {
        name: 'India - Mixed answers',
        answers: {
            location: { option: { value: 'lower-middle-income', text: 'India' } },
            education: { option: { value: 'secondary', text: 'Secondary school (high school)' } },
            income: { option: { value: '5k_to_20k', text: '$5,000 - $20,000 USD' } },
            water: { option: { value: 'sometimes_unreliable', text: 'Yes, but sometimes unreliable' } },
            healthcare: { option: { value: 'financial_strain', text: 'Yes, but it\'s a financial strain' } },
            hunger: { option: { value: 'occasionally', text: 'Occasionally' } },
            internet: { option: { value: 'limited_mobile', text: 'Yes, but limited/mobile only' } },
            safety: { option: { percentile: 25, text: 'No, unsafe' } },
            discrimination: { option: { percentile: 20, text: 'Yes, occasionally' } },
            savings: { option: { value: 'less_than_3mo', text: 'Less than 3 months' } }
        },
        expectedRange: [12, 30]
    },
    {
        name: 'Nigeria - Worst answers',
        answers: {
            location: { option: { value: 'lower-middle-income', text: 'Nigeria' } },
            education: { option: { value: 'primary', text: 'Primary school' } },
            income: { option: { value: 'below_5k', text: 'Below $5,000 USD' } },
            water: { option: { value: 'must_collect', text: 'No, must collect from elsewhere' } },
            healthcare: { option: { value: 'cannot_afford', text: 'No, cannot afford' } },
            hunger: { option: { value: 'frequently', text: 'Frequently' } },
            internet: { option: { value: 'none', text: 'No' } },
            safety: { option: { percentile: 25, text: 'No, unsafe' } },
            discrimination: { option: { percentile: 10, text: 'Yes, frequently' } },
            savings: { option: { value: 'none', text: 'No savings' } }
        },
        expectedRange: [5, 15]
    }
];

// Run tests
console.log('='.repeat(80));
console.log('GLOBAL PRIVILEGE CALCULATOR - COMPREHENSIVE TEST SUITE');
console.log('='.repeat(80));
console.log('');

const results = [];

testScenarios.forEach((scenario, idx) => {
    console.log(`\nTest ${idx + 1}: ${scenario.name}`);
    console.log('-'.repeat(80));

    try {
        // Calculate base result
        const result = calculator.calculateLifeStatsScore(scenario.answers);

        // Calculate confidence interval
        const ci = calculator.calculateWithConfidenceInterval(scenario.answers, 100); // Use 100 for faster testing

        console.log(`  Percentile Score: ${result.percentile}%`);
        console.log(`  Confidence Interval: ${Math.round(ci.ci_lower)}% - ${Math.round(ci.ci_upper)}%`);
        console.log(`  CI Range: ±${(ci.ci_range / 2).toFixed(1)} points`);
        console.log(`  Factors Included: ${result.metadata.factorsIncluded}`);

        // Check if result is in expected range
        const inRange = result.percentile >= scenario.expectedRange[0] &&
                       result.percentile <= scenario.expectedRange[1];
        const status = inRange ? '✓ PASS' : '✗ FAIL';
        console.log(`  Expected Range: ${scenario.expectedRange[0]}-${scenario.expectedRange[1]}%`);
        console.log(`  Status: ${status}`);

        // Check CI variance
        const hasVariance = ci.ci_range > 0.1;
        const ciStatus = hasVariance ? '✓ Has variance' : '✗ No variance (bug)';
        console.log(`  CI Variance: ${ciStatus}`);

        results.push({
            name: scenario.name,
            score: result.percentile,
            ci_lower: ci.ci_lower,
            ci_upper: ci.ci_upper,
            ci_range: ci.ci_range,
            inRange: inRange,
            hasVariance: hasVariance
        });

    } catch (error) {
        console.log(`  ✗ ERROR: ${error.message}`);
        results.push({
            name: scenario.name,
            error: error.message
        });
    }
});

// Summary
console.log('');
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

const passed = results.filter(r => !r.error && r.inRange).length;
const ciVariance = results.filter(r => !r.error && r.hasVariance).length;
const total = results.length;

console.log(`\nTests Passed: ${passed}/${total}`);
console.log(`Tests with CI Variance: ${ciVariance}/${total}`);

// Specific checks
console.log('\n--- Critical Bug Checks ---');
const singaporeResult = results.find(r => r.name.includes('Singapore'));
const chinaResult = results.find(r => r.name.includes('China'));

if (singaporeResult && chinaResult) {
    if (singaporeResult.score > chinaResult.score) {
        console.log('✓ Singapore > China (bug fixed!)');
    } else {
        console.log(`✗ Singapore (${singaporeResult.score}%) ≤ China (${chinaResult.score}%) - BUG NOT FIXED`);
    }
}

console.log('');
console.log('='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));
