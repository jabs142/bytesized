"""
LLM-Based Side Effect Extractor for Birth Control
==================================================
Uses OpenAI API to extract ALL side effect mentions from Reddit posts
without predefined keywords - true unbiased discovery!

This solves the fundamental problem: We can't discover unknown side effects
by only looking for known side effects.
"""

import json
import os
import time
from typing import List, Dict, Optional
from collections import Counter, defaultdict
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class LLMSideEffectExtractor:
    """
    Extract side effects from text using OpenAI API (GPT-4).

    Key advantage: Discovers side effects WITHOUT predefined keywords.
    Captures variations, context, and truly novel side effect mentions.
    """

    def __init__(self, api_key: Optional[str] = None):
        """Initialize with OpenAI API key."""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"  # Fast and cost-effective

    def extract_side_effects_from_post(self, post: Dict) -> List[Dict]:
        """
        Extract all side effect mentions from a single Reddit post.

        Args:
            post: Reddit post dict with 'title', 'selftext', 'id'

        Returns:
            List of extracted side effects with context
        """
        # Combine title and body for analysis
        text = f"{post['title']}\n\n{post['selftext']}"

        # Skip if post is too short
        if len(text.strip()) < 50:
            return []

        prompt = f"""You are analyzing a Reddit post from a birth control support community. Your task is to extract ALL side effects, symptoms, and health issues mentioned that the person attributes to or experiences while on birth control.

CRITICAL: Standardize symptom names by REMOVING severity qualifiers. Track severity separately.
- "severe anxiety" → side_effect: "anxiety", severity: 3
- "mild headache" → side_effect: "headache", severity: 1
- "bad acne" → side_effect: "acne", severity: 2

Important guidelines:
1. Extract EVERY side effect mention, even if it seems minor or unrelated
2. Standardize side effect names - remove intensity words like "severe", "mild", "bad", "terrible"
3. Rate severity separately on 1-3 scale based on language intensity
4. Look for both obvious side effects (mood changes, acne) and surprising ones (hair loss, digestive issues, vision changes)
5. Include both physical and mental/emotional side effects
6. Extract even if the person is unsure if it's related to birth control

Severity Scale:
1 (Mild): "a bit", "slight", "mild", "minor", "manageable", "barely noticeable"
2 (Moderate): "bad", "significant", "noticeable", "concerning", "strong", "pretty bad"
3 (Severe): "severe", "terrible", "unbearable", "extreme", "debilitating", "can't function", "worst", "horrible"

Reddit Post:
{text}

Return a JSON object with a "side_effects" array. For each side effect, include:
- side_effect: standardized symptom name WITHOUT severity qualifiers (e.g., "anxiety" not "severe anxiety")
- severity: 1 (mild), 2 (moderate), or 3 (severe) based on language intensity
- original_quote: exact quote from the post
- context: any relevant timing or additional details (or null if none)
- category: "mental" or "physical" or "both"

Example format:
{{
  "side_effects": [
    {{"side_effect": "anxiety", "severity": 3, "original_quote": "I started having really bad anxiety attacks", "context": "started 2 weeks after starting pill", "category": "mental"}},
    {{"side_effect": "bleeding", "severity": 2, "original_quote": "my periods are super heavy now", "context": "heavier than before starting BC", "category": "physical"}},
    {{"side_effect": "brain fog", "severity": 2, "original_quote": "I can't focus or think clearly", "context": "constant throughout the day", "category": "mental"}},
    {{"side_effect": "headache", "severity": 1, "original_quote": "mild headaches occasionally", "context": "once or twice a week", "category": "physical"}}
  ]
}}

If NO side effects are mentioned, return: {{"side_effects": []}}

Extract side effects now:"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=2000,
                temperature=0,  # Deterministic for consistency
                response_format={"type": "json_object"},
                messages=[{
                    "role": "system",
                    "content": "You are a medical side effect extraction assistant. Extract side effects from patient posts about birth control and return them as valid JSON."
                }, {
                    "role": "user",
                    "content": prompt
                }]
            )

            # Parse JSON response
            content = response.choices[0].message.content

            # Extract JSON from response (handle markdown code blocks)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            response_data = json.loads(content)
            side_effects = response_data.get('side_effects', [])

            # Add post metadata to each side effect
            for side_effect in side_effects:
                side_effect['post_id'] = post['id']
                side_effect['subreddit'] = post.get('subreddit', 'unknown')

            return side_effects

        except json.JSONDecodeError as e:
            print(f"   ⚠️  JSON parse error for post {post['id']}: {e}")
            print(f"   Response: {content[:200]}...")
            return []
        except Exception as e:
            print(f"   ❌ Error extracting from post {post['id']}: {e}")
            return []

    def extract_from_all_posts(self, posts: List[Dict],
                               batch_size: int = 10,
                               save_progress: bool = True) -> List[Dict]:
        """
        Extract side effects from all Reddit posts.

        Args:
            posts: List of Reddit post dicts
            batch_size: Save progress every N posts
            save_progress: Whether to save incremental progress

        Returns:
            List of all extracted side effects with metadata
        """
        print(f"\n🤖 LLM-Based Side Effect Extraction")
        print("=" * 60)
        print(f"Processing {len(posts)} Reddit posts...")
        print(f"Model: {self.model}")
        print("🔍 Extracting ALL side effects (no predefined keywords!)\n")

        all_side_effects = []

        for i, post in enumerate(posts, 1):
            print(f"[{i}/{len(posts)}] Processing post {post['id']}...", end=" ")

            side_effects = self.extract_side_effects_from_post(post)
            all_side_effects.extend(side_effects)

            print(f"✓ Found {len(side_effects)} side effects")

            # Rate limiting (be nice to API)
            time.sleep(0.5)

            # Save progress periodically
            if save_progress and i % batch_size == 0:
                self._save_progress(all_side_effects, i)

        print(f"\n✅ Extraction complete!")
        print(f"   Total side effect mentions: {len(all_side_effects)}")
        print(f"   Unique side effects: {len(set(s['side_effect'] for s in all_side_effects))}")

        return all_side_effects

    def _save_progress(self, side_effects: List[Dict], count: int):
        """Save incremental progress."""
        os.makedirs('data/analysis', exist_ok=True)
        filename = f'data/analysis/llm_extracted_side_effects_progress_{count}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(side_effects, f, indent=2, ensure_ascii=False)
        print(f"   💾 Progress saved: {count} posts processed")

    def standardize_side_effects(self, side_effects: List[Dict]) -> Dict[str, List[Dict]]:
        """
        Cluster similar side effect mentions together.

        Uses another LLM call to group variations like:
        - "bad anxiety", "severe anxiety", "anxious all the time" → "anxiety"
        - "breaking out", "pimples", "acne" → "acne"

        Args:
            side_effects: List of raw extracted side effects

        Returns:
            Dict mapping standardized name -> list of mentions
        """
        print(f"\n🔄 Standardizing {len(side_effects)} side effect mentions...")

        # Get unique side effect names
        unique_side_effects = list(set(s['side_effect'] for s in side_effects))

        print(f"   Found {len(unique_side_effects)} unique side effect descriptions")
        print("   Using LLM to cluster similar side effects...")

        # Process in batches of 100
        all_mappings = {}

        for i in range(0, len(unique_side_effects), 100):
            batch = unique_side_effects[i:i+100]

            # Ask GPT to standardize/cluster
            prompt = f"""You have extracted side effects from birth control patient posts. Many are variations of the same side effect.

