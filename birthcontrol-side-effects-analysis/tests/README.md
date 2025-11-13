# Birth Control Side Effects Analysis - Test Suite

Comprehensive test suite for the data pipeline and analysis modules.

## Test Structure

```
tests/
├── __init__.py
├── test_side_effect_standardization.py  # Unit tests for name standardization
├── test_text_cleaner.py                 # Unit & integration tests for PII removal
├── test_data_validation.py              # Data file structure validation
└── README.md
```

## Running Tests

### Install Test Dependencies

```bash
pip install pytest pytest-cov
```

### Run All Tests

```bash
# From project root
pytest

# With verbose output
pytest -v

# With coverage report
pytest --cov=src --cov-report=html
```

### Run Specific Test Categories

```bash
# Unit tests only
pytest -m unit

# Data validation tests only
pytest -m data

# Integration tests only
pytest -m integration

# Specific test file
pytest tests/test_side_effect_standardization.py
```

## Test Categories

Tests are marked with pytest markers for easy filtering:

- `@pytest.mark.unit` - Unit tests for individual functions
- `@pytest.mark.integration` - Integration tests for workflows
- `@pytest.mark.data` - Tests that validate data files
- `@pytest.mark.slow` - Tests that take longer to run
- `@pytest.mark.requires_api` - Tests that require API keys

## Test Coverage

### Current Test Modules

**test_side_effect_standardization.py** (16 tests)

- ✅ PMDD variations
- ✅ Acne variations
- ✅ Libido variations
- ✅ Heavy bleeding variations
- ✅ Mood variations
- ✅ Hair loss variations
- ✅ Brain fog variations
- ✅ Pain variations
- ✅ Case-insensitive matching
- ✅ Unstandardized terms
- ✅ Edge cases
- ✅ Idempotence

**test_text_cleaner.py** (14 tests)

- ✅ Email removal
- ✅ Phone number removal
- ✅ SSN removal
- ✅ URL removal
- ✅ Reddit username removal
- ✅ Multiple PII types
- ✅ Custom replacements
- ✅ Realistic Reddit posts
- ✅ Comment thread cleaning

**test_data_validation.py** (11 tests)

- ✅ File existence checks
- ✅ JSON structure validation
- ✅ Reddit data structure
- ✅ PubMed data structure
- ✅ Evidence tier validation
- ✅ No duplicates
- ✅ Name standardization
- ✅ Long-term data validation
- ✅ Clinical significance validation

## Writing New Tests

### Test Template

```python
import pytest
from src.module_name import function_to_test

class TestFeatureName:
    """Test suite for Feature."""

    @pytest.fixture
    def setup_data(self):
        """Create test data."""
        return {"key": "value"}

    @pytest.mark.unit
    def test_basic_functionality(self, setup_data):
        """Test basic functionality."""
        result = function_to_test(setup_data)
        assert result == expected_value

    @pytest.mark.integration
    def test_end_to_end_workflow(self):
        """Test complete workflow."""
        # Setup
        # Execute
        # Assert
        pass
```

### Best Practices

1. **Use descriptive test names** - Test names should describe what they test
2. **One assertion per test** - Or closely related assertions
3. **Use fixtures for setup** - Reuse common setup code
4. **Mark tests appropriately** - Use pytest markers for categorization
5. **Test edge cases** - Empty strings, None values, boundary conditions
6. **Mock external dependencies** - Don't make real API calls in tests

## Test Data

Tests use:

- **Mock data** for unit tests (no external files needed)
- **Fixtures** for integration tests
- **Real data files** for validation tests (optional - tests skip if not found)

## Continuous Integration

Tests are designed to run in CI/CD environments:

- No API keys required for basic tests
- Data validation tests skip if files don't exist
- Fast execution time (~2 seconds for full suite)

## Coverage Goals

Target coverage by module:

- **Core analysis modules**: 80%+ coverage
- **Data collection**: 60%+ coverage (requires mocking APIs)
- **Preprocessing**: 90%+ coverage
- **Validation**: 70%+ coverage

## Future Test Additions

Planned test modules:

- `test_statistical_validator.py` - Statistical calculation tests
- `test_association_rules.py` - Association rule mining tests
- `test_medical_term_extractor.py` - Medical terminology tests
- `test_evidence_validator.py` - Evidence validation logic tests

## Troubleshooting

**ImportError: No module named 'src'**

- Ensure pytest is run from project root
- Check `pytest.ini` has `pythonpath = .`

**Tests skipped**

- Some tests skip if data files don't exist (this is expected)
- Use `-v` flag to see skip reasons

**Coverage not working**

- Install: `pip install pytest-cov`
- Run: `pytest --cov=src`

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Pytest Best Practices](https://docs.pytest.org/en/latest/goodpractices.html)
- [Coverage.py Documentation](https://coverage.readthedocs.io/)
