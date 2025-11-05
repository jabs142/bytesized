"""
Therapeutic Area Analyzer
Categorizes FDA drug approvals by therapeutic area and analyzes trends
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from typing import Dict, List
from collections import defaultdict
import re

import sys
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class TherapeuticAnalyzer:
    """Analyzes FDA drug approval trends by therapeutic category"""

    def __init__(self):
        self.data_dir = Path(Config.DATA_DIR)
        self.raw_dir = self.data_dir / 'raw'
        self.processed_dir = self.data_dir / 'processed'
        self.processed_dir.mkdir(parents=True, exist_ok=True)

        # Therapeutic area classification keywords
        self.therapeutic_categories = {
            'Cardiovascular': [
                'cardio', 'heart', 'hypertens', 'blood pressure', 'statin',
                'anticoagul', 'beta blocker', 'ace inhibitor', 'arb',
                'cholesterol', 'lipid', 'aspirin', 'warfarin', 'heparin'
            ],
            'Oncology': [
                'cancer', 'oncol', 'tumor', 'carcin', 'leukemia', 'lymphoma',
                'chemotherapy', 'chemo', 'metasta', 'malign', 'neoplasm'
            ],
            'CNS & Neurology': [
                'neuro', 'brain', 'epilep', 'seizure', 'parkinson', 'alzheimer',
                'dementia', 'migraine', 'headache', 'multiple sclerosis', 'ms ',
                'psychiatric', 'mental'
            ],
            'Pain & Analgesia': [
                'pain', 'analges', 'opioid', 'morphine', 'fentanyl', 'codeine',
                'hydrocodone', 'oxycodone', 'tramadol', 'nsaid', 'ibuprofen',
                'acetaminophen', 'aspirin'
            ],
            'Infectious Disease': [
                'antibiotic', 'antibacterial', 'antiviral', 'antifungal',
                'infection', 'bacteria', 'virus', 'hiv', 'hepatitis',
                'influenza', 'flu ', 'pneumonia', 'sepsis', 'penicillin',
                'cephalosporin', 'quinolone'
            ],
            'Diabetes & Endocrine': [
                'diabetes', 'diabetic', 'insulin', 'glucose', 'glycemic',
                'metformin', 'glipiz', 'thyroid', 'hormone', 'endocrine',
                'testosterone', 'estrogen', 'growth hormone'
            ],
            'Respiratory': [
                'respiratory', 'asthma', 'copd', 'bronch', 'lung', 'inhaler',
                'albuterol', 'steroid inhaler', 'pneumonia', 'cough'
            ],
            'Gastrointestinal': [
                'gastro', 'digest', 'stomach', 'intestin', 'bowel', 'colon',
                'ulcer', 'acid reflux', 'gerd', 'crohn', 'colitis', 'ibs',
                'laxative', 'antacid', 'proton pump'
            ],
            'Immunology & Rheumatology': [
                'immune', 'immunosuppress', 'rheumatoid', 'arthritis',
                'autoimmune', 'lupus', 'inflammation', 'anti-inflammatory',
                'corticosteroid', 'biologic'
            ],
            'Psychiatry': [
                'depress', 'antidepress', 'anxiety', 'psycho', 'schizo',
                'bipolar', 'ssri', 'snri', 'antipsychotic', 'mood',
                'mental health', 'psychiatric'
            ],
            'Alzheimer\'s & Dementia': [
                'alzheimer', 'dementia', 'cognitive decline', 'memory loss',
                'aducanumab', 'donepezil', 'memantine', 'rivastigmine'
            ],
            'Rare & Orphan Diseases': [
                'rare disease', 'orphan drug', 'orphan', 'ultra-rare',
                'genetic disorder', 'inherited'
            ]
        }

    def analyze(self) -> Dict:
        """Run complete therapeutic area analysis"""
        print("\n" + "="*60)
        print("THERAPEUTIC AREA ANALYSIS")
        print("="*60)

        # Load FDA data
        df = self._load_fda_data()

        if df is None or len(df) == 0:
            print("⚠️  No FDA data found. Please run data collection first.")
            return self._empty_results()

        print(f"✓ Loaded {len(df):,} FDA drug approvals")

        # Classify drugs by therapeutic area
        df = self._classify_drugs(df)

        # Analyze trends by therapeutic area
        trends = self._analyze_trends(df)

        # Identify neglected vs flourishing areas
        neglect_analysis = self._analyze_neglect(df)

        # Calculate approval rates over time
        approval_rates = self._calculate_approval_rates(df)

        # Decade-by-decade breakdown
        decade_breakdown = self._decade_breakdown(df)

        # Compile results
        results = {
            'total_drugs_analyzed': len(df),
            'therapeutic_trends': trends,
            'neglect_analysis': neglect_analysis,
            'approval_rates_by_decade': approval_rates,
            'decade_breakdown': decade_breakdown,
            'summary': self._generate_summary(df, trends, neglect_analysis)
        }

        # Save results
        output_path = self.processed_dir / 'therapeutic_trends.json'
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)

        print(f"\n✓ Analysis saved to {output_path}")

        # Export timeline data for visualization
        self._export_timeline_data(df)

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

    def _classify_drugs(self, df: pd.DataFrame) -> pd.DataFrame:
        """Classify drugs into therapeutic categories"""
        print("\nClassifying drugs by therapeutic area...")

        # Create combined text for classification
        df['search_text'] = (
            df['drug_name'].fillna('') + ' ' +
            df['sponsor_name'].fillna('')
        ).str.lower()

        # Classify each drug
        classifications = []
        for _, row in df.iterrows():
            categories = self._categorize_drug(row['search_text'])
            classifications.append(categories)

        df['therapeutic_areas'] = classifications
        df['primary_therapeutic_area'] = df['therapeutic_areas'].apply(
            lambda x: x[0] if x else 'Unclassified'
        )

        # Print classification summary
        classified = df['primary_therapeutic_area'] != 'Unclassified'
        print(f"  Classified: {classified.sum():,} drugs ({classified.sum()/len(df)*100:.1f}%)")
        print(f"  Unclassified: {(~classified).sum():,} drugs")

        return df

    def _categorize_drug(self, text: str) -> List[str]:
        """Categorize a single drug based on text"""
        matches = []

        for category, keywords in self.therapeutic_categories.items():
            for keyword in keywords:
                if re.search(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE):
                    matches.append(category)
                    break  # Found match for this category

        return matches if matches else []

    def _analyze_trends(self, df: pd.DataFrame) -> Dict:
        """Analyze trends by therapeutic area"""
        trends = {}

        for category in self.therapeutic_categories.keys():
            # Filter drugs in this category
            category_df = df[df['therapeutic_areas'].apply(
                lambda x: category in x
            )]

            if len(category_df) == 0:
                continue

            # Calculate trend metrics
            by_decade = category_df.groupby(
                category_df['year'] // 10 * 10
            ).size().to_dict()

            # Calculate growth/decline
            decades = sorted(by_decade.keys())
            if len(decades) >= 2:
                first_half = sum(by_decade.get(d, 0) for d in decades[:len(decades)//2])
                second_half = sum(by_decade.get(d, 0) for d in decades[len(decades)//2:])
                trend = 'growing' if second_half > first_half * 1.2 else \
                        'declining' if second_half < first_half * 0.8 else 'stable'
            else:
                trend = 'insufficient_data'

            trends[category] = {
                'total_approvals': len(category_df),
                'first_approval_year': int(category_df['year'].min()),
                'latest_approval_year': int(category_df['year'].max()),
                'peak_year': int(category_df.groupby('year').size().idxmax()),
                'peak_count': int(category_df.groupby('year').size().max()),
                'by_decade': {str(k): int(v) for k, v in by_decade.items()},
                'trend': trend,
                'avg_per_year': len(category_df) / (category_df['year'].max() - category_df['year'].min() + 1)
            }

        return trends

    def _analyze_neglect(self, df: pd.DataFrame) -> Dict:
        """Identify neglected vs flourishing therapeutic areas"""
        category_counts = {}

        for category in self.therapeutic_categories.keys():
            count = df[df['therapeutic_areas'].apply(
                lambda x: category in x
            )].shape[0]
            category_counts[category] = count

        # Sort by count
        sorted_areas = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)

        return {
            'most_developed': [
                {'area': area, 'approvals': count}
                for area, count in sorted_areas[:5]
            ],
            'least_developed': [
                {'area': area, 'approvals': count}
                for area, count in sorted_areas[-5:]
            ],
            'all_counts': category_counts
        }

    def _calculate_approval_rates(self, df: pd.DataFrame) -> Dict:
        """Calculate approval rates by decade"""
        decade_rates = {}

        for decade in range(1940, 2030, 10):
            decade_df = df[(df['year'] >= decade) & (df['year'] < decade + 10)]

            if len(decade_df) == 0:
                continue

            decade_rates[str(decade)] = {
                'total_approvals': len(decade_df),
                'avg_per_year': len(decade_df) / 10,
                'by_therapeutic_area': {}
            }

            # Calculate per therapeutic area
            for category in self.therapeutic_categories.keys():
                count = decade_df[decade_df['therapeutic_areas'].apply(
                    lambda x: category in x
                )].shape[0]

                if count > 0:
                    decade_rates[str(decade)]['by_therapeutic_area'][category] = count

        return decade_rates

    def _decade_breakdown(self, df: pd.DataFrame) -> Dict:
        """Detailed decade-by-decade breakdown"""
        breakdown = {}

        for decade in range(1940, 2030, 10):
            decade_df = df[(df['year'] >= decade) & (df['year'] < decade + 10)]

            if len(decade_df) == 0:
                continue

            breakdown[f"{decade}s"] = {
                'total': len(decade_df),
                'therapeutic_areas': {},
                'top_sponsors': decade_df['sponsor_name'].value_counts().head(5).to_dict()
            }

            # Count by therapeutic area
            for category in self.therapeutic_categories.keys():
                count = decade_df[decade_df['therapeutic_areas'].apply(
                    lambda x: category in x
                )].shape[0]
                if count > 0:
                    breakdown[f"{decade}s"]['therapeutic_areas'][category] = count

        return breakdown

    def _generate_summary(self, df: pd.DataFrame, trends: Dict, neglect: Dict) -> Dict:
        """Generate executive summary"""
        return {
            'total_drugs': len(df),
            'date_range': f"{int(df['year'].min())}-{int(df['year'].max())}",
            'therapeutic_areas_identified': len([k for k, v in trends.items() if v['total_approvals'] > 0]),
            'most_developed_area': neglect['most_developed'][0] if neglect['most_developed'] else None,
            'least_developed_area': neglect['least_developed'][0] if neglect['least_developed'] else None
        }

    def _print_summary(self, results: Dict):
        """Print summary to console"""
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)

        summary = results['summary']
        print(f"Total drugs analyzed: {summary['total_drugs']:,}")
        print(f"Date range: {summary['date_range']}")
        print(f"Therapeutic areas: {summary['therapeutic_areas_identified']}")

        if summary['most_developed_area']:
            print(f"\nMost developed: {summary['most_developed_area']['area']}")
            print(f"  Approvals: {summary['most_developed_area']['approvals']:,}")

        if summary['least_developed_area']:
            print(f"\nLeast developed: {summary['least_developed_area']['area']}")
            print(f"  Approvals: {summary['least_developed_area']['approvals']:,}")

        print("="*60)

    def _export_timeline_data(self, df: pd.DataFrame):
        """Export individual drug approvals for timeline visualization"""
        print("\nExporting timeline data for visualization...")

        # Filter to only classified drugs
        classified_df = df[df['primary_therapeutic_area'] != 'Unclassified'].copy()

        print(f"  Exporting {len(classified_df):,} classified drugs")

        # Extract month and prepare timeline records
        classified_df['month'] = classified_df['approval_date'].dt.month
        classified_df['day'] = classified_df['approval_date'].dt.day

        # Create timeline data structure
        timeline_records = []
        for _, row in classified_df.iterrows():
            record = {
                'drug_name': str(row['drug_name']),
                'approval_date': row['approval_date'].strftime('%Y-%m-%d') if pd.notna(row['approval_date']) else None,
                'year': int(row['year']) if pd.notna(row['year']) else None,
                'month': int(row['month']) if pd.notna(row['month']) else None,
                'therapeutic_area': row['primary_therapeutic_area'],
                'sponsor': str(row['sponsor_name']) if pd.notna(row['sponsor_name']) else 'Unknown'
            }
            timeline_records.append(record)

        # Get unique therapeutic areas for color mapping
        unique_areas = sorted(classified_df['primary_therapeutic_area'].unique())

        # Compile timeline data
        timeline_data = {
            'therapeutic_areas': unique_areas,
            'total_records': len(timeline_records),
            'date_range': {
                'start': int(classified_df['year'].min()),
                'end': int(classified_df['year'].max())
            },
            'approvals': timeline_records
        }

        # Save timeline data
        timeline_path = self.processed_dir / 'therapeutic_timeline.json'
        with open(timeline_path, 'w') as f:
            json.dump(timeline_data, f, indent=2)

        print(f"✓ Timeline data saved to {timeline_path}")
        print(f"  {len(unique_areas)} therapeutic areas")
        print(f"  {len(timeline_records):,} drug approvals")

    def _empty_results(self) -> Dict:
        """Return empty results structure"""
        return {
            'total_drugs_analyzed': 0,
            'therapeutic_trends': {},
            'neglect_analysis': {},
            'approval_rates_by_decade': {},
            'decade_breakdown': {},
            'summary': {}
        }


if __name__ == '__main__':
    analyzer = TherapeuticAnalyzer()
    results = analyzer.analyze()