Your task: Group these into standardized side effect names.

CRITICAL: Remove ALL severity qualifiers from standardized names.
- "severe anxiety", "bad anxiety", "terrible anxiety" → "anxiety"
- "mild headache", "bad headache" → "headache"
- "horrible acne", "severe acne" → "acne"

Rules:
1. Use medical terminology when appropriate (e.g., "acne" not "breaking out")
2. Remove ALL severity words (severe, mild, bad, terrible, horrible, slight, etc.)
3. Group obvious variations (e.g., "bad acne", "pimples", "breakouts" → "acne")
4. Keep the standardized names concise but specific
5. Maintain distinction between physical and mental side effects

Side effect mentions to standardize:
{json.dumps(batch, indent=2)}

Return a JSON object mapping: original_description -> standardized_name (WITHOUT severity)

Example:
{{
  "really bad anxiety": "anxiety",
  "severe anxiety attacks": "anxiety",
  "mild anxiety": "anxiety",
  "bad breakouts": "acne",
  "severe acne": "acne",
  "tons of pimples": "acne",
  "can't concentrate": "brain fog",
  "foggy brain": "brain fog",
  "horrible headaches": "headache",
  "mild headaches": "headache"
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

                time.sleep(0.5)  # Rate limiting

            except Exception as e:
                print(f"   ⚠️  Batch standardization failed: {e}")
                # Fallback: use original names
                for item in batch:
                    all_mappings[item] = item

        # Apply standardization
        standardized = defaultdict(list)
        for side_effect in side_effects:
            original = side_effect['side_effect']
            standard_name = all_mappings.get(original, original)  # Fallback to original
            standardized[standard_name].append(side_effect)

        print(f"   ✓ Standardized to {len(standardized)} unique side effects")

        return dict(standardized)

    def create_side_effect_statistics(self, standardized_side_effects: Dict[str, List[Dict]],
                                     total_posts: int) -> List[Dict]:
        """
        Create statistics for each standardized side effect.

        Args:
            standardized_side_effects: Dict of side_effect_name -> mentions
            total_posts: Total number of posts analyzed

        Returns:
            List of side effect statistics sorted by frequency
        """
        stats = []

        for side_effect_name, mentions in standardized_side_effects.items():
            # Count unique posts mentioning this side effect
            unique_posts = len(set(m['post_id'] for m in mentions))

            # Calculate frequency
            frequency = unique_posts / total_posts if total_posts > 0 else 0

            # Determine category (most common category for this side effect)
            categories = [m.get('category', 'unknown') for m in mentions]
            category_counts = Counter(categories)
            primary_category = category_counts.most_common(1)[0][0] if category_counts else 'unknown'

            # Calculate severity breakdown
            severities = [m.get('severity', 2) for m in mentions]  # Default to moderate (2) if missing
            severity_counts = Counter(severities)
            avg_severity = sum(severities) / len(severities) if severities else 2.0

            stats.append({
                'side_effect': side_effect_name,
                'mention_count': len(mentions),  # Total mentions (can be multiple per post)
                'post_count': unique_posts,      # Unique posts
                'frequency': round(frequency, 3),
                'category': primary_category,
                'severity_breakdown': {
                    'mild': severity_counts.get(1, 0),
                    'moderate': severity_counts.get(2, 0),
                    'severe': severity_counts.get(3, 0)
                },
                'avg_severity': round(avg_severity, 2),
                'examples': [m['original_quote'] for m in mentions[:3]],  # Sample quotes
                'contexts': [m['context'] for m in mentions[:3] if m.get('context')]
            })

        # Sort by post count (descending)
        stats.sort(key=lambda x: x['post_count'], reverse=True)

        return stats

    def save_results(self, side_effects: List[Dict],
                    standardized: Dict[str, List[Dict]],
                    stats: List[Dict]):
        """Save all extraction results."""
        os.makedirs('data/analysis', exist_ok=True)

        # Save raw extracted side effects
        with open('data/analysis/llm_extracted_side_effects_raw.json', 'w', encoding='utf-8') as f:
            json.dump(side_effects, f, indent=2, ensure_ascii=False)

        # Save standardized groupings
        with open('data/analysis/llm_extracted_side_effects_standardized.json', 'w', encoding='utf-8') as f:
            json.dump(standardized, f, indent=2, ensure_ascii=False)

        # Save statistics (comparable to the keyword-based stats)
        with open('data/analysis/llm_side_effect_stats.json', 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved results:")
        print(f"   data/analysis/llm_extracted_side_effects_raw.json")
        print(f"   data/analysis/llm_extracted_side_effects_standardized.json")
        print(f"   data/analysis/llm_side_effect_stats.json")


def main():
    """Main entry point for LLM-based side effect extraction."""

    # Load Reddit posts
    print("📂 Loading Reddit posts...")

    # Find the latest Reddit posts file
    import glob
    post_files = glob.glob('data/raw/reddit_bc_symptoms_posts_*.json')
    if not post_files:
        print("❌ No Reddit post files found in data/raw/")
        print("   Run: python src/data_collection/reddit_collector.py")
        return

    latest_file = max(post_files)

    with open(latest_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    print(f"   ✓ Loaded {len(posts)} posts from {latest_file}")

    # Check for API key
    if not os.getenv('OPENAI_API_KEY'):
        print("\n❌ Error: OPENAI_API_KEY not found!")
        print("   Add it to your .env file:")
        print("   OPENAI_API_KEY=your_key_here")
        return

    # Initialize extractor
    extractor = LLMSideEffectExtractor()

    # Extract side effects from all posts
    side_effects = extractor.extract_from_all_posts(posts, batch_size=10)

    # Standardize side effect names
    standardized = extractor.standardize_side_effects(side_effects)

    # Create statistics
    stats = extractor.create_side_effect_statistics(standardized, len(posts))

    # Save results
    extractor.save_results(side_effects, standardized, stats)

    # Print summary
    print("\n" + "=" * 60)
    print("📊 Extraction Summary")
    print("=" * 60)
    print(f"Total side effect mentions: {len(side_effects)}")
    print(f"Unique standardized side effects: {len(standardized)}")
    print(f"\n🔝 Top 15 Side Effects:")
    for i, stat in enumerate(stats[:15], 1):
        cat_icon = "🧠" if stat['category'] == 'mental' else "💊" if stat['category'] == 'physical' else "❓"
        print(f"   {i:2d}. {cat_icon} {stat['side_effect']:30s} - {stat['post_count']:3d} posts ({stat['frequency']*100:5.1f}%)")

    print("\n✅ LLM-based extraction complete!")
    print("\n💡 Next step: Validate these side effects with PubMed research")
    print("   python src/validation/evidence_validator.py")


if __name__ == "__main__":
    main()
