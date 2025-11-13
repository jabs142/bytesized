"""
Tests for Side Effect Standardization Module
============================================
Tests the standardization of side effect names to canonical forms.
"""

import pytest
from src.analysis.side_effect_standardization import (
    standardize_side_effect,
    STANDARDIZATION_RULES
)


class TestSideEffectStandardization:
    """Test suite for side effect name standardization."""

    @pytest.mark.unit
    def test_pmdd_variations(self):
        """Test that all PMDD variations map to canonical form."""
        pmdd_variants = [
            "premenstrual dysphoric disorder (PMDD)",
            "premenstrual dysphoric disorder (pmdd)",
            "PMDD",
            "severe PMDD",
            "PMDD episodes",
            "PMDD symptoms"
        ]

        expected = "premenstrual dysphoric disorder"
        for variant in pmdd_variants:
            assert standardize_side_effect(variant) == expected, \
                f"Failed to standardize '{variant}' to '{expected}'"

    @pytest.mark.unit
    def test_acne_variations(self):
        """Test that acne variations map to 'acne'."""
        acne_variants = [
            "severe acne",
            "acne exacerbation",
            "cystic acne",
            "hormonal acne",
            "acne flare-ups"
        ]

        expected = "acne"
        for variant in acne_variants:
            assert standardize_side_effect(variant) == expected

    @pytest.mark.unit
    def test_libido_variations(self):
        """Test libido variations map to 'decreased libido'."""
        libido_variants = [
            "low libido",
            "loss of libido",
            "no sex drive",
            "reduced libido"
        ]

        expected = "decreased libido"
        for variant in libido_variants:
            assert standardize_side_effect(variant) == expected

    @pytest.mark.unit
    def test_heavy_bleeding_variations(self):
        """Test heavy bleeding variations."""
        bleeding_variants = [
            "menorrhagia",
            "heavy periods",
            "excessive bleeding",
            "heavy bleeding"
        ]

        expected = "heavy menstrual flow"
        for variant in bleeding_variants:
            assert standardize_side_effect(variant) == expected

    @pytest.mark.unit
    def test_mood_variations(self):
        """Test mood variations map to 'mood swings'."""
        mood_variants = [
            "mood instability",
            "emotional instability",
            "mood changes",
            "emotional lability"
        ]

        expected = "mood swings"
        for variant in mood_variants:
            assert standardize_side_effect(variant) == expected

    @pytest.mark.unit
    def test_hair_loss_variations(self):
        """Test hair loss variations."""
        hair_variants = [
            "alopecia",
            "hair thinning",
            "extreme hair loss"
        ]

        expected = "hair loss"
        for variant in hair_variants:
            assert standardize_side_effect(variant) == expected

    @pytest.mark.unit
    def test_brain_fog_variations(self):
        """Test cognitive variations map to 'brain fog'."""
        cognitive_variants = [
            "cognitive dysfunction",
            "cognitive issues",
            "mental fog"
        ]

        expected = "brain fog"
        for variant in cognitive_variants:
            assert standardize_side_effect(variant) == expected

    @pytest.mark.unit
    def test_pain_variations(self):
        """Test pain variations map to 'painful periods'."""
        pain_variants = [
            "dysmenorrhea",
            "cramps",
            "menstrual pain"
        ]

        expected = "painful periods"
        for variant in pain_variants:
            assert standardize_side_effect(variant) == expected

    @pytest.mark.unit
    def test_case_insensitive_matching(self):
        """Test that standardization works regardless of case."""
        # Test uppercase
        assert standardize_side_effect("PMDD") == "premenstrual dysphoric disorder"

        # Test mixed case
        assert standardize_side_effect("PmDd") == "premenstrual dysphoric disorder"

        # Test lowercase
        assert standardize_side_effect("pmdd") == "premenstrual dysphoric disorder"

    @pytest.mark.unit
    def test_unstandardized_terms_return_original(self):
        """Test that terms without rules return original."""
        unknown_terms = [
            "headache",
            "nausea",
            "fatigue",
            "dizziness"
        ]

        for term in unknown_terms:
            assert standardize_side_effect(term) == term

    @pytest.mark.unit
    def test_empty_string(self):
        """Test handling of empty strings."""
        assert standardize_side_effect("") == ""

    @pytest.mark.unit
    def test_whitespace_preserved(self):
        """Test that whitespace in original terms is preserved."""
        # If not in standardization rules, should return as-is
        term_with_spaces = "  headache  "
        assert standardize_side_effect(term_with_spaces) == term_with_spaces

    @pytest.mark.unit
    def test_all_rules_have_lowercase_variants(self):
        """Verify standardization rules consistency."""
        # Check that we can handle both exact and lowercase matches
        for original, standardized in STANDARDIZATION_RULES.items():
            result = standardize_side_effect(original)
            assert result == standardized, \
                f"Rule {original} -> {standardized} failed"

    @pytest.mark.unit
    def test_standardization_is_idempotent(self):
        """Test that standardizing twice gives same result."""
        test_terms = [
            "PMDD",
            "severe acne",
            "low libido",
            "menorrhagia"
        ]

        for term in test_terms:
            first_pass = standardize_side_effect(term)
            second_pass = standardize_side_effect(first_pass)
            assert first_pass == second_pass, \
                "Standardization should be idempotent"
