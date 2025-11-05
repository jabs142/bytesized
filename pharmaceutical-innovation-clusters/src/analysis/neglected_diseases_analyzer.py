"""
Neglected Diseases Analyzer
Quantifies pharmaceutical neglect of Alzheimer's, rare diseases, and other underserved areas
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from typing import Dict, List
import re

import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class NeglectedDiseasesAnalyzer:
    """Analyzes pharmaceutical neglect patterns"""

    def __init__(self):
        self.data_dir = Path(Config.DATA_DIR)
        self.raw_dir = self.data_dir / 'raw'
        self.processed_dir = self.data_dir / 'processed'
        self.unique_angles_dir = self.data_dir / 'unique_angles'
        self.unique_angles_dir.mkdir(parents=True, exist_ok=True)

        # Specific disease categories to track
        self.disease_keywords = {
            'Alzheimer\'s Disease': [
                'alzheimer', 'aducanumab', 'donepezil', 'rivastigmine',
                'galantamine', 'memantine', 'aricept', 'namenda', 'cognex',
                'exelon', 'razadyne'
            ],
            'Parkinson\'s Disease': [
                'parkinson', 'levodopa', 'carbidopa', 'sinemet', 'stalevo',
                'dopamine agonist', 'pramipexole', 'ropinirole'
            ],
            'ALS (Lou Gehrig\'s)': [
                'als ', 'amyotrophic lateral sclerosis', 'lou gehrig',
                'riluzole', 'edaravone', 'radicava'
            ],
            'Huntington\'s Disease': [
                'huntington', 'tetrabenazine', 'xenazine', 'austedo'
            ],
            'Cystic Fibrosis': [
                'cystic fibrosis', 'cf ', 'ivacaftor', 'kalydeco', 'orkambi',
                'symdeko', 'trikafta'
            ],
            'Sickle Cell Disease': [
                'sickle cell', 'hydroxyurea', 'voxelotor', 'crizanlizumab'
            ],
            'Rare Cancers': [
                'rare cancer', 'orphan cancer', 'gist', 'mesothelioma',
                'neuroblastoma', 'retinoblastoma'
            ],
            'Muscular Dystrophy': [
                'muscular dystrophy', 'duchenne', 'becker', 'eteplirsen',
                'golodirsen'
            ]
        }

        # Common/profitable disease comparisons
        self.common_diseases = {
            'Type 2 Diabetes': ['diabetes', 'diabetic', 'metformin', 'insulin', 'glipizide'],
            'Hypertension': ['hypertension', 'blood pressure', 'lisinopril', 'losartan', 'amlodipine'],
            'Depression': ['depression', 'antidepressant', 'ssri', 'prozac', 'zoloft', 'lexapro'],
            'Erectile Dysfunction': ['erectile', 'viagra', 'cialis', 'sildenafil', 'tadalafil']
        }

    def analyze(self) -> Dict:
        """Run complete neglect analysis"""
        print("\n" + "="*60)
        print("NEGLECTED DISEASES ANALYSIS")
        print("="*60)

        # Load FDA data
        df = self._load_fda_data()

        if df is None or len(df) == 0:
            print("⚠️  No FDA data found. Please run data collection first.")
            return self._empty_results()

        print(f"✓ Loaded {len(df):,} FDA drug approvals")

        # Identify drugs for each disease
        neglected_counts = self._count_by_disease(df, self.disease_keywords, 'neglected')
        common_counts = self._count_by_disease(df, self.common_diseases, 'common')

        # Analyze approval timelines
        timelines = self._analyze_timelines(df)

        # Calculate neglect metrics
        neglect_metrics = self._calculate_neglect_metrics(
            neglected_counts,
            common_counts,
            df
        )

        # Identify gaps and opportunities
        gaps = self._identify_gaps(df, timelines)

        # Compile results
        results = {
            'neglected_diseases': neglected_counts,
            'common_diseases': common_counts,
            'timelines': timelines,
            'neglect_metrics': neglect_metrics,
            'gaps_and_opportunities': gaps,
            'summary': self._generate_summary(neglected_counts, common_counts, df)
        }

        # Save results
        output_path = self.unique_angles_dir / 'neglected_diseases.json'
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
            df['decade'] = (df['year'] // 10) * 10
            return df
        except Exception as e:
            print(f"⚠️  Error loading FDA data: {e}")
            return None

    def _count_by_disease(self, df: pd.DataFrame, disease_dict: Dict, category: str) -> Dict:
        """Count approvals for each disease"""
        results = {}

        for disease, keywords in disease_dict.items():
            # Create search text
            df['search_text'] = (
                df['drug_name'].fillna('') + ' ' +
                df['sponsor_name'].fillna('')
            ).str.lower()

            # Find matches
            matches = df[df['search_text'].apply(
                lambda x: any(re.search(r'\b' + re.escape(kw) + r'\b', x, re.IGNORECASE) for kw in keywords)
            )]

            if len(matches) > 0:
                results[disease] = {
                    'total_approvals': len(matches),
                    'first_approval': int(matches['year'].min()),
                    'latest_approval': int(matches['year'].max()),
                    'by_decade': matches.groupby('decade').size().to_dict(),
                    'drugs': matches[['drug_name', 'year', 'sponsor_name']].to_dict('records')[:10],  # Top 10
                    'category': category
                }
            else:
                results[disease] = {
                    'total_approvals': 0,
                    'first_approval': None,
                    'latest_approval': None,
                    'by_decade': {},
                    'drugs': [],
                    'category': category
                }

        return results

    def _analyze_timelines(self, df: pd.DataFrame) -> Dict:
        """Analyze approval timelines for neglected diseases"""
        timelines = {}

        all_diseases = {**self.disease_keywords, **self.common_diseases}

        for disease, keywords in all_diseases.items():
            df['search_text'] = (
                df['drug_name'].fillna('') + ' ' +
                df['sponsor_name'].fillna('')
            ).str.lower()

            matches = df[df['search_text'].apply(
                lambda x: any(re.search(r'\b' + re.escape(kw) + r'\b', x, re.IGNORECASE) for kw in keywords)
            )]

            if len(matches) > 0:
                # Get yearly counts
                yearly = matches.groupby('year').size()

                timelines[disease] = {
                    'years': [int(y) for y in yearly.index.tolist()],
                    'counts': [int(c) for c in yearly.values.tolist()],
                    'total': len(matches)
                }

        return timelines

    def _calculate_neglect_metrics(
        self,
        neglected: Dict,
        common: Dict,
        df: pd.DataFrame
    ) -> Dict:
        """Calculate metrics quantifying neglect"""

        # Total approvals for neglected vs common diseases
        total_neglected = sum(d['total_approvals'] for d in neglected.values())
        total_common = sum(d['total_approvals'] for d in common.values())
        total_all = len(df)

        # Calculate ratios
        neglected_percentage = (total_neglected / total_all) * 100 if total_all > 0 else 0
        common_percentage = (total_common / total_all) * 100 if total_all > 0 else 0

        # Identify completely neglected (0 approvals)
        zero_approvals = [
            disease for disease, data in neglected.items()
            if data['total_approvals'] == 0
        ]

        # Calculate average approvals per disease
        avg_neglected = total_neglected / len(neglected) if len(neglected) > 0 else 0
        avg_common = total_common / len(common) if len(common) > 0 else 0

        return {
            'total_neglected_approvals': total_neglected,
            'total_common_approvals': total_common,
            'neglected_percentage': neglected_percentage,
            'common_percentage': common_percentage,
            'ratio_common_to_neglected': total_common / total_neglected if total_neglected > 0 else float('inf'),
            'diseases_with_zero_approvals': zero_approvals,
            'avg_approvals_per_neglected_disease': avg_neglected,
            'avg_approvals_per_common_disease': avg_common,
            'disparity_ratio': avg_common / avg_neglected if avg_neglected > 0 else float('inf')
        }

    def _identify_gaps(self, df: pd.DataFrame, timelines: Dict) -> List[Dict]:
        """Identify time gaps in disease treatment development"""
        gaps = []

        for disease, timeline in timelines.items():
            if len(timeline['years']) < 2:
                continue

            years = sorted(timeline['years'])

            # Find gaps of 10+ years
            for i in range(len(years) - 1):
                gap_years = years[i+1] - years[i]

                if gap_years >= 10:
                    gaps.append({
                        'disease': disease,
                        'gap_start': years[i],
                        'gap_end': years[i+1],
                        'gap_duration': gap_years,
                        'description': f"{gap_years}-year gap in approvals"
                    })

        # Sort by gap duration
        gaps.sort(key=lambda x: x['gap_duration'], reverse=True)

        return gaps[:20]  # Top 20 longest gaps

    def _generate_summary(self, neglected: Dict, common: Dict, df: pd.DataFrame) -> Dict:
        """Generate executive summary"""
        # Find most and least developed neglected diseases
        neglected_with_drugs = {k: v for k, v in neglected.items() if v['total_approvals'] > 0}

        if neglected_with_drugs:
            most_developed = max(neglected_with_drugs.items(), key=lambda x: x[1]['total_approvals'])
            least_developed = min(neglected_with_drugs.items(), key=lambda x: x[1]['total_approvals'])
        else:
            most_developed = (None, {'total_approvals': 0})
            least_developed = (None, {'total_approvals': 0})

        return {
            'total_drugs_analyzed': len(df),
            'neglected_diseases_tracked': len(neglected),
            'neglected_with_approvals': len(neglected_with_drugs),
            'completely_neglected': len(neglected) - len(neglected_with_drugs),
            'most_developed_neglected_disease': most_developed[0],
            'most_developed_count': most_developed[1]['total_approvals'],
            'least_developed_neglected_disease': least_developed[0],
            'least_developed_count': least_developed[1]['total_approvals']
        }

    def _print_summary(self, results: Dict):
        """Print summary to console"""
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)

        summary = results['summary']
        metrics = results['neglect_metrics']

        print(f"\nTotal drugs analyzed: {summary['total_drugs_analyzed']:,}")
        print(f"Neglected diseases tracked: {summary['neglected_diseases_tracked']}")
        print(f"Completely neglected (0 approvals): {summary['completely_neglected']}")

        print(f"\nNeglected disease approvals: {metrics['total_neglected_approvals']:,} ({metrics['neglected_percentage']:.2f}%)")
        print(f"Common disease approvals: {metrics['total_common_approvals']:,} ({metrics['common_percentage']:.2f}%)")

        if metrics['disparity_ratio'] != float('inf'):
            print(f"\nDisparity ratio: {metrics['disparity_ratio']:.1f}x")
            print(f"  (Common diseases get {metrics['disparity_ratio']:.1f}x more approvals on average)")

        if summary['most_developed_neglected_disease']:
            print(f"\nMost developed neglected disease: {summary['most_developed_neglected_disease']}")
            print(f"  Approvals: {summary['most_developed_count']}")

        print("\nDiseases with zero approvals:")
        for disease in metrics['diseases_with_zero_approvals']:
            print(f"  - {disease}")

        print("="*60)

    def _empty_results(self) -> Dict:
        """Return empty results structure"""
        return {
            'neglected_diseases': {},
            'common_diseases': {},
            'timelines': {},
            'neglect_metrics': {},
            'gaps_and_opportunities': [],
            'summary': {}
        }


if __name__ == '__main__':
    analyzer = NeglectedDiseasesAnalyzer()
    results = analyzer.analyze()
