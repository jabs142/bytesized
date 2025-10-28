"""
LLM-Based Symptom Extractor V2
================================
Enhanced version with:
1. Negative examples in prompts (prevents false positives)
2. Severity extraction (mild/moderate/severe)
3. Trigger/context capture (what causes the symptom)
4. Duration tracking (acute vs chronic)

Based on methodology from: https://arxiv.org/html/2504.04346v2
"""

import json
import os
import time
from typing import List, Dict, Optional
from collections import Counter, defaultdict
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class LLMSymptomExtractorV2:
    """
    Extract symptoms with metadata using improved prompting.

    Key improvements:
    - Few-shot prompting with negative examples
    - Severity classification
    - Trigger/context extraction
    - Duration information
    """

    def __init__(self, api_key: Optional[str] = None):
        """Initialize with OpenAI API key."""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"

    def extract_symptoms_from_post(self, post: Dict) -> List[Dict]:
        """
        Extract symptoms with metadata from a single Reddit post.

        Args:
            post: Reddit post dict with 'title', 'selftext', 'id'

        Returns:
            List of extracted symptoms with metadata
        """
        # Combine title and body
        text = f"{post['title']}\\n\\n{post['selftext']}"

        # Skip if too short
        if len(text.strip()) < 50:
            return []

        prompt = f"""You are analyzing a Reddit post from an Ehlers-Danlos Syndrome (EDS) patient community. Extract ALL medical symptoms mentioned.

IMPORTANT - What to EXTRACT (positive examples):
✅ Physical symptoms: "joint pain", "fatigue", "muscle weakness"
✅ Sensory issues: "hearing loss", "blurry vision", "tinnitus"
✅ Mental health symptoms: "anxiety", "depression" (these ARE medical)
✅ Functional limitations: "difficulty walking", "loss of range of motion"
✅ Autonomic symptoms: "dizziness", "nausea", "fainting"

IMPORTANT - What to REJECT (negative examples):
❌ Social/psychological concepts: "imposter syndrome", "feeling like a fraud"
❌ Medical treatment experiences: "gaslighting by doctors", "dismissive healthcare"
❌ Technical/life issues: "internet problems", "scheduling conflicts"
❌ Negations: "no pain", "absence of symptoms", "feeling better"
❌ Treatment outcomes: "improved nausea", "better fatigue"
❌ Treatment management: "ineffective pain management"

For EACH symptom, extract:
1. symptom: Name of the symptom (as patient described)
2. severity: "mild", "moderate", "severe", or null
3. trigger: What causes it (e.g., "after standing", "in morning"), or null
4. duration: "acute" (recent/new), "chronic" (long-term), or null
5. original_quote: Exact quote from post
6. context: Additional relevant details or null

Reddit Post:
{text}

Return JSON with "symptoms" array:

Example format:
{{
  "symptoms": [
    {{
      "symptom": "joint pain",
      "severity": "severe",
      "trigger": "after walking",
      "duration": "chronic",
      "original_quote": "I get severe joint pain whenever I walk",
      "context": "worse in knees and hips"
    }},
    {{
      "symptom": "dizziness",
      "severity": "moderate",
      "trigger": "when standing up",
      "duration": "acute",
      "original_quote": "I've been getting dizzy when I stand",
      "context": "started last week"
    }},
    {{
      "symptom": "anxiety",
      "severity": "mild",
      "trigger": null,
      "duration": "chronic",
      "original_quote": "dealing with some anxiety",
      "context": null
    }}
  ]
}}

If NO medical symptoms found, return: {{"symptoms": []}}

Extract symptoms now:"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=3000,
                temperature=0,
                response_format={"type": "json_object"},
                messages=[{
                    "role": "system",
                    "content": "You are a medical symptom extraction assistant. Extract ONLY medical symptoms. Reject non-medical terms. Return valid JSON."
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
            symptoms = response_data.get('symptoms', [])

            # Add post metadata
            for symptom in symptoms:
                symptom['post_id'] = post['id']
                symptom['subreddit'] = post.get('subreddit', 'unknown')

            return symptoms

        except json.JSONDecodeError as e:
            print(f"   ⚠️  JSON parse error for post {post['id']}: {e}")
            return []
        except Exception as e:
            print(f"   ❌ Error extracting from post {post['id']}: {e}")
            return []

    def extract_from_all_posts(self, posts: List[Dict],
                               batch_size: int = 10,
                               save_progress: bool = True) -> List[Dict]:
        """
        Extract symptoms with metadata from all Reddit posts.

        Args:
            posts: List of Reddit post dicts
            batch_size: Save progress every N posts
            save_progress: Whether to save incremental progress

        Returns:
            List of all extracted symptoms with metadata
        """
        print(f"\\n🤖 Enhanced LLM-Based Symptom Extraction (V2)")
        print("=" * 60)
        print(f"Processing {len(posts)} Reddit posts...")
        print(f"Model: {self.model}")
        print("✨ New features:")
        print("  - Negative examples to prevent false positives")
        print("  - Severity extraction (mild/moderate/severe)")
        print("  - Trigger/context capture")
        print("  - Duration tracking (acute/chronic)\\n")

        all_symptoms = []

        for i, post in enumerate(posts, 1):
            print(f"[{i}/{len(posts)}] Processing post {post['id']}...", end=" ")

            symptoms = self.extract_symptoms_from_post(post)
            all_symptoms.extend(symptoms)

            print(f"✓ Found {len(symptoms)} symptoms")

            # Rate limiting
            time.sleep(0.5)

            # Save progress
            if save_progress and i % batch_size == 0:
                self._save_progress(all_symptoms, i)

        print(f"\\n✅ Extraction complete!")
        print(f"   Total symptom mentions: {len(all_symptoms)}")
        print(f"   Unique symptoms: {len(set(s['symptom'] for s in all_symptoms))}")

        # Calculate severity distribution
        severities = [s.get('severity') for s in all_symptoms if s.get('severity')]
        if severities:
            print(f"\\n📊 Severity Distribution:")
            severity_counts = Counter(severities)
            for severity, count in severity_counts.most_common():
                print(f"   {severity}: {count} ({count/len(severities)*100:.1f}%)")

        return all_symptoms

    def _save_progress(self, symptoms: List[Dict], count: int):
        """Save incremental progress."""
        os.makedirs('data/analysis', exist_ok=True)
        filename = f'data/analysis/llm_extracted_symptoms_v2_progress_{count}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(symptoms, f, indent=2, ensure_ascii=False)
        print(f"   💾 Progress saved: {count} posts processed")

    def save_results(self, symptoms: List[Dict]):
        """Save extraction results."""
        os.makedirs('data/analysis', exist_ok=True)

        # Save raw extracted symptoms with metadata
        with open('data/analysis/llm_extracted_symptoms_v2_raw.json', 'w', encoding='utf-8') as f:
            json.dump(symptoms, f, indent=2, ensure_ascii=False)

        # Create summary statistics
        stats = self.create_summary_statistics(symptoms)
        with open('data/analysis/llm_symptom_stats_v2.json', 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)

        print(f"\\n💾 Saved results:")
        print(f"   data/analysis/llm_extracted_symptoms_v2_raw.json")
        print(f"   data/analysis/llm_symptom_stats_v2.json")

    def create_summary_statistics(self, symptoms: List[Dict]) -> List[Dict]:
        """Create summary statistics with metadata aggregation."""
        print(f"\\n📊 Creating statistics...")

        # Group by symptom name
        grouped = defaultdict(lambda: {
            'mentions': [],
            'severities': [],
            'triggers': [],
            'durations': []
        })

        for symptom in symptoms:
            name = symptom['symptom']
            grouped[name]['mentions'].append(symptom)
            if symptom.get('severity'):
                grouped[name]['severities'].append(symptom['severity'])
            if symptom.get('trigger'):
                grouped[name]['triggers'].append(symptom['trigger'])
            if symptom.get('duration'):
                grouped[name]['durations'].append(symptom['duration'])

        # Create stats
        stats = []
        for symptom_name, data in grouped.items():
            # Get unique posts
            unique_posts = len(set(m['post_id'] for m in data['mentions']))

            # Most common severity
            severity_mode = None
            if data['severities']:
                severity_counts = Counter(data['severities'])
                severity_mode = severity_counts.most_common(1)[0][0]

            # Common triggers
            common_triggers = []
            if data['triggers']:
                trigger_counts = Counter(data['triggers'])
                common_triggers = [t for t, c in trigger_counts.most_common(3)]

            # Duration mode
            duration_mode = None
            if data['durations']:
                duration_counts = Counter(data['durations'])
                duration_mode = duration_counts.most_common(1)[0][0]

            stats.append({
                'symptom': symptom_name,
                'mention_count': len(data['mentions']),
                'post_count': unique_posts,
                'severity_mode': severity_mode,
                'common_triggers': common_triggers,
                'duration_mode': duration_mode,
                'examples': [m['original_quote'] for m in data['mentions'][:3]]
            })

        # Sort by post count
        stats.sort(key=lambda x: x['post_count'], reverse=True)

        print(f"   ✓ Created statistics for {len(stats)} unique symptoms")
        return stats


def main():
    """Main entry point for V2 extraction."""

    # Load Reddit posts
    print("📂 Loading Reddit posts...")
    with open('data/raw/eds_reddit_posts_latest.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)

    print(f"   ✓ Loaded {len(posts)} posts")

    # Check for API key
    if not os.getenv('OPENAI_API_KEY'):
        print("\\n❌ Error: OPENAI_API_KEY not found!")
        print("   Add it to your .env file")
        return

    # Initialize extractor
    extractor = LLMSymptomExtractorV2()

    # Extract symptoms
    symptoms = extractor.extract_from_all_posts(posts, batch_size=10)

    # Save results
    extractor.save_results(symptoms)

    # Print summary
    print("\\n" + "=" * 60)
    print("📊 Extraction Summary (V2)")
    print("=" * 60)
    print(f"Total symptom mentions: {len(symptoms)}")
    print(f"Unique symptoms: {len(set(s['symptom'] for s in symptoms))}")

    # Load stats for top 10
    with open('data/analysis/llm_symptom_stats_v2.json', 'r') as f:
        stats = json.load(f)

    print(f"\\n🔝 Top 10 Symptoms:")
    for i, stat in enumerate(stats[:10], 1):
        severity = f" [{stat['severity_mode']}]" if stat['severity_mode'] else ""
        duration = f" ({stat['duration_mode']})" if stat['duration_mode'] else ""
        triggers = f" - triggers: {', '.join(stat['common_triggers'][:2])}" if stat['common_triggers'] else ""
        print(f"   {i:2d}. {stat['symptom']:30s}{severity}{duration}{triggers}")
        print(f"       {stat['post_count']} posts, {stat['mention_count']} mentions")

    print("\\n✅ Enhanced extraction complete!")
    print("\\n💡 Next: Run deduplication and validation on V2 data")


if __name__ == "__main__":
    main()
