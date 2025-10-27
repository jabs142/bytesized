"""
Association Rule Mining for Symptom Co-occurrence Discovery

This module finds hidden patterns like:
- "yeast_infection + vaginal_dryness + long_term_use" (Support: 45 posts, Confidence: 78%)
- "post_pill + acne + hair_loss" (Support: 32 posts, Confidence: 65%)

LEARNING CONCEPTS:
- Association Rule Mining (Apriori algorithm)
- Support: How often does the pattern appear?
- Confidence: If A appears, what's the probability of B?
- Lift: Is the pattern stronger than random chance?

This is the SAME technique Amazon uses for "Customers who bought X also bought Y"
"""

from typing import List, Dict, Tuple, Set
from collections import Counter, defaultdict
from itertools import combinations
import json


class AssociationRulesMiner:
    """
    Discovers co-occurrence patterns in symptom data.

    Example Usage:
    >>> miner = AssociationRulesMiner(min_support=3, min_confidence=0.5)
    >>> rules = miner.find_patterns(post_analyses)
    >>> for rule in rules:
    >>>     print(f"{rule['antecedent']} → {rule['consequent']}")
    >>>     print(f"  Support: {rule['support']}, Confidence: {rule['confidence']:.2%}")
    """

    def __init__(self, min_support: int = 5, min_confidence: float = 0.5, min_lift: float = 1.2):
        """
        Initialize the pattern miner.

        Args:
            min_support: Minimum number of posts a pattern must appear in
            min_confidence: Minimum confidence threshold (0.0 to 1.0)
            min_lift: Minimum lift (>1.0 means positive correlation)

        LEARNING: Hyperparameter tuning
        - Lower min_support = find rare patterns (but maybe noise)
        - Higher min_support = find common patterns only
        - min_confidence > 0.5 = more than 50% chance
        - min_lift > 1.0 = better than random chance
        """
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.min_lift = min_lift

    def find_patterns(self, post_analyses: List[Dict]) -> List[Dict]:
        """
        Find symptom co-occurrence patterns across all posts.

        Args:
            post_analyses: List of analyzed posts (from MedicalTermExtractor)

        Returns:
            List of association rules sorted by lift (strongest patterns first)
        """
        # Step 1: Extract symptom sets from each post
        symptom_sets = []
        for post in post_analyses:
            # Combine all symptoms mentioned in this post
            symptoms = set(post.get('symptoms', {}).keys())
            if len(symptoms) > 0:  # Only include posts with at least 1 symptom
                symptom_sets.append(symptoms)

        total_posts = len(symptom_sets)
        if total_posts == 0:
            return []

        print(f"📊 Mining patterns from {total_posts} posts with symptoms...")

        # Step 2: Calculate support for individual symptoms
        symptom_counts = Counter()
        for symptom_set in symptom_sets:
            for symptom in symptom_set:
                symptom_counts[symptom] += 1

        # Step 3: Find frequent itemsets (pairs, triplets, etc.)
        frequent_itemsets = self._find_frequent_itemsets(symptom_sets, symptom_counts)

        print(f"✓ Found {len(frequent_itemsets)} frequent symptom combinations")

        # Step 4: Generate association rules
        rules = self._generate_rules(frequent_itemsets, symptom_counts, total_posts)

        print(f"✓ Generated {len(rules)} association rules")

        # Sort by lift (strongest associations first)
        rules.sort(key=lambda x: x['lift'], reverse=True)

        return rules

    def _find_frequent_itemsets(
        self,
        symptom_sets: List[Set[str]],
        symptom_counts: Counter
    ) -> Dict[Tuple[str, ...], int]:
        """
        Find all symptom combinations that meet minimum support threshold.

        This implements a simplified Apriori algorithm.
        """
        frequent_itemsets = {}

        # Start with individual symptoms (already counted)
        for symptom, count in symptom_counts.items():
            if count >= self.min_support:
                frequent_itemsets[(symptom,)] = count

        # Try pairs, triplets, etc.
        for k in range(2, 6):  # Up to 5-symptom combinations
            candidates = self._generate_candidates(frequent_itemsets, k)

            if not candidates:
                break  # No more candidates

            # Count support for each candidate
            for symptom_set in symptom_sets:
                for candidate in candidates:
                    if set(candidate).issubset(symptom_set):
                        if candidate not in frequent_itemsets:
                            frequent_itemsets[candidate] = 0
                        frequent_itemsets[candidate] += 1

            # Remove candidates below minimum support
            to_remove = [
                itemset for itemset, count in frequent_itemsets.items()
                if len(itemset) == k and count < self.min_support
            ]
            for itemset in to_remove:
                del frequent_itemsets[itemset]

        return frequent_itemsets

    def _generate_candidates(
        self,
        frequent_itemsets: Dict[Tuple[str, ...], int],
        k: int
    ) -> List[Tuple[str, ...]]:
        """
        Generate candidate k-itemsets from (k-1)-itemsets.

        Example: From ['acne'], ['hair_loss'] → generate ['acne', 'hair_loss']
        """
        # Get all (k-1)-itemsets
        prev_itemsets = [
            itemset for itemset in frequent_itemsets.keys()
            if len(itemset) == k - 1
        ]

        # Combine pairs that share (k-2) items
        candidates = set()
        for i in range(len(prev_itemsets)):
            for j in range(i + 1, len(prev_itemsets)):
                # Merge two itemsets
                merged = tuple(sorted(set(prev_itemsets[i]) | set(prev_itemsets[j])))
                if len(merged) == k:
                    candidates.add(merged)

        return list(candidates)

    def _generate_rules(
        self,
        frequent_itemsets: Dict[Tuple[str, ...], int],
        symptom_counts: Counter,
        total_posts: int
    ) -> List[Dict]:
        """
        Generate association rules from frequent itemsets.

        For each itemset like {A, B, C}, generate rules:
        - A → B, C
        - B → A, C
        - A, B → C
        etc.
        """
        rules = []

        # Only consider itemsets with 2+ symptoms
        for itemset, support_count in frequent_itemsets.items():
            if len(itemset) < 2:
                continue

            # Try all possible splits into antecedent → consequent
            for i in range(1, len(itemset)):
                # Generate all combinations of size i as antecedent
                for antecedent_tuple in combinations(itemset, i):
                    antecedent = set(antecedent_tuple)
                    consequent = set(itemset) - antecedent

                    # Calculate metrics
                    antecedent_support = frequent_itemsets.get(tuple(sorted(antecedent)), 0)

                    if antecedent_support == 0:
                        continue

                    confidence = support_count / antecedent_support

                    # Calculate lift
                    consequent_prob = sum(
                        freq for items, freq in frequent_itemsets.items()
                        if set(items) == consequent
                    ) / total_posts if len(consequent) == 1 else (
                        frequent_itemsets.get(tuple(sorted(consequent)), 0) / total_posts
                    )

                    if consequent_prob == 0:
                        continue

                    lift = confidence / consequent_prob

                    # Filter by thresholds
                    if (confidence >= self.min_confidence and
                        lift >= self.min_lift):

                        rules.append({
                            'antecedent': list(antecedent),
                            'consequent': list(consequent),
                            'support': support_count,
                            'confidence': confidence,
                            'lift': lift,
                            'support_pct': (support_count / total_posts) * 100
                        })

        return rules

    def find_symptom_clusters(
        self,
        post_analyses: List[Dict],
        min_cluster_size: int = 3
    ) -> List[Dict]:
        """
        Find common symptom clusters (groups that frequently appear together).

        This is useful for understanding "symptom profiles"
        Example: "IUD profile" = [cramping, spotting, irregular_periods]
        """
        # Extract symptom sets
        symptom_sets = []
        for post in post_analyses:
            symptoms = set(post.get('symptoms', {}).keys())
            if len(symptoms) >= min_cluster_size:
                symptom_sets.append(symptoms)

        # Count exact matches
        cluster_counts = Counter()
        for symptom_set in symptom_sets:
            # Convert to sorted tuple for hashing
            cluster_counts[tuple(sorted(symptom_set))] += 1

        # Filter and format
        clusters = [
            {
                'symptoms': list(cluster),
                'count': count,
                'percentage': (count / len(symptom_sets)) * 100
            }
            for cluster, count in cluster_counts.items()
            if count >= self.min_support
        ]

        clusters.sort(key=lambda x: x['count'], reverse=True)
        return clusters

    def export_for_visualization(
        self,
        rules: List[Dict],
        output_path: str
    ):
        """
        Export rules in a format ready for network visualization.

        Output format:
        {
            "nodes": [{"id": "symptom_name", "frequency": 100}, ...],
            "edges": [{"source": "A", "target": "B", "weight": lift}, ...]
        }
        """
        # Build nodes (unique symptoms)
        symptoms = set()
        symptom_frequency = Counter()

        for rule in rules:
            for symptom in rule['antecedent'] + rule['consequent']:
                symptoms.add(symptom)
                symptom_frequency[symptom] += rule['support']

        nodes = [
            {"id": symptom, "frequency": symptom_frequency[symptom]}
            for symptom in symptoms
        ]

        # Build edges (relationships)
        edges = []
        for rule in rules:
            for ant in rule['antecedent']:
                for cons in rule['consequent']:
                    edges.append({
                        "source": ant,
                        "target": cons,
                        "weight": rule['lift'],
                        "confidence": rule['confidence'],
                        "support": rule['support']
                    })

        graph_data = {"nodes": nodes, "edges": edges}

        with open(output_path, 'w') as f:
            json.dump(graph_data, f, indent=2)

        print(f"✓ Exported graph data to {output_path}")


