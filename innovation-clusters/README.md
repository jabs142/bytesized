# Innovation Clusters - Temporal Clustering of Economic Breakthroughs

> A ByteSized Research cartridge exploring temporal patterns in pharmaceutical and technological innovation (1920-2024)

![Game Boy Theme](https://img.shields.io/badge/Theme-Game%20Boy-8bac0f?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

---

## 🎯 Overview

This project analyzes temporal clustering patterns in major innovations across:
- **FDA Drug Approvals** (1938-2024)
- **USPTO Breakthrough Patents** (1920-2024)
  - Pharmaceuticals (CPC: A61K)
  - Semiconductors (CPC: H01L)
  - Telecommunications (CPC: H04)
  - Computing (CPC: G06F)

Using statistical methods (>2σ above mean), we identify periods where innovations cluster together rather than occurring uniformly over time.

---

## 📊 Data Sources

- **FDA Orange Book API**: Drug approval records
- **USPTO PatentsView API**: High-citation patents (top 10%)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd innovation-clusters
pip install -r requirements.txt
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env and add your API keys if needed
```

### 3. Run Data Collection

```bash
# Collect FDA drug approvals
python src/data_collection/fda_collector.py

# Collect USPTO patents (breakthrough only)
python src/data_collection/patent_collector.py
```

**Note**: Patent collection may take 15-30 minutes depending on API rate limits.

### 4. Run Analysis

```bash
# Perform temporal clustering analysis
python src/analysis/cluster_analyzer.py

# Generate exploration visualizations
python explore_clustering.py

# Export data for frontend
python src/analysis/export_frontend_data.py
```

### 5. View Frontend

```bash
# Start local server
python -m http.server 8000

# Open browser to:
# http://localhost:8000/innovation-clusters/frontend/index.html
```

---

## 📁 Project Structure

```
innovation-clusters/
├── data/
│   ├── raw/                    # Original collected data
│   │   ├── fda_drugs_raw.csv
│   │   └── patents_raw.json
│   ├── processed/              # Cleaned, analyzed data
│   │   └── innovation_clusters.json
│   └── validated/              # Future use
│
├── src/
│   ├── config.py               # Configuration settings
│   ├── data_collection/
│   │   ├── fda_collector.py    # FDA Orange Book API
│   │   └── patent_collector.py # USPTO PatentsView API
│   ├── analysis/
│   │   ├── cluster_analyzer.py # Temporal clustering
│   │   └── export_frontend_data.py
│   └── validation/             # Future enhancements
│
├── notebooks/                  # Jupyter exploration (optional)
│
├── frontend/                   # Game Boy themed dashboard
│   ├── index.html
│   ├── css/styles.css
│   ├── js/app.js
│   └── data/clusters.json      # Generated from analysis
│
├── outputs/
│   ├── reports/
│   │   └── findings_report.md
│   └── visualizations/
│       ├── fda_approvals_by_year.png
│       ├── patents_by_category.png
│       ├── combined_timeline.png
│       └── innovations_by_decade.png
│
├── explore_clustering.py       # Exploration & visualization script
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🔬 Methodology

### Statistical Clustering Detection

1. **Calculate baseline**: Mean and standard deviation of innovations per year
2. **Identify outliers**: Years with >2σ above mean
3. **Group consecutive years**: Form cluster periods (minimum 3 years)
4. **Cross-reference**: Find periods where both drugs and patents spiked

### Breakthrough Patent Criteria

- Top 10% by citation count within each technology category
- Filters out incremental innovations to focus on fundamental breakthroughs

---

## 📈 Key Findings

Run the pipeline to generate findings! The analysis will produce:

1. **Total innovation count** across all categories
2. **Number of cluster periods** identified
3. **Peak decade** for innovation
4. **Major overlapping clusters** (simultaneous drug and patent surges)
5. **Visualizations** showing temporal patterns

Example output location: `outputs/reports/findings_report.md`

---

## 🎨 Frontend Dashboard

The interactive Game Boy-themed dashboard includes:

- **Statistics cards**: Total innovations, cluster count, peak decade
- **Filter buttons**: View all, FDA drugs only, or patents only
- **Expandable cluster cards**: Detailed information for each period
- **Technology breakdown**: Patent counts by category
- **Methodology section**: Data sources and analysis methods

### Styling

Follows the [ByteSized Research Style Guide](../STYLE_GUIDE.md):
- Press Start 2P pixel font for headers
- Game Boy color palette (#0f380f, #306230, #8bac0f, #9bbc0f)
- Retro UI elements with pixel borders and stepped shadows

---

## 🛠️ Configuration

### API Settings (src/config.py)

```python
# Data Collection
FDA_START_YEAR = 1938
FDA_END_YEAR = 2024
PATENT_START_YEAR = 1920
PATENT_END_YEAR = 2024

# Patent Categories
PATENT_CATEGORIES = {
    'Pharmaceuticals': 'A61K',
    'Semiconductors': 'H01L',
    'Telecommunications': 'H04',
    'Computing': 'G06F'
}

# Clustering Analysis
CLUSTERING_THRESHOLD_SIGMA = 2.0  # Standard deviations
MIN_CLUSTER_SIZE = 3  # Minimum consecutive years

# Citation Threshold
BREAKTHROUGH_CITATION_PERCENTILE = 90  # Top 10%
```

---

## 📊 Data Pipeline Flow

```
1. Data Collection
   ├─ FDA Collector → fda_drugs_raw.csv
   └─ Patent Collector → patents_raw.json

2. Analysis
   ├─ Cluster Analyzer → innovation_clusters.json
   └─ Export Frontend Data → frontend/data/clusters.json

3. Exploration (optional)
   └─ Explore Script → visualizations + findings report

4. Frontend
   └─ Dashboard loads clusters.json and renders interactive UI
```

---

## 🔍 Usage Examples

### Collect FDA Data Only

```python
from src.data_collection.fda_collector import FDACollector

collector = FDACollector()
df = collector.collect_approvals(start_year=2000, end_year=2024)
```

### Analyze Specific Time Period

Modify `src/config.py`:

```python
FDA_START_YEAR = 1990
FDA_END_YEAR = 2024
```

Then run the pipeline.

### Custom Clustering Threshold

```python
# In src/config.py
CLUSTERING_THRESHOLD_SIGMA = 1.5  # More sensitive
MIN_CLUSTER_SIZE = 5  # Require longer periods
```

---

## 🐛 Troubleshooting

### "No data available" in frontend

**Solution**: Run the data pipeline first:

```bash
python src/data_collection/fda_collector.py
python src/data_collection/patent_collector.py
python src/analysis/cluster_analyzer.py
python src/analysis/export_frontend_data.py
```

### API rate limiting errors

**Solution**: Increase delays in `src/config.py`:

```python
FDA_API_DELAY = 1.0  # Increase from 0.5
USPTO_API_DELAY = 2.0  # Increase from 1.0
```

### Empty patent results

**Possible causes**:
- PatentsView API may have changed
- CPC codes may need updating
- Network connectivity issues

**Solution**: Check API status and test queries manually

---

## 🔬 Advanced Analysis

### Running Complete Analysis

The complete analysis pipeline includes statistical clustering tests, industry comparisons, and visualization generation:

```bash
# Run complete analysis (includes all steps below)
python run_complete_analysis.py
```

This orchestrates:
1. Statistical clustering analysis (Poisson tests, sliding windows)
2. Industry deep-dive analysis (trends, correlations)
3. Visualization data generation
4. Frontend data export
5. Summary report generation

### Individual Analysis Steps

#### 1. Statistical Clustering Analysis

```bash
python src/analysis/statistical_clustering.py
```

**What it does:**
- **Poisson Test**: Tests if innovations are randomly distributed
  - Null hypothesis: innovations follow random (Poisson) distribution
  - p < 0.05 means clustering is statistically significant
- **Sliding Window Analysis**: Identifies 5-year periods with unusual activity
  - Marks periods >2σ above historical mean
- **Cross-Industry Correlation**: Tests if industries innovate together

**Output**: `data/processed/statistical_results.json`

#### 2. Industry Analysis

```bash
python src/analysis/industry_analyzer.py
```

**What it does:**
- Analyzes each industry separately (FDA drugs + 4 patent categories)
- Identifies trends (growing, declining, stable)
- Finds peak innovation years
- Groups high-activity therapeutic areas

**Output**: `data/processed/industry_analysis.json`

#### 3. Visualization Data Generation

```bash
python src/visualization/create_visualizations.py
```

**What it does:**
- Generates timeline data for all industries
- Creates industry comparison charts
- Exports summary statistics

**Output**: `frontend/data/timeline_viz.json`

### Understanding the Results

#### Statistical Tests

**Poisson Test Results:**
- ✅ **Clustered (p<0.05)**: Innovations are NOT random—they cluster significantly
- ❌ **Random (p≥0.05)**: Cannot reject randomness

**Interpretation:**
- If most categories show p<0.05, this proves innovations cluster together
- Random distribution would mean innovations occur uniformly over time

#### Cluster Periods

**Sigma (σ) Above Mean:**
- **2.0σ**: Moderate cluster (threshold)
- **3.0σ**: Strong cluster
- **4.0σ+**: Exceptional cluster

**Example:**
- "1996-2000 FDA Drugs: 2.4σ above mean"
  - This period had 2.4 standard deviations more approvals than average
  - Statistically significant clustering

#### Industry Correlations

**Correlation Coefficient (r):**
- **r > 0.7**: Strong positive correlation (industries move together)
- **r = 0.4-0.7**: Moderate correlation
- **r < 0.4**: Weak correlation

**Significance (p-value):**
- **p < 0.05**: Correlation is statistically significant
- **p ≥ 0.05**: Could be due to chance

### Frontend Dashboard

After running the analysis, the frontend displays:

**New Sections:**
1. **Statistical Tests** - Poisson test results showing which categories cluster
2. **Master Timeline** - Decade-by-decade visualization of all industries
3. **Industry Comparison** - Bar charts and peak year analysis
4. **Cluster Details** - Expandable cards for major cluster periods

**How to View:**
```bash
# Start local server
python -m http.server 8000

# Open browser:
# http://localhost:8000/innovation-clusters/frontend/index.html
```

### Generated Reports

**Complete Analysis Report**: `outputs/reports/complete_analysis_report.md`

Includes:
- Poisson test results for all categories
- Top 5 strongest clusters
- Industry totals and trends
- Peak innovation years
- Decade-by-decade breakdown
- Correlation matrix
- Key findings summary

---

## 📝 Future Enhancements

- [ ] Add economic indicators (GDP, funding) as contextual data
- [ ] Implement causal analysis of cluster formation
- [ ] Add international patent offices (EPO, JPO)
- [ ] Interactive timeline with zoom capability
- [ ] Machine learning cluster prediction

---

## 📚 References

- **FDA Orange Book**: https://www.fda.gov/drugs/drug-approvals-and-databases/approved-drug-products-therapeutic-equivalence-evaluations-orange-book
- **USPTO PatentsView**: https://patentsview.org/
- **CPC Classification**: https://www.cooperativepatentclassification.org/

---

## 📄 License

Part of ByteSized Research - All rights reserved

---

## 🙋 Contributing

This is a personal research project. For questions or suggestions, please open an issue.

---

## ✨ Acknowledgments

- FDA for open drug approval data
- USPTO for PatentsView API
- ByteSized Research community

---

**Built with ❤️ using retro Game Boy aesthetics**
