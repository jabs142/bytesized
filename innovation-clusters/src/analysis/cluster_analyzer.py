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
        self.patent_path = Config.RAW_DATA_DIR / 'patents_raw.json'
        self.output_path = Config.PROCESSED_DATA_DIR / 'innovation_clusters.json'

    def analyze(self) -> Dict:
        """
        Perform complete temporal clustering analysis

        Returns:
            Dictionary with clustering results
        """
        print("\n" + "="*60)
        print("TEMPORAL CLUSTERING ANALYSIS")
        print("="*60)

        # Load data
        fda_df = self._load_fda_data()
        patent_data = self._load_patent_data()

        # Analyze each data source
        fda_clusters = self._analyze_time_series(
            fda_df,
            'approval_date',
            'FDA Drug Approvals'
        )

        patent_clusters = self._analyze_time_series(
            patent_data,
            'patent_date',
            'USPTO Patents'
        )

        # Combine and identify overlapping clusters
        all_clusters = self._identify_cluster_periods(
            fda_clusters,
            patent_clusters
        )

        # Generate summary statistics
        summary = self._generate_summary(fda_df, patent_data, all_clusters)

        # Prepare output
        results = {
            'summary': summary,
            'fda_clusters': fda_clusters,
            'patent_clusters': patent_clusters,
            'major_cluster_periods': all_clusters,
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

    def _load_patent_data(self) -> pd.DataFrame:
        """Load and prepare patent data"""
        print("\n📊 Loading USPTO patent data...")

        if not self.patent_path.exists():
            print(f"⚠️  Patent data not found at {self.patent_path}")
            return pd.DataFrame()

        with open(self.patent_path, 'r') as f:
            patents = json.load(f)

        df = pd.DataFrame(patents)
        df['patent_date'] = pd.to_datetime(df['patent_date'], errors='coerce')
        df['year'] = df['patent_date'].dt.year

        print(f"   Loaded {len(df):,} breakthrough patents")
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

    def _identify_cluster_periods(
        self,
        fda_clusters: Dict,
        patent_clusters: Dict
    ) -> List[Dict]:
        """Identify major cluster periods across both data sources"""

        print("\n🎯 Identifying major cluster periods...")

        all_clusters = []

        # Combine clusters from both sources
        for cluster in fda_clusters.get('clusters', []):
            cluster['source'] = 'FDA Drug Approvals'
            all_clusters.append(cluster)

        for cluster in patent_clusters.get('clusters', []):
            cluster['source'] = 'USPTO Patents'
            all_clusters.append(cluster)

        # Sort by start year
        all_clusters.sort(key=lambda x: x['start_year'])

        # Find overlapping clusters (same time period in both datasets)
        overlapping = []
        for i, cluster1 in enumerate(all_clusters):
            for cluster2 in all_clusters[i+1:]:
                if cluster1['source'] != cluster2['source']:
                    # Check for overlap
                    overlap = self._calculate_overlap(
                        cluster1['start_year'],
                        cluster1['end_year'],
                        cluster2['start_year'],
                        cluster2['end_year']
                    )

                    if overlap > 0.5:  # At least 50% overlap
                        overlapping.append({
                            'period': f"{cluster1['start_year']}–{cluster1['end_year']}",
                            'start_year': min(cluster1['start_year'], cluster2['start_year']),
                            'end_year': max(cluster1['end_year'], cluster2['end_year']),
                            'fda_cluster': cluster1 if cluster1['source'] == 'FDA Drug Approvals' else cluster2,
                            'patent_cluster': cluster1 if cluster1['source'] == 'USPTO Patents' else cluster2,
                            'overlap_score': float(overlap)
                        })

        print(f"   Found {len(overlapping)} overlapping cluster periods")
        print(f"   Total cluster periods: {len(all_clusters)}")

        return overlapping

    def _calculate_overlap(
        self,
        start1: int,
        end1: int,
        start2: int,
        end2: int
    ) -> float:
        """Calculate overlap ratio between two periods"""

        overlap_start = max(start1, start2)
        overlap_end = min(end1, end2)

        if overlap_start > overlap_end:
            return 0.0

        overlap_years = overlap_end - overlap_start + 1
        total_years = max(end1 - start1 + 1, end2 - start2 + 1)

        return overlap_years / total_years

    def _generate_summary(
        self,
        fda_df: pd.DataFrame,
        patent_df: pd.DataFrame,
        clusters: List[Dict]
    ) -> Dict:
        """Generate summary statistics"""

        summary = {
            'total_drug_approvals': int(len(fda_df)) if not fda_df.empty else 0,
            'total_breakthrough_patents': int(len(patent_df)) if not patent_df.empty else 0,
            'date_range': {
                'start': int(min(
                    fda_df['year'].min() if not fda_df.empty else 9999,
                    patent_df['year'].min() if not patent_df.empty else 9999
                )),
                'end': int(max(
                    fda_df['year'].max() if not fda_df.empty else 0,
                    patent_df['year'].max() if not patent_df.empty else 0
                ))
            },
            'cluster_count': len(clusters),
            'most_innovative_decade': self._identify_peak_decade(fda_df, patent_df)
        }

        return summary

    def _identify_peak_decade(
        self,
        fda_df: pd.DataFrame,
        patent_df: pd.DataFrame
    ) -> Dict:
        """Identify the decade with most innovations"""

        # Combine years
        all_years = []
        if not fda_df.empty:
            all_years.extend(fda_df['year'].tolist())
        if not patent_df.empty:
            all_years.extend(patent_df['year'].tolist())

        if not all_years:
            return {}

        # Group by decade
        decades = [year // 10 * 10 for year in all_years if pd.notna(year)]
        decade_counts = Counter(decades)

        if not decade_counts:
            return {}

        peak_decade = max(decade_counts.items(), key=lambda x: x[1])

        return {
            'decade': int(peak_decade[0]),
            'decade_label': f"{peak_decade[0]}s",
            'innovation_count': int(peak_decade[1])
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
    print(f"Total innovations analyzed: {summary['total_drug_approvals'] + summary['total_breakthrough_patents']:,}")
    print(f"Cluster periods identified: {summary['cluster_count']}")

    if summary['most_innovative_decade']:
        decade = summary['most_innovative_decade']
        print(f"Most innovative decade: {decade['decade_label']} ({decade['innovation_count']:,} innovations)")

    if results['major_cluster_periods']:
        print(f"\nMajor cluster periods:")
        for cluster in results['major_cluster_periods'][:5]:
            print(f"  {cluster['period']} (overlap: {cluster['overlap_score']:.1%})")

    print("="*60)

    return results


if __name__ == '__main__':
    main()
