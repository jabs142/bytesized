"""
Export Frontend Data

Converts analysis results to frontend-friendly JSON format
"""
import json
from pathlib import Path
import sys
import pandas as pd

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class FrontendDataExporter:
    """Exports cluster analysis data for frontend consumption"""

    def __init__(self):
        self.clusters_path = Config.PROCESSED_DATA_DIR / 'innovation_clusters.json'
        self.output_path = Config.FRONTEND_DATA_DIR / 'clusters.json'
        self.enriched_output_path = Config.FRONTEND_DATA_DIR / 'enriched_clusters.json'
        self.fda_raw_path = Config.RAW_DATA_DIR / 'fda_drugs_raw.csv'
        self.fda_df = None

    def export(self):
        """Export data to frontend JSON format"""

        print("\n" + "="*60)
        print("EXPORTING FRONTEND DATA")
        print("="*60)

        # Load cluster analysis
        if not self.clusters_path.exists():
            print(f"\n⚠️  Cluster analysis not found at {self.clusters_path}")
            print("Please run cluster_analyzer.py first")
            return

        with open(self.clusters_path, 'r') as f:
            clusters = json.load(f)

        # Prepare frontend data structure
        frontend_data = {
            'summary': clusters.get('summary', {}),
            'fda_clusters': clusters.get('fda_clusters', {}),
            'cluster_periods': clusters.get('cluster_periods', []),
            'metadata': clusters.get('metadata', {})
        }

        # Add derived statistics
        frontend_data['statistics'] = self._calculate_statistics(clusters)

        # Save to frontend data directory
        with open(self.output_path, 'w') as f:
            json.dump(frontend_data, f, indent=2, default=str)

        print(f"\n✅ Frontend data exported to {self.output_path}")

        # Print summary
        self._print_export_summary(frontend_data)

    def _calculate_statistics(self, clusters: dict) -> dict:
        """Calculate additional statistics for frontend"""

        stats = {}

        # FDA statistics
        fda_clusters = clusters.get('fda_clusters', {})
        if fda_clusters and 'yearly_counts' in fda_clusters:
            yearly_counts = fda_clusters['yearly_counts']
            stats['fda_total_years'] = len(yearly_counts)

        # Cluster statistics
        cluster_periods = clusters.get('cluster_periods', [])
        if cluster_periods:
            durations = [c.get('duration_years', 0) for c in cluster_periods]
            stats['avg_cluster_duration'] = sum(durations) / len(durations) if durations else 0

        return stats

    def _print_export_summary(self, data: dict):
        """Print export summary"""

        print("\n" + "="*60)
        print("EXPORT SUMMARY")
        print("="*60)

        summary = data['summary']
        print(f"Total drug approvals: {summary.get('total_drug_approvals', 0):,}")
        print(f"Cluster periods identified: {summary.get('cluster_count', 0)}")

        fda_count = len(data['fda_clusters'].get('clusters', []))
        cluster_count = len(data['cluster_periods'])

        print(f"\nClusters:")
        print(f"  FDA cluster periods: {cluster_count}")
        print(f"  FDA temporal clusters: {fda_count}")

        print("="*60)

    def _load_fda_data(self):
        """Load FDA raw data for enrichment"""
        if self.fda_df is None:
            if not self.fda_raw_path.exists():
                print(f"\n⚠️  FDA raw data not found at {self.fda_raw_path}")
                return None

            print(f"\nLoading FDA raw data from {self.fda_raw_path}...")
            self.fda_df = pd.read_csv(self.fda_raw_path)
            print(f"✓ Loaded {len(self.fda_df):,} drug records")

        return self.fda_df

    def _enrich_clusters(self, clusters: dict) -> dict:
        """Enrich cluster data with therapeutic breakdown and sponsor information"""

        print("\nEnriching cluster data...")

        # Load FDA data
        fda_df = self._load_fda_data()
        if fda_df is None:
            print("⚠️  Cannot enrich clusters without FDA raw data")
            return clusters

        # Get FDA clusters from the data
        fda_clusters = clusters.get('fda_clusters', {}).get('clusters', [])

        if not fda_clusters:
            print("⚠️  No FDA clusters found to enrich")
            return clusters

        enriched_clusters = []

        for cluster in fda_clusters:
            enriched_cluster = cluster.copy()

            # Get year range for this cluster
            years = cluster.get('years', [])
            if not years:
                enriched_clusters.append(enriched_cluster)
                continue

            # Filter FDA data for this time period
            cluster_drugs = fda_df[fda_df['year'].isin(years)]

            # Calculate therapeutic breakdown (using pharm_class_epc)
            therapeutic_breakdown = self._calculate_therapeutic_breakdown(cluster_drugs)
            enriched_cluster['therapeutic_breakdown'] = therapeutic_breakdown

            # Calculate top sponsors
            top_sponsors = self._calculate_top_sponsors(cluster_drugs)
            enriched_cluster['top_sponsors'] = top_sponsors

            enriched_clusters.append(enriched_cluster)

            print(f"  ✓ Enriched cluster {cluster.get('start_year')}-{cluster.get('end_year')}: "
                  f"{len(therapeutic_breakdown)} therapeutic areas, {len(top_sponsors)} top sponsors")

        # Create enriched output structure
        enriched_output = {
            'summary': clusters.get('summary', {}),
            'clusters': enriched_clusters,
            'metadata': clusters.get('metadata', {})
        }

        return enriched_output

    def _calculate_therapeutic_breakdown(self, cluster_drugs: pd.DataFrame) -> list:
        """Calculate therapeutic area breakdown for a cluster period"""

        # Filter out drugs with missing pharm_class_epc
        drugs_with_class = cluster_drugs[cluster_drugs['pharm_class_epc'].notna()]

        if len(drugs_with_class) == 0:
            return []

        # Count by therapeutic area (pharm_class_epc)
        area_counts = drugs_with_class['pharm_class_epc'].value_counts()

        # Calculate percentages
        total_count = len(drugs_with_class)

        therapeutic_breakdown = []
        for area, count in area_counts.head(5).items():  # Top 5
            percentage = (count / total_count) * 100
            therapeutic_breakdown.append({
                'area': area,
                'count': int(count),
                'percentage': round(percentage, 1)
            })

        return therapeutic_breakdown

    def _calculate_top_sponsors(self, cluster_drugs: pd.DataFrame) -> list:
        """Calculate top sponsors for a cluster period"""

        # Filter out drugs with missing sponsor names
        drugs_with_sponsor = cluster_drugs[cluster_drugs['sponsor_name'].notna()]

        if len(drugs_with_sponsor) == 0:
            return []

        # Count by sponsor
        sponsor_counts = drugs_with_sponsor['sponsor_name'].value_counts()

        top_sponsors = []
        for sponsor, count in sponsor_counts.head(5).items():  # Top 5
            top_sponsors.append({
                'name': sponsor,
                'approvals': int(count)
            })

        return top_sponsors

    def export_enriched(self):
        """Export enriched cluster data with therapeutic breakdown and sponsors"""

        print("\n" + "="*60)
        print("EXPORTING ENRICHED CLUSTER DATA")
        print("="*60)

        # Load cluster analysis
        if not self.clusters_path.exists():
            print(f"\n⚠️  Cluster analysis not found at {self.clusters_path}")
            print("Please run cluster_analyzer.py first")
            return

        with open(self.clusters_path, 'r') as f:
            clusters = json.load(f)

        # Enrich with therapeutic and sponsor data
        enriched_data = self._enrich_clusters(clusters)

        # Save enriched data
        with open(self.enriched_output_path, 'w') as f:
            json.dump(enriched_data, f, indent=2, default=str)

        print(f"\n✅ Enriched cluster data exported to {self.enriched_output_path}")
        print(f"   Contains {len(enriched_data.get('clusters', []))} enriched clusters")


def main():
    """Run data export"""
    exporter = FrontendDataExporter()
    exporter.export()
    exporter.export_enriched()


if __name__ == '__main__':
    main()
