"""
Symptom Aggregator
Combines all extracted symptoms, counts frequencies, identifies surprise signals
"""
import json
import sys
from pathlib import Path
from typing import List, Dict
from collections import Counter, defaultdict

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class SymptomAggregator:
    def __init__(self, extractions: List[Dict]):
        """
        Initialize aggregator with extraction results

        Args:
            extractions: List of extraction result dictionaries
        """
        self.extractions = extractions
        self.symptom_data = defaultdict(lambda: {
            "mentions": 0,
            "posts": set(),
            "surprise_signals": 0,
            "categories": Counter(),
            "quotes": []
        })

    def aggregate(self) -> Dict:
        """
        Aggregate all symptoms from extractions

        Returns:
            Dictionary of aggregated symptom data
        """
        print("\nAggregating symptoms from extractions...")

        for extraction in self.extractions:
            post_id = extraction["post_id"]

            for symptom_data in extraction.get("symptoms", []):
                symptom = symptom_data.get("symptom", "").lower().strip()

                if not symptom:
                    continue

                # Update counts
                self.symptom_data[symptom]["mentions"] += 1
                self.symptom_data[symptom]["posts"].add(post_id)

                # Track surprise signals
                if symptom_data.get("surprise_signal", False):
                    self.symptom_data[symptom]["surprise_signals"] += 1

                # Track categories
                category = symptom_data.get("category", "uncategorized")
                self.symptom_data[symptom]["categories"][category] += 1

                # Save quotes (limit to 10)
                quote = symptom_data.get("quote", "")
                if quote and len(self.symptom_data[symptom]["quotes"]) < 10:
                    self.symptom_data[symptom]["quotes"].append(quote)

        print(f"Total unique symptoms discovered: {len(self.symptom_data)}")
        return self.symptom_data

    def create_master_list(self) -> List[Dict]:
        """
        Create master list of symptoms with all metadata

        Returns:
            List of symptom dictionaries sorted by frequency
        """
        total_posts = len(self.extractions)
        master_list = []

        for symptom, data in self.symptom_data.items():
            # Determine most common category
            most_common_category = data["categories"].most_common(1)
            category = most_common_category[0][0] if most_common_category else "uncategorized"

            symptom_dict = {
                "symptom": symptom,
                "mentions": data["mentions"],
                "posts_appearing_in": len(data["posts"]),
                "frequency": len(data["posts"]) / total_posts,
                "surprise_signals": data["surprise_signals"],
                "category": category,
                "all_categories": dict(data["categories"]),
                "sample_quotes": data["quotes"][:5]  # Top 5 quotes
            }

            master_list.append(symptom_dict)

        # Sort by frequency (posts appearing in)
        master_list.sort(key=lambda x: x["posts_appearing_in"], reverse=True)

        return master_list

    def create_surprise_signals_report(self) -> Dict:
        """
        Create report of symptoms with high surprise signals

        Returns:
            Dictionary with surprise signal data
        """
        surprise_symptoms = [
            {
                "symptom": symptom,
                "surprise_signals": data["surprise_signals"],
                "total_mentions": data["mentions"],
                "surprise_rate": data["surprise_signals"] / data["mentions"] if data["mentions"] > 0 else 0,
                "posts": len(data["posts"]),
                "quotes": data["quotes"][:10]
            }
            for symptom, data in self.symptom_data.items()
            if data["surprise_signals"] > 0
        ]

        # Sort by surprise signal count
        surprise_symptoms.sort(key=lambda x: x["surprise_signals"], reverse=True)

        return {
            "total_symptoms_with_surprise": len(surprise_symptoms),
            "top_surprise_symptoms": surprise_symptoms[:30],
            "all_surprise_symptoms": surprise_symptoms
        }

    def print_summary(self, master_list: List[Dict]):
        """Print summary statistics"""
        print(f"\n{'='*50}")
        print("Symptom Aggregation Summary")
        print(f"{'='*50}")

        print(f"\nTotal unique symptoms: {len(master_list)}")

        # Frequency distribution
        freq_5_plus = sum(1 for s in master_list if s["posts_appearing_in"] >= 25)  # 5% of 500
        freq_10_plus = sum(1 for s in master_list if s["posts_appearing_in"] >= 50)
        freq_20_plus = sum(1 for s in master_list if s["posts_appearing_in"] >= 100)

        print(f"\nFrequency distribution:")
        print(f"  Mentioned in 20%+ of posts (100+): {freq_20_plus}")
        print(f"  Mentioned in 10%+ of posts (50+): {freq_10_plus}")
        print(f"  Mentioned in 5%+ of posts (25+): {freq_5_plus}")

        # Top symptoms
        print(f"\nTop 10 most mentioned symptoms:")
        for i, symptom in enumerate(master_list[:10], 1):
            print(f"  {i:2}. {symptom['symptom']:<30} - {symptom['posts_appearing_in']:3} posts ({symptom['frequency']:.1%})")

        # Surprise signals
        with_surprise = sum(1 for s in master_list if s["surprise_signals"] > 0)
        print(f"\nSymptoms with surprise signals: {with_surprise}")

        top_surprise = sorted(master_list, key=lambda x: x["surprise_signals"], reverse=True)[:5]
        print(f"\nTop 5 symptoms by surprise signals:")
        for i, symptom in enumerate(top_surprise, 1):
            if symptom["surprise_signals"] > 0:
                print(f"  {i}. {symptom['symptom']:<30} - {symptom['surprise_signals']} surprise mentions")

    def save_results(self, master_list: List[Dict], surprise_report: Dict):
        """Save aggregation results"""
        # Save master list
        output_path = Config.PROCESSED_DATA_DIR / Config.ALL_SYMPTOMS_FILE
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(master_list, f, indent=2, ensure_ascii=False)
        print(f"\nMaster symptom list saved to: {output_path}")

        # Save surprise signals
        output_path = Config.PROCESSED_DATA_DIR / Config.SURPRISE_SIGNALS_FILE
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(surprise_report, f, indent=2, ensure_ascii=False)
        print(f"Surprise signals report saved to: {output_path}")


def load_extractions() -> List[Dict]:
    """Load symptom extraction results"""
    input_path = Config.PROCESSED_DATA_DIR / "symptom_extractions.json"

    if not input_path.exists():
        print(f"❌ Error: Extraction file not found at {input_path}")
        print("Please run llm_symptom_extractor.py first!")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        extractions = json.load(f)

    print(f"Loaded {len(extractions)} extraction results")
    return extractions


def main():
    """Main execution function"""
    print("=" * 50)
    print("PHASE 2C: Symptom Aggregation")
    print("=" * 50)

    # Load extractions
    extractions = load_extractions()

    # Initialize aggregator
    aggregator = SymptomAggregator(extractions)

    # Aggregate symptoms
    aggregator.aggregate()

    # Create master list
    master_list = aggregator.create_master_list()

    # Create surprise report
    surprise_report = aggregator.create_surprise_signals_report()

    # Print summary
    aggregator.print_summary(master_list)

    # Save results
    aggregator.save_results(master_list, surprise_report)

    print("\n✅ Aggregation complete!")
    print("\nNext step: Run top_symptom_selector.py to select top 30 symptoms for validation")


if __name__ == "__main__":
    main()
