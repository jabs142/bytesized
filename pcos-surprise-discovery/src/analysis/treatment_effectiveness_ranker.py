"""
Treatment Effectiveness Ranking
=================================
Ranks treatments by success rate for each top symptom.

LEARNING CONCEPTS:
- Evidence-based treatment analysis
- Success rate calculation from patient reports
- Treatment comparison methodology
"""

import json
import sys
from pathlib import Path
from typing import List, Dict
from collections import defaultdict, Counter

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class TreatmentEffectivenessRanker:
    """
    Analyzes what treatments actually helped patients.

    Why This Matters:
    - Shows real-world effectiveness (not just clinical trials)
    - Patient-reported outcomes matter
    - Helps others find solutions that worked
    """

    def load_solution_extractions(self) -> List[Dict]:
        """Load solution extraction results"""
        input_path = Config.PROCESSED_DATA_DIR / Config.SOLUTIONS_FILE

        if not input_path.exists():
            raise FileNotFoundError(f"Solution extractions not found at {input_path}")

        with open(input_path, 'r', encoding='utf-8') as f:
            extractions = json.load(f)

        print(f"Loaded {len(extractions)} solution extraction results")
        return extractions

    def aggregate_treatments(self, extractions: List[Dict]) -> Dict[str, Dict]:
        """
        Aggregate all treatment mentions by symptom.

        Returns:
            Dict of {symptom: {treatment: [effectiveness_list]}}
        """
        # symptom -> treatment -> list of effectiveness reports
        treatment_data = defaultdict(lambda: defaultdict(list))

        for extraction in extractions:
            for solution in extraction.get('solutions', []):
                symptom = solution.get('target_symptom', '').lower().strip()
                treatment = solution.get('solution', '').lower().strip()
                effectiveness = solution.get('effectiveness', 'unclear').lower()

                if not symptom or not treatment:
                    continue

                treatment_data[symptom][treatment].append({
                    'effectiveness': effectiveness,
                    'details': solution.get('details', ''),
                    'time_to_results': solution.get('time_to_results', ''),
                    'side_effects': solution.get('side_effects', ''),
                    'quote': solution.get('quote', '')
                })

        return treatment_data

    def calculate_success_rates(self, treatment_data: Dict) -> Dict[str, List[Dict]]:
        """
        Calculate success rates for each treatment.

        Success Rate Calculation:
        - high effectiveness = 1.0 (success)
        - medium effectiveness = 0.5 (partial success)
        - low/unclear = 0.0 (not helpful)
        """
        results = {}

        for symptom, treatments in treatment_data.items():
            treatment_rankings = []

            for treatment, reports in treatments.items():
                # Only analyze treatments with at least 3 reports
                if len(reports) < 3:
                    continue

                # Calculate success rate
                successes = 0
                for report in reports:
                    eff = report['effectiveness']
                    if eff in ['high', 'yes', 'very helpful', 'effective']:
                        successes += 1.0
                    elif eff in ['medium', 'somewhat', 'moderate', 'some improvement']:
                        successes += 0.5

                success_rate = successes / len(reports)

                # Aggregate other details
                timeframes = [r['time_to_results'] for r in reports if r['time_to_results']]
                side_effects_mentions = [r['side_effects'] for r in reports if r['side_effects']]

                treatment_dict = {
                    'treatment': treatment,
                    'tried_by': len(reports),
                    'success_count': int(successes),
                    'success_rate': round(success_rate, 2),
                    'timeframes': timeframes,
                    'side_effects_mentioned': len(side_effects_mentions),
                    'sample_quotes': [r['quote'] for r in reports if r['quote']][:3]
                }

                treatment_rankings.append(treatment_dict)

            # Sort by success rate, then by number of reports
            treatment_rankings.sort(key=lambda x: (x['success_rate'], x['tried_by']), reverse=True)

            results[symptom] = treatment_rankings

        return results

    def load_top_symptoms(self) -> List[Dict]:
        """Load top symptoms to focus ranking"""
        input_path = Config.PROCESSED_DATA_DIR / "top_30_symptoms.json"

        if input_path.exists():
            with open(input_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    def filter_to_top_symptoms(self, treatment_rankings: Dict, top_symptoms: List[Dict]) -> Dict:
        """Filter rankings to only include top symptoms"""
        if not top_symptoms:
            return treatment_rankings

        top_symptom_names = {s['symptom'] for s in top_symptoms}

        filtered = {
            symptom: rankings
            for symptom, rankings in treatment_rankings.items()
            if symptom in top_symptom_names
        }

        print(f"\nFiltered to {len(filtered)} top symptoms with treatment data")
        return filtered

    def save_results(self, treatment_rankings: Dict):
        """Save treatment rankings to JSON"""
        output_path = Config.PATTERNS_DATA_DIR / Config.SOLUTION_RANKINGS_FILE
        output_path.parent.mkdir(parents=True, exist_ok=True)

        output = {
            "metadata": {
                "total_symptoms": len(treatment_rankings),
                "total_treatments": sum(len(rankings) for rankings in treatment_rankings.values()),
                "description": "Treatment effectiveness rankings based on patient-reported outcomes"
            },
            "rankings": treatment_rankings
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Treatment rankings saved to: {output_path}")

    def print_summary(self, treatment_rankings: Dict):
        """Print summary of top treatments"""
        print(f"\n{'='*50}")
        print("Treatment Effectiveness Summary")
        print(f"{'='*50}\n")

        # Show top 5 symptoms with most treatment data
        symptoms_by_treatment_count = sorted(
            treatment_rankings.items(),
            key=lambda x: len(x[1]),
            reverse=True
        )[:5]

        for symptom, rankings in symptoms_by_treatment_count:
            print(f"\n📊 {symptom.upper().replace('_', ' ')}")
            print(f"{'─'*50}")

            for i, treatment in enumerate(rankings[:3], 1):
                print(f"{i}. {treatment['treatment'].replace('_', ' ').title()}")
                print(f"   Success Rate: {treatment['success_rate']:.0%} ({treatment['success_count']}/{treatment['tried_by']} reports)")

                if treatment['timeframes']:
                    timeframe_str = ", ".join(treatment['timeframes'][:2])
                    print(f"   Timeframe: {timeframe_str}")

                print()


def main():
    """Main execution function"""
    print("=" * 50)
    print("PHASE 4B: Treatment Effectiveness Ranking")
    print("=" * 50)

    # Initialize ranker
    ranker = TreatmentEffectivenessRanker()

    # Load data
    extractions = ranker.load_solution_extractions()

    # Aggregate treatments
    print("\nAggregating treatment mentions...")
    treatment_data = ranker.aggregate_treatments(extractions)
    print(f"Found treatments for {len(treatment_data)} symptoms")

    # Calculate success rates
    print("\nCalculating success rates...")
    treatment_rankings = ranker.calculate_success_rates(treatment_data)

    # Filter to top symptoms
    top_symptoms = ranker.load_top_symptoms()
    if top_symptoms:
        treatment_rankings = ranker.filter_to_top_symptoms(treatment_rankings, top_symptoms)

    if not treatment_rankings:
        print("\n⚠️  No treatment rankings to display")
        print("This could mean:")
        print("  - Not enough treatment mentions (need 3+ per treatment)")
        print("  - Run solution extraction first")
        sys.exit(0)

    # Print summary
    ranker.print_summary(treatment_rankings)

    # Save results
    ranker.save_results(treatment_rankings)

    print("\n✅ Treatment effectiveness ranking complete!")


if __name__ == "__main__":
    main()
