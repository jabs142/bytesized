"""
Initial Exploration Script

Generates visualizations and findings report for temporal clustering analysis
"""
import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import sys

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))
from config import Config

# Set style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")


class ClusteringExplorer:
    """Explores and visualizes temporal clustering patterns"""

    def __init__(self):
        self.fda_path = Config.RAW_DATA_DIR / 'fda_drugs_raw.csv'
        self.patent_path = Config.RAW_DATA_DIR / 'patents_raw.json'
        self.clusters_path = Config.PROCESSED_DATA_DIR / 'innovation_clusters.json'
        self.report_path = Config.REPORTS_DIR / 'findings_report.md'

    def explore(self):
        """Run complete exploration and generate report"""

        print("\n" + "="*70)
        print("TEMPORAL CLUSTERING EXPLORATION")
        print("="*70)

        # Load data
        fda_df = self._load_fda_data()
        patent_df = self._load_patent_data()
        clusters = self._load_clusters()

        # Generate visualizations
        self._plot_drugs_by_year(fda_df)
        self._plot_patents_by_category(patent_df)
        self._plot_combined_timeline(fda_df, patent_df, clusters)
        self._plot_decade_comparison(fda_df, patent_df)

        # Generate findings report
        self._generate_report(fda_df, patent_df, clusters)

        print("\n✅ Exploration complete!")
        print(f"📊 Visualizations saved to {Config.VIZ_DIR}")
        print(f"📄 Report saved to {self.report_path}")

    def _load_fda_data(self) -> pd.DataFrame:
        """Load FDA data"""
        if not self.fda_path.exists():
            print("⚠️  FDA data not found. Run data collectors first.")
            return pd.DataFrame()

        df = pd.read_csv(self.fda_path)
        df['approval_date'] = pd.to_datetime(df['approval_date'], errors='coerce')
        df['year'] = df['approval_date'].dt.year
        return df

    def _load_patent_data(self) -> pd.DataFrame:
        """Load patent data"""
        if not self.patent_path.exists():
            print("⚠️  Patent data not found. Run data collectors first.")
            return pd.DataFrame()

        with open(self.patent_path, 'r') as f:
            patents = json.load(f)

        df = pd.DataFrame(patents)
        df['patent_date'] = pd.to_datetime(df['patent_date'], errors='coerce')
        df['year'] = df['patent_date'].dt.year
        return df

    def _load_clusters(self) -> Dict:
        """Load cluster analysis results"""
        if not self.clusters_path.exists():
            print("⚠️  Cluster analysis not found. Run cluster_analyzer.py first.")
            return {}

        with open(self.clusters_path, 'r') as f:
            return json.load(f)

    def _plot_drugs_by_year(self, df: pd.DataFrame):
        """Plot drugs approved per year"""
        if df.empty:
            return

        print("\n📊 Plotting drug approvals by year...")

        fig, ax = plt.subplots(figsize=(14, 6))

        yearly_counts = df['year'].value_counts().sort_index()

        # Calculate threshold
        mean = yearly_counts.mean()
        std = yearly_counts.std()
        threshold = mean + (Config.CLUSTERING_THRESHOLD_SIGMA * std)

        # Plot
        yearly_counts.plot(kind='bar', ax=ax, color='steelblue', alpha=0.7)

        # Add threshold line
        ax.axhline(y=threshold, color='red', linestyle='--', linewidth=2,
                   label=f'Cluster Threshold ({Config.CLUSTERING_THRESHOLD_SIGMA}σ)')
        ax.axhline(y=mean, color='gray', linestyle=':', linewidth=1, label='Mean')

        ax.set_title('FDA Drug Approvals by Year', fontsize=16, fontweight='bold')
        ax.set_xlabel('Year', fontsize=12)
        ax.set_ylabel('Number of Approvals', fontsize=12)
        ax.legend()
        ax.grid(True, alpha=0.3)

        # Rotate x-axis labels
        plt.xticks(rotation=45, ha='right')

        plt.tight_layout()
        plt.savefig(Config.VIZ_DIR / 'fda_approvals_by_year.png', dpi=300, bbox_inches='tight')
        plt.close()

        print(f"   ✅ Saved to {Config.VIZ_DIR / 'fda_approvals_by_year.png'}")

    def _plot_patents_by_category(self, df: pd.DataFrame):
        """Plot patents filed per year by technology category"""
        if df.empty:
            return

        print("\n📊 Plotting patents by technology category...")

        fig, ax = plt.subplots(figsize=(14, 6))

        # Pivot data
        pivot = df.groupby(['year', 'technology_category']).size().unstack(fill_value=0)

        # Plot stacked area
        pivot.plot(kind='area', ax=ax, alpha=0.7, stacked=True)

        ax.set_title('Breakthrough Patents by Technology Category', fontsize=16, fontweight='bold')
        ax.set_xlabel('Year', fontsize=12)
        ax.set_ylabel('Number of Patents', fontsize=12)
        ax.legend(title='Technology', loc='upper left')
        ax.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(Config.VIZ_DIR / 'patents_by_category.png', dpi=300, bbox_inches='tight')
        plt.close()

        print(f"   ✅ Saved to {Config.VIZ_DIR / 'patents_by_category.png'}")

    def _plot_combined_timeline(self, fda_df: pd.DataFrame, patent_df: pd.DataFrame, clusters: Dict):
        """Plot combined timeline of innovations with clusters highlighted"""
        if fda_df.empty and patent_df.empty:
            return

        print("\n📊 Plotting combined innovation timeline...")

        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(16, 10), sharex=True)

        # FDA plot
        if not fda_df.empty:
            fda_yearly = fda_df['year'].value_counts().sort_index()
            ax1.plot(fda_yearly.index, fda_yearly.values, marker='o', linewidth=2,
                     markersize=4, label='FDA Drug Approvals', color='steelblue')

            # Highlight FDA clusters
            if clusters and 'fda_clusters' in clusters:
                for cluster in clusters['fda_clusters'].get('clusters', []):
                    ax1.axvspan(cluster['start_year'], cluster['end_year'],
                               alpha=0.2, color='yellow', label='_nolegend_')

            ax1.set_title('FDA Drug Approvals Over Time', fontsize=14, fontweight='bold')
            ax1.set_ylabel('Approvals', fontsize=12)
            ax1.legend()
            ax1.grid(True, alpha=0.3)

        # Patent plot
        if not patent_df.empty:
            patent_yearly = patent_df['year'].value_counts().sort_index()
            ax2.plot(patent_yearly.index, patent_yearly.values, marker='s', linewidth=2,
                     markersize=4, label='Breakthrough Patents', color='darkgreen')

            # Highlight patent clusters
            if clusters and 'patent_clusters' in clusters:
                for cluster in clusters['patent_clusters'].get('clusters', []):
                    ax2.axvspan(cluster['start_year'], cluster['end_year'],
                               alpha=0.2, color='orange', label='_nolegend_')

            ax2.set_title('Breakthrough Patents Over Time', fontsize=14, fontweight='bold')
            ax2.set_xlabel('Year', fontsize=12)
            ax2.set_ylabel('Patents', fontsize=12)
            ax2.legend()
            ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(Config.VIZ_DIR / 'combined_timeline.png', dpi=300, bbox_inches='tight')
        plt.close()

        print(f"   ✅ Saved to {Config.VIZ_DIR / 'combined_timeline.png'}")

    def _plot_decade_comparison(self, fda_df: pd.DataFrame, patent_df: pd.DataFrame):
        """Plot innovation counts by decade"""
        print("\n📊 Plotting decade comparison...")

        fig, ax = plt.subplots(figsize=(12, 6))

        # Prepare data
        data = []

        if not fda_df.empty:
            fda_df['decade'] = (fda_df['year'] // 10) * 10
            fda_decades = fda_df['decade'].value_counts().sort_index()
            for decade, count in fda_decades.items():
                data.append({'Decade': f"{decade}s", 'Count': count, 'Type': 'FDA Drugs'})

        if not patent_df.empty:
            patent_df['decade'] = (patent_df['year'] // 10) * 10
            patent_decades = patent_df['decade'].value_counts().sort_index()
            for decade, count in patent_decades.items():
                data.append({'Decade': f"{decade}s", 'Count': count, 'Type': 'Patents'})

        if not data:
            return

        # Plot
        plot_df = pd.DataFrame(data)
        pivot = plot_df.pivot(index='Decade', columns='Type', values='Count').fillna(0)

        pivot.plot(kind='bar', ax=ax, width=0.8, color=['steelblue', 'darkgreen'])

        ax.set_title('Innovations by Decade', fontsize=16, fontweight='bold')
        ax.set_xlabel('Decade', fontsize=12)
        ax.set_ylabel('Innovation Count', fontsize=12)
        ax.legend(title='Innovation Type')
        ax.grid(True, alpha=0.3, axis='y')
        plt.xticks(rotation=45, ha='right')

        plt.tight_layout()
        plt.savefig(Config.VIZ_DIR / 'innovations_by_decade.png', dpi=300, bbox_inches='tight')
        plt.close()

        print(f"   ✅ Saved to {Config.VIZ_DIR / 'innovations_by_decade.png'}")

    def _generate_report(self, fda_df: pd.DataFrame, patent_df: pd.DataFrame, clusters: Dict):
        """Generate findings report"""
        print("\n📝 Generating findings report...")

        report = []
        report.append("# Temporal Clustering of Innovations - Findings Report\n")
        report.append(f"*Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}*\n")
        report.append("---\n\n")

        # Summary statistics
        report.append("## Summary Statistics\n\n")

        if not fda_df.empty:
            report.append(f"**FDA Drug Approvals:**\n")
            report.append(f"- Total approvals: {len(fda_df):,}\n")
            report.append(f"- Date range: {fda_df['year'].min()}-{fda_df['year'].max()}\n")
            report.append(f"- Average per year: {len(fda_df) / (fda_df['year'].max() - fda_df['year'].min()):.1f}\n\n")

        if not patent_df.empty:
            report.append(f"**USPTO Breakthrough Patents:**\n")
            report.append(f"- Total patents: {len(patent_df):,}\n")
            report.append(f"- Date range: {patent_df['year'].min()}-{patent_df['year'].max()}\n")
            report.append(f"- Average per year: {len(patent_df) / (patent_df['year'].max() - patent_df['year'].min()):.1f}\n\n")

        # Cluster periods
        if clusters and 'summary' in clusters:
            summary = clusters['summary']
            report.append("## Identified Cluster Periods\n\n")
            report.append(f"**Total cluster periods identified:** {summary.get('cluster_count', 0)}\n\n")

            if summary.get('most_innovative_decade'):
                decade = summary['most_innovative_decade']
                report.append(f"**Most innovative decade:** {decade['decade_label']} ")
                report.append(f"({decade['innovation_count']:,} innovations)\n\n")

        # Major overlapping clusters
        if clusters and 'major_cluster_periods' in clusters:
            major = clusters['major_cluster_periods']
            if major:
                report.append("### Major Overlapping Cluster Periods\n\n")
                report.append("*Periods where both drug approvals and patents spiked simultaneously*\n\n")

                for i, cluster in enumerate(major[:5], 1):
                    report.append(f"{i}. **{cluster['period']}** (overlap: {cluster['overlap_score']:.0%})\n")

        # Decade analysis
        report.append("\n## Innovation by Decade\n\n")

        if not fda_df.empty or not patent_df.empty:
            # Combine decades
            all_years = []
            if not fda_df.empty:
                all_years.extend(fda_df['year'].tolist())
            if not patent_df.empty:
                all_years.extend(patent_df['year'].tolist())

            decades = {}
            for year in all_years:
                if pd.notna(year):
                    decade = (int(year) // 10) * 10
                    decades[decade] = decades.get(decade, 0) + 1

            report.append("| Decade | Innovation Count |\n")
            report.append("|--------|------------------|\n")

            for decade in sorted(decades.keys()):
                report.append(f"| {decade}s | {decades[decade]:,} |\n")

        # Technology categories
        if not patent_df.empty and 'technology_category' in patent_df.columns:
            report.append("\n## Innovation by Technology Category\n\n")

            category_counts = patent_df['technology_category'].value_counts()

            report.append("| Category | Patent Count |\n")
            report.append("|----------|-------------|\n")

            for category, count in category_counts.items():
                report.append(f"| {category} | {count:,} |\n")

        # Key findings
        report.append("\n## Key Findings\n\n")

        findings = self._identify_key_findings(fda_df, patent_df, clusters)
        for i, finding in enumerate(findings, 1):
            report.append(f"{i}. {finding}\n")

        # Visualizations
        report.append("\n## Visualizations\n\n")
        report.append("See the `outputs/visualizations/` directory for:\n\n")
        report.append("- `fda_approvals_by_year.png` - FDA drug approvals timeline\n")
        report.append("- `patents_by_category.png` - Patent trends by technology category\n")
        report.append("- `combined_timeline.png` - Combined innovation timeline with clusters\n")
        report.append("- `innovations_by_decade.png` - Decade-by-decade comparison\n")

        # Save report
        with open(self.report_path, 'w') as f:
            f.writelines(report)

        print(f"   ✅ Report saved to {self.report_path}")

    def _identify_key_findings(
        self,
        fda_df: pd.DataFrame,
        patent_df: pd.DataFrame,
        clusters: Dict
    ) -> List[str]:
        """Identify key findings from the data"""

        findings = []

        # Find peak years
        if not fda_df.empty:
            peak_fda_year = fda_df['year'].value_counts().idxmax()
            peak_fda_count = fda_df['year'].value_counts().max()
            findings.append(
                f"**Peak FDA approval year:** {peak_fda_year} with {peak_fda_count:,} approvals"
            )

        if not patent_df.empty:
            peak_patent_year = patent_df['year'].value_counts().idxmax()
            peak_patent_count = patent_df['year'].value_counts().max()
            findings.append(
                f"**Peak patent year:** {peak_patent_year} with {peak_patent_count:,} breakthrough patents"
            )

        # Clustering observation
        if clusters and 'summary' in clusters:
            cluster_count = clusters['summary'].get('cluster_count', 0)
            if cluster_count > 0:
                findings.append(
                    f"**Clustering pattern:** Identified {cluster_count} distinct periods of innovation clustering, "
                    f"suggesting innovations tend to occur in waves rather than uniformly over time"
                )

        # Time period with unusual spikes
        if clusters and 'major_cluster_periods' in clusters:
            major = clusters['major_cluster_periods']
            if major:
                top_cluster = major[0]
                findings.append(
                    f"**Most significant cluster:** {top_cluster['period']} showed simultaneous spikes "
                    f"in both drug approvals and patent filings ({top_cluster['overlap_score']:.0%} overlap)"
                )

        return findings


def main():
    """Run exploration"""
    explorer = ClusteringExplorer()
    explorer.explore()


if __name__ == '__main__':
    main()
