"""
Validate LLM-Extracted Symptoms
================================
Runs validation on deduplicated LLM-extracted symptoms to find hidden/surprising symptoms.
"""

import json
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from validation.evidence_validator import EvidenceValidator


def prepare_symptoms_for_validation(deduplicated_file: str, total_posts: int = 257):
    """
    Convert deduplicated symptoms to validation format.

    Args:
        deduplicated_file: Path to deduplicated symptoms JSON
        total_posts: Total number of posts analyzed

    Returns:
        List of symptoms in validation format
    """
    print(f"📂 Loading {deduplicated_file}...")
    with open(deduplicated_file, 'r', encoding='utf-8') as f:
        symptoms = json.load(f)

    print(f"   ✓ Loaded {len(symptoms)} deduplicated symptoms")

    # Convert to validation format
    # We'll estimate post_count as ~80% of mention_count (conservative)
    # since some posts may mention the same symptom multiple times
    validation_data = []
    for symptom in symptoms:
        post_count = int(symptom['mention_count'] * 0.8)  # Conservative estimate
        if post_count < 1:
            post_count = 1  # At least 1 post

        validation_data.append({
            'symptom': symptom['symptom'],
            'mention_count': symptom['mention_count'],
            'post_count': post_count,  # Estimated
            'frequency': post_count / total_posts,
            'examples': symptom.get('examples', []),
            'post_ids': []  # Not available in deduplicated format
        })

    return validation_data


def main():
    """Main validation pipeline for LLM-extracted symptoms."""

    print("\n" + "=" * 70)
    print("🔬 LLM-Extracted Symptom Validation Pipeline")
    print("=" * 70)

    # Load deduplicated symptoms
    deduplicated_file = 'data/analysis/llm_symptom_stats_deduplicated.json'
    total_posts = 257

    validation_data = prepare_symptoms_for_validation(deduplicated_file, total_posts)

    # Initialize validator
    validator = EvidenceValidator(pubmed_email="your_email@example.com")

    # Validate TOP symptoms only (to save time/API costs)
    # Focus on symptoms with at least 5 mentions
    top_symptoms = [s for s in validation_data if s['mention_count'] >= 5]

    print(f"\n📊 Validation Strategy:")
    print(f"   Total unique symptoms: {len(validation_data)}")
    print(f"   Symptoms with 5+ mentions: {len(top_symptoms)}")
    print(f"   Validating: {len(top_symptoms)} symptoms")
    print(f"\n⚠️  This will take ~{len(top_symptoms) * 2 // 60} minutes due to PubMed rate limiting")

    # Validate
    validated = validator.validate_all_symptoms(
        top_symptoms,
        total_posts,
        top_n=None  # Validate all top symptoms
    )

    # Save results
    output_file = 'data/validated/llm_symptom_database.json'
    validator.save_validated_data(validated, filename=output_file)

    print(f"\n✅ Validation complete! Results saved to {output_file}")
    print("\n💡 Next: Analyze results in Jupyter notebook for visualizations")


if __name__ == "__main__":
    main()
