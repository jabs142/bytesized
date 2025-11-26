# AI in Healthcare Fundamentals

> An interactive crash course teaching core AI concepts for healthcare through
> hands-on demonstrations

## Overview

This cartridge teaches fundamental concepts of artificial intelligence in
healthcare to a general audience. Through interactive visualizations and
plain-language explanations, users learn how AI models work, how they're
evaluated, and what makes healthcare AI uniquely challenging.

## What's Built

### Educational Content

**Core Technical Concepts**

- Supervised vs. Unsupervised Learning
- Classification vs. Regression
- Training/Validation/Test Sets

**Evaluation Metrics**

- Sensitivity and Specificity
- Positive and Negative Predictive Value (PPV/NPV)
- AUROC and AUPRC
- Calibration

**Healthcare-Specific Challenges**

- Distribution Shift (temporal, population, practice)
- Label Leakage
- Ground Truth Problems
- Automation Bias

**Deployment Reality**

- FDA Regulatory Pathways
- Clinical Workflow Integration
- Explainability vs. Performance

**Large Language Models**

- Strengths and weaknesses in healthcare
- Emerging use cases
- Safety considerations

### Interactive Demonstrations

#### 1. Distribution Shift Demo (Featured)

**What it shows:** How model performance degrades over time as conditions change

**Interactive elements:**

- Timeline slider (2015-2024)
- Toggle for COVID-19 impact (2020+)
- Toggle for EHR system change (2022+)
- Real-time performance metrics (AUROC, Calibration, PPV)
- Chart showing performance degradation

**Key insight:** Models trained at one institution/time often fail when deployed
elsewhere/later. Demonstrates why continuous monitoring and retraining are
essential.

#### 2. ROC Curve Demo

**What it shows:** The tradeoff between sensitivity and specificity

**Interactive elements:**

- Threshold slider (0.0 to 1.0)
- Dynamic ROC curve visualization
- Real-time sensitivity/specificity updates
- Operating point highlighted on curve

**Key insight:** You can't maximize both sensitivity and specificity—it's always
a tradeoff. The right balance depends on clinical context.

#### 3. Calibration Demo

**What it shows:** Well-calibrated vs. poorly-calibrated predictions

**Interactive elements:**

- Side-by-side calibration plots
- Well-calibrated model (predictions match reality)
- Poorly-calibrated model (systematic over/under-prediction)

**Key insight:** High AUROC doesn't guarantee useful probabilities. If you can't
trust the predicted percentages, you can't use them for clinical decisions.

#### 4. Prevalence Impact Demo

**What it shows:** How disease prevalence dramatically affects PPV and NPV

**Interactive elements:**

- Prevalence slider (0.1% to 50%)
- Dynamic confusion matrix visualization
- Real-time PPV/NPV calculation
- Population counts (TP, FP, TN, FN)

**Key insight:** A test with 90% sensitivity and 90% specificity can have
terrible PPV for rare diseases. The same AI tool performs very differently in
populations with different disease prevalence.

### Simulated Datasets

All interactive demos use toy datasets and mathematical simulations rather than
real data:

- **Distribution shift**: Calculated degradation formulas
- **ROC curves**: Generated from mathematical relationships
- **Calibration**: Simulated well-calibrated vs poorly-calibrated scenarios
- **Prevalence**: Calculated from Bayes' theorem
