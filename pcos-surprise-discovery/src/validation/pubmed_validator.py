"""
PubMed Validation for Top 30 Symptoms
Validates symptoms against medical literature
"""
import json
import sys
import time
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm
from Bio import Entrez

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config
    Config.NCBI_EMAIL,
    Config.PROCESSED_DATA_DIR,
    Config.VALIDATED_DATA_DIR,
    Config.TOP_N_SYMPTOMS,
)


class PubMedValidator:
    def __init__(self, email: str):
        """
        Initialize PubMed validator

        Args:
            email: Email for NCBI tracking (required by their API)
        """
        Entrez.email = email
        self.search_delay = 0.5  # Delay between requests to respect NCBI rate limits

    def search_pubmed(self, symptom: str, condition: str = "PCOS") -> Dict:
        """
        Search PubMed for papers about a symptom in PCOS

        Args:
            symptom: Symptom to search for
            condition: Medical condition (default: PCOS)

        Returns:
            Dictionary with search results
        """
        # Clean symptom name for search
        search_symptom = symptom.replace("_", " ")

        # Build search query
        query = f'("{condition}" OR "polycystic ovary syndrome") AND "{search_symptom}"'

        try:
            # Search PubMed
            handle = Entrez.esearch(
                db="pubmed",
                term=query,
                retmax=100,
                sort="relevance",
                mindate="2014",  # Last 10 years
                maxdate="2024",
            )
            record = Entrez.read(handle)
            handle.close()

            paper_ids = record.get("IdList", [])
            total_count = int(record.get("Count", 0))

            # Fetch details for top papers (up to 10)
            papers = []
            if paper_ids:
                time.sleep(self.search_delay)  # Rate limiting

                fetch_ids = paper_ids[:10]  # Top 10 papers
                handle = Entrez.efetch(
                    db="pubmed", id=fetch_ids, rettype="abstract", retmode="xml"
                )
                articles = Entrez.read(handle)
                handle.close()

                for article in articles.get("PubmedArticle", []):
                    try:
                        medline = article["MedlineCitation"]
                        article_data = medline["Article"]

                        # Extract title
                        title = article_data.get("ArticleTitle", "")

                        # Extract PMID
                        pmid = str(medline.get("PMID", ""))

                        # Extract year
                        pub_date = article_data.get("Journal", {}).get("JournalIssue", {}).get("PubDate", {})
                        year = pub_date.get("Year", "")

                        # Extract abstract
                        abstract = ""
                        abstract_data = article_data.get("Abstract", {})
                        if "AbstractText" in abstract_data:
                            abstract_texts = abstract_data["AbstractText"]
                            if isinstance(abstract_texts, list):
                                abstract = " ".join([str(t) for t in abstract_texts])
                            else:
                                abstract = str(abstract_texts)

                        papers.append({
                            "pmid": pmid,
                            "title": title,
                            "year": year,
                            "abstract": abstract[:500],  # First 500 chars
                        })

                    except Exception as e:
                        print(f"Error parsing article: {e}")
                        continue

            return {
                "symptom": symptom,
                "query": query,
                "total_papers": total_count,
                "papers_fetched": len(papers),
                "top_papers": papers,
                "has_research": total_count > 0,
            }

        except Exception as e:
            print(f"Error searching PubMed for {symptom}: {e}")
            return {
                "symptom": symptom,
                "query": query,
                "error": str(e),
                "total_papers": 0,
                "papers_fetched": 0,
                "top_papers": [],
                "has_research": False,
            }

    def validate_symptoms(self, symptoms: List[Dict]) -> List[Dict]:
        """
        Validate list of symptoms against PubMed

        Args:
            symptoms: List of symptom dictionaries

        Returns:
            List of validation results
        """
        print(f"\nValidating {len(symptoms)} symptoms against PubMed...")
        print("This may take 5-10 minutes due to API rate limits...")

        results = []
        for symptom_data in tqdm(symptoms, desc="Validating"):
            symptom = symptom_data["symptom"]

            # Search PubMed
            pubmed_result = self.search_pubmed(symptom)

            # Combine with existing symptom data
            validated = {
                **symptom_data,
                "pubmed_validation": pubmed_result,
            }

            results.append(validated)

            # Rate limiting
            time.sleep(self.search_delay)

        # Summary stats
        with_research = sum(1 for r in results if r["pubmed_validation"]["has_research"])
        print(f"\n{'='*50}")
        print(f"Validation Complete!")
        print(f"  Symptoms validated: {len(results)}")
        print(f"  Symptoms with research: {with_research}")
        print(f"  Symptoms without research: {len(results) - with_research}")
        print(f"{'='*50}")

        return results

    def save_results(self, results: List[Dict], filename: str):
        """Save validation results"""
        output_path = Config.VALIDATED_DATA_DIR / filename
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\nValidation results saved to: {output_path}")


def load_top_symptoms() -> List[Dict]:
    """Load top 30 symptoms for validation"""
    input_path = Config.PROCESSED_DATA_DIR / "top_30_symptoms.json"

    if not input_path.exists():
        print(f"❌ Error: Top symptoms file not found at {input_path}")
        print("Please run top_symptom_selector.py first!")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        symptoms = json.load(f)

    print(f"Loaded {len(symptoms)} symptoms for validation")
    return symptoms


def main():
    """Main execution function"""
    print("=" * 50)
    print("PHASE 3B: PubMed Validation")
    print("=" * 50)

    if not Config.NCBI_EMAIL:
        print("\n❌ Error: Config.NCBI_EMAIL not set in .env file")
        print("Please add your email (required by NCBI)")
        sys.exit(1)

    # Load top symptoms
    symptoms = load_top_symptoms()

    # Initialize validator
    validator = PubMedValidator(Config.NCBI_EMAIL)

    # Validate symptoms
    results = validator.validate_symptoms(symptoms)

    # Save results
    validator.save_results(results, "pubmed_validated_symptoms.json")

    print("\n✅ Validation complete!")
    print("\nNext step: Run surprise_score_calculator.py")


if __name__ == "__main__":
    main()
