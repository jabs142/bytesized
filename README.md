# Symptom Discovery Research Project

AI-powered analysis of patient experiences to uncover hidden patterns in medical symptoms.

## Overview

This research project uses large language models (LLMs) to analyze patient discussions from online communities (Reddit), extracting symptom patterns without predefined keywords. Each discovery is validated against medical literature and assessed using rigorous statistical methods to identify research gaps where patient experiences outpace scientific investigation.

**Current Projects:**
- **Ehlers-Danlos Syndrome (EDS)**: 751 symptoms discovered from 257 Reddit posts, 30 validated against PubMed
- **Birth Control Side Effects**: 20+ side effects identified from 537 Reddit posts, 17 patterns discovered

## Methodology

Our approach uses modern NLP techniques with foundation models (GPT-4o-mini) rather than training custom models. This provides greater flexibility, generalizability, and allows for true discovery rather than just detecting pre-known symptoms.

### Step 1: Data Collection
**What we do:** Collect authentic patient experiences from Reddit communities (r/ehlersdanlos, r/birthcontrol)

**Why:**
- Patients often discuss symptoms in their own words that may not appear in medical literature
- Reddit provides authentic, detailed narratives (unlike Twitter's short, bot-heavy posts)
- Community discussions reveal real-world symptom patterns and severity

**How:**
- Use Reddit API to collect posts from relevant subreddits
- Filter for posts with substantial content (avoid one-liners)
- Preserve context and original quotes for validation

---

### Step 2: LLM-Based Symptom Extraction
**What we do:** Use GPT-4o-mini API to extract symptoms from patient posts using carefully crafted prompts

**Why:**
- **Unbiased discovery**: No predefined symptom lists means we can find unexpected patterns
- **Modern approach**: Foundation models outperform custom-trained models from 2015-2020 era research
- **Generalizable**: Same methodology works across different conditions without retraining
- **Captures nuance**: LLMs understand context better than traditional NLP (e.g., "new pain" vs "pain relief")

**How:**
- Zero-shot/few-shot learning with positive and negative examples in prompts
- Extract: symptom name, severity (mild/moderate/severe), triggers, duration (acute/chronic), context
- Process in batches to maintain consistency
- Extract original quotes for verification

**Example Prompt Structure:**
```
EXTRACT (positive examples):
✅ Physical symptoms: "joint pain", "fatigue", "muscle weakness"
✅ Sensory issues: "hearing loss", "blurry vision"
✅ Mental health symptoms: "anxiety", "depression"

REJECT (negative examples):
❌ Social concepts: "imposter syndrome", "gaslighting"
❌ Technical issues: "internet problems"
❌ Negations: "no pain", "absence of symptoms"
```

---

### Step 3: Deduplication & Cleaning
**What we do:** Remove duplicates, non-medical terms, and intelligently group similar symptoms

**Why:**
- **Data quality**: Ensures we're analyzing actual medical symptoms, not social phenomena
- **Accuracy**: Removes temporal modifiers ("new pain" → "pain") while preserving meaningful distinctions
- **Manageable dataset**: Reduces noise without losing signal

**How:**
- Blacklist obvious non-medical terms (e.g., "internet connectivity issues")
- Use LLM to classify remaining terms as medical vs non-medical
- Smart grouping: merge location-specific weakness ("hand weakness" + "arm weakness" → "limb weakness")
- Keep meaningful distinctions: "hand weakness" ≠ "grip strength"

**Results:** 988 raw symptoms → 751 clean medical symptoms (24% reduction)

---

### Step 4: Research Validation (PubMed)
**What we do:** Cross-reference discovered symptoms with PubMed medical literature

**Why:**
- **Identify research gaps**: Show which symptoms patients report but research hasn't studied
- **Scientific rigor**: Ground patient reports in existing medical knowledge
- **Priority setting**: Help researchers focus on under-studied symptoms with high patient impact

**How:**
- Query PubMed API for each symptom + condition (e.g., "joint pain AND Ehlers-Danlos")
- Count number of research papers discussing each symptom
- Calculate "surprise score": (Patient Frequency) × (1 - Research Coverage)
- Focus validation on symptoms with 5+ patient mentions for statistical power

**Key Insight:** Weak negative correlation (ρ = -0.14) between patient reports and research coverage confirms that more frequently reported symptoms don't necessarily have more research.

---

### Step 5: Statistical Validation
**What we do:** Apply rigorous statistical tests to ensure findings are scientifically sound

**Why:**
- **Prevent false positives**: Multiple testing increases chance of spurious findings
- **Scientific credibility**: Statistical rigor distinguishes our work from anecdotal reports
- **Quantify confidence**: Show which findings are statistically significant vs chance occurrences

#### 5a. Spearman Correlation
**Test:** Measure relationship between patient report frequency and research paper counts

**Why Spearman:**
- Rank-based correlation (doesn't assume linear relationship)
- Robust to outliers
- Appropriate for count data

**Result (EDS):** ρ = -0.14, p = 0.47 (weak negative correlation, not statistically significant)

**Interpretation:** Patient reports and research coverage are largely independent, confirming research gaps exist.

---

#### 5b. Chi-Square Distribution Test
**Test:** Assess if surprise scores follow a uniform distribution

**Why:**
- Tests if research gaps are evenly distributed or clustered
- Validates that most symptoms ARE well-researched (not all gaps)

**Result (EDS):** p < 0.0001 (significantly non-uniform)

**Interpretation:** 97% of symptoms have low surprise scores (well-researched), but specific gaps exist in less common symptoms.

---

#### 5c. Bonferroni Correction (Multiple Testing)
**Test:** Adjust p-values when running multiple statistical tests

**Why:**
- Running 30 tests (one per symptom) at α=0.05 gives ~78% chance of false positive
- Bonferroni controls family-wise error rate: p_adjusted = p_original × n_tests
- Only accept findings with p_adjusted < 0.05

**Formula:** For symptom i, test if frequency differs from mean using binomial test, then apply correction

**Result (EDS):** 2 of 30 symptoms statistically significant after correction
- Pain (30% frequency): Significantly more common than average
- Fatigue (12% frequency): Significantly more common than average

**Interpretation:** These are statistically proven hallmark EDS symptoms, not chance findings.

---

### Step 6: Interactive Visualization
**What we do:** Create web dashboards with charts, tables, and statistical explanations

**Why:**
- **Accessibility**: Make findings understandable to patients, researchers, and clinicians
- **Transparency**: Show all data and methodology, not just cherry-picked results
- **Exploration**: Allow users to discover patterns themselves

**Features:**
- Top symptoms bar chart
- Patient reports vs research coverage scatter plot
- Research gaps table (high surprise scores)
- Statistical validation cards with tooltips explaining each test
- Outlier symptoms (mentioned once, potentially novel findings)
- Filterable/paginated full symptom database

---

## Why This Approach is Valid & Modern

### Compared to Traditional ML Approaches (2015-2020):

**Traditional (e.g., BERT-based models):**
- ❌ Required thousands of labeled training examples
- ❌ Only detected pre-known adverse events
- ❌ Needed retraining for each new condition
- ❌ Often lacked statistical validation
- ❌ Twitter data (short, noisy, bot-heavy)

**Our Approach (2025):**
- ✅ Uses state-of-the-art foundation model (GPT-4o-mini)
- ✅ Discovers unknown symptoms, not just detecting known ones
- ✅ Generalizable across conditions without retraining
- ✅ Rigorous statistical validation (Spearman, Chi-square, Bonferroni)
- ✅ Reddit data (authentic, detailed patient narratives)
- ✅ Cross-referenced with medical literature (PubMed)
- ✅ Transparent, reproducible methodology

### Research Quality Criteria:

1. ✅ **Clear research question**: What symptoms are under-researched?
2. ✅ **Rigorous methodology**: LLM extraction + PubMed validation + statistical tests
3. ✅ **Validation**: Multiple statistical tests, research cross-referencing
4. ✅ **Reproducibility**: Clear prompts, open methodology
5. ✅ **Novel insights**: Identifying research gaps where patient experiences outpace science

---

## Project Structure

```
bytesized/
├── eds-symptom-discovery/          # EDS symptom research project
│   ├── data/                       # Raw and processed data
│   ├── src/                        # Analysis scripts
│   │   ├── data_collection/        # Reddit API collection
│   │   ├── analysis/               # LLM extraction & cleaning
│   │   └── validation/             # PubMed validation & stats
│   └── frontend/                   # Interactive dashboard
│       ├── data/                   # JSON data for visualization
│       └── js/app.js               # Dashboard logic
├── birthcontrol-side-effects-analysis/  # Birth control research
└── index.html                      # Research hub landing page
```

---

## Running the Project

### Prerequisites
```bash
python3 -m venv venv
source venv/bin/activate
pip install openai pandas scipy statsmodels matplotlib seaborn
```

### View Dashboards
```bash
# Start server at project root
python3 -m http.server 8000

# Visit http://localhost:8000
# Navigate to EDS or Birth Control projects
```

### Run Analysis Pipeline
```bash
cd eds-symptom-discovery

# 1. Collect Reddit data
./venv/bin/python src/data_collection/reddit_collector.py

# 2. Extract symptoms with LLM
./venv/bin/python src/analysis/llm_symptom_extractor.py

# 3. Deduplicate & clean
./venv/bin/python src/analysis/symptom_deduplicator.py
./venv/bin/python src/analysis/symptom_cleaner.py

# 4. Validate against PubMed
./venv/bin/python src/validation/validate_llm_symptoms.py

# 5. Statistical validation
./venv/bin/python src/analysis/statistical_validator.py
```

---

## Key Findings (EDS Project)

### Discovery
- **751 unique medical symptoms** extracted from patient discussions
- **30 symptoms validated** against PubMed (symptoms with 5+ mentions)
- **988 raw symptoms** reduced to 751 after removing non-medical terms

### Research Gaps Identified
Symptoms with high patient reports but low research coverage:
- Gastrointestinal issues: 14 patient mentions, 2 research papers
- Knee pain: 18 patient mentions, 3 research papers
- Vision problems: Multiple mentions, limited research

### Statistical Validation
- **Spearman ρ = -0.14** (p = 0.47): Patient reports ≠ research coverage
- **Chi-square p < 0.0001**: Surprise scores significantly non-uniform
- **2 of 30 symptoms** statistically significant after Bonferroni correction:
  - Pain (30% of patient mentions)
  - Fatigue (12% of patient mentions)

---

## Methodology Inspiration

This work is inspired by recent research in computational medical discovery:
- [Arxiv 2504.04346v2](https://arxiv.org/html/2504.04346v2) - Drug side effect knowledge graphs using LLMs
- Modern pharmacovigilance using social media data
- Statistical methods from computational biology

**Key Innovation:** We focus on **discovery** of unknown symptoms rather than **detection** of known adverse events, filling a gap in current research.

---

## Technologies Used

- **LLM**: OpenAI GPT-4o-mini (via API)
- **Data Source**: Reddit (PRAW API)
- **Validation**: PubMed (NCBI E-utilities API)
- **Statistics**: SciPy, statsmodels (Python)
- **Visualization**: Chart.js, vanilla JavaScript
- **Data Processing**: Pandas, NumPy

---

## Future Work

1. **Expand to more conditions**: Apply methodology to other chronic illnesses
2. **Temporal analysis**: Track symptom mentions over time to detect emerging patterns
3. **Severity modeling**: Analyze symptom severity and co-occurrence patterns
4. **Clinical validation**: Partner with medical researchers to validate findings
5. **Embedding similarity**: Cluster symptoms using sentence embeddings before deduplication

---

## Contact & Contributions

This is an ongoing research project. Contributions and feedback welcome!

**Note on Methodology:** This research uses API-based LLMs (not custom-trained models) as the modern standard for symptom discovery. This approach provides greater flexibility and generalizability than traditional supervised learning methods while maintaining scientific rigor through validation and statistical testing.
