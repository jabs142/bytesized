#!/usr/bin/env python3
"""
COVID Data Optimizer
====================
Extracts only the dates used in the scrollytelling scenes from the full dataset.

This reduces the data file from ~20MB to ~200-500KB by removing unused dates.

Usage:
    python optimize_covid_data.py
"""

import json
from pathlib import Path

# Dates used in the 13 scrollytelling scenes
SCENE_DATES = [
    "2019-12-31",  # The Beginning
    "2020-02-29",  # Asian Spread
    "2020-03-15",  # Europe Becomes Epicenter
    "2020-04-15",  # Global Lockdowns
    "2020-07-01",  # Americas Crisis
    "2020-10-01",  # Second Wave
    "2020-12-31",  # A Glimmer of Hope
    "2021-04-30",  # India's Crisis
    "2021-08-01",  # Delta Goes Global
    "2021-12-15",  # Omicron Wave
    "2022-06-01",  # Living With COVID
    "2023-05-05",  # Emergency Ends
    "2024-01-01",  # Data Sources
]


def optimize_data(input_path, output_path):
    """
    Extract only scene dates from the full dataset

    Args:
        input_path: Path to full covid-data.json
        output_path: Path to save optimized covid-data-optimized.json
    """
    print("Loading full dataset...")
    with open(input_path, 'r') as f:
        data = json.load(f)

    print(f"Original file size: {Path(input_path).stat().st_size / 1024 / 1024:.1f} MB")

    # Create optimized version
    optimized_data = {
        "metadata": data["metadata"],
        "countries": {},
        "global": []
    }

    # Filter country timelines
    print(f"\nFiltering {len(data['countries'])} countries to {len(SCENE_DATES)} dates...")
    for country_code, country_data in data['countries'].items():
        # Filter timeline to only include scene dates
        filtered_timeline = [
            entry for entry in country_data['timeline']
            if entry['date'] in SCENE_DATES
        ]

        if filtered_timeline:  # Only include countries with data for these dates
            optimized_data['countries'][country_code] = {
                "name": country_data["name"],
                "code": country_data["code"],
                "continent": country_data["continent"],
                "population": country_data["population"],
                "timeline": filtered_timeline
            }

    # Filter global data
    optimized_data['global'] = [
        entry for entry in data['global']
        if entry['date'] in SCENE_DATES
    ]

    # Save optimized data
    print(f"\nSaving optimized dataset...")
    with open(output_path, 'w') as f:
        json.dump(optimized_data, f, separators=(',', ':'))

    optimized_size = Path(output_path).stat().st_size / 1024
    original_size = Path(input_path).stat().st_size / 1024 / 1024

    print(f"✓ Optimized data saved to: {output_path}")
    print(f"  - Countries: {len(optimized_data['countries'])}")
    print(f"  - Dates per country: {len(SCENE_DATES)}")
    print(f"  - Global entries: {len(optimized_data['global'])}")
    print(f"  - Optimized size: {optimized_size:.1f} KB")
    print(f"  - Size reduction: {original_size * 1024:.1f} KB → {optimized_size:.1f} KB")
    print(f"  - Savings: {((1 - optimized_size / (original_size * 1024)) * 100):.1f}%")


def main():
    """Main entry point"""
    data_dir = Path(__file__).parent / 'frontend' / 'data'
    input_file = data_dir / 'covid-data.json'
    output_file = data_dir / 'covid-data-optimized.json'

    if not input_file.exists():
        print(f"Error: {input_file} not found")
        return 1

    optimize_data(input_file, output_file)

    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Test the visualization with the optimized file:")
    print("   - Update frontend/js/config.js:")
    print("     covidData: 'data/covid-data-optimized.json'")
    print("2. Once confirmed working, replace the original:")
    print(f"   mv {output_file} {input_file}")
    print("=" * 60)

    return 0


if __name__ == '__main__':
    exit(main())
