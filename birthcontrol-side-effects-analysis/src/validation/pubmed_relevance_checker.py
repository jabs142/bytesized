"""
PubMed Relevance Checker
Validates that research papers are actually relevant to birth control side effects

Uses LLM to assess if each PubMed paper is genuinely about the side effect
in relation to birth control, filtering out spurious matches.
"""

import os
from typing import Dict, List
from openai import OpenAI
import json
import time
from tqdm import tqdm


class PubMedRelevanceChecker:
    """
    Checks relevance of PubMed papers to birth control side effects using LLM
    """

    def __init__(self, api_key: str = None, model: str = "gpt-4o-mini"):
        """
        Initialize with OpenAI API key

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            model: OpenAI model to use (default: gpt-4o-mini for cost efficiency)
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY or pass api_key parameter")

        self.client = OpenAI(api_key=self.api_key)
        self.model = model

    def assess_relevance(self, side_effect: str, paper: Dict) -> Dict:
        """
        Assess if a PubMed paper is relevant to a specific side effect + birth control

        Args:
            side_effect: Name of the side effect (e.g., "chronic pain", "anxiety")
            paper: Dictionary with 'title', 'abstract', 'pmid', etc.

        Returns:
            Dictionary with relevance assessment:
            {
                'is_relevant': bool,
                'relevance_score': float (0-1),
                'reason': str,
                'connection': str (if relevant)
            }
        """
        # Handle cases where abstract is missing
        abstract = paper.get('abstract', '')
        if not abstract or abstract == '[No abstract available]':
            # Use title only for relevance assessment
            abstract = f"[Abstract not available. Title only: {paper['title']}]"

        # Truncate abstract if too long (max 1000 chars to save tokens)
        if len(abstract) > 1000:
            abstract = abstract[:1000] + "..."

        prompt = f"""Is this research paper relevant to the side effect "{side_effect}" caused by birth control?

Paper Title: {paper['title']}
Abstract: {abstract}

Return JSON:
{{
  "is_relevant": true/false,
  "relevance_score": 0.0-1.0,
  "reason": "Brief explanation of why relevant or not (1 sentence)",
  "connection": "How the paper relates to side effect + BC (if relevant, 1 sentence, or empty string if not relevant)"
}}

A paper is RELEVANT if it:
- Studies "{side_effect}" in birth control users
- Discusses mechanisms of how BC causes "{side_effect}"
- Compares "{side_effect}" rates across BC types
- Reports prevalence/incidence of "{side_effect}" in BC users
- Reviews side effects of BC and mentions "{side_effect}"

A paper is NOT RELEVANT if it:
- Only mentions BC or "{side_effect}" in passing/unrelated context
- Studies "{side_effect}" in non-BC populations (pregnancy, abortion, general population)
- Focuses on unrelated topics that happen to mention the terms
- Studies BC for reasons unrelated to "{side_effect}"

Examples:
- "{side_effect}" + "timing of pregnancy" = NOT relevant (pregnancy study, not BC side effect study)
- "{side_effect}" + "oral contraceptives increase risk" = RELEVANT
- "{side_effect}" + "women seeking abortion" = NOT relevant (abortion study, not BC)

