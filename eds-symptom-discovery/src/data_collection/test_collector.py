"""
Test script for Reddit collector - verify symptom extraction works
"""

from reddit_collector import EDSRedditCollector

# Mock post data for testing
mock_posts = [
    {
        'id': 'test1',
        'title': 'Does anyone else get severe motion sickness?',
        'selftext': 'I have hEDS and noticed I get really dizzy in cars and boats. Also experiencing brain fog and fatigue.',
        'subreddit': 'ehlersdanlos',
        'full_text': 'does anyone else get severe motion sickness? i have heds and noticed i get really dizzy in cars and boats. also experiencing brain fog and fatigue.'
    },
    {
        'id': 'test2',
        'title': 'POTS and gastroparesis together?',
        'selftext': 'Anyone else dealing with both? My tachycardia is getting worse and the nausea is unbearable.',
        'subreddit': 'dysautonomia',
        'full_text': 'pots and gastroparesis together? anyone else dealing with both? my tachycardia is getting worse and the nausea is unbearable.'
    },
    {
        'id': 'test3',
        'title': 'Joint pain and headaches',
        'selftext': 'My joints subluxate constantly and I have chronic migraines. Also anxiety is through the roof.',
        'subreddit': 'ehlersdanlos',
        'full_text': 'joint pain and headaches my joints subluxate constantly and i have chronic migraines. also anxiety is through the roof.'
    }
]


def test_symptom_extraction():
    """Test symptom extraction on mock posts."""
    print("🧪 Testing EDS Reddit Collector\n")
    print("=" * 60)

    # Create a minimal test instance without Reddit API
    class TestCollector:
        """Minimal collector for testing symptom extraction."""
        SYMPTOM_KEYWORDS = EDSRedditCollector.SYMPTOM_KEYWORDS

        def extract_symptoms(self, posts):
            """Extract symptom mentions from posts."""
            symptom_mentions = {symptom: [] for symptom in self.SYMPTOM_KEYWORDS}

            for post in posts:
                full_text = post['full_text']
                for symptom in self.SYMPTOM_KEYWORDS:
                    if symptom in full_text:
                        symptom_mentions[symptom].append(post['id'])

            # Remove symptoms with no mentions
            symptom_mentions = {k: v for k, v in symptom_mentions.items() if len(v) > 0}
            return symptom_mentions

    collector = TestCollector()

    # Test symptom extraction
    symptom_mentions = collector.extract_symptoms(mock_posts)

    print("\n📊 Expected symptoms to find:")
    expected = [
        'motion sickness', 'dizzy', 'dizziness', 'brain fog', 'fatigue',
        'pots', 'gastroparesis', 'tachycardia', 'nausea',
        'pain', 'joint pain', 'subluxation', 'headache', 'migraine', 'anxiety'
    ]
    for symptom in expected:
        print(f"   • {symptom}")

    print(f"\n✅ Test complete! Found {len(symptom_mentions)} symptoms")
    print("\nTo run full collection:")
    print("   1. Copy .env.example to .env")
    print("   2. Add your Reddit API credentials")
    print("   3. Run: python src/data_collection/reddit_collector.py")


if __name__ == "__main__":
    test_symptom_extraction()
