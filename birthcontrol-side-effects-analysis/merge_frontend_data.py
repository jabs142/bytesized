#!/usr/bin/env python3
"""
Merge LLM side effect stats (with severity) and validated database (with tiers)
to create a complete validation_summary.json for the frontend
"""

import json

def merge_datasets():
    """Merge llm_side_effect_stats.json and validated_side_effects_database.json"""

    # Load severity data
    with open('frontend/data/llm_side_effect_stats.json', 'r') as f:
        severity_data = json.load(f)

    # Load validation data
    with open('frontend/data/validated_side_effects_database.json', 'r') as f:
        validation_data = json.load(f)

    # Create lookup for severity data by symptom name
    severity_lookup = {item['side_effect']: item for item in severity_data}

    # Merge data
    merged_effects = []

    for val_item in validation_data:
        symptom_name = val_item['side_effect']
        severity_item = severity_lookup.get(symptom_name, {})

        # Flatten structure for frontend
        merged = {
            'side_effect': symptom_name,
            'tier_label': val_item.get('tier_label', '⚠️ Emerging Pattern'),
            'evidence_tier': val_item.get('evidence_tier', 4),
            'surprise_score': val_item.get('surprise_score', 0),
            'mention_count': val_item.get('reddit_data', {}).get('mention_count', 0),
            'post_count': val_item.get('reddit_data', {}).get('post_count', 0),
            'frequency': val_item.get('reddit_data', {}).get('frequency', 0),
            'category': val_item.get('reddit_data', {}).get('category', 'unknown'),
            'paper_count': val_item.get('pubmed_data', {}).get('paper_count', 0),
            'examples': val_item.get('reddit_data', {}).get('examples', [])
        }

        # Add severity data if available
        if severity_item:
            merged['severity_breakdown'] = severity_item.get('severity_breakdown', {})
            merged['avg_severity'] = severity_item.get('avg_severity', 0)

        merged_effects.append(merged)

    # Sort by surprise score (descending)
    merged_effects.sort(key=lambda x: x['surprise_score'], reverse=True)

    # Create output in format validation.js expects
    # Hidden gems = high surprise + low research (Tier 3 or 4 only)
    output = {
        'top_side_effects': merged_effects,
        'hidden_gems': [
            item for item in merged_effects
            if item['surprise_score'] >= 0.015
            and item['evidence_tier'] >= 3  # Only Patient-Validated (3) or Emerging Pattern (4)
        ][:10]
    }

    # Save
    with open('frontend/data/validation_summary.json', 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"✅ Merged {len(merged_effects)} side effects")
    print(f"   Top side effects: {len(output['top_side_effects'])}")
    print(f"   High surprise items: {len(output['hidden_gems'])}")
    print(f"   Saved to: frontend/data/validation_summary.json")

    # Show top 5
    print("\nTop 5 side effects:")
    for i, item in enumerate(merged_effects[:5], 1):
        severity = item.get('severity_breakdown', {})
        print(f"  {i}. {item['side_effect']}")
        print(f"     Posts: {item['post_count']}, Tier: {item['tier_label']}")
        if severity:
            print(f"     Severity: mild={severity.get('mild', 0)}, moderate={severity.get('moderate', 0)}, severe={severity.get('severe', 0)}")

if __name__ == '__main__':
    merge_datasets()
