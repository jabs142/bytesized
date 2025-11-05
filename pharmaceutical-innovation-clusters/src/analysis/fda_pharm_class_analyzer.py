"""
FDA Pharmacological Class Analyzer
Uses actual FDA pharm_class_epc categories (345+) instead of our 12 broad categories
Provides layman-friendly names and tooltips via PharmClassSimplifier
"""

import pandas as pd
import json
from pathlib import Path
from typing import Dict, List

import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import Config
from analysis.pharm_class_simplifier import PharmClassSimplifier


class FDAPharmClassAnalyzer:
    """Analyzes FDA drug approvals by actual pharmacological class"""

    def __init__(self):
        self.data_dir = Path(Config.DATA_DIR)
        self.raw_dir = self.data_dir / 'raw'
        self.processed_dir = self.data_dir / 'processed'
        self.processed_dir.mkdir(parents=True, exist_ok=True)

        self.simplifier = PharmClassSimplifier()

    def analyze(self) -> Dict:
        """Run complete FDA pharm class analysis"""
        print("\n" + "="*60)
        print("FDA PHARMACOLOGICAL CLASS ANALYSIS")
        print("="*60)

        # Load FDA data
        df = self._load_fda_data()

        if df is None or len(df) == 0:
            print("⚠️  No FDA data found. Please run data collection first.")
            return self._empty_results()

        print(f"✓ Loaded {len(df):,} FDA drug approvals")

        # Count drugs per pharm class
        pharm_class_counts = self._count_by_pharm_class(df)

        print(f"✓ Found {len(pharm_class_counts)} unique pharmacological classes")

        # Get top and bottom 10
        top_10, bottom_10 = self._get_top_and_bottom(pharm_class_counts)

        # Add simplified names and tooltips
        top_10_enriched = self._enrich_with_simplified_info(top_10)
        bottom_10_enriched = self._enrich_with_simplified_info(bottom_10)

        # Compile results
        results = {
            'total_drugs_analyzed': int(len(df)),
            'total_pharm_classes': int(len(pharm_class_counts)),
            'drugs_with_pharm_class': int(df['pharm_class_epc'].notna().sum()),
            'drugs_without_pharm_class': int(df['pharm_class_epc'].isna().sum()),
            'top_10_pharm_classes': top_10_enriched,
            'bottom_10_pharm_classes': bottom_10_enriched,
            'all_pharm_classes': pharm_class_counts,
            'summary': self._generate_summary(df, pharm_class_counts, top_10, bottom_10)
        }

        # Save results
        output_path = self.processed_dir / 'fda_pharm_classes.json'
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)

        print(f"\n✓ Analysis saved to {output_path}")
        self._print_summary(results)

        return results

    def _load_fda_data(self) -> pd.DataFrame:
        """Load FDA drug approval data"""
        fda_file = self.raw_dir / 'fda_drugs_raw.csv'

        if not fda_file.exists():
            return None

        try:
            df = pd.read_csv(fda_file)
            df['approval_date'] = pd.to_datetime(df['approval_date'], errors='coerce')
            df['year'] = df['approval_date'].dt.year
            return df
        except Exception as e:
            print(f"⚠️  Error loading FDA data: {e}")
            return None

    def _count_by_pharm_class(self, df: pd.DataFrame) -> Dict[str, int]:
        """Count drugs per pharmacological class"""
        # Filter to drugs with pharm_class_epc
        df_with_class = df[df['pharm_class_epc'].notna()].copy()

        # Count by pharm_class_epc and convert to regular Python int
        counts = {k: int(v) for k, v in df_with_class['pharm_class_epc'].value_counts().to_dict().items()}

        return counts

    def _get_top_and_bottom(self, pharm_class_counts: Dict[str, int]) -> tuple:
        """Get top 10 and bottom 10 pharm classes"""
        sorted_classes = sorted(
            pharm_class_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )

        top_10 = sorted_classes[:10]
        bottom_10 = sorted_classes[-10:]

        return top_10, bottom_10

    def _enrich_with_simplified_info(self, pharm_class_list: List[tuple]) -> List[Dict]:
        """Add simplified names and tooltips to pharm class data"""
        enriched = []

        for pharm_class, count in pharm_class_list:
            info = self.simplifier.simplify(pharm_class, count)

            enriched.append({
                'technical_name': pharm_class,
                'simple_name': info['simple_name'],
                'display_name': self.simplifier.format_for_display(pharm_class, count),
                'category': info['category'],
                'count': count,
                'description': info['description'],
                'uses': info['uses'],
                'examples': info['examples'],
                'tooltip_html': self.simplifier.format_for_tooltip(pharm_class, count)
            })

        return enriched

    def _generate_summary(
        self,
        df: pd.DataFrame,
        pharm_class_counts: Dict,
        top_10: List[tuple],
        bottom_10: List[tuple]
    ) -> Dict:
        """Generate executive summary"""

        return {
            'total_drugs': int(len(df)),
            'date_range': f"{int(df['year'].min())}-{int(df['year'].max())}",
            'total_pharm_classes': int(len(pharm_class_counts)),
            'most_common_class': {
                'name': top_10[0][0] if top_10 else None,
                'count': int(top_10[0][1]) if top_10 else 0,
                'simplified': self.simplifier.simplify(top_10[0][0])['simple_name'] if top_10 else None
            },
            'least_common_class': {
                'name': bottom_10[0][0] if bottom_10 else None,
                'count': int(bottom_10[0][1]) if bottom_10 else 0,
                'simplified': self.simplifier.simplify(bottom_10[0][0])['simple_name'] if bottom_10 else None
            }
        }

    def _print_summary(self, results: Dict):
        """Print summary to console"""
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)

        summary = results['summary']
        print(f"\nTotal drugs analyzed: {summary['total_drugs']:,}")
        print(f"Date range: {summary['date_range']}")
        print(f"Unique pharmacological classes: {summary['total_pharm_classes']}")

        print(f"\n{'='*60}")
        print("TOP 10 PHARMACOLOGICAL CLASSES (Most Approved)")
        print("="*60)
        for i, item in enumerate(results['top_10_pharm_classes'], 1):
            print(f"{i}. {item['simple_name']} ({item['category']})")
            print(f"   {item['count']:,} drugs | {item['uses']}")
            print(f"   Examples: {item['examples']}")
            print()

        print(f"{'='*60}")
        print("BOTTOM 10 PHARMACOLOGICAL CLASSES (Least Approved)")
        print("="*60)
        # Reverse to show from bottom up
        for i, item in enumerate(reversed(results['bottom_10_pharm_classes']), 1):
            print(f"{i}. {item['simple_name']} ({item['category']})")
            print(f"   {item['count']:,} drugs | {item['uses']}")
            print(f"   Examples: {item['examples']}")
            print()

        print("="*60)

    def _empty_results(self) -> Dict:
        """Return empty results structure"""
        return {
            'total_drugs_analyzed': 0,
            'total_pharm_classes': 0,
            'drugs_with_pharm_class': 0,
            'drugs_without_pharm_class': 0,
            'top_10_pharm_classes': [],
            'bottom_10_pharm_classes': [],
            'all_pharm_classes': {},
            'summary': {}
        }


if __name__ == '__main__':
    analyzer = FDAPharmClassAnalyzer()
    results = analyzer.analyze()
