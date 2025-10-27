# Learning Path: AI/ML Concepts in This Project 📚

This document maps project tasks to AI/ML concepts you'll learn.

## Phase 1: Data Collection & Exploration ✅

### Concepts You're Learning

#### 1. **API Integration & Authentication**
- **Files**: `src/config.py`, `src/data_collection/reddit_collector.py`
- **Concepts**:
  - OAuth authentication
  - API credentials management
  - Environment variables for security
- **Why it matters**: Most ML projects use APIs to get data (Twitter, news, databases)
- **Exercise**: Try connecting to a different API (Twitter, News API)

#### 2. **Web Scraping Ethics & Rate Limiting**
- **Files**: `src/data_collection/reddit_collector.py` (lines 70-120)
- **Concepts**:
  - Respectful data collection
  - Rate limiting (`time.sleep()`)
  - API terms of service
  - Read-only vs. authenticated modes
- **Why it matters**: Professional ML engineers follow ethical guidelines
- **Exercise**: Research GDPR and data collection regulations

#### 3. **Data Structuring & Serialization**
- **Files**: `src/data_collection/reddit_collector.py` (`_extract_post_data`)
- **Concepts**:
  - Converting API responses to structured data
  - JSON serialization
  - Choosing relevant fields
  - Metadata vs. content
- **Why it matters**: Raw data must be structured for analysis
- **Exercise**: Add new fields to extract (e.g., `gilded`, `archived`)

#### 4. **Privacy & PII Removal**
- **Files**: `src/preprocessing/text_cleaner.py`
- **Concepts**:
  - Regular expressions for pattern matching
  - PII categories (emails, phones, SSNs)
  - Anonymization techniques
  - Cryptographic hashing
- **Why it matters**: CRITICAL for ethical AI - protect privacy always
- **Exercise**: Add pattern to detect and remove medical record numbers

#### 5. **Exploratory Data Analysis (EDA)**
- **Files**: `notebooks/01_exploratory_data_analysis.ipynb`
- **Concepts**:
  - Data quality assessment
  - Statistical summaries (mean, median, std)
  - Distribution analysis
  - Missing value detection
  - Duplicate detection
- **Why it matters**: 80% of ML is data preparation - EDA guides this
- **Exercise**: Add analysis of post engagement vs. text length

#### 6. **Data Visualization**
- **Files**: `notebooks/01_exploratory_data_analysis.ipynb`
- **Concepts**:
  - Histograms for distributions
  - Box plots for outliers
  - Bar charts for categories
  - Time series plots
  - Choosing the right visualization
- **Why it matters**: Humans understand data through visualization
- **Exercise**: Create a word cloud of most common terms

#### 7. **Basic NLP: Tokenization**
- **Files**: `notebooks/01_exploratory_data_analysis.ipynb` (word counting)
- **Concepts**:
  - What is a token?
  - Simple vs. advanced tokenization
  - Stop word removal
  - Word frequency analysis
- **Why it matters**: Foundation of all NLP/LLM work
- **Exercise**: Compare simple tokenization vs. NLTK tokenization

## Phase 2: Text Processing & NLP (Next Steps)

### What You'll Learn

#### 1. **Advanced Text Preprocessing**
- Lowercasing, stemming, lemmatization
- Removing special characters and numbers
- Handling contractions ("don't" → "do not")
- Unicode normalization
- **Tools**: NLTK, spaCy
- **File to create**: `src/preprocessing/advanced_text_processor.py`

