"""
Run statistical clustering analysis for all three drug type views:
1. All drugs (combined)
2. Innovative drugs only (NDA/BLA)
3. Generic drugs only (ANDA)
"""
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))
from analysis.statistical_clustering import StatisticalAnalyzer

def main():
    """Run all three analyses"""

    print("\n" + "="*80)
    print("THREE-VIEW DRUG ANALYSIS")
    print("="*80)
    print("\nGenerating statistical analyses for:")
    print("  1. All drugs (combined)")
    print("  2. Innovative drugs only (NDA/BLA)")
    print("  3. Generic drugs only (ANDA)")
    print("="*80)

    # Analysis 1: All drugs
    print("\n\n🔵 ANALYSIS 1/3: ALL DRUGS")
    analyzer_all = StatisticalAnalyzer(drug_type_filter='all')
    results_all = analyzer_all.analyze()

    # Analysis 2: Innovative only
    print("\n\n🟢 ANALYSIS 2/3: INNOVATIVE DRUGS ONLY")
    analyzer_innovative = StatisticalAnalyzer(drug_type_filter='innovative')
    results_innovative = analyzer_innovative.analyze()

    # Analysis 3: Generic only
    print("\n\n🟡 ANALYSIS 3/3: GENERIC DRUGS ONLY")
    analyzer_generic = StatisticalAnalyzer(drug_type_filter='generic')
    results_generic = analyzer_generic.analyze()

    # Print comparison summary
    print("\n\n" + "="*80)
    print("COMPARISON SUMMARY")
    print("="*80)

    print("\nPeak Approval Years:")
    print(f"  All drugs:        {results_all['peak_years'].get('fda_drugs', 'N/A')}")
    print(f"  Innovative only:  {results_innovative['peak_years'].get('fda_drugs', 'N/A')}")
    print(f"  Generic only:     {results_generic['peak_years'].get('fda_drugs', 'N/A')}")

    print("\nClustering Detected:")
    all_clustered = results_all['poisson_tests']['fda_drugs']['is_clustered']
    innov_clustered = results_innovative['poisson_tests']['fda_drugs']['is_clustered']
    gen_clustered = results_generic['poisson_tests']['fda_drugs']['is_clustered']
    print(f"  All drugs:        {'✅ CLUSTERED' if all_clustered else '❌ UNIFORM'}")
    print(f"  Innovative only:  {'✅ CLUSTERED' if innov_clustered else '❌ UNIFORM'}")
    print(f"  Generic only:     {'✅ CLUSTERED' if gen_clustered else '❌ UNIFORM'}")

    print("\nCoefficient of Variation:")
    print(f"  All drugs:        {results_all['poisson_tests']['fda_drugs']['coefficient_of_variation']:.2f}")
    print(f"  Innovative only:  {results_innovative['poisson_tests']['fda_drugs']['coefficient_of_variation']:.2f}")
    print(f"  Generic only:     {results_generic['poisson_tests']['fda_drugs']['coefficient_of_variation']:.2f}")

    print("\n" + "="*80)
    print("✅ THREE-VIEW ANALYSIS COMPLETE")
    print("="*80)
    print("\nResults saved to:")
    print(f"  📄 {analyzer_all.output_path}")
    print(f"  📄 {analyzer_innovative.output_path}")
    print(f"  📄 {analyzer_generic.output_path}")
    print()

if __name__ == '__main__':
    main()
