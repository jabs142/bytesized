# Quick Start Guide 🚀

Get up and running in 15 minutes!

## Prerequisites Checklist

- [ ] Python 3.9+ installed
- [ ] pip installed
- [ ] Reddit account created
- [ ] Text editor or IDE ready

## 5-Step Setup

### 1️⃣ Create Virtual Environment (2 min)

```bash
cd birthcontrol-mental-health-analysis
python -m venv venv
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows
```

You should see `(venv)` in your terminal prompt.

### 2️⃣ Install Dependencies (3 min)

```bash
pip install -r requirements.txt
```

Wait for all packages to install. Grab a coffee! ☕

### 3️⃣ Get Reddit API Credentials (5 min)

1. Go to: https://www.reddit.com/prefs/apps
2. Click **"Create App"** (bottom of page)
3. Fill in:
   - **name**: `birthcontrol_research`
   - **App type**: Select **"script"**
   - **description**: `Educational ML project`
   - **about url**: (leave blank)
   - **redirect uri**: `http://localhost:8080`
4. Click **"Create app"**
5. **Save these values**:
   - **client_id**: The string under "personal use script" (14 characters)
   - **client_secret**: The string next to "secret" (27 characters)

### 4️⃣ Configure Environment (2 min)

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your favorite editor
nano .env
# OR
code .env
# OR
vim .env
```

Replace these values:
```
REDDIT_CLIENT_ID=paste_your_client_id_here
REDDIT_CLIENT_SECRET=paste_your_client_secret_here
REDDIT_USER_AGENT=birthcontrol_research_bot/1.0 by YourRedditUsername
```

**Replace** `YourRedditUsername` with your actual Reddit username.

Save and close the file.

### 5️⃣ Test It! (3 min)

```bash
python src/data_collection/reddit_collector.py
```

You should see:
```
✓ Connected to Reddit as: Read-Only User

📊 Searching r/birthcontrol for: (depression OR anxiety OR mood...)
   Limit: 100 posts | Time: year
r/birthcontrol: 100%|████████████| 100/100
✓ Collected 100 posts from r/birthcontrol
...
```

If you see errors, check [Troubleshooting](#troubleshooting) below.

## First Data Exploration

Now that you have data, let's explore it!

```bash
# Start Jupyter
jupyter notebook
```

This will open your browser. Navigate to:
```
notebooks/ → 01_exploratory_data_analysis.ipynb
```

Click **"Run"** → **"Run All Cells"**

Watch as the analysis runs! You'll see:
- Data loading and inspection
- Statistical summaries
- Visualizations
- Word frequency analysis
- Mental health term counts

## What You Just Built

Congratulations! You've:
- ✅ Set up a complete ML/AI project structure
- ✅ Collected real-world data from Reddit
- ✅ Applied ethical data handling (PII removal)
- ✅ Performed exploratory data analysis
- ✅ Created visualizations

## Next Learning Steps

### Learn Data Collection
1. Open `src/data_collection/reddit_collector.py`
2. Read the comments - they explain each concept
3. Try modifying:
   - Keywords: Add "pmdd", "emotional"
   - Max posts: Change to 200
   - Time filter: Try 'month' or 'week'

### Learn Text Processing
1. Open `src/preprocessing/text_cleaner.py`
2. Understand PII removal patterns
3. Try adding new patterns:
   - URLs
   - Medical record numbers
   - Dates

### Learn Data Analysis
1. Open the Jupyter notebook
2. Modify visualizations
3. Add new analyses:
   - Average words per post
   - Posts by day of week
   - Most engaged posts

## Troubleshooting

### Python version error
```bash
python --version  # Check version
```
Needs to be 3.9 or higher. If not, install Python 3.9+

### Virtual environment not activating
```bash
# Try absolute path
/full/path/to/venv/bin/activate
```

### "Reddit credentials not found"
- Did you copy `.env.example` to `.env`?
- Did you save the file after editing?
- Are there any spaces before/after the `=` sign?

### "401 Unauthorized" error
- Double-check your `client_id` and `client_secret`
- Make sure there are no extra spaces
- Verify you selected "script" as app type

### No posts collected (0 posts)
- The keywords might be too specific
- Try changing `time_filter='all'` in the script
- Check if the subreddit exists and is public

### Import errors after pip install
- Make sure virtual environment is activated (`(venv)` in prompt)
- Try: `pip install --upgrade pip` then reinstall requirements

### Jupyter notebook won't start
```bash
# Install/reinstall Jupyter
pip install --upgrade jupyter

# If port 8888 is busy
jupyter notebook --port 8889
```

## Customization Ideas

### Collect from different subreddits
Edit `reddit_collector.py`, line ~220:
```python
subreddits = [
    'birthcontrol',
    'PMDD',
    'Endo',              # NEW
    'WomensHealth'       # NEW
]
```

### Change keywords
Edit `reddit_collector.py`, line ~195:
```python
mental_health_keywords = [
    'depression',
    'anxiety',
    'insomnia',          # NEW
    'fatigue',           # NEW
    'weight gain'        # NEW
]
```

### Collect more posts
Edit `.env`:
```
MAX_POSTS_PER_SUBREDDIT=200
```

**Warning**: More posts = longer collection time + more API calls

## Understanding the Code

### Where to start reading?
1. **Easiest**: `src/config.py` - Simple configuration
2. **Core logic**: `src/data_collection/reddit_collector.py`
3. **Privacy**: `src/preprocessing/text_cleaner.py`
4. **Analysis**: `notebooks/01_exploratory_data_analysis.ipynb`

### Key concepts in the code
- **API Authentication**: How to connect to Reddit API
- **Rate Limiting**: Being respectful to API servers
- **Data Structuring**: Converting API responses to usable format
- **PII Removal**: Regex patterns for privacy protection
- **EDA**: Statistical analysis and visualization

## Getting Help

### Understanding a concept?
- Read the code comments - they explain ML/AI concepts
- Each function has a docstring explaining what it does
- Look for "LEARNING:" comments for educational notes

### Error messages?
1. Read the full error message
2. Check which file and line number
3. Look at that code section
4. Check Troubleshooting section above

### Want to learn more?
- Check `README.md` for learning resources
- Comments in code explain concepts as you go
- Jupyter notebook has educational cells

## What's Next?

After completing this guide, you can:

1. **Phase 2: Text Processing**
   - Learn tokenization
   - Try named entity recognition (NER)
   - Extract drug names and symptoms

2. **Phase 3: LLM Integration**
   - Set up Claude or OpenAI API
   - Create extraction prompts
   - Parse structured data from text

3. **Phase 4: Advanced Analysis**
   - Sentiment analysis
   - Topic modeling
   - Statistical patterns

4. **Phase 5: Knowledge Graphs**
   - Install Neo4j
   - Model relationships
   - Create graph visualizations

## Tips for Learning

1. **Start small**: Collect 100 posts first, not 10,000
2. **Read comments**: The code is heavily documented for learning
3. **Experiment**: Change one thing at a time and see what happens
4. **Break things**: It's okay! That's how you learn
5. **Ask questions**: Use the code comments to understand why, not just what

---

Happy learning! You're now ready to explore AI/ML with real-world data! 🎉
