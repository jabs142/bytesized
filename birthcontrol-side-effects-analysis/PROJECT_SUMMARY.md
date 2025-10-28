# Birth Control Side Effects Pattern Explorer
## Discovering Hidden Symptom Relationships from Real Experiences

---

## 📋 Project Overview

An educational data science project that analyzes 537+ Reddit posts to discover hidden symptom patterns in birth control experiences using association rule mining. The project combines data collection, pattern mining, and interactive visualization to surface symptom co-occurrences that clinical trials might miss.

**Live Demo**: http://localhost:8000 (when running locally)

---

## 🎯 Problem Statement

Clinical trials for birth control typically:
- Focus on isolated side effects
- May miss symptom co-occurrences
- Don't capture long-term or "hidden" symptoms
- Have limited diversity in participants

Real-world experiences on Reddit reveal patterns that deserve investigation:
- Which symptoms tend to appear together?
- What's the strength of these relationships?
- Which combinations are more common than random chance?

---

## ✨ Key Features

### 1. **Data Collection Pipeline**
- Collects posts from 4 subreddits (r/birthcontrol, r/PMDD, r/TwoXChromosomes, r/SkincareAddiction)
- Deduplication to avoid double-counting
- PII removal (usernames, emails, phone numbers)
- Expandable keyword search (mental + physical symptoms)

### 2. **Symptom Extraction**
- NLP-based extraction of 40+ symptom types:
  - Mental: depression, anxiety, mood swings, brain fog, panic attacks, etc.
  - Physical: acne, weight gain, hair loss, yeast infections, vaginal dryness, etc.
- Temporal context detection (long-term use, just started, post-pill)
- Birth control type identification (COC pill, IUD, etc.)

### 3. **Pattern Mining**
- **Association Rule Mining** using Apriori algorithm
- Metrics calculated:
  - **Support**: How many posts contain the pattern?
  - **Confidence**: If symptom A appears, what % also have symptom B?
  - **Lift**: How much stronger is this pattern than random chance?
- Configurable thresholds (min support: 3%, min confidence: 60%, min lift: 1.2x)

### 4. **Interactive Web App**
- **Home Page**: Statistics dashboard with top symptoms
- **Symptom Checker**: Select symptoms → discover related patterns
- **Network Visualization**: Interactive D3.js force-directed graph
- Mobile-first, touch-friendly design
- No tracking, fully anonymous

---

## 📊 Current Results (537 Posts Analyzed)

### Dataset Stats
- **Total posts**: 537
- **Posts with symptoms**: 386 (72%)
- **Patterns discovered**: 2 (with current thresholds)
- **Unique symptoms identified**: 20+

### Top Symptoms
1. Anxiety - 132 posts (34%)
2. Acne - 94 posts (24%)
3. Fear - 75 posts (19%)
4. Depression - 56 posts (15%)
5. Cramps - 46 posts (12%)

### Discovered Patterns
1. **Brain Fog → Anxiety**
   - Confidence: 65%
   - Lift: 1.9x (90% more likely than random)
   - Support: 13 posts

2. **Nervousness → Anxiety**
   - Confidence: 61%
   - Lift: 1.8x
   - Support: 11 posts

### Symptom Categories
- Mental symptoms only: 153 posts
- Physical symptoms only: 85 posts
- Both mental + physical: 148 posts (38%)

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION                          │
│  Reddit API (PRAW) → 4 subreddits → Deduplication          │
│  Output: reddit_bc_symptoms_posts_TIMESTAMP.json            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  SYMPTOM EXTRACTION                         │
│  NLP patterns → Medical term extractor → Temporal context   │
│  Output: analyzed_posts with symptom labels                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   PATTERN MINING                            │
│  Apriori algorithm → Association rules → Filtering          │
│  Output: discovered_patterns.json, symptom_network.json     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  WEB VISUALIZATION                          │
│  HTML/CSS/JS → D3.js graphs → Interactive exploration       │
│  Pages: Home, Symptom Checker, Network Graph                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend / Data Processing
- **Python 3.11+**
- **PRAW** (Reddit API wrapper)
- **pandas** (data manipulation)
- **mlxtend** (Apriori implementation)
- **Jupyter Notebooks** (analysis)
- **tqdm** (progress bars)

