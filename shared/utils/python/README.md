# ByteSized Shared Python Utilities

Common Python utilities shared across ByteSized research projects.

## Overview

This package provides reusable base classes and helper functions for:

- Reddit data collection
- LLM-based extraction and validation
- PubMed research fetching

## Installation

Install root dependencies first:

```bash
# From your project directory
pip install -r ../requirements.txt
```

Then import shared utilities in your Python code:

```python
import sys
from pathlib import Path

# Add ByteSized root to path (from your project directory)
repo_root = Path(__file__).parent.parent
sys.path.insert(0, str(repo_root))

# Now you can import directly
from shared.utils.python import RedditCollectorBase
from shared.utils.python import LLMExtractor, SymptomExtractor
from shared.utils.python import PubMedFetcher, create_search_queries
```

## Modules

### reddit_collector_base.py

Base class for Reddit data collectors using PRAW.

**Features:**

- PRAW authentication
- Rate limiting
- Subreddit collection
- Search functionality
- Date filtering
- JSON serialization

**Usage:**

```python
from shared.utils.python import RedditCollectorBase

class MyCollector(RedditCollectorBase):
    def process_post(self, post):
        return {
            "id": post.id,
            "title": post.title,
            "text": post.selftext
        }

collector = MyCollector(
    client_id="your_client_id",
    client_secret="your_secret",
    user_agent="your_app"
)

posts = collector.collect_from_subreddit("Python", limit=100)
collector.save_to_json(posts, Path("output.json"))
```

### llm_helpers.py

LLM extraction and validation utilities.

**Features:**

- OpenAI and Anthropic support
- JSON mode extraction
- Batch processing with rate limiting
- Retry logic
- Specialized extractors (symptoms, relevance checking)

**Usage:**

```python
from shared.utils.python import LLMExtractor, SymptomExtractor

# General extraction
extractor = LLMExtractor(provider="openai", model="gpt-4o-mini")
result = extractor.extract(
    system_prompt="Extract symptoms from text",
    user_prompt="I have anxiety and headaches"
)

# Specialized symptom extraction
symptom_extractor = SymptomExtractor()
symptoms = symptom_extractor.extract_symptoms(
    text="I experienced mood swings and acne",
    context="birth control side effects"
)
```

### pubmed_helpers.py

PubMed API utilities for research paper fetching.

**Features:**

- PubMed E-utilities integration
- Search and fetch operations
- Rate limiting
- XML parsing
- Batch operations
- Query generation helpers

**Usage:**

```python
from shared.utils.python import PubMedFetcher, create_search_queries

fetcher = PubMedFetcher(email="your@email.com")

# Simple search and fetch
papers = fetcher.search_and_fetch(
    query="birth control anxiety",
    max_results=10
)

# Advanced: multiple queries
queries = create_search_queries(
    base_term="birth control",
    variations=["anxiety", "depression", "mood swings"]
)

for query in queries:
    papers = fetcher.search_and_fetch(query, max_results=5)
```

## Dependencies

**Install from root requirements.txt:**

```bash
pip install -r /path/to/bytesized/requirements.txt
```

The shared utilities require these packages (versions managed in root
requirements.txt):

- `praw` - Reddit API wrapper
- `openai` - OpenAI API client
- `anthropic` - Anthropic Claude API client
- `requests` - HTTP library for PubMed
- `tqdm` - Progress bars (optional)

## Best Practices

### Reddit Collection

- Always set a reasonable `rate_limit_delay` (1-2 seconds)
- Implement custom `process_post()` for your specific needs
- Use date filtering to avoid reprocessing old data
- Save intermediate results to avoid data loss

### LLM Extraction

- Use `gpt-4o-mini` for cost efficiency
- Set `temperature=0` for consistent results
- Implement retry logic for production use
- Monitor API costs with batch operations

### PubMed Fetching

- Provide an email (NCBI recommendation)
- Use API key for higher rate limits
- Batch fetch details (200 PMIDs max per call)
- Cache results to avoid redundant API calls

## Error Handling

All modules include basic error handling:

- API errors are caught and logged
- Failed operations return empty results or error dictionaries
- Rate limiting is enforced automatically

For production use, consider adding:

- Exponential backoff
- Persistent retry queues
- Detailed logging
- Result caching

## Examples

See individual module files for complete examples:

- `reddit_collector_base.py`: `ExampleRedditCollector` class
- `llm_helpers.py`: `PubMedRelevanceChecker` and `SymptomExtractor` classes
- `pubmed_helpers.py`: `create_search_queries()` function

## Contributing

When adding new shared utilities:

1. Follow existing patterns and naming conventions
2. Include docstrings for all functions and classes
3. Add usage examples in docstrings
4. Update this README with the new module
5. Test with at least 2 different projects

## Projects Using These Utilities

- Birth Control Side Effects Analysis
- PCOS Surprise Discovery
- EDS Symptom Discovery

## Version History

**1.0.0** (2025-01-12)

- Initial release
- Reddit collector base class
- LLM helpers (OpenAI + Anthropic)
- PubMed fetcher with E-utilities
