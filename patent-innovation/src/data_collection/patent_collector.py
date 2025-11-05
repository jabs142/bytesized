"""
USPTO Patent Data Collector

Collects breakthrough patent data from PatentsView API
Focus: High-citation patents in key technology categories (1920-2024)
"""
import requests
import json
import pandas as pd
import time
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class PatentCollector:
    """Collector for USPTO patent data via PatentsView API"""

    def __init__(self):
        self.base_url = "https://search.patentsview.org/api/v1/patent/"
        self.output_path = Config.RAW_DATA_DIR / 'patents_raw.json'

        # Check for API key
        if not Config.USPTO_API_KEY:
            raise ValueError("USPTO_API_KEY not found in environment. Request key at: https://patentsview-support.atlassian.net/servicedesk/customer/portal/1/group/1/create/18")

    def collect_breakthrough_patents(
        self,
        start_year: int = None,
        end_year: int = None,
        citation_percentile: int = None
    ) -> List[Dict]:
        """
        Collect breakthrough patents (high citation counts) by technology category

        Args:
            start_year: Starting year (default: Config.PATENT_START_YEAR)
            end_year: Ending year (default: Config.PATENT_END_YEAR)
            citation_percentile: Minimum citation percentile (default: Config.BREAKTHROUGH_CITATION_PERCENTILE)

        Returns:
            List of patent records
        """
        start_year = start_year or Config.PATENT_START_YEAR
        end_year = end_year or Config.PATENT_END_YEAR
        citation_percentile = citation_percentile or Config.BREAKTHROUGH_CITATION_PERCENTILE

        print(f"\n📊 Collecting USPTO breakthrough patents ({start_year}-{end_year})")
        print(f"Categories: {', '.join(Config.PATENT_CATEGORIES.keys())}")
        print(f"Citation threshold: Top {100-citation_percentile}%")
        print(f"Output: {self.output_path}")

        all_patents = []

        # Collect patents for each category
        for category_name, cpc_code in tqdm(Config.PATENT_CATEGORIES.items(), desc="Categories"):
            print(f"\n  Collecting {category_name} ({cpc_code})...")

            try:
                # First pass: Get all patents to calculate citation threshold
                patents = self._fetch_category(
                    cpc_code,
                    start_year,
                    end_year,
                    category_name
                )

                if patents:
                    # Filter for breakthrough patents (high citations)
                    breakthrough = self._filter_breakthrough(
                        patents,
                        citation_percentile
                    )

                    print(f"    Found {len(breakthrough):,} breakthrough patents (from {len(patents):,} total)")
                    all_patents.extend(breakthrough)

                time.sleep(Config.USPTO_API_DELAY)

            except Exception as e:
                print(f"\n⚠️  Error collecting {category_name}: {str(e)}")
                continue

        # Save to JSON
        if all_patents:
            with open(self.output_path, 'w') as f:
                json.dump(all_patents, f, indent=2)

            print(f"\n✅ Saved {len(all_patents):,} breakthrough patents to {self.output_path}")

            # Print summary
            self._print_summary(all_patents)
        else:
            print("\n⚠️  No patents collected")

        return all_patents

    def _fetch_category(
        self,
        cpc_code: str,
        start_year: int,
        end_year: int,
        category_name: str,
        limit: int = 10000
    ) -> List[Dict]:
        """Fetch patents for a specific CPC category using new PatentsView API"""

        # Build query for new API format
        # New API uses JSON query format as URL parameters
        query = {
            "_and": [
                {"_gte": {"patent_date": f"{start_year}-01-01"}},
                {"_lte": {"patent_date": f"{end_year}-12-31"}},
                {"_begins": {"cpc_group_id": cpc_code}}
            ]
        }

        fields = [
            "patent_id",
            "patent_number",
            "patent_date",
            "patent_title",
            "patent_abstract",
            "cpc_group_id",
            "patent_num_cited_by_us_patents"
        ]

        # Sort by citation count descending to get breakthrough patents first
        sort = [{"patent_num_cited_by_us_patents": "desc"}]

        all_results = []
        page = 1

        while len(all_results) < limit:
            try:
                # Build params for GET request
                params = {
                    'q': json.dumps(query),
                    'f': json.dumps(fields),
                    's': json.dumps(sort),
                    'o': json.dumps({"page": page, "per_page": 100})  # New API max is 100
                }

                # Add API key header
                headers = {
                    'X-Api-Key': Config.USPTO_API_KEY
                }

                response = requests.get(
                    self.base_url,
                    params=params,
                    headers=headers,
                    timeout=60
                )

                if response.status_code != 200:
                    print(f"\n⚠️  API returned status {response.status_code}")
                    if response.status_code == 401:
                        print(f"    Authentication failed. Check your USPTO_API_KEY")
                    break

                data = response.json()
                patents = data.get('patents', [])

                if not patents:
                    break  # No more results

                # Add category to each patent
                for patent in patents:
                    patent['technology_category'] = category_name

                all_results.extend(patents)

                # Check if we have more pages
                total_count = data.get('total_patent_count', 0)
                if len(all_results) >= total_count or len(all_results) >= limit:
                    break

                page += 1
                time.sleep(Config.USPTO_API_DELAY)  # Respect rate limit (45 req/min)

            except Exception as e:
                print(f"\n⚠️  Error fetching page {page}: {str(e)}")
                break

        return all_results

    def _filter_breakthrough(
        self,
        patents: List[Dict],
        percentile: int
    ) -> List[Dict]:
        """Filter patents to only those with high citation counts"""

        if not patents:
            return []

        # Extract citation counts (new field name from API v1)
        citations = []
        for patent in patents:
            count = patent.get('patent_num_cited_by_us_patents', 0)
            citations.append(int(count) if count else 0)

        # Calculate threshold
        threshold = pd.Series(citations).quantile(percentile / 100)

        # Filter patents
        breakthrough = []
        for patent in patents:
            count = patent.get('patent_num_cited_by_us_patents', 0)
            count = int(count) if count else 0

            if count >= threshold:
                # Add citation metadata
                patent['citations_received'] = count
                patent['is_breakthrough'] = True
                breakthrough.append(patent)

        return breakthrough

    def _print_summary(self, patents: List[Dict]):
        """Print summary statistics"""
        print("\n" + "="*60)
        print("USPTO PATENT DATA SUMMARY")
        print("="*60)

        df = pd.DataFrame(patents)

        print(f"Total breakthrough patents: {len(df):,}")

        # Convert patent_date to datetime
        df['patent_date'] = pd.to_datetime(df['patent_date'], errors='coerce')
        df['year'] = df['patent_date'].dt.year

        print(f"Date range: {df['patent_date'].min()} to {df['patent_date'].max()}")

        print(f"\nPatents by technology category:")
        category_counts = df['technology_category'].value_counts()
        for category, count in category_counts.items():
            print(f"  {category}: {count:,} patents")

        print(f"\nTop 5 years by patent count:")
        top_years = df['year'].value_counts().head(5)
        for year, count in top_years.items():
            print(f"  {year}: {count:,} patents")

        print(f"\nCitation statistics:")
        print(f"  Mean citations: {df['citations_received'].mean():.1f}")
        print(f"  Median citations: {df['citations_received'].median():.1f}")
        print(f"  Max citations: {df['citations_received'].max():.0f}")

        print(f"\nMost cited patents:")
        top_cited = df.nlargest(3, 'citations_received')[['patent_number', 'patent_title', 'citations_received', 'technology_category']]
        for _, row in top_cited.iterrows():
            title = row['patent_title'][:60] + "..." if len(row['patent_title']) > 60 else row['patent_title']
            print(f"  {row['patent_number']}: {title}")
            print(f"    {row['citations_received']:.0f} citations ({row['technology_category']})")

        print("="*60)


def main():
    """Run patent data collection"""
    collector = PatentCollector()

    # Collect data
    patents = collector.collect_breakthrough_patents()

    return patents


if __name__ == '__main__':
    main()
