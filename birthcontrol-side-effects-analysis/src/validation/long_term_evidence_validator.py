"""
Long-Term Side Effects Evidence Validator
==========================================
Validates long-term birth control side effects against PubMed research
with enhanced source tracking and clinical significance assessment.
"""

import json
import os
import sys
import time
from pathlib import Path
from typing import List, Dict, Optional
from collections import defaultdict

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_collection.pubmed_fetcher import PubMedFetcher


class LongTermEvidenceValidator:
    """
    Validate long-term side effects with comprehensive PubMed research.

    Focus areas:
    - Long-term effects (5+ years use)
    - Chronic/persistent effects
    - Effects after discontinuation
    - Serious health outcomes (cancer, bone density, cardiovascular)
    """

    # Clinical significance categories
    CLINICALLY_SIGNIFICANT = [
        "cancer", "breast cancer", "cervical cancer", "ovarian cancer",
        "bone density", "osteoporosis", "bone loss", "osteopenia",
        "blood clot", "thrombosis", "stroke", "heart attack", "cardiovascular",
        "fertility", "infertility", "pregnancy",
        "depression", "anxiety", "mental health", "cognitive",
        "liver", "gallbladder",
        "vision", "blindness"
    ]

    def __init__(self, pubmed_email: Optional[str] = None):
        """Initialize with PubMed fetcher."""
        self.pubmed = PubMedFetcher(email=pubmed_email)

    def load_long_term_stats(self, filepath: str = 'data/analysis/long_term_side_effects_top20.json') -> List[Dict]:
        """Load top long-term side effects for validation."""
        print(f"📂 Loading long-term side effects from {filepath}...")

        project_root = Path(__file__).parent.parent.parent
        full_path = project_root / filepath

        if not full_path.exists():
            print(f"   ❌ File not found: {filepath}")
            return []

        with open(full_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        print(f"   ✓ Loaded {len(data)} long-term side effects")

        # Apply deduplication
        deduped_data = self.deduplicate_side_effects(data)
        print(f"   ✓ After deduplication: {len(deduped_data)} unique side effects")

        return deduped_data

    def deduplicate_side_effects(self, side_effects: List[Dict]) -> List[Dict]:
        """
        Deduplicate side effects by merging common variations.

        Merges:
        - PMDD variations
        - Acne variations
        - Libido variations
        - Heavy bleeding variations
        - Mood variations
        """
        # Mapping of variations to standardized names
        MERGE_RULES = {
            "premenstrual dysphoric disorder (PMDD)": "premenstrual dysphoric disorder",
            "premenstrual dysphoric disorder (pmdd)": "premenstrual dysphoric disorder",
            "PMDD": "premenstrual dysphoric disorder",
            "severe PMDD": "premenstrual dysphoric disorder",
            "PMDD episodes": "premenstrual dysphoric disorder",
            "severe acne": "acne",
            "acne exacerbation": "acne",
            "cystic acne": "acne",
            "hormonal acne": "acne",
            "low libido": "decreased libido",
            "loss of libido": "decreased libido",
            "no sex drive": "decreased libido",
            "menorrhagia": "heavy menstrual flow",
            "heavy periods": "heavy menstrual flow",
            "excessive bleeding": "heavy menstrual flow",
            "mood instability": "mood swings",
            "emotional instability": "mood swings",
            "mood changes": "mood swings"
        }

        # Group side effects by standardized name
        merged = defaultdict(list)

        for effect in side_effects:
            original_name = effect['side_effect']
            # Check if this effect should be merged
            standard_name = MERGE_RULES.get(original_name, original_name)

            # Also check for case-insensitive matches
            if standard_name == original_name:
                for variant, standard in MERGE_RULES.items():
                    if original_name.lower() == variant.lower():
                        standard_name = standard
                        break

            merged[standard_name].append(effect)

        # Combine data for merged effects
        deduplicated = []
        for standard_name, effects_list in merged.items():
            if len(effects_list) == 1:
                # No merging needed
                deduplicated.append(effects_list[0])
            else:
                # Merge multiple entries
                print(f"   🔄 Merging {len(effects_list)} entries for: {standard_name}")

                # Combine statistics
                combined = {
                    'side_effect': standard_name,
                    'mention_count': sum(e.get('mention_count', 0) for e in effects_list),
                    'post_count': sum(e.get('post_count', 0) for e in effects_list),
                    'frequency': max(e.get('frequency', 0) for e in effects_list),
                    'category': effects_list[0].get('category', 'unknown'),
                    'examples': [],
                    'temporal_contexts': [],
                    'avg_years_when_appeared': None,
                    'persists_after_stopping': None,
                    'severity_distribution': {}
                }

                # Combine examples (take first 3 unique)
                seen_examples = set()
                for effect in effects_list:
                    for example in effect.get('examples', []):
                        if example not in seen_examples and len(combined['examples']) < 3:
                            combined['examples'].append(example)
                            seen_examples.add(example)

                # Combine temporal contexts and deduplicate
                for effect in effects_list:
                    combined['temporal_contexts'].extend(effect.get('temporal_contexts', []))
                # Remove duplicates while preserving order
                seen = set()
                unique_contexts = []
                for ctx in combined['temporal_contexts']:
                    if ctx and ctx not in seen:
                        unique_contexts.append(ctx)
                        seen.add(ctx)
                combined['temporal_contexts'] = unique_contexts[:3]

                # Average years when appeared
                years_list = [e.get('avg_years_when_appeared') for e in effects_list if e.get('avg_years_when_appeared')]
                if years_list:
                    combined['avg_years_when_appeared'] = round(sum(years_list) / len(years_list), 1)

                # Persistence after stopping (true if any say true)
                persistence_list = [e.get('persists_after_stopping') for e in effects_list if e.get('persists_after_stopping') is not None]
                if persistence_list:
                    combined['persists_after_stopping'] = any(persistence_list)

                # Combine severity distribution
                for effect in effects_list:
                    for severity, count in effect.get('severity_distribution', {}).items():
                        combined['severity_distribution'][severity] = combined['severity_distribution'].get(severity, 0) + count

                # Recalculate frequency
                combined['frequency'] = round(combined['post_count'] / 179, 3)  # 179 is total long-term posts

                deduplicated.append(combined)

        # Sort by post count
        deduplicated.sort(key=lambda x: x['post_count'], reverse=True)

        return deduplicated

    def is_relevant_paper(self, paper: Dict, side_effect: str) -> bool:
        """
        Check if a paper is actually relevant to birth control side effects.

        Filters out:
        - Papers not about birth control/contraceptives
        - COVID-19 papers
        - Coffee/caffeine studies
        - Papers where BC is only mentioned as a confounding variable
        """
        # Must have title or abstract
        if not paper.get('title') and not paper.get('abstract'):
            return False

        title = (paper.get('title') or '').lower()
        abstract = (paper.get('abstract') or '').lower()
        combined = title + ' ' + abstract

        # Exclude obvious non-BC papers
        exclude_keywords = [
            'coffee', 'caffeine', 'covid-19', 'sars-cov-2', 'coronavirus',
            'pneumococcal', 'cytomegalovirus', 'congenital heart',
            'pneumonia vaccine', 'vaccination', 'vaccine safety'
        ]
        for keyword in exclude_keywords:
            if keyword in combined:
                return False

        # Must mention birth control/contraceptive
        bc_keywords = [
            'contraceptive', 'contraception', 'birth control',
            'oral contraceptive', 'hormonal contraceptive',
            'combined oral contraceptive', 'progestin', 'estrogen',
            'levonorgestrel', 'ethinyl estradiol', 'depo-provera',
            'mirena', 'iud', 'implant', 'nuvaring', 'patch'
        ]

        has_bc_keyword = any(keyword in combined for keyword in bc_keywords)

        # If no BC keyword, it's not relevant
        if not has_bc_keyword:
            return False

        # Check if side effect is mentioned
        side_effect_lower = side_effect.lower()
        if side_effect_lower not in combined:
            return False

        return True

    def search_pubmed_long_term(self, side_effect: str) -> Dict:
        """
        Search PubMed with long-term specific queries.

        Searches:
        1. "oral contraceptive [side_effect] long-term" (primary)
        2. "birth control [side_effect] chronic" (secondary)
        3. "hormonal contraception [side_effect] years" (tertiary)

        Returns papers with full metadata for citation.
        """
        all_papers = {}
        total_count = 0

        print(f"   🔬 Searching PubMed for '{side_effect}' (long-term focus)...")

        # Query 1: Long-term oral contraceptive use
        query1 = f'oral contraceptive {side_effect} long-term'
        pmids1 = self.pubmed.search_papers(query1, max_results=8, min_year=2010)
        papers1 = self.pubmed.fetch_paper_details(pmids1)

        for paper in papers1:
            if self.is_relevant_paper(paper, side_effect):
                all_papers[paper['pmid']] = paper
        print(f"      Query 1 (long-term): {len(papers1)} papers, {len([p for p in papers1 if self.is_relevant_paper(p, side_effect)])} relevant")

        # Query 2: Chronic effects
        query2 = f'birth control {side_effect} chronic'
        pmids2 = self.pubmed.search_papers(query2, max_results=5, min_year=2010)
        papers2 = self.pubmed.fetch_paper_details(pmids2)

        for paper in papers2:
            if self.is_relevant_paper(paper, side_effect):
                all_papers[paper['pmid']] = paper
        print(f"      Query 2 (chronic): {len(papers2)} papers, {len([p for p in papers2 if self.is_relevant_paper(p, side_effect)])} relevant")

        # Query 3: Years of use
        query3 = f'hormonal contraception {side_effect} years'
        pmids3 = self.pubmed.search_papers(query3, max_results=5, min_year=2010)
        papers3 = self.pubmed.fetch_paper_details(pmids3)

        for paper in papers3:
            if self.is_relevant_paper(paper, side_effect):
                all_papers[paper['pmid']] = paper
        print(f"      Query 3 (years): {len(papers3)} papers, {len([p for p in papers3 if self.is_relevant_paper(p, side_effect)])} relevant")

        papers_list = list(all_papers.values())
        total_count = len(papers_list)

        print(f"      ✓ Total unique relevant papers: {total_count}")

        return {
            'paper_count': total_count,
            'papers': papers_list
        }

    def assess_clinical_significance(self, side_effect: str) -> str:
        """
        Assess clinical significance of side effect.

        Returns: "High", "Moderate", or "Low"
        """
        side_effect_lower = side_effect.lower()

        # High significance: serious health outcomes
        for sig_term in self.CLINICALLY_SIGNIFICANT:
            if sig_term in side_effect_lower:
                return "High"

        # Moderate: affects quality of life significantly
        moderate_terms = [
            "chronic", "severe", "persistent", "lasting",
            "migraine", "pain", "bleeding", "weight"
        ]
        for term in moderate_terms:
            if term in side_effect_lower:
                return "Moderate"

        return "Low"

    def determine_validation_status(self, paper_count: int) -> str:
        """
        Determine validation status based on research found.

        Returns: "Validated", "Limited Evidence", or "No Research Found"
        """
        if paper_count >= 3:
            return "Validated"
        elif paper_count >= 1:
            return "Limited Evidence"
        else:
            return "No Research Found"

    def calculate_surprise_score(self, reddit_freq: float, paper_count: int) -> float:
        """Calculate surprise score for long-term effects."""
        # Cap research coverage at 15 papers for long-term (higher threshold)
        research_coverage = min(paper_count / 15.0, 1.0)

        # Surprise = patient frequency × lack of research
        surprise = reddit_freq * (1 - research_coverage)

        return round(surprise, 3)

    def validate_all_long_term_effects(self, side_effects: List[Dict],
                                      total_posts: int) -> List[Dict]:
        """
        Validate all long-term side effects with PubMed.

        Args:
            side_effects: List of long-term side effect stats
            total_posts: Total long-term posts analyzed

        Returns:
            List of validated effects with full source citations
        """
        print(f"\n🔬 Long-Term Evidence Validation Pipeline")
        print("=" * 60)
        print(f"Validating {len(side_effects)} long-term side effects...")
        print(f"Total long-term posts: {total_posts}\n")

        validated = []

        for i, effect_data in enumerate(side_effects, 1):
            side_effect = effect_data['side_effect']
            mention_count = effect_data.get('mention_count', 0)
            post_count = effect_data.get('post_count', 0)
            frequency = effect_data.get('frequency', 0)

            print(f"[{i}/{len(side_effects)}] Validating: {side_effect}")
            print(f"   Reddit: {mention_count} mentions, {post_count} posts ({frequency*100:.1f}%)")

            # Search PubMed with long-term queries
            pubmed_data = self.search_pubmed_long_term(side_effect)

            # Assess clinical significance
            clinical_sig = self.assess_clinical_significance(side_effect)

            # Determine validation status
            validation_status = self.determine_validation_status(pubmed_data['paper_count'])

            # Calculate surprise score
            surprise_score = self.calculate_surprise_score(frequency, pubmed_data['paper_count'])

            print(f"   PubMed: {pubmed_data['paper_count']} papers found")
            print(f"   Status: {validation_status}")
            print(f"   Clinical Significance: {clinical_sig}")
            print(f"   Surprise: {surprise_score:.3f}")

            # Create validated entry with full source tracking
            validated_entry = {
                'side_effect': side_effect,
                'validation_status': validation_status,
                'clinical_significance': clinical_sig,
                'surprise_score': surprise_score,
                'reddit_data': {
                    'mention_count': mention_count,
                    'post_count': post_count,
                    'frequency': frequency,
                    'category': effect_data.get('category', 'unknown'),
                    'examples': effect_data.get('examples', [])[:3],
                    'temporal_contexts': effect_data.get('temporal_contexts', []),
                    'avg_years_when_appeared': effect_data.get('avg_years_when_appeared'),
                    'persists_after_stopping': effect_data.get('persists_after_stopping'),
                    'severity_distribution': effect_data.get('severity_distribution', {})
                },
                'pubmed_data': {
                    'paper_count': pubmed_data['paper_count'],
                    'papers': [
                        {
                            'pmid': p['pmid'],
                            'title': p['title'],
                            'year': p.get('year', 'N/A'),
                            'journal': p.get('journal', 'Unknown'),
                            'url': p['url']
                        }
                        for p in pubmed_data['papers'][:10]  # Top 10 papers with full metadata
                    ]
                }
            }

            validated.append(validated_entry)
            print()

            # Rate limiting for PubMed API
            time.sleep(1.0)

        # Sort by surprise score (highest first)
        validated.sort(key=lambda x: x['surprise_score'], reverse=True)

        print("✅ Validation complete!")
        return validated

    def save_validated_results(self, validated_effects: List[Dict], total_posts: int):
        """Save validated long-term effects with comprehensive metadata."""
        project_root = Path(__file__).parent.parent.parent
        output_dir = project_root / 'data' / 'validated' / 'long_term'
        output_dir.mkdir(parents=True, exist_ok=True)

        # Save full validated database
        db_file = output_dir / 'validated_long_term_effects.json'
        with open(db_file, 'w', encoding='utf-8') as f:
            json.dump(validated_effects, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved validated database:")
        print(f"   {db_file.relative_to(project_root)}")

        # Create summary for frontend
        summary = {
            'total_effects': len(validated_effects),
            'total_posts_analyzed': total_posts,
            'by_validation_status': {},
            'by_clinical_significance': {},
            'high_surprise_effects': [],
            'research_gaps': [],
            'top_effects': []
        }

        # Count by validation status
        for effect in validated_effects:
            status = effect['validation_status']
            summary['by_validation_status'][status] = summary['by_validation_status'].get(status, 0) + 1

            sig = effect['clinical_significance']
            summary['by_clinical_significance'][sig] = summary['by_clinical_significance'].get(sig, 0) + 1

        # High surprise effects (surprise score >= 0.015)
        summary['high_surprise_effects'] = [
            {
                'side_effect': e['side_effect'],
                'surprise_score': e['surprise_score'],
                'validation_status': e['validation_status'],
                'post_count': e['reddit_data']['post_count'],
                'paper_count': e['pubmed_data']['paper_count']
            }
            for e in validated_effects
            if e['surprise_score'] >= 0.015
        ]

        # Research gaps (high patient reports but no/limited research)
        summary['research_gaps'] = [
            {
                'side_effect': e['side_effect'],
                'reddit_mentions': e['reddit_data']['mention_count'],
                'pubmed_papers': e['pubmed_data']['paper_count'],
                'clinical_significance': e['clinical_significance']
            }
            for e in validated_effects
            if e['reddit_data']['post_count'] >= 10 and e['pubmed_data']['paper_count'] < 3
        ]

        # Top effects for frontend display
        summary['top_effects'] = validated_effects[:20]

        # Save summary
        summary_file = output_dir / 'validation_summary.json'
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"   {summary_file.relative_to(project_root)}")

        # Copy to frontend directory
        frontend_dir = project_root / 'frontend' / 'data'
        frontend_dir.mkdir(parents=True, exist_ok=True)

        frontend_file = frontend_dir / 'long_term_validation_summary.json'
        with open(frontend_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"   {frontend_file.relative_to(project_root)}")

        # Print summary
        print(f"\n📊 Validation Summary:")
        print(f"   Total long-term effects validated: {summary['total_effects']}")
        print(f"\n   By Validation Status:")
        for status, count in summary['by_validation_status'].items():
            print(f"      {status}: {count}")
        print(f"\n   By Clinical Significance:")
        for sig, count in summary['by_clinical_significance'].items():
            print(f"      {sig}: {count}")
        print(f"\n   High surprise effects: {len(summary['high_surprise_effects'])}")
        print(f"   Research gaps identified: {len(summary['research_gaps'])}")


def main():
    """Main entry point."""
    project_root = Path(__file__).parent.parent.parent

    print("\n🔬 Long-Term Birth Control Side Effects - Evidence Validation")
    print("=" * 60)

    # Load long-term side effect stats
    validator = LongTermEvidenceValidator()
    side_effects = validator.load_long_term_stats()

    if not side_effects:
        print("\n❌ No long-term side effects found!")
        print("   Run: python -m src.analysis.long_term_side_effect_extractor first")
        return

    # Get total posts from filter report
    filter_report_file = project_root / 'data/analysis/long_term_filter_report.json'
    if filter_report_file.exists():
        with open(filter_report_file, 'r', encoding='utf-8') as f:
            filter_data = json.load(f)
            total_posts = filter_data['posts_matching_long_term']
    else:
        total_posts = 179  # Default from our filtering

    # Validate all effects
    validated = validator.validate_all_long_term_effects(side_effects, total_posts)

    # Save results
    validator.save_validated_results(validated, total_posts)

    print("\n" + "=" * 60)
    print("✅ LONG-TERM VALIDATION COMPLETE")
    print("=" * 60)
    print(f"\nValidated {len(validated)} long-term side effects with PubMed sources")
    print(f"\n💡 Next step: Create frontend UI to display results")
    print("   Frontend data ready at: frontend/data/long_term_validation_summary.json")


if __name__ == "__main__":
    main()
