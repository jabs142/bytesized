"""Test FDA collector with pharmacological class capture"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from src.data_collection.fda_collector import FDACollector
from src.analysis.pharm_class_mapper import PharmClassMapper

print('Testing FDA collector with pharmacological class capture...')
print('Fetching 2023-2024 approvals as test...\n')

collector = FDACollector()
df = collector.collect_approvals(start_year=2023, end_year=2024, limit_per_year=50)

if not df.empty:
    print(f'\n✓ Collected {len(df)} approvals')
    print(f'\nColumns: {list(df.columns)}')

    # Check how many have pharm class data
    has_pharm = df['pharm_class_epc'].notna() & (df['pharm_class_epc'] != '')
    print(f'\nDrugs with pharm_class_epc: {has_pharm.sum()} ({has_pharm.sum()/len(df)*100:.1f}%)')

    has_orphan = df['is_orphan'].sum()
    print(f'Orphan drug designations: {has_orphan} ({has_orphan/len(df)*100:.1f}%)')

    # Test mapper on sample
    mapper = PharmClassMapper()
    pharm_drugs = df[has_pharm].head(5)

    print('\nSample drugs with therapeutic area mapping:')
    for idx, row in pharm_drugs.iterrows():
        area = mapper.get_primary_area(row['pharm_class_epc'], row['pharm_class_moa'])
        print(f'\n  {row["drug_name"]}')
        print(f'    Pharm Class: {row["pharm_class_epc"][:60]}...')
        print(f'    → Therapeutic Area: {area}')
        print(f'    Orphan: {row["is_orphan"]}')
else:
    print('⚠️ No data collected')