### Frontend
- **HTML5** (semantic structure)
- **Tailwind CSS** (styling via CDN)
- **Vanilla JavaScript** (no framework)
- **D3.js v7** (network visualization)

### Data Storage
- **JSON** files (no database needed)
- Static file serving

---

## 📁 Project Structure

```
birthcontrol-side-effects-analysis/
├── README.md                   # Quick start guide
├── PROJECT_SUMMARY.md          # This file
├── requirements.txt            # Python dependencies
│
├── src/                        # Source code
│   ├── data_collection/
│   │   └── reddit_collector.py # Reddit API scraper
│   ├── analysis/
│   │   └── medical_term_extractor.py  # NLP symptom extraction
│   └── analyzers/
│       └── association_rules.py       # Pattern mining
│
├── notebooks/                  # Jupyter analysis notebooks
│   ├── 01_data_collection.ipynb
│   └── 02_pattern_mining.ipynb
│
├── data/                       # Data files (gitignored)
│   ├── raw/                    # Original Reddit posts
│   └── patterns/               # Mining outputs
│       ├── stats.json
│       ├── discovered_patterns.json
│       └── symptom_network.json
│
├── frontend/                   # Web application
│   ├── index.html              # Home page
│   ├── symptom-checker.html    # Interactive checker
│   ├── network.html            # D3.js visualization
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── symptom-checker.js
│   │   └── network.js
│   └── data/                   # Copied JSON for frontend
│
└── docs/                       # Documentation
    ├── QUICKSTART.md
    ├── DATA_FLOW.md
    └── ANALYSIS_METHODOLOGY.md
```

---

## 🚀 Quick Start

### Prerequisites
```bash
# Python 3.11+
python3 --version

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Installation
```bash
# Clone repository
git clone <repo-url>
cd birthcontrol-side-effects-analysis

# Install dependencies
pip install -r requirements.txt

# Create Reddit API credentials
# 1. Go to https://www.reddit.com/prefs/apps
# 2. Create app, get credentials
# 3. Create credentials.json:
{
  "reddit_client_id": "your_client_id",
  "reddit_client_secret": "your_secret",
  "reddit_user_agent": "BC Side Effects Analyzer v1.0"
}
```

### Run Data Collection
```bash
python src/data_collection/reddit_collector.py
# Output: data/raw/reddit_bc_symptoms_posts_TIMESTAMP.json
```

### Run Pattern Mining
```bash
jupyter notebook notebooks/02_pattern_mining.ipynb
# Outputs: data/patterns/*.json
```

### Launch Web App
```bash
cd frontend
python3 -m http.server 8000

