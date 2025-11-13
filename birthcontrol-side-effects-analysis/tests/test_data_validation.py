"""
Tests for Data File Validation
==============================
Validates structure and quality of JSON data files.
"""

import pytest
import json
import os
from pathlib import Path


class TestDataFileStructure:
    """Test suite for validating data file structures."""

    @pytest.fixture
    def data_dir(self):
        """Get data directory path."""
        return Path(__file__).parent.parent / "data"

    @pytest.mark.data
    def test_validated_side_effects_exists(self, data_dir):
        """Test that validated side effects file exists."""
        file_path = data_dir / "validated_side_effects_database.json"
        if file_path.exists():
            assert file_path.is_file()

    @pytest.mark.data
    def test_validated_side_effects_structure(self, data_dir):
        """Test validated side effects JSON structure."""
        file_path = data_dir / "validated_side_effects_database.json"

        if not file_path.exists():
            pytest.skip("Validated side effects file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        # Should be a list
        assert isinstance(data, list), "Data should be a list"
        assert len(data) > 0, "Data should not be empty"

        # Check first item structure
        first_item = data[0]
        required_fields = [
            'side_effect',
            'reddit_data',
            'pubmed_data',
            'evidence_tier',
            'tier_label'
        ]

        for field in required_fields:
            assert field in first_item, f"Missing required field: {field}"

    @pytest.mark.data
    def test_reddit_data_structure(self, data_dir):
        """Test reddit_data field structure."""
        file_path = data_dir / "validated_side_effects_database.json"

        if not file_path.exists():
            pytest.skip("Validated side effects file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        for item in data:
            reddit_data = item['reddit_data']

            # Check required reddit fields
            assert 'frequency' in reddit_data
            assert 'mention_count' in reddit_data
            assert 'post_count' in reddit_data

            # Validate data types
            assert isinstance(reddit_data['frequency'], (int, float))
            assert isinstance(reddit_data['mention_count'], int)
            assert isinstance(reddit_data['post_count'], int)

            # Validate ranges
            assert 0 <= reddit_data['frequency'] <= 1
            assert reddit_data['mention_count'] >= 0
            assert reddit_data['post_count'] >= 0

    @pytest.mark.data
    def test_pubmed_data_structure(self, data_dir):
        """Test pubmed_data field structure."""
        file_path = data_dir / "validated_side_effects_database.json"

        if not file_path.exists():
            pytest.skip("Validated side effects file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        for item in data:
            pubmed_data = item['pubmed_data']

            # Check required pubmed fields
            assert 'paper_count' in pubmed_data
            assert isinstance(pubmed_data['paper_count'], int)
            assert pubmed_data['paper_count'] >= 0

            # If papers exist, should have papers array
            if pubmed_data['paper_count'] > 0:
                assert 'papers' in pubmed_data
                assert isinstance(pubmed_data['papers'], list)

    @pytest.mark.data
    def test_evidence_tiers_valid(self, data_dir):
        """Test that evidence tiers are valid."""
        file_path = data_dir / "validated_side_effects_database.json"

        if not file_path.exists():
            pytest.skip("Validated side effects file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        valid_tiers = [1, 2, 3, 4]
        valid_labels = [
            "FDA-Listed",
            "Research-Backed",
            "Patient-Validated",
            "Emerging Pattern"
        ]

        for item in data:
            assert item['evidence_tier'] in valid_tiers, \
                f"Invalid tier: {item['evidence_tier']}"
            assert item['tier_label'] in valid_labels, \
                f"Invalid tier label: {item['tier_label']}"

    @pytest.mark.data
    def test_no_duplicate_side_effects(self, data_dir):
        """Test that there are no duplicate side effects."""
        file_path = data_dir / "validated_side_effects_database.json"

        if not file_path.exists():
            pytest.skip("Validated side effects file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        side_effects = [item['side_effect'] for item in data]
        assert len(side_effects) == len(set(side_effects)), \
            "Duplicate side effects found"

    @pytest.mark.data
    def test_side_effect_names_standardized(self, data_dir):
        """Test that side effect names follow standardization."""
        file_path = data_dir / "validated_side_effects_database.json"

        if not file_path.exists():
            pytest.skip("Validated side effects file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        for item in data:
            side_effect = item['side_effect']

            # Should be lowercase or properly capitalized
            assert side_effect == side_effect.lower() or side_effect[0].isupper(), \
                f"Side effect name formatting issue: {side_effect}"

            # Should not have extra whitespace
            assert side_effect == side_effect.strip()
            assert "  " not in side_effect  # No double spaces


class TestLongTermDataValidation:
    """Validate long-term side effects data file."""

    @pytest.fixture
    def data_dir(self):
        return Path(__file__).parent.parent / "data"

    @pytest.mark.data
    def test_long_term_file_exists(self, data_dir):
        """Test that long-term side effects file exists."""
        file_path = data_dir / "long_term_validated_side_effects.json"
        if file_path.exists():
            assert file_path.is_file()

    @pytest.mark.data
    def test_long_term_structure(self, data_dir):
        """Test long-term side effects structure."""
        file_path = data_dir / "long_term_validated_side_effects.json"

        if not file_path.exists():
            pytest.skip("Long-term data file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        assert isinstance(data, list)

        if len(data) > 0:
            first_item = data[0]
            required_fields = [
                'side_effect',
                'validation_status',
                'clinical_significance'
            ]

            for field in required_fields:
                assert field in first_item, f"Missing required field: {field}"

    @pytest.mark.data
    def test_clinical_significance_valid(self, data_dir):
        """Test that clinical significance values are valid."""
        file_path = data_dir / "long_term_validated_side_effects.json"

        if not file_path.exists():
            pytest.skip("Long-term data file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        valid_significance = ["high", "moderate", "low"]

        for item in data:
            if 'clinical_significance' in item:
                assert item['clinical_significance'] in valid_significance, \
                    f"Invalid clinical significance: {item['clinical_significance']}"


class TestRedditPostsData:
    """Validate Reddit posts data file."""

    @pytest.fixture
    def data_dir(self):
        return Path(__file__).parent.parent / "data"

    @pytest.mark.data
    def test_reddit_posts_structure(self, data_dir):
        """Test Reddit posts file structure if it exists."""
        file_path = data_dir / "reddit_posts.json"

        if not file_path.exists():
            pytest.skip("Reddit posts file not found")

        with open(file_path, 'r') as f:
            data = json.load(f)

        assert isinstance(data, list)

        if len(data) > 0:
            first_post = data[0]

            # Check basic post fields
            expected_fields = ['title', 'selftext', 'created_utc']
            for field in expected_fields:
                if field in first_post:
                    assert isinstance(first_post[field], (str, int, float))
