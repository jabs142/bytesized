# Birth Control Side Effects Pattern Explorer 🔬

This project discovers hidden symptom relationships in birth control experiences
by analyzing 537+ Reddit posts using association rule mining and presenting
findings through an interactive web application.

### What's Built

- ✅ **Data Collection Pipeline**: 537 Reddit posts from 4 subreddits with
  deduplication
- ✅ **Dual Extraction Approach**:
  - Keyword-based extraction (40+ predefined symptoms) → Pattern mining
  - LLM-based extraction (GPT-4o-mini unbiased discovery, 414 unique symptoms) →
    Validation pipeline
- ✅ **Severity Tracking**: Standardized symptom names with separate severity
  scoring (mild/moderate/severe)
- ✅ **Comment Validation**: LLM-based analysis of "me too" validation patterns
  in comments
- ✅ **PubMed Research Validation**: Cross-reference with medical literature via
  E-utilities API
- ✅ **PubMed Relevance Filtering**: LLM validates each paper's relevance to
  birth control side effects
- ✅ **Evidence Tiering System**: FDA-listed → Research-backed →
  Patient-validated → Emerging
- ✅ **Statistical Validation**: Spearman correlation, chi-square tests,
  Bonferroni correction
- ✅ **Pattern Mining**: Association rule mining with Apriori algorithm (17
  patterns discovered)
- ✅ **Interactive Web App**: Symptom checker + network visualization (D3.js)
- ✅ **Mobile-First Design**: Touch-friendly, responsive interface

---

## 📊 Key Findings

### Discovered Patterns

| Pattern               | Confidence | Lift | Support  | Interpretation                                |
| --------------------- | ---------- | ---- | -------- | --------------------------------------------- |
| Brain Fog → Anxiety   | 65%        | 1.9x | 13 posts | 65% of brain fog posts also mention anxiety   |
| Nervousness → Anxiety | 61%        | 1.8x | 11 posts | 61% of nervousness posts also mention anxiety |

**Total Patterns**: 17 discovered with current thresholds (min_support=7,
min_confidence=0.40, min_lift=1.2)

### Top Symptoms (LLM-Extracted with Severity Breakdown)

1. **Anxiety** - 128 posts (23.8%) | Severity: 3 mild, 38 moderate, 90 severe
2. **Acne** - 89 posts (16.6%) | Severity: 5 mild, 78 moderate, 23 severe
3. **Depression** - 59 posts (11.0%) | Severity: 0 mild, 22 moderate, 37 severe
4. **Fatigue** - 57 posts (10.6%) | Severity: 1 mild, 33 moderate, 29 severe
5. **Bleeding** - 55 posts (10.2%) | Severity: 2 mild, 47 moderate, 19 severe

**Note**: Symptom names are standardized (e.g., "anxiety" not "severe anxiety").
Severity is tracked separately on a 1-3 scale based on language intensity.

### Dataset Statistics

- **Total posts**: 537
- **Posts with symptoms**: 386 (72%)
- **Unique symptoms tracked**: 20+
- **Symptom categories**:
  - Mental symptoms only: 153 posts (40%)
  - Physical symptoms only: 85 posts (22%)
  - Both mental + physical: 148 posts (38%)

---

## 🚀 Quick Start

```bash
# 1. View the web app
python3 -m http.server 8000
# Open: http://localhost:8000/frontend/validation.html

# 2. Run full extraction pipeline (requires OPENAI_API_KEY in .env)
bash run_full_pipeline.sh

# Or run individual steps:

# 3. Run LLM extraction with severity tracking
python src/analysis/llm_side_effect_extractor.py

# 4. Run PubMed validation
python src/validation/evidence_validator.py

# 5. Filter PubMed papers by relevance (LLM-based)
python src/validation/pubmed_relevance_checker.py

# 6. Analyze comment validations ("me too" patterns)
python src/analysis/llm_comment_validator.py

# 7. Run statistical analysis
python src/analysis/statistical_validator.py

# 8. View comprehensive analysis
jupyter notebook notebooks/03_validation_analysis.ipynb

# 9. Run pattern mining
jupyter notebook notebooks/02_pattern_mining.ipynb

# 10. Collect new data (requires Reddit API credentials)
python src/data_collection/reddit_collector.py
```

