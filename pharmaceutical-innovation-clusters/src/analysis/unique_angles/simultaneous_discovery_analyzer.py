"""
Simultaneous Discovery Analyzer
Identifies independent parallel inventions across patent data
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import sys
sys.path.append(str(Path(__file__).parent.parent.parent))
from config import (
    PATENT_CATEGORIES,
    DATA_DIR,
    CLUSTERING_THRESHOLD_SIGMA
)


class SimultaneousDiscoveryAnalyzer:
    """Analyzes parallel invention patterns in patent data"""

    def __init__(self):
        self.data_dir = Path(DATA_DIR)
        self.raw_dir = self.data_dir / 'raw'
        self.unique_angles_dir = self.data_dir / 'unique_angles'
        self.unique_angles_dir.mkdir(parents=True, exist_ok=True)

        # Similarity parameters
        self.time_window = 2  # years
        self.similarity_threshold = 0.7

    def analyze(self) -> Dict:
        """Run complete simultaneous discovery analysis"""
        print("\n" + "="*60)
        print("SIMULTANEOUS DISCOVERY ANALYSIS")
        print("="*60)

        # Load patent data
        patents_df = self._load_patent_data()

        if patents_df is None or len(patents_df) == 0:
            print("⚠️  No patent data found. Please run data collection first.")
            return self._empty_results()

        print(f"✓ Loaded {len(patents_df)} patents")

        # Find simultaneous discoveries
        simultaneous_pairs = self._find_simultaneous_discoveries(patents_df)

        # Analyze patterns
        analysis = self._analyze_patterns(simultaneous_pairs, patents_df)

        # Calculate cluster correlation
        cluster_correlation = self._test_cluster_hypothesis(simultaneous_pairs, patents_df)

        # Identify famous examples
        famous_examples = self._identify_famous_examples(simultaneous_pairs)

        # Compile results
        results = {
            'total_patents_analyzed': len(patents_df),
            'simultaneous_pairs_found': len(simultaneous_pairs),
            'simultaneity_rate': len(simultaneous_pairs) / len(patents_df) if len(patents_df) > 0 else 0,
            'patterns': analysis,
            'cluster_correlation': cluster_correlation,
            'famous_examples': famous_examples,
            'methodology': {
                'time_window_years': self.time_window,
                'similarity_threshold': self.similarity_threshold,
                'algorithm': 'TF-IDF + Cosine Similarity'
            }
        }

        # Save results
        output_path = self.unique_angles_dir / 'simultaneous_discoveries.json'
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)

        print(f"\n✓ Found {len(simultaneous_pairs)} simultaneous discovery pairs")
        print(f"✓ Analysis saved to {output_path}")

        return results

    def _load_patent_data(self) -> pd.DataFrame:
        """Load and prepare patent data"""
        patents_file = self.raw_dir / 'patents_raw.json'

        if not patents_file.exists():
            return None

        with open(patents_file, 'r') as f:
            data = json.load(f)

        # Flatten patent data
        patents = []
        for category, patent_list in data.items():
            for patent in patent_list:
                patent['category'] = category
                patents.append(patent)

        df = pd.DataFrame(patents)

        # Ensure we have necessary fields
        if 'patent_title' not in df.columns or 'patent_abstract' not in df.columns:
            print("⚠️  Patent data missing title or abstract fields")
            return df

        # Create combined text for similarity
        df['combined_text'] = df.apply(
            lambda row: f"{row.get('patent_title', '')} {row.get('patent_abstract', '')}",
            axis=1
        )

        # Extract year from patent_date
        if 'patent_date' in df.columns:
            df['year'] = pd.to_datetime(df['patent_date'], errors='coerce').dt.year

        return df

    def _find_simultaneous_discoveries(self, df: pd.DataFrame) -> List[Dict]:
        """Find patents with high similarity filed within time window"""

        if 'combined_text' not in df.columns or len(df) < 2:
            return []

        print("\nCalculating patent similarities...")

        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2
        )

        try:
            tfidf_matrix = vectorizer.fit_transform(df['combined_text'].fillna(''))
        except ValueError as e:
            print(f"⚠️  Error in TF-IDF vectorization: {e}")
            return []

        # Calculate cosine similarity
        similarity_matrix = cosine_similarity(tfidf_matrix)

        # Find simultaneous pairs
        simultaneous_pairs = []

        for i in range(len(df)):
            for j in range(i + 1, len(df)):
                similarity = similarity_matrix[i, j]

                # Check similarity threshold
                if similarity < self.similarity_threshold:
                    continue

                # Check time window
                if 'year' in df.columns:
                    year_i = df.iloc[i]['year']
                    year_j = df.iloc[j]['year']

                    if pd.isna(year_i) or pd.isna(year_j):
                        continue

                    if abs(year_i - year_j) > self.time_window:
                        continue

                # Found a simultaneous pair
                pair = {
                    'patent_1': {
                        'id': df.iloc[i].get('patent_number', f'patent_{i}'),
                        'title': df.iloc[i].get('patent_title', 'Unknown'),
                        'year': int(df.iloc[i]['year']) if 'year' in df.columns and not pd.isna(df.iloc[i]['year']) else None,
                        'category': df.iloc[i].get('category', 'Unknown')
                    },
                    'patent_2': {
                        'id': df.iloc[j].get('patent_number', f'patent_{j}'),
                        'title': df.iloc[j].get('patent_title', 'Unknown'),
                        'year': int(df.iloc[j]['year']) if 'year' in df.columns and not pd.isna(df.iloc[j]['year']) else None,
                        'category': df.iloc[j].get('category', 'Unknown')
                    },
                    'similarity_score': float(similarity),
                    'time_gap_years': abs(df.iloc[i]['year'] - df.iloc[j]['year']) if 'year' in df.columns else None
                }

                simultaneous_pairs.append(pair)

        # Sort by similarity score
        simultaneous_pairs.sort(key=lambda x: x['similarity_score'], reverse=True)

        return simultaneous_pairs

    def _analyze_patterns(self, pairs: List[Dict], df: pd.DataFrame) -> Dict:
        """Analyze patterns in simultaneous discoveries"""

        if len(pairs) == 0:
            return {
                'by_category': {},
                'by_decade': {},
                'avg_similarity': 0,
                'avg_time_gap': 0
            }

        # Analyze by category
        by_category = defaultdict(int)
        for pair in pairs:
            cat1 = pair['patent_1']['category']
            cat2 = pair['patent_2']['category']

            if cat1 == cat2:
                by_category[cat1] += 1
            else:
                by_category['cross-category'] += 1

        # Analyze by decade
        by_decade = defaultdict(int)
        for pair in pairs:
            year1 = pair['patent_1']['year']
            year2 = pair['patent_2']['year']

            if year1 and year2:
                avg_year = (year1 + year2) / 2
                decade = int(avg_year // 10 * 10)
                by_decade[str(decade)] += 1

        # Calculate averages
        similarities = [p['similarity_score'] for p in pairs]
        time_gaps = [p['time_gap_years'] for p in pairs if p['time_gap_years'] is not None]

        return {
            'by_category': dict(by_category),
            'by_decade': dict(sorted(by_decade.items())),
            'avg_similarity': float(np.mean(similarities)),
            'avg_time_gap': float(np.mean(time_gaps)) if time_gaps else 0,
            'total_same_year': sum(1 for p in pairs if p['time_gap_years'] == 0)
        }

    def _test_cluster_hypothesis(self, pairs: List[Dict], df: pd.DataFrame) -> Dict:
        """Test if simultaneous discoveries are more common during cluster periods"""

        if len(pairs) == 0 or 'year' not in df.columns:
            return {
                'hypothesis': 'Parallel invention is more common during innovation clusters',
                'result': 'insufficient_data',
                'evidence': {}
            }

        # Calculate baseline simultaneity rate
        innovations_per_year = df.groupby('year').size()
        mean_innovations = innovations_per_year.mean()
        std_innovations = innovations_per_year.std()

        # Identify cluster years (>2σ above mean)
        cluster_years = innovations_per_year[
            innovations_per_year > mean_innovations + 2 * std_innovations
        ].index.tolist()

        # Count simultaneity in cluster vs non-cluster years
        pairs_in_clusters = 0
        pairs_outside_clusters = 0

        for pair in pairs:
            year1 = pair['patent_1']['year']
            year2 = pair['patent_2']['year']

            if year1 and year2:
                avg_year = (year1 + year2) / 2

                if any(abs(avg_year - cy) <= 2 for cy in cluster_years):
                    pairs_in_clusters += 1
                else:
                    pairs_outside_clusters += 1

        # Calculate rates
        cluster_year_count = len(cluster_years)
        non_cluster_year_count = len(innovations_per_year) - cluster_year_count

        rate_in_clusters = pairs_in_clusters / cluster_year_count if cluster_year_count > 0 else 0
        rate_outside_clusters = pairs_outside_clusters / non_cluster_year_count if non_cluster_year_count > 0 else 0

        return {
            'hypothesis': 'Parallel invention is more common during innovation clusters',
            'result': 'supported' if rate_in_clusters > rate_outside_clusters * 1.5 else 'not_supported',
            'evidence': {
                'cluster_years': cluster_years,
                'pairs_in_clusters': pairs_in_clusters,
                'pairs_outside_clusters': pairs_outside_clusters,
                'rate_in_clusters': float(rate_in_clusters),
                'rate_outside_clusters': float(rate_outside_clusters),
                'ratio': float(rate_in_clusters / rate_outside_clusters) if rate_outside_clusters > 0 else None
            }
        }

    def _identify_famous_examples(self, pairs: List[Dict]) -> List[Dict]:
        """Identify potential famous simultaneous discoveries"""

        # Take top 10 most similar pairs
        famous = []

        for pair in pairs[:10]:
            famous.append({
                'year': pair['patent_1']['year'],
                'title_1': pair['patent_1']['title'][:100],
                'title_2': pair['patent_2']['title'][:100],
                'similarity': round(pair['similarity_score'], 3),
                'time_gap': pair['time_gap_years'],
                'category': pair['patent_1']['category']
            })

        return famous

    def _empty_results(self) -> Dict:
        """Return empty results structure"""
        return {
            'total_patents_analyzed': 0,
            'simultaneous_pairs_found': 0,
            'simultaneity_rate': 0,
            'patterns': {},
            'cluster_correlation': {},
            'famous_examples': [],
            'methodology': {
                'time_window_years': self.time_window,
                'similarity_threshold': self.similarity_threshold,
                'algorithm': 'TF-IDF + Cosine Similarity'
            }
        }


if __name__ == '__main__':
    analyzer = SimultaneousDiscoveryAnalyzer()
    results = analyzer.analyze()

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total patents analyzed: {results['total_patents_analyzed']}")
    print(f"Simultaneous pairs found: {results['simultaneous_pairs_found']}")
    print(f"Simultaneity rate: {results['simultaneity_rate']:.2%}")

    if results['cluster_correlation']:
        print(f"\nCluster hypothesis: {results['cluster_correlation']['result']}")
