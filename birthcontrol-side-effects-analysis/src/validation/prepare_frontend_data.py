"""
Prepare Validated Data for Frontend
====================================
Transforms validated_side_effects_database.json into frontend-compatible format.
"""

import json
import os

def prepare_frontend_data():
    """Transform validated data for frontend consumption."""

    # Load validated database
    with open('data/validated/validated_side_effects_database.json', 'r') as f:
        validated_db = json.load(f)

    print(f"📂 Loaded {len(validated_db)} validated side effects")

    # Transform to frontend format
    top_side_effects = []
    hidden_gems = []

    for item in validated_db:
        # Flatten structure for frontend
        side_effect = {
            'side_effect': item['side_effect'],
            'tier_label': item['tier_label'],
            'evidence_tier': item['evidence_tier'],
            'surprise_score': item['surprise_score'],
            'mention_count': item['reddit_data']['mention_count'],
            'post_count': item['reddit_data']['post_count'],
            'frequency': item['reddit_data']['frequency'],
            'category': item['reddit_data']['category'],
            'paper_count': item['pubmed_data']['paper_count'],
            'examples': item['reddit_data'].get('examples', [])[:3]  # Top 3 examples
        }

        top_side_effects.append(side_effect)

        # Add to hidden gems if high surprise score (>= 2%)
        if item['surprise_score'] >= 0.02:
            hidden_gems.append(side_effect)

    # Sort by surprise score
    top_side_effects.sort(key=lambda x: x['surprise_score'], reverse=True)
    hidden_gems.sort(key=lambda x: x['surprise_score'], reverse=True)

    # Create frontend data
    frontend_data = {
        'top_side_effects': top_side_effects,
        'hidden_gems': hidden_gems,
        'total_validated': len(top_side_effects),
        'high_surprise_count': len(hidden_gems)
    }

    # Ensure frontend/data directory exists
    os.makedirs('frontend/data', exist_ok=True)

    # Save to frontend location
    output_path = 'frontend/data/validation_summary.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(frontend_data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Frontend data prepared!")
    print(f"   📄 Saved to: {output_path}")
    print(f"   📊 Total side effects: {len(top_side_effects)}")
    print(f"   💎 Hidden gems (high surprise): {len(hidden_gems)}")

    if hidden_gems:
        print(f"\n   Top hidden gems:")
        for gem in hidden_gems[:5]:
            print(f"      - {gem['side_effect']}: {gem['surprise_score']:.3f} surprise")

    return frontend_data


if __name__ == '__main__':
    prepare_frontend_data()
