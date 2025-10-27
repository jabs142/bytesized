"""
Text Cleaning and PII Removal
===============================
Ethical data handling for privacy protection.

LEARNING CONCEPTS:
- PII (Personally Identifiable Information) detection
- Text preprocessing for NLP
- Regular expressions for pattern matching
- Data anonymization techniques
"""

import re
from typing import List, Dict, Optional
import hashlib


class TextCleaner:
    """
    Cleans and anonymizes text data for ethical NLP analysis.

    ETHICS IN AI/ML:
    - Remove PII before any analysis or storage
    - Anonymize data that could identify individuals
    - Follow privacy regulations (GDPR, HIPAA-like principles)
    """

    def __init__(self):
        """Initialize text cleaning patterns."""

        # Regex patterns for PII detection
        # LEARNING: Regular expressions are powerful for pattern matching

        # Email pattern: matches most email formats
        self.email_pattern = re.compile(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        )

        # Phone number patterns (US format, can be extended)
        self.phone_pattern = re.compile(
            r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b'
        )

        # Social Security Number pattern (XXX-XX-XXXX)
        self.ssn_pattern = re.compile(
            r'\b\d{3}-\d{2}-\d{4}\b'
        )

        # URLs - not strictly PII but may contain identifying info
        self.url_pattern = re.compile(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        )

        # Reddit username mentions (u/username)
        self.reddit_user_pattern = re.compile(
            r'\b/?u/[A-Za-z0-9_-]+'
        )

        # Subreddit mentions (r/subreddit) - keep these, they're topic indicators
        # We'll handle these separately

    def remove_pii(self, text: str, replacement: str = '[REMOVED]') -> str:
        """
        Remove personally identifiable information from text.

        LEARNING: PII Removal Pipeline
        - Apply multiple regex patterns
        - Replace matches with placeholders
        - Preserve text structure for NLP

        Args:
            text: Input text
            replacement: What to replace PII with

        Returns:
            Cleaned text with PII removed
        """

        if not text:
            return text

        # Create a copy to modify
        cleaned = text

        # Remove emails
        cleaned = self.email_pattern.sub(replacement, cleaned)

        # Remove phone numbers
        cleaned = self.phone_pattern.sub(replacement, cleaned)

        # Remove SSNs
        cleaned = self.ssn_pattern.sub(replacement, cleaned)

        # Remove URLs (optional - may want to keep for context)
        cleaned = self.url_pattern.sub('[URL]', cleaned)

        # Remove Reddit username mentions
        cleaned = self.reddit_user_pattern.sub('[USER]', cleaned)

        return cleaned

    def basic_clean(self, text: str) -> str:
        """
        Basic text cleaning for NLP preprocessing.

        LEARNING: Text Preprocessing Steps
        1. Remove extra whitespace
        2. Normalize line breaks
        3. Remove special characters (optional, task-dependent)

        Why preprocess?
        - Reduces noise in data
        - Improves NLP model performance
        - Standardizes text format
        """

        if not text:
            return ""

        # Remove excessive whitespace
        cleaned = re.sub(r'\s+', ' ', text)

        # Remove leading/trailing whitespace
        cleaned = cleaned.strip()

        # Normalize line breaks
        cleaned = re.sub(r'\n+', '\n', cleaned)

        return cleaned

    def clean_post(self, post_data: Dict) -> Dict:
        """
        Clean a single Reddit post dictionary.

        LEARNING: Data Pipeline Design
        - Apply transformations to structured data
        - Preserve original data structure
        - Add metadata about cleaning
        """

        cleaned = post_data.copy()

        # Clean title
        if 'title' in cleaned:
            cleaned['title'] = self.remove_pii(cleaned['title'])
            cleaned['title'] = self.basic_clean(cleaned['title'])

        # Clean body text
        if 'selftext' in cleaned:
            cleaned['selftext'] = self.remove_pii(cleaned['selftext'])
            cleaned['selftext'] = self.basic_clean(cleaned['selftext'])

            # Update text length after cleaning
            cleaned['text_length'] = len(cleaned['selftext'])

        # Add cleaning metadata
        cleaned['cleaned'] = True
        cleaned['cleaning_version'] = '1.0'

        return cleaned

    def clean_dataset(self, posts: List[Dict]) -> List[Dict]:
        """
        Clean an entire dataset of posts.

        Args:
            posts: List of post dictionaries

        Returns:
            List of cleaned post dictionaries
        """

        return [self.clean_post(post) for post in posts]

    @staticmethod
    def anonymize_id(original_id: str) -> str:
        """
        Create anonymous hash of an ID for deduplication without exposing original.

        LEARNING: Cryptographic Hashing
        - One-way function: can't reverse to get original
        - Same input always produces same output (deterministic)
        - Used for anonymous deduplication

        Args:
            original_id: Original Reddit post ID

        Returns:
            Anonymized hash
        """

        return hashlib.sha256(original_id.encode()).hexdigest()[:16]


def main():
    """
    Example usage and testing of text cleaning functions.
    """

    cleaner = TextCleaner()

    # Test examples
    test_texts = [
        "Contact me at john.doe@email.com or call 555-123-4567",
        "Check out u/someuser's post about this",
        "I've been on the pill for 3 years and my mood has been terrible",
        "Visit https://example.com/my-personal-blog for more info"
    ]

    print("Text Cleaning Examples:")
    print("=" * 60)

    for text in test_texts:
        cleaned = cleaner.remove_pii(text)
        print(f"\nOriginal: {text}")
        print(f"Cleaned:  {cleaned}")


if __name__ == '__main__':
    main()
