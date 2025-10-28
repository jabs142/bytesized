"""
Symptom Cleaner
================
Filters out non-medical symptoms and intelligently groups related symptoms.

Removes:
- Non-medical terms (internet connectivity, gaslighting, imposter syndrome)
- Temporal modifiers (new pain → pain)
- Negations (no pain)

Groups:
- Location-specific weakness (hand weakness, arm weakness → limb weakness)
- Support needs (foot support, knee support → orthopedic support needs)
- Temperature sensitivities
"""

import json
import os
from typing import List, Dict, Set
from collections import defaultdict
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class SymptomCleaner:
    """Clean and filter symptom data."""

    def __init__(self, api_key: str = None):
        """Initialize with OpenAI API key."""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"

        # Manual blacklist for obvious non-medical terms
        self.blacklist = {
            'internet connectivity issues',
            'imposter syndrome',
            'gaslighting',
            'medical gaslighting',
            'no pain',
            'no symptoms',
            'improved nausea',  # This is a positive outcome, not a symptom
            'ineffective nausea management',  # This is about treatment, not symptom
        }

    def filter_medical_symptoms(self, symptoms: List[Dict], batch_size: int = 100) -> List[Dict]:
        """
        Use LLM to filter out non-medical symptoms.

        Args:
            symptoms: List of symptom dicts
            batch_size: Batch size for LLM calls

        Returns:
            Filtered list of medical symptoms
        """
        print(f"\n🧹 Filtering non-medical symptoms...")

        filtered = []

        # First, apply blacklist
        symptoms_after_blacklist = [s for s in symptoms if s['symptom'] not in self.blacklist]
        print(f"   Removed {len(symptoms) - len(symptoms_after_blacklist)} blacklisted terms")

        # Process in batches with LLM
        for i in range(0, len(symptoms_after_blacklist), batch_size):
            batch = symptoms_after_blacklist[i:i+batch_size]
            symptom_names = [s['symptom'] for s in batch]

            print(f"   Processing batch {i//batch_size + 1}/{(len(symptoms_after_blacklist)-1)//batch_size + 1}...")

            prompt = f"""You are a medical expert reviewing symptoms extracted from patient reports.

Your task: Identify which items are ACTUAL MEDICAL SYMPTOMS vs non-medical terms.

NON-MEDICAL (reject these):
- Psychological/social concepts: "imposter syndrome", "gaslighting"
- Technical issues: "internet connectivity issues"
- Negations: "no pain", "absence of symptoms"
- Treatment outcomes: "improved condition", "better nausea"
- Treatment failures: "ineffective management"

MEDICAL (keep these):
- Physical symptoms: "pain", "nausea", "weakness"
- Mental health symptoms: "anxiety", "depression" (these ARE medical)
- Sensory symptoms: "hearing loss", "vision problems"
- Functional limitations: "difficulty walking", "loss of range of motion"

Symptoms to review:
{json.dumps(symptom_names, indent=2)}

Return a JSON object with two arrays:
- "keep": symptoms that are actual medical symptoms
- "remove": non-medical terms

Example:
{{
  "keep": ["pain", "nausea", "anxiety", "hearing loss"],
  "remove": ["internet connectivity issues", "imposter syndrome", "no pain"]
}}

Return the classification now:"""

            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    max_tokens=4000,
                    temperature=0,
                    response_format={"type": "json_object"},
                    messages=[{
                        "role": "system",
                        "content": "You are a medical expert. Return valid JSON classifying medical vs non-medical terms."
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

                result = json.loads(content)
                keep_set = set(result.get('keep', []))

                # Keep symptoms that passed the filter
                for symptom in batch:
                    if symptom['symptom'] in keep_set:
                        filtered.append(symptom)

            except Exception as e:
                print(f"   ⚠️  Error processing batch: {e}")
                # Fallback: keep all from this batch
                filtered.extend(batch)

        print(f"   ✓ Kept {len(filtered)}/{len(symptoms)} symptoms as medical")
        return filtered

    def smart_group_symptoms(self, symptoms: List[Dict]) -> List[Dict]:
        """
        Intelligently group related symptoms while preserving meaningful distinctions.

        Groups:
        - "new pain", "chronic pain exacerbation" → just add to "pain"
        - "hand weakness", "arm weakness", "leg weakness" → "limb weakness"
        - "foot support", "knee support" → "orthopedic support needs"
        - "sensitivity to hot foods", "need for kids temp food" → "temperature sensitivity (food)"

        Preserves:
        - "hand weakness" vs "grip strength" (different concepts)
        - "knee pain" vs "joint pain" (specificity matters)
        """
        print(f"\n🔄 Smart grouping of related symptoms...")

        # Build mapping
        mapping = {}
        for symptom in symptoms:
            name = symptom['symptom']

            # Remove temporal modifiers
            if name.startswith('new '):
                mapping[name] = name[4:]  # "new pain" → "pain"
            elif name.startswith('chronic ') and 'exacerbation' in name:
                # "chronic pain exacerbation" → "pain"
                base = name.replace('chronic ', '').replace(' exacerbation', '')
                mapping[name] = base
            # Group location-specific weakness
            elif 'hand weakness' in name or 'arm weakness' in name or 'leg weakness' in name or 'right leg weakness' in name or 'left leg weakness' in name:
                # All become "limb weakness"
                mapping[name] = 'limb weakness'
            # Group support needs
            elif 'foot support' in name or 'knee support' in name or 'ankle support' in name:
                mapping[name] = 'orthopedic support needs'
            # Group temperature sensitivity
            elif ('sensitivity to hot' in name or 'kids temp' in name or 'temperature sensitivity' in name) and 'food' in name:
                mapping[name] = 'food temperature sensitivity'
            else:
                mapping[name] = name  # Keep as-is

        # Merge data
        merged = defaultdict(lambda: {
            'mention_count': 0,
            'examples': [],
            'contexts': []
        })

        for symptom in symptoms:
            original = symptom['symptom']
            normalized = mapping.get(original, original)

            merged[normalized]['mention_count'] += symptom['mention_count']
            merged[normalized]['examples'].extend(symptom['examples'][:1])
            merged[normalized]['contexts'].extend(symptom.get('contexts', [])[:1])

        # Convert back to list
        result = []
        for symptom_name, data in merged.items():
            result.append({
                'symptom': symptom_name,
                'mention_count': data['mention_count'],
                'examples': [e for e in data['examples'] if e][:3],
                'contexts': [c for c in data['contexts'] if c][:3]
            })

        # Sort by mention count
        result.sort(key=lambda x: x['mention_count'], reverse=True)

        print(f"   ✓ Grouped {len(symptoms)} symptoms into {len(result)} unique symptoms")
        print(f"   Reduction: {len(symptoms) - len(result)} symptoms merged")

        return result

    def clean_symptoms(self, input_file: str, output_file: str):
        """
        Main cleaning pipeline.

        Args:
            input_file: Path to deduplicated symptoms
            output_file: Path to save cleaned symptoms
        """
        print("\n" + "=" * 70)
        print("🧹 Symptom Cleaning Pipeline")
        print("=" * 70)

        # Load data
        print(f"\n📂 Loading {input_file}...")
        with open(input_file, 'r', encoding='utf-8') as f:
            symptoms = json.load(f)

        print(f"   ✓ Loaded {len(symptoms)} symptoms")

        # Step 1: Filter out non-medical symptoms
        filtered = self.filter_medical_symptoms(symptoms)

        # Step 2: Smart grouping
        cleaned = self.smart_group_symptoms(filtered)

        # Save results
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(cleaned, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved cleaned symptoms to {output_file}")

        # Print summary
        print("\n" + "=" * 70)
        print("📊 Cleaning Summary")
        print("=" * 70)
        print(f"Original symptoms: {len(symptoms)}")
        print(f"After filtering non-medical: {len(filtered)}")
        print(f"After smart grouping: {len(cleaned)}")
        print(f"Total reduction: {len(symptoms) - len(cleaned)} symptoms ({(1 - len(cleaned)/len(symptoms))*100:.1f}%)")

        print(f"\n🔝 Top 10 Symptoms After Cleaning:")
        for i, stat in enumerate(cleaned[:10], 1):
            print(f"   {i:2d}. {stat['symptom']:35s} - {stat['mention_count']:3d} mentions")

        print("\n✅ Cleaning complete!")


def main():
    """Main entry point."""

    input_file = 'data/analysis/llm_symptom_stats_deduplicated.json'
    output_file = 'data/analysis/llm_symptom_stats_cleaned.json'

    cleaner = SymptomCleaner()
    cleaner.clean_symptoms(input_file, output_file)


if __name__ == "__main__":
    main()
