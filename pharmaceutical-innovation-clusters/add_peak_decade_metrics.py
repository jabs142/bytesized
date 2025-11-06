"""
Add peak decade metrics to therapeutic trends data
Identifies which decade had the highest concentration for each area
"""
import json
from pathlib import Path

def add_peak_decade_metrics():
    """Add peak decade analysis to therapeutic_trends.json"""

    trends_path = Path('data/processed/therapeutic_trends.json')

    with open(trends_path, 'r') as f:
        data = json.load(f)

    print("📊 Analyzing peak decades for therapeutic areas...")

    for area_name, area_data in data['therapeutic_trends'].items():
        by_decade = area_data.get('by_decade', {})

        if not by_decade:
            continue

        # Find peak decade
        peak_decade = max(by_decade.items(), key=lambda x: x[1])
        total_approvals = area_data['total_approvals']

        # Calculate concentration percentage
        peak_concentration = (peak_decade[1] / total_approvals * 100) if total_approvals > 0 else 0

        # Add metrics
        area_data['peak_decade'] = {
            'decade': peak_decade[0],
            'decade_label': f"{peak_decade[0]}s",
            'count': peak_decade[1],
            'concentration_percent': round(peak_concentration, 1)
        }

        print(f"  {area_name:30s} → {peak_decade[0]}s ({peak_concentration:.1f}%)")

    # Sort therapeutic areas by peak concentration (for the bar chart visualization)
    sorted_areas = sorted(
        data['therapeutic_trends'].items(),
        key=lambda x: x[1].get('peak_decade', {}).get('concentration_percent', 0),
        reverse=True
    )

    # Add sorted list for easy frontend access
    data['peak_concentration_ranking'] = [
        {
            'area': area_name,
            'peak_decade': area_data.get('peak_decade', {}),
            'total_approvals': area_data['total_approvals']
        }
        for area_name, area_data in sorted_areas
    ]

    # Save updated data
    with open(trends_path, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n✅ Peak decade metrics added to {trends_path}")
    print(f"   Top 3 most concentrated areas:")
    for i, item in enumerate(data['peak_concentration_ranking'][:3], 1):
        peak = item['peak_decade']
        print(f"   {i}. {item['area']}: {peak['decade_label']} ({peak['concentration_percent']}%)")

if __name__ == '__main__':
    add_peak_decade_metrics()