---

## 🔬 Methodology

This project uses a multi-stage pipeline combining traditional NLP with modern
LLM capabilities and evidence-based validation.

### 1. Data Collection (537 Posts)

**Implementation**:

```python
# Multi-subreddit collection with deduplication
collector.search_multiple_subreddits([
    'birthcontrol', 'PMDD',
    'TwoXChromosomes', 'SkincareAddiction'
])
```

**Features**:

- Deduplication by post ID to avoid duplicates
- Privacy protection: Automatic removal of usernames, emails, phone numbers
- Rate limiting: 2-second delays between requests
- Collects post title, body, score, upvote_ratio, top 5 comments per post
- Public posts only (no DMs or private subs)

### 2. Symptom Extraction - Dual Approach

**Why Two Methods?**

This project implements **both** keyword-based and LLM-based extraction for
different purposes:

#### **A. Keyword-Based Pattern Matching** → Pattern Mining

**Implementation**: ✅ **Used in notebooks/02_pattern_mining.ipynb**

```python
# NLP pattern matching for symptom detection
symptoms = extractor.extract_symptoms(text, category='all')
# Returns: {'anxiety': 3, 'acne': 2, 'depression': 1}
```

**Coverage**: 40+ symptoms

- **Mental symptoms**: anxiety, depression, mood swings, brain fog, panic,
  suicidal thoughts, irritability, emotional changes
- **Physical symptoms**: acne, weight gain, hair loss, cramps, bleeding issues,
  yeast infections, nausea, headache, fatigue
- **Temporal markers**: long-term use, just started, post-pill, stopped taking

**Purpose**: Consistent, reproducible extraction for association rule mining

**Results**: 132 anxiety mentions, 94 acne mentions across 386 posts

#### **B. LLM-Based Extraction** → Validation Pipeline

**Implementation**: ✅ **Used in src/analysis/llm_side_effect_extractor.py**

```python
# GPT-4o-mini extracts ALL side effects without predefined keywords
llm_extractor.extract_from_posts(posts)
```

**Advantages**:

- Discovers side effects **without predefined keywords** (unbiased discovery of
  414 unique symptoms)
- Captures patient's exact wording and context
- **Standardizes severity separately**: "severe anxiety" → symptom: "anxiety",
  severity: 3
- **Severity scale**: 1 (mild), 2 (moderate), 3 (severe) based on language
  intensity
- Categorizes as mental vs physical automatically

**Purpose**: Find truly novel side effects that keyword approaches might miss

**Results**:

- 414 unique side effects discovered
- 128 posts mention anxiety (23.8% of all posts)
- Severity breakdown tracked for each symptom
- Example: Anxiety - 3 mild, 38 moderate, 90 severe

**Why Different Counts from Keyword Method?**

- Keyword method is more permissive (catches all variants)
- LLM is more conservative (requires clear attribution to birth control)
- LLM now separates severity from symptom name for cleaner data
- This is by design - two complementary approaches strengthen findings

### 3. PubMed Research Validation

**Implementation**: ✅ **Fully Working** (src/validation/evidence_validator.py)

- Searches PubMed for each side effect + birth control using E-utilities API
- Fetches paper details: title, abstract, authors, year, PMID, DOI
- Extracts prevalence data from abstracts (e.g., "67% of patients...")
- Identifies research gaps (high patient reports, low research coverage)

**Output**: Cross-referenced database linking patient experiences with medical
literature

### 3.5. PubMed Relevance Filtering

**Implementation**: ✅ **New Feature**
(src/validation/pubmed_relevance_checker.py)

**Problem Solved**: PubMed searches sometimes return irrelevant papers (e.g.,
"chronic pain" linking to abortion studies)

**Solution**: LLM validates each paper's relevance to birth control side effects

```python
# LLM assesses if paper is actually about side_effect + birth control
checker.assess_relevance(side_effect, paper)
# Returns: relevance_score (0-1), reason, connection
```

**Filtering**: Papers with relevance_score < 0.7 are excluded

**Output**: Each retained paper includes:

