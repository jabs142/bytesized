"""
Evidence Validation Pipeline
=============================
Combines Reddit symptom data with PubMed research to validate symptom-EDS
relationships and calculate "surprise scores" for hidden symptoms.

Pipeline:
1. Load Reddit symptom statistics
2. Search PubMed for each symptom + EDS
3. Calculate surprise scores (high Reddit + low PubMed = surprise)
4. Assign evidence tiers (1-4)
5. Output validated symptom database
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
    Validates symptom-EDS relationships using multi-source evidence.

    Evidence Tiers:
    - Tier 1: Official diagnostic criteria (🏆)
    - Tier 2: Research-backed (3+ PubMed papers) (✅)
    - Tier 3: Strong patient signal (50+ Reddit posts) (💬)
    - Tier 4: Emerging pattern (needs more research) (⚠️)
    """

    # Official EDS diagnostic criteria symptoms (Tier 1)
    DIAGNOSTIC_CRITERIA = [
        "joint hypermobility",
        "hypermobility",
        "joint pain",
        "joint instability",
        "subluxation",
        "dislocation",
        "skin hyperextensibility",
        "stretchy skin",
        "fragile skin",
        "bruising",
        "wound healing"
    ]

    # Thresholds for evidence tiers
    TIER_2_PUBMED_THRESHOLD = 3      # 3+ papers = research-backed
    TIER_3_REDDIT_THRESHOLD = 50      # 50+ posts = strong patient signal

    # Surprise score thresholds
    HIGH_SURPRISE_THRESHOLD = 0.7    # 70%+ surprise = "hidden symptom"
    MEDIUM_SURPRISE_THRESHOLD = 0.4  # 40-70% = moderate surprise

    def __init__(self, pubmed_email: Optional[str] = None):
        """Initialize validator with PubMed fetcher."""
        self.pubmed = PubMedFetcher(email=pubmed_email)

    def load_reddit_data(self, filepath: str = 'data/raw/symptom_stats_latest.json') -> List[Dict]:
        """
        Load Reddit symptom statistics.

        Args:
            filepath: Path to symptom stats JSON

        Returns:
            List of symptom statistics
        """
        print(f"📂 Loading Reddit data from {filepath}...")

        if not os.path.exists(filepath):
            print(f"   ⚠️  File not found: {filepath}")
            return []

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        print(f"   ✓ Loaded {len(data)} symptoms from Reddit")
        return data

    def search_pubmed_for_symptom(self, symptom: str, max_results: int = 10) -> Dict:
        """
        Search PubMed for research about symptom + EDS.

        Args:
            symptom: Symptom to search for
            max_results: Max papers to fetch

        Returns:
            Dict with paper count and details
        """
        print(f"   🔬 Searching PubMed for '{symptom}'...")

        papers = self.pubmed.search_symptom_eds_relationship(
            symptom,
            max_results=max_results
        )

        # Extract prevalence data from papers
        prevalence_data = []
        for paper in papers:
            prevalence = self.pubmed.extract_prevalence_data(paper, symptom)
            if prevalence:
                prevalence_data.append(prevalence)

        return {
            'paper_count': len(papers),
            'papers': papers[:3],  # Only keep top 3 papers to reduce size
            'prevalence_data': prevalence_data
        }

    def calculate_surprise_score(self, reddit_frequency: float,
                                 pubmed_count: int,
                                 total_reddit_posts: int) -> float:
        """
        Calculate surprise score for a symptom.

        Surprise = (Reddit frequency) × (1 - PubMed coverage)

        High surprise = frequently mentioned by patients but little research

        Args:
            reddit_frequency: % of Reddit posts mentioning symptom (0-1)
            pubmed_count: Number of PubMed papers found
            total_reddit_posts: Total number of Reddit posts analyzed

        Returns:
            Surprise score (0-1)
        """
        # Normalize PubMed count (cap at 20 papers for calculation)
        pubmed_normalized = min(pubmed_count / 20.0, 1.0)

        # Research coverage = how well-researched this symptom is
        research_coverage = pubmed_normalized

        # Surprise = patient reports × lack of research
        surprise = reddit_frequency * (1 - research_coverage)

        return round(surprise, 3)

    def assign_evidence_tier(self, symptom: str, reddit_mentions: int,
                            pubmed_count: int) -> int:
        """
        Assign evidence tier (1-4) based on multiple sources.

        Args:
            symptom: Symptom name
            reddit_mentions: Number of Reddit posts mentioning symptom
            pubmed_count: Number of PubMed papers found

        Returns:
            Tier (1-4)
        """
        # Tier 1: Official diagnostic criteria
        if any(criteria in symptom.lower() for criteria in self.DIAGNOSTIC_CRITERIA):
            return 1

        # Tier 2: Research-backed (3+ papers)
        if pubmed_count >= self.TIER_2_PUBMED_THRESHOLD:
            return 2

        # Tier 3: Strong patient signal (50+ posts)
        if reddit_mentions >= self.TIER_3_REDDIT_THRESHOLD:
            return 3

        # Tier 4: Emerging pattern
        return 4

    def get_tier_label(self, tier: int) -> str:
        """Get human-readable label for tier."""
        labels = {
            1: "🏆 Diagnostic Criteria",
            2: "✅ Research-Backed",
            3: "💬 Patient-Validated",
            4: "⚠️ Emerging Pattern"
        }
        return labels.get(tier, "Unknown")

    def get_surprise_label(self, surprise_score: float) -> str:
        """Get human-readable surprise label."""
        if surprise_score >= self.HIGH_SURPRISE_THRESHOLD:
            return "🎯 HIGH SURPRISE - Hidden Symptom"
        elif surprise_score >= self.MEDIUM_SURPRISE_THRESHOLD:
            return "🔍 Medium Surprise"
        else:
            return "✓ Expected"

    def validate_symptom(self, symptom_data: Dict, total_reddit_posts: int) -> Dict:
        """
        Validate a single symptom with multi-source evidence.

        Args:
            symptom_data: Reddit symptom statistics
            total_reddit_posts: Total Reddit posts analyzed

        Returns:
            Validated symptom with evidence tier and surprise score
        """
        symptom = symptom_data['symptom']
        reddit_mentions = symptom_data['mention_count']
        reddit_frequency = symptom_data['frequency']

        print(f"\n📊 Validating: {symptom}")
        print(f"   Reddit: {reddit_mentions} posts ({reddit_frequency*100:.1f}%)")

        # Search PubMed
        pubmed_data = self.search_pubmed_for_symptom(symptom)
        pubmed_count = pubmed_data['paper_count']

        print(f"   PubMed: {pubmed_count} papers")

        # Calculate surprise score
        surprise_score = self.calculate_surprise_score(
            reddit_frequency,
            pubmed_count,
            total_reddit_posts
        )

        # Assign evidence tier
        tier = self.assign_evidence_tier(symptom, reddit_mentions, pubmed_count)

        print(f"   Tier: {self.get_tier_label(tier)}")
        print(f"   Surprise: {surprise_score:.3f} - {self.get_surprise_label(surprise_score)}")

        return {
            'symptom': symptom,
            'evidence_tier': tier,
            'tier_label': self.get_tier_label(tier),
            'surprise_score': surprise_score,
            'surprise_label': self.get_surprise_label(surprise_score),
            'reddit_data': {
                'mention_count': reddit_mentions,
                'frequency': reddit_frequency,
                'post_ids': symptom_data.get('post_ids', [])
            },
            'pubmed_data': {
                'paper_count': pubmed_count,
                'papers': pubmed_data['papers'],
                'prevalence_data': pubmed_data['prevalence_data']
            }
        }

    def validate_all_symptoms(self, reddit_data: List[Dict],
                              total_posts: int,
                              top_n: Optional[int] = None) -> List[Dict]:
        """
        Validate all symptoms from Reddit data.

        Args:
            reddit_data: List of Reddit symptom statistics
            total_posts: Total Reddit posts analyzed
            top_n: Only validate top N symptoms (optional, for faster testing)

        Returns:
            List of validated symptoms
        """
        print("\n" + "=" * 60)
        print("Evidence Validation Pipeline")
        print("=" * 60)

        # Only validate top N if specified
        symptoms_to_validate = reddit_data[:top_n] if top_n else reddit_data

        print(f"\n🔬 Validating {len(symptoms_to_validate)} symptoms...")
        print(f"📊 Total Reddit posts: {total_posts}")

        validated_symptoms = []

        for symptom_data in symptoms_to_validate:
            try:
                validated = self.validate_symptom(symptom_data, total_posts)
                validated_symptoms.append(validated)
            except Exception as e:
                print(f"   ❌ Error validating {symptom_data['symptom']}: {e}")
                continue

        return validated_symptoms

    def save_validated_data(self, validated_symptoms: List[Dict],
                           filename: str = 'data/validated/symptom_database.json'):
        """
        Save validated symptom database.

        Args:
            validated_symptoms: List of validated symptoms
            filename: Output filename
        """
        # Create output directory
        os.makedirs(os.path.dirname(filename), exist_ok=True)

        # Sort by surprise score (highest first)
        validated_symptoms.sort(key=lambda x: x['surprise_score'], reverse=True)

        # Save to JSON
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(validated_symptoms, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved validated symptom database to {filename}")

        # Print summary statistics
        self.print_summary(validated_symptoms)

    def print_summary(self, validated_symptoms: List[Dict]):
        """Print summary statistics of validated symptoms."""
        print("\n" + "=" * 60)
        print("📊 Validation Summary")
        print("=" * 60)

        # Count by tier
        tier_counts = defaultdict(int)
        for symptom in validated_symptoms:
            tier_counts[symptom['evidence_tier']] += 1

        print("\n🏆 Evidence Tiers:")
        for tier in [1, 2, 3, 4]:
            label = self.get_tier_label(tier)
            count = tier_counts[tier]
            print(f"   {label}: {count} symptoms")

        # High surprise symptoms
        high_surprise = [s for s in validated_symptoms
                        if s['surprise_score'] >= self.HIGH_SURPRISE_THRESHOLD]

        print(f"\n🎯 High Surprise Symptoms ({len(high_surprise)}):")
        for symptom in high_surprise[:5]:
            print(f"   • {symptom['symptom']}: {symptom['surprise_score']:.3f}")
            print(f"     Reddit: {symptom['reddit_data']['mention_count']} posts")
            print(f"     PubMed: {symptom['pubmed_data']['paper_count']} papers")

        print("\n✅ Validation complete!")


def main():
    """Main entry point for evidence validation."""

    validator = EvidenceValidator(pubmed_email="your_email@example.com")

    # Load Reddit data
    reddit_data = validator.load_reddit_data()

    if not reddit_data:
        print("❌ No Reddit data found. Run reddit_collector.py first!")
        return

    # Get total posts from first symptom or estimate
    total_posts = 400  # Estimated from 200 posts × 2 subreddits

    # Validate ALL symptoms (full validation)
    print("\n🔬 Running FULL VALIDATION on ALL symptoms")
    print("   This will take ~15-20 minutes due to PubMed rate limiting")

    validated = validator.validate_all_symptoms(
        reddit_data,
        total_posts,
        top_n=None  # Validate all symptoms
    )

    # Save results
    validator.save_validated_data(validated)


if __name__ == "__main__":
    main()
