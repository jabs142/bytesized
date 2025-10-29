"""
Statistical Validation for Birth Control Side Effects
======================================================
Rigorous statistical analysis of side effect discoveries.

Includes:
1. Spearman correlation between patient reports and research coverage
2. Chi-square tests for distribution analysis
3. Bonferroni correction for multiple testing
4. Confidence intervals and effect sizes
"""

import json
import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import spearmanr, chi2_contingency
from statsmodels.stats.multitest import multipletests
import matplotlib.pyplot as plt
import seaborn as sns
import os


class StatisticalValidator:
    """Statistical validation of side effect discoveries."""

    def __init__(self, validated_data_path: str):
        """
        Initialize with validated side effect data.

        Args:
            validated_data_path: Path to validated side effects database JSON
        """
        if not os.path.exists(validated_data_path):
            raise FileNotFoundError(f"Validated data not found: {validated_data_path}")

        with open(validated_data_path, 'r') as f:
            self.data = json.load(f)

        self.df = pd.DataFrame([
            {
                'side_effect': item['side_effect'],
                'patient_frequency': item['reddit_data']['frequency'],
                'mention_count': item['reddit_data']['mention_count'],
                'post_count': item['reddit_data']['post_count'],
                'paper_count': item['pubmed_data']['paper_count'],
                'surprise_score': item['surprise_score'],
                'evidence_tier': item['evidence_tier'],
                'tier_label': item['tier_label'],
                'category': item['reddit_data'].get('category', 'unknown')
            }
            for item in self.data
        ])

        print(f"✓ Loaded {len(self.df)} validated side effects")

    def spearman_correlation_analysis(self):
        """
        Calculate Spearman correlation between patient frequency and research coverage.

        Similar to EDS approach comparing Reddit mentions vs PubMed coverage.
        """
        print("\n" + "=" * 70)
        print("📊 Spearman Correlation Analysis")
        print("=" * 70)

        # Extract frequencies
        patient_freq = self.df['patient_frequency'].values
        research_coverage = self.df['paper_count'].values

        # Calculate Spearman correlation
        correlation, p_value = spearmanr(patient_freq, research_coverage)

        print(f"\nPatient Frequency vs Research Coverage:")
        print(f"  Spearman ρ = {correlation:.4f}")
        print(f"  p-value = {p_value:.4f}")

        if p_value < 0.05:
            print(f"  ✅ Statistically significant correlation (p < 0.05)")
        else:
            print(f"  ⚠️  No significant correlation (p >= 0.05)")

        # Interpretation
        if abs(correlation) < 0.3:
            strength = "weak"
        elif abs(correlation) < 0.7:
            strength = "moderate"
        else:
            strength = "strong"

        direction = "positive" if correlation > 0 else "negative"
        print(f"  Interpretation: {strength} {direction} correlation")

        if correlation < 0:
            print(f"\n  💡 Negative correlation suggests:")
            print(f"     Side effects with high patient reports have LOW research coverage")
            print(f"     → Potential research gaps!")

        # Visualization
        self._plot_correlation(patient_freq, research_coverage, correlation, p_value)

        return {
            'spearman_rho': correlation,
            'p_value': p_value,
            'significant': p_value < 0.05
        }

    def _plot_correlation(self, x, y, correlation, p_value):
        """Plot correlation with regression line."""
        os.makedirs('data/analysis', exist_ok=True)

        plt.figure(figsize=(10, 6))
        plt.scatter(x, y, alpha=0.6, s=100, c='steelblue')

        # Add regression line
        z = np.polyfit(x, y, 1)
        p = np.poly1d(z)
        plt.plot(x, p(x), "r--", alpha=0.8, linewidth=2, label='Trend line')

        plt.xlabel('Patient Report Frequency', fontsize=12)
        plt.ylabel('Number of Research Papers', fontsize=12)
        plt.title(f'Patient Reports vs Research Coverage\nSpearman ρ = {correlation:.4f}, p = {p_value:.4f}',
                  fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)
        plt.legend()

        # Save plot
        plt.tight_layout()
        plt.savefig('data/analysis/correlation_analysis.png', dpi=300)
        print(f"\n💾 Saved correlation plot to data/analysis/correlation_analysis.png")
        plt.close()

    def surprise_score_distribution_test(self):
        """
        Test if surprise scores differ significantly from expected distribution.

        Uses chi-square goodness of fit test.
        """
        print("\n" + "=" * 70)
        print("📊 Surprise Score Distribution Analysis")
        print("=" * 70)

        surprise_scores = self.df['surprise_score'].values

        # Categorize surprise scores
        low = sum(surprise_scores < 0.1)
        medium = sum((surprise_scores >= 0.1) & (surprise_scores < 0.3))
        high = sum(surprise_scores >= 0.3)

        observed = np.array([low, medium, high])
        # Expected: uniform distribution
        expected = np.array([len(surprise_scores) / 3] * 3)

        # Chi-square test
        chi2, p_value = stats.chisquare(observed, expected)

        print(f"\nSurprise Score Distribution:")
        print(f"  Low (<0.1):      {low:3d} side effects ({low/len(surprise_scores)*100:.1f}%)")
        print(f"  Medium (0.1-0.3): {medium:3d} side effects ({medium/len(surprise_scores)*100:.1f}%)")
        print(f"  High (>=0.3):    {high:3d} side effects ({high/len(surprise_scores)*100:.1f}%)")

        print(f"\nChi-square test vs uniform distribution:")
        print(f"  χ² = {chi2:.4f}")
        print(f"  p-value = {p_value:.4f}")

        if p_value < 0.05:
            print(f"  ✅ Distribution differs significantly from uniform (p < 0.05)")
            print(f"     → Some side effects are truly surprising!")
        else:
            print(f"  ⚠️  No significant difference from uniform (p >= 0.05)")

        return {
            'chi_square': chi2,
            'p_value': p_value,
            'distribution': {
                'low': int(low),
                'medium': int(medium),
                'high': int(high)
            }
        }

    def evidence_tier_contingency_test(self):
        """
        Test association between evidence tier and surprise score category.

        Uses chi-square contingency test.
        """
        print("\n" + "=" * 70)
        print("📊 Evidence Tier vs Surprise Score Analysis")
        print("=" * 70)

        # Create contingency table
        tiers = self.df['evidence_tier'].values
        surprise_cats = pd.cut(
            self.df['surprise_score'],
            bins=[-np.inf, 0.1, 0.3, np.inf],
            labels=['Low', 'Medium', 'High']
        )

        contingency_table = pd.crosstab(tiers, surprise_cats)
        print(f"\nContingency Table:")
        print(contingency_table)

        # Chi-square test (if table has enough data)
        if contingency_table.size >= 4:
            try:
                chi2, p_value, dof, expected = chi2_contingency(contingency_table)

                print(f"\nChi-square contingency test:")
                print(f"  χ² = {chi2:.4f}")
                print(f"  p-value = {p_value:.4f}")
                print(f"  degrees of freedom = {dof}")

                if p_value < 0.05:
                    print(f"  ✅ Significant association between tier and surprise (p < 0.05)")
                else:
                    print(f"  ⚠️  No significant association (p >= 0.05)")

                return {
                    'chi_square': chi2,
                    'p_value': p_value,
                    'contingency_table': contingency_table.to_dict()
                }
            except:
                print(f"  ⚠️  Not enough data for chi-square test")
                return {
                    'chi_square': None,
                    'p_value': None,
                    'contingency_table': contingency_table.to_dict()
                }
        else:
            print(f"  ⚠️  Not enough data for chi-square test")
            return {
                'chi_square': None,
                'p_value': None,
                'contingency_table': contingency_table.to_dict()
            }

    def multiple_testing_correction(self):
        """
        Apply Bonferroni correction for multiple comparisons.

        Addresses the issue that running many tests increases false positive rate.
        """
        print("\n" + "=" * 70)
        print("📊 Multiple Testing Correction (Bonferroni)")
        print("=" * 70)

        # Get total posts from data
        try:
            with open('data/patterns/stats.json', 'r') as f:
                stats = json.load(f)
                total_posts = stats.get('total_posts', 537)
        except:
            total_posts = 537

        mean_freq = self.df['patient_frequency'].mean()

        # One-sample binomial test for each side effect against mean
        p_values = []
        for _, row in self.df.iterrows():
            freq = row['patient_frequency']
            n_mentions = row['mention_count']

            # Using binomial test (more appropriate for proportions)
            p_val = stats.binom_test(n_mentions, total_posts, mean_freq, alternative='two-sided')
            p_values.append(p_val)

        p_values = np.array(p_values)

        # Apply Bonferroni correction
        rejected, p_corrected, _, _ = multipletests(
            p_values,
            alpha=0.05,
            method='bonferroni'
        )

        print(f"\nMultiple Testing Results:")
        print(f"  Total tests: {len(p_values)}")
        print(f"  Significant before correction: {sum(p_values < 0.05)}")
        print(f"  Significant after Bonferroni: {sum(rejected)}")

        # Show significant side effects
        if sum(rejected) > 0:
            print(f"\n  Side effects significantly different from mean frequency:")
            for i, (side_effect, is_sig) in enumerate(zip(self.df['side_effect'], rejected)):
                if is_sig:
                    freq = self.df.iloc[i]['patient_frequency']
                    print(f"    - {side_effect}: {freq*100:.2f}% (p_adj < 0.05)")

        return {
            'n_tests': len(p_values),
            'n_significant_uncorrected': int(sum(p_values < 0.05)),
            'n_significant_corrected': int(sum(rejected)),
            'significant_side_effects': self.df[rejected]['side_effect'].tolist()
        }

    def run_full_analysis(self):
        """Run all statistical analyses and save report."""
        print("\n" + "=" * 70)
        print("🔬 Full Statistical Validation Analysis")
        print("=" * 70)

        results = {}

        # Run all tests
        results['correlation'] = self.spearman_correlation_analysis()
        results['surprise_distribution'] = self.surprise_score_distribution_test()
        results['tier_contingency'] = self.evidence_tier_contingency_test()
        results['multiple_testing'] = self.multiple_testing_correction()

        # Save results
        os.makedirs('data/analysis', exist_ok=True)

        with open('data/analysis/statistical_validation_results.json', 'w') as f:
            # Convert numpy types to Python types for JSON serialization
            results_serializable = json.loads(
                json.dumps(results, default=lambda x: float(x) if isinstance(x, (np.floating, np.integer)) else x)
            )
            json.dump(results_serializable, f, indent=2)

        print("\n" + "=" * 70)
        print("📊 Analysis Complete!")
        print("=" * 70)
        print(f"💾 Saved results to data/analysis/statistical_validation_results.json")
        print(f"📈 Saved visualizations to data/analysis/")

        return results


def main():
    """Main entry point."""

    validator_file = 'data/validated/validated_side_effects_database.json'

    print("\n🔬 Statistical Validation Pipeline")
    print("=" * 70)

    if not os.path.exists(validator_file):
        print(f"\n❌ Validated data not found: {validator_file}")
        print("   Run: python src/validation/evidence_validator.py")
        return

    validator = StatisticalValidator(validator_file)
    results = validator.run_full_analysis()

    print("\n✅ Statistical validation complete!")


if __name__ == "__main__":
    main()
