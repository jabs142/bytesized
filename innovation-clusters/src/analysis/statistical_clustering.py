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
        self.patent_path = Config.RAW_DATA_DIR / 'patents_raw.json'
        self.output_path = Config.PROCESSED_DATA_DIR / 'statistical_results.json'

    def analyze(self) -> Dict:
        """
        Run complete statistical analysis

        Returns:
            Dictionary with statistical test results
        """
        print("\n" + "="*70)
        print("STATISTICAL CLUSTERING ANALYSIS")
        print("="*70)

        # Load data
        fda_df = self._load_fda_data()
        patent_df = self._load_patent_data()

        # Run Poisson tests
        poisson_results = self._run_poisson_tests(fda_df, patent_df)

        # Run sliding window analysis
        cluster_windows = self._sliding_window_analysis(fda_df, patent_df)

        # Calculate correlations
        correlations = self._calculate_correlations(fda_df, patent_df)

        # Identify peak years
        peak_years = self._identify_peak_years(fda_df, patent_df)

        # Compile results
        results = {
            'poisson_tests': poisson_results,
            'significant_clusters': cluster_windows,
            'peak_years': peak_years,
            'industry_correlations': correlations,
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

    def _load_patent_data(self) -> pd.DataFrame:
        """Load patent data"""
        if not self.patent_path.exists():
            print("⚠️  Patent data not found")
            return pd.DataFrame()

        with open(self.patent_path, 'r') as f:
            patents = json.load(f)

        df = pd.DataFrame(patents)
        df['patent_date'] = pd.to_datetime(df['patent_date'], errors='coerce')
        df['year'] = df['patent_date'].dt.year
        return df

    def _run_poisson_tests(self, fda_df: pd.DataFrame, patent_df: pd.DataFrame) -> Dict:
        """
        Test if innovations follow random (Poisson) distribution

        Returns:
            Dictionary with test results for each category
        """
        print("\n📊 Running Poisson tests...")

        results = {}

        # Test FDA drugs
        if not fda_df.empty:
            results['fda_drugs'] = self._poisson_test(fda_df, 'FDA Drugs')

        # Test each patent category
        if not patent_df.empty:
            for category in patent_df['technology_category'].unique():
                cat_df = patent_df[patent_df['technology_category'] == category]
                results[category.lower().replace(' ', '_')] = self._poisson_test(
                    cat_df,
                    category
                )

        return results

    def _poisson_test(self, df: pd.DataFrame, category_name: str) -> Dict:
        """
        Run Poisson goodness of fit test

        Null hypothesis: innovations are randomly distributed (Poisson)
        """
        # Count innovations per year
        yearly_counts = df['year'].value_counts().sort_index()

        # Calculate observed frequencies
        observed = yearly_counts.values
        mean_rate = observed.mean()

        # Calculate expected Poisson frequencies
        from scipy.stats import poisson
        expected = np.array([poisson.pmf(k, mean_rate) * len(observed)
                            for k in range(int(observed.max()) + 1)])

        # Bin observations to match expected
        observed_binned = np.bincount(observed.astype(int), minlength=len(expected))

        # Chi-square test
        chi_square, p_value = stats.chisquare(
            observed_binned[:len(expected)],
            expected
        )

        # Interpretation
        is_random = p_value >= 0.05
        interpretation = "Random (Poisson)" if is_random else "Clustered (NOT random)"

        print(f"   {category_name}: p={p_value:.4f} → {interpretation}")

        return {
            'p_value': float(p_value),
            'chi_square': float(chi_square),
            'is_random': is_random,
            'interpretation': interpretation,
            'mean_rate': float(mean_rate),
            'confidence': '95%'
        }

    def _sliding_window_analysis(
        self,
        fda_df: pd.DataFrame,
        patent_df: pd.DataFrame
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

        # Analyze each patent category
        if not patent_df.empty:
            for category in patent_df['technology_category'].unique():
                cat_df = patent_df[patent_df['technology_category'] == category]
                clusters = self._sliding_window_category(
                    cat_df,
                    category.lower().replace(' ', '_'),
                    category
                )
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

    def _calculate_correlations(
        self,
        fda_df: pd.DataFrame,
        patent_df: pd.DataFrame
    ) -> Dict:
        """Calculate correlation between different categories"""

        print("\n📊 Calculating industry correlations...")

        if fda_df.empty or patent_df.empty:
            return {}

        correlations = {}

        # Get yearly time series
        fda_yearly = fda_df['year'].value_counts().sort_index()

        # Correlate FDA with each patent category
        for category in patent_df['technology_category'].unique():
            cat_df = patent_df[patent_df['technology_category'] == category]
            cat_yearly = cat_df['year'].value_counts().sort_index()

            # Align years
            all_years = sorted(set(fda_yearly.index) | set(cat_yearly.index))
            fda_series = [fda_yearly.get(year, 0) for year in all_years]
            cat_series = [cat_yearly.get(year, 0) for year in all_years]

            # Calculate correlation
            if len(fda_series) > 2 and len(cat_series) > 2:
                corr, p_value = stats.pearsonr(fda_series, cat_series)

                key = f"fda_vs_{category.lower().replace(' ', '_')}"
                correlations[key] = {
                    'correlation': float(corr),
                    'p_value': float(p_value),
                    'significant': p_value < 0.05
                }

                print(f"   FDA vs {category}: r={corr:.3f} (p={p_value:.4f})")

        return correlations

    def _identify_peak_years(
        self,
        fda_df: pd.DataFrame,
        patent_df: pd.DataFrame
    ) -> Dict:
        """Identify peak innovation year for each category"""

        peak_years = {}

        # FDA drugs
        if not fda_df.empty:
            fda_yearly = fda_df['year'].value_counts()
            peak_years['fda_drugs'] = int(fda_yearly.idxmax())

        # Each patent category
        if not patent_df.empty:
            for category in patent_df['technology_category'].unique():
                cat_df = patent_df[patent_df['technology_category'] == category]
                cat_yearly = cat_df['year'].value_counts()

                if not cat_yearly.empty:
                    peak_years[category.lower().replace(' ', '_')] = int(cat_yearly.idxmax())

        return peak_years

    def _print_summary(self, results: Dict):
        """Print summary of statistical analysis"""

        print("\n" + "="*70)
        print("STATISTICAL ANALYSIS SUMMARY")
        print("="*70)

        # Poisson test results
        print("\nPoisson Test Results (Randomness Test):")
        for category, result in results['poisson_tests'].items():
            status = "✅ CLUSTERED" if not result['is_random'] else "❌ RANDOM"
            print(f"  {category:20s}: {status} (p={result['p_value']:.4f})")

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
        print("\nPeak Innovation Years:")
        for category, year in results['peak_years'].items():
            print(f"  {category:20s}: {year}")

        # Correlations
        if results['industry_correlations']:
            print("\nIndustry Correlations:")
            for key, corr_data in results['industry_correlations'].items():
                sig = "✓" if corr_data['significant'] else " "
                print(f"  {sig} {key:30s}: r={corr_data['correlation']:.3f}")

        print("="*70)


def main():
    """Run statistical clustering analysis"""
    analyzer = StatisticalAnalyzer()
    results = analyzer.analyze()
    return results


if __name__ == '__main__':
    main()
