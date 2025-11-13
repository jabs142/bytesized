# 🌍 Global Life Statistics Quiz

A comprehensive web-based quiz that scientifically calculates your global
percentile based on real global statistics using a weighted average methodology.

## Overview

This interactive quiz helps users understand their position in the global
distribution across multiple dimensions of life. It uses real-world data from
sources like the World Bank, WHO, UNESCO, and UN Statistics to provide
context-based insights using scientifically-weighted factors.

## Features

- **11 Research-Backed Questions**: Each question uses real global statistics
  from credible sources
- **Weighted Average Methodology**: Calculates your global percentile using
  scientifically-validated weights from UN HDI, Oxford MPI, and World Happiness
  Report
- **Interactive Quiz Interface**: Built with ByteSized's Game Boy retro design
  system
- **Detailed Breakdown**: See how each factor contributes to your overall score
  with visual weight bars
- **Transparent Methodology**: Expandable dropdown explaining scientific weight
  justification with complete references
- **Monte Carlo Confidence Intervals**: Statistical uncertainty analysis with
  1,000 simulations
- **Mobile-Responsive**: Works on all devices with touch support

## How It Works

### Statistical Methodology: Weighted Average of Global Percentiles

This calculator uses a **transparent, scientifically-weighted approach** based
on established development indices:

#### Core Concept

Each answer is mapped to a **global percentile** - what percentage of the world
population has this circumstance or worse. These percentiles are then combined
using scientifically-validated weights to produce your final global percentile
score.

#### Scientific Weights

Based on UN Human Development Index (HDI), Oxford Multidimensional Poverty Index
(MPI), and World Happiness Report regression analysis:

- **Income (25%)**: Strongest life satisfaction predictor (β=0.28 in happiness
  regressions)
- **Education (20%)**: Core HDI component, enables opportunity
- **Healthcare (20%)**: Life-or-death factor, critical health outcomes
- **Water (15%)**: Basic survival need, foundational for health
- **Geographic Location (10%)**: Infrastructure, safety, rule of law
- **Food Security (5%)**: Survival need (correlates strongly with income)
- **Internet Access (5%)**: Modern essential but lower priority than basic needs

#### Example Calculation

**Scenario**: Person in Singapore earning <$5,000/year with minimal education

```
Geographic Location (high-income):    84th percentile × 10% weight = 8.4 points
Income (<$5k/year):                   20th percentile × 25% weight = 5.0 points
Education (primary school):           20th percentile × 20% weight = 4.0 points
Water (must collect):                  9th percentile × 15% weight = 1.35 points
Healthcare (cannot afford):           20th percentile × 20% weight = 4.0 points
Food Security (frequently hungry):    10th percentile × 5% weight  = 0.5 points
Internet (none):                      15th percentile × 5% weight  = 0.75 points

Final Score: (8.4 + 5.0 + 4.0 + 1.35 + 4.0 + 0.5 + 0.75) = 24th percentile
```

**Result**: You rank higher than 24% of the global population (despite living in
Singapore).

#### Why This Approach?

1. **Intuitive**: If 50% of the world has internet, no internet = 50th
   percentile (bottom half)
2. **Transparent**: Every weight justified by peer-reviewed research
3. **No Correlation Assumptions**: Each dimension evaluated independently
   against global statistics
4. **Balanced**: Country affects only 10% of score, personal circumstances
   matter more
5. **Uncertainty Quantification**: Monte Carlo simulations provide confidence
   intervals

#### Confidence Intervals

- Runs 1,000 Monte Carlo simulations
- Adds ±5 percentage point noise to each percentile
- Reports median and 90% confidence interval (5th-95th percentile of
  simulations)
- Example output: "67% (CI: 62-72%)" means your score likely falls in this range

## Data Sources

All statistics are sourced from reputable international organizations (accessed
November 2025):

### Weight Justification Sources

