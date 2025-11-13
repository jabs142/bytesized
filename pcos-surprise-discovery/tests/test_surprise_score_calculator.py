"""
Tests for Surprise Score Calculator
===================================
Tests the surprise score calculation logic for PCOS symptoms.
"""

import pytest
from src.validation.surprise_score_calculator import SurpriseScoreCalculator


class TestSurpriseScoreCalculator:
    """Test suite for surprise score calculation."""

    @pytest.fixture
    def official_criteria(self):
        """Create mock official PCOS diagnostic criteria."""
        return {
            "diagnostic_core_features": [
                "irregular_periods",
                "hirsutism",
                "polycystic_ovaries"
            ],
            "associated_but_not_diagnostic": [
                "acne",
                "weight_gain",
                "insulin_resistance"
            ]
        }

    @pytest.fixture
    def calculator(self, official_criteria):
        """Create calculator instance."""
        return SurpriseScoreCalculator(official_criteria)

    @pytest.mark.unit
    def test_diagnostic_criteria_detection(self, calculator):
        """Test detection of symptoms in diagnostic criteria."""
        # Should detect normalized symptoms
        assert calculator.is_in_diagnostic_criteria("irregular periods")
        assert calculator.is_in_diagnostic_criteria("hirsutism")
        assert calculator.is_in_diagnostic_criteria("polycystic ovaries")

        # Should not detect non-diagnostic symptoms
        assert not calculator.is_in_diagnostic_criteria("brain fog")
        assert not calculator.is_in_diagnostic_criteria("fatigue")

    @pytest.mark.unit
    def test_awareness_estimation_high(self, calculator):
        """Test that common PCOS symptoms get high awareness."""
        high_awareness_symptoms = [
            "irregular periods",
            "facial hair growth",
            "acne breakout",
            "weight gain issues",
            "ovarian cysts"
        ]

        for symptom in high_awareness_symptoms:
            awareness = calculator.estimate_awareness(symptom)
            assert awareness == "high", f"Expected high awareness for '{symptom}'"

    @pytest.mark.unit
    def test_awareness_estimation_low(self, calculator):
        """Test that surprising symptoms get low awareness."""
        low_awareness_symptoms = [
            "sleep apnea",
            "skin tags",
            "depression symptoms",
            "brain fog",
            "chronic fatigue",
            "migraine headaches"
        ]

        for symptom in low_awareness_symptoms:
            awareness = calculator.estimate_awareness(symptom)
            assert awareness == "low", f"Expected low awareness for '{symptom}'"

    @pytest.mark.unit
    def test_awareness_estimation_medium(self, calculator):
        """Test that other symptoms get medium awareness."""
        medium_symptoms = [
            "mood swings",
            "digestive issues",
            "joint pain"
        ]

        for symptom in medium_symptoms:
            awareness = calculator.estimate_awareness(symptom)
            assert awareness == "medium", f"Expected medium awareness for '{symptom}'"

    @pytest.mark.unit
    def test_calculate_surprise_score_basic(self, calculator):
        """Test basic surprise score calculation."""
        symptom_data = {
            "symptom": "brain_fog",
            "frequency": 0.25,  # 25% of posts
            "surprise_signals": 5,
            "pubmed_validation": {
                "has_research": True,
                "total_papers": 2
            }
        }

        result = calculator.calculate_surprise_score(symptom_data)

        # Should return dict with score and classification
        assert "surprise_score" in result
        assert "classification" in result
        assert isinstance(result["surprise_score"], (int, float))
        assert result["surprise_score"] > 0

    @pytest.mark.unit
    def test_surprise_score_not_in_criteria_multiplier(self, calculator):
        """Test that symptoms not in diagnostic criteria get boosted."""
        # Diagnostic symptom
        diagnostic_data = {
            "symptom": "irregular_periods",
            "frequency": 0.5,
            "surprise_signals": 0,
            "pubmed_validation": {"has_research": True, "total_papers": 10}
        }

        # Non-diagnostic symptom with same frequency
        non_diagnostic_data = {
            "symptom": "brain_fog",
            "frequency": 0.5,
            "surprise_signals": 0,
            "pubmed_validation": {"has_research": True, "total_papers": 10}
        }

        diag_result = calculator.calculate_surprise_score(diagnostic_data)
        non_diag_result = calculator.calculate_surprise_score(non_diagnostic_data)

        # Non-diagnostic should score higher
        assert non_diag_result["surprise_score"] > diag_result["surprise_score"]

    @pytest.mark.unit
    def test_surprise_score_low_awareness_multiplier(self, calculator):
        """Test that low awareness symptoms get boosted."""
        # High awareness symptom
        high_awareness_data = {
            "symptom": "acne",
            "frequency": 0.3,
            "surprise_signals": 0,
            "pubmed_validation": {"has_research": True, "total_papers": 10}
        }

        # Low awareness symptom with same frequency
        low_awareness_data = {
            "symptom": "sleep_apnea",
            "frequency": 0.3,
            "surprise_signals": 0,
            "pubmed_validation": {"has_research": True, "total_papers": 10}
        }

        high_result = calculator.calculate_surprise_score(high_awareness_data)
        low_result = calculator.calculate_surprise_score(low_awareness_data)

        # Low awareness should score higher
        assert low_result["surprise_score"] > high_result["surprise_score"]

    @pytest.mark.unit
    def test_surprise_score_classification(self, calculator):
        """Test surprise score classification into categories."""
        # Very high surprise
        high_data = {
            "symptom": "sleep_apnea",  # Not in criteria, low awareness
            "frequency": 0.4,
            "surprise_signals": 10,
            "pubmed_validation": {"has_research": False, "total_papers": 0}
        }

        result = calculator.calculate_surprise_score(high_data)
        assert result["classification"] in ["very_surprising", "somewhat_surprising", "expected"]

    @pytest.mark.unit
    def test_surprise_score_edge_cases(self, calculator):
        """Test edge cases in surprise scoring."""
        # Zero frequency
        zero_freq_data = {
            "symptom": "test",
            "frequency": 0.0,
            "surprise_signals": 0,
            "pubmed_validation": {"has_research": False, "total_papers": 0}
        }

        result = calculator.calculate_surprise_score(zero_freq_data)
        assert result["surprise_score"] >= 0

        # Very high frequency
        high_freq_data = {
            "symptom": "test2",
            "frequency": 1.0,
            "surprise_signals": 0,
            "pubmed_validation": {"has_research": False, "total_papers": 0}
        }

        result = calculator.calculate_surprise_score(high_freq_data)
        assert result["surprise_score"] > 0


