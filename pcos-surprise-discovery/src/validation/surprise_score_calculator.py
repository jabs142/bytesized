"""
Surprise Score Calculator
Calculates which symptoms are surprisingly connected to PCOS but rarely discussed
"""
import json
import sys
from pathlib import Path
from typing import List, Dict

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config
    Config.VALIDATED_DATA_DIR,
    Config.OFFICIAL_DATA_DIR,
    OFFICIAL_CRITERIA_FILE,
    Config.SURPRISE_RANKINGS_FILE,
    Config.WEIGHT_NOT_IN_CRITERIA,
    Config.WEIGHT_LOW_AWARENESS,
    Config.WEIGHT_HIGH_SURPRISE_SIGNALS,
    WEIGHT_HIGH_PREVALENCE_RATIO,
    Config.MIN_SURPRISE_SIGNALS,
)


class SurpriseScoreCalculator:
    def __init__(self, official_criteria: Dict):
        """
        Initialize calculator with official diagnostic criteria

        Args:
            official_criteria: Dict with official PCOS diagnostic features
        """
        self.diagnostic_features = set(official_criteria.get("diagnostic_core_features", []))
        self.associated_features = set(official_criteria.get("associated_but_not_diagnostic", []))

    def is_in_diagnostic_criteria(self, symptom: str) -> bool:
        """Check if symptom is in official diagnostic criteria"""
        symptom_normalized = symptom.lower().replace(" ", "_")
        return symptom_normalized in self.diagnostic_features

    def estimate_awareness(self, symptom: str) -> str:
        """
        Estimate public awareness of symptom-PCOS connection

        For MVP, we'll use heuristics. In full version, would query Google Trends API.

        Returns:
            "high", "medium", or "low"
        """
        # High awareness (commonly known PCOS symptoms)
        high_awareness_keywords = [
            "irregular", "period", "facial_hair", "hirsutism", "acne",
            "weight_gain", "infertility", "ovarian", "cyst"
        ]

        # Check if symptom contains high awareness keywords
        symptom_lower = symptom.lower()
        if any(keyword in symptom_lower for keyword in high_awareness_keywords):
            return "high"

        # Low awareness (surprising connections)
        low_awareness_keywords = [
            "sleep", "apnea", "skin_tag", "depression", "anxiety",
            "brain_fog", "fatigue", "migraine", "headache"
        ]

        if any(keyword in symptom_lower for keyword in low_awareness_keywords):
            return "low"

        return "medium"

    def calculate_surprise_score(self, symptom_data: Dict) -> Dict:
        """
        Calculate surprise score for a symptom

        Args:
            symptom_data: Dictionary with symptom data and validation results

        Returns:
            Dictionary with surprise score and classification
        """
        symptom = symptom_data["symptom"]

        # Base metrics
        reddit_frequency = symptom_data["frequency"]  # % of posts
        surprise_signals = symptom_data.get("surprise_signals", 0)

        # PubMed validation
        pubmed = symptom_data.get("pubmed_validation", {})
        has_research = pubmed.get("has_research", False)
        paper_count = pubmed.get("total_papers", 0)

        # Check if in diagnostic criteria
        in_criteria = self.is_in_diagnostic_criteria(symptom)

        # Estimate awareness
        awareness = self.estimate_awareness(symptom)
        low_awareness = (awareness == "low")

        # Calculate base score (0-10 scale based on Reddit frequency)
        base_score = reddit_frequency * 10

        # Apply multipliers
        score = base_score

        if not in_criteria:
            score *= Config.WEIGHT_NOT_IN_CRITERIA  # 2.0x - not in diagnostic criteria

        if low_awareness:
            score *= Config.WEIGHT_LOW_AWARENESS  # 1.5x - low public awareness

        if surprise_signals >= Config.MIN_SURPRISE_SIGNALS:
            score *= Config.WEIGHT_HIGH_SURPRISE_SIGNALS  # 1.3x - patients express surprise

        # Bonus for having research but still being surprising
        if has_research and paper_count > 0 and not in_criteria:
            score *= 1.1  # Validated connection but not widely known

        # Classify surprise level
        if score > 2.0:
            classification = "🔥 VERY SURPRISING"
            tier_description = "Hidden connection - strong patient signal but rarely discussed"
        elif score > 1.0:
            classification = "⚠️ SOMEWHAT SURPRISING"
            tier_description = "Underappreciated connection - patients notice but doctors may not emphasize"
        else:
            classification = "Expected"
            tier_description = "Known PCOS symptom or expected association"

        # Determine evidence tier
        if in_criteria:
            tier = 1
            tier_label = "Tier 1: Diagnostic"
        elif has_research and paper_count >= 5:
            tier = 2
            tier_label = "Tier 2: Research-backed"
        elif symptom_data["posts_appearing_in"] >= 25:
            tier = 3
            tier_label = "Tier 3: Strong patient signal"
        else:
            tier = 4
            tier_label = "Tier 4: Emerging pattern"

        return {
            "symptom": symptom,
            "surprise_classification": classification,
            "surprise_score": round(score, 2),
            "tier": tier,
            "tier_label": tier_label,
            "tier_description": tier_description,
            "evidence": {
                "in_criteria": in_criteria,
                "reddit_mentions": symptom_data["mentions"],
                "reddit_posts": symptom_data["posts_appearing_in"],
                "reddit_frequency": round(reddit_frequency, 3),
                "surprise_signals": surprise_signals,
                "pubmed_papers": paper_count,
                "has_research": has_research,
                "awareness_level": awareness,
            },
            "surprise_factors": {
                "not_in_criteria": not in_criteria,
                "low_public_awareness": low_awareness,
                "high_surprise_signals": surprise_signals >= Config.MIN_SURPRISE_SIGNALS,
                "research_validated": has_research,
            },
            "sample_quotes": symptom_data.get("sample_quotes", [])[:3],
        }

    def calculate_all(self, symptoms: List[Dict]) -> List[Dict]:
        """Calculate surprise scores for all symptoms"""
        print(f"\nCalculating surprise scores for {len(symptoms)} symptoms...")

        results = []
        for symptom_data in symptoms:
            result = self.calculate_surprise_score(symptom_data)
            results.append(result)

        # Sort by surprise score
        results.sort(key=lambda x: x["surprise_score"], reverse=True)

        # Print summary
        self.print_summary(results)

        return results

    def print_summary(self, results: List[Dict]):
        """Print summary of surprise scores"""
        print(f"\n{'='*50}")
        print("Surprise Score Summary")
        print(f"{'='*50}")

        very_surprising = [r for r in results if r["surprise_classification"] == "🔥 VERY SURPRISING"]
        somewhat_surprising = [r for r in results if r["surprise_classification"] == "⚠️ SOMEWHAT SURPRISING"]
        expected = [r for r in results if r["surprise_classification"] == "Expected"]

        print(f"\n🔥 VERY SURPRISING: {len(very_surprising)}")
        print(f"⚠️  SOMEWHAT SURPRISING: {len(somewhat_surprising)}")
        print(f"✓  EXPECTED: {len(expected)}")

        print(f"\nTop 10 Most Surprising Symptoms:")
        for i, result in enumerate(results[:10], 1):
            emoji = result["surprise_classification"].split()[0]
            print(f"  {i:2}. {emoji} {result['symptom']:<30} (score: {result['surprise_score']:.2f})")
            print(f"      └─ {result['evidence']['reddit_posts']} posts, {result['evidence']['surprise_signals']} surprise signals")

    def save_results(self, results: List[Dict]):
        """Save surprise rankings"""
        output_path = Config.VALIDATED_DATA_DIR / Config.SURPRISE_RANKINGS_FILE

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Surprise rankings saved to: {output_path}")


