"""
Tests for Symptom Aggregator
============================
Tests the symptom aggregation and frequency calculation logic.
"""

import pytest
from src.analysis.symptom_aggregator import SymptomAggregator


class TestSymptomAggregator:
    """Test suite for symptom aggregation."""

    @pytest.fixture
    def sample_extractions(self):
        """Create sample extraction data."""
        return [
            {
                "post_id": "post1",
                "symptoms": [
                    {
                        "symptom": "brain fog",
                        "surprise_signal": True,
                        "category": "cognitive",
                        "quote": "I have terrible brain fog"
                    },
                    {
                        "symptom": "fatigue",
                        "surprise_signal": False,
                        "category": "energy",
                        "quote": "Always tired"
                    }
                ]
            },
            {
                "post_id": "post2",
                "symptoms": [
                    {
                        "symptom": "brain fog",
                        "surprise_signal": True,
                        "category": "cognitive",
                        "quote": "Can't concentrate"
                    },
                    {
                        "symptom": "acne",
                        "surprise_signal": False,
                        "category": "skin",
                        "quote": "Bad acne"
                    }
                ]
            },
            {
                "post_id": "post3",
                "symptoms": [
                    {
                        "symptom": "fatigue",
                        "surprise_signal": False,
                        "category": "energy",
                        "quote": "So exhausted"
                    }
                ]
            }
        ]

    @pytest.fixture
    def aggregator(self, sample_extractions):
        """Create aggregator instance with sample data."""
        return SymptomAggregator(sample_extractions)

    @pytest.mark.unit
    def test_aggregation_counts_mentions(self, aggregator):
        """Test that aggregation correctly counts symptom mentions."""
        result = aggregator.aggregate()

        # Brain fog appears 2 times
        assert result["brain fog"]["mentions"] == 2

        # Fatigue appears 2 times
        assert result["fatigue"]["mentions"] == 2

        # Acne appears 1 time
        assert result["acne"]["mentions"] == 1

    @pytest.mark.unit
    def test_aggregation_tracks_posts(self, aggregator):
        """Test that aggregation tracks which posts contain symptoms."""
        result = aggregator.aggregate()

        # Brain fog in 2 posts
        assert len(result["brain fog"]["posts"]) == 2
        assert "post1" in result["brain fog"]["posts"]
        assert "post2" in result["brain fog"]["posts"]

        # Fatigue in 2 posts
        assert len(result["fatigue"]["posts"]) == 2

        # Acne in 1 post
        assert len(result["acne"]["posts"]) == 1

    @pytest.mark.unit
    def test_aggregation_counts_surprise_signals(self, aggregator):
        """Test that surprise signals are counted."""
        result = aggregator.aggregate()

        # Brain fog has 2 surprise signals
        assert result["brain fog"]["surprise_signals"] == 2

        # Fatigue has 0 surprise signals
        assert result["fatigue"]["surprise_signals"] == 0

    @pytest.mark.unit
    def test_aggregation_tracks_categories(self, aggregator):
        """Test that categories are tracked."""
        result = aggregator.aggregate()

        # Brain fog is cognitive
        assert "cognitive" in result["brain fog"]["categories"]
        assert result["brain fog"]["categories"]["cognitive"] == 2

        # Fatigue is energy
        assert "energy" in result["fatigue"]["categories"]
        assert result["fatigue"]["categories"]["energy"] == 2

    @pytest.mark.unit
    def test_aggregation_collects_quotes(self, aggregator):
        """Test that sample quotes are collected."""
        result = aggregator.aggregate()

        # Should have quotes for each symptom
        assert len(result["brain fog"]["quotes"]) == 2
        assert "I have terrible brain fog" in result["brain fog"]["quotes"]
        assert "Can't concentrate" in result["brain fog"]["quotes"]

    @pytest.mark.unit
    def test_master_list_creation(self, aggregator):
        """Test creation of master symptom list."""
        aggregator.aggregate()
        master_list = aggregator.create_master_list()

        # Should have 3 unique symptoms
        assert len(master_list) == 3

        # Each should have required fields
        for item in master_list:
            assert "symptom" in item
            assert "mentions" in item
            assert "posts_appearing_in" in item
            assert "frequency" in item
            assert "surprise_signals" in item
            assert "category" in item
            assert "sample_quotes" in item

    @pytest.mark.unit
    def test_master_list_frequency_calculation(self, aggregator):
        """Test that frequency is calculated correctly."""
        aggregator.aggregate()
        master_list = aggregator.create_master_list()

        # Total posts = 3
        # Brain fog appears in 2 posts: frequency = 2/3 ≈ 0.667
        brain_fog_entry = next(item for item in master_list if item["symptom"] == "brain fog")
        assert abs(brain_fog_entry["frequency"] - 0.667) < 0.01

        # Fatigue appears in 2 posts: frequency = 2/3 ≈ 0.667
        fatigue_entry = next(item for item in master_list if item["symptom"] == "fatigue")
        assert abs(fatigue_entry["frequency"] - 0.667) < 0.01

        # Acne appears in 1 post: frequency = 1/3 ≈ 0.333
        acne_entry = next(item for item in master_list if item["symptom"] == "acne")
        assert abs(acne_entry["frequency"] - 0.333) < 0.01

    @pytest.mark.unit
    def test_master_list_sorted_by_frequency(self, aggregator):
        """Test that master list is sorted by post count."""
        aggregator.aggregate()
        master_list = aggregator.create_master_list()

        # Should be sorted by posts_appearing_in (descending)
        post_counts = [item["posts_appearing_in"] for item in master_list]
        assert post_counts == sorted(post_counts, reverse=True)

    @pytest.mark.unit
    def test_most_common_category_selected(self, aggregator):
        """Test that most common category is selected."""
        aggregator.aggregate()
        master_list = aggregator.create_master_list()

        brain_fog_entry = next(item for item in master_list if item["symptom"] == "brain fog")
        assert brain_fog_entry["category"] == "cognitive"

    @pytest.mark.unit
    def test_sample_quotes_limited_to_five(self, aggregator):
        """Test that sample quotes are limited to 5."""
        # Create aggregator with many quotes
        extractions_many_quotes = [
            {
                "post_id": f"post{i}",
                "symptoms": [{
                    "symptom": "test_symptom",
                    "surprise_signal": False,
                    "category": "test",
                    "quote": f"Quote {i}"
                }]
            }
            for i in range(10)
        ]

        agg = SymptomAggregator(extractions_many_quotes)
        agg.aggregate()
        master_list = agg.create_master_list()

        test_entry = next(item for item in master_list if item["symptom"] == "test_symptom")
        # Should limit to 5 quotes
        assert len(test_entry["sample_quotes"]) == 5

    @pytest.mark.unit
    def test_empty_symptom_ignored(self):
        """Test that empty symptom strings are ignored."""
        extractions = [
            {
                "post_id": "post1",
                "symptoms": [
                    {"symptom": "", "surprise_signal": False, "category": "test"},
                    {"symptom": "  ", "surprise_signal": False, "category": "test"},
                    {"symptom": "valid_symptom", "surprise_signal": False, "category": "test"}
                ]
            }
        ]

        agg = SymptomAggregator(extractions)
        result = agg.aggregate()

        # Should only have valid_symptom
        assert "valid_symptom" in result
        assert "" not in result
        assert "  " not in result

    @pytest.mark.unit
    def test_case_normalization(self):
        """Test that symptoms are normalized to lowercase."""
        extractions = [
            {
                "post_id": "post1",
                "symptoms": [
                    {"symptom": "Brain Fog", "surprise_signal": False, "category": "test"},
                    {"symptom": "BRAIN FOG", "surprise_signal": False, "category": "test"},
                    {"symptom": "brain fog", "surprise_signal": False, "category": "test"}
                ]
            }
        ]

        agg = SymptomAggregator(extractions)
        result = agg.aggregate()

        # All should be normalized to lowercase "brain fog"
        assert "brain fog" in result
        assert result["brain fog"]["mentions"] == 3
        assert "Brain Fog" not in result
        assert "BRAIN FOG" not in result


class TestSymptomAggregatorIntegration:
    """Integration tests for symptom aggregator."""

    @pytest.mark.integration
    def test_complete_aggregation_workflow(self):
        """Test complete aggregation workflow with realistic data."""
        extractions = [
            {
                "post_id": f"post{i}",
                "symptoms": [
                    {"symptom": "brain fog", "surprise_signal": True, "category": "cognitive", "quote": f"Quote {i}"},
                    {"symptom": "fatigue", "surprise_signal": False, "category": "energy", "quote": f"Tired {i}"}
                ]
            }
            for i in range(20)
        ]

        agg = SymptomAggregator(extractions)
        symptom_data = agg.aggregate()
        master_list = agg.create_master_list()

        # Verify complete workflow
        assert len(symptom_data) == 2
        assert len(master_list) == 2

        # Verify data consistency
        for item in master_list:
            symptom = item["symptom"]
            assert item["mentions"] == symptom_data[symptom]["mentions"]
            assert item["posts_appearing_in"] == len(symptom_data[symptom]["posts"])
            assert item["surprise_signals"] == symptom_data[symptom]["surprise_signals"]