- `relevance_score`: 0.0-1.0 confidence score
- `relevance_reason`: "Why this paper is relevant" (1 sentence)
- `relevance_connection`: How it relates to BC side effects

### 3.6. Comment Validation Analysis

**Implementation**: ✅ **New Feature** (src/analysis/llm_comment_validator.py)

**Purpose**: Analyze "me too" validation patterns in comments to measure
community agreement

**How it Works**:

- LLM analyzes each comment to detect validation patterns
- Understands social media slang: "fr tho same" = "for real, same experience"
- Categories: `validation`, `additional_info`, `counter`, `unrelated`
- Weighted by comment upvotes for credibility

**Example Analysis**:

```
Comment: "omg same my anxiety is so bad"
→ Type: validation (confidence: 0.95)
→ Reason: "Clear agreement with original poster's experience"
```

**Output**:

- `comment_validations.json`: Per-post validation results
- `symptom_validation_stats.json`: Aggregated validation rates by symptom

### 4. Evidence Tiering System

**Implementation**: ✅ **Fully Working**

- **Tier 1 🏆**: FDA-listed side effects (nausea, headache, mood changes, blood
  clots, etc.)
- **Tier 2 ✅**: Research-backed (3+ PubMed papers found)
- **Tier 3 💬**: Patient-validated (50+ Reddit mentions, <3 papers)
- **Tier 4 ⚠️**: Emerging patterns (needs more investigation)

**Surprise Score**: `(Patient frequency) × (1 - Research coverage)` to find
hidden side effects

**Purpose**: Classify findings by evidence strength, identify under-researched
symptoms

### 5. Statistical Validation

**Implementation**: ✅ **Fully Working** (src/analysis/statistical_validator.py)

**Methods Implemented**:

- **Spearman Correlation**: Correlates patient frequency vs research coverage
- **Chi-Square Tests**: Tests distribution of surprise scores and tier
  associations
- **Bonferroni Correction**: Multiple testing correction to avoid false
  positives
- **Binomial Tests**: Validates individual side effect frequencies

**Purpose**: Rigorous validation to ensure patterns aren't due to random chance

**What's Missing** (Future Work):

- Confidence intervals for pattern mining (bootstrap CIs)
- Statistical power analysis
- Effect size measures beyond lift
- Regression/causal models

### 6. Pattern Mining (Apriori Algorithm)

**Implementation**: ✅ **Fully Working** (notebooks/02_pattern_mining.ipynb)

```python
# Apriori algorithm with configurable thresholds
miner = AssociationRulesMiner(
    min_support=7,       # 1.8% of 386 posts with symptoms
    min_confidence=0.40, # 40% reliability
    min_lift=1.2         # 20% better than random
)
rules = miner.find_patterns(analyzed_posts)
```

**Metrics Explained**:

- **Support**: How common is the pattern? (13 posts = 3.4%)
- **Confidence**: If A occurs, what % also have B? (65%)
- **Lift**: How much stronger than random? (1.9x = 90% increase)
  - Lift < 1.0 = Negative association (avoid each other)
  - Lift = 1.0 = Independent (no relationship)
  - Lift > 1.5 = Strong association

