"""
Re-process existing FDA data to add application type flags
Much faster than re-downloading from API
"""
import pandas as pd
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))
from data_collection.fda_collector import FDACollector
from config import Config

def reprocess_data():
    """Re-process existing raw data with new application type flags"""

    raw_path = Config.RAW_DATA_DIR / 'fda_drugs_raw.csv'

    print(f"📊 Re-processing FDA data from {raw_path}")
    print(f"Reading {raw_path.stat().st_size / 1024 / 1024:.1f} MB...")

    # Read existing raw data
    df = pd.read_csv(raw_path)
    print(f"✅ Loaded {len(df):,} records")

    # Apply new cleaning logic (which includes application type extraction)
    collector = FDACollector()
    df_cleaned = collector._clean_data(df)

    # Save back to the same file
    df_cleaned.to_csv(raw_path, index=False)
    print(f"✅ Saved updated data to {raw_path}")

    # Print summary
    collector._print_summary(df_cleaned)

    return df_cleaned

if __name__ == '__main__':
    reprocess_data()
