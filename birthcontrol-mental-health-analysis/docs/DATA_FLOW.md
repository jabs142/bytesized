# Data Flow: Where Comments Are Saved

## The Complete Journey of Your Data

```
Reddit API
    ↓
[1] reddit_collector.py collects data
    ↓
[2] _extract_post_data() structures it
    ↓
[3] _extract_top_comments() gets comments
    ↓
[4] save_posts() writes JSON file
    ↓
data/raw/reddit_mental_health_posts_TIMESTAMP.json
    ↓
[Later] Loaded by Jupyter notebook for analysis
```

---

## Storage Details

### **Where are comments saved?**

**Location**: `data/raw/reddit_mental_health_posts_YYYYMMDD_HHMMSS.json`

**Format**: Raw JSON (no processing yet)

**Structure**:
```json
[
  {
    "id": "abc123",
    "title": "Depression from IUD",
    "selftext": "I've been feeling terrible...",
    "score": 45,
    "num_comments": 12,
    "top_comments": [                    ← HERE!
      {
        "id": "comment1",
        "text": "I experienced the same thing...",
        "score": 15,
        "created_utc": 1234567890
      },
      {
        "id": "comment2",
        "text": "Have you talked to your doctor?",
        "score": 8,
        "created_utc": 1234567891
      }
    ]
  },
  {
    "id": "def456",
    "title": "Another post...",
    "top_comments": [...]
  }
]
```

---

## Raw vs. Processed

### **Currently: RAW DATA** 🥩

Comments are saved **exactly as extracted** from Reddit:
- ✅ Original text (no cleaning)
- ✅ Original score
- ✅ Timestamp
- ❌ NOT cleaned (still has URLs, special chars)
- ❌ NOT filtered (all scores included)
- ❌ NOT analyzed (no sentiment, entities extracted)

### **Later: PROCESSED DATA** 🍳

After preprocessing (`text_cleaner.py`), we'll create:

**Location**: `data/processed/cleaned_posts.json`

**Changes**:
```json
{
  "id": "abc123",
  "title": "Depression from IUD",
  "selftext": "I've been feeling terrible",  ← Cleaned!
  "top_comments": [
    {
      "text": "I experienced the same thing",  ← PII removed
      "score": 15,
      "cleaned": true  ← Metadata added
    }
  ]
}
```

---

## Why Keep Raw + Processed Separate?

### **Raw data** (`data/raw/`):
- ✅ Original source of truth
- ✅ Can re-process differently later
- ✅ Backup if processing goes wrong

### **Processed data** (`data/processed/`):
- ✅ Ready for analysis
- ✅ Privacy-safe (PII removed)
- ✅ Cleaner, faster to work with

**Best practice**: NEVER delete raw data, always keep it!

---

## Example: Full Data Lifecycle

```python
# Step 1: Collection (raw)
collector.search_subreddit('birthcontrol', ['depression'])
# Saves: data/raw/reddit_mental_health_posts_20231027_143000.json

# Step 2: Cleaning (processed)
cleaner = TextCleaner()
cleaned = cleaner.clean_dataset(raw_posts)
# Saves: data/processed/cleaned_posts_20231027.json

# Step 3: Analysis (interim)
# Extract entities, sentiment, etc.
# Saves: data/interim/extracted_entities.json

# Step 4: Final output (outputs/)
# Visualizations, reports, insights
# Saves: outputs/reports/analysis_summary.pdf
```

---

## How to Find Your Saved Data

```bash
# List all collected data files
ls -lh data/raw/

# View the most recent file
cat data/raw/reddit_mental_health_posts_*.json | head -100

# Count posts in a file
python -c "import json; print(len(json.load(open('data/raw/reddit_mental_health_posts_20231027_143000.json'))))"

# Check if comments are included
python -c "import json; data = json.load(open('data/raw/reddit_mental_health_posts_20231027_143000.json')); print('Has comments:', 'top_comments' in data[0])"
```
