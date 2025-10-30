"""
Top Symptom Selector
Selects top 30 symptoms for deep analysis based on frequency and surprise signals
"""
import json
import sys
from pathlib import Path
from typing import List, Dict

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


def load_all_symptoms() -> List[Dict]:
    """Load aggregated symptom data"""
    input_path = Config.PROCESSED_DATA_DIR / Config.ALL_SYMPTOMS_FILE

    if not input_path.exists():
        print(f"❌ Error: Symptom file not found at {input_path}")
        print("Please run symptom_aggregator.py first!")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        symptoms = json.load(f)

    print(f"Loaded {len(symptoms)} total symptoms")
    return symptoms


def select_top_symptoms(symptoms: List[Dict]) -> List[Dict]:
    """
    Select top 30 symptoms for validation

    Selection criteria:
    1. Mentioned in at least 5% of posts (25+ posts out of 500)
    2. OR has high surprise signal count (20+ mentions)
    3. Prioritize symptoms with patient surprise quotes

    Args:
        symptoms: List of all symptom dictionaries

    Returns:
        List of top 30 symptom dictionaries
    """
    print("\nSelecting top symptoms for deep analysis...")

    # Filter by criteria
    candidates = []

    for symptom in symptoms:
        frequency = symptom["frequency"]
        posts = symptom["posts_appearing_in"]
        surprise_signals = symptom["surprise_signals"]

        # Criteria 1: At least 5% of posts (25+ posts)
        meets_frequency = frequency >= Config.MIN_MENTION_PERCENTAGE

        # Criteria 2: High surprise signal count
        meets_surprise = surprise_signals >= Config.MIN_SURPRISE_SIGNALS

        if meets_frequency or meets_surprise:
            # Calculate selection score (for ranking)
            score = posts + (surprise_signals * 2)  # Weight surprise signals higher
            symptom["selection_score"] = score
            candidates.append(symptom)

    # Sort by selection score
    candidates.sort(key=lambda x: x["selection_score"], reverse=True)

    # Take top 30
    top_30 = candidates[:Config.TOP_N_SYMPTOMS]

    # Print summary
    print(f"\n{'='*50}")
    print(f"Top {len(top_30)} Symptoms Selected")
    print(f"{'='*50}")

    print(f"\nCandidates meeting criteria: {len(candidates)}")
    print(f"Selected for validation: {len(top_30)}")

    # Stats
    avg_frequency = sum(s["frequency"] for s in top_30) / len(top_30)
    avg_surprise = sum(s["surprise_signals"] for s in top_30) / len(top_30)

    print(f"\nAverage frequency: {avg_frequency:.1%}")
    print(f"Average surprise signals: {avg_surprise:.1f}")

    print(f"\nTop 10 selected symptoms:")
    for i, symptom in enumerate(top_30[:10], 1):
        print(f"  {i:2}. {symptom['symptom']:<30} - {symptom['posts_appearing_in']:3} posts, {symptom['surprise_signals']:2} surprise")

    return top_30


def save_top_symptoms(symptoms: List[Dict]):
    """Save top symptoms to file"""
    output_path = Config.PROCESSED_DATA_DIR / "top_30_symptoms.json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(symptoms, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Top symptoms saved to: {output_path}")


def main():
    """Main execution function"""
    print("=" * 50)
    print("PHASE 3A: Top Symptom Selection")
    print("=" * 50)

    # Load all symptoms
    all_symptoms = load_all_symptoms()

    # Select top 30
    top_30 = select_top_symptoms(all_symptoms)

    # Save results
    save_top_symptoms(top_30)

    print("\n✅ Selection complete!")
    print("\nNext step: Run pubmed_validator.py to validate these symptoms")


if __name__ == "__main__":
    main()
