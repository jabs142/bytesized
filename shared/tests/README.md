# Shared Testing Utilities

Reusable test fixtures, helpers, and utilities for ByteSized projects.

## 📁 Directory Structure

```
/shared/tests/
├── fixtures/              # Sample data for testing
│   ├── sample_reddit_posts.json
│   ├── sample_pubmed_papers.json
│   └── mock_llm_responses.json
├── helpers/               # Reusable test utilities
│   ├── data_validator.py
│   └── mock_llm_client.py
└── README.md             # This file
```

---

## 🎯 Quick Start

### Python Projects (Birth Control, PCOS, EDS, Pharmaceutical)

```python
# In your test file
import sys
import pytest
from pathlib import Path

# Add shared tests to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'shared' / 'tests'))

from helpers.data_validator import DataStructureValidator, validate_reddit_posts
from helpers.mock_llm_client import MockLLMClient, MockOpenAIClient

# Use in tests
def test_validate_data():
    validator = DataStructureValidator()
    assert validator.validate_structure(data, required_fields=['id', 'title'])

def test_llm_extraction():
    client = MockLLMClient()
    result = client.extract('symptom_extraction', 'test text')
    assert 'symptoms' in result
```

### JavaScript Projects

```javascript
// Load fixtures directly
const samplePosts = await fetch(
  '/shared/tests/fixtures/sample_reddit_posts.json'
).then((r) => r.json());
```

---

## 📦 Test Fixtures

### `sample_reddit_posts.json`

Sample Reddit posts from r/birthcontrol, r/PCOS, and r/ehlersdanlos for testing
data processing pipelines.

**Structure:**

```json
[
  {
    "id": "test001",
    "subreddit": "birthcontrol",
    "title": "Post title",
    "selftext": "Post content",
    "author": "user123",
    "created_utc": 1698451200,
    "score": 42,
    "num_comments": 18,
    "url": "https://reddit.com/..."
  }
]
```

**Use cases:**

- Testing Reddit data extraction
- Validating data parsing
- LLM extraction pipeline testing

---

### `sample_pubmed_papers.json`

Sample PubMed papers for testing validation and research gap analysis.

**Structure:**

```json
[
  {
    "pmid": "12345678",
    "title": "Paper title",
    "abstract": "Full abstract text",
    "authors": ["Smith J", "Johnson A"],
    "journal": "Journal Name",
    "pub_date": "2023-03-15",
    "doi": "10.1234/...",
    "mesh_terms": ["Term1", "Term2"]
  }
]
```

**Use cases:**

- Testing PubMed API integration
- Validating paper relevance checking
- Research gap analysis testing

---

### `mock_llm_responses.json`

Pre-defined LLM responses for testing without API calls.

**Available prompts:**

- `symptom_extraction`: Extract symptoms from text
- `side_effect_validation`: Validate if something is a side effect
- `pcos_surprise_score`: Calculate surprise scores
- `symptom_categorization`: Categorize symptoms
- `pubmed_relevance`: Assess paper relevance
- `error_response`: Simulate API errors
- `empty_extraction`: Simulate no symptoms found

**Use case:**

- Testing LLM extraction logic without API keys
- Fast test execution
- Consistent test results

---

## 🛠️ Helper Utilities

### Data Validator

**File:** `helpers/data_validator.py`

Validates JSON data structures for consistency.

**Quick Example:**

```python
from helpers.data_validator import DataStructureValidator

validator = DataStructureValidator()

# Validate structure
validator.validate_structure(
    data,
    required_fields=['id', 'title', 'created_utc'],
    optional_fields=['score', 'num_comments']
)

# Check for duplicates
validator.check_no_duplicates(data, key='id')

# Validate data types
validator.validate_data_types(
    item,
    {'id': str, 'score': int, 'created_utc': (int, float)}
)

# Validate ranges
validator.validate_field_range(
    data,
    field='score',
    min_value=0,
    max_value=1000
)
```

**Convenience Functions:**

```python
from helpers.data_validator import validate_reddit_posts, validate_symptom_data

# Use pre-configured validators
assert validate_reddit_posts(posts)
assert validate_symptom_data(symptoms)
```

**Methods:**

- `validate_structure()` - Check required/optional fields
- `check_no_duplicates()` - Ensure unique values
- `validate_data_types()` - Type checking
- `validate_field_range()` - Numeric range validation
- `validate_non_empty()` - Check for empty strings
- `validate_list_items()` - Batch type validation

---

### Mock LLM Client

**File:** `helpers/mock_llm_client.py`

Eliminates API calls in tests by providing mock responses.

**Quick Example:**

```python
from helpers.mock_llm_client import MockLLMClient

# Create mock client (automatically loads fixtures)
client = MockLLMClient()

# Extract symptoms (returns mock data)
result = client.extract('symptom_extraction', 'Patient reports anxiety and headaches')

assert result['symptoms'] == [...]
assert result['confidence'] > 0.9

# Track calls
assert client.get_call_count('symptom_extraction') == 1
```

**Adding Custom Responses:**

```python
client = MockLLMClient(use_fixtures=False)
client.add_response('custom_prompt', {
    'result': 'custom data',
    'confidence': 0.95
})
```

**OpenAI Pattern:**

```python
from helpers.mock_llm_client import MockOpenAIClient

client = MockOpenAIClient()
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Extract symptoms"}]
)
```

**Anthropic Pattern:**

