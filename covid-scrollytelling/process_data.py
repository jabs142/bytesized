#!/usr/bin/env python3
"""
Process OWID COVID-19 data for scrollytelling visualization
- Extract major ~50-60 countries
- Convert to JSON format optimized for D3.js
- Calculate key milestones and aggregate stats
"""

import pandas as pd
import json
from datetime import datetime
from pathlib import Path

# Major countries to include (~60 countries)
# Based on: G20, highest case counts, geographic diversity, key hotspots
MAJOR_COUNTRIES = [
    # G20 + Major Economies
    'United States', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
    'Canada', 'Japan', 'South Korea', 'Australia', 'Brazil', 'Argentina',
    'Mexico', 'Russia', 'China', 'India', 'Indonesia', 'South Africa',
    'Saudi Arabia', 'Turkey',

    # Europe - Key affected nations
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway',
    'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Portugal', 'Greece',
    'Romania', 'Ireland',

    # Asia - Early & significant spread
    'Iran', 'Israel', 'United Arab Emirates', 'Thailand', 'Singapore',
    'Malaysia', 'Philippines', 'Vietnam', 'Pakistan', 'Bangladesh',

    # Americas
    'Chile', 'Colombia', 'Peru', 'Ecuador', 'Costa Rica',

    # Africa
    'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Ethiopia',

    # Oceania
    'New Zealand',

    # Additional hotspots
    'Ukraine', 'Hungary', 'Serbia', 'Croatia'
]

def process_covid_data():
    """Process OWID CSV into JSON for visualization"""

    print("Loading CSV data...")
    df = pd.read_csv('frontend/data/owid-covid-data.csv')

    # Filter to major countries only
    df = df[df['country'].isin(MAJOR_COUNTRIES)]

    # Convert date to datetime
    df['date'] = pd.to_datetime(df['date'])

    # Filter to pandemic period (2020-2024)
    df = df[(df['date'] >= '2020-01-01') & (df['date'] <= '2024-12-31')]

    print(f"Processing {df['country'].nunique()} countries...")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")

    # Build country data structure
    countries = {}

    for country_name in df['country'].unique():
        country_df = df[df['country'] == country_name].sort_values('date')

        # Get country metadata (from first row)
        first_row = country_df.iloc[0]

        # Build timeline (only include rows with data)
        timeline = []
        for _, row in country_df.iterrows():
            # Only include if we have case or death data
            if pd.notna(row['total_cases']) or pd.notna(row['total_deaths']):
                timeline.append({
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'totalCases': int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
                    'totalDeaths': int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0,
                    'casesPerMillion': float(row['total_cases_per_million']) if pd.notna(row['total_cases_per_million']) else 0,
                    'deathsPerMillion': float(row['total_deaths_per_million']) if pd.notna(row['total_deaths_per_million']) else 0,
                    'totalVaccinations': int(row['total_vaccinations']) if pd.notna(row['total_vaccinations']) else 0,
                    'peopleVaccinated': int(row['people_vaccinated']) if pd.notna(row['people_vaccinated']) else 0,
                    'peopleFullyVaccinated': int(row['people_fully_vaccinated']) if pd.notna(row['people_fully_vaccinated']) else 0,
                })

        if timeline:  # Only add country if it has data
            countries[first_row['code']] = {
                'name': country_name,
                'code': first_row['code'],
                'continent': first_row['continent'] if pd.notna(first_row['continent']) else 'Unknown',
                'population': int(first_row['population']) if pd.notna(first_row['population']) else 0,
                'timeline': timeline
            }

    print(f"Processed {len(countries)} countries with data")

    # Calculate global aggregates by date
    print("Calculating global aggregates...")
    global_df = df.groupby('date').agg({
        'total_cases': 'sum',
        'total_deaths': 'sum',
        'total_vaccinations': 'sum',
        'people_fully_vaccinated': 'sum'
    }).reset_index()

    global_timeline = []
    for _, row in global_df.iterrows():
        global_timeline.append({
            'date': row['date'].strftime('%Y-%m-%d'),
            'totalCases': int(row['total_cases']) if pd.notna(row['total_cases']) else 0,
            'totalDeaths': int(row['total_deaths']) if pd.notna(row['total_deaths']) else 0,
            'totalVaccinations': int(row['total_vaccinations']) if pd.notna(row['total_vaccinations']) else 0,
            'peopleFullyVaccinated': int(row['people_fully_vaccinated']) if pd.notna(row['people_fully_vaccinated']) else 0,
        })

    # Build final structure
    output = {
        'countries': countries,
        'global': global_timeline,
        'metadata': {
            'lastUpdated': datetime.now().isoformat(),
            'countryCount': len(countries),
            'dateRange': {
                'start': df['date'].min().strftime('%Y-%m-%d'),
                'end': df['date'].max().strftime('%Y-%m-%d')
            }
        }
    }

    # Write to JSON
    output_path = Path('frontend/data/covid-data.json')
    print(f"Writing to {output_path}...")
    with open(output_path, 'w') as f:
        json.dump(output, f, separators=(',', ':'))  # Compact JSON

    file_size = output_path.stat().st_size / (1024 * 1024)  # MB
    print(f"✓ Created covid-data.json ({file_size:.1f} MB)")

    # Print summary stats
    print("\n=== Summary ===")
    print(f"Countries: {len(countries)}")
    print(f"Date range: {output['metadata']['dateRange']['start']} to {output['metadata']['dateRange']['end']}")
    print(f"Total timeline entries: {sum(len(c['timeline']) for c in countries.values())}")
    print(f"\nTop 10 countries by total cases (as of latest date):")

    latest_cases = []
    for code, data in countries.items():
        if data['timeline']:
            latest = data['timeline'][-1]
            latest_cases.append((data['name'], latest['totalCases']))

    for name, cases in sorted(latest_cases, key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {name}: {cases:,}")

if __name__ == '__main__':
    process_covid_data()