- **UN Human Development Report (HDI)**
  - UNDP (2023). _Human Development Report 2023/2024_:
    [hdr.undp.org](https://hdr.undp.org/)
  - Establishes 33% weighting for health, education, and income

- **Oxford Multidimensional Poverty Index (MPI)**
  - Alkire, S., Kanagaratnam, U., & Suppa, N. (2023). _Global Multidimensional
    Poverty Index 2023_:
    [ophi.org.uk/multidimensional-poverty-index](https://ophi.org.uk/multidimensional-poverty-index/)
  - 33% weight each to health, education, living standards

- **World Happiness Report**
  - Helliwell, J. F., et al. (2023). _World Happiness Report 2023_:
    [worldhappiness.report](https://worldhappiness.report/)
  - GDP per capita strongest predictor (β=0.28)

- **WHO Priority Setting**
  - WHO (2023). _Making Fair Choices on the Path to Universal Health Coverage_:
    [who.int/health-systems-governance/universal-health-coverage](https://www.who.int/health-systems-governance/universal-health-coverage)
  - Healthcare as fundamental right

### Global Statistics Sources

- **World Bank**
  - Country income classifications:
    [Country and Lending Groups](https://datahelpdesk.worldbank.org/knowledgebase/articles/906519)
  - Education statistics:
    [EdStats Database](https://data.worldbank.org/topic/education)
  - Income distributions:
    [Poverty and Inequality Platform](https://pip.worldbank.org/)
  - Financial inclusion:
    [Global Findex Database 2021](https://www.worldbank.org/en/publication/globalfindex)

- **WHO & UNICEF**
  - Water and sanitation:
    [Joint Monitoring Programme (JMP) 2024](https://washdata.org/data)
  - Healthcare access: [Global Health Observatory](https://www.who.int/data/gho)

- **UNESCO**
  - Education attainment:
    [Institute for Statistics](http://data.uis.unesco.org/)
  - Historical education trends by cohort

- **ITU (International Telecommunication Union)**
  - Internet access:
    [World Telecommunication/ICT Indicators Database](https://www.itu.int/en/ITU-D/Statistics/Pages/stat/default.aspx)
  - Historical time series (1990-2024)

- **FAO (Food and Agriculture Organization)**
  - Food security:
    [State of Food Security and Nutrition in the World 2024](https://www.fao.org/publications/sofi/)

- **Gallup World Poll**
  - Safety perception and discrimination experiences (aggregate statistics)

## Questions Covered

1. **Birth Year**: Used for temporal adjustments (internet access, education
   rates)
2. **Geographic Location**: Your country (automatically mapped to World Bank
   income classification)
3. **Education**: Highest level of education completed
4. **Income**: Annual household income (PPP-adjusted)
5. **Water Access**: Access to clean drinking water at home
6. **Healthcare**: Ability to afford medical care when needed
7. **Food Security**: Frequency of worrying about having enough food
8. **Internet Access**: Digital connectivity (home broadband vs mobile vs none)
9. **Safety**: Neighborhood safety perception
10. **Discrimination**: Experience of discrimination in the past year
11. **Financial Security**: Emergency savings (3+ months of expenses)

### Total: 11 Questions (~5 minutes)

## Technical Implementation

### Frontend Stack

- Pure JavaScript (no frameworks)
- ByteSized Design System (Game Boy aesthetic)
- CSS Custom Properties for theming
- Responsive design with mobile-first approach

### File Structure

```
privilege/
├── frontend/
│   ├── index.html          # Main quiz interface
│   ├── css/
│   │   └── styles.css      # ByteSized design system styles
│   ├── js/
│   │   ├── calculator.js   # LifeStatsCalculator - weighted average engine
│   │   └── app.js          # Quiz UI logic and flow control
│   └── data/
│       └── conditional-probabilities.json  # Global statistics data
├── test/                   # Comprehensive test suite (125 tests)
│   ├── calculator.test.js       # Unit tests for calculator logic
│   ├── integration.test.js      # End-to-end integration tests
│   ├── data-validation.test.js  # Data integrity validation
│   └── score-validation.test.js # Regression tests for known scenarios
├── package.json            # Jest configuration and test scripts
└── README.md
```

## Design System

This project follows the **ByteSized Research Design System**:

- **Typography**: Press Start 2P for headers, system fonts for body text
- **Color Palette**: Game Boy greens with pastel visualization colors
- **Components**: Eject button, Game Boy device frame, CRT effects
- **Accessibility**: WCAG AA compliant contrast ratios
- **Responsive**: Mobile-first with breakpoints at 768px and 1200px

## Usage

1. Navigate to the Global Life Statistics Quiz page
2. Click "START QUIZ" to begin
3. Answer all 11 questions honestly
4. View your results with detailed breakdown showing:
   - Your global percentile score with confidence interval
   - Factor-by-factor contributions with percentiles and weights
   - Expandable methodology explanation with scientific references
5. Retake the quiz to explore different scenarios

## Limitations & Disclaimers

### Statistical Limitations

- **Independence Assumption**: Each dimension evaluated independently against
  global statistics (doesn't capture correlations like "high-income countries
  tend to have better healthcare")
- **Country-level Aggregates**: Uses country income classifications, not
  individual purchasing power within countries
- **Weight Choices**: While scientifically grounded, weights involve judgment
  (UN HDI uses 33/33/33, we use 25/20/20/15/10/5/5)
- **Data Lag**: Some statistics are 1-3 years old (most recent available from
  international organizations)
- **Sampling Uncertainty**: Confidence intervals reflect ±5% statistical noise,
  not full measurement error
- **Missing Nuances**: Cannot capture intersectional identities, systemic
  discrimination, or individual circumstances
- **Regional Variation Hidden**: Country-level data masks within-country
  inequality (e.g., urban vs rural)

### Methodological Caveats

- **Percentile Estimates**: Global percentiles approximated from cross-sectional
  survey data
- **Binary/Categorical Choices**: Life is continuous; we use discrete answer
  options (e.g., "$20k-50k" vs actual income)
- **Equal Person Weighting**: Every person counts equally (not
  population-weighted by country)

### Important Notes

- This calculator provides **statistical context for education**, not moral
  judgment
- Life circumstances are complex and multifaceted beyond what statistics can
  capture
- **Individual experiences vary greatly** even within statistical categories
- The goal is **awareness and understanding**, not comparison or guilt
- Results show global percentile - being in the 90th percentile doesn't mean you
  don't face challenges
- All percentages are approximations based on best available data from reputable
  sources
- This tool cannot capture systemic discrimination, trauma, mental health,
  disability, or other critical life factors

## Future Enhancements

- [ ] Add more questions (regional variations, disability, gender, race)
- [ ] Historical comparison (see how your score would differ in different time
      periods)
- [ ] Category deep-dives (explore specific dimensions in detail)
- [ ] Data visualization of results distribution
- [ ] Export results as infographic
- [ ] Multi-language support
- [ ] Updated statistics (data refresh pipeline)

## Development

### Local Testing

```bash
# Serve from ByteSized root directory
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/privilege/frontend/index.html
```

### Adding New Questions

1. Add question object to `questions` array in `app.js`
2. Include question text, options with percentiles, and data source
3. Ensure percentiles sum logically (don't need to equal 100%)
4. Cite credible source

### Modifying Calculations

The calculation logic is in `calculator.js` (`LifeStatsCalculator` class):

1. **Change Weights**: Modify `this.WEIGHTS` in the constructor (lines 20-28)
2. **Change Percentiles**: Modify percentile mappings in
   `calculateLifeStatsScore()` (lines 78-212)
3. **Add New Factors**: Add new percentile calculation blocks following the
   existing pattern
4. **Change Uncertainty**: Modify `applyUncertainty()` noise range (line 71)

The UI integration is in `app.js` - this handles question flow and results
display.

## License

Part of ByteSized Research - Educational data visualization projects.

## Credits

- **Design System**: ByteSized Design System (Game Boy retro aesthetic)
- **Data Sources**: World Bank, WHO, UNESCO, FAO, ITU, UN, Oxford Poverty &
  Human Development Initiative
- **Statistical Method**: Weighted average of global percentiles with
  scientifically-validated weights
- **Weight Justification**: UN Human Development Index, Oxford MPI, World
  Happiness Report

---

**Note**: This tool is for educational purposes. For academic or research use,
please cite the original data sources directly.
