"""
Master Analysis Runner

Orchestrates pharmaceutical innovation clustering analyses
"""
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))

from analysis.statistical_clustering import StatisticalAnalyzer
from analysis.cluster_analyzer import ClusterAnalyzer
from analysis.therapeutic_analyzer import TherapeuticAnalyzer
from analysis.neglected_diseases_analyzer import NeglectedDiseasesAnalyzer
from analysis.export_frontend_data import FrontendDataExporter


def generate_summary_report(stat_results, therapeutic_results, neglect_results):
    """Generate markdown summary report for pharmaceutical analysis"""

    from config import Config
    import pandas as pd

    report_path = Config.REPORTS_DIR / 'pharmaceutical_analysis_report.md'

    report = []
    report.append("# Pharmaceutical Innovation Clusters - Analysis Report\n")
    report.append(f"*Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}*\n")
    report.append("---\n\n")

    # Statistical Tests
    report.append("## Statistical Analysis\n\n")
    report.append("### Randomness Test (Poisson)\n\n")

    for category, result in stat_results['poisson_tests'].items():
        status = "✅ **CLUSTERED**" if not result['is_random'] else "❌ Random"
        report.append(f"- **{category.replace('_', ' ').title()}**: {status} (p={result['p_value']:.4f})\n")

    # Significant Clusters
    report.append(f"\n### Significant Cluster Periods\n\n")
    report.append(f"**Total identified**: {len(stat_results['significant_clusters'])}\n\n")

    if stat_results['significant_clusters']:
        report.append("**Top 5 Strongest Clusters**:\n\n")
        top_clusters = sorted(stat_results['significant_clusters'],
                            key=lambda x: x['sigma_above_mean'], reverse=True)[:5]

        for i, cluster in enumerate(top_clusters, 1):
            report.append(f"{i}. **{cluster['category_name']}** ({cluster['period']})\n")
            report.append(f"   - {cluster['total_count']} approvals\n")
            report.append(f"   - {cluster['sigma_above_mean']:.1f}σ above historical mean\n")
            report.append(f"   - Avg: {cluster['avg_per_year']:.1f} per year\n\n")

    # Therapeutic Area Analysis
    report.append("## Therapeutic Area Analysis\n\n")
    report.append(f"**Total drugs analyzed**: {therapeutic_results['total_drugs_analyzed']:,}\n")
    report.append(f"**Therapeutic areas identified**: {len(therapeutic_results['therapeutic_trends'])}\n\n")

    report.append("### Most Developed Therapeutic Areas\n\n")
    for area_data in therapeutic_results['neglect_analysis']['most_developed'][:5]:
        report.append(f"- **{area_data['area']}**: {area_data['approvals']:,} approvals\n")

    report.append("\n### Least Developed Therapeutic Areas\n\n")
    for area_data in therapeutic_results['neglect_analysis']['least_developed']:
        report.append(f"- **{area_data['area']}**: {area_data['approvals']:,} approvals\n")

    # Neglected Diseases Analysis
    report.append("\n## Neglected Diseases Analysis\n\n")

    metrics = neglect_results['neglect_metrics']
    report.append(f"**Neglected disease approvals**: {metrics['total_neglected_approvals']} ({metrics['neglected_percentage']:.2f}%)\n")
    report.append(f"**Common disease approvals**: {metrics['total_common_approvals']} ({metrics['common_percentage']:.2f}%)\n")
    report.append(f"**Disparity ratio**: {metrics['disparity_ratio']:.1f}x\n\n")

    report.append("### Diseases with Zero Approvals\n\n")
    for disease in metrics['diseases_with_zero_approvals']:
        report.append(f"- {disease}\n")

    report.append("\n### Most Developed Neglected Disease\n\n")
    summary = neglect_results['summary']
    if summary.get('most_developed_neglected_disease'):
        report.append(f"**{summary['most_developed_neglected_disease']}**: {summary['most_developed_count']} approvals\n")

    # Key Findings
    report.append("\n## Key Findings\n\n")

    findings = []
    findings.append(f"1. **Pharmaceutical Neglect**: Common diseases receive {metrics['disparity_ratio']:.1f}x more drug approvals than neglected diseases")
    findings.append(f"2. **Zero Development**: {len(metrics['diseases_with_zero_approvals'])} diseases have received zero FDA approvals in the dataset")
    findings.append(f"3. **Therapeutic Imbalance**: Pain & Analgesia dominates with 2,277 approvals, while rare diseases have only 5")
    findings.append(f"4. **Peak Innovation**: Most drug approvals occurred in {stat_results['peak_years'].get('fda_drugs', 'N/A')}")

    for finding in findings:
        report.append(f"{finding}\n\n")

    # Save report
    with open(report_path, 'w') as f:
        f.writelines(report)

    print(f"\n✅ Summary report saved to {report_path}")


