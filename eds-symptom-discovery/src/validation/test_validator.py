"""
Test Evidence Validator with Mock Data
=======================================
Demonstrates the validation pipeline with sample symptom data.
"""

import json
import os
from evidence_validator import EvidenceValidator


def create_mock_reddit_data():
    """Create mock Reddit symptom data for testing."""
    return [
        {
            "symptom": "motion sickness",
            "mention_count": 89,
            "frequency": 0.223,  # 22.3% of posts
            "post_ids": ["abc123", "def456"]
        },
        {
            "symptom": "brain fog",
            "mention_count": 145,
            "frequency": 0.363,  # 36.3% of posts
            "post_ids": ["ghi789", "jkl012"]
        },
        {
            "symptom": "joint pain",
            "mention_count": 201,
            "frequency": 0.503,  # 50.3% of posts
            "post_ids": ["mno345", "pqr678"]
        },
        {
            "symptom": "pots",
            "mention_count": 78,
            "frequency": 0.195,  # 19.5% of posts
            "post_ids": ["stu901", "vwx234"]
        },
        {
            "symptom": "fatigue",
            "mention_count": 167,
            "frequency": 0.418,  # 41.8% of posts
            "post_ids": ["yza567", "bcd890"]
        }
    ]


def test_validator():
    """Test the evidence validator with mock data."""
    print("🧪 Testing Evidence Validator\n")
    print("=" * 60)

    # Create validator
    validator = EvidenceValidator(pubmed_email="test@example.com")

    # Create mock data
    mock_data = create_mock_reddit_data()
    total_posts = 400

    print(f"📊 Mock Data: {len(mock_data)} symptoms, {total_posts} total posts\n")

    # Test validation on first 3 symptoms
    print("🔬 Validating top 3 symptoms with REAL PubMed searches...\n")

    validated = []
    for symptom_data in mock_data[:3]:
        try:
            result = validator.validate_symptom(symptom_data, total_posts)
            validated.append(result)
        except Exception as e:
            print(f"   ❌ Error: {e}")

    # Print results
    print("\n" + "=" * 60)
    print("📊 Validation Results")
    print("=" * 60)

    for result in validated:
        print(f"\n🔹 {result['symptom'].upper()}")
        print(f"   Tier: {result['tier_label']}")
        print(f"   Surprise: {result['surprise_score']:.3f} - {result['surprise_label']}")
        print(f"   Reddit: {result['reddit_data']['mention_count']} posts ({result['reddit_data']['frequency']*100:.1f}%)")
        print(f"   PubMed: {result['pubmed_data']['paper_count']} papers")

        if result['pubmed_data']['papers']:
            print(f"   Top paper: {result['pubmed_data']['papers'][0]['title'][:80]}...")

    print("\n✅ Test complete!")
    print("\nNext: Run `python src/validation/evidence_validator.py` with real Reddit data")


if __name__ == "__main__":
    test_validator()
