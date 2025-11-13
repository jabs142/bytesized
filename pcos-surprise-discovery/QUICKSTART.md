# PCOS Surprise Discovery - Quick Start Guide

Get up and running in 5 minutes!

## 1. Setup (2 minutes)

```bash
cd pcos-surprise-discovery

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 2. Configure API Keys (2 minutes)

```bash
# Copy example file
cp .env.example .env

# Edit .env with your keys
nano .env  # or use your favorite editor
```

Add your credentials:

```
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USER_AGENT=PCOS_Research_v1.0
OPENAI_API_KEY=sk-your_key_here
NCBI_EMAIL=your_email@example.com
```

**Where to get API keys:**

- **Reddit**: https://www.reddit.com/prefs/apps (create a "script" app)
- **OpenAI**: https://platform.openai.com/api-keys
- **NCBI**: Just use your email (no signup needed)

## 3. Run Pipeline (1 minute to start, ~15 minutes total)

### Option A: Run Complete Pipeline

```bash
./run_pipeline.sh
```

This runs all phases automatically:

1. Collects 500 Reddit posts (3-5 min)
2. Extracts symptoms with LLM (5-7 min)
3. Validates top 30 with PubMed (5-10 min)
4. Calculates surprise scores (instant)

### Option B: Run Step-by-Step

```bash
# Test configuration first
python src/config.py

# Phase 1: Data Collection
python src/data_collection/reddit_collector.py
python src/data_collection/extract_official_criteria.py

# Phase 2: LLM Discovery
python src/analysis/llm_symptom_extractor.py
python src/analysis/llm_solution_extractor.py
python src/analysis/symptom_aggregator.py

# Phase 3: Surprise Analysis
python src/analysis/top_symptom_selector.py
python src/validation/pubmed_validator.py
python src/validation/surprise_score_calculator.py
```

### Option C: Use Jupyter Notebooks

```bash
jupyter notebook notebooks/01_data_collection.ipynb
```

## 4. View Results

```bash
# Top surprising symptoms
cat data/validated/surprise_rankings.json | head -50

# All discovered symptoms
cat data/processed/all_symptoms_discovered.json | head -20

# Treatment solutions
cat data/processed/solutions_discovered.json | head -20
```

Or open in your favorite JSON viewer!

## Expected Costs

- **Reddit API**: Free
- **OpenAI GPT-4o-mini**: ~$2-3 total (very cheap!)
- **PubMed API**: Free

Total: ~$2-3 per complete run

## What You'll Get

After running, you'll have:

1. **500 Reddit posts** about PCOS experiences
2. **All symptoms discovered** organically (no predefined lists!)
3. **Top 30 symptoms** selected for validation
4. **PubMed validation** for each symptom
5. **Surprise scores** - which symptoms are hidden connections
6. **Treatment rankings** - what actually helped people

## Output Files Structure

```
data/
├── raw/
│   └── reddit_pcos_posts.json          # 500 collected posts
├── official/
│   └── pcos_criteria.json              # Diagnostic criteria baseline
├── processed/
│   ├── all_symptoms_discovered.json    # All symptoms from LLM
│   ├── solutions_discovered.json       # Treatment mentions
│   ├── surprise_signals.json           # Patient surprise quotes
│   └── top_30_symptoms.json            # Selected for validation
└── validated/
    ├── pubmed_validated_symptoms.json  # With research papers
    └── surprise_rankings.json          # THE MAIN OUTPUT! ⭐
```

## Understanding Surprise Rankings

Open `data/validated/surprise_rankings.json` to see:

```json
{
  "symptom": "sleep_apnea",
  "surprise_classification": "🔥 VERY SURPRISING",
  "surprise_score": 3.2,
  "tier": 2,
  "tier_label": "Tier 2: Research-backed",
  "evidence": {
    "reddit_mentions": 178,
    "reddit_frequency": 0.36,
    "surprise_signals": 67,
    "pubmed_papers": 8,
    "has_research": true,
    "awareness_level": "low"
  }
}
```

**Classifications:**

- 🔥 **VERY SURPRISING** (score > 2.0): Hidden connection doctors rarely mention
- ⚠️ **SOMEWHAT SURPRISING** (score > 1.0): Underappreciated connection
- ✓ **EXPECTED**: Known PCOS symptom

## Troubleshooting

### "Reddit credentials not found"

- Make sure you created a Reddit app at https://www.reddit.com/prefs/apps
- App type should be "script"
- Copy client ID and secret to .env

### "OpenAI API key not found"

- Get key from https://platform.openai.com/api-keys
- Add $5 credit if new account
- Paste into .env file

### "Rate limit exceeded"

- Reddit API: Wait 1 minute, then retry
- OpenAI API: You may need to add more credits
- PubMed API: Increase RATE_LIMIT_DELAY in config

### "No module named 'praw'"

- Make sure virtual environment is activated: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`

## Next Steps

1. **Explore Results**: Open `data/validated/surprise_rankings.json`
2. **Visualize**: Run Jupyter notebooks for charts
3. **Phase 4**: Association rules mining (coming soon)
4. **Phase 5**: Build web interface (coming soon)

## Research Notes

This project follows your established methodology:

- ✅ LLM-based extraction (not keyword matching)
- ✅ PubMed validation
- ✅ Statistical rigor
- ✅ Patient-centered approach

**New Innovation**: Surprise factor calculation to identify hidden symptom
connections!

## Questions?

Check the full README.md for detailed documentation.

---

**Happy discovering!** Let's find what doctors never mention about PCOS.