# ============================================
# EXAMPLE USAGE
# ============================================

if __name__ == '__main__':
    print("\n🔬 Association Rule Mining - Example\n")

    # Mock data for testing
    mock_posts = [
        {'symptoms': {'acne': 1, 'hair_loss': 1, 'post_pill_acne': 1}},
        {'symptoms': {'acne': 1, 'hair_loss': 1}},
        {'symptoms': {'acne': 1, 'post_pill_acne': 1}},
        {'symptoms': {'yeast_infection': 1, 'vaginal_dryness': 1, 'low_libido': 1}},
        {'symptoms': {'yeast_infection': 1, 'vaginal_dryness': 1}},
        {'symptoms': {'yeast_infection': 1, 'vaginal_dryness': 1}},
        {'symptoms': {'depression': 1, 'anxiety': 1}},
        {'symptoms': {'depression': 1, 'anxiety': 1, 'mood_swings': 1}},
    ]

    miner = AssociationRulesMiner(min_support=2, min_confidence=0.6)
    rules = miner.find_patterns(mock_posts)

    print("\nTop Association Rules:")
    print("=" * 60)
    for rule in rules[:5]:
        print(f"\n{rule['antecedent']} → {rule['consequent']}")
        print(f"  Support: {rule['support']} posts ({rule['support_pct']:.1f}%)")
        print(f"  Confidence: {rule['confidence']:.1%}")
        print(f"  Lift: {rule['lift']:.2f}x")

    print("\n✓ Example complete!\n")
