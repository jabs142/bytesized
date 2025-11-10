"""
Long-Term Side Effect Extractor
================================
Extracts side effects from long-term birth control users (5+ years)
with enhanced duration and temporal context tracking.
"""

import json
import os
from typing import List, Dict, Optional
from collections import Counter, defaultdict
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path

# Import shared standardization rules
from .side_effect_standardization import standardize_side_effect, STANDARDIZATION_RULES

load_dotenv()


class LongTermSideEffectExtractor:
    """
    Extract long-term side effects with duration context.

    Focuses on effects that:
    - Appear after extended use (5+ years)
    - Persist after stopping
    - Are chronic or long-lasting
    """

    def __init__(self, api_key: Optional[str] = None):
        """Initialize with OpenAI API key."""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"  # Cost-effective

    def extract_long_term_side_effects(self, post: Dict) -> List[Dict]:
        """
        Extract long-term side effects from a Reddit post.

        Args:
            post: Reddit post dict with 'title', 'selftext', 'id', 'long_term_metadata'

        Returns:
            List of side effects with duration/temporal context
        """
        # Combine title and body
        text = f"{post['title']}\n\n{post['selftext']}"

        # Skip if too short
        if len(text.strip()) < 50:
            return []

        # Get duration metadata from filter
        years_mentioned = post.get('long_term_metadata', {}).get('years_mentioned', [])
        max_years = max(years_mentioned) if years_mentioned else None

        prompt = f"""You are analyzing a Reddit post from someone who has been using birth control for LONG-TERM (5+ years).

Your task is to extract ONLY side effects that:
1. APPEARED AFTER YEARS OF USE (not immediately when starting BC)
2. Are chronic/persistent effects that developed over time
3. Effects that continued after stopping birth control
4. Long-term health impacts discovered after extended use

DO NOT INCLUDE:
- Side effects that appeared immediately when starting BC
- Side effects that BC helped improve (these are benefits, not side effects)
- Pre-existing conditions that existed before BC
- Unrelated health issues
- Normal menstrual patterns that returned after stopping BC

IMPORTANT CONTEXT:
- This person has been on birth control for {max_years}+ years (if known)
- Focus on effects that specifically appeared BECAUSE OF long-term use
- Look for phrases like "after X years", "developed over time", "gradually got worse", "didn't have this before"

Reddit Post:
{text}

Return a JSON object with a "side_effects" array. For each side effect, include:
- side_effect: the side effect name (use patient's wording)
- original_quote: exact quote from the post
- category: "mental" or "physical" or "both"
- temporal_context: when the effect started, how long it lasted, or any timing details (null if not mentioned)
  Examples: "started after 5 years", "appeared gradually", "persistent even after stopping", "got worse over time"
- duration_context: how long they experienced this effect (null if not mentioned)
  Examples: "for 3 years", "ongoing", "chronic", "still experiencing"
- severity: "mild", "moderate", or "severe" based on their description (null if unclear)
- persistence_after_stopping: true/false/null - did effect continue after stopping BC? (null if not mentioned or still on BC)

Example format:
{{
  "side_effects": [
    {{
      "side_effect": "severe depression",
      "original_quote": "After 7 years on the pill I developed really bad depression that wouldn't go away",
      "category": "mental",
      "temporal_context": "started after 7 years of use",
      "duration_context": "ongoing for 2 years",
      "severity": "severe",
      "persistence_after_stopping": null
    }},
    {{
      "side_effect": "decreased bone density",
      "original_quote": "My doctor found I had low bone mass after 10 years on hormonal BC",
      "category": "physical",
      "temporal_context": "discovered after 10 years",
      "duration_context": null,
      "severity": "moderate",
      "persistence_after_stopping": null
    }},
    {{
      "side_effect": "chronic migraines",
      "original_quote": "I had headaches that turned into migraines, and they didn't stop even months after quitting",
      "category": "physical",
      "temporal_context": "worsened over time",
      "duration_context": "several months",
      "severity": "severe",
      "persistence_after_stopping": true
    }}
  ]
}}

If NO side effects are mentioned, return: {{"side_effects": []}}

Extract all long-term side effects now:"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=2000,
                temperature=0,  # Deterministic
                response_format={"type": "json_object"},
                messages=[{
                    "role": "system",
                    "content": "You are a medical side effect extraction assistant specializing in long-term birth control effects. Extract side effects with temporal context and return valid JSON."
                }, {
                    "role": "user",
                    "content": prompt
                }]
            )

            content = response.choices[0].message.content

            # Extract JSON
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            response_data = json.loads(content)
            side_effects = response_data.get('side_effects', [])

            # Add post metadata
            for side_effect in side_effects:
                side_effect['post_id'] = post['id']
                side_effect['subreddit'] = post.get('subreddit', 'unknown')
                side_effect['years_on_bc'] = max_years  # From filter metadata

            return side_effects

        except json.JSONDecodeError as e:
            print(f"   ⚠️  JSON parse error for post {post['id']}: {e}")
            return []
        except Exception as e:
            print(f"   ❌ Error extracting from post {post['id']}: {e}")
            return []

    def extract_from_all_posts(self, posts: List[Dict]) -> List[Dict]:
        """Extract side effects from all long-term posts."""
        print(f"\n🤖 Long-Term Side Effect Extraction")
        print("=" * 60)
        print(f"Processing {len(posts)} long-term Reddit posts (5+ years)...")
        print(f"Model: {self.model}")
        print("🔍 Focusing on chronic, persistent, and late-onset effects\n")

        all_side_effects = []

        for i, post in enumerate(posts, 1):
            # Get years from metadata
            years = post.get('long_term_metadata', {}).get('max_years')
            years_str = f"({years}+ years)" if years else "(long-term)"

            print(f"[{i}/{len(posts)}] Post {post['id']} {years_str}...", end=" ")

            side_effects = self.extract_long_term_side_effects(post)
            all_side_effects.extend(side_effects)

            print(f"✓ Found {len(side_effects)} effects")

            # Rate limiting
            time.sleep(0.5)

        print(f"\n✅ Extraction complete!")
        print(f"   Total side effect mentions: {len(all_side_effects)}")
        print(f"   Unique side effects: {len(set(s['side_effect'] for s in all_side_effects))}")

        return all_side_effects

    def standardize_side_effects(self, side_effects: List[Dict]) -> Dict[str, List[Dict]]:
        """Standardize/cluster similar side effect names."""
        print(f"\n🔄 Standardizing {len(side_effects)} side effect mentions...")

        unique_side_effects = list(set(s['side_effect'] for s in side_effects))
        print(f"   Found {len(unique_side_effects)} unique descriptions")
        print("   Using LLM to cluster similar effects...")

        all_mappings = {}

        # Process in batches of 100
        for i in range(0, len(unique_side_effects), 100):
            batch = unique_side_effects[i:i+100]

            prompt = f"""You have extracted long-term side effects from birth control patient posts. Many are variations of the same side effect.

