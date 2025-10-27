# Birth Control Mental Health Analysis 🧠💊

An educational AI/ML project focused on extracting and analyzing information about mental health side effects of hormonal birth control from social media and online sources.

## Project Overview

**Purpose**: Learning data mining, NLP, and LLM application through a real-world healthcare research project

**Focus**: Mental health and mood-related side effects of hormonal birth control
- Depression, anxiety, mood swings
- Emotional changes and psychological effects
- Under-counseled or rare side effects

**Data Sources**:
- Reddit (r/birthcontrol, r/PMDD, r/TwoXChromosomes)
- Patient information leaflets (future)
- Online drug reviews (future)

**End Goal**: Extract structured data → Analyze patterns → Build knowledge graph

## Learning Objectives

This project is designed to teach:

1. **Data Mining**: Web scraping, API usage, ethical data collection
2. **NLP Fundamentals**: Text preprocessing, tokenization, entity extraction
3. **LLM Application**: Using Claude/GPT for information extraction
4. **Data Analysis**: Pattern recognition, statistical analysis
5. **Knowledge Graphs**: Relationship mapping (later phase)

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

### ✅ Phase 1: Setup & Data Collection (Current)
- [x] Project structure
- [x] Reddit data collection
- [x] Ethical data handling
- [x] Exploratory data analysis

### 📋 Phase 2: Text Processing & NLP
- [ ] Advanced text preprocessing
- [ ] Named Entity Recognition (NER) for drug names
- [ ] Symptom extraction
- [ ] Temporal expression extraction

### 🔮 Phase 3: LLM-Based Extraction
- [ ] Prompt engineering for extraction
- [ ] LLM API integration (Claude/GPT)
- [ ] Structured data extraction
- [ ] Entity relationship extraction

### 📊 Phase 4: Analysis & Patterns
- [ ] Statistical analysis of side effects
- [ ] Frequency and co-occurrence analysis
- [ ] Sentiment analysis
- [ ] Timeline analysis

### 🕸️ Phase 5: Knowledge Graph
- [ ] Graph database setup (Neo4j)
- [ ] Entity relationship modeling
- [ ] Graph population
- [ ] Graph queries and visualization

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

## Contact

Questions about the project? Check the code comments - they're designed to teach!

## Acknowledgments

- Reddit communities for publicly sharing their experiences
- Open source NLP and ML tools
- Healthcare professionals who inspired this learning project

---

**Remember**: This is about learning AI/ML techniques, not making medical claims. Always prioritize ethics, privacy, and responsible data use! 🌟