#### 2. **Named Entity Recognition (NER)**
- Identifying entities in text (drugs, symptoms, dates)
- Using pre-trained NER models
- Custom entity training
- Entity linking and normalization
- **Tools**: spaCy, Hugging Face Transformers
- **File to create**: `src/analysis/entity_extraction.py`
- **Learning resource**: [spaCy NER tutorial](https://spacy.io/usage/linguistic-features#named-entities)

#### 3. **Part-of-Speech (POS) Tagging**
- Understanding grammatical structure
- Noun phrases, verb phrases
- Extracting symptoms (usually nouns/adjectives)
- Dependency parsing
- **Tools**: spaCy, NLTK
- **Why it matters**: Helps identify what users are describing

#### 4. **Sentiment Analysis**
- Positive, negative, neutral classification
- Intensity scoring
- Aspect-based sentiment (sentiment about specific things)
- Emotion detection (joy, anger, sadness)
- **Tools**: VADER, TextBlob, Transformers
- **File to create**: `src/analysis/sentiment_analyzer.py`

## Phase 3: LLM Application (Upcoming)

### What You'll Learn

#### 1. **Prompt Engineering**
- Crafting effective prompts
- Few-shot learning examples
- Chain-of-thought prompting
- Role assignment
- **Tools**: Claude API, OpenAI API
- **File to create**: `src/llm/prompt_templates.py`
- **Key concept**: The prompt is your "program" for LLMs

#### 2. **Structured Data Extraction with LLMs**
- JSON output formatting
- Entity and relationship extraction
- Handling hallucinations
- Validation strategies
- **File to create**: `src/llm/extractor.py`
- **Pattern**: Send text → Get structured JSON back

#### 3. **LLM API Usage & Cost Management**
- Token counting and estimation
- Batch processing strategies
- Caching results
- Cost optimization
- **Why it matters**: LLM APIs cost money - efficiency matters
- **File to create**: `src/llm/api_manager.py`

#### 4. **Evaluation & Quality Assurance**
- Creating gold standard datasets
- Precision, recall, F1 score
- Inter-annotator agreement
- Error analysis
- **File to create**: `src/evaluation/metrics.py`
- **Critical**: How do you know your extraction is accurate?

## Phase 4: Advanced Analysis (Future)

### What You'll Learn

#### 1. **Topic Modeling**
- Latent Dirichlet Allocation (LDA)
- BERTopic
- Identifying themes in discussions
- **Tools**: gensim, BERTopic
- **Use case**: What topics do people discuss most?

#### 2. **Temporal Analysis**
- Time series of mentions
- Trend detection
- Seasonality patterns
- Event detection
- **Use case**: Are mental health discussions increasing?

#### 3. **Co-occurrence Analysis**
- What symptoms appear together?
- Drug-symptom associations
- Network analysis
- **Tools**: NetworkX
- **Visualization**: Heatmaps, network graphs

#### 4. **Statistical Significance**
- Hypothesis testing
- Confidence intervals
- Effect sizes
- Correlation vs. causation
- **Critical**: Don't confuse correlation with causation!

## Phase 5: Knowledge Graphs (Advanced)

### What You'll Learn

#### 1. **Graph Database Fundamentals**
- Nodes, edges, properties
- Graph query language (Cypher)
- Schema design
- **Tools**: Neo4j, SQLite (for simple graphs)

#### 2. **Entity Relationship Modeling**
- Defining entity types (Drug, Symptom, User Experience)
- Relationship types (CAUSES, TREATS, EXPERIENCES)
- Property graphs
- **Design pattern**: Model real-world relationships

#### 3. **Graph Population**
- Converting extracted data to graph format
- Deduplication and entity resolution
- Batch insertion strategies
- **Challenge**: Mapping text mentions to canonical entities

#### 4. **Graph Queries & Insights**
- Path finding
- Pattern matching
- Aggregation queries
- Graph algorithms (PageRank, community detection)
- **Use cases**: "What drugs are associated with anxiety?"

## Skill Progression Map

### Week 1-2: Foundation
- ✅ API integration
- ✅ Data collection
- ✅ Basic EDA
- ✅ Data cleaning

### Week 3-4: Text Processing
- [ ] Advanced preprocessing
- [ ] NER implementation
- [ ] Sentiment analysis
- [ ] Feature engineering

### Week 5-6: LLM Integration
- [ ] API setup
- [ ] Prompt engineering
- [ ] Structured extraction
- [ ] Result validation

### Week 7-8: Analysis
- [ ] Statistical analysis
- [ ] Pattern recognition
- [ ] Temporal analysis
- [ ] Visualization dashboard

### Week 9-10: Knowledge Graph
- [ ] Graph design
- [ ] Database setup
- [ ] Population pipeline
- [ ] Query interface

## Recommended Learning Order

### If you're new to Python:
1. Start with `src/config.py` - simplest
2. Read `src/data_collection/reddit_collector.py` - moderate
3. Explore Jupyter notebook - interactive
4. Try modifying collection parameters

### If you're comfortable with Python:
1. Dive into the Jupyter notebook
2. Modify `text_cleaner.py` to add features
3. Start Phase 2 with NER
4. Experiment with LLM APIs

### If you're experienced:
1. Review architecture in README
2. Extend with custom NLP models
3. Implement LLM extraction pipeline
4. Build knowledge graph

## Learning Resources by Phase

### Phase 1 (Current):
- **Python Data Science**: [Python Data Science Handbook](https://jakevdp.github.io/PythonDataScienceHandbook/)
- **Pandas**: [Official Tutorials](https://pandas.pydata.org/docs/getting_started/intro_tutorials/)
- **Regex**: [RegexOne Tutorial](https://regexone.com/)
- **APIs**: [Real Python API Guide](https://realpython.com/api-integration-in-python/)

### Phase 2 (Next):
- **NLP**: [spaCy Course](https://course.spacy.io/)
- **NLTK**: [NLTK Book](https://www.nltk.org/book/)
- **Sentiment Analysis**: [TextBlob Tutorial](https://textblob.readthedocs.io/)

### Phase 3 (Upcoming):
- **Prompt Engineering**: [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- **LLM APIs**: [OpenAI Cookbook](https://github.com/openai/openai-cookbook)

### Phase 4 & 5:
- **Topic Modeling**: [Topic Modeling with Gensim](https://radimrehurek.com/gensim/)
- **Graph Databases**: [Neo4j Getting Started](https://neo4j.com/developer/get-started/)

## Exercises to Deepen Learning

### Beginner Exercises:
1. Collect data from a new subreddit
2. Add a new visualization to the EDA notebook
3. Modify PII patterns to detect credit card numbers
4. Calculate average post length by subreddit

### Intermediate Exercises:
1. Implement spell-checking for text cleaning
2. Create a dashboard with Plotly/Dash
3. Add statistical tests (t-tests, chi-square)
4. Build a simple sentiment classifier

### Advanced Exercises:
1. Fine-tune a BERT model for symptom classification
2. Implement active learning for data labeling
3. Create a web API for the extraction pipeline
4. Build a real-time monitoring dashboard

## Common Pitfalls & How to Avoid Them

### Data Collection:
- ❌ Collecting too much data at once
- ✅ Start small (100 posts), iterate

### Text Processing:
- ❌ Over-cleaning (removing useful information)
- ✅ Preserve original, clean separately

### LLM Usage:
- ❌ Not validating LLM outputs
- ✅ Always verify critical extractions

### Analysis:
- ❌ Confusing correlation with causation
- ✅ Use careful language, acknowledge limitations

## Your Learning Journal

As you progress, document:
1. **Concepts mastered**: What did you learn?
2. **Challenges faced**: What was difficult?
3. **Solutions found**: How did you solve it?
4. **Questions remaining**: What to explore next?

Create a `JOURNAL.md` in the `docs/` folder to track your learning!

---

Remember: Learning ML/AI is a journey. Focus on understanding concepts deeply rather than rushing through. Each phase builds on the previous one! 🚀
