"""
Surprise Score Calculator
==========================
Shared utility for calculating surprise scores across projects.

The surprise score identifies symptoms/topics that are:
- Frequently discussed by patients (high Reddit mentions)
- Under-researched in medical literature (low PubMed coverage)

Used by:
- PCOS Project: PCOS symptom surprise rankings
- EDS Project: EDS symptom research gaps
- Birth Control Project: Side effect validation gaps

Formula:
    surprise_score = reddit_frequency × (1 - normalized_pubmed_coverage)

Where:
    - reddit_frequency: Proportion of posts mentioning the symptom (0-1)
    - normalized_pubmed_coverage: Papers found / max_expected_papers (0-1)
    - Higher scores indicate symptoms needing more research attention

Usage:
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
    level = classify_surprise_level(score)  # "very_surprising", "somewhat_surprising", or "expected"

    # Use calculator class for batch processing
    calculator = SurpriseScoreCalculator(max_papers=1000)
    results = calculator.calculate_batch(symptom_data)
"""

from typing import Dict, List, Literal, Optional, Tuple


def calculate_surprise_score(
    reddit_frequency: float,
    pubmed_paper_count: int,
    max_papers: int = 1000,
    min_reddit_frequency: float = 0.01
) -> float:
    """
    Calculate surprise score for a symptom/topic

    Args:
        reddit_frequency: Proportion of Reddit posts mentioning this symptom (0-1)
        pubmed_paper_count: Number of PubMed papers found for this symptom
        max_papers: Maximum papers expected for any symptom (for normalization)
        min_reddit_frequency: Minimum frequency threshold (filter out rare mentions)

    Returns:
        Surprise score (0-1), where higher = more surprising (under-researched)

    Example:
        >>> calculate_surprise_score(reddit_frequency=0.73, pubmed_paper_count=15)
        0.709  # High patient reports, low research -> surprising
    """
    # Filter out very rare symptoms
    if reddit_frequency < min_reddit_frequency:
        return 0.0

    # Normalize PubMed coverage (0 papers = 0, max_papers = 1)
    normalized_coverage = min(pubmed_paper_count / max_papers, 1.0)

    # Calculate surprise: high frequency + low coverage = high surprise
    surprise = reddit_frequency * (1 - normalized_coverage)

    return round(surprise, 3)


def classify_surprise_level(
    surprise_score: float,
    very_surprising_threshold: float = 0.5,
    somewhat_surprising_threshold: float = 0.2
) -> Literal["very_surprising", "somewhat_surprising", "expected"]:
    """
    Classify surprise score into categories

    Args:
        surprise_score: Calculated surprise score (0-1)
        very_surprising_threshold: Threshold for "very surprising" classification
        somewhat_surprising_threshold: Threshold for "somewhat surprising" classification

    Returns:
        Classification: "very_surprising", "somewhat_surprising", or "expected"

    Example:
        >>> classify_surprise_level(0.709)
        "very_surprising"
    """
    if surprise_score >= very_surprising_threshold:
        return "very_surprising"
    elif surprise_score >= somewhat_surprising_threshold:
        return "somewhat_surprising"
    else:
        return "expected"


def get_classification_emoji(classification: str) -> str:
    """
    Get emoji for surprise classification

    Args:
        classification: Surprise level classification

    Returns:
        Emoji string
    """
    emoji_map = {
        "very_surprising": "🔥",
        "somewhat_surprising": "⚠️",
        "expected": "✓"
    }
    return emoji_map.get(classification, "❓")


