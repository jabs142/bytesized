"""
PubMed Research Fetcher
========================
Fetches research papers from PubMed using E-utilities API to find scientific evidence
for symptom-EDS relationships.

PubMed E-utilities API: https://www.ncbi.nlm.nih.gov/books/NBK25501/
"""

import requests
import time
import json
from typing import List, Dict, Optional
from datetime import datetime
import xml.etree.ElementTree as ET


class PubMedFetcher:
    """
    Fetches research papers from PubMed to validate symptom-EDS relationships.

    Uses NCBI E-utilities API (free, no API key required for basic use).
    With API key: 10 requests/second. Without: 3 requests/second.
    """

    BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

    def __init__(self, api_key: Optional[str] = None, email: Optional[str] = None):
        """
        Initialize PubMed fetcher.

        Args:
            api_key: Optional NCBI API key for higher rate limits
            email: Your email (NCBI requests this for courtesy)
        """
        self.api_key = api_key
        self.email = email
        self.rate_limit_delay = 0.34 if api_key else 0.34  # ~3 requests/sec without key

    def search_papers(self, query: str, max_results: int = 20,
                     min_year: Optional[int] = None) -> List[str]:
        """
        Search PubMed for papers matching query.

        Args:
            query: Search query (e.g., "Ehlers Danlos motion sickness")
            max_results: Maximum number of results to return
            min_year: Only return papers from this year onwards (e.g., 2010)

        Returns:
            List of PubMed IDs (PMIDs)
        """
        print(f"🔍 Searching PubMed: '{query}'")

        # Build query with date filter if provided
        if min_year:
            query = f"({query}) AND {min_year}:3000[pdat]"

        params = {
            "db": "pubmed",
            "term": query,
            "retmax": max_results,
            "retmode": "json",
            "sort": "relevance"
        }

        if self.api_key:
            params["api_key"] = self.api_key
        if self.email:
            params["email"] = self.email

        try:
            response = requests.get(f"{self.BASE_URL}/esearch.fcgi", params=params)
            response.raise_for_status()

            data = response.json()
            pmids = data.get("esearchresult", {}).get("idlist", [])

            print(f"   Found {len(pmids)} papers")
            time.sleep(self.rate_limit_delay)

            return pmids

        except Exception as e:
            print(f"   ❌ Error searching PubMed: {e}")
            return []

    def fetch_paper_details(self, pmids: List[str]) -> List[Dict]:
        """
        Fetch detailed information for a list of PubMed IDs.

        Args:
            pmids: List of PubMed IDs

        Returns:
            List of paper details (title, abstract, authors, etc.)
        """
        if not pmids:
            return []

        print(f"📄 Fetching details for {len(pmids)} papers...")

        # EFetch returns XML, we'll parse it
        params = {
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "xml"
        }

        if self.api_key:
            params["api_key"] = self.api_key
        if self.email:
            params["email"] = self.email

        try:
            response = requests.get(f"{self.BASE_URL}/efetch.fcgi", params=params)
            response.raise_for_status()

            # Parse XML response
            papers = self._parse_pubmed_xml(response.text)

            print(f"   ✓ Fetched {len(papers)} paper details")
            time.sleep(self.rate_limit_delay)

            return papers

        except Exception as e:
            print(f"   ❌ Error fetching paper details: {e}")
            return []

    def _parse_pubmed_xml(self, xml_text: str) -> List[Dict]:
        """
        Parse PubMed XML response into structured data.

        Args:
            xml_text: XML response from EFetch

        Returns:
            List of paper dictionaries
        """
        papers = []

        try:
            root = ET.fromstring(xml_text)

            for article in root.findall(".//PubmedArticle"):
                paper = {}

                # PMID
                pmid = article.find(".//PMID")
                paper["pmid"] = pmid.text if pmid is not None else None

                # Title
                title = article.find(".//ArticleTitle")
                paper["title"] = title.text if title is not None else "No title"

                # Abstract
                abstract_parts = article.findall(".//AbstractText")
                if abstract_parts:
                    abstract = " ".join([
                        part.text for part in abstract_parts
                        if part.text
                    ])
                    paper["abstract"] = abstract
                else:
                    paper["abstract"] = None

                # Authors
                authors = article.findall(".//Author")
                author_list = []
                for author in authors[:3]:  # First 3 authors
                    last_name = author.find("LastName")
                    first_name = author.find("ForeName")
                    if last_name is not None:
                        name = last_name.text
                        if first_name is not None:
                            name = f"{first_name.text} {name}"
                        author_list.append(name)
                paper["authors"] = author_list

                # Publication year
                pub_date = article.find(".//PubDate/Year")
                paper["year"] = pub_date.text if pub_date is not None else None

                # Journal
                journal = article.find(".//Journal/Title")
                paper["journal"] = journal.text if journal is not None else None

                # DOI
                doi_elem = article.find(".//ArticleId[@IdType='doi']")
                paper["doi"] = doi_elem.text if doi_elem is not None else None

                # PubMed URL
                paper["url"] = f"https://pubmed.ncbi.nlm.nih.gov/{paper['pmid']}/"

                papers.append(paper)

        except ET.ParseError as e:
            print(f"   ⚠️  XML parsing error: {e}")

        return papers

    def search_symptom_eds_relationship(self, symptom: str,
                                       max_results: int = 10) -> List[Dict]:
        """
        Search for papers about a symptom's relationship to EDS.

        Args:
            symptom: Symptom name (e.g., "motion sickness", "POTS")
            max_results: Max papers to fetch

        Returns:
            List of paper details
        """
        # Build comprehensive search query
        queries = [
            f'("Ehlers Danlos" OR "EDS" OR "hEDS") AND "{symptom}"',
            f'"Ehlers Danlos syndrome" AND "{symptom}"',
        ]

        all_pmids = set()

        for query in queries:
            pmids = self.search_papers(query, max_results=max_results, min_year=2010)
            all_pmids.update(pmids)

            if len(all_pmids) >= max_results:
                break

        # Fetch details for unique PMIDs
        pmids_list = list(all_pmids)[:max_results]
        papers = self.fetch_paper_details(pmids_list)

        return papers

    def extract_prevalence_data(self, paper: Dict, symptom: str) -> Optional[Dict]:
        """
        Try to extract prevalence/percentage data from abstract.

        Args:
            paper: Paper dictionary with abstract
            symptom: Symptom to look for

        Returns:
            Dict with extracted data or None
        """
        if not paper.get("abstract"):
            return None

        abstract = paper["abstract"].lower()
        symptom_lower = symptom.lower()

        # Simple pattern matching for prevalence
        # Look for: "67% of patients", "73% prevalence", etc.
        import re

        # Pattern: number + % + context
        pattern = r'(\d+(?:\.\d+)?)\s*%\s*(?:of\s+)?(?:patients?|subjects?|individuals?|participants?)?'
        matches = re.finditer(pattern, abstract)

        prevalence_data = []
        for match in matches:
            # Get surrounding context
            start = max(0, match.start() - 50)
            end = min(len(abstract), match.end() + 50)
            context = abstract[start:end]

            if symptom_lower in context or "eds" in context:
                prevalence_data.append({
                    "percentage": float(match.group(1)),
                    "context": context.strip()
                })

        if prevalence_data:
            return {
                "pmid": paper["pmid"],
                "title": paper["title"],
                "prevalence_mentions": prevalence_data
            }

        return None

    def save_papers(self, papers: List[Dict], filename: str):
        """Save papers to JSON file."""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(papers, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved {len(papers)} papers to {filename}")


def main():
    """Example usage of PubMedFetcher."""

    # Initialize (no API key needed for testing!)
    fetcher = PubMedFetcher(email="your_email@example.com")

    # Example 1: Search for EDS + motion sickness
    print("\n" + "="*60)
    print("Example 1: EDS + Motion Sickness")
    print("="*60)

    papers = fetcher.search_symptom_eds_relationship("motion sickness", max_results=5)

    for i, paper in enumerate(papers, 1):
        print(f"\n📄 Paper {i}:")
        print(f"   Title: {paper['title']}")
        print(f"   Authors: {', '.join(paper['authors']) if paper['authors'] else 'N/A'}")
        print(f"   Year: {paper['year']}")
        print(f"   PMID: {paper['pmid']}")
        print(f"   URL: {paper['url']}")
        if paper['abstract']:
            print(f"   Abstract preview: {paper['abstract'][:200]}...")

    # Example 2: Search for EDS + POTS
    print("\n" + "="*60)
    print("Example 2: EDS + POTS")
    print("="*60)

    papers = fetcher.search_symptom_eds_relationship("POTS", max_results=3)

    for i, paper in enumerate(papers, 1):
        print(f"\n📄 Paper {i}: {paper['title']}")
        print(f"   {paper['url']}")

        # Try to extract prevalence
        prevalence = fetcher.extract_prevalence_data(paper, "POTS")
        if prevalence:
            print(f"   📊 Found prevalence data:")
            for mention in prevalence['prevalence_mentions']:
                print(f"      - {mention['percentage']}%")


if __name__ == "__main__":
    main()