**Results**: 17 patterns discovered (14 have anxiety as consequent, indicating
anxiety's centrality)

**How Apriori Works**:

1. Find all frequent 1-itemsets (individual symptoms above min support)
2. Use frequent 1-itemsets to find frequent 2-itemsets
3. Continue building up to k-itemsets
4. Generate rules from frequent itemsets
5. Filter by confidence and lift

**Efficiency**: Apriori principle - if an itemset is infrequent, all its
supersets are also infrequent, allowing aggressive pruning

### 7. Interactive Web Visualization

**Implementation**: ✅ **Fully Working** (frontend/)

**Features**:

- **Symptom Checker**: Search/filter symptoms, select multiple, see real-time
  pattern analysis
- **Network Visualization**: D3.js force-directed graph with draggable nodes,
  zoom/pan controls
  - Node size = symptom frequency
  - Edge thickness = relationship confidence
  - Click nodes to highlight connections
- **Mobile-First Design**: Responsive grid layouts (Custom CSS), touch-friendly
  44px+ buttons

**Technical Highlight**: D3.js force simulation with custom collision detection

---

## 💻 Technology Stack

### Data Pipeline

- **Python 3.11** - Core language
- **PRAW** - Reddit API wrapper for data collection
- **Pandas** - Data manipulation and analysis
- **mlxtend** - Apriori algorithm implementation
- **OpenAI API** - GPT-4 for LLM-based extraction
- **Biopython/requests** - PubMed E-utilities API
- **scipy/statsmodels** - Statistical validation
- **Jupyter** - Interactive analysis with tqdm progress bars

### Frontend

- **HTML5/CSS3** - Semantic markup and styling
- **Custom CSS** - Utility classes with shared ByteSized design system
- **Vanilla JavaScript** - No framework bloat
- **D3.js v7** - Interactive network visualization

### Architecture

- **Static site** - No backend required
- **JSON data files** - Simple, portable storage
- **Python HTTP server** - For local development

---

## 📁 Project Structure

```
birthcontrol-side-effects-analysis/
├── README.md                   # This file (comprehensive guide)
├── requirements.txt            # Python dependencies
│
├── src/                        # Source code
│   ├── data_collection/
│   │   ├── reddit_collector.py        # Reddit API scraper (PRAW)
│   │   └── pubmed_fetcher.py          # PubMed E-utilities wrapper
│   ├── preprocessing/
│   │   └── text_cleaner.py            # PII removal, text normalization
│   ├── analysis/
│   │   ├── medical_term_extractor.py  # Keyword-based extraction (40+ symptoms)
│   │   ├── llm_side_effect_extractor.py # LLM-based extraction (GPT-4)
│   │   └── statistical_validator.py   # Spearman, chi-square, Bonferroni
│   ├── validation/
│   │   └── evidence_validator.py      # PubMed validation + evidence tiering
│   └── analyzers/
│       └── association_rules.py       # Apriori pattern mining
│
├── notebooks/                  # Jupyter analysis notebooks
│   ├── 01_exploratory_data_analysis.ipynb
│   ├── 02_pattern_mining.ipynb        # Association rules (keyword extraction)
│   └── 03_validation_analysis.ipynb   # LLM + PubMed validation
│
├── data/                       # Data files (gitignored)
│   ├── raw/                    # Original Reddit posts
│   │   └── reddit_bc_symptoms_posts_*.json
│   ├── patterns/               # Pattern mining outputs
│   │   ├── stats.json                 # Symptom frequencies (keyword method)
│   │   ├── discovered_patterns.json   # 17 association rules
│   │   └── symptom_network.json       # Graph data for D3.js
│   ├── analysis/               # LLM extraction outputs
│   │   ├── llm_side_effect_stats.json
│   │   └── llm_extracted_side_effects_raw.json
│   └── validated/              # Evidence validation outputs
│       ├── validated_side_effects_database.json
│       └── validation_summary.json
│
├── frontend/                   # Web application
│   ├── index.html              # Home page (statistics dashboard)
│   ├── symptom-checker.html    # Interactive checker
│   ├── network.html            # D3.js visualization
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── symptom-checker.js
│   │   └── network.js
│   └── data/                   # Copied JSON for frontend
│
├── outputs/                    # Generated visualizations
│   ├── visualizations/         # Plots and charts
│   └── reports/                # Analysis reports
│
└── docs/                       # Additional documentation
    ├── QUICKSTART.md
    ├── DATA_FLOW.md
    └── DETAILED_METHODOLOGY.md
```

---

## 📚 Key Concepts Explained

### Association Rule Mining

A data mining technique to find interesting relationships between items in large
datasets. Originally developed for market basket analysis ("customers who buy
bread also buy butter").

**Example**: If 65% of people who report "brain fog" also report "anxiety", and
this is 1.9x more likely than random chance, that's a strong association rule.

### Metrics Deep Dive

#### Support

**Definition**: How frequently the pattern appears in the dataset **Formula**:
(# posts with pattern) / (# total posts) **Example**: 13 posts out of 386 = 3.4%
support **Interpretation**: Higher = more common pattern

#### Confidence

**Definition**: Conditional probability - if A occurs, what % also have B?
**Formula**: P(B|A) = (# posts with A and B) / (# posts with A) **Example**: 65%
of brain fog posts also mention anxiety **Interpretation**: Higher = stronger
relationship

#### Lift

**Definition**: How much more likely is B when A is present vs random?
**Formula**: Confidence(A→B) / Support(B) **Example**: Lift = 1.9 means 90% more
likely than random **Interpretation**:

- Lift < 1.0 = Negative association (avoid each other)
- Lift = 1.0 = Independent (no relationship)
- Lift > 1.0 = Positive association (appear together)
- Lift > 1.5 = Strong association
- Lift > 2.0 = Very strong association

### Apriori Algorithm Efficiency

**Key Principle**: If an itemset is infrequent, all its supersets are also
infrequent. This allows aggressive pruning.

**Example**:

- If "brain_fog" appears in only 5 posts (below min_support)
- Then "brain_fog + anxiety" must also be below min_support (subset cannot be
  more frequent than superset)
- Skip checking all combinations containing "brain_fog"

This pruning makes Apriori efficient even with large datasets.

---

## 🔧 Usage Guide

### Collecting New Data

**Basic collection** (100 posts per subreddit):

```bash
python src/data_collection/reddit_collector.py
```

**Custom collection** (modify the script):

```python
from src.data_collection.reddit_collector import RedditCollector

collector = RedditCollector()
posts = collector.search_subreddit(
    subreddit_name='birthcontrol',
    keywords=['depression', 'anxiety', 'mood'],
    max_posts=200,
    time_filter='month'  # 'hour', 'day', 'week', 'month', 'year', 'all'
)
collector.save_posts(posts, 'custom_collection.json')
```

### Cleaning and Preprocessing Data

```python
from src.preprocessing.text_cleaner import TextCleaner
import json

# Load data
with open('data/raw/reddit_posts.json', 'r') as f:
    posts = json.load(f)

# Clean
cleaner = TextCleaner()
cleaned_posts = cleaner.clean_dataset(posts)

# Save
with open('data/processed/cleaned_posts.json', 'w') as f:
    json.dump(cleaned_posts, f)
```

### Running Analysis

Open Jupyter notebooks:

```bash
jupyter notebook
```

Navigate to `notebooks/` and run the analysis notebooks in order:

1. **01_exploratory_data_analysis.ipynb** - Dataset overview
2. **02_pattern_mining.ipynb** - Association rules (keyword extraction)
3. **03_validation_analysis.ipynb** - LLM + PubMed validation

### Adjusting Mining Thresholds

In `notebooks/02_pattern_mining.ipynb`:

```python
miner = AssociationRulesMiner(
    min_support=8,       # Lower = find rarer patterns (but less reliable)
    min_confidence=0.55, # Lower = include weaker relationships
    min_lift=1.15        # Lower = less strict filtering
)
rules = miner.find_patterns(analyzed_posts)
```

**Trade-offs**:

- **Lower support** → Find rarer patterns (but may be flukes)
- **Lower confidence** → More patterns but weaker relationships
- **Lower lift** → Include weaker associations

**Current settings** (min_support=7, min_confidence=0.40, min_lift=1.2) found 17
patterns.

---

## ⚠️ Limitations & Ethics

### Research Limitations

**Statistical Limitations**:

- **Self-reported data**: Reddit posts are subjective experiences, not medical
  records
- **Selection bias**: People with negative experiences may post more than
  satisfied users
- **Causation ≠ Correlation**: Patterns don't prove birth control _caused_
  symptoms
- **Small dataset**: 537 posts is not representative of all birth control users
- **Missing context**: No medical histories, diagnoses, or other medications
  tracked
- **Confounding variables**: Stress, diet changes, life events not controlled
- **No control group**: Can't separate BC effects from baseline population

**Methodological Limitations**:

- Association rules don't establish temporal precedence
- No confidence intervals on pattern mining (can't quantify uncertainty)
- Binary symptom tracking (mild anxiety = severe panic = 1 count)
- Temporal context extracted but not yet integrated into analysis
- BC type-specific patterns not yet separated

### Data Collection Status

**✅ Collected and Used**:

- Post title and body text
- Post creation date
- Subreddit source

**⚠️ Collected but Not Yet Utilized** (Future Work):

- **Top 5 comments** per post - Could validate "me too!" experiences
- **Upvote scores** - Could weight patterns by community agreement
- **Temporal markers** - "long term use" vs "just started" extracted but not
  separated in mining
- **BC types** - Pill/IUD/implant extracted but not stratified in analysis

**DISCLAIMER**: This is an educational project for learning AI/ML techniques.
Not medical research or advice. Not approved by IRB or ethics board. Social
media data has inherent biases. Results should not be used for medical
decision-making. **Always consult healthcare professionals for medical
concerns.**

---

## 📈 Future Enhancements

### 🔧 Data Utilization Improvements (High Priority)

These features use **already collected data** that's currently unused:

- [ ] **Weight by engagement**: Factor upvote scores into symptom frequency
      calculations (high-upvote posts likely resonate with more people)
- [ ] **Analyze comments**: Extract "me too!" validations from top 5 comments
      per post
- [ ] **Temporal pattern mining**: Separate "before/during/after stopping"
      patterns using extracted temporal markers
- [ ] **BC type stratification**: Analyze pill vs IUD vs implant vs patch
      separately using collected BC types
- [ ] **Severity scoring**: Add mild/moderate/severe classification from text
      analysis (currently binary present/absent)
- [ ] **Confidence intervals**: Bootstrap CIs for pattern mining to quantify
      uncertainty

### 🔬 Analysis Improvements

- [ ] Lower mining thresholds to discover 30-50 patterns (current: 17 patterns)
- [ ] Multi-level association rules (3+ symptoms)
- [ ] Symptom onset timeline modeling
- [ ] Sentiment analysis (positive vs negative experiences)
- [ ] Control group comparison (non-BC users discussing similar symptoms)
- [ ] Causal inference techniques (propensity score matching)

### 📊 Visualization Enhancements

- [ ] Heatmap of symptom co-occurrences
- [ ] Timeline view (Sankey diagram showing symptom progression)
- [ ] BC type comparison tool (side-by-side pattern differences)
- [ ] Pattern comparison interface
- [ ] Export reports as PDF
- [ ] Community detection in network graph

---

## 📖 Learning Resources

### APIs & Data Collection

- [PRAW Documentation](https://praw.readthedocs.io/) - Reddit API wrapper
- [Reddit API Rules](https://www.reddit.com/wiki/api) - API usage guidelines
- [PubMed E-utilities Guide](https://www.ncbi.nlm.nih.gov/books/NBK25501/) -
  Medical research API

### NLP & Text Mining

- [NLTK Book](https://www.nltk.org/book/) - Natural Language Toolkit
- [spaCy Course](https://course.spacy.io/) - Industrial-strength NLP

### LLM APIs

- [OpenAI Documentation](https://platform.openai.com/docs) - GPT-4 and other
  models
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook) - Practical
  examples

### Data Science & Machine Learning

- [Pandas Documentation](https://pandas.pydata.org/docs/) - Data manipulation
- [mlxtend Documentation](https://rasbt.github.io/mlxtend/) - Apriori algorithm
- [Python Data Science Handbook](https://jakevdp.github.io/PythonDataScienceHandbook/) -
  Comprehensive guide
- [Scipy Documentation](https://docs.scipy.org/) - Statistical functions

### Visualization

- [D3.js Gallery](https://observablehq.com/@d3/gallery) - Interactive
  visualizations
- [D3.js Force Simulation](https://d3js.org/d3-force) - Network graphs

---

## 🏆 Project Status

### ✅ Completed (MVP)

**Data Pipeline**:

- [x] Reddit data collection (537 posts, 4 subreddits)
- [x] Deduplication pipeline
- [x] PII removal and anonymization
- [x] Text cleaning and preprocessing

**Analysis**:

- [x] Keyword-based symptom extraction (40+ symptoms)
- [x] LLM-based symptom extraction (GPT-4)
- [x] PubMed validation and evidence tiering
- [x] Statistical validation (Spearman, chi-square, Bonferroni)
- [x] Association rule mining (Apriori algorithm)
- [x] Pattern analysis notebook with tqdm progress bars

**Visualization**:

- [x] Interactive web frontend (3 pages)
- [x] D3.js network visualization
- [x] Mobile-responsive design
- [x] Touch-friendly interface
- [x] Accessibility considerations (keyboard nav)

**Documentation**:

- [x] Comprehensive README
- [x] Inline code documentation
- [x] Jupyter notebook explanations
- [x] Methodology documentation

## 💼 Portfolio Showcase

### Skills Demonstrated

#### Data Science & Machine Learning

- ✅ **Multi-source data collection** with deduplication strategies
- ✅ **LLM application** for unbiased entity extraction (GPT-4)
- ✅ **Association rule mining** (Apriori algorithm implementation)
- ✅ **Statistical validation** (Spearman correlation, chi-square tests,
  Bonferroni correction)
- ✅ **Evidence-based classification** systems (tiering by research strength)
- ✅ **Pattern discovery** in unstructured text data
- ✅ **Network analysis** and relationship graphs

#### Software Engineering

- ✅ **Python OOP design** (clean, modular architecture)
- ✅ **API integration** (Reddit PRAW, OpenAI, PubMed E-utilities)
- ✅ **Virtual environment management** and dependency handling
- ✅ **Error handling and logging** for production-quality code
- ✅ **Data serialization** (JSON processing and storage)
- ✅ **Jupyter optimization** (progress bars, kernel management, output
  formatting)
- ✅ **Code documentation** and README writing

#### Frontend Development

- ✅ **Responsive web design** (mobile-first approach)
- ✅ **Interactive data visualization** (D3.js force-directed graphs)
- ✅ **Vanilla JavaScript** (DOM manipulation, fetch API)
- ✅ **CSS animations** and transitions (Custom CSS)
- ✅ **Accessibility** considerations (keyboard nav, screen readers)
- ✅ **Progressive enhancement** (works without JavaScript for core content)

#### Product & Domain Knowledge

- ✅ **User-centered design** (symptom checker UX)
- ✅ **Educational disclaimers** and transparency
- ✅ **Privacy-first architecture** (no tracking, no cookies, anonymized data)
- ✅ **Healthcare domain knowledge** (pharmacy background applied)
- ✅ **Research methodology** (evidence-based medicine principles)

### Key Learnings

**Technical Skills**:

1. **Association Rule Mining**: Implemented Apriori from scratch, understanding
   support/confidence/lift tradeoffs
2. **D3.js Mastery**: Force simulations, drag behavior, zoom controls, collision
   detection
3. **API Best Practices**: Rate limiting, error handling, retries, credential
   management
4. **Jupyter Optimization**: Progress bars, kernel management, clear output
   formatting
5. **Mobile-First Design**: Touch targets (44px+), responsive grids, performance
   optimization

**Data Science Process**:

1. **Iterative Analysis**: Started with thresholds too strict, learned to adjust
   based on dataset size
2. **Data Quality Matters**: Deduplication improved pattern reliability
   significantly
3. **Transparency Builds Trust**: Showing confidence/lift metrics helps users
   evaluate findings critically
4. **Documentation is Key**: Future-me appreciates thorough commenting and
   READMEs!
5. **Multiple Validation Sources**: Combining Reddit + PubMed + FDA strengthens
   conclusions

**Product Development**:

1. **Start Simple**: Built symptom checker before network graph (MVP first
   approach)
2. **User Feedback Loops**: Progress bars added based on user confusion
3. **Progressive Enhancement**: Site works without JavaScript for core content
4. **Mobile First Works**: Easier to expand desktop than shrink mobile

### Achievements

- 📊 Analyzed 537 real-world experiences from 4 communities
- 🔬 Built full data pipeline: collection → extraction → validation →
  visualization
- 🤖 Integrated modern LLMs (GPT-4) with traditional NLP techniques
- 📈 Discovered 17 validated symptom patterns with statistical rigor
- 🌐 Created interactive web app from scratch (no templates, no frameworks)
- 📱 Designed mobile-first, accessible interface (WCAG considerations)
- 📚 Documented entire process for reproducibility and learning
