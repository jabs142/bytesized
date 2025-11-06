"""
Generate decade breakdown showing Generic vs Innovative drug approvals
Reveals that 1980s boom was driven by generics, not innovation
"""
import pandas as pd
import json
from pathlib import Path
from collections import defaultdict

def generate_decade_breakdown():
    """Generate decade-by-decade breakdown of drug types"""

    raw_path = Path('data/raw/fda_drugs_raw.csv')
    output_path = Path('data/processed/decade_breakdown.json')

    print("📊 Generating decade breakdown...")

    # Load data
    df = pd.read_csv(raw_path)
    df['approval_date'] = pd.to_datetime(df['approval_date'], errors='coerce')
    df['year'] = df['approval_date'].dt.year
    df['decade'] = (df['year'] // 10 * 10).astype('Int64')

    # Group by decade
    decade_data = {}

    for decade, decade_df in df.groupby('decade'):
        if pd.isna(decade):
            continue

        decade = int(decade)
        total = len(decade_df)
        innovative = decade_df['is_innovative'].sum()
        generic = decade_df['is_generic'].sum()

        decade_data[decade] = {
            'decade': decade,
            'decade_label': f"{decade}s",
            'total': int(total),
            'innovative': int(innovative),
            'generic': int(generic),
            'innovative_percent': round(innovative / total * 100, 1) if total > 0 else 0,
            'generic_percent': round(generic / total * 100, 1) if total > 0 else 0
        }

        print(f"  {decade}s: {total:,} total | {innovative:,} innovative ({innovative/total*100:.1f}%) | {generic:,} generic ({generic/total*100:.1f}%)")

    # Sort by decade
    sorted_decades = sorted(decade_data.values(), key=lambda x: x['decade'])

    # Prepare output
    output = {
        'decade_breakdown': sorted_decades,
        'summary': {
            'total_approvals': int(len(df)),
            'total_innovative': int(df['is_innovative'].sum()),
            'total_generic': int(df['is_generic'].sum()),
            'peak_all_decade': max(sorted_decades, key=lambda x: x['total'])['decade'],
            'peak_innovative_decade': max(sorted_decades, key=lambda x: x['innovative'])['decade'],
            'peak_generic_decade': max(sorted_decades, key=lambda x: x['generic'])['decade']
        },
        'key_insights': {
            '1980s_boom': decade_data.get(1980, {}),
            '2010s_innovation': decade_data.get(2010, {})
        }
    }

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Decade breakdown saved to {output_path}")
    print(f"\n🎯 Key Findings:")
    print(f"  • Peak decade (all drugs): {output['summary']['peak_all_decade']}s")
    print(f"  • Peak decade (innovative): {output['summary']['peak_innovative_decade']}s")
    print(f"  • Peak decade (generic): {output['summary']['peak_generic_decade']}s")

    print(f"\n💡 The Revelation:")
    boom_1980s = decade_data.get(1980, {})
    boom_2010s = decade_data.get(2010, {})
    print(f"  • 1980s: {boom_1980s.get('generic_percent', 0)}% generic, {boom_1980s.get('innovative_percent', 0)}% innovative")
    print(f"  • 2010s: {boom_2010s.get('generic_percent', 0)}% generic, {boom_2010s.get('innovative_percent', 0)}% innovative")

if __name__ == '__main__':
    generate_decade_breakdown()
