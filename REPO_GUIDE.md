# ByteSized Research - Repository Guide

> **Your blueprint for creating new "cartridge" projects with consistency and
> speed**

Last Updated: November 13, 2025

---

## Table of Contents

1. [Repository Architecture](#repository-architecture)
2. [Starting a New Cartridge](#starting-a-new-cartridge)
3. [Decision Tree: What Type of Cartridge?](#decision-tree-what-type-of-cartridge)
4. [Required Components](#required-components)
5. [Project Structure Templates](#project-structure-templates)
6. [Best Practices](#best-practices)
7. [Style Enforcement](#style-enforcement)
8. [Testing Guidelines](#testing-guidelines)
9. [Deployment Checklist](#deployment-checklist)
10. [Common Patterns](#common-patterns)
11. [Troubleshooting](#troubleshooting)

---

## Repository Architecture

### High-Level Structure

```
bytesized/
├── index.html                    # Main Game Boy portal
├── STYLE_GUIDE.md                # Design system (READ THIS FIRST!)
├── REPO_GUIDE.md                 # This file - scaffolding guide
├── requirements.txt              # Consolidated Python dependencies
├── package.json                  # Frontend dev server
│
├── shared/                       # Shared component library
│   ├── components/               # Web Components (EjectButton, StatCard)
│   ├── styles/                   # CSS variables, retro theme
│   └── utils/                    # JavaScript utilities (dataLoader, formatters)
│
└── [YOUR-CARTRIDGE-NAME]/        # Individual projects
    ├── src/                      # Python data analysis (optional)
    ├── data/                     # Data pipeline (optional)
    ├── frontend/                 # Visualization layer (required)
    └── README.md
```

### Key Principles

1. **Shared First**: Always use `shared/` components and utilities
2. **Style Consistency**: Follow `STYLE_GUIDE.md` - Game Boy retro theme
3. **Dependency Alignment**: Use root `requirements.txt` versions
4. **No Duplication**: Don't recreate what's in `shared/`

---

## Starting a New Cartridge

### Quick Start (5 minutes)

```bash
# 1. Copy the template
cp -r template-cartridge my-new-cartridge

# 2. Update cartridges.json
vim data/cartridges.json
# Add your cartridge entry

# 3. Start coding!
cd my-new-cartridge/frontend
python3 -m http.server 8000
```

### Detailed Setup

**Step 1: Name Your Cartridge**

- Use kebab-case: `birth-control-analysis` ✅ not `BirthControlAnalysis` ❌
- Be descriptive but concise
- Check `data/cartridges.json` for existing names

**Step 2: Choose Your Template Type**

- See [Decision Tree](#decision-tree-what-type-of-cartridge) below

**Step 3: Initialize Git Ignore**

```bash
# Already included in template, but verify:
cat .gitignore
# Should exclude: data/, .env, __pycache__, etc.
```

**Step 4: Configure Environment**

```bash
# If using Python analysis:
cp .env.example .env
# Add your API keys (OPENAI_API_KEY, REDDIT_CLIENT_ID, etc.)
```

**Step 5: Install Dependencies**

```bash
# Python (if needed):
pip install -r ../requirements.txt

# Frontend dev server (root level):
npm install
npm start
```

---

## Decision Tree: What Type of Cartridge?

### Question 1: Do I need data collection/analysis?

**YES → Full-Stack Cartridge**

- Examples: Birth Control, PCOS, Pharmaceutical Clusters, EDS
- Structure: Python analysis → JSON export → Frontend viz
- Go to: [Full-Stack Template](#full-stack-template)

**NO → Frontend-Only Cartridge**

- Examples: Evolution of Invention, Heart Story
- Structure: Interactive visualization or game
- Go to: [Frontend-Only Template](#frontend-only-template)

### Question 2: What kind of visualization?

**Interactive Dashboard**

- Multiple charts, filters, data tables
- Examples: Birth Control, PCOS, Pharmaceutical Clusters
- Tech: HTML + CSS + vanilla JS (or D3.js for charts)

**Scrollytelling Narrative**

- Story-driven, scroll-triggered animations
- Example: COVID Timeline
- Tech: Scrollama.js + D3.js

**Interactive Game**

- Player controls, game mechanics
- Examples: Evolution, Heart Story
- Tech: Phaser.js or vanilla canvas

### Question 3: What data source?

**Reddit Posts**

- Use `praw` library
- Pattern: `src/data_collection/reddit_collector.py`
- Examples: Birth Control, PCOS, EDS

**Public APIs**

- FDA, PubMed, government data
- Pattern: `src/data_collection/api_collector.py`
- Example: Pharmaceutical Clusters (FDA OpenFDA API)

**Static Dataset**

- CSV, JSON files
- No Python analysis needed
- Example: COVID (pre-processed WHO data)

---

## Required Components

### Every Cartridge MUST Have:

#### 1. Eject Button

```html
<head>
  <!-- REQUIRED: Load shared component -->
  <script src="/shared/components/EjectButton.js"></script>
</head>
<body>
  <!-- REQUIRED: Add eject button -->
  <eject-button></eject-button>

  <!-- For dark theme projects (e.g., COVID): -->
  <eject-button theme="dark"></eject-button>
</body>
```

#### 2. Press Start 2P Font

```html
<head>
  <!-- REQUIRED: Google Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
    rel="stylesheet"
  />
</head>
```

#### 3. CSS Variables (Game Boy Theme)

```css
/* Import shared variables */
@import '/shared/styles/variables.css';

/* Use variables in your styles */
body {
  background: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-body);
}

h1 {
  font-family: var(--font-pixel);
  font-size: var(--text-h1);
  color: var(--gb-dark);
}
```

#### 4. README.md

```markdown
# Your Cartridge Name

> One-sentence description

## What's Built

- Key features
- Data sources
- Methodology

## Data Pipeline (if applicable)

\`\`\` raw → processed → analyzed → validated → frontend \`\`\`
```

#### 5. Entry in Portal

```json
// /data/cartridges.json
{
  "id": "your-cartridge-slug",
  "title": "Your Cartridge Title",
  "description": "One sentence description shown on portal",
  "color": "#8bac0f", // Game Boy green or pastel from STYLE_GUIDE
  "path": "/your-cartridge-name/frontend/index.html",
  "status": "active"
}
```

---

## Project Structure Templates

### Full-Stack Template

**Use when:** You need Reddit/API data collection + LLM analysis + PubMed
validation

```
my-cartridge/
├── README.md
├── .env.example
├── .gitignore
├── requirements.txt              # "See root /requirements.txt + extras below"
│
├── src/
│   ├── config.py                 # Load .env, manage paths
│   ├── data_collection/
│   │   ├── reddit_collector.py   # Collect from Reddit
│   │   └── api_collector.py      # Collect from APIs
│   ├── analysis/
│   │   ├── llm_extractor.py      # GPT/Claude for unbiased extraction
│   │   └── aggregator.py         # Deduplicate, aggregate patterns
│   └── validation/
│       ├── pubmed_validator.py   # Cross-reference with research
│       └── surprise_scorer.py    # Calculate "surprise" metrics
│
├── data/                         # GITIGNORED
│   ├── raw/                      # Original collected data
│   │   └── source_YYYYMMDD_HHMMSS.json
│   ├── processed/                # Cleaned data
│   │   └── cleaned_data.json
│   ├── analysis/                 # Extracted patterns
│   │   └── patterns.json
│   └── validated/                # Final dataset for frontend
│       └── validated_results.json
│
├── notebooks/                    # Jupyter exploratory analysis
│   └── exploration.ipynb
│
└── frontend/
    ├── index.html                # Main page
    ├── css/
    │   └── styles.css            # @import '/shared/styles/variables.css'
    ├── js/
    │   └── app.js                # import from /shared/utils/
    └── data/                     # Symlink or copy from ../data/validated/
        └── results.json
```

### Frontend-Only Template

**Use when:** Interactive visualization or game with static/embedded data

```
my-interactive-story/
├── README.md
└── frontend/
    ├── index.html
    ├── style.css                 # @import '/shared/styles/variables.css'
    ├── game.js                   # All logic
    └── data/                     # Optional static JSON
        └── story-data.json
```

---

## Best Practices

### 1. Dependency Management

**DO:**

```bash
# Use root requirements.txt for shared dependencies
pip install -r ../requirements.txt

# Only add project-specific extras in your requirements.txt
# And add a note at the top:
# NOTE: Install root requirements first: pip install -r ../requirements.txt
# Below are project-specific extras:
biopython==1.83  # For PubMed API (PCOS project only)
```

**DON'T:**

```bash
# Don't create a full requirements.txt with version drift
openai==1.6.1  # ❌ Root has 1.54.3!
```

**Current Standard Versions:**

- `openai==1.54.3` (NOT 1.6.1 - breaking changes!)
- `praw==7.7.1`
- `pandas==2.1.4`
- `numpy==1.26.4`
- `pydantic==2.12.3`

### 2. Shared Component Usage

**DO:**

```javascript
// Import shared utilities
import { loadJSON } from '/shared/utils/dataLoader.js';
import { formatNumber, formatPercent } from '/shared/utils/formatters.js';

async function init() {
  const data = await loadJSON('data/results.json');
  document.getElementById('count').textContent = formatNumber(data.total);
}
```

**DON'T:**

```javascript
// Don't reimplement data loading
async function loadData() {
  try {
    const response = await fetch('data/results.json'); // ❌ Use shared dataLoader!
    // ...error handling...
  } catch (e) {}
}
```

### 3. Styling Consistency

**DO:**

```css
/* Import shared variables first */
@import '/shared/styles/variables.css';

/* Use CSS custom properties */
.stat-card {
  background: var(--bg-card);
  border: 2px solid var(--gb-dark);
  border-radius: 2px;
  padding: var(--space-md);
  box-shadow: var(--shadow-md);
}

/* Use Press Start 2P ONLY for headers */
h1,
h2,
h3 {
  font-family: var(--font-pixel);
}

/* System fonts for body text */
p,
li,
.description {
  font-family: var(--font-body);
  line-height: 1.6;
}
```

**DON'T:**

```css
/* Don't use utility frameworks */
<script src="https://cdn.tailwindcss.com"></script>  /* ❌ Breaks retro theme */

/* Don't hardcode colors */
.card {
  background: #f5f5f5; /* ❌ Use var(--bg-card) */
  border: 2px solid #306230; /* ❌ Use var(--gb-dark) */
}

/* Don't use Press Start 2P for paragraphs */
p {
  font-family: 'Press Start 2P'; /* ❌ Unreadable! */
}
```

### 4. Data Pipeline Pattern

**Standard Flow:**

```
1. COLLECT   → data/raw/source_YYYYMMDD_HHMMSS.json
2. EXTRACT   → data/analysis/extracted_patterns.json
3. VALIDATE  → data/validated/validated_results.json
4. EXPORT    → frontend/data/results.json
5. VISUALIZE → Interactive dashboard
```

**Python Example:**

```python
# src/config.py
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

# Project root
PROJECT_ROOT = Path(__file__).parent.parent

# Data directories
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
ANALYSIS_DIR = DATA_DIR / "analysis"
VALIDATED_DIR = DATA_DIR / "validated"

# API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
```

### 5. LLM Prompt Best Practices

**Unbiased Extraction Pattern:**

```python
# DON'T give the LLM a predefined list
prompt = f"""
Analyze this post and extract symptoms from this list:
{PREDEFINED_SYMPTOMS}  # ❌ Introduces bias!
"""

# DO let the LLM discover organically
prompt = f"""
Read this patient post and extract ALL symptoms mentioned.
Be comprehensive but precise.
Output as JSON array of strings.

Post: {post_text}
"""
```

**Validation Pattern:**

```python
# Cross-reference with authoritative sources
def validate_symptom(symptom):
    # 1. Search PubMed
    pubmed_count = search_pubmed(f"PCOS AND {symptom}")

    # 2. Calculate surprise score
    surprise = patient_frequency * (1 - normalize(pubmed_count))

    return {
        "symptom": symptom,
        "patient_mentions": patient_frequency,
        "research_papers": pubmed_count,
        "surprise_score": surprise
    }
```

---

## Style Enforcement

### Pre-Commit Checklist

**Automated Checks** ✅ (run automatically via pre-commit hooks):

- [x] **Code formatting** (Prettier enforces 2-space indentation, quotes, line
      width)
- [x] **JavaScript linting** (ESLint blocks console.log, enforces const/let,
      detects unused vars)
- [x] **CSS linting** (Stylelint validates best practices and property order)

**Manual Checks** (verify before committing):

- [ ] **Eject button uses shared component** (`<eject-button></eject-button>`)
- [ ] **Press Start 2P only in headers** (not body text)
- [ ] **CSS imports shared variables**
      (`@import '/shared/styles/variables.css'`)
- [ ] **No utility frameworks** (no Tailwind, Bootstrap, etc.)
- [ ] **Uses Game Boy color palette** (var(--gb-dark), var(--gb-light))
- [ ] **Backgrounds are soft** (var(--bg-main) not pure white)
- [ ] **System fonts for readability** (body text uses var(--font-body))

**Tip:** Run `npm run lint:fix` before staging to catch automated issues early.

### Style Validation Script

```bash
# Check for common style violations
grep -r "cdn.tailwindcss" .  # Should find nothing
grep -r "class=\"eject-button\"" .  # Should find nothing (use component)
grep -r "font-family.*Press Start 2P" . | grep -v "h1\|h2\|h3"  # Headers only
```

### Visual Checklist

Open your cartridge and verify:

- [ ] Eject button appears top-left with retro styling
- [ ] Headers use pixelated font (Press Start 2P)
- [ ] Body text is readable (system font)
- [ ] Colors match Game Boy palette (greens) or approved pastels
- [ ] Hover effects work (buttons lift with shadow)
- [ ] Background is soft gray, not white
- [ ] Borders are 2-3px solid, not rounded (except minimal 2px radius)

---

## Continuous Integration (CI/CD)

### GitHub Actions Workflows

All code changes are automatically validated by GitHub Actions CI. Four
workflows run on every push and pull request:

**Linting** (`.github/workflows/lint.yml`)

- **Runs on:** Every push and PR
- **Checks:** ESLint, Prettier, Stylelint
- **Enforces:** Code quality standards from STYLE_GUIDE.md
- **Runtime:** ~2 minutes

**Python Tests** (`.github/workflows/test-python.yml`)

- **Runs on:** Pushes/PRs that modify Python files
- **Tests:** All 4 backend projects with pytest
  - pharmaceutical-innovation-clusters
  - birthcontrol-side-effects-analysis
  - pcos-surprise-discovery
  - eds-symptom-discovery (stub tests, allowed to fail)
- **Python version:** 3.11
- **Coverage:** HTML reports generated for birthcontrol and pcos
- **Runtime:** ~3-4 minutes

**JavaScript Tests** (`.github/workflows/test-javascript.yml`)

- **Runs on:** Pushes/PRs that modify `privilege/` directory
- **Tests:** Jest test suite for calculator logic
- **Coverage:** Configured for `frontend/js/**/*.js`
- **Runtime:** ~1 minute

**Validation** (`.github/workflows/validate.yml`)

- **Runs on:** Every push and PR
- **Checks:** All 9 cartridges load correctly (HTTP 200)
- **Validates:**
  - Portal homepage
  - birthcontrol-side-effects-analysis
  - pcos-surprise-discovery
  - pharmaceutical-innovation-clusters
  - eds-symptom-discovery
  - heart-story
  - privilege
  - covid-scrollytelling
  - evolution-of-invention
- **Runtime:** ~1 minute

### Running Tests Locally

**JavaScript linting:**

```bash
# At repository root
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format:check  # Check formatting
npm run format        # Auto-format all files
```

**Python tests (example for pcos):**

```bash
cd pcos-surprise-discovery
python -m pip install -r requirements.txt
pytest tests/ -v --strict-markers --cov=src --cov-report=html
```

**JavaScript tests (privilege):**

```bash
cd privilege
npm ci
npm test              # Run tests
npm run test:coverage # With coverage report
```

**Validate cartridge loads:**

```bash
npm start  # Visit http://localhost:8000 and click each cartridge
```

### CI Status & Pull Requests

**All workflows must pass before merging PRs.**

Check status on GitHub:

- ✅ Green checkmark = All checks passed, safe to merge
- ❌ Red X = Fix issues before merging
- ⚠️ Yellow dot = Tests still running, wait for completion

**If CI fails:**

1. Click "Details" next to failed check
2. Review error logs
3. Fix locally using commands above
4. Push fixes to same branch
5. CI re-runs automatically

**Path filtering optimization:**

- Python tests only run if `**/*.py` or `**/requirements.txt` modified
- JavaScript tests only run if `privilege/**/*.js` modified
- Linting and validation always run (fast, catches cross-project issues)

### Coverage Reports

**Python projects** generate HTML coverage reports:

```bash
# After running pytest with --cov-report=html
open htmlcov/index.html  # View coverage in browser
```

**Privilege (Jest)** generates coverage:

```bash
cd privilege
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## Testing Guidelines

### Manual Testing Checklist

**Functionality:**

- [ ] All data loads without errors (check browser console)
- [ ] Interactive elements respond (buttons, filters, charts)
- [ ] Eject button navigates back to portal
- [ ] Mobile responsive (test on 375px width)
- [ ] No console errors or warnings

**Data Integrity:**

- [ ] Numbers match source data (spot-check)
- [ ] No NaN or undefined values displayed
- [ ] Date formatting correct
- [ ] Percentages sum to 100% (if applicable)

**Performance:**

- [ ] Page loads in < 3 seconds
- [ ] Large datasets don't freeze browser
- [ ] Images optimized (< 500KB each)
- [ ] JSON files reasonable size (< 5MB)

### Browser Testing

Test in:

- [ ] Chrome/Edge (primary)
- [ ] Firefox
- [ ] Safari (Mac)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Semantic HTML (header, main, section, article)
- [ ] Color contrast meets WCAG AA (4.5:1 for body text)
- [ ] Keyboard navigation works (tab through interactive elements)

---

## Deployment Checklist

### Before Adding to Portal

**1. Content Review**

- [ ] README.md complete with methodology
- [ ] Data sources cited
- [ ] Limitations/disclaimers included
- [ ] No medical claims without sources

**2. Data Privacy**

- [ ] No personally identifiable information (PII)
- [ ] Reddit usernames anonymized (if applicable)
- [ ] API keys in .env (not committed)
- [ ] .gitignore properly configured

**3. File Optimization**

- [ ] Remove unused CSS/JS
- [ ] Compress images
- [ ] Minify large JSON (if > 1MB)
- [ ] Remove console.log statements

**4. Documentation**

- [ ] Code comments for complex logic
- [ ] Data pipeline documented
- [ ] API rate limits noted (if applicable)

### Adding to Portal

**Step 1: Add Cartridge Entry**

```json
// /data/cartridges.json
{
  "id": "my-cartridge",
  "title": "My Cartridge Title",
  "description": "One compelling sentence",
  "color": "#E4ACB2", // Use STYLE_GUIDE pastel colors
  "path": "/my-cartridge/frontend/index.html",
  "status": "active",
  "tags": ["data-analysis", "medical"],
  "dateAdded": "2025-11-10"
}
```

**Step 2: Test Portal Integration**

```bash
cd /Users/jabelle/Code/repos/bytesized
npm start
# Visit http://localhost:8000
# Verify your cartridge appears in shelf
# Click and confirm it loads
```

**Step 3: Update Main README**

```markdown
<!-- /README.md -->

## Current Cartridges

- **My Cartridge** - Brief description
```

**Step 4: Git Commit**

```bash
git add .
git commit -m "Add my-cartridge: Brief description

- Data source: X
- Methodology: Y
- Key finding: Z

🤖 Generated with Claude Code"
git push
```

---

## Common Patterns

### Pattern 1: Reddit Data Collection

```python
# src/data_collection/reddit_collector.py
import praw
from datetime import datetime
from pathlib import Path
import json

def collect_reddit_posts(subreddit_name, limit=500):
    """Collect posts from Reddit subreddit."""
    reddit = praw.Reddit(
        client_id=os.getenv("REDDIT_CLIENT_ID"),
        client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
        user_agent="ByteSized Research Bot"
    )

    subreddit = reddit.subreddit(subreddit_name)
    posts = []

    for post in subreddit.new(limit=limit):
        posts.append({
            "id": post.id,
            "title": post.title,
            "text": post.selftext,
            "score": post.score,
            "created_utc": post.created_utc,
            "num_comments": post.num_comments
        })

    # Save with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = RAW_DIR / f"{subreddit_name}_{timestamp}.json"

    with open(output_path, 'w') as f:
        json.dump(posts, f, indent=2)

    return posts
```

### Pattern 2: LLM Extraction

```python
# src/analysis/llm_extractor.py
from openai import OpenAI
import json

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_symptoms(post_text):
    """Extract symptoms using GPT-4 with structured output."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You extract symptoms from patient posts."},
            {"role": "user", "content": f"""
Extract ALL symptoms mentioned in this post.
Output as JSON array of strings.

Post: {post_text}
"""}
        ],
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)
    return result.get("symptoms", [])
```

### Pattern 3: PubMed Validation

```python
# src/validation/pubmed_validator.py
from Bio import Entrez
import time

Entrez.email = "your-email@example.com"

def search_pubmed(query, max_results=100):
    """Search PubMed for research papers."""
    handle = Entrez.esearch(
        db="pubmed",
        term=query,
        retmax=max_results
    )
    results = Entrez.read(handle)
    handle.close()

    count = int(results["Count"])
    time.sleep(0.34)  # Respect NCBI rate limits (3 req/sec)

    return count

def validate_symptom(condition, symptom, patient_frequency):
    """Validate symptom against research."""
    query = f'"{condition}" AND "{symptom}"'
    paper_count = search_pubmed(query)

    # Calculate surprise score
    normalized_papers = paper_count / 10000  # Normalize to 0-1
    surprise = patient_frequency * (1 - normalized_papers)

    return {
        "symptom": symptom,
        "patient_mentions": patient_frequency,
        "pubmed_papers": paper_count,
        "surprise_score": round(surprise, 3)
    }
```

### Pattern 4: Data Export for Frontend

```python
# src/export/frontend_exporter.py
def export_for_frontend(validated_data):
    """Export validated data in frontend-friendly format."""

    # Sort by surprise score
    sorted_symptoms = sorted(
        validated_data,
        key=lambda x: x["surprise_score"],
        reverse=True
    )

    # Classify into tiers
    output = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total_symptoms": len(sorted_symptoms),
            "data_sources": ["Reddit", "PubMed"]
        },
        "symptoms": sorted_symptoms,
        "tiers": {
            "very_surprising": [s for s in sorted_symptoms if s["surprise_score"] > 0.7],
            "somewhat_surprising": [s for s in sorted_symptoms if 0.3 < s["surprise_score"] <= 0.7],
            "expected": [s for s in sorted_symptoms if s["surprise_score"] <= 0.3]
        }
    }

    # Save to frontend/data/
    frontend_path = PROJECT_ROOT / "frontend" / "data" / "results.json"
    with open(frontend_path, 'w') as f:
        json.dump(output, f, indent=2)

    return output
```

### Pattern 5: Interactive Filter UI

```javascript
// frontend/js/app.js
import { loadJSON } from '/shared/utils/dataLoader.js';
import { formatNumber } from '/shared/utils/formatters.js';

let allSymptoms = [];
let currentFilter = 'all';

async function init() {
  // Load data using shared utility
  const data = await loadJSON('data/results.json');
  allSymptoms = data.symptoms;

  // Render initial view
  renderSymptoms(allSymptoms);
  setupFilters();
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter data
      const filter = btn.dataset.filter;
      const filtered = filterSymptoms(filter);
      renderSymptoms(filtered);
    });
  });
}

function filterSymptoms(tier) {
  if (tier === 'all') return allSymptoms;

  return allSymptoms.filter((s) => {
    if (tier === 'very' && s.surprise_score > 0.7) return true;
    if (
      tier === 'somewhat' &&
      s.surprise_score > 0.3 &&
      s.surprise_score <= 0.7
    )
      return true;
    if (tier === 'expected' && s.surprise_score <= 0.3) return true;
    return false;
  });
}

function renderSymptoms(symptoms) {
  const container = document.getElementById('symptoms-container');

  container.innerHTML = symptoms
    .map(
      (s) => `
    <div class="symptom-card">
      <h3>${s.symptom}</h3>
      <div class="stats">
        <span>Patient mentions: ${formatNumber(s.patient_mentions)}</span>
        <span>Research papers: ${formatNumber(s.pubmed_papers)}</span>
        <span>Surprise: ${(s.surprise_score * 100).toFixed(1)}%</span>
      </div>
    </div>
  `
    )
    .join('');
}

init();
```

---

## Troubleshooting

### Common Issues

**Issue: Eject button doesn't appear**

```html
<!-- Check that you loaded the component -->
<script src="/shared/components/EjectButton.js"></script>

<!-- Check that you added the element -->
<eject-button></eject-button>

<!-- Check browser console for errors -->
```

**Issue: CSS variables not working**

```css
/* Did you import shared variables? */
@import '/shared/styles/variables.css';

/* Are you using the correct variable names? */
background: var(--bg-main); /* ✓ Correct */
background: var(--background-main); /* ✗ Wrong name */
```

**Issue: Data not loading**

```javascript
// Check your path is correct
const data = await loadJSON('data/results.json'); // ✓ Relative path
const data = await loadJSON('/frontend/data/results.json'); // ✗ Absolute (wrong)

// Check file actually exists
// Open browser console → Network tab → Look for 404 errors
```

**Issue: API rate limits**

```python
# PubMed: 3 requests per second without API key
import time
time.sleep(0.34)  # Between each request

# OpenAI: Tier limits vary
# Use batch processing and track usage
```

**Issue: Python dependencies conflict**

```bash
# Make sure you're using root requirements.txt versions
pip install -r ../requirements.txt

# Check which version is installed
pip show openai  # Should be 1.54.3, not 1.6.1
```

### Getting Help

1. **Check existing projects**: Look at PCOS or Pharma for reference
2. **Review STYLE_GUIDE.md**: Design system documentation
3. **Check shared/ README**: Component usage examples
4. **Browser DevTools**: Console for JavaScript errors, Network for failed
   requests

---

## Quick Reference

### Essential Files Checklist

- [ ] `/frontend/index.html` - Main page
- [ ] `/frontend/css/styles.css` - Imports shared variables
- [ ] `/frontend/js/app.js` - Uses shared utilities
- [ ] `/README.md` - Project documentation
- [ ] `/.gitignore` - Excludes data/, .env
- [ ] `/.env.example` - Template for API keys (if needed)

### Essential Code Snippets

**HTML Template:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Cartridge - ByteSized Research</title>

    <!-- Retro Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="css/styles.css" />

    <!-- Shared Components -->
    <script src="/shared/components/EjectButton.js"></script>
  </head>
  <body>
    <eject-button></eject-button>

    <header>
      <h1>Your Title</h1>
      <p class="subtitle">Your description</p>
    </header>

    <main>
      <!-- Your content -->
    </main>

    <script type="module" src="js/app.js"></script>
  </body>
</html>
```

**CSS Template:**

```css
/* Import shared variables */
@import '/shared/styles/variables.css';

/* Global styles */
body {
  background: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-body);
  margin: 0;
  padding: 0;
}

/* Headers with pixel font */
h1,
h2,
h3 {
  font-family: var(--font-pixel);
  color: var(--gb-dark);
  line-height: 1.4;
}

/* Retro cards */
.card {
  background: var(--bg-card);
  border: 2px solid var(--gb-dark);
  border-radius: 2px;
  padding: var(--space-md);
  box-shadow: var(--shadow-md);
}

/* Retro buttons */
.btn {
  padding: 0.75rem 1.25rem;
  background: var(--gb-light);
  border: 2px solid var(--gb-dark);
  border-radius: 2px;
  font-family: var(--font-pixel);
  font-size: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

**JavaScript Template:**

```javascript
// frontend/js/app.js
import { loadJSON } from '/shared/utils/dataLoader.js';
import { formatNumber, formatPercent } from '/shared/utils/formatters.js';

async function init() {
  try {
    // Load data
    const data = await loadJSON('data/results.json');

    // Render UI
    renderStats(data.metadata);
    renderContent(data.symptoms);
  } catch (error) {
    console.error('Failed to initialize:', error);
    showError('Failed to load data. Please refresh.');
  }
}

function renderStats(metadata) {
  document.getElementById('total-count').textContent = formatNumber(
    metadata.total_symptoms
  );
}

function showError(message) {
  const container = document.getElementById('main-content');
  container.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
    </div>
  `;
}

// Initialize on load
init();
```

---

## Version History

- **v1.0** (Nov 10, 2025) - Initial REPO_GUIDE creation
  - Repository architecture overview
  - Decision trees for cartridge types
  - Full-stack and frontend-only templates
  - Best practices and style enforcement
  - Testing and deployment checklists
  - Common patterns (Reddit, LLM, PubMed)
  - Troubleshooting guide

---

## Next Steps

1. **Review STYLE_GUIDE.md** - Understand the design system
2. **Copy template-cartridge/** - Start with boilerplate
3. **Follow decision tree** - Choose your cartridge type
4. **Build iteratively** - Data → Analysis → Validation → Frontend
5. **Test thoroughly** - Use checklists above
6. **Add to portal** - Update cartridges.json

Happy building! 🎮🔬
