"""
Association Rules Mining for PCOS Symptoms
===========================================
Discovers which surprising symptoms cluster together.

LEARNING CONCEPTS:
- Association rule mining (Apriori algorithm)
- Support and confidence metrics
- Symptom co-occurrence patterns
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Set
from collections import defaultdict
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class AssociationRulesMiner:
    """
    Discovers which symptoms frequently appear together.

    Why Association Rules?
    - Finds symptom clusters (e.g., "sleep apnea + skin tags + weight gain")
    - Identifies co-occurrence patterns doctors might miss
    - Helps understand PCOS phenotypes/subtypes
    """

    def __init__(self, min_support: float = None, min_confidence: float = None):
        """
        Initialize miner with thresholds

        Args:
            min_support: Minimum % of posts containing symptom combo (default: 5%)
            min_confidence: If symptom A, what % chance of symptom B (default: 60%)
        """
        self.min_support = min_support or Config.MIN_SUPPORT
        self.min_confidence = min_confidence or Config.MIN_CONFIDENCE

    def load_symptom_extractions(self) -> List[Dict]:
        """Load symptom extraction results"""
        input_path = Config.PROCESSED_DATA_DIR / "symptom_extractions.json"

        if not input_path.exists():
            raise FileNotFoundError(f"Symptom extractions not found at {input_path}")

        with open(input_path, 'r', encoding='utf-8') as f:
            extractions = json.load(f)

        print(f"Loaded {len(extractions)} symptom extraction results")
        return extractions

    def load_top_symptoms(self) -> Set[str]:
        """Load top 30 validated symptoms to focus analysis"""
        input_path = Config.PROCESSED_DATA_DIR / "top_30_symptoms.json"

        if not input_path.exists():
            print("⚠️  Warning: Top 30 symptoms not found, using all symptoms")
            return None

        with open(input_path, 'r', encoding='utf-8') as f:
            top_symptoms = json.load(f)

        symptom_set = {s['symptom'] for s in top_symptoms}
        print(f"Loaded {len(symptom_set)} top symptoms for association mining")
        return symptom_set

    def create_transactions(self, extractions: List[Dict], top_symptoms: Set[str] = None) -> List[List[str]]:
        """
        Convert symptom extractions to transactions format.

        Transaction = list of symptoms mentioned in one post
        Example: ["irregular_periods", "acne", "weight_gain", "depression"]

        Args:
            extractions: List of extraction results
            top_symptoms: If provided, only include these symptoms

        Returns:
            List of transactions (each transaction is a list of symptoms)
        """
        transactions = []

        for extraction in extractions:
            # Get all symptoms mentioned in this post
            symptoms_in_post = set()

            for symptom_data in extraction.get('symptoms', []):
                symptom = symptom_data.get('symptom', '').lower().strip()

                if not symptom:
                    continue

                # Filter to top symptoms if specified
                if top_symptoms is None or symptom in top_symptoms:
                    symptoms_in_post.add(symptom)

            # Only include posts with at least 2 symptoms (needed for associations)
            if len(symptoms_in_post) >= 2:
                transactions.append(list(symptoms_in_post))

        print(f"\nCreated {len(transactions)} transactions")
        print(f"Average symptoms per post: {sum(len(t) for t in transactions) / len(transactions):.1f}")

        return transactions

    def mine_associations(self, transactions: List[List[str]]) -> pd.DataFrame:
        """
        Mine association rules from transactions.

        Process:
        1. Convert transactions to binary matrix (symptom present/absent)
        2. Find frequent itemsets using Apriori algorithm
        3. Generate association rules

        Returns:
            DataFrame with association rules
        """
        print(f"\n{'='*50}")
        print("Mining Association Rules")
        print(f"{'='*50}")

        # Convert transactions to binary format
        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        df = pd.DataFrame(te_ary, columns=te.columns_)

        print(f"\nDataset: {len(df)} posts x {len(df.columns)} symptoms")

        # Find frequent itemsets
        print(f"\nFinding frequent symptom combinations (min support: {self.min_support:.1%})...")
        frequent_itemsets = apriori(df, min_support=self.min_support, use_colnames=True)

        if len(frequent_itemsets) == 0:
            print("⚠️  No frequent itemsets found. Try lowering min_support.")
            return pd.DataFrame()

        print(f"Found {len(frequent_itemsets)} frequent itemsets")

        # Generate association rules
        print(f"\nGenerating association rules (min confidence: {self.min_confidence:.1%})...")
        rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=self.min_confidence)

        if len(rules) == 0:
            print("⚠️  No rules found. Try lowering min_confidence.")
            return pd.DataFrame()

        # Sort by lift (how much more likely B occurs with A vs. without A)
        rules = rules.sort_values('lift', ascending=False)

        print(f"Found {len(rules)} association rules")

        return rules

    def format_rules_for_output(self, rules: pd.DataFrame) -> List[Dict]:
        """
        Convert pandas DataFrame to JSON-friendly format.

        Lift interpretation:
        - lift > 1: Symptoms appear together more than random
        - lift = 1: Independent
        - lift < 1: Negative association (rarely together)
        """
        output_rules = []

        for _, rule in rules.iterrows():
            # Convert frozensets to lists
            antecedents = list(rule['antecedents'])
            consequents = list(rule['consequents'])

            rule_dict = {
                "if_symptoms": antecedents,
                "then_symptom": consequents,
                "support": round(rule['support'], 3),
                "confidence": round(rule['confidence'], 3),
                "lift": round(rule['lift'], 2),
                "interpretation": self._interpret_rule(
                    antecedents,
                    consequents,
                    rule['confidence'],
                    rule['lift']
                )
            }

            output_rules.append(rule_dict)

        return output_rules

    def _interpret_rule(self, antecedents: List[str], consequents: List[str],
                       confidence: float, lift: float) -> str:
        """Generate human-readable interpretation of rule"""
        if_str = " + ".join(antecedents)
        then_str = " + ".join(consequents)

        interpretation = f"If {if_str}, then {confidence:.0%} chance of {then_str}. "

        if lift > 2:
            interpretation += f"Strong association (lift: {lift:.1f}x)"
        elif lift > 1.5:
            interpretation += f"Moderate association (lift: {lift:.1f}x)"
        else:
            interpretation += f"Weak association (lift: {lift:.1f}x)"

        return interpretation

    def save_results(self, rules: List[Dict]):
        """Save association rules to JSON"""
        output_path = Config.PATTERNS_DATA_DIR / Config.SYMPTOM_CLUSTERS_FILE
        output_path.parent.mkdir(parents=True, exist_ok=True)

        output = {
            "metadata": {
                "total_rules": len(rules),
                "min_support": self.min_support,
                "min_confidence": self.min_confidence,
                "description": "Association rules showing which symptoms frequently appear together"
            },
            "rules": rules
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Association rules saved to: {output_path}")

    def print_summary(self, rules: List[Dict]):
        """Print summary of top association rules"""
        print(f"\n{'='*50}")
        print("Top 10 Association Rules")
        print(f"{'='*50}\n")

        for i, rule in enumerate(rules[:10], 1):
            print(f"{i}. {rule['interpretation']}")
            print(f"   Support: {rule['support']:.1%} | Confidence: {rule['confidence']:.1%} | Lift: {rule['lift']:.1f}x")
            print()


def main():
    """Main execution function"""
    print("=" * 50)
    print("PHASE 4A: Association Rules Mining")
    print("=" * 50)

    # Initialize miner
    miner = AssociationRulesMiner()

    # Load data
    extractions = miner.load_symptom_extractions()
    top_symptoms = miner.load_top_symptoms()

    # Create transactions
    transactions = miner.create_transactions(extractions, top_symptoms)

    if len(transactions) < 10:
        print("\n⚠️  Not enough transactions for association mining (need at least 10)")
        print("Please run symptom extraction first")
        sys.exit(1)

    # Mine associations
    rules_df = miner.mine_associations(transactions)

    if len(rules_df) == 0:
        print("\n⚠️  No association rules found")
        print("This could mean:")
        print("  - Symptoms don't co-occur frequently enough")
        print("  - min_support or min_confidence thresholds too high")
        sys.exit(0)

    # Format and save
    rules = miner.format_rules_for_output(rules_df)
    miner.print_summary(rules)
    miner.save_results(rules)

    print("\n✅ Association rules mining complete!")


if __name__ == "__main__":
    main()
