"""
Evidence Validation Pipeline for Birth Control Side Effects
============================================================
Combines Reddit side effect data with PubMed research to validate side effect-birth control
relationships and calculate "surprise scores" for hidden side effects.

Pipeline:
1. Load Reddit side effect statistics (from LLM or NLP extraction)
2. Search PubMed for each side effect + birth control
3. Calculate surprise scores (high Reddit + low PubMed = surprise)
4. Assign evidence tiers (1-4)
5. Output validated side effect database
"""

import json
import os
import sys
from typing import List, Dict, Optional
from collections import defaultdict

# Add parent directory to path to import PubMedFetcher
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_collection.pubmed_fetcher import PubMedFetcher


class EvidenceValidator:
    """
    Validates side effect-birth control relationships using multi-source evidence.

    Evidence Tiers:
    - Tier 1: FDA-listed side effects (🏆)
    - Tier 2: Research-backed (3+ PubMed papers) (✅)
    - Tier 3: Strong patient signal (50+ Reddit mentions) (💬)
    - Tier 4: Emerging pattern (needs more research) (⚠️)
    """

    # FDA-listed common birth control side effects (Tier 1)
    FDA_LISTED_SIDE_EFFECTS = [
        "nausea",
        "headache",
        "breast tenderness",
        "weight gain",
        "mood changes",
        "irregular bleeding",
        "spotting",
        "blood clots",
        "high blood pressure",
        "stroke",
        "heart attack",
        "depression",
        "decreased libido"
    ]

    # Thresholds for evidence tiers
    TIER_2_PUBMED_THRESHOLD = 3      # 3+ papers = research-backed
    TIER_3_REDDIT_THRESHOLD = 50      # 50+ mentions = strong patient signal

    # Surprise score thresholds
    HIGH_SURPRISE_THRESHOLD = 0.7    # 70%+ surprise = "hidden side effect"
    MEDIUM_SURPRISE_THRESHOLD = 0.4  # 40-70% = moderate surprise

    def __init__(self, pubmed_email: Optional[str] = None):
        """Initialize validator with PubMed fetcher."""
        self.pubmed = PubMedFetcher(email=pubmed_email)

    def load_reddit_data(self, filepath: str = 'data/analysis/llm_side_effect_stats.json') -> List[Dict]:
        """
        Load Reddit side effect statistics.

        Args:
            filepath: Path to side effect stats JSON

        Returns:
            List of side effect statistics
        """
        print(f"📂 Loading Reddit data from {filepath}...")

        if not os.path.exists(filepath):
            print(f"   ⚠️  File not found: {filepath}")
            print(f"   Trying alternative path...")

            # Try the pattern mining stats instead
            alt_path = 'data/patterns/stats.json'
            if os.path.exists(alt_path):
                print(f"   Loading from {alt_path}")
                with open(alt_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Convert pattern stats to side effect format
                side_effects = []
                if 'top_symptoms' in data:
                    for symptom, count in data['top_symptoms'].items():
                        side_effects.append({
                            'side_effect': symptom,
                            'mention_count': count,
                            'post_count': count,  # Approximation
                            'frequency': count / data.get('total_posts', 537),
                            'category': 'unknown'
                        })
                print(f"   ✓ Loaded {len(side_effects)} side effects from pattern mining")
                return side_effects
            else:
                print("   ❌ No side effect data found")
                return []

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        print(f"   ✓ Loaded {len(data)} side effects from Reddit")
        return data

    def search_pubmed_for_side_effect(self, side_effect: str, max_results: int = 10) -> Dict:
        """
        Search PubMed for research about side effect + birth control.

        Args:
            side_effect: Side effect to search for
            max_results: Max papers to fetch

        Returns:
            Dict with paper count and details
        """
        print(f"   🔬 Searching PubMed for '{side_effect}'...")

        papers = self.pubmed.search_side_effect_birth_control_relationship(
            side_effect,
            max_results=max_results
        )

        # Extract prevalence data if available
        prevalence_findings = []
        for paper in papers:
            prevalence = self.pubmed.extract_prevalence_data(paper, side_effect)
            if prevalence:
                prevalence_findings.append(prevalence)

        return {
            'paper_count': len(papers),
            'papers': papers,
            'prevalence_findings': prevalence_findings
        }

    def calculate_surprise_score(self, reddit_freq: float, paper_count: int) -> float:
        """
        Calculate surprise score: high patient reports + low research coverage.

        Formula: (patient_frequency) * (1 - research_coverage)
        where research_coverage = min(paper_count / 10, 1.0)

        Args:
            reddit_freq: Frequency of mentions in Reddit (0-1)
            paper_count: Number of PubMed papers found

        Returns:
            Surprise score (0-1)
        """
        # Normalize paper count to 0-1 scale (cap at 10 papers)
        research_coverage = min(paper_count / 10.0, 1.0)

        # Calculate surprise: high patient frequency + low research coverage
        surprise = reddit_freq * (1 - research_coverage)

        return round(surprise, 3)

    def assign_evidence_tier(self, side_effect: str,
                           mention_count: int,
                           paper_count: int) -> tuple:
        """
        Assign evidence tier based on multiple sources.

        Args:
            side_effect: Side effect name
            mention_count: Number of Reddit mentions
            paper_count: Number of PubMed papers

        Returns:
            Tuple of (tier_number, tier_label)
        """
        # Normalize side effect name for comparison
        side_effect_lower = side_effect.lower().strip()

        # Tier 1: FDA-listed
        if any(fda_effect in side_effect_lower for fda_effect in self.FDA_LISTED_SIDE_EFFECTS):
            return (1, "🏆 FDA-Listed")

        # Tier 2: Research-backed (3+ papers)
        if paper_count >= self.TIER_2_PUBMED_THRESHOLD:
            return (2, "✅ Research-Backed")

        # Tier 3: Strong patient signal (50+ mentions)
        if mention_count >= self.TIER_3_REDDIT_THRESHOLD:
            return (3, "💬 Patient-Validated")

        # Tier 4: Emerging pattern
        return (4, "⚠️ Emerging Pattern")

    def validate_all_side_effects(self, side_effects: List[Dict],
                                  total_posts: int) -> List[Dict]:
        """
        Validate all side effects with PubMed research.

        Args:
            side_effects: List of side effect stats from Reddit
            total_posts: Total number of Reddit posts analyzed

        Returns:
            List of validated side effects with evidence tiers
        """
        print(f"\n🔬 Evidence Validation Pipeline")
        print("=" * 60)
        print(f"Validating {len(side_effects)} side effects...")
        print(f"Total posts analyzed: {total_posts}\n")

        validated = []

        for i, side_effect_data in enumerate(side_effects, 1):
            side_effect = side_effect_data['side_effect']
            mention_count = side_effect_data.get('mention_count', 0)
            post_count = side_effect_data.get('post_count', 0)
            frequency = side_effect_data.get('frequency', 0)

            print(f"[{i}/{len(side_effects)}] Validating: {side_effect}")
            print(f"   Reddit: {mention_count} mentions, {post_count} posts ({frequency*100:.1f}%)")

            # Search PubMed
            pubmed_data = self.search_pubmed_for_side_effect(side_effect, max_results=10)

            # Calculate surprise score
            surprise_score = self.calculate_surprise_score(frequency, pubmed_data['paper_count'])

            # Assign evidence tier
            tier, tier_label = self.assign_evidence_tier(
                side_effect,
                mention_count,
                pubmed_data['paper_count']
            )

            print(f"   PubMed: {pubmed_data['paper_count']} papers")
            print(f"   Evidence: {tier_label}")
            print(f"   Surprise: {surprise_score:.3f}")

            # Create validated entry
            validated_entry = {
                'side_effect': side_effect,
                'evidence_tier': tier,
                'tier_label': tier_label,
                'surprise_score': surprise_score,
                'reddit_data': {
                    'mention_count': mention_count,
                    'post_count': post_count,
                    'frequency': frequency,
                    'category': side_effect_data.get('category', 'unknown'),
                    'examples': side_effect_data.get('examples', [])
                },
                'pubmed_data': {
                    'paper_count': pubmed_data['paper_count'],
                    'papers': [
                        {
                            'pmid': p['pmid'],
                            'title': p['title'],
                            'year': p['year'],
                            'url': p['url']
                        }
                        for p in pubmed_data['papers'][:5]  # Top 5 papers
                    ],
                    'prevalence_findings': pubmed_data['prevalence_findings']
                }
            }

            validated.append(validated_entry)
            print()

        # Sort by surprise score (highest first)
        validated.sort(key=lambda x: x['surprise_score'], reverse=True)

        print("✅ Validation complete!")
        return validated

    def save_validated_database(self, validated_side_effects: List[Dict],
                               output_path: str = 'data/validated'):
        """
        Save validated side effect database.

        Args:
            validated_side_effects: List of validated side effects
            output_path: Directory to save results
        """
        os.makedirs(output_path, exist_ok=True)

        # Save full database
        filename = f'{output_path}/validated_side_effects_database.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(validated_side_effects, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved validated database:")
        print(f"   {filename}")

        # Create summary stats
        summary = {
            'total_side_effects': len(validated_side_effects),
            'by_tier': {},
            'high_surprise': [
                {
                    'side_effect': se['side_effect'],
                    'surprise_score': se['surprise_score'],
                    'tier': se['tier_label']
                }
                for se in validated_side_effects
                if se['surprise_score'] >= self.HIGH_SURPRISE_THRESHOLD
            ],
            'research_gaps': [
                {
                    'side_effect': se['side_effect'],
                    'reddit_mentions': se['reddit_data']['mention_count'],
                    'pubmed_papers': se['pubmed_data']['paper_count']
                }
                for se in validated_side_effects
                if se['reddit_data']['mention_count'] > 20 and se['pubmed_data']['paper_count'] < 3
            ]
        }

        # Count by tier
        for se in validated_side_effects:
            tier = se['tier_label']
            summary['by_tier'][tier] = summary['by_tier'].get(tier, 0) + 1

        # Save summary
        summary_filename = f'{output_path}/validation_summary.json'
        with open(summary_filename, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"   {summary_filename}")

        # Print summary
        print(f"\n📊 Validation Summary:")
        print(f"   Total side effects validated: {summary['total_side_effects']}")
        print(f"\n   By Evidence Tier:")
        for tier, count in summary['by_tier'].items():
            print(f"      {tier}: {count}")
        print(f"\n   High surprise side effects: {len(summary['high_surprise'])}")
        print(f"   Research gaps identified: {len(summary['research_gaps'])}")


def main():
    """Main entry point for evidence validation."""

    print("\n🔬 Birth Control Side Effects Evidence Validation")
    print("=" * 60)

    # Initialize validator
    validator = EvidenceValidator(pubmed_email="your_email@example.com")

    # Load Reddit data
    side_effects = validator.load_reddit_data()

    if not side_effects:
        print("\n❌ No side effect data found!")
        print("   Run: python src/analysis/llm_side_effect_extractor.py")
        return

    # Limit to top 30 side effects (to avoid timeout)
    print(f"\n📊 Limiting validation to top 30 side effects (from {len(side_effects)} total)")
    side_effects = side_effects[:30]

    # Get total posts (try to load from stats.json)
    try:
        with open('data/patterns/stats.json', 'r') as f:
            stats = json.load(f)
            total_posts = stats.get('total_posts', 537)
    except:
        total_posts = 537  # Default

    # Validate all side effects
    validated = validator.validate_all_side_effects(side_effects, total_posts)

    # Save results
    validator.save_validated_database(validated)

    print("\n✅ Evidence validation complete!")
    print("\n💡 Next step: Run statistical analysis")
    print("   python src/analysis/statistical_validator.py")


if __name__ == "__main__":
    main()
