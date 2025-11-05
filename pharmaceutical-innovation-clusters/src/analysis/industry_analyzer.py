"""
Pharmaceutical Industry Deep-Dive Analysis

Analyzes FDA drug approval trends by therapeutic area and time period
"""
import pandas as pd
import numpy as np
import json
from pathlib import Path
from typing import Dict, List
from collections import Counter
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class IndustryAnalyzer:
    """Analyzes pharmaceutical innovation trends by therapeutic area"""

    def __init__(self):
        self.fda_path = Config.RAW_DATA_DIR / 'fda_drugs_raw.csv'
        self.clusters_path = Config.PROCESSED_DATA_DIR / 'innovation_clusters.json'
        self.output_path = Config.PROCESSED_DATA_DIR / 'industry_analysis.json'

    def analyze(self) -> Dict:
        """
        Run complete pharmaceutical industry analysis

        Returns:
            Dictionary with pharmaceutical industry analysis results
        """
        print("\n" + "="*70)
        print("PHARMACEUTICAL INDUSTRY ANALYSIS")
        print("="*70)

        # Load data
        fda_df = self._load_fda_data()
        clusters = self._load_clusters()

        # Analyze FDA drugs
        industries = {}
        if not fda_df.empty:
            industries['fda_drugs'] = self._analyze_category(
                fda_df,
                'FDA Drugs',
                clusters.get('fda_clusters', {})
            )

        # Therapeutic area analysis
        therapeutic_areas = {}
        if not fda_df.empty and 'submission_type' in fda_df.columns:
            therapeutic_areas = self._analyze_therapeutic_areas(fda_df)

        # Decade breakdown
        decade_breakdown = self._analyze_by_decade(fda_df)

        # Compile results
        results = {
            'industries': industries,
            'therapeutic_areas': therapeutic_areas,
            'decade_breakdown': decade_breakdown,
            'metadata': {
                'analysis_date': pd.Timestamp.now().isoformat()
            }
        }

        # Save results
        with open(self.output_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)

        print(f"\n✅ Industry analysis complete. Results saved to {self.output_path}")

        # Print summary
        self._print_summary(results)

        return results

    def _load_fda_data(self) -> pd.DataFrame:
        """Load FDA drug approval data"""
        if not self.fda_path.exists():
            return pd.DataFrame()

        df = pd.read_csv(self.fda_path)
        df['approval_date'] = pd.to_datetime(df['approval_date'], errors='coerce')
        df['year'] = df['approval_date'].dt.year
        return df

    def _load_clusters(self) -> Dict:
        """Load cluster analysis results"""
        if not self.clusters_path.exists():
            return {}

        with open(self.clusters_path, 'r') as f:
            return json.load(f)

    def _analyze_category(
        self,
        df: pd.DataFrame,
        category_name: str,
        cluster_data: Dict = None
    ) -> Dict:
        """Analyze a single industry category"""

        if df.empty:
            return {}

        yearly_counts = df['year'].value_counts().sort_index()

        # Basic stats
        total = int(len(df))
        years = sorted(yearly_counts.index)
        date_range = [int(years[0]), int(years[-1])]

        # Calculate trend (using 10-year moving average slope)
        if len(yearly_counts) >= 10:
            recent = yearly_counts.tail(10)
            early = yearly_counts.head(10)
            trend = "growing" if recent.mean() > early.mean() else "declining"
        else:
            trend = "stable"

        # Cluster information
        clusters = []
        if cluster_data and 'clusters' in cluster_data:
            for cluster in cluster_data['clusters']:
                clusters.append({
                    'period': f"{cluster['start_year']}-{cluster['end_year']}",
                    'start_year': int(cluster['start_year']),
                    'end_year': int(cluster['end_year']),
                    'innovation_count': int(cluster['total_innovations']),
                    'avg_per_year': float(cluster['avg_per_year']),
                    'peak_year': int(cluster['peak_year']),
                    'peak_count': int(cluster['peak_count'])
                })

        return {
            'category_name': category_name,
            'total': total,
            'date_range': date_range,
            'trend': trend,
            'avg_per_year': float(yearly_counts.mean()),
            'peak_year': int(yearly_counts.idxmax()),
            'peak_count': int(yearly_counts.max()),
            'clusters': clusters,
            'yearly_time_series': yearly_counts.to_dict()
        }

    def _analyze_therapeutic_areas(self, df: pd.DataFrame) -> Dict:
        """
        Analyze drug approvals by therapeutic area

        Note: This is simplified - real therapeutic classification
        would require NME/therapeutic class data
        """
        print("\n📊 Analyzing therapeutic areas...")

        # Simplified analysis based on submission types
        therapeutic_areas = {}

        # Identify NMEs (New Molecular Entities)
        nme_df = df[df['is_nme'] == True] if 'is_nme' in df.columns else df

        if not nme_df.empty:
            yearly = nme_df['year'].value_counts().sort_index()

            # Identify golden age periods (high activity)
            mean = yearly.mean()
            std = yearly.std()
            threshold = mean + std

            golden_years = yearly[yearly > threshold].index.tolist()

            if golden_years:
                # Group consecutive years
                periods = []
                current_period = [golden_years[0]]

                for year in golden_years[1:]:
                    if year == current_period[-1] + 1:
                        current_period.append(year)
                    else:
                        if len(current_period) >= 3:
                            periods.append(current_period)
                        current_period = [year]

                if len(current_period) >= 3:
                    periods.append(current_period)

                # Create therapeutic area records
                for i, period in enumerate(periods):
                    start, end = period[0], period[-1]
                    period_df = nme_df[nme_df['year'].between(start, end)]

                    therapeutic_areas[f"high_activity_period_{i+1}"] = {
                        'period': f"{start}-{end}",
                        'start_year': int(start),
                        'end_year': int(end),
                        'total_drugs': int(len(period_df)),
                        'avg_per_year': float(len(period_df) / len(period)),
                        'peak_year': int(period_df['year'].value_counts().idxmax())
                    }

                print(f"   Identified {len(therapeutic_areas)} high-activity periods")

        return therapeutic_areas

    def _analyze_by_decade(self, fda_df: pd.DataFrame) -> Dict:
        """Analyze FDA drug approvals by decade"""

        print("\n📊 Analyzing by decade...")

        decades = {}

        if fda_df.empty:
            return decades

        # Get all years
        all_years = fda_df['year'].dropna().tolist()

        if not all_years:
            return decades

        # Group by decade
        decade_data = {}
        for year in all_years:
            decade = (int(year) // 10) * 10
            if decade not in decade_data:
                decade_data[decade] = {'fda_drugs': 0}

        # Count FDA drugs by decade
        for year in fda_df['year'].dropna():
            decade = (int(year) // 10) * 10
            decade_data[decade]['fda_drugs'] += 1

        # Format for output
        for decade in sorted(decade_data.keys()):
            decades[f"{decade}s"] = decade_data[decade]

        return decades

    def _print_summary(self, results: Dict):
        """Print summary of industry analysis"""

        print("\n" + "="*70)
        print("INDUSTRY ANALYSIS SUMMARY")
        print("="*70)

        # Industry totals
        print("\nInnovation Totals by Industry:")
        for industry_id, data in results['industries'].items():
            print(f"  {data['category_name']:25s}: {data['total']:,} "
                  f"({data['date_range'][0]}-{data['date_range'][1]})")

        # Trends
        print("\nIndustry Trends:")
        for industry_id, data in results['industries'].items():
            print(f"  {data['category_name']:25s}: {data['trend'].upper()} "
                  f"(avg: {data['avg_per_year']:.1f}/year)")

        # Peak years
        print("\nPeak Years:")
        for industry_id, data in results['industries'].items():
            print(f"  {data['category_name']:25s}: {data['peak_year']} "
                  f"({data['peak_count']} innovations)")

        # Therapeutic areas
        if results['therapeutic_areas']:
            print(f"\nHigh-Activity Periods (Drugs): {len(results['therapeutic_areas'])}")
            for area_id, area_data in results['therapeutic_areas'].items():
                print(f"  {area_data['period']:12s}: {area_data['total_drugs']} drugs")

        # Decade breakdown
        print("\nMost Innovative Decades:")
        decade_totals = {}
        for decade, counts in results['decade_breakdown'].items():
            total = sum(counts.values())
            decade_totals[decade] = total

        top_decades = sorted(decade_totals.items(), key=lambda x: x[1], reverse=True)[:5]
        for decade, total in top_decades:
            print(f"  {decade:8s}: {total:,} innovations")

        print("="*70)


def main():
    """Run industry analysis"""
    analyzer = IndustryAnalyzer()
    results = analyzer.analyze()
    return results


if __name__ == '__main__':
    main()