def load_validated_symptoms() -> List[Dict]:
    """Load PubMed-validated symptoms"""
    input_path = Config.VALIDATED_DATA_DIR / "pubmed_validated_symptoms.json"

    if not input_path.exists():
        print(f"❌ Error: Validated symptoms file not found at {input_path}")
        print("Please run pubmed_validator.py first!")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        symptoms = json.load(f)

    print(f"Loaded {len(symptoms)} validated symptoms")
    return symptoms


def load_official_criteria() -> Dict:
    """Load official PCOS diagnostic criteria"""
    input_path = Config.OFFICIAL_DATA_DIR / OFFICIAL_CRITERIA_FILE

    if not input_path.exists():
        print(f"❌ Error: Official criteria file not found at {input_path}")
        print("Please run extract_official_criteria.py first!")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        criteria = json.load(f)

    return criteria


def main():
    """Main execution function"""
    print("=" * 50)
    print("PHASE 3C: Surprise Score Calculation")
    print("=" * 50)

    # Load data
    criteria = load_official_criteria()
    symptoms = load_validated_symptoms()

    # Initialize calculator
    calculator = SurpriseScoreCalculator(criteria)

    # Calculate scores
    results = calculator.calculate_all(symptoms)

    # Save results
    calculator.save_results(results)

    print("\n✅ Surprise score calculation complete!")


if __name__ == "__main__":
    main()