```python
from helpers.mock_llm_client import MockAnthropicClient

client = MockAnthropicClient()
response = client.messages.create(
    model="claude-3-opus-20240229",
    messages=[{"role": "user", "content": "Extract symptoms"}]
)
```

**Batch Processing:**

```python
results = client.batch_extract(
    'symptom_extraction',
    ['text 1', 'text 2', 'text 3']
)
```

---

## 📊 Shared Utilities (Non-Testing)

### Surprise Score Calculator

**File:** `/shared/utils/python/surprise_score.py`

Standardized surprise score calculation used by PCOS and EDS projects.

**Quick Example:**

```python
from shared.utils.python.surprise_score import (
    calculate_surprise_score,
    classify_surprise_level,
    SurpriseScoreCalculator
)

# Simple calculation
score = calculate_surprise_score(
    reddit_frequency=0.73,
    pubmed_paper_count=15,
    max_papers=1000
)

# Get classification
level = classify_surprise_level(score)
# Returns: "very_surprising", "somewhat_surprising", or "expected"

# Batch processing
calculator = SurpriseScoreCalculator(max_papers=1000)
symptoms = [
    {'symptom': 'fatigue', 'reddit_frequency': 0.73, 'pubmed_papers': 15},
    {'symptom': 'acne', 'reddit_frequency': 0.45, 'pubmed_papers': 120}
]
results = calculator.calculate_batch(symptoms)
```

---

## 🧪 Writing Tests

### Example Test File

```python
# test_example.py
import sys
import pytest
from pathlib import Path

# Add shared tests to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'shared' / 'tests'))

from helpers.data_validator import DataStructureValidator
from helpers.mock_llm_client import MockLLMClient

# Load fixtures
@pytest.fixture
def sample_posts():
    import json
    fixture_path = Path(__file__).parent.parent.parent / 'shared' / 'tests' / 'fixtures' / 'sample_reddit_posts.json'
    with open(fixture_path) as f:
        return json.load(f)

# Use validator
def test_reddit_post_structure(sample_posts):
    validator = DataStructureValidator()

    assert validator.validate_structure(
        sample_posts,
        required_fields=['id', 'subreddit', 'author']
    )

    assert validator.check_no_duplicates(sample_posts, key='id')

# Use mock LLM
def test_symptom_extraction():
    client = MockLLMClient()

    result = client.extract(
        'symptom_extraction',
        'Patient reports anxiety and mood swings'
    )

    assert 'symptoms' in result
    assert result['confidence'] > 0.9
    assert client.get_call_count('symptom_extraction') == 1

# Test error handling
def test_llm_error_handling():
    client = MockLLMClient()

    result = client.extract('error_response', 'test')

    assert 'error' in result
```

---

## 📝 Best Practices

### 1. Use Fixtures Over Real Data

❌ **Don't:**

```python
# Loading large real data in every test
posts = load_reddit_posts_from_api()  # Slow, requires API keys
```

✅ **Do:**

```python
# Use shared fixtures
posts = load_fixture('sample_reddit_posts.json')  # Fast, no API needed
```

### 2. Mock External APIs

❌ **Don't:**

```python
# Making real API calls in tests
client = OpenAI(api_key=os.getenv('OPENAI_KEY'))
result = client.chat.completions.create(...)  # Slow, costs money, requires key
```

✅ **Do:**

```python
# Use mock client
client = MockOpenAIClient()
result = client.chat.completions.create(...)  # Fast, free, no key needed
```

### 3. Validate Data Structures

❌ **Don't:**

```python
# Manual validation
assert 'id' in item
assert 'title' in item
assert isinstance(item['score'], int)
# ... repeat for every field
```

✅ **Do:**

```python
# Use validator utility
validator = DataStructureValidator()
validator.validate_structure(data, required_fields=['id', 'title'])
validator.validate_data_types(item, {'score': int})
```

### 4. Test Edge Cases

```python
def test_empty_extraction():
    """Test LLM extraction with no symptoms found"""
    client = MockLLMClient()
    result = client.extract('empty_extraction', 'no symptoms here')

    assert result['symptoms'] == []
    assert result['confidence'] == 0.0

def test_error_response():
    """Test error handling"""
    client = MockLLMClient()
    result = client.extract('error_response', 'test')

    assert 'error' in result
```

---

## 🔄 Migration Guide

### Migrating Existing Tests

**Before:**

```python
# Old test with real API
import openai

def test_symptom_extraction():
    client = openai.OpenAI(api_key=os.getenv('OPENAI_KEY'))
    # ... makes real API call
```

**After:**

```python
# New test with mock
from helpers.mock_llm_client import MockOpenAIClient

def test_symptom_extraction():
    client = MockOpenAIClient()  # Drop-in replacement
    # ... uses mock responses
```

---

## 📚 Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [JSON Schema Validation](https://json-schema.org/)
- [Mocking in Python](https://docs.python.org/3/library/unittest.mock.html)

---

## 🤝 Contributing

When adding new test utilities:

1. **Add fixtures** to `/fixtures/` with clear naming
2. **Document structure** in this README
3. **Add helper functions** to `/helpers/` with docstrings
4. **Write examples** showing usage
5. **Keep it DRY** - if you write the same test logic twice, make it a shared
   utility

---

## 📞 Questions?

See existing test files in projects for more examples:

- Birth Control: `/birthcontrol-side-effects-analysis/tests/`
- PCOS: `/pcos-surprise-discovery/tests/`
- EDS: `/eds-symptom-discovery/tests/`
- Privilege: `/privilege/test/` (JavaScript tests)

---

Last Updated: November 2025