class SurpriseScoreCalculator:
    """
    Calculator class for batch surprise score processing
    """

    def __init__(
        self,
        max_papers: int = 1000,
        min_reddit_frequency: float = 0.01,
        very_surprising_threshold: float = 0.5,
        somewhat_surprising_threshold: float = 0.2
    ):
        """
        Initialize calculator with configuration

        Args:
            max_papers: Maximum expected papers for normalization
            min_reddit_frequency: Minimum frequency to consider
            very_surprising_threshold: Threshold for "very surprising"
            somewhat_surprising_threshold: Threshold for "somewhat surprising"
        """
        self.max_papers = max_papers
        self.min_reddit_frequency = min_reddit_frequency
        self.very_surprising_threshold = very_surprising_threshold
        self.somewhat_surprising_threshold = somewhat_surprising_threshold

    def calculate(
        self,
        reddit_frequency: float,
        pubmed_paper_count: int
    ) -> Tuple[float, str]:
        """
        Calculate surprise score and classification

        Args:
            reddit_frequency: Reddit mention frequency
            pubmed_paper_count: Number of PubMed papers

        Returns:
            Tuple of (surprise_score, classification)
        """
        score = calculate_surprise_score(
            reddit_frequency,
            pubmed_paper_count,
            self.max_papers,
            self.min_reddit_frequency
        )

        classification = classify_surprise_level(
            score,
            self.very_surprising_threshold,
            self.somewhat_surprising_threshold
        )

        return score, classification

    def calculate_batch(
        self,
        items: List[Dict],
        reddit_freq_key: str = 'reddit_frequency',
        pubmed_count_key: str = 'pubmed_papers'
    ) -> List[Dict]:
        """
        Calculate surprise scores for a batch of items

        Args:
            items: List of dictionaries containing symptom data
            reddit_freq_key: Key for Reddit frequency in items
            pubmed_count_key: Key for PubMed paper count in items

        Returns:
            List of items with added 'surprise_score' and 'classification' fields

        Example:
            >>> calculator = SurpriseScoreCalculator()
            >>> symptoms = [
            ...     {'symptom': 'fatigue', 'reddit_frequency': 0.73, 'pubmed_papers': 15},
            ...     {'symptom': 'acne', 'reddit_frequency': 0.45, 'pubmed_papers': 120}
            ... ]
            >>> results = calculator.calculate_batch(symptoms)
        """
        results = []

        for item in items:
            reddit_freq = item.get(reddit_freq_key, 0.0)
            pubmed_count = item.get(pubmed_count_key, 0)

            score, classification = self.calculate(reddit_freq, pubmed_count)

            # Create result with all original fields plus new ones
            result = {**item}
            result['surprise_score'] = score
            result['classification'] = classification
            result['classification_emoji'] = get_classification_emoji(classification)

            results.append(result)

        # Sort by surprise score (descending)
        results.sort(key=lambda x: x['surprise_score'], reverse=True)

        return results

    def get_summary_stats(
        self,
        items: List[Dict]
    ) -> Dict[str, any]:
        """
        Get summary statistics for surprise scores

        Args:
            items: List of items with surprise_score field

        Returns:
            Dictionary with summary statistics
        """
        if not items:
            return {}

        scores = [item.get('surprise_score', 0.0) for item in items]
        classifications = [item.get('classification', 'expected') for item in items]

        return {
            'total_items': len(items),
            'mean_surprise': round(sum(scores) / len(scores), 3),
            'max_surprise': max(scores),
            'min_surprise': min(scores),
            'very_surprising_count': classifications.count('very_surprising'),
            'somewhat_surprising_count': classifications.count('somewhat_surprising'),
            'expected_count': classifications.count('expected'),
            'very_surprising_pct': round(classifications.count('very_surprising') / len(items) * 100, 1),
            'somewhat_surprising_pct': round(classifications.count('somewhat_surprising') / len(items) * 100, 1),
            'expected_pct': round(classifications.count('expected') / len(items) * 100, 1)
        }


# Convenience function for quick calculations

def rank_by_surprise(
    items: List[Dict],
    reddit_freq_key: str = 'reddit_frequency',
    pubmed_count_key: str = 'pubmed_papers',
    max_papers: int = 1000
) -> List[Dict]:
    """
    Rank items by surprise score (convenience wrapper)

    Args:
        items: List of symptom/topic dictionaries
        reddit_freq_key: Key for Reddit frequency
        pubmed_count_key: Key for PubMed papers
        max_papers: Maximum papers for normalization

    Returns:
        Sorted list with surprise scores added

    Example:
        >>> symptoms = [{'symptom': 'fatigue', 'reddit_frequency': 0.73, 'pubmed_papers': 15}]
        >>> ranked = rank_by_surprise(symptoms)
    """
    calculator = SurpriseScoreCalculator(max_papers=max_papers)
    return calculator.calculate_batch(items, reddit_freq_key, pubmed_count_key)