Be strict: Only mark as relevant if the paper is ACTUALLY studying this side effect in BC context.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a medical research analyst assessing paper relevance."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1,  # Low temperature for consistency
                max_tokens=200
            )

            result = json.loads(response.choices[0].message.content)

            # Add original paper info
            result['pmid'] = paper.get('pmid', '')
            result['title'] = paper['title']

            return result

        except Exception as e:
            print(f"Error assessing relevance for PMID {paper.get('pmid', 'unknown')}: {e}")
            # Return conservative assessment on error
            return {
                'is_relevant': False,
                'relevance_score': 0.0,
                'reason': f"Error during assessment: {str(e)}",
                'connection': '',
                'pmid': paper.get('pmid', ''),
                'title': paper['title']
            }

    def assess_paper_list(self, side_effect: str, papers: List[Dict], min_relevance: float = 0.7) -> List[Dict]:
        """
        Assess relevance for a list of papers and filter by minimum score

        Args:
            side_effect: Name of the side effect
            papers: List of paper dictionaries
            min_relevance: Minimum relevance score to include (default: 0.7)

        Returns:
            List of papers with relevance scores, filtered by min_relevance
        """
        if not papers:
            return []

        assessed_papers = []

        print(f"\nAssessing relevance of {len(papers)} papers for '{side_effect}'...")

        for paper in tqdm(papers, desc=f"Checking {side_effect}", unit="paper"):
            assessment = self.assess_relevance(side_effect, paper)

            # Add assessment fields to paper dict
            paper_with_relevance = paper.copy()
            paper_with_relevance['relevance_score'] = assessment['relevance_score']
            paper_with_relevance['relevance_reason'] = assessment['reason']
            paper_with_relevance['relevance_connection'] = assessment['connection']
            paper_with_relevance['is_relevant'] = assessment['is_relevant']

            # Only include if meets minimum relevance threshold
            if assessment['relevance_score'] >= min_relevance:
                assessed_papers.append(paper_with_relevance)

            # Rate limiting: ~1 request per second to avoid OpenAI rate limits
            time.sleep(0.1)

        print(f"  ✓ {len(assessed_papers)}/{len(papers)} papers passed relevance threshold ({min_relevance})")

        return assessed_papers

    def assess_all_symptoms(self, validated_database: Dict, min_relevance: float = 0.7) -> Dict:
        """
        Assess relevance for all papers in the validated symptoms database

        Args:
            validated_database: Dictionary of {symptom: {pubmed_papers: [...], ...}}
            min_relevance: Minimum relevance score to include

        Returns:
            Updated database with relevance-filtered papers
        """
        updated_database = {}

        total_papers_before = 0
        total_papers_after = 0

        for symptom, data in validated_database.items():
            papers = data.get('pubmed_papers', [])
            total_papers_before += len(papers)

            if papers:
                # Assess relevance for all papers
                relevant_papers = self.assess_paper_list(symptom, papers, min_relevance)
                total_papers_after += len(relevant_papers)

                # Update data with filtered papers
                updated_data = data.copy()
                updated_data['pubmed_papers'] = relevant_papers
                updated_data['paper_count'] = len(relevant_papers)

                # Recalculate research coverage based on filtered count
                updated_data['research_coverage'] = min(len(relevant_papers) / 10, 1.0)

                updated_database[symptom] = updated_data
            else:
                # No papers to assess
                updated_database[symptom] = data

        print(f"\n✅ Relevance filtering complete:")
        print(f"   Papers before: {total_papers_before}")
        print(f"   Papers after: {total_papers_after}")
        print(f"   Filtered out: {total_papers_before - total_papers_after} irrelevant papers")

        return updated_database


def main():
    """
    Example usage: Assess relevance for validated symptoms database
    """
    import json

    # Load validated database
    database_path = 'data/validated/validated_side_effects_database.json'

    try:
        with open(database_path, 'r') as f:
            validated_database = json.load(f)

        print(f"Loaded {len(validated_database)} validated symptoms")

        # Initialize relevance checker
        checker = PubMedRelevanceChecker()

        # Assess all symptoms
        updated_database = checker.assess_all_symptoms(
            validated_database,
            min_relevance=0.7  # Strict threshold: 70% relevance required
        )

        # Save updated database
        output_path = 'data/validated/validated_side_effects_database_filtered.json'
        with open(output_path, 'w') as f:
            json.dump(updated_database, f, indent=2)

        print(f"\n✅ Saved relevance-filtered database to: {output_path}")

        # Print some examples of filtered papers
        print("\nExample filtered results:")
        for symptom in list(updated_database.keys())[:3]:
            data = updated_database[symptom]
            papers = data.get('pubmed_papers', [])
            print(f"\n{symptom}: {len(papers)} relevant papers")
            for paper in papers[:2]:  # Show first 2 papers
                print(f"  - {paper['title']}")
                print(f"    Relevance: {paper['relevance_score']:.2f} - {paper['relevance_reason']}")

    except FileNotFoundError:
        print(f"Error: Could not find {database_path}")
        print("Please run validation analysis first to generate the database.")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
