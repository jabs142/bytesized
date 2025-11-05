"""
Statistical Clustering Analysis

Tests if innovations are randomly distributed or clustered
using Poisson test and sliding window analysis
"""
import pandas as pd
import numpy as np
import json
from pathlib import Path
from scipy import stats
from typing import Dict, List, Tuple
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class StatisticalAnalyzer:
    """Analyzes temporal clustering using statistical methods"""

    def __init__(self):
        self.fda_path = Config.RAW_DATA_DIR / 'fda_drugs_raw.csv'
        self.output_path = Config.PROCESSED_DATA_DIR / 'statistical_results.json'

    def analyze(self) -> Dict:
        """
        Run complete statistical analysis on FDA drug approvals

        Returns:
            Dictionary with statistical test results
        """
        print("\n" + "="*70)
        print("STATISTICAL CLUSTERING ANALYSIS - FDA DRUG APPROVALS")
        print("="*70)

        # Load FDA data
        fda_df = self._load_fda_data()

        # Run Poisson test
        poisson_results = self._run_poisson_tests(fda_df)

        # Run sliding window analysis
        cluster_windows = self._sliding_window_analysis(fda_df)

        # Identify peak years
        peak_years = self._identify_peak_years(fda_df)

        # Compile results
        results = {
            'poisson_tests': poisson_results,
            'significant_clusters': cluster_windows,
            'peak_years': peak_years,
            'metadata': {
                'analysis_date': pd.Timestamp.now().isoformat(),
                'sliding_window_size': Config.SLIDING_WINDOW_SIZE,
                'threshold_sigma': Config.CLUSTERING_THRESHOLD_SIGMA
            }
        }

        # Save results
        with open(self.output_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)

        print(f"\n✅ Statistical analysis complete. Results saved to {self.output_path}")

        # Print summary
        self._print_summary(results)

        return results

    def _load_fda_data(self) -> pd.DataFrame:
        """Load FDA data"""
        if not self.fda_path.exists():
            print("⚠️  FDA data not found")
            return pd.DataFrame()

        df = pd.read_csv(self.fda_path)
        df['approval_date'] = pd.to_datetime(df['approval_date'], errors='coerce')
        df['year'] = df['approval_date'].dt.year
        return df

    def _run_poisson_tests(self, fda_df: pd.DataFrame) -> Dict:
        """
        Test if drug approvals follow random (Poisson) distribution

        Returns:
            Dictionary with test results
        """
        print("\n📊 Running Poisson test...")

        results = {}

        # Test FDA drugs
        if not fda_df.empty:
            results['fda_drugs'] = self._poisson_test(fda_df, 'FDA Drugs')

        return results

    def _poisson_test(self, df: pd.DataFrame, category_name: str) -> Dict:
        """
        Test if innovations show clustering patterns

        Uses coefficient of variation and variance-to-mean ratio
        to detect non-random clustering patterns
        """
        # Count innovations per year
        yearly_counts = df['year'].value_counts().sort_index()

        # Calculate observed frequencies
        observed = yearly_counts.values
        mean_rate = observed.mean()
        std_rate = observed.std()

        # Coefficient of Variation (CV)
        # CV > 1.0 suggests high variability/clustering
        # CV < 1.0 suggests more uniform distribution
        cv = std_rate / mean_rate if mean_rate > 0 else 0

        # Variance-to-Mean Ratio (Index of Dispersion)
        # For Poisson (random): variance = mean, so ratio = 1
        # Ratio > 1: overdispersed (clustered)
        # Ratio < 1: underdispersed (uniform)
        variance = observed.var()
        vmr = variance / mean_rate if mean_rate > 0 else 0

        # Calculate confidence score based on both metrics
        # High CV and high VMR → strong clustering evidence
        clustering_score = min(cv + (vmr - 1), 2.0) / 2.0  # Normalize to 0-1
        confidence = max(0.0, min(1.0, clustering_score))

        # Interpretation
        is_clustered = cv > 0.7  # Threshold for significant clustering
        interpretation = "Clustered" if is_clustered else "Relatively uniform"

        print(f"   {category_name}: CV={cv:.2f}, VMR={vmr:.2f} → {interpretation}")

        return {
            'coefficient_of_variation': float(cv),
            'variance_to_mean_ratio': float(vmr),
            'is_random': not is_clustered,
            'is_clustered': is_clustered,
            'interpretation': interpretation,
            'mean_rate': float(mean_rate),
            'std_rate': float(std_rate),
            'confidence': float(confidence),
            'confidence_percent': f"{confidence * 100:.0f}%"
        }

    def _sliding_window_analysis(
        self,
        fda_df: pd.DataFrame
    ) -> List[Dict]:
        """
        Sliding window analysis to identify cluster periods

        Uses 5-year windows, marks periods >2σ above mean
        """
        print("\n📊 Running sliding window analysis...")

        all_clusters = []

        # Analyze FDA drugs
        if not fda_df.empty:
            clusters = self._sliding_window_category(fda_df, 'fda_drugs', 'FDA Drugs')
            all_clusters.extend(clusters)

        print(f"   Found {len(all_clusters)} significant cluster windows")

        return all_clusters

    def _sliding_window_category(
        self,
        df: pd.DataFrame,
        category_id: str,
        category_name: str
    ) -> List[Dict]:
        """Run sliding window for one category"""

        yearly_counts = df['year'].value_counts().sort_index()
        years = sorted(yearly_counts.index)

        if len(years) < Config.SLIDING_WINDOW_SIZE:
            return []

        window_size = Config.SLIDING_WINDOW_SIZE

        # Calculate window densities
        windows = []
        for i in range(len(years) - window_size + 1):
            window_years = years[i:i + window_size]
            window_count = sum(yearly_counts.get(year, 0) for year in window_years)
            density = window_count / window_size

            windows.append({
                'start_year': window_years[0],
                'end_year': window_years[-1],
                'density': density,
                'total_count': window_count
            })

        # Calculate threshold
        densities = [w['density'] for w in windows]
        mean = np.mean(densities)
        std = np.std(densities)
        threshold = mean + (Config.CLUSTERING_THRESHOLD_SIGMA * std)

        # Find significant windows
        clusters = []
        for window in windows:
            if window['density'] > threshold:
                sigma_above = (window['density'] - mean) / std

                clusters.append({
                    'category': category_id,
                    'category_name': category_name,
                    'period': f"{window['start_year']}-{window['end_year']}",
                    'start_year': int(window['start_year']),
                    'end_year': int(window['end_year']),
                    'avg_per_year': float(window['density']),
                    'total_count': int(window['total_count']),
                    'sigma_above_mean': float(sigma_above)
                })

        return clusters

    def _identify_peak_years(
        self,
        fda_df: pd.DataFrame
    ) -> Dict:
        """Identify peak drug approval year"""

        peak_years = {}

        # FDA drugs
        if not fda_df.empty:
            fda_yearly = fda_df['year'].value_counts()
            peak_years['fda_drugs'] = int(fda_yearly.idxmax())

        return peak_years

    def _print_summary(self, results: Dict):
        """Print summary of statistical analysis"""

        print("\n" + "="*70)
        print("STATISTICAL ANALYSIS SUMMARY")
        print("="*70)

        # Clustering test results
        print("\nClustering Analysis Results:")
        for category, result in results['poisson_tests'].items():
            status = "✅ CLUSTERED" if result['is_clustered'] else "❌ UNIFORM"
            cv = result['coefficient_of_variation']
            conf = result['confidence_percent']
            print(f"  {category:20s}: {status} (CV={cv:.2f}, confidence={conf})")

        # Significant clusters
        print(f"\nSignificant Cluster Periods: {len(results['significant_clusters'])}")
        if results['significant_clusters']:
            top_clusters = sorted(results['significant_clusters'],
                                key=lambda x: x['sigma_above_mean'],
                                reverse=True)[:5]
            print("  Top 5 strongest clusters:")
            for cluster in top_clusters:
                print(f"    {cluster['category_name']:20s} {cluster['period']:12s} "
                      f"({cluster['sigma_above_mean']:.1f}σ above mean)")

        # Peak years
        print("\nPeak Approval Year:")
        for category, year in results['peak_years'].items():
            print(f"  {category:20s}: {year}")

        print("="*70)


def main():
    """Run statistical clustering analysis"""
    analyzer = StatisticalAnalyzer()
    results = analyzer.analyze()
    return results


if __name__ == '__main__':
    main()
