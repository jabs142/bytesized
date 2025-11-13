"""
PubMed Helpers
==============
Shared utilities for fetching and validating PubMed research.

Usage:
    from shared.utils.python.pubmed_helpers import PubMedFetcher

    fetcher = PubMedFetcher()
    papers = fetcher.search("birth control anxiety", max_results=10)
"""

import requests
import time
from typing import List, Dict, Optional
from xml.etree import ElementTree as ET


class PubMedFetcher:
    """
    Fetch papers from PubMed API.

    Uses Entrez E-utilities for search and fetch operations.
    """

    BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

    def __init__(
        self,
        email: Optional[str] = None,
        api_key: Optional[str] = None,
        rate_limit_delay: float = 0.35
    ):
        """
        Initialize PubMed fetcher.

        Args:
            email: Contact email (recommended by NCBI)
            api_key: NCBI API key (increases rate limit to 10/sec)
            rate_limit_delay: Delay between requests (0.35s = ~3/sec without key)
        """
        self.email = email
        self.api_key = api_key
        self.rate_limit_delay = rate_limit_delay

    def search(
        self,
        query: str,
        max_results: int = 20,
        sort: str = "relevance"
    ) -> List[str]:
        """
        Search PubMed and return PMIDs.

        Args:
            query: Search query
            max_results: Maximum number of results
            sort: Sort order (relevance, pub_date)

        Returns:
            List of PMIDs
        """
        params = {
            "db": "pubmed",
            "term": query,
            "retmax": max_results,
            "retmode": "json",
            "sort": sort
        }

        if self.email:
            params["email"] = self.email
        if self.api_key:
            params["api_key"] = self.api_key

        try:
            response = requests.get(
                f"{self.BASE_URL}esearch.fcgi",
                params=params,
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            pmids = data.get("esearchresult", {}).get("idlist", [])
            print(f"Found {len(pmids)} papers for query: '{query}'")

            time.sleep(self.rate_limit_delay)
            return pmids

        except Exception as e:
            print(f"Search error: {str(e)}")
            return []

    def fetch_details(
        self,
        pmids: List[str]
    ) -> List[Dict]:
        """
        Fetch paper details for PMIDs.

        Args:
            pmids: List of PubMed IDs

        Returns:
            List of paper dictionaries with title, abstract, etc.
        """
        if not pmids:
            return []

        # Batch fetch (max 200 at once)
        batch_size = 200
        all_papers = []

        for i in range(0, len(pmids), batch_size):
            batch = pmids[i:i + batch_size]
            papers = self._fetch_batch(batch)
            all_papers.extend(papers)
            time.sleep(self.rate_limit_delay)

        return all_papers

    def _fetch_batch(self, pmids: List[str]) -> List[Dict]:
        """Fetch details for a batch of PMIDs."""
        params = {
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "xml"
        }

        if self.email:
            params["email"] = self.email
        if self.api_key:
            params["api_key"] = self.api_key

        try:
            response = requests.get(
                f"{self.BASE_URL}efetch.fcgi",
                params=params,
                timeout=60
            )
            response.raise_for_status()

            return self._parse_xml_response(response.text)

        except Exception as e:
            print(f"Fetch error: {str(e)}")
            return []

    def _parse_xml_response(self, xml_text: str) -> List[Dict]:
        """Parse XML response into paper dictionaries."""
        papers = []

        try:
            root = ET.fromstring(xml_text)

            for article in root.findall(".//PubmedArticle"):
                paper = self._extract_paper_data(article)
                if paper:
                    papers.append(paper)

        except Exception as e:
            print(f"XML parsing error: {str(e)}")

        return papers

    def _extract_paper_data(self, article_elem) -> Optional[Dict]:
        """Extract data from article XML element."""
        try:
            # PMID
            pmid_elem = article_elem.find(".//PMID")
            pmid = pmid_elem.text if pmid_elem is not None else "Unknown"

            # Title
            title_elem = article_elem.find(".//ArticleTitle")
            title = title_elem.text if title_elem is not None else "No title"

            # Abstract
            abstract_parts = []
            for abstract_text in article_elem.findall(".//AbstractText"):
                if abstract_text.text:
                    abstract_parts.append(abstract_text.text)
            abstract = " ".join(abstract_parts) if abstract_parts else "[No abstract available]"

            # Authors
            authors = []
            for author in article_elem.findall(".//Author"):
                lastname = author.find("LastName")
                forename = author.find("ForeName")
                if lastname is not None and forename is not None:
                    authors.append(f"{forename.text} {lastname.text}")

            # Journal
            journal_elem = article_elem.find(".//Journal/Title")
            journal = journal_elem.text if journal_elem is not None else "Unknown"

            # Year
            year_elem = article_elem.find(".//PubDate/Year")
            year = year_elem.text if year_elem is not None else "Unknown"

            return {
                "pmid": pmid,
                "title": title,
                "abstract": abstract,
                "authors": authors,
                "journal": journal,
                "year": year,
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
            }

        except Exception as e:
            print(f"Error extracting paper data: {str(e)}")
            return None

    def search_and_fetch(
        self,
        query: str,
        max_results: int = 20
    ) -> List[Dict]:
        """
        Search and fetch paper details in one call.

        Args:
            query: Search query
            max_results: Maximum number of results

        Returns:
            List of paper dictionaries
        """
        pmids = self.search(query, max_results)
        return self.fetch_details(pmids)


def create_search_queries(
    base_term: str,
    variations: List[str]
) -> List[str]:
    """
    Create multiple search query variations.

    Args:
        base_term: Base search term (e.g., "birth control")
        variations: List of variations (e.g., ["anxiety", "depression"])

    Returns:
        List of search queries

    Example:
        >>> create_search_queries("birth control", ["anxiety", "depression"])
        [
            "birth control anxiety",
            "oral contraceptive anxiety",
            "birth control depression",
            "oral contraceptive depression"
        ]
    """
    base_variations = [base_term, "oral contraceptive", "hormonal contraception"]
    queries = []

    for base in base_variations:
        for variation in variations:
            queries.append(f"{base} {variation}")

    return queries
