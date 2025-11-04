"""
Master Analysis Runner

Orchestrates all advanced clustering analyses
"""
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))

from analysis.statistical_clustering import StatisticalAnalyzer
from analysis.industry_analyzer import IndustryAnalyzer
from analysis.export_frontend_data import FrontendDataExporter
from visualization.create_visualizations import VizGenerator
from analysis.unique_angles.simultaneous_discovery_analyzer import SimultaneousDiscoveryAnalyzer
from analysis.unique_angles.hype_analyzer import HypeAnalyzer


def generate_summary_report(stat_results, industry_results):
    """Generate markdown summary report"""

    from config import Config
    import pandas as pd

    report_path = Config.REPORTS_DIR / 'complete_analysis_report.md'

    report = []
    report.append("# Innovation Clusters - Complete Analysis Report\n")
    report.append(f"*Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}*\n")
    report.append("---\n\n")

    # Statistical Tests
    report.append("## Statistical Analysis\n\n")
    report.append("### Randomness Tests (Poisson)\n\n")

    for category, result in stat_results['poisson_tests'].items():
        status = "✅ **NOT RANDOM**" if not result['is_random'] else "❌ Random"
        report.append(f"- **{category.replace('_', ' ').title()}**: {status} (p={result['p_value']:.4f})\n")

    report.append(f"\n**Conclusion**: ")
    non_random = sum(1 for r in stat_results['poisson_tests'].values() if not r['is_random'])
    total = len(stat_results['poisson_tests'])
    report.append(f"{non_random}/{total} categories show significant clustering (p<0.05)\n\n")

    # Significant Clusters
    report.append(f"### Significant Cluster Periods\n\n")
    report.append(f"**Total identified**: {len(stat_results['significant_clusters'])}\n\n")

    if stat_results['significant_clusters']:
        report.append("**Top 5 Strongest Clusters**:\n\n")
        top_clusters = sorted(stat_results['significant_clusters'],
                            key=lambda x: x['sigma_above_mean'], reverse=True)[:5]

        for i, cluster in enumerate(top_clusters, 1):
            report.append(f"{i}. **{cluster['category_name']}** ({cluster['period']})\n")
            report.append(f"   - {cluster['total_count']} innovations\n")
            report.append(f"   - {cluster['sigma_above_mean']:.1f}σ above historical mean\n")
            report.append(f"   - Avg: {cluster['avg_per_year']:.1f} per year\n\n")

    # Industry Trends
    report.append("## Industry Analysis\n\n")
    report.append("### Innovation Totals\n\n")
    report.append("| Industry | Total | Date Range | Trend |\n")
    report.append("|----------|-------|------------|-------|\n")

    for industry_id, data in industry_results['industries'].items():
        report.append(f"| {data['category_name']} | {data['total']:,} | "
                     f"{data['date_range'][0]}-{data['date_range'][1]} | "
                     f"{data['trend'].upper()} |\n")

    # Peak Years
    report.append("\n### Peak Innovation Years\n\n")
    for industry_id, data in industry_results['industries'].items():
        report.append(f"- **{data['category_name']}**: {data['peak_year']} "
                     f"({data['peak_count']} innovations)\n")

    # Decade Analysis
    report.append("\n### Most Innovative Decades\n\n")
    decade_totals = {}
    for decade, counts in industry_results['decade_breakdown'].items():
        total = sum(counts.values())
        decade_totals[decade] = total

    report.append("| Decade | Total Innovations |\n")
    report.append("|--------|------------------|\n")

    top_decades = sorted(decade_totals.items(), key=lambda x: x[1], reverse=True)[:10]
    for decade, total in top_decades:
        report.append(f"| {decade} | {total:,} |\n")

    # Correlations
    if stat_results['industry_correlations']:
        report.append("\n## Industry Correlations\n\n")
        report.append("| Comparison | Correlation | Significant? |\n")
        report.append("|------------|-------------|-------------|\n")

        for key, corr_data in stat_results['industry_correlations'].items():
            sig = "✓ Yes" if corr_data['significant'] else "No"
            comparison = key.replace('_', ' ').title()
            report.append(f"| {comparison} | {corr_data['correlation']:.3f} | {sig} |\n")

    # Key Findings
    report.append("\n## Key Findings\n\n")

    findings = []

    # Finding 1: Non-randomness
    non_random_pct = (non_random / total) * 100 if total > 0 else 0
    findings.append(f"1. **Innovation clustering is statistically significant**: "
                   f"{non_random_pct:.0f}% of categories show non-random clustering (p<0.05)")

    # Finding 2: Most innovative decade
    if decade_totals:
        top_decade = max(decade_totals.items(), key=lambda x: x[1])
        findings.append(f"2. **Most innovative decade**: {top_decade[0]} with {top_decade[1]:,} innovations")

    # Finding 3: Strongest cluster
    if stat_results['significant_clusters']:
        strongest = max(stat_results['significant_clusters'], key=lambda x: x['sigma_above_mean'])
        findings.append(f"3. **Strongest cluster period**: {strongest['category_name']} "
                       f"({strongest['period']}) at {strongest['sigma_above_mean']:.1f}σ above mean")

    # Finding 4: Correlation
    if stat_results['industry_correlations']:
        strongest_corr = max(stat_results['industry_correlations'].items(),
                           key=lambda x: abs(x[1]['correlation']))
        findings.append(f"4. **Industry synchronization**: Strongest correlation is "
                       f"{strongest_corr[0].replace('_', ' ')} (r={strongest_corr[1]['correlation']:.2f})")

    for finding in findings:
        report.append(f"{finding}\n\n")

    # Save report
    with open(report_path, 'w') as f:
        f.writelines(report)

    print(f"\n✅ Summary report saved to {report_path}")


