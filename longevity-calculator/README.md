# Memento Mori - Life Expectancy Calculator

> "Remember that you must die." Calculate your life expectancy and visualize
> your time remaining.

## Overview

An interactive web application that estimates life expectancy based on
demographics and lifestyle factors.

## Features

### 1. Personalized Life Expectancy Calculator

- **8-question quiz** collecting:
  - Demographics: age, sex, location
  - Lifestyle: smoking, exercise, BMI, sleep, diet, alcohol
- **Accurate calculations** using:
  - CDC 2019 life tables
  - Gompertz mortality model
  - Hazard ratios from peer-reviewed research (Li et al. 2018, Circulation)

### 2. Habit Impact Simulator

- Interactive controls to modify lifestyle factors
- Real-time life expectancy updates
- See years gained or lost from each habit change
- Baseline vs. modified comparison

### 3. Life Calendar Visualization

- Visual representation of life in weeks
- Grid showing weeks lived vs. weeks remaining
- Inspired by "Wait But Why" life calendar concept
- Hover tooltips with age and status

### File Structure

```
longevity-calculator/
├── frontend/
│   ├── index.html              # Main page
│   ├── css/
│   │   └── styles.css          # Game Boy styling
│   ├── js/
│   │   ├── calculator.js       # Core calculations (Gompertz model)
│   │   ├── app.js              # Quiz flow & state management
│   │   ├── habit-simulator.js  # Interactive lifestyle controls
│   │   └── life-calendar.js    # Week grid visualization
│   └── data/
│       ├── life-tables.json        # CDC 2019 mortality data
│       └── lifestyle-factors.json  # Hazard ratios (Li et al. 2018)
└── README.md
```

### Calculation Methodology

**Baseline Mortality:**

- CDC WONDER 2019 US life tables
- Age-specific mortality rates by sex
- Location adjustments for international users

**Lifestyle Adjustments:**

- Hazard ratios from Li et al. 2018 study
- Multiplicative model:
  `adjusted_mortality = base_mortality * HR₁ * HR₂ * ... * HRₙ`
- Factors: smoking (HR: 1.0-2.2), exercise (1.0-1.6), BMI (1.0-1.45), sleep
  (1.0-1.25), diet (1.0-1.35), alcohol (1.0-1.4)

**Life Expectancy Calculation:**

- Survival curve simulation from current age to max age (120)
- Gompertz model for ages beyond data: `mortality(age) = α * exp(β * age)`
- Monte Carlo approach: sum of survival probabilities = expected years remaining

### Data Sources

1. **Life Tables**
   - Source: CDC WONDER, United States Life Tables 2019
   - Age-specific mortality rates for males and females
   - Gompertz parameters for extrapolation

2. **Lifestyle Factors**
   - Source: Li Y, et al. Impact of Healthy Lifestyle Factors on Life
     Expectancies in the US Population. _Circulation_. 2018;138(4):345-355.
   - All-cause mortality hazard ratios
   - 6 modifiable lifestyle factors

3. **Location Adjustments**
   - Based on WHO Global Health Observatory life expectancy data
   - Years relative to US baseline

## Disclaimer

This tool provides statistical estimates based on population averages.
Individual outcomes vary greatly due to genetics, environment, healthcare
access, and other factors. This is for educational purposes only and should not
replace medical advice.