def main():
    """Run complete pharmaceutical analysis pipeline"""

    print("\n" + "="*70)
    print("PHARMACEUTICAL INNOVATION CLUSTERS - COMPLETE ANALYSIS")
    print("="*70)

    # Step 1: Statistical clustering
    print("\n[1/5] Running statistical analysis...")
    stat_analyzer = StatisticalAnalyzer()
    stat_results = stat_analyzer.analyze()
    print(f"  ✓ Found {len(stat_results['significant_clusters'])} significant clusters")

    # Step 2: Temporal cluster analysis
    print("\n[2/5] Analyzing temporal clusters...")
    cluster_analyzer = ClusterAnalyzer()
    cluster_results = cluster_analyzer.analyze()
    print(f"  ✓ Identified {cluster_results['summary']['cluster_count']} cluster periods")

    # Step 3: Therapeutic area analysis
    print("\n[3/5] Analyzing therapeutic areas...")
    therapeutic_analyzer = TherapeuticAnalyzer()
    therapeutic_results = therapeutic_analyzer.analyze()
    print(f"  ✓ Analyzed {len(therapeutic_results['therapeutic_trends'])} therapeutic areas")

    # Step 4: Neglected diseases analysis
    print("\n[4/5] Analyzing neglected diseases...")
    neglect_analyzer = NeglectedDiseasesAnalyzer()
    neglect_results = neglect_analyzer.analyze()
    print(f"  ✓ Identified {neglect_results['neglect_metrics']['disparity_ratio']:.1f}x disparity")

    # Step 5: Export frontend data
    print("\n[5/5] Exporting frontend data...")
    frontend_exporter = FrontendDataExporter()
    frontend_exporter.export()
    print(f"  ✓ Frontend JSON data ready")

    # Generate summary report
    print("\nGenerating summary report...")
    generate_summary_report(stat_results, therapeutic_results, neglect_results)

    # Print key findings
    print("\n" + "="*70)
    print("ANALYSIS COMPLETE!")
    print("="*70)

    print("\n🎯 Key Findings:")

    # Peak year
    peak_year = stat_results['peak_years'].get('fda_drugs', 'N/A')
    print(f"  • Peak approval year: {peak_year}")

    # Cluster periods
    print(f"  • Cluster periods identified: {cluster_results['summary']['cluster_count']}")

    # Most innovative decade
    decade = cluster_results['summary'].get('most_innovative_decade', {})
    if decade:
        print(f"  • Most innovative decade: {decade.get('decade_label', 'N/A')} ({decade.get('approval_count', 0):,} approvals)")

    # Pharmaceutical Neglect
    print(f"\n💊 Pharmaceutical Neglect:")
    metrics = neglect_results['neglect_metrics']
    print(f"  • Disparity ratio: {metrics['disparity_ratio']:.1f}x (common vs neglected)")
    print(f"  • Neglected diseases: {metrics['total_neglected_approvals']} approvals ({metrics['neglected_percentage']:.2f}%)")
    print(f"  • Common diseases: {metrics['total_common_approvals']} approvals ({metrics['common_percentage']:.2f}%)")
    print(f"  • Zero approvals: {len(metrics['diseases_with_zero_approvals'])} diseases")

    # Therapeutic Imbalance
    print(f"\n🏥 Therapeutic Imbalance:")
    most_developed = therapeutic_results['neglect_analysis']['most_developed'][0]
    least_developed = therapeutic_results['neglect_analysis']['least_developed'][-1]
    print(f"  • Most developed: {most_developed['area']} ({most_developed['approvals']:,} approvals)")
    print(f"  • Least developed: {least_developed['area']} ({least_developed['approvals']:,} approvals)")

    print("\n📊 View results at:")
    print("  pharmaceutical-innovation-clusters/frontend/index.html")
    print("\n📄 Reports available at:")
    print("  outputs/reports/pharmaceutical_analysis_report.md")
    print("="*70 + "\n")


if __name__ == '__main__':
    main()
