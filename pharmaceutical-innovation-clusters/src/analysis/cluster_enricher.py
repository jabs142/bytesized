"""
Cluster Enrichment Script
Enriches cluster data with therapeutic area breakdowns, top sponsors, and notable drug classes
"""

import json
from pathlib import Path
from collections import Counter, defaultdict
from typing import Dict, List

# File paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
CLUSTERS_PATH = PROJECT_ROOT / "frontend/data/clusters.json"
THERAPEUTIC_TIMELINE_PATH = PROJECT_ROOT / "data/processed/therapeutic_timeline.json"
OUTPUT_PATH = PROJECT_ROOT / "frontend/data/enriched_clusters.json"


def load_json(filepath: Path) -> dict:
    """Load JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data: dict, filepath: Path):
    """Save JSON file"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def enrich_cluster(cluster: dict, all_approvals: List[dict]) -> dict:
    """
    Enrich a single cluster with therapeutic area breakdown,
    top sponsors, and notable drug classes
    """
    start_year = cluster['start_year']
    end_year = cluster['end_year']

    # Filter approvals to this cluster period
    cluster_approvals = [
        approval for approval in all_approvals
        if start_year <= approval['year'] <= end_year
    ]

    print(f"Cluster {start_year}-{end_year}: {len(cluster_approvals)} approvals")

    # Count therapeutic areas
    therapeutic_counts = Counter()
    sponsor_counts = Counter()

    for approval in cluster_approvals:
        therapeutic_area = approval.get('therapeutic_area', 'Unknown')
        sponsor = approval.get('sponsor', 'Unknown')

        therapeutic_counts[therapeutic_area] += 1
        if sponsor and sponsor != 'Unknown':
            sponsor_counts[sponsor] += 1

    # Calculate percentages for therapeutic areas
    total = len(cluster_approvals)
    therapeutic_breakdown = []
    for area, count in therapeutic_counts.most_common(10):
        percentage = round((count / total) * 100, 1) if total > 0 else 0
        therapeutic_breakdown.append({
            'area': area,
            'count': count,
            'percentage': percentage
        })

    # Get top 5 sponsors
    top_sponsors = [
        {'name': sponsor, 'approvals': count}
        for sponsor, count in sponsor_counts.most_common(5)
    ]

    # Enrich the cluster data
    enriched = {
        **cluster,  # Keep all original cluster data
        'therapeutic_breakdown': therapeutic_breakdown,
        'top_sponsors': top_sponsors,
        'total_approvals_in_period': len(cluster_approvals)
    }

    return enriched


def main():
    """Main enrichment process"""
    print("Loading cluster data...")
    cluster_data = load_json(CLUSTERS_PATH)

    print("Loading therapeutic timeline data...")
    timeline_data = load_json(THERAPEUTIC_TIMELINE_PATH)

    # Extract approvals list
    approvals = timeline_data.get('approvals', [])
    print(f"Found {len(approvals)} total drug approvals")

    # Get FDA clusters
    fda_clusters = cluster_data.get('fda_clusters', {}).get('clusters', [])
    print(f"Found {len(fda_clusters)} FDA clusters")

    # Enrich each cluster
    enriched_clusters = []
    for cluster in fda_clusters:
        enriched = enrich_cluster(cluster, approvals)
        enriched_clusters.append(enriched)

    # Create output structure
    output = {
        'clusters': enriched_clusters,
        'metadata': {
            'total_clusters': len(enriched_clusters),
            'data_source': 'FDA OpenFDA API',
            'enrichment_date': cluster_data.get('fda_clusters', {}).get('metadata', {}).get('analysis_date', 'Unknown')
        }
    }

    # Save enriched data
    print(f"Saving enriched data to {OUTPUT_PATH}...")
    save_json(output, OUTPUT_PATH)

    # Print summary
    print("\n=== Enrichment Summary ===")
    for cluster in enriched_clusters:
        print(f"\n{cluster['start_year']}-{cluster['end_year']}:")
        print(f"  Total approvals: {cluster['total_approvals_in_period']}")
        if cluster['therapeutic_breakdown']:
            print(f"  Top therapeutic area: {cluster['therapeutic_breakdown'][0]['area']} ({cluster['therapeutic_breakdown'][0]['percentage']}%)")
        if cluster['top_sponsors']:
            print(f"  Top sponsor: {cluster['top_sponsors'][0]['name']} ({cluster['top_sponsors'][0]['approvals']} approvals)")

    print(f"\n✅ Enriched cluster data saved to: {OUTPUT_PATH}")


if __name__ == '__main__':
    main()
