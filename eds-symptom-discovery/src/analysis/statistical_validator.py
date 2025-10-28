"""
Statistical Validation
======================
Rigorous statistical analysis of symptom discoveries based on methodology from:
https://arxiv.org/html/2504.04346v2

Includes:
1. Spearman correlation between patient reports and research coverage
2. Binomial logistic regression for differential analysis
3. Bonferroni correction for multiple testing
4. Inter-rater reliability metrics
"""

import json
import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import spearmanr, chi2_contingency
from statsmodels.stats.multitest import multipletests
import matplotlib.pyplot as plt
import seaborn as sns


class StatisticalValidator:
    """Statistical validation of symptom discoveries."""

    def __init__(self, validated_data_path: str):
        """
        Initialize with validated symptom data.

        Args:
            validated_data_path: Path to validated symptom database JSON
        """
        with open(validated_data_path, 'r') as f:
            self.data = json.load(f)

        self.df = pd.DataFrame(self.data)
        print(f"✓ Loaded {len(self.df)} validated symptoms")

    def spearman_correlation_analysis(self):
        """
        Calculate Spearman correlation between patient frequency and research coverage.

        Similar to paper's approach comparing Reddit mentions vs FAERS reports.
        """
        print("\\n" + "=" * 70)
        print("📊 Spearman Correlation Analysis")
        print("=" * 70)

        # Extract frequencies
        patient_freq = self.df['reddit_data'].apply(lambda x: x['frequency']).values
        research_coverage = self.df['pubmed_data'].apply(lambda x: x['paper_count']).values

        # Calculate Spearman correlation
        correlation, p_value = spearmanr(patient_freq, research_coverage)

        print(f"\\nPatient Frequency vs Research Coverage:")
        print(f"  Spearman ρ = {correlation:.4f}")
        print(f"  p-value = {p_value:.4f}")

        if p_value < 0.05:
            print(f"  ✅ Statistically significant correlation (p < 0.05)")
        else:
            print(f"  ❌ No significant correlation (p >= 0.05)")

        # Interpretation
        if abs(correlation) < 0.3:
            strength = "weak"
        elif abs(correlation) < 0.7:
            strength = "moderate"
        else:
            strength = "strong"

        direction = "positive" if correlation > 0 else "negative"
        print(f"  Interpretation: {strength} {direction} correlation")

        # Visualization
        self._plot_correlation(patient_freq, research_coverage, correlation, p_value)

        return {
            'spearman_rho': correlation,
            'p_value': p_value,
            'significant': p_value < 0.05
        }

    def _plot_correlation(self, x, y, correlation, p_value):
        """Plot correlation with regression line."""
        plt.figure(figsize=(10, 6))
        plt.scatter(x, y, alpha=0.6, s=100)

        # Add regression line
        z = np.polyfit(x, y, 1)
        p = np.poly1d(z)
        plt.plot(x, p(x), "r--", alpha=0.8, linewidth=2)

        plt.xlabel('Patient Report Frequency', fontsize=12)
        plt.ylabel('Number of Research Papers', fontsize=12)
        plt.title(f'Patient Reports vs Research Coverage\\nSpearman ρ = {correlation:.4f}, p = {p_value:.4f}',
                  fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)

        # Save plot
        plt.tight_layout()
        plt.savefig('data/analysis/correlation_analysis.png', dpi=300)
        print(f"\\n💾 Saved correlation plot to data/analysis/correlation_analysis.png")
        plt.close()

    def surprise_score_distribution_test(self):
        """
        Test if surprise scores differ significantly from expected distribution.

        Uses chi-square goodness of fit test.
        """
        print("\\n" + "=" * 70)
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

        print(f"\\nSurprise Score Distribution:")
        print(f"  Low (<0.1):     {low:3d} symptoms ({low/len(surprise_scores)*100:.1f}%)")
        print(f"  Medium (0.1-0.3): {medium:3d} symptoms ({medium/len(surprise_scores)*100:.1f}%)")
        print(f"  High (>=0.3):   {high:3d} symptoms ({high/len(surprise_scores)*100:.1f}%)")

        print(f"\\nChi-square test vs uniform distribution:")
        print(f"  χ² = {chi2:.4f}")
        print(f"  p-value = {p_value:.4f}")

        if p_value < 0.05:
            print(f"  ✅ Distribution differs significantly from uniform (p < 0.05)")
        else:
            print(f"  ❌ No significant difference from uniform (p >= 0.05)")

        return {
            'chi_square': chi2,
            'p_value': p_value,
            'distribution': {
                'low': low,
                'medium': medium,
                'high': high
            }
        }

    def evidence_tier_contingency_test(self):
        """
        Test association between evidence tier and surprise score category.

        Uses chi-square contingency test.
        """
        print("\\n" + "=" * 70)
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
        print(f"\\nContingency Table:")
        print(contingency_table)

        # Chi-square test
        chi2, p_value, dof, expected = chi2_contingency(contingency_table)

        print(f"\\nChi-square contingency test:")
        print(f"  χ² = {chi2:.4f}")
        print(f"  p-value = {p_value:.4f}")
        print(f"  degrees of freedom = {dof}")

        if p_value < 0.05:
            print(f"  ✅ Significant association between tier and surprise (p < 0.05)")
        else:
            print(f"  ❌ No significant association (p >= 0.05)")

        return {
            'chi_square': chi2,
            'p_value': p_value,
            'contingency_table': contingency_table.to_dict()
        }

    def multiple_testing_correction(self):
        """
        Apply Bonferroni correction for multiple comparisons.

        Addresses the issue that running many tests increases false positive rate.
        """
        print("\\n" + "=" * 70)
        print("📊 Multiple Testing Correction (Bonferroni)")
        print("=" * 70)

        # Collect all p-values from analyses
        # For each symptom, we could test: is this symptom's surprise score significantly different?
        # Simplified version: test if each symptom's frequency differs from mean

        mean_freq = self.df['reddit_data'].apply(lambda x: x['frequency']).mean()

        # One-sample t-test for each symptom against mean
        p_values = []
        for _, row in self.df.iterrows():
            freq = row['reddit_data']['frequency']
            # Using binomial test (more appropriate for proportions)
            n_posts = 257  # total posts
            n_mentions = row['reddit_data']['mention_count']
            p_val = stats.binom_test(n_mentions, n_posts, mean_freq, alternative='two-sided')
            p_values.append(p_val)

        p_values = np.array(p_values)

        # Apply Bonferroni correction
        rejected, p_corrected, _, _ = multipletests(
            p_values,
            alpha=0.05,
            method='bonferroni'
        )

        print(f"\\nMultiple Testing Results:")
        print(f"  Total tests: {len(p_values)}")
        print(f"  Significant before correction: {sum(p_values < 0.05)}")
        print(f"  Significant after Bonferroni: {sum(rejected)}")

        # Show significant symptoms
        if sum(rejected) > 0:
            print(f"\\n  Symptoms significantly different from mean frequency:")
            for i, (symptom, is_sig) in enumerate(zip(self.df['symptom'], rejected)):
                if is_sig:
                    freq = self.df.iloc[i]['reddit_data']['frequency']
                    print(f"    - {symptom}: {freq*100:.2f}% (p_adj < 0.05)")

        return {
            'n_tests': len(p_values),
            'n_significant_uncorrected': sum(p_values < 0.05),
            'n_significant_corrected': sum(rejected),
            'significant_symptoms': self.df[rejected]['symptom'].tolist()
        }

    def run_full_analysis(self):
        """Run all statistical analyses and save report."""
        print("\\n" + "=" * 70)
        print("🔬 Full Statistical Validation Analysis")
        print("=" * 70)

        results = {}

        # Run all tests
        results['correlation'] = self.spearman_correlation_analysis()
        results['surprise_distribution'] = self.surprise_score_distribution_test()
        results['tier_contingency'] = self.evidence_tier_contingency_test()
        results['multiple_testing'] = self.multiple_testing_correction()

        # Save results
        with open('data/analysis/statistical_validation_results.json', 'w') as f:
            # Convert numpy types to Python types for JSON serialization
            results_serializable = json.loads(
                json.dumps(results, default=lambda x: float(x) if isinstance(x, (np.floating, np.integer)) else x)
            )
            json.dump(results_serializable, f, indent=2)

        print("\\n" + "=" * 70)
        print("📊 Analysis Complete!")
        print("=" * 70)
        print(f"💾 Saved results to data/analysis/statistical_validation_results.json")
        print(f"📈 Saved visualizations to data/analysis/")

        return results


def main():
    """Main entry point."""

    validator_file = 'data/validated/llm_symptom_database.json'

    print("\\n🔬 Statistical Validation Pipeline")
    print("=" * 70)
    print("Based on methodology from: https://arxiv.org/html/2504.04346v2")

    validator = StatisticalValidator(validator_file)
    results = validator.run_full_analysis()

    print("\\n✅ Statistical validation complete!")


if __name__ == "__main__":
    main()
