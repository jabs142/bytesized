"""
PubMed Link Addition Script

This script provides a framework for adding PubMed research links to side effects.
Since live PubMed API access requires setup, this script documents the manual
search process and provides a template for storing results.

MANUAL SEARCH INSTRUCTIONS:
1. Go to https://pubmed.ncbi.nlm.nih.gov/
2. Use the search queries below for each side effect
3. Record the top 3-5 most relevant papers
4. Update the PUBMED_LINKS dictionary below
5. Run this script to update validation_summary.json

Priority Side Effects for Link Addition:
- Dry skin (15 mentions, 1 paper) - SURPRISING
- Severe emotional distress (11 mentions, 0 papers) - VERY SURPRISING
- Anxiety (86 mentions, 9 papers) - HIGH VOLUME
"""

import json
from pathlib import Path
from typing import Dict, List

# File paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
VALIDATION_SUMMARY_PATH = PROJECT_ROOT / "data/validated/validation_summary.json"

# PubMed Search Queries to Use:
SEARCH_QUERIES = {
    "dry skin": [
        '"contraceptive" AND ("dry skin" OR "skin dryness" OR "dermatological")',
        '"hormonal birth control" AND "xerosis"',
        '"oral contraceptive" AND "skin moisture"'
    ],
    "severe emotional distress": [
        '"contraceptive" AND ("emotional distress" OR "psychological distress" OR "emotional crisis")',
        '"birth control" AND "severe mood changes"',
        '"hormonal contraception" AND "emotional dysregulation"'
    ],
    "anxiety": [
        '"contraceptive" AND "anxiety"',
        '"birth control" AND "anxiety disorder"',
        '"hormonal contraception" AND "anxiolytic"'
    ],
    "depression": [
        '"contraceptive" AND "depression"',
        '"birth control" AND "depressive symptoms"',
        '"oral contraceptive" AND "major depressive disorder"'
    ],
    "acne": [
        '"contraceptive" AND "acne"',
        '"birth control" AND "acne vulgaris"',
        '"hormonal contraception" AND "skin inflammation"'
    ]
}

# TODO: Fill this dictionary with actual PubMed links after manual searches
# Format: {
#     "side_effect_name": [
#         {
#             "title": "Full paper title",
#             "url": "https://pubmed.ncbi.nlm.nih.gov/PMID",
#             "year": 2023,
#             "authors": "Last name et al.",
#             "journal": "Journal name",
#             "key_finding": "Brief summary of relevant finding"
#         }
#     ]
# }
PUBMED_LINKS: Dict[str, List[Dict]] = {
    "dry skin": [
        # {
        #     "title": "Example: Dermatological effects of hormonal contraceptives",
        #     "url": "https://pubmed.ncbi.nlm.nih.gov/12345678",
        #     "year": 2020,
        #     "authors": "Smith et al.",
        #     "journal": "J Dermatol",
        #     "key_finding": "Minimal research on xerosis from contraceptives"
        # }
    ],
    "severe emotional distress": [
        # Likely empty - this is the research gap!
    ],
    "anxiety": [
        # Add 3-5 top papers here after manual search
    ]
}


def add_pubmed_links_to_validation():
    """
    Add PubMed links to validation_summary.json
    """
    print("Loading validation summary...")

    with open(VALIDATION_SUMMARY_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Track updates
    updated_count = 0

    # Add links to each side effect
    for side_effect in data['side_effects']:
        effect_name = side_effect['side_effect'].lower()

        # Check if we have links for this side effect
        if effect_name in PUBMED_LINKS and len(PUBMED_LINKS[effect_name]) > 0:
            side_effect['pubmed_links'] = PUBMED_LINKS[effect_name]
            updated_count += 1
            print(f"✓ Added {len(PUBMED_LINKS[effect_name])} links for '{effect_name}'")
        else:
            # Ensure the key exists even if empty
            side_effect['pubmed_links'] = []

    # Save updated data
    print(f"\nSaving updated validation summary...")
    with open(VALIDATION_SUMMARY_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Updated {updated_count} side effects with PubMed links")

    # Show summary
    total_side_effects = len(data['side_effects'])
    missing_links = total_side_effects - updated_count
    print(f"\nSummary:")
    print(f"  {updated_count}/{total_side_effects} side effects have PubMed links")
    print(f"  {missing_links} still need manual research")


def print_search_guide():
    """
    Print manual search instructions
    """
    print("\n" + "="*80)
    print("MANUAL PUBMED SEARCH GUIDE")
    print("="*80)
    print("\nFor each side effect, perform these searches on PubMed:")
    print("https://pubmed.ncbi.nlm.nih.gov/\n")

    for effect, queries in SEARCH_QUERIES.items():
        print(f"\n📋 {effect.upper()}")
        print("-" * 40)
        for i, query in enumerate(queries, 1):
            print(f"{i}. {query}")
        print("\nRecord top 3-5 papers and add to PUBMED_LINKS dictionary above")

    print("\n" + "="*80)
    print("After completing searches, run: python add_pubmed_links.py")
    print("="*80 + "\n")


if __name__ == '__main__':
    print("PubMed Link Addition Tool\n")

    # Check if links have been added
    total_links = sum(len(links) for links in PUBMED_LINKS.values())

    if total_links == 0:
        print("⚠️  No PubMed links added yet!")
        print_search_guide()
        print("\nUpdate the PUBMED_LINKS dictionary in this script, then run again.")
    else:
        print(f"Found {total_links} PubMed links to add")
        response = input("Proceed with update? (y/n): ")
        if response.lower() == 'y':
            add_pubmed_links_to_validation()
        else:
            print("Update cancelled")
