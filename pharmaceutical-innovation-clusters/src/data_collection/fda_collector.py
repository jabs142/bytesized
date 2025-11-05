"""
FDA Drug Approval Data Collector

Collects drug approval data from FDA Orange Book API
Focus: New Molecular Entities (NMEs) approved 1938-2024
"""
import requests
import pandas as pd
import time
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class FDACollector:
    """Collector for FDA drug approval data"""

    def __init__(self):
        self.base_url = "https://api.fda.gov/drug/drugsfda.json"
        self.output_path = Config.RAW_DATA_DIR / 'fda_drugs_raw.csv'

    def collect_approvals(
        self,
        start_year: int = None,
        end_year: int = None,
        limit_per_year: int = 1000
    ) -> pd.DataFrame:
        """
        Collect FDA drug approvals by year

        Args:
            start_year: Starting year (default: Config.FDA_START_YEAR)
            end_year: Ending year (default: Config.FDA_END_YEAR)
            limit_per_year: Max records to fetch per year

        Returns:
            DataFrame with drug approval data
        """
        start_year = start_year or Config.FDA_START_YEAR
        end_year = end_year or Config.FDA_END_YEAR

        print(f"\n📊 Collecting FDA drug approvals ({start_year}-{end_year})")
        print(f"Output: {self.output_path}")

        all_drugs = []

        for year in tqdm(range(start_year, end_year + 1), desc="Years"):
            try:
                drugs = self._fetch_year(year, limit_per_year)
                all_drugs.extend(drugs)
                time.sleep(Config.FDA_API_DELAY)
            except Exception as e:
                print(f"\n⚠️  Error fetching {year}: {str(e)}")
                continue

        # Convert to DataFrame
        df = pd.DataFrame(all_drugs)

        if not df.empty:
            # Clean and standardize
            df = self._clean_data(df)

            # Save raw data
            df.to_csv(self.output_path, index=False)
            print(f"\n✅ Saved {len(df):,} drug approvals to {self.output_path}")

            # Print summary
            self._print_summary(df)
        else:
            print("\n⚠️  No data collected")

        return df

    def _fetch_year(self, year: int, limit: int) -> List[Dict]:
        """Fetch drug approvals for a specific year"""

        # Check for API key
        if not Config.FDA_API_KEY:
            raise ValueError("FDA_API_KEY not found in environment. Get your key at: https://open.fda.gov/apis/authentication/")

        # Build query for drugs approved in this year
        # Note: FDA API requires api_key parameter and date format YYYYMMDD
        # Use spaces instead of + for TO operator (requests library handles encoding)
        params = {
            'api_key': Config.FDA_API_KEY,
            'search': f'submissions.submission_status_date:[{year}0101 TO {year}1231]',
            'limit': limit
        }

        for attempt in range(Config.MAX_RETRIES):
            try:
                response = requests.get(
                    self.base_url,
                    params=params,
                    timeout=30
                )

                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    return self._parse_results(results, year)

                elif response.status_code == 404:
                    # No results for this year
                    return []

                else:
                    print(f"\n⚠️  Status {response.status_code} for {year}")
                    time.sleep(2 ** attempt)  # Exponential backoff

            except requests.exceptions.RequestException as e:
                if attempt == Config.MAX_RETRIES - 1:
                    raise
                time.sleep(2 ** attempt)

        return []

    def _parse_results(self, results: List[Dict], year: int) -> List[Dict]:
        """Parse FDA API results into structured records"""
        parsed = []

        for result in results:
            try:
                # Extract drug name
                drug_name = self._get_drug_name(result)

                # Extract pharmacological class information
                openfda = result.get('openfda', {})
                pharm_class_epc = '; '.join(openfda.get('pharm_class_epc', [])) if openfda.get('pharm_class_epc') else ''
                pharm_class_moa = '; '.join(openfda.get('pharm_class_moa', [])) if openfda.get('pharm_class_moa') else ''
                generic_name = '; '.join(openfda.get('generic_name', [])) if openfda.get('generic_name') else ''
                route = '; '.join(openfda.get('route', [])) if openfda.get('route') else ''
                indication = '; '.join(openfda.get('indication_and_usage', [])) if openfda.get('indication_and_usage') else ''

                # Get submissions (approval records)
                submissions = result.get('submissions', [])

                for submission in submissions:
                    # Filter for approved submissions in target year
                    status_date = submission.get('submission_status_date', '')

                    if not status_date or not status_date.startswith(str(year)):
                        continue

                    if submission.get('submission_status') != 'AP':  # AP = Approved
                        continue

                    # Check for orphan drug designation
                    is_orphan = False
                    submission_property_type = submission.get('submission_property_type', [])
                    if submission_property_type:
                        is_orphan = any(prop.get('code') == 'Orphan' for prop in submission_property_type)

                    # Parse data
                    parsed.append({
                        'drug_name': drug_name,
                        'generic_name': generic_name,
                        'approval_date': status_date,
                        'submission_type': submission.get('submission_type', ''),
                        'submission_number': submission.get('submission_number', ''),
                        'application_number': result.get('application_number', ''),
                        'sponsor_name': result.get('sponsor_name', ''),
                        'pharm_class_epc': pharm_class_epc,
                        'pharm_class_moa': pharm_class_moa,
                        'route': route,
                        'indication': indication,
                        'is_orphan': is_orphan,
                        'year': year
                    })

            except Exception as e:
                # Skip malformed records
                continue

        return parsed

    def _get_drug_name(self, result: Dict) -> str:
        """Extract drug name from FDA result"""
        # Try multiple fields
        if 'openfda' in result:
            openfda = result['openfda']
            if 'brand_name' in openfda and openfda['brand_name']:
                return openfda['brand_name'][0]
            if 'generic_name' in openfda and openfda['generic_name']:
                return openfda['generic_name'][0]

        # Fallback to products
        products = result.get('products', [])
        if products:
            return products[0].get('brand_name', 'Unknown')

        return 'Unknown'

    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize the data"""

        # Convert approval_date to datetime
        df['approval_date'] = pd.to_datetime(df['approval_date'], errors='coerce')

        # Extract year if not present
        if 'year' not in df.columns:
            df['year'] = df['approval_date'].dt.year

        # Mark New Molecular Entities (NMEs)
        # Type 1 = NME, Type 2 = New Active Ingredient
        df['is_nme'] = df['submission_type'].isin(['ORIG-1', 'TYPE 1', 'NME'])

        # Remove duplicates
        df = df.drop_duplicates(subset=['application_number', 'approval_date'])

        # Sort by date
        df = df.sort_values('approval_date')

        # Reset index
        df = df.reset_index(drop=True)

        return df

    def _print_summary(self, df: pd.DataFrame):
        """Print summary statistics"""
        print("\n" + "="*60)
        print("FDA DATA SUMMARY")
        print("="*60)

        print(f"Total approvals: {len(df):,}")
        print(f"Date range: {df['approval_date'].min()} to {df['approval_date'].max()}")

        nme_count = df['is_nme'].sum()
        print(f"New Molecular Entities (NMEs): {nme_count:,} ({nme_count/len(df)*100:.1f}%)")

        print(f"\nTop 5 years by approvals:")
        top_years = df['year'].value_counts().head(5)
        for year, count in top_years.items():
            print(f"  {year}: {count:,} approvals")

        print(f"\nTop 5 sponsors:")
        top_sponsors = df['sponsor_name'].value_counts().head(5)
        for sponsor, count in top_sponsors.items():
            print(f"  {sponsor}: {count:,} approvals")

        print("="*60)


def main():
    """Run FDA data collection"""
    collector = FDACollector()

    # Collect data
    df = collector.collect_approvals()

    return df


if __name__ == '__main__':
    main()
