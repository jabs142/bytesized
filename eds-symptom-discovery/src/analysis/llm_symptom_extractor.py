"""
LLM-Based Symptom Extractor
============================
Uses Claude API to extract ALL symptom mentions from Reddit posts
without predefined keywords - true unbiased discovery!

This solves the fundamental problem: We can't discover unknown symptoms
by only looking for known symptoms.
"""

import json
import os
import time
from typing import List, Dict, Optional
from collections import Counter, defaultdict
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class LLMSymptomExtractor:
    """
    Extract symptoms from text using OpenAI API (GPT-4).

    Key advantage: Discovers symptoms WITHOUT predefined keywords.
    Captures variations, context, and truly novel symptom mentions.
    """

    def __init__(self, api_key: Optional[str] = None):
        """Initialize with OpenAI API key."""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"  # Fast and cost-effective

    def extract_symptoms_from_post(self, post: Dict) -> List[Dict]:
        """
        Extract all symptom mentions from a single Reddit post.

        Args:
            post: Reddit post dict with 'title', 'selftext', 'id'

        Returns:
            List of extracted symptoms with context
        """
        # Combine title and body for analysis
        text = f"{post['title']}\n\n{post['selftext']}"

        # Skip if post is too short
        if len(text.strip()) < 50:
            return []

        prompt = f"""You are analyzing a Reddit post from an Ehlers-Danlos Syndrome (EDS) support community. Your task is to extract ALL symptoms, medical conditions, and health issues mentioned by the patient.

Important guidelines:
1. Extract EVERY symptom mention, even if it seems minor or unrelated
2. Capture the EXACT wording patients use (don't normalize yet)
3. Include context like timing, triggers, or severity if mentioned
4. Look for both obvious symptoms (pain, fatigue) and surprising ones (car sickness, frequent urination, temperature sensitivity)
5. Extract even if the symptom isn't directly attributed to EDS

Reddit Post:
{text}

Return a JSON object with a "symptoms" array. For each symptom, include:
- symptom: the symptom name as the patient described it
- original_quote: exact quote from the post
- context: any relevant timing, triggers, or additional details (or null if none)

Example format:
{{
  "symptoms": [
    {{"symptom": "motion sickness in cars", "original_quote": "I get super dizzy in cars", "context": "specifically in cars"}},
    {{"symptom": "frequent urination", "original_quote": "I have to pee like every 30 minutes", "context": "every 30 minutes"}},
    {{"symptom": "vision goes black when standing", "original_quote": "my vision goes black for a second", "context": "when standing up"}}
  ]
}}

If NO symptoms are mentioned, return: {{"symptoms": []}}

Extract symptoms now:"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=2000,
                temperature=0,  # Deterministic for consistency
                response_format={"type": "json_object"},
                messages=[{
                    "role": "system",
                    "content": "You are a medical symptom extraction assistant. Extract symptoms from patient posts and return them as valid JSON."
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
            symptoms = response_data.get('symptoms', [])

            # Add post metadata to each symptom
            for symptom in symptoms:
                symptom['post_id'] = post['id']
                symptom['subreddit'] = post.get('subreddit', 'unknown')

            return symptoms

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
        Extract symptoms from all Reddit posts.

        Args:
            posts: List of Reddit post dicts
            batch_size: Save progress every N posts
            save_progress: Whether to save incremental progress

        Returns:
            List of all extracted symptoms with metadata
        """
        print(f"\n🤖 LLM-Based Symptom Extraction")
        print("=" * 60)
        print(f"Processing {len(posts)} Reddit posts...")
        print(f"Model: {self.model}")
        print("🔍 Extracting ALL symptoms (no predefined keywords!)\n")

        all_symptoms = []

        for i, post in enumerate(posts, 1):
            print(f"[{i}/{len(posts)}] Processing post {post['id']}...", end=" ")

            symptoms = self.extract_symptoms_from_post(post)
            all_symptoms.extend(symptoms)

            print(f"✓ Found {len(symptoms)} symptoms")

            # Rate limiting (be nice to API)
            time.sleep(0.5)

            # Save progress periodically
            if save_progress and i % batch_size == 0:
                self._save_progress(all_symptoms, i)

        print(f"\n✅ Extraction complete!")
        print(f"   Total symptom mentions: {len(all_symptoms)}")
        print(f"   Unique symptoms: {len(set(s['symptom'] for s in all_symptoms))}")

        return all_symptoms

    def _save_progress(self, symptoms: List[Dict], count: int):
        """Save incremental progress."""
        os.makedirs('data/analysis', exist_ok=True)
        filename = f'data/analysis/llm_extracted_symptoms_progress_{count}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(symptoms, f, indent=2, ensure_ascii=False)
        print(f"   💾 Progress saved: {count} posts processed")

    def standardize_symptoms(self, symptoms: List[Dict]) -> Dict[str, List[Dict]]:
        """
        Cluster similar symptom mentions together.

        Uses another LLM call to group variations like:
        - "car sickness", "motion sickness", "carsick" → "motion sickness"
        - "need to pee constantly", "frequent urination" → "frequent urination"

        Args:
            symptoms: List of raw extracted symptoms

        Returns:
            Dict mapping standardized name -> list of mentions
        """
        print(f"\n🔄 Standardizing {len(symptoms)} symptom mentions...")

        # Get unique symptom names
        unique_symptoms = list(set(s['symptom'] for s in symptoms))

        print(f"   Found {len(unique_symptoms)} unique symptom descriptions")
        print("   Using LLM to cluster similar symptoms...")

        # Ask Claude to standardize/cluster
        prompt = f"""You have extracted symptoms from EDS patient posts. Many are variations of the same symptom.

Your task: Group these into standardized symptom names.

Rules:
1. Use medical terminology when appropriate (e.g., "frequent urination" not "need to pee a lot")
2. Preserve important distinctions (e.g., "morning fatigue" vs "post-exercise fatigue")
3. Group obvious variations (e.g., "car sick", "motion sickness", "carsick")
4. Keep the standardized names concise but specific

Symptom mentions to standardize:
{json.dumps(unique_symptoms[:100], indent=2)}

Return a JSON object mapping: original_description -> standardized_name

Example:
{{
  "super dizzy in cars": "motion sickness",
  "car sickness": "motion sickness",
  "need to pee every 30 min": "frequent urination",
  "constant urination": "frequent urination",
  "vision goes black": "orthostatic vision changes"
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
                    "content": "You are a medical terminology expert. Standardize symptom descriptions and return valid JSON."
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

            mapping = json.loads(content)

            # Apply standardization
            standardized = defaultdict(list)
            for symptom in symptoms:
                original = symptom['symptom']
                standard_name = mapping.get(original, original)  # Fallback to original
                standardized[standard_name].append(symptom)

            print(f"   ✓ Standardized to {len(standardized)} unique symptoms")

            return dict(standardized)

        except Exception as e:
            print(f"   ⚠️  Standardization failed: {e}")
            print("   Falling back to original symptom names")

            # Fallback: group by exact match
            standardized = defaultdict(list)
            for symptom in symptoms:
                standardized[symptom['symptom']].append(symptom)
            return dict(standardized)

    def create_symptom_statistics(self, standardized_symptoms: Dict[str, List[Dict]],
                                  total_posts: int) -> List[Dict]:
        """
        Create statistics for each standardized symptom.

        Args:
            standardized_symptoms: Dict of symptom_name -> mentions
            total_posts: Total number of posts analyzed

        Returns:
            List of symptom statistics sorted by frequency
        """
        stats = []

        for symptom_name, mentions in standardized_symptoms.items():
            # Count unique posts mentioning this symptom
            unique_posts = len(set(m['post_id'] for m in mentions))

            # Calculate frequency
            frequency = unique_posts / total_posts if total_posts > 0 else 0

            stats.append({
                'symptom': symptom_name,
                'mention_count': len(mentions),  # Total mentions (can be multiple per post)
                'post_count': unique_posts,      # Unique posts
                'frequency': round(frequency, 3),
                'examples': [m['original_quote'] for m in mentions[:3]],  # Sample quotes
                'contexts': [m['context'] for m in mentions[:3] if m['context']]
            })

        # Sort by post count (descending)
        stats.sort(key=lambda x: x['post_count'], reverse=True)

        return stats

    def save_results(self, symptoms: List[Dict],
                    standardized: Dict[str, List[Dict]],
                    stats: List[Dict]):
        """Save all extraction results."""
        os.makedirs('data/analysis', exist_ok=True)

        # Save raw extracted symptoms
        with open('data/analysis/llm_extracted_symptoms_raw.json', 'w', encoding='utf-8') as f:
            json.dump(symptoms, f, indent=2, ensure_ascii=False)

        # Save standardized groupings
        with open('data/analysis/llm_extracted_symptoms_standardized.json', 'w', encoding='utf-8') as f:
            json.dump(standardized, f, indent=2, ensure_ascii=False)

        # Save statistics (replaces the keyword-based stats)
        with open('data/analysis/llm_symptom_stats.json', 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved results:")
        print(f"   data/analysis/llm_extracted_symptoms_raw.json")
        print(f"   data/analysis/llm_extracted_symptoms_standardized.json")
        print(f"   data/analysis/llm_symptom_stats.json")


def main():
    """Main entry point for LLM-based symptom extraction."""

    # Load Reddit posts
    print("📂 Loading Reddit posts...")
    with open('data/raw/eds_reddit_posts_latest.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)

    print(f"   ✓ Loaded {len(posts)} posts")

    # Check for API key
    if not os.getenv('OPENAI_API_KEY'):
        print("\n❌ Error: OPENAI_API_KEY not found!")
        print("   Add it to your .env file:")
        print("   OPENAI_API_KEY=your_key_here")
        return

    # Initialize extractor
    extractor = LLMSymptomExtractor()

    # Extract symptoms from all posts
    symptoms = extractor.extract_from_all_posts(posts, batch_size=10)

    # Standardize symptom names
    standardized = extractor.standardize_symptoms(symptoms)

    # Create statistics
    stats = extractor.create_symptom_statistics(standardized, len(posts))

    # Save results
    extractor.save_results(symptoms, standardized, stats)

    # Print summary
    print("\n" + "=" * 60)
    print("📊 Extraction Summary")
    print("=" * 60)
    print(f"Total symptom mentions: {len(symptoms)}")
    print(f"Unique standardized symptoms: {len(standardized)}")
    print(f"\n🔝 Top 10 Symptoms:")
    for i, stat in enumerate(stats[:10], 1):
        print(f"   {i:2d}. {stat['symptom']:30s} - {stat['post_count']:3d} posts ({stat['frequency']*100:5.1f}%)")

    print("\n✅ LLM-based extraction complete!")
    print("\n💡 Next step: Re-run validation with these discovered symptoms")
    print("   python src/validation/evidence_validator.py --llm-extracted")


if __name__ == "__main__":
    main()