Your task: Group these into standardized side effect names.

Rules:
1. Use medical terminology when appropriate
2. MERGE all variations of the same condition (e.g., all PMDD variations should map to "premenstrual dysphoric disorder")
3. Group obvious variations but preserve important distinctions
4. Keep names concise but specific
5. Focus on chronic/long-term conditions

CRITICAL MERGING RULES:
- All PMDD variations -> "premenstrual dysphoric disorder" (including "PMDD", "premenstrual dysphoric disorder (PMDD)", "PMDD episodes", "severe PMDD")
- All PMS variations -> "premenstrual syndrome" (including "PMS", "severe PMS", "worsening PMS")
- All depression variations -> "depression" (unless specifically bipolar, postpartum, etc.)
- All anxiety variations -> "anxiety" (unless specifically panic disorder, GAD, etc.)

Side effect mentions:
{json.dumps(batch, indent=2)}

Return JSON mapping: original_description -> standardized_name

Example:
{{
  "PMDD": "premenstrual dysphoric disorder",
  "premenstrual dysphoric disorder (PMDD)": "premenstrual dysphoric disorder",
  "PMDD episodes": "premenstrual dysphoric disorder",
  "severe PMDD": "premenstrual dysphoric disorder",
  "chronic migraines": "migraines",
  "persistent headaches": "migraines",
  "low bone density": "decreased bone density",
  "osteopenia": "decreased bone density",
  "can't get pregnant": "fertility issues",
  "trouble conceiving": "fertility issues"
}}

