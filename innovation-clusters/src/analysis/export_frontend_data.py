"""
Export Frontend Data

Converts analysis results to frontend-friendly JSON format
"""
import json
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class FrontendDataExporter:
    """Exports cluster analysis data for frontend consumption"""

    def __init__(self):
        self.clusters_path = Config.PROCESSED_DATA_DIR / 'innovation_clusters.json'
        self.output_path = Config.FRONTEND_DATA_DIR / 'clusters.json'

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
            'patent_clusters': clusters.get('patent_clusters', {}),
            'major_cluster_periods': clusters.get('major_cluster_periods', []),
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

        # Patent statistics
        patent_clusters = clusters.get('patent_clusters', {})
        if patent_clusters and 'yearly_counts' in patent_clusters:
            yearly_counts = patent_clusters['yearly_counts']
            stats['patent_total_years'] = len(yearly_counts)

        # Cluster statistics
        major_clusters = clusters.get('major_cluster_periods', [])
        if major_clusters:
            overlap_scores = [c.get('overlap_score', 0) for c in major_clusters]
            stats['avg_overlap_score'] = sum(overlap_scores) / len(overlap_scores) if overlap_scores else 0

        return stats

    def _print_export_summary(self, data: dict):
        """Print export summary"""

        print("\n" + "="*60)
        print("EXPORT SUMMARY")
        print("="*60)

        summary = data['summary']
        print(f"Total innovations: {summary.get('total_drug_approvals', 0) + summary.get('total_breakthrough_patents', 0):,}")
        print(f"Cluster periods: {summary.get('cluster_count', 0)}")

        fda_count = len(data['fda_clusters'].get('clusters', []))
        patent_count = len(data['patent_clusters'].get('clusters', []))
        major_count = len(data['major_cluster_periods'])

        print(f"\nClusters by type:")
        print(f"  FDA drug clusters: {fda_count}")
        print(f"  Patent clusters: {patent_count}")
        print(f"  Overlapping clusters: {major_count}")

        print("="*60)


def main():
    """Run data export"""
    exporter = FrontendDataExporter()
    exporter.export()


if __name__ == '__main__':
    main()
