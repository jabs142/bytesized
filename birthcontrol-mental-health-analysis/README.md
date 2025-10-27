# Birth Control Symptom Pattern Discovery 🔬💊

An educational AI/ML project focused on discovering hidden symptom relationships and patterns in birth control experiences that clinical trials miss - using real-world data from social media.

## Project Overview

**Purpose**: Learning data mining, pattern discovery, association rule mining, and LLM application through real-world healthcare analysis

**Focus**: Comprehensive birth control symptom analysis & relationship discovery
- **Mental Health**: Depression, anxiety, mood swings, panic, brain fog
- **Physical Symptoms**: Yeast infections, acne, dryness, weight changes, hair loss
- **Temporal Patterns**: What happens during use vs. after stopping?
- **Co-occurrence Discovery**: Which symptoms appear together?
- **Post-Pill Syndrome**: Recovery timelines and patterns

**Key Innovation**: Finding symptom RELATIONSHIPS, not just frequencies
- Example: "yeast infections + dryness + long-term use" (71% confidence, 45 posts)
- Example: "post-pill acne appears 2-4 weeks after stopping" (temporal pattern)

**Data Sources**:
- Reddit (r/birthcontrol, r/PMDD, r/TwoXChromosomes, r/SkincareAddiction)
- Deduplication ensures unique posts only
- Privacy-protected (no usernames, PII removed)

**End Goal**: Build interactive knowledge graph showing symptom relationships → Educational website for people on birth control

## Learning Objectives

This project is designed to learn:

1. **Data Mining**: Reddit API usage, ethical data collection, deduplication strategies
2. **NLP Fundamentals**: Text preprocessing, tokenization, entity extraction, n-grams
3. **Pattern Discovery**: Association rule mining (Apriori algorithm), co-occurrence analysis
4. **Temporal Analysis**: Timeline extraction, sequence pattern mining
5. **Network Analysis**: Symptom relationship graphs, community detection
6. **LLM Application**: Using Claude/GPT for structured information extraction
7. **Knowledge Graphs**: Interactive visualization of symptom relationships

## Project Structure

```
birthcontrol-mental-health-analysis/
├── data/
│   ├── raw/              # Raw collected data (not in git)
│   ├── processed/        # Cleaned and preprocessed data
│   └── interim/          # Intermediate processing steps
├── notebooks/            # Jupyter notebooks for exploration
│   └── 01_exploratory_data_analysis.ipynb
├── src/
│   ├── data_collection/  # Data collection scripts
│   │   └── reddit_collector.py
│   ├── preprocessing/    # Text cleaning and preprocessing
│   │   └── text_cleaner.py
│   ├── analysis/         # Analysis scripts (future)
│   └── config.py         # Configuration management
├── outputs/
│   ├── visualizations/   # Plots and charts
│   └── reports/          # Analysis reports
├── docs/                 # Documentation
├── tests/                # Unit tests
├── requirements.txt      # Python dependencies
├── .env.example          # Example environment variables
└── README.md            # This file
```

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Reddit account (for API access)
- Git

### Step 1: Clone and Navigate

```bash
cd birthcontrol-mental-health-analysis
```

### Step 2: Create Virtual Environment

**Recommended**: Use a virtual environment to isolate dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- `praw` - Reddit API wrapper
- `pandas`, `numpy` - Data manipulation
- `nltk`, `spacy` - NLP tools
- `openai`, `anthropic` - LLM APIs (for later)
- `jupyter` - Notebook environment
- And more...

### Step 4: Set Up Reddit API Credentials

1. **Get Reddit API credentials**:
   - Go to https://www.reddit.com/prefs/apps
   - Click "Create App" or "Create Another App"
   - Select "script" as the app type
   - Fill in:
     - Name: "birthcontrol_research" (or any name)
     - Description: "Educational research project"
     - Redirect URI: http://localhost:8080
   - Click "Create app"
   - Note your `client_id` (under the app name) and `client_secret`

2. **Create your `.env` file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your credentials**:
   ```
   REDDIT_CLIENT_ID=your_client_id_here
   REDDIT_CLIENT_SECRET=your_client_secret_here
   REDDIT_USER_AGENT=birthcontrol_research_bot/1.0 by YourRedditUsername
   ```

   Replace:
   - `your_client_id_here` with your actual client ID
   - `your_client_secret_here` with your actual client secret
   - `YourRedditUsername` with your Reddit username

