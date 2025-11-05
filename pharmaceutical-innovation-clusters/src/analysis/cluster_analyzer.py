"""
Temporal Clustering Analysis

Identifies periods of innovation clustering using statistical methods
"""
import pandas as pd
import numpy as np
import json
from pathlib import Path
from typing import List, Dict, Tuple
from scipy import stats
from collections import Counter
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class ClusterAnalyzer:
    """Analyzes temporal clustering patterns in innovation data"""

    def __init__(self):
        self.fda_path = Config.RAW_DATA_DIR / 'fda_drugs_raw.csv'
        self.output_path = Config.PROCESSED_DATA_DIR / 'innovation_clusters.json'

    def analyze(self) -> Dict:
        """
        Perform complete temporal clustering analysis on FDA drug approvals

        Returns:
            Dictionary with clustering results
        """
        print("\n" + "="*60)
        print("TEMPORAL CLUSTERING ANALYSIS - FDA DRUG APPROVALS")
        print("="*60)

        # Load FDA data
        fda_df = self._load_fda_data()

        # Analyze FDA time series
        fda_clusters = self._analyze_time_series(
            fda_df,
            'approval_date',
            'FDA Drug Approvals'
        )

        # Generate summary statistics
        summary = self._generate_summary(fda_df, fda_clusters)

        # Prepare output
        results = {
            'summary': summary,
            'fda_clusters': fda_clusters,
            'cluster_periods': fda_clusters.get('clusters', []),
            'metadata': {
                'analysis_date': pd.Timestamp.now().isoformat(),
                'clustering_threshold_sigma': Config.CLUSTERING_THRESHOLD_SIGMA,
                'min_cluster_size': Config.MIN_CLUSTER_SIZE
            }
        }

        # Save results
        with open(self.output_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)

        print(f"\n✅ Analysis complete. Results saved to {self.output_path}")

        return results

    def _load_fda_data(self) -> pd.DataFrame:
        """Load and prepare FDA data"""
        print("\n📊 Loading FDA drug approval data...")

        if not self.fda_path.exists():
            print(f"⚠️  FDA data not found at {self.fda_path}")
            return pd.DataFrame()

        df = pd.read_csv(self.fda_path)
        df['approval_date'] = pd.to_datetime(df['approval_date'], errors='coerce')
        df['year'] = df['approval_date'].dt.year

        print(f"   Loaded {len(df):,} drug approvals")
        return df


    def _analyze_time_series(
        self,
        df: pd.DataFrame,
        date_column: str,
        data_name: str
    ) -> Dict:
        """Analyze time series for clustering patterns"""

        if df.empty:
            return {'clusters': [], 'yearly_counts': {}}

        print(f"\n🔍 Analyzing {data_name}...")

        # Count by year
        yearly_counts = df['year'].value_counts().sort_index()

        # Calculate statistics
        mean = yearly_counts.mean()
        std = yearly_counts.std()
        threshold = mean + (Config.CLUSTERING_THRESHOLD_SIGMA * std)

        print(f"   Mean: {mean:.1f} per year")
        print(f"   Std Dev: {std:.1f}")
        print(f"   Cluster threshold: {threshold:.1f} ({Config.CLUSTERING_THRESHOLD_SIGMA}σ)")

        # Identify cluster years
        cluster_years = yearly_counts[yearly_counts > threshold].index.tolist()

        # Group consecutive years into clusters
        clusters = self._group_consecutive_years(cluster_years, yearly_counts.to_dict())

        print(f"   Found {len(clusters)} cluster periods")

        return {
            'data_name': data_name,
            'yearly_counts': yearly_counts.to_dict(),
            'statistics': {
                'mean': float(mean),
                'std': float(std),
                'threshold': float(threshold)
            },
            'clusters': clusters
        }

    def _group_consecutive_years(
        self,
        years: List[int],
        yearly_counts: Dict[int, int]
    ) -> List[Dict]:
        """Group consecutive years into cluster periods"""

        if not years:
            return []

        years = sorted(years)
        clusters = []
        current_cluster = [years[0]]

        for year in years[1:]:
            if year == current_cluster[-1] + 1:
                # Consecutive year
                current_cluster.append(year)
            else:
                # Gap - save current cluster and start new one
                if len(current_cluster) >= Config.MIN_CLUSTER_SIZE:
                    clusters.append(self._create_cluster_record(current_cluster, yearly_counts))
                current_cluster = [year]

        # Add final cluster
        if len(current_cluster) >= Config.MIN_CLUSTER_SIZE:
            clusters.append(self._create_cluster_record(current_cluster, yearly_counts))

        return clusters

    def _create_cluster_record(
        self,
        years: List[int],
        yearly_counts: Dict[int, int]
    ) -> Dict:
        """Create a cluster record with metadata"""

        total = sum(yearly_counts.get(year, 0) for year in years)
        avg = total / len(years)

        return {
            'start_year': min(years),
            'end_year': max(years),
            'duration_years': len(years),
            'years': years,
            'total_innovations': int(total),
            'avg_per_year': float(avg),
            'peak_year': max(years, key=lambda y: yearly_counts.get(y, 0)),
            'peak_count': int(yearly_counts.get(max(years, key=lambda y: yearly_counts.get(y, 0)), 0))
        }


    def _generate_summary(
        self,
        fda_df: pd.DataFrame,
        fda_clusters: Dict
    ) -> Dict:
        """Generate summary statistics"""

        clusters = fda_clusters.get('clusters', [])

        summary = {
            'total_drug_approvals': int(len(fda_df)) if not fda_df.empty else 0,
            'date_range': {
                'start': int(fda_df['year'].min()) if not fda_df.empty else 0,
                'end': int(fda_df['year'].max()) if not fda_df.empty else 0
            },
            'cluster_count': len(clusters),
            'most_innovative_decade': self._identify_peak_decade(fda_df)
        }

        return summary

    def _identify_peak_decade(
        self,
        fda_df: pd.DataFrame
    ) -> Dict:
        """Identify the decade with most drug approvals"""

        if fda_df.empty:
            return {}

        # Group by decade
        decades = [year // 10 * 10 for year in fda_df['year'].tolist() if pd.notna(year)]
        decade_counts = Counter(decades)

        if not decade_counts:
            return {}

        peak_decade = max(decade_counts.items(), key=lambda x: x[1])

        return {
            'decade': int(peak_decade[0]),
            'decade_label': f"{peak_decade[0]}s",
            'approval_count': int(peak_decade[1])
        }


def main():
    """Run clustering analysis"""
    analyzer = ClusterAnalyzer()
    results = analyzer.analyze()

    # Print key findings
    print("\n" + "="*60)
    print("KEY FINDINGS")
    print("="*60)

    summary = results['summary']
    print(f"Total drug approvals analyzed: {summary['total_drug_approvals']:,}")
    print(f"Date range: {summary['date_range']['start']}-{summary['date_range']['end']}")
    print(f"Cluster periods identified: {summary['cluster_count']}")

    if summary['most_innovative_decade']:
        decade = summary['most_innovative_decade']
        print(f"Most innovative decade: {decade['decade_label']} ({decade['approval_count']:,} approvals)")

    if results['cluster_periods']:
        print(f"\nCluster periods:")
        for cluster in results['cluster_periods'][:5]:
            print(f"  {cluster['start_year']}-{cluster['end_year']}: {cluster['total_innovations']:,} approvals ({cluster['duration_years']} years)")

    print("="*60)

    return results


if __name__ == '__main__':
    main()