class TestSurpriseScoreIntegration:
    """Integration tests for surprise score calculator."""

    @pytest.fixture
    def calculator(self):
        """Create calculator with realistic criteria."""
        criteria = {
            "diagnostic_core_features": [
                "irregular_periods", "hirsutism", "polycystic_ovaries"
            ],
            "associated_but_not_diagnostic": [
                "acne", "weight_gain"
            ]
        }
        return SurpriseScoreCalculator(criteria)

    @pytest.mark.integration
    def test_realistic_symptom_scoring(self, calculator):
        """Test scoring with realistic symptom data."""
        symptoms = [
            {
                "symptom": "brain_fog",
                "frequency": 0.35,
                "surprise_signals": 12,
                "pubmed_validation": {"has_research": True, "total_papers": 3}
            },
            {
                "symptom": "irregular_periods",
                "frequency": 0.85,
                "surprise_signals": 0,
                "pubmed_validation": {"has_research": True, "total_papers": 50}
            },
            {
                "symptom": "skin_tags",
                "frequency": 0.18,
                "surprise_signals": 8,
                "pubmed_validation": {"has_research": True, "total_papers": 1}
            }
        ]

        results = [calculator.calculate_surprise_score(s) for s in symptoms]

        # All should have valid scores
        for result in results:
            assert "surprise_score" in result
            assert result["surprise_score"] >= 0

        # Brain fog should be more surprising than irregular periods
        assert results[0]["surprise_score"] > results[1]["surprise_score"]
