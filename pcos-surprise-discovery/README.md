# PCOS Surprising Symptom Discovery Tool

AI-powered discovery of unexpected PCOS symptom connections that doctors rarely mention.

## Mission

PCOS affects 10% of women but doctors often focus only on obvious symptoms (irregular periods, fertility). This tool uses LLM to **discover** which symptoms women actually discuss, then identifies which ones are surprisingly connected to PCOS but rarely acknowledged.

## Key Innovation

- **Organic Discovery**: No predefined keyword lists - let LLM discover symptoms naturally
- **Surprise Factor**: Calculate which symptoms are strongly associated but rarely discussed
- **Actionable**: Show what treatments actually helped real patients
- **Efficient**: Only 500 posts, validate top 30 symptoms

## Project Structure

```
pcos-surprise-discovery/
├── data/
│   ├── raw/                    # Reddit posts (500)
│   ├── processed/              # Extracted symptoms & solutions
│   ├── validated/              # PubMed validation & surprise scores
│   ├── patterns/               # Association rules & clusters
│   └── official/               # PCOS diagnostic criteria
├── src/
│   ├── data_collection/        # Reddit & criteria collection
│   ├── analysis/               # LLM extraction & aggregation
│   └── validation/             # PubMed validation & scoring
├── notebooks/                  # Jupyter analysis notebooks
├── frontend/                   # Mobile-first web interface
└── docs/                       # Documentation
```

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
OPENAI_API_KEY=your_openai_api_key
NCBI_EMAIL=your_email@example.com
```

### 3. Run Complete Pipeline

```bash
# PHASE 1: Data Collection
python src/data_collection/reddit_collector.py           # Collect 500 posts
python src/data_collection/extract_official_criteria.py  # Extract diagnostic criteria

# PHASE 2: LLM Discovery
python src/analysis/llm_symptom_extractor.py             # Extract all symptoms
python src/analysis/llm_solution_extractor.py            # Extract treatments
python src/analysis/symptom_aggregator.py                # Aggregate & count

# PHASE 3: Surprise Analysis
python src/analysis/top_symptom_selector.py              # Select top 30
python src/validation/pubmed_validator.py                # Validate with PubMed
python src/validation/surprise_score_calculator.py       # Calculate surprise scores
```

## Pipeline Overview

### Phase 1: Data Collection

**Reddit Collection** - 500 posts from 4 subreddits:
- r/PCOS (300 posts)
- r/PCOSloseit (100 posts)
- r/Hirsutism (50 posts)
- r/TwoXChromosomes (50 posts with "PCOS" search)

**Official Criteria** - Baseline for what's "expected":
- Rotterdam Criteria
- NIH Criteria

### Phase 2: LLM-Powered Discovery

**Symptom Extraction** - GPT-4o-mini extracts ALL symptoms mentioned:
- Physical symptoms (specific locations: "knee pain", not just "pain")
- Mental health symptoms
- Skin issues
- Cognitive issues
- **Surprise signals**: When patients say "didn't know" or "surprising"

**Solution Extraction** - What helped:
- Medications (dosage, timeframe, effectiveness)
- Supplements
- Lifestyle changes
- Side effects mentioned

**Aggregation** - Combine all findings:
- Count frequencies
- Track surprise signals
- Categorize symptoms

### Phase 3: Surprise Factor Calculation

**Top 30 Selection** - Focus validation efforts:
- Mentioned in 5%+ of posts (25+)
- OR high surprise signal count (20+)

**PubMed Validation** - Check medical literature:
- Search: "PCOS [symptom]"
- Extract: Paper count, prevalence rates
- Last 10 years only

**Surprise Score** - Calculate unexpectedness:

```python
score = base_frequency * 10

if not in_diagnostic_criteria:
    score *= 2.0      # Not used for diagnosis
if low_public_awareness:
    score *= 1.5      # Rarely discussed
if high_surprise_signals:
    score *= 1.3      # Patients express surprise
if research_validated:
    score *= 1.1      # Has research backing
```

**Classification**:
- 🔥 **VERY SURPRISING** (score > 2.0): Hidden connection
- ⚠️ **SOMEWHAT SURPRISING** (score > 1.0): Underappreciated
- ✓ **EXPECTED**: Known PCOS symptom

**Evidence Tiers**:
- **Tier 1**: In diagnostic criteria
- **Tier 2**: Research-backed (PubMed papers)
- **Tier 3**: Strong patient signal (high Reddit mentions)
- **Tier 4**: Emerging pattern

### Phase 4: Pattern Mining (Coming Soon)

- Association rules for symptom clusters
- Treatment effectiveness rankings
- Co-occurrence analysis

### Phase 5: Web Interface (Coming Soon)

- Mobile-first design
- Symptom input with checkboxes
- Surprising connections highlighted
- Treatment success rates

## Expected Output

After running the pipeline, you'll have:

1. **Top 10 Most Surprising Symptoms**
   - Sleep apnea (🔥 VERY SURPRISING, score: 3.2)
   - Skin tags (🔥 VERY SURPRISING, score: 2.8)
   - ...

2. **Evidence Summary**
   - Reddit mentions
   - Surprise signal count
   - PubMed papers found
   - Patient quotes

3. **Treatment Rankings**
   - What helped most
   - Success rates
   - Timeframes

## API Costs (Estimated)

- **Reddit API**: Free
- **OpenAI GPT-4o-mini**: ~$2-3 for 500 posts (input + output)
- **PubMed API**: Free
- **Total**: ~$2-3 per complete run

## Methodology

Based on your existing EDS & Birth Control projects:

1. ✅ LLM-based symptom extraction (not keyword matching)
2. ✅ Cross-validation with medical literature (PubMed)
3. ✅ Statistical rigor
4. ✅ Patient-centered (authentic narratives from Reddit)
5. ✅ Reproducible & transparent

**New Innovation**: Surprise factor calculation to identify hidden connections!

## Technologies

- **Python 3.12+**
- **OpenAI GPT-4o-mini** - Symptom extraction
- **Reddit API (PRAW)** - Data collection
- **PubMed (Biopython)** - Medical validation
- **Pandas, NumPy** - Data processing
- **SciPy, statsmodels** - Statistical analysis

## Next Steps

1. Run the pipeline with your API keys
2. Review top surprising symptoms
3. Validate findings against medical knowledge
4. Build web interface for patient exploration
5. Consider expanding to other conditions (endometriosis, etc.)

## Research Applications

- **For Patients**: Discover symptoms they didn't know were related
- **For Doctors**: Learn what patients actually experience
- **For Researchers**: Identify research gaps where patient experience outpaces science

## License

For educational and research purposes.

## Contact

Built by someone with pharmacy degree + SWE experience, learning modern AI research methods.

---

**Note**: This tool discovers patterns in patient discussions, not medical advice. Always consult healthcare providers.
