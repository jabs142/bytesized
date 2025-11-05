# Pharmaceutical Innovation Clusters

> A ByteSized Research cartridge exploring temporal clustering patterns in FDA drug approvals (1938-2024)

![Game Boy Theme](https://img.shields.io/badge/Theme-Game%20Boy-8bac0f?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

---

## 🎯 Overview

This project analyzes temporal clustering patterns in FDA drug approvals, revealing periods where pharmaceutical innovations cluster together rather than occurring uniformly over time.

### What We Analyze

- **71,149 FDA drug approvals** (1938-2024)
- **10 therapeutic areas** including Infectious Disease, Oncology, Cardiovascular, Pain & Analgesia
- **Statistical clustering** using Poisson tests and sliding window analysis (>2σ above mean)
- **Hype cycles** in pharmaceutical history (Antibiotic Golden Age, mRNA Revolution, GLP-1 phenomenon)

### Key Insights

- **63%** of all classified drugs are for pain management
- **47%** of infectious disease drugs were approved in the 1990s alone
- **Antibiotic Golden Age** (1940-1960): Most effective period for antibiotic development
- **Respiratory boom-bust**: 82% decline from 1990s peak to 2020s

---

## 📊 Data Source

**FDA Drugs@FDA API**: Complete drug approval records from the FDA Orange Book
- New Drug Applications (NDAs)
- Biologics License Applications (BLAs)
- Approval dates, application numbers, and drug classifications

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd pharmaceutical-innovation-clusters
pip install -r requirements.txt
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env and add your FDA_API_KEY
```

Get your FDA API key at: https://open.fda.gov/apis/authentication/

### 3. Run Complete Analysis

```bash
# Run the complete pipeline
python run_complete_analysis.py
```

This will:
1. Collect FDA drug approval data
2. Classify drugs by therapeutic area (using OpenAI)
3. Perform statistical clustering analysis
4. Generate industry analysis
5. Export visualization data for frontend

### 4. View Frontend

```bash
# Start local server (from project root)
cd frontend
npx http-server -p 8081

# Open browser to:
# http://localhost:8081
```

---

## 📁 Project Structure

```
pharmaceutical-innovation-clusters/
├── data/
│   ├── raw/                    # Original FDA data
│   │   └── fda_drugs_raw.csv
│   ├── processed/              # Analyzed data
│   │   ├── statistical_results.json
│   │   ├── industry_analysis.json
│   │   └── innovation_clusters.json
│   └── unique_angles/          # Special analyses
│       └── hype_analysis.json
│
├── src/
│   ├── config.py               # Configuration settings
│   ├── data_collection/
│   │   └── fda_collector.py    # FDA data collection
│   ├── analysis/
│   │   ├── cluster_analyzer.py       # Core clustering analysis
│   │   ├── statistical_clustering.py # Statistical tests
│   │   ├── industry_analyzer.py      # Therapeutic area trends
│   │   ├── export_frontend_data.py   # Frontend data export
│   │   └── unique_angles/
│   │       └── hype_analyzer.py      # Pharmaceutical hype cycles
│   └── visualization/
│       └── create_visualizations.py  # Viz data generation
│
├── frontend/                   # Interactive dashboard
│   ├── index.html
│   ├── css/styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── therapeutic-timeline.js
│   │   └── unique-insights.js
│   └── data/                   # Generated from analysis
│       ├── clusters.json
│       ├── statistical_results.json
│       └── timeline_viz.json
│
├── outputs/
│   └── reports/
│       └── complete_analysis_report.md
│
├── run_complete_analysis.py    # Main pipeline orchestrator
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🔬 Methodology

### 1. Data Collection

**FDA Drug Approvals**: Collected via OpenFDA API
- All NDA and BLA approvals from 1938-2024
- Includes approval dates, application types, and drug names

### 2. Therapeutic Classification

**OpenAI GPT-4 Classification**:
- Each drug classified into one of 10 therapeutic areas
- Areas: Infectious Disease, Oncology, Cardiovascular, Neurological, Immunological, Endocrine, Gastrointestinal, Respiratory, Dermatological, Pain & Analgesia
- Classification based on drug name patterns and pharmaceutical knowledge

### 3. Statistical Clustering Detection

**Poisson Test**:
- Tests if drug approvals are randomly distributed over time
- Null hypothesis: approvals follow Poisson distribution
- p < 0.05 indicates significant clustering (non-random)

**Sliding Window Analysis**:
- 5-year sliding windows across entire timeline
- Identifies periods with >2σ above historical mean
- Marks statistically significant cluster periods

**Temporal Clustering**:
- Groups consecutive high-activity years (minimum 3 years)
- Calculates cluster strength (σ above mean)
- Identifies peak years within each cluster

### 4. Industry Analysis

- **Trends**: Growing, declining, or stable approval rates
- **Peak years**: Maximum approvals per therapeutic area
- **Decade breakdown**: Innovation patterns by decade
- **Hype cycle analysis**: Historical boom/bust patterns

---

## 📈 Key Findings

### Major Pharmaceutical Clusters Identified

1. **1996-2005**: Cardiovascular Revolution (statins, ACE inhibitors)
2. **1990s**: Infectious Disease Golden Age (HIV antiretrovirals, new antibiotics)
3. **1998-2008**: Pain Medication Boom (later recognized as opioid crisis)
4. **2010-2020**: Cancer Immunotherapy Era (checkpoint inhibitors, CAR-T)
5. **2020-2024**: mRNA Revolution (COVID vaccines, new platform technology)

### Therapeutic Area Trends

**Pain & Analgesia**: Dominant category
- 63% of all classified drug approvals
- 86.6% approved 1980-2019
- Peak: 156 approvals in 2018

**Infectious Disease**: Boom and bust
- 47% of approvals occurred in 1990s alone
- Antibiotic development declined sharply post-2000
- COVID pandemic sparked temporary revival

**Respiratory**: Steep decline
- 82% decrease from 1990s peak to 2020s
- Market saturation in asthma/COPD treatments

**Cardiovascular**: Early leader, now plateaued
- Strong 1985-2000 period
- Statin era transformed cardiology

### Pharmaceutical Hype Cycles

**Accurate Predictions**:
- mRNA vaccines for rapid pandemic response (2018 → 2020)
- Cancer immunotherapy revolution (2010 prediction → realized)
- Monoclonal antibodies for targeted therapy (1985 → 1998)

**Overhyped Predictions**:
- Alzheimer's cures by 2025 (all major trials failed 2012-2022)
- HIV vaccine within 5 years (2006 prediction → still no vaccine in 2024)
- Gene therapy by 2000 (first success not until 2017)
- Personalized genomic medicine by 2010 (limited adoption as of 2024)

**Pattern**: Platform technologies more predictable than disease cures. Complex diseases (Alzheimer's, cancer) consistently overhyped. Average delay of 10-15 years for overhyped predictions.

---

## 🎨 Frontend Dashboard

The interactive Game Boy-themed dashboard features:

### 1. Executive Summary
- Total drug approvals, statistical test results, key findings

### 2. Master Timeline
- Interactive timeline of FDA approvals over 85+ years
- Filter by time period, zoom to specific eras

### 3. Statistical Clustering
- Poisson test results showing clustering significance
- Sliding window analysis visualization
- Top cluster periods ranked by strength

### 4. Therapeutic Landscape
- Decade-based heatmap of approvals by therapeutic area
- Color intensity shows approval volume
- Green borders highlight temporal clustering (>40% of category approvals)

### 5. Pharmaceutical Stories
- 5 fun fact cards with data-driven insights
- "The Pain Paradox", "The Antibiotic Crisis", "Short Boom, Steep Decline"
- Historical context and decade comparisons

### 6. Unique Insights
- Pharmaceutical hype cycles (Antibiotic Golden Age, mRNA Revolution)
- Predictions vs. reality analysis
- Boom/bust patterns across therapeutic areas

### Styling
Follows ByteSized Research Game Boy aesthetic:
- Press Start 2P pixel font
- Game Boy color palette (#0f380f, #306230, #8bac0f)
- Retro UI with pixel borders and stepped shadows

---

## 🛠️ Configuration

### API Settings (`src/config.py`)

```python
# API Credentials
FDA_API_KEY = os.getenv('FDA_API_KEY')  # Required
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')  # For classification

# Data Collection
FDA_START_YEAR = 1938
FDA_END_YEAR = 2024

# API Rate Limiting
FDA_API_DELAY = 0.5  # seconds (240 req/min with key)
MAX_RETRIES = 3

# Analysis Settings
CLUSTERING_THRESHOLD_SIGMA = 2.0  # std deviations
MIN_CLUSTER_SIZE = 3  # minimum years
SLIDING_WINDOW_SIZE = 5  # years
```

---

## 📊 Data Pipeline Flow

```
1. Data Collection
   └─ FDA Collector → data/raw/fda_drugs_raw.csv

2. Therapeutic Classification
   └─ OpenAI GPT-4 → Classifies drugs into 10 categories

3. Statistical Analysis
   ├─ Cluster Analyzer → innovation_clusters.json
   ├─ Statistical Tests → statistical_results.json
   └─ Industry Analysis → industry_analysis.json

4. Unique Insights
   └─ Hype Analyzer → hype_analysis.json

5. Visualization Export
   ├─ Frontend Data Export → frontend/data/clusters.json
   └─ Viz Generator → timeline_viz.json

6. Frontend Dashboard
   └─ Interactive Game Boy UI displays all insights
```

---

## 🔍 Usage Examples

### Run Specific Analysis Steps

```bash
# 1. Collect FDA data only
python src/data_collection/fda_collector.py

# 2. Run statistical clustering
python src/analysis/statistical_clustering.py

# 3. Analyze by therapeutic area
python src/analysis/industry_analyzer.py

# 4. Analyze hype cycles
python src/analysis/unique_angles/hype_analyzer.py

# 5. Generate visualization data
python src/visualization/create_visualizations.py

# 6. Export to frontend
python src/analysis/export_frontend_data.py
```

### Analyze Specific Time Period

Modify `src/config.py`:

```python
FDA_START_YEAR = 2000  # Focus on 21st century
FDA_END_YEAR = 2024
```

### Adjust Clustering Sensitivity

```python
# In src/config.py
CLUSTERING_THRESHOLD_SIGMA = 1.5  # More sensitive (lower threshold)
MIN_CLUSTER_SIZE = 5  # Require longer periods
SLIDING_WINDOW_SIZE = 10  # Wider time windows
```

---

## 🐛 Troubleshooting

### "No data available" in frontend

**Solution**: Run the complete pipeline first:

```bash
python run_complete_analysis.py
```

This ensures all data files are generated.

### API rate limiting errors

**Solution**: Increase delay in `src/config.py`:

```python
FDA_API_DELAY = 1.0  # Increase from 0.5
```

### OpenAI classification errors

**Possible causes**:
- Missing or invalid OPENAI_API_KEY
- API rate limits exceeded
- Network connectivity issues

**Solution**: Check .env file and ensure valid API key

### Empty results or missing clusters

**Check**:
1. Data collection completed successfully
2. `data/raw/fda_drugs_raw.csv` exists and has data
3. Clustering threshold not too high

---

## 📈 Understanding the Results

### Statistical Tests

**Poisson Test Results**:
- ✅ **Clustered (p < 0.05)**: Drug approvals are NOT random—they cluster significantly
- ❌ **Random (p ≥ 0.05)**: Cannot reject randomness hypothesis

**Interpretation**: If p < 0.05, this proves drug approvals cluster together rather than occurring uniformly. This suggests external factors (research breakthroughs, FDA policy changes, industry trends) drive innovation waves.

### Cluster Strength

**Sigma (σ) Above Mean**:
- **2.0σ**: Moderate cluster (threshold)
- **3.0σ**: Strong cluster
- **4.0σ+**: Exceptional cluster

**Example**: "1996-2000 Cardiovascular: 2.8σ above mean"
- This period had 2.8 standard deviations more approvals than historical average
- Statistically significant clustering driven by statin approvals

### Therapeutic Area Insights

**Peak Decade**: Decade with most approvals for each category
**Trend**: Growing (recent approvals > historical), declining, or stable
**Cluster Periods**: Specific years with exceptional activity

---

## 📝 Future Enhancements

- [ ] Add economic indicators (R&D spending, FDA budget)
- [ ] Implement causal analysis (what triggers clusters?)
- [ ] International drug approvals (EMA, PMDA)
- [ ] Clinical trial data integration
- [ ] Machine learning cluster prediction
- [ ] Real-time dashboard updates

---

## 📚 References

- **FDA Drugs@FDA**: https://www.fda.gov/drugs/drug-approvals-and-databases/drugsfda-data-files
- **OpenFDA API**: https://open.fda.gov/apis/drug/
- **FDA Orange Book**: https://www.fda.gov/drugs/drug-approvals-and-databases/approved-drug-products-therapeutic-equivalence-evaluations-orange-book

---

## 📄 License

Part of ByteSized Research - All rights reserved

---

## 🙋 Contributing

This is a personal research project. For questions or suggestions, please open an issue.

---

## ✨ Acknowledgments

- FDA for open drug approval data and comprehensive APIs
- OpenAI for therapeutic classification capabilities
- ByteSized Research community

---

**Built with ❤️ using retro Game Boy aesthetics**
