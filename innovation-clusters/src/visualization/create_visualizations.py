"""
Visualization Data Generator

Exports JSON data for frontend charts and visualizations
"""
import pandas as pd
import numpy as np
import json
from pathlib import Path
from typing import Dict, List
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class VizGenerator:
    """Generates visualization-ready JSON data"""

    def __init__(self):
        self.fda_path = Config.RAW_DATA_DIR / 'fda_drugs_raw.csv'
        self.patent_path = Config.RAW_DATA_DIR / 'patents_raw.json'
        self.stats_path = Config.PROCESSED_DATA_DIR / 'statistical_results.json'
        self.industry_path = Config.PROCESSED_DATA_DIR / 'industry_analysis.json'
        self.output_path = Config.FRONTEND_DATA_DIR / 'timeline_viz.json'

    def generate_all(self):
        """Generate all visualization data files"""

        print("\n" + "="*70)
        print("GENERATING VISUALIZATION DATA")
        print("="*70)

        # Load data
        fda_df = self._load_fda_data()
        patent_df = self._load_patent_data()
        stats = self._load_stats()
        industry = self._load_industry()

        # Generate visualizations
        timeline_data = self._generate_timeline(fda_df, patent_df, stats)
        comparison_data = self._generate_comparison(industry)
        summary_cards = self._generate_summary_cards(stats, industry)

        # Combine into single viz file
        viz_data = {
            'timeline': timeline_data,
            'comparison': comparison_data,
            'summary_cards': summary_cards,
            'metadata': {
                'generated_at': pd.Timestamp.now().isoformat()
            }
        }

        # Save
        with open(self.output_path, 'w') as f:
            json.dump(viz_data, f, indent=2, default=str)

        print(f"\n✅ Visualization data saved to {self.output_path}")

        return viz_data

    def _load_fda_data(self) -> pd.DataFrame:
        """Load FDA data"""
        if not self.fda_path.exists():
            return pd.DataFrame()

        df = pd.read_csv(self.fda_path)
        df['approval_date'] = pd.to_datetime(df['approval_date'], errors='coerce')
        df['year'] = df['approval_date'].dt.year
        return df

    def _load_patent_data(self) -> pd.DataFrame:
        """Load patent data"""
        if not self.patent_path.exists():
            return pd.DataFrame()

        with open(self.patent_path, 'r') as f:
            patents = json.load(f)

        df = pd.DataFrame(patents)
        df['patent_date'] = pd.to_datetime(df['patent_date'], errors='coerce')
        df['year'] = df['patent_date'].dt.year
        return df

    def _load_stats(self) -> Dict:
        """Load statistical results"""
        if not self.stats_path.exists():
            return {}

        with open(self.stats_path, 'r') as f:
            return json.load(f)

    def _load_industry(self) -> Dict:
        """Load industry analysis"""
        if not self.industry_path.exists():
            return {}

        with open(self.industry_path, 'r') as f:
            return json.load(f)

    def _generate_timeline(
        self,
        fda_df: pd.DataFrame,
        patent_df: pd.DataFrame,
        stats: Dict
    ) -> Dict:
        """Generate master timeline data"""

        print("\n📊 Generating master timeline...")

        # Determine year range
        all_years = []
        if not fda_df.empty:
            all_years.extend(fda_df['year'].dropna().tolist())
        if not patent_df.empty:
            all_years.extend(patent_df['year'].dropna().tolist())

        if not all_years:
            return {}

        min_year = int(min(all_years))
        max_year = int(max(all_years))
        years = list(range(min_year, max_year + 1))

        # Count innovations per year for each category
        series = {}

        # FDA drugs
        if not fda_df.empty:
            fda_counts = fda_df['year'].value_counts().to_dict()
            series['fda_drugs'] = [int(fda_counts.get(year, 0)) for year in years]
        else:
            series['fda_drugs'] = [0] * len(years)

        # Patent categories
        if not patent_df.empty:
            for category in ['Semiconductors', 'Telecommunications', 'Computing', 'Pharmaceuticals']:
                cat_df = patent_df[patent_df['technology_category'] == category]
                cat_counts = cat_df['year'].value_counts().to_dict()
                series[category.lower()] = [int(cat_counts.get(year, 0)) for year in years]
        else:
            series['semiconductors'] = [0] * len(years)
            series['telecommunications'] = [0] * len(years)
            series['computing'] = [0] * len(years)
            series['pharmaceuticals'] = [0] * len(years)

        # Add cluster highlights
        cluster_highlights = []
        if stats and 'significant_clusters' in stats:
            for cluster in stats['significant_clusters']:
                cluster_highlights.append({
                    'start': cluster['start_year'],
                    'end': cluster['end_year'],
                    'category': cluster['category'],
                    'label': f"{cluster['category_name']} Cluster",
                    'sigma': round(cluster['sigma_above_mean'], 1)
                })

        return {
            'years': years,
            'series': series,
            'cluster_highlights': cluster_highlights
        }

    def _generate_comparison(self, industry: Dict) -> Dict:
        """Generate industry comparison data"""

        print("\n📊 Generating industry comparison...")

        if not industry or 'industries' not in industry:
            return {}

        categories = []
        totals = []
        peaks = []
        trends = []

        for industry_id, data in industry['industries'].items():
            categories.append(data['category_name'])
            totals.append(data['total'])
            peaks.append(data['peak_year'])
            trends.append(data['trend'])

        # Decade breakdown
        decade_data = industry.get('decade_breakdown', {})

        return {
            'categories': categories,
            'totals': totals,
            'peak_years': peaks,
            'trends': trends,
            'decade_breakdown': decade_data
        }

    def _generate_summary_cards(self, stats: Dict, industry: Dict) -> List[Dict]:
        """Generate summary cards data"""

        print("\n📊 Generating summary cards...")

        cards = []

        # Most innovative decade
        if industry and 'decade_breakdown' in industry:
            decade_totals = {}
            for decade, counts in industry['decade_breakdown'].items():
                total = sum(counts.values())
                decade_totals[decade] = total

            if decade_totals:
                top_decade = max(decade_totals.items(), key=lambda x: x[1])
                cards.append({
                    'title': 'Most Innovative Decade',
                    'value': top_decade[0],
                    'detail': f"{top_decade[1]:,} total innovations"
                })

        # Strongest cluster
        if stats and 'significant_clusters' in stats and stats['significant_clusters']:
            strongest = max(stats['significant_clusters'], key=lambda x: x['sigma_above_mean'])
            cards.append({
                'title': 'Strongest Cluster',
                'value': strongest['period'],
                'detail': f"{strongest['sigma_above_mean']:.1f}σ above mean ({strongest['category_name']})"
            })

        # Industry correlation
        if stats and 'industry_correlations' in stats:
            # Find strongest correlation
            correlations = stats['industry_correlations']
            if correlations:
                strongest_corr = max(correlations.items(), key=lambda x: abs(x[1]['correlation']))
                cards.append({
                    'title': 'Strongest Correlation',
                    'value': f"{abs(strongest_corr[1]['correlation']) * 100:.0f}%",
                    'detail': strongest_corr[0].replace('_', ' ').title()
                })

        # Total innovations
        total_innovations = 0
        if industry and 'industries' in industry:
            for data in industry['industries'].values():
                total_innovations += data['total']

        if total_innovations > 0:
            cards.insert(0, {
                'title': 'Total Innovations',
                'value': f"{total_innovations:,}",
                'detail': 'Across all categories'
            })

        return cards


def main():
    """Generate visualization data"""
    generator = VizGenerator()
    viz_data = generator.generate_all()

    print("\n" + "="*70)
    print("VISUALIZATION DATA READY")
    print("="*70)
    print(f"\nGenerated:")
    print(f"  • Timeline data: {len(viz_data['timeline'].get('years', []))} years")
    print(f"  • Industry comparisons: {len(viz_data['comparison'].get('categories', []))} categories")
    print(f"  • Summary cards: {len(viz_data['summary_cards'])}")
    print("="*70)

    return viz_data


if __name__ == '__main__':
    main()