# Open browser: http://localhost:8000
```

---

## 📖 Key Concepts

### Association Rule Mining

**What is it?**
A data mining technique to find interesting relationships between items in large datasets.

**Example**:
If 65% of people who report "brain fog" also report "anxiety", and this is 1.9x more likely than random chance, that's a strong association rule.

### Metrics Explained

#### Support
**Definition**: How frequently the pattern appears in the dataset
**Formula**: (# posts with pattern) / (# total posts)
**Example**: 13 posts out of 386 = 3.4% support
**Interpretation**: Higher = more common pattern

#### Confidence
**Definition**: Conditional probability - if A occurs, what % also have B?
**Formula**: P(B|A) = (# posts with A and B) / (# posts with A)
**Example**: 65% of brain fog posts also mention anxiety
**Interpretation**: Higher = stronger relationship

#### Lift
**Definition**: How much more likely is B when A is present vs random?
**Formula**: Confidence(A→B) / Support(B)
**Example**: Lift = 1.9 means 90% more likely than random
**Interpretation**:
- Lift < 1.0 = Negative association (avoid each other)
- Lift = 1.0 = Independent (no relationship)
- Lift > 1.0 = Positive association (appear together)
- Lift > 1.5 = Strong association
- Lift > 2.0 = Very strong association

### Apriori Algorithm

**How it works**:
1. Find all frequent 1-itemsets (individual symptoms above min support)
2. Use frequent 1-itemsets to find frequent 2-itemsets
3. Continue building up to k-itemsets
4. Generate rules from frequent itemsets
5. Filter by confidence and lift

**Why it's efficient**:
The "Apriori principle" - if an itemset is infrequent, all its supersets are also infrequent. This allows aggressive pruning.

---

## 🔬 Methodology

### Data Collection Ethics
- ✅ Public posts only (no DMs or private subs)
- ✅ Anonymized (usernames removed)
- ✅ Rate-limited (2 seconds between requests)
- ✅ Deduplication (no double-counting)
- ✅ Educational use only

### Symptom Extraction Process
1. **Pattern matching**: Regex for exact symptom terms
2. **Context validation**: Ensure it's an experience, not a question
3. **Standardization**: Map variants to canonical terms (e.g., "acne" = "breakouts" = "pimples")
4. **Categorization**: Mental vs physical
5. **Temporal markers**: Extract timeline information

### Pattern Mining Parameters

**Current Settings**:
- Min Support: 11 posts (3% of 386)
- Min Confidence: 60%
- Min Lift: 1.2x

**Rationale**:
- Support threshold prevents rare flukes
- Confidence ensures reliability
- Lift ensures it's better than random

**Adjusting Thresholds**:
- Lower support → Find rarer patterns (but less reliable)
- Lower confidence → More patterns but weaker relationships
- Lower lift → Include weaker associations

---

## 📈 Future Enhancements

### Data Collection
- [ ] Expand to more subreddits (r/PCOS, r/Hypothyroidism)
- [ ] Collect 1000+ posts for stronger patterns
- [ ] Add temporal tracking (collect new posts monthly)
- [ ] Include comments (currently posts only)

### Analysis
- [ ] Temporal pattern mining (before/after stopping)
- [ ] Birth control type-specific patterns
- [ ] Severity scoring (mild vs severe)
- [ ] Sentiment analysis (positive vs negative experiences)

### Visualization
- [ ] Pattern timeline (how patterns change over time)
- [ ] Birth control comparison tool
- [ ] Community detection in network graph
- [ ] Export reports as PDF

### Technical
- [ ] Add automated tests
- [ ] CI/CD pipeline
- [ ] Deploy to GitHub Pages
- [ ] Add caching for faster loads

---

## ⚠️ Limitations & Disclaimers

### Important Notes
- **NOT MEDICAL ADVICE**: This is for educational purposes only
- **Self-reported data**: Reddit posts are subjective experiences
- **Selection bias**: People with negative experiences may post more
- **Causation ≠ Correlation**: Patterns don't prove birth control caused symptoms
- **Small dataset**: 537 posts is not representative of all users
- **Missing context**: We don't have medical histories, diagnoses, or other medications

### Statistical Limitations
- Association rules don't prove causation
- Confidence intervals not calculated
- No control group
- Temporal relationships not established
- Confounding variables not controlled

### Use Cases
✅ **Appropriate Uses**:
- Generating hypotheses for research
- Patient education and awareness
- Identifying topics for doctor discussions
- Learning data science techniques

❌ **Inappropriate Uses**:
- Making medical decisions
- Diagnosing conditions
- Avoiding prescribed medications
- Replacing clinical trials

---

## 🙏 Acknowledgments

### Data Sources
- Reddit communities (r/birthcontrol, r/PMDD, r/TwoXChromosomes, r/SkincareAddiction)
- All anonymous posters sharing their experiences

### Tools & Libraries
- PRAW (Reddit API wrapper)
- mlxtend (Apriori implementation)
- D3.js (visualization)
- Tailwind CSS (styling)

---

## 📜 License

This project is for educational purposes. All Reddit data is anonymized and used in accordance with Reddit's API terms of service.

---

## 👩‍💻 Author

Built by [Your Name] as a learning project exploring:
- Data collection and cleaning
- NLP and pattern extraction
- Association rule mining
- Interactive data visualization
- Mobile-first web design

**Background**: Pharmacy degree + Software Engineering

**Learning Goals**:
- ✅ Multi-source data collection
- ✅ Pattern mining algorithms
- ✅ Evidence-based analysis
- ✅ Public health data presentation

---

## 📞 Contact & Feedback

- **GitHub**: [Your Profile]
- **Email**: [Your Email]
- **Portfolio**: [Your Portfolio]

**Found an issue?** Open a GitHub issue or PR!

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: ✅ Complete (MVP)
