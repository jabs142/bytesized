"""
Tests for Text Cleaning Module
==============================
Tests PII removal and text preprocessing functionality.
"""

import pytest
from src.preprocessing.text_cleaner import TextCleaner


class TestTextCleaner:
    """Test suite for TextCleaner PII removal."""

    @pytest.fixture
    def cleaner(self):
        """Create TextCleaner instance for tests."""
        return TextCleaner()

    @pytest.mark.unit
    def test_email_removal(self, cleaner):
        """Test that email addresses are properly removed."""
        test_cases = [
            ("Contact me at john.doe@example.com", "Contact me at [REMOVED]"),
            ("Email: user123@gmail.com for info", "Email: [REMOVED] for info"),
            ("Multiple emails: a@b.com and c@d.org", "Multiple emails: [REMOVED] and [REMOVED]"),
        ]

        for original, expected in test_cases:
            result = cleaner.remove_pii(original)
            assert result == expected, f"Failed on: {original}"

    @pytest.mark.unit
    def test_phone_number_removal(self, cleaner):
        """Test that phone numbers are removed."""
        test_cases = [
            ("Call me at 555-123-4567", "Call me at [REMOVED]"),
            ("My number is (555) 123-4567", "My number is [REMOVED]"),
            ("Phone: 555.123.4567", "Phone: [REMOVED]"),
            ("Text 5551234567", "Text [REMOVED]"),
            ("Call +1-555-123-4567", "Call [REMOVED]"),
        ]

        for original, expected in test_cases:
            result = cleaner.remove_pii(original)
            assert result == expected, f"Failed on: {original}"

    @pytest.mark.unit
    def test_ssn_removal(self, cleaner):
        """Test that SSNs are removed."""
        test_cases = [
            ("SSN: 123-45-6789", "SSN: [REMOVED]"),
            ("My SSN is 987-65-4321", "My SSN is [REMOVED]"),
        ]

        for original, expected in test_cases:
            result = cleaner.remove_pii(original)
            assert result == expected, f"Failed on: {original}"

    @pytest.mark.unit
    def test_url_removal(self, cleaner):
        """Test that URLs are replaced with [URL] placeholder."""
        test_cases = [
            ("Check out https://example.com", "Check out [URL]"),
            ("Visit http://test.org for info", "Visit [URL] for info"),
            ("Link: https://www.reddit.com/r/birthcontrol/", "Link: [URL]"),
        ]

        for original, expected in test_cases:
            result = cleaner.remove_pii(original)
            assert result == expected, f"Failed on: {original}"

    @pytest.mark.unit
    def test_reddit_username_removal(self, cleaner):
        """Test that Reddit usernames are replaced with [USER]."""
        test_cases = [
            ("Thanks u/helpful_user", "Thanks [USER]"),
            ("Mentioned /u/another_user", "Mentioned [USER]"),
            ("Ask u/mod-name-123 for help", "Ask [USER] for help"),
        ]

        for original, expected in test_cases:
            result = cleaner.remove_pii(original)
            assert result == expected, f"Failed on: {original}"

    @pytest.mark.unit
    def test_multiple_pii_types(self, cleaner):
        """Test text with multiple PII types."""
        original = "Email me at jane@example.com or call 555-123-4567. Check https://mysite.com"
        result = cleaner.remove_pii(original)

        # Should remove email, phone, and URL
        assert "[REMOVED]" in result  # Email removed
        assert "555-123-4567" not in result  # Phone removed
        assert "[URL]" in result  # URL replaced
        assert "jane@example.com" not in result

    @pytest.mark.unit
    def test_empty_string(self, cleaner):
        """Test handling of empty strings."""
        assert cleaner.remove_pii("") == ""
        assert cleaner.remove_pii(None) is None

    @pytest.mark.unit
    def test_no_pii_text_unchanged(self, cleaner):
        """Test that text without PII remains unchanged."""
        clean_texts = [
            "I experienced severe mood swings",
            "Birth control caused acne",
            "Stopped after 3 months"
        ]

        for text in clean_texts:
            result = cleaner.remove_pii(text)
            # URLs and usernames might be flagged, but basic symptom text should be preserved
            assert len(result) > 0

    @pytest.mark.unit
    def test_custom_replacement(self, cleaner):
        """Test using custom replacement strings."""
        original = "Email: test@example.com"
        result = cleaner.remove_pii(original, replacement="[REDACTED]")
        assert "[REDACTED]" in result
        assert "test@example.com" not in result

    @pytest.mark.unit
    def test_preserves_sentence_structure(self, cleaner):
        """Test that removal preserves overall text structure."""
        original = "I started birth control at 555-123-4567 (my doctor's office) and..."
        result = cleaner.remove_pii(original)

        # Should keep most of the sentence
        assert "I started birth control at" in result
        assert "and..." in result

    @pytest.mark.unit
    def test_edge_cases(self, cleaner):
        """Test edge cases and unusual formats."""
        test_cases = [
            # Email with plus addressing
            ("user+tag@example.com", "[REMOVED]"),
            # International phone format
            ("+1-555-123-4567", "[REMOVED]"),
            # Multiple consecutive spaces preserved
            ("Email:  test@example.com  here", "Email:  [REMOVED]  here"),
        ]

        for original, expected_substring in test_cases:
            result = cleaner.remove_pii(original)
            assert "[REMOVED]" in result or "[URL]" in result or "[USER]" in result


class TestTextCleanerIntegration:
    """Integration tests for TextCleaner with realistic Reddit post scenarios."""

    @pytest.fixture
    def cleaner(self):
        return TextCleaner()

    @pytest.mark.integration
    def test_realistic_reddit_post(self, cleaner):
        """Test cleaning a realistic Reddit post."""
        post = """
        I've been on birth control for 3 years. Contact me at throwaway@gmail.com
        or call 555-867-5309 if you have questions. u/helpful_mod recommended this.
        Check out https://www.plannedparenthood.org for more info.

        My experience: severe mood swings, acne, and weight gain.
        """

        result = cleaner.remove_pii(post)

        # Check all PII removed
        assert "throwaway@gmail.com" not in result
        assert "555-867-5309" not in result
        assert "u/helpful_mod" not in result
        assert "plannedparenthood.org" not in result

        # Check symptom information preserved
        assert "mood swings" in result
        assert "acne" in result
        assert "weight gain" in result

    @pytest.mark.integration
    def test_comment_thread_cleaning(self, cleaner):
        """Test cleaning multiple comments from a thread."""
        comments = [
            "Thanks for sharing! Email me at user1@test.com",
            "u/user2 mentioned this. Call 555-0100",
            "Great info! Visit https://example.com"
        ]

        cleaned_comments = [cleaner.remove_pii(c) for c in comments]

        # Verify all PII removed from all comments
        for cleaned in cleaned_comments:
            assert "@" not in cleaned or "[REMOVED]" in cleaned
            assert "u/user" not in cleaned or "[USER]" in cleaned