Standardize now:"""

            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    max_tokens=4000,
                    temperature=0,
                    response_format={"type": "json_object"},
                    messages=[{
                        "role": "system",
                        "content": "You are a medical terminology expert. Standardize side effect descriptions and return valid JSON."
                    }, {
                        "role": "user",
                        "content": prompt
                    }]
                )

                content = response.choices[0].message.content

                # Extract JSON
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()

                batch_mapping = json.loads(content)
                all_mappings.update(batch_mapping)

                time.sleep(0.5)

            except Exception as e:
                print(f"   ⚠️  Batch standardization failed: {e}")
                for item in batch:
                    all_mappings[item] = item

        # Apply standardization
        standardized = defaultdict(list)
        for side_effect in side_effects:
            original = side_effect['side_effect']
            standard_name = all_mappings.get(original, original)

            # Apply additional post-LLM standardization rules using shared module
            standard_name = standardize_side_effect(standard_name)

            standardized[standard_name].append(side_effect)

        print(f"   ✓ Standardized to {len(standardized)} unique side effects")

        return dict(standardized)

    def create_statistics(self, standardized: Dict[str, List[Dict]], total_posts: int) -> List[Dict]:
        """Create statistics for each side effect."""
        stats = []

        for side_effect_name, mentions in standardized.items():
            # Unique posts
            unique_posts = len(set(m['post_id'] for m in mentions))
            frequency = unique_posts / total_posts if total_posts > 0 else 0

            # Primary category
            categories = [m.get('category', 'unknown') for m in mentions]
            category_counts = Counter(categories)
            primary_category = category_counts.most_common(1)[0][0] if category_counts else 'unknown'

            # Temporal context aggregation
            temporal_contexts = [m.get('temporal_context') for m in mentions if m.get('temporal_context')]

            # Persistence tracking
            persistence_values = [m.get('persistence_after_stopping') for m in mentions if m.get('persistence_after_stopping') is not None]
            persists_after_stopping = any(persistence_values) if persistence_values else None

            # Average years on BC when effect appeared
            years_on_bc = [m.get('years_on_bc') for m in mentions if m.get('years_on_bc')]
            avg_years = sum(years_on_bc) / len(years_on_bc) if years_on_bc else None

            stats.append({
                'side_effect': side_effect_name,
                'mention_count': len(mentions),
                'post_count': unique_posts,
                'frequency': round(frequency, 3),
                'category': primary_category,
                'examples': [m['original_quote'] for m in mentions[:3]],
                'temporal_contexts': temporal_contexts[:3] if temporal_contexts else [],
                'avg_years_when_appeared': round(avg_years, 1) if avg_years else None,
                'persists_after_stopping': persists_after_stopping,
                'severity_distribution': dict(Counter([m.get('severity') for m in mentions if m.get('severity')]))
            })

        # Sort by post count
        stats.sort(key=lambda x: x['post_count'], reverse=True)

        return stats

    def select_top_for_validation(self, stats: List[Dict], top_n: int = 20) -> List[Dict]:
        """Select top N side effects for PubMed validation."""
        print(f"\n📌 Selecting top {top_n} side effects for PubMed validation...")

        selected = stats[:top_n]

        print(f"   ✓ Selected {len(selected)} side effects")
        print(f"   Coverage: {sum(s['post_count'] for s in selected)} / {sum(s['post_count'] for s in stats)} total mentions")

        return selected

    def save_results(self, side_effects: List[Dict], standardized: Dict[str, List[Dict]],
                    stats: List[Dict], top_effects: List[Dict], save_debug: bool = False):
        """Save extraction results. By default only saves essential files."""
        output_dir = Path('data/analysis')
        output_dir.mkdir(parents=True, exist_ok=True)

        # Only save debug files if requested
        if save_debug:
            # Save raw
            with open(output_dir / 'long_term_side_effects_raw.json', 'w', encoding='utf-8') as f:
                json.dump(side_effects, f, indent=2, ensure_ascii=False)

            # Save standardized
            with open(output_dir / 'long_term_side_effects_standardized.json', 'w', encoding='utf-8') as f:
                json.dump(standardized, f, indent=2, ensure_ascii=False)

            # Save all stats
            with open(output_dir / 'long_term_side_effects_stats.json', 'w', encoding='utf-8') as f:
                json.dump(stats, f, indent=2, ensure_ascii=False)

            print("   💾 Debug files saved")

        # Always save top 20 for validation (this is essential)
        with open(output_dir / 'long_term_side_effects_top20.json', 'w', encoding='utf-8') as f:
            json.dump(top_effects, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved results:")
        print(f"   data/analysis/long_term_side_effects_top20.json")


def main():
    """Main entry point."""
    import sys

    # Check for debug flag
    save_debug = '--debug' in sys.argv
    if save_debug:
        print("🐛 Debug mode enabled - will save intermediate files")

    project_root = Path(__file__).parent.parent.parent

    # Load filtered long-term posts
    print("📂 Loading filtered long-term posts...")
    posts_file = project_root / 'data/analysis/reddit_long_term_posts.json'

    if not posts_file.exists():
        print(f"❌ Error: {posts_file} not found!")
        print("   Run: python src/analysis/long_term_filter.py first")
        return

    with open(posts_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    print(f"   ✓ Loaded {len(posts)} long-term posts")

    # Check API key
    if not os.getenv('OPENAI_API_KEY'):
        print("\n❌ Error: OPENAI_API_KEY not found!")
        print("   Add it to your .env file")
        return

    # Initialize extractor
    extractor = LongTermSideEffectExtractor()

    # Extract side effects
    side_effects = extractor.extract_from_all_posts(posts)

    # Standardize
    standardized = extractor.standardize_side_effects(side_effects)

    # Create statistics
    stats = extractor.create_statistics(standardized, len(posts))

    # Select top 20 for validation
    top_effects = extractor.select_top_for_validation(stats, top_n=20)

    # Save results
    extractor.save_results(side_effects, standardized, stats, top_effects, save_debug=save_debug)

    # Print summary
    print("\n" + "=" * 60)
    print("📊 Long-Term Side Effects Summary")
    print("=" * 60)
    print(f"Total mentions: {len(side_effects)}")
    print(f"Unique effects: {len(standardized)}")
    print(f"\n🔝 Top 20 Long-Term Side Effects (for PubMed validation):")

    for i, stat in enumerate(top_effects, 1):
        cat_icon = "🧠" if stat['category'] == 'mental' else "💊" if stat['category'] == 'physical' else "❓"
        years = f"({stat['avg_years_when_appeared']}y)" if stat['avg_years_when_appeared'] else ""
        persist = "⚠️" if stat.get('persists_after_stopping') else ""
        print(f"   {i:2d}. {cat_icon} {stat['side_effect']:35s} - {stat['post_count']:3d} posts {years} {persist}")

    print("\n✅ Extraction complete!")
    print("\n💡 Next step: Validate against PubMed")
    print("   python src/validation/long_term_evidence_validator.py")


if __name__ == "__main__":
    main()