def main():
    """Run complete analysis pipeline"""

    print("\n" + "="*70)
    print("INNOVATION CLUSTERS - COMPLETE ANALYSIS")
    print("="*70)

    # Step 1: Statistical clustering
    print("\n[1/7] Running statistical analysis...")
    stat_analyzer = StatisticalAnalyzer()
    stat_results = stat_analyzer.analyze()
    print(f"  ✓ Found {len(stat_results['significant_clusters'])} significant clusters")

    # Step 2: Industry deep-dive
    print("\n[2/7] Analyzing industries...")
    industry_analyzer = IndustryAnalyzer()
    industry_results = industry_analyzer.analyze()
    print(f"  ✓ Analyzed {len(industry_results['industries'])} industries")

    # Step 3: Unique Insights - Simultaneous Discovery
    print("\n[3/7] Analyzing simultaneous discoveries...")
    simultaneous_analyzer = SimultaneousDiscoveryAnalyzer()
    simultaneous_results = simultaneous_analyzer.analyze()
    print(f"  ✓ Found {simultaneous_results['simultaneous_pairs_found']} simultaneous discovery pairs")

    # Step 4: Unique Insights - Hype Analysis
    print("\n[4/7] Analyzing hype cycles...")
    hype_analyzer = HypeAnalyzer()
    hype_results = hype_analyzer.analyze()
    print(f"  ✓ Identified {len(hype_results['hype_cycles'])} major hype cycles")

    # Step 5: Generate visualizations
    print("\n[5/7] Creating visualizations...")
    viz_gen = VizGenerator()
    viz_gen.generate_all()
    print(f"  ✓ Generated timeline and chart data")

    # Step 6: Export frontend data
    print("\n[6/7] Exporting frontend data...")
    frontend_exporter = FrontendDataExporter()
    frontend_exporter.export()
    print(f"  ✓ Frontend JSON data ready")

    # Step 7: Summary report
    print("\n[7/7] Generating summary report...")
    generate_summary_report(stat_results, industry_results)

    # Print key findings
    print("\n" + "="*70)
    print("ANALYSIS COMPLETE!")
    print("="*70)

    print("\n🎯 Key Findings:")

    # Count non-random categories
    non_random = sum(1 for r in stat_results['poisson_tests'].values() if not r['is_random'])
    total = len(stat_results['poisson_tests'])
    print(f"  • {non_random}/{total} categories show significant clustering (p<0.05)")

    # Most innovative decade
    decade_totals = {}
    for decade, counts in industry_results['decade_breakdown'].items():
        total_count = sum(counts.values())
        decade_totals[decade] = total_count

    if decade_totals:
        top_decade = max(decade_totals.items(), key=lambda x: x[1])
        print(f"  • Most innovative decade: {top_decade[0]} ({top_decade[1]:,} innovations)")

    # Strongest cluster
    if stat_results['significant_clusters']:
        strongest = max(stat_results['significant_clusters'], key=lambda x: x['sigma_above_mean'])
        print(f"  • Strongest cluster: {strongest['category_name']} {strongest['period']} "
              f"({strongest['sigma_above_mean']:.1f}σ)")

    # Correlation
    if stat_results['industry_correlations']:
        strongest_corr = max(stat_results['industry_correlations'].items(),
                           key=lambda x: abs(x[1]['correlation']))
        corr_name = strongest_corr[0].replace('_', ' ')
        print(f"  • Strongest correlation: {corr_name} (r={strongest_corr[1]['correlation']:.2f})")

    # Unique Insights
    print(f"\n🔬 Unique Insights:")
    print(f"  • Simultaneous discoveries: {simultaneous_results['simultaneous_pairs_found']} pairs found")
    print(f"  • Simultaneity rate: {simultaneous_results['simultaneity_rate']:.2%}")
    print(f"  • Hype cycles identified: {len(hype_results['hype_cycles'])}")
    if hype_results.get('hype_accuracy', {}).get('summary'):
        accuracy_rate = hype_results['hype_accuracy']['summary']['accuracy_rate']
        print(f"  • Prediction accuracy: {accuracy_rate:.1%}")

    print("\n📊 View results at:")
    print("  innovation-clusters/frontend/index.html")
    print("\n📄 Reports available at:")
    print("  outputs/reports/complete_analysis_report.md")
    print("="*70 + "\n")


if __name__ == '__main__':
    main()