### Step 5: Test Your Setup

```bash
# Test Reddit connection
python src/data_collection/reddit_collector.py
```

If successful, this will collect ~100 posts from each target subreddit.

### Step 6: Explore the Data

```bash
# Start Jupyter notebook server
jupyter notebook

# Open: notebooks/01_exploratory_data_analysis.ipynb
```

## Usage Guide

### Collecting Data

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

### Cleaning Data

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

Navigate to `notebooks/` and run the analysis notebooks in order.

## Ethical Considerations

This project follows ethical data collection and analysis practices:

### Privacy Protection
- **No PII Collection**: We do NOT collect usernames or identifying information
- **Anonymization**: All data is anonymized before storage
- **PII Removal**: Automated removal of emails, phone numbers, etc.
- **Public Data Only**: Only publicly available Reddit posts

### Responsible Use
- **Educational Purpose**: This is a learning project, not medical research
- **No Medical Advice**: We analyze patterns, we don't provide medical guidance
- **Respectful Collection**: Rate-limited API calls, no scraping
- **Data Security**: `.gitignore` prevents accidental data commits

### Research Ethics
- **Transparency**: Clear documentation of methods
- **Reproducibility**: All code and methods are documented
- **Limitations**: We acknowledge biases in social media data
- **No Harm**: Focus on understanding, not identifying individuals

## Learning Resources

### Reddit API & PRAW
- [PRAW Documentation](https://praw.readthedocs.io/)
- [Reddit API Rules](https://www.reddit.com/wiki/api)

### NLP & Text Mining
- [NLTK Book](https://www.nltk.org/book/)
- [spaCy Course](https://course.spacy.io/)

### LLM APIs
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Anthropic Documentation](https://docs.anthropic.com/)

### Data Science
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Python Data Science Handbook](https://jakevdp.github.io/PythonDataScienceHandbook/)

## Phase Roadmap

### ✅ Phase 1: Setup & Data Collection
- [x] Project structure
- [x] Reddit data collection with rate limiting
- [x] Ethical data handling & PII removal
- [x] Exploratory data analysis

### 🔬 Phase 2: Pattern Mining (Current)
- [ ] Expand symptom detection (mental + physical)
- [ ] Deduplication in data collection
- [ ] Association rule mining (Apriori)
- [ ] Temporal pattern extraction
- [ ] Network analysis of symptom relationships
- [ ] Co-occurrence heatmaps

### 🔮 Phase 3: LLM-Based Enhancement
- [ ] Prompt engineering for symptom extraction
- [ ] Context extraction (duration, timing, user profile)
- [ ] Sentiment analysis
- [ ] Structured data export

### 🕸️ Phase 4: Knowledge Graph & Visualization
- [ ] Interactive symptom relationship network
- [ ] Timeline visualizations (Sankey diagrams)
- [ ] "Similar experiences" search feature
- [ ] Export for React website

### 📱 Phase 5: Educational Website
- [ ] React frontend with data visualizations
- [ ] Symptom pattern explorer
- [ ] Educational disclaimers
- [ ] Deploy to Vercel

## Common Issues & Troubleshooting

### "Reddit credentials not found"
- Make sure you created `.env` file (not `.env.example`)
- Check that your credentials are correct
- Verify no extra spaces in the `.env` file

### "ImportError" or "ModuleNotFoundError"
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version (needs 3.9+)

### "Rate limit exceeded"
- Reddit API has rate limits
- Increase `RATE_LIMIT_DELAY` in `.env`
- Wait a few minutes before retrying

### Data collection returns 0 posts
- Check your search keywords
- Try different time filters ('year' vs 'all')
- Verify subreddit names are correct

## Contributing

This is a personal learning project, but suggestions and feedback are welcome!

## Disclaimer

**This is an educational project for learning AI/ML techniques.**

- Not medical research or advice
- Not approved by IRB or ethics board
- Social media data has inherent biases
- Results should not be used for medical decision-making
- Always consult healthcare professionals for medical concerns

## License

Educational use only. Please respect privacy and ethical guidelines when using this code.

## Acknowledgments

- Reddit communities for publicly sharing their experiences
- Open source NLP and ML tools