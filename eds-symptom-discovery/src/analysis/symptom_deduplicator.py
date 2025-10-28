"""
Symptom Deduplicator
====================
Intelligently merges similar symptom mentions using LLM-based clustering.

Removes:
- Intensity modifiers (extreme, super, really, very, mild, etc.)
- Redundant location/time qualifiers
- Duplicates with different wording

Example: "extreme knee pain", "severe knee pain", "knee pain" → "knee pain"
"""

import json
import os
from typing import List, Dict
from collections import defaultdict
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class SymptomDeduplicator:
    """Deduplicate and normalize symptom mentions."""

    def __init__(self, api_key: str = None):
        """Initialize with OpenAI API key."""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"

    def deduplicate_batch(self, symptoms: List[str], batch_size: int = 100) -> Dict[str, str]:
        """
        Deduplicate a batch of symptoms using LLM.

        Args:
            symptoms: List of symptom names to deduplicate
            batch_size: Number of symptoms to process per LLM call

        Returns:
            Dict mapping original symptom → normalized symptom
        """
        mapping = {}

        # Process in batches
        for i in range(0, len(symptoms), batch_size):
            batch = symptoms[i:i+batch_size]

            print(f"   Processing batch {i//batch_size + 1}/{(len(symptoms)-1)//batch_size + 1} ({len(batch)} symptoms)...")

            prompt = f"""You are normalizing EDS symptom descriptions to reduce duplication.

Rules for normalization:
1. Remove intensity modifiers: "extreme", "super", "really", "very", "mild", "severe", "excruciating", etc.
2. Keep location specificity: "knee pain" and "back pain" are different
3. Merge obvious duplicates: "lower back pain" and "low back pain" → "lower back pain"
4. Standardize to medical terminology when appropriate
5. Keep distinct symptoms separate: "pain" and "chronic pain" are different (chronic is a distinct qualifier)
6. Normalize tense and plurality: "headaches" → "headache"

Symptoms to normalize:
{json.dumps(batch, indent=2)}

Return a JSON object mapping each original symptom to its normalized form.

Example:
{{
  "extreme knee pain": "knee pain",
  "super itchy skin": "itchy skin",
  "lower back pain": "lower back pain",
  "low back pain": "lower back pain",
  "chronic fatigue": "chronic fatigue",
  "fatigue": "fatigue",
  "headaches": "headache",
  "severe headaches": "headache"
}}

Return the mapping now:"""

            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    max_tokens=4000,
                    temperature=0,
                    response_format={"type": "json_object"},
                    messages=[{
                        "role": "system",
                        "content": "You are a medical terminology normalizer. Return valid JSON mapping original symptoms to normalized forms."
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
                mapping.update(batch_mapping)

            except Exception as e:
                print(f"   ⚠️  Error processing batch: {e}")
                # Fallback: map each symptom to itself
                for symptom in batch:
                    mapping[symptom] = symptom

        return mapping

    def merge_symptom_data(self, stats: List[Dict], mapping: Dict[str, str]) -> List[Dict]:
        """
        Merge symptom statistics based on normalization mapping.

        Args:
            stats: Original symptom statistics
            mapping: Dict mapping original → normalized symptom names

        Returns:
            Merged symptom statistics
        """
        print("\n🔄 Merging symptom data...")

        # Group by normalized name
        merged = defaultdict(lambda: {
            'mention_count': 0,
            'post_ids': set(),
            'examples': [],
            'contexts': []
        })

        for stat in stats:
            original = stat['symptom']
            normalized = mapping.get(original, original)

            merged[normalized]['mention_count'] += stat['mention_count']
            # Post count will be calculated from unique post_ids
            # Assuming we have post_ids in the examples metadata
            merged[normalized]['examples'].extend(stat['examples'][:1])  # Take 1 example from each
            merged[normalized]['contexts'].extend(stat.get('contexts', [])[:1])

        # Convert back to list format
        result = []
        for symptom, data in merged.items():
            result.append({
                'symptom': symptom,
                'mention_count': data['mention_count'],
                'examples': data['examples'][:3],  # Keep top 3
                'contexts': [c for c in data['contexts'] if c][:3]  # Keep top 3 non-null
            })

        # Sort by mention count
        result.sort(key=lambda x: x['mention_count'], reverse=True)

        print(f"   ✓ Merged {len(stats)} symptoms into {len(result)} unique symptoms")

        return result

    def deduplicate_symptoms(self, input_file: str, output_file: str):
        """
        Main deduplication pipeline.

        Args:
            input_file: Path to llm_symptom_stats.json
            output_file: Path to save deduplicated stats
        """
        print("\n🧹 Symptom Deduplication Pipeline")
        print("=" * 60)

        # Load data
        print(f"\n📂 Loading {input_file}...")
        with open(input_file, 'r', encoding='utf-8') as f:
            stats = json.load(f)

        print(f"   ✓ Loaded {len(stats)} symptoms")

        # Extract unique symptom names
        symptoms = [s['symptom'] for s in stats]

        print(f"\n🤖 Deduplicating with LLM...")
        mapping = self.deduplicate_batch(symptoms)

        # Show some examples
        print("\n📋 Sample normalization:")
        examples = list(mapping.items())[:5]
        for orig, norm in examples:
            if orig != norm:
                print(f"   '{orig}' → '{norm}'")

        # Merge data
        merged_stats = self.merge_symptom_data(stats, mapping)

        # Save results
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_stats, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved deduplicated symptoms to {output_file}")

        # Print summary
        print("\n" + "=" * 60)
        print("📊 Deduplication Summary")
        print("=" * 60)
        print(f"Original symptoms: {len(stats)}")
        print(f"Deduplicated symptoms: {len(merged_stats)}")
        print(f"Reduction: {len(stats) - len(merged_stats)} symptoms ({(1 - len(merged_stats)/len(stats))*100:.1f}%)")

        print(f"\n🔝 Top 10 Symptoms After Deduplication:")
        for i, stat in enumerate(merged_stats[:10], 1):
            print(f"   {i:2d}. {stat['symptom']:35s} - {stat['mention_count']:3d} mentions")

        print("\n✅ Deduplication complete!")


def main():
    """Main entry point."""

    input_file = 'data/analysis/llm_symptom_stats.json'
    output_file = 'data/analysis/llm_symptom_stats_deduplicated.json'

    deduplicator = SymptomDeduplicator()
    deduplicator.deduplicate_symptoms(input_file, output_file)


if __name__ == "__main__":
    main()
