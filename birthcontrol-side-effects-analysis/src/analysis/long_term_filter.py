"""
Long-Term Side Effects Filter
Filters Reddit posts for mentions of long-term birth control use (5+ years)
"""

import json
import re
from pathlib import Path
from collections import Counter
from datetime import datetime
from typing import List, Dict, Tuple


class LongTermPostFilter:
    """Filter Reddit posts for long-term birth control mentions (5+ years)"""

    def __init__(self, min_years: int = 5):
        self.min_years = min_years

        # Regex patterns for duration extraction
        self.year_patterns = [
            r'(\d+)\s*(?:\+)?\s*years?',  # "5 years", "5+ years", "10 years"
            r'(?:for|been on|using|taken|taking)\s+(?:it\s+)?(?:for\s+)?(\d+)\s*(?:\+)?\s*years?',  # "been on for 5 years"
            r'(?:over|more than|almost|nearly|about)\s+(\d+)\s*years?',  # "over 5 years"
        ]

        # Long-term keywords (even without specific year count)
        self.long_term_keywords = [
            r'long.?term\s+(?:use|user|effects?)',
            r'chronic(?:ally)?',
            r'decade',
            r'many years',
            r'years? and years?',
            r'since\s+(?:I was|age)\s+\d+',  # "since I was 16" (calculate duration)
        ]

    def extract_years_from_text(self, text: str) -> List[int]:
        """Extract all year durations mentioned in text"""
        if not text:
            return []

        text_lower = text.lower()
        years_found = []

        # Extract explicit year counts
        for pattern in self.year_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                try:
                    years_found.append(int(match))
                except ValueError:
                    continue

        return years_found

    def has_long_term_keywords(self, text: str) -> bool:
        """Check if text contains long-term keywords"""
        if not text:
            return False

        text_lower = text.lower()
        for keyword_pattern in self.long_term_keywords:
            if re.search(keyword_pattern, text_lower):
                return True
        return False

    def get_all_text(self, post: Dict) -> str:
        """Combine all text from post (title + body + top comments)"""
        all_text = []

        # Add title
        if post.get('title'):
            all_text.append(post['title'])

        # Add body text
        if post.get('selftext'):
            all_text.append(post['selftext'])

        # Add top comments
        if post.get('top_comments'):
            for comment in post['top_comments']:
                if comment.get('text'):
                    all_text.append(comment['text'])

        return ' '.join(all_text)

    def is_long_term_post(self, post: Dict) -> Tuple[bool, List[int], bool]:
        """
        Check if post mentions long-term use (5+ years)

        Returns:
            (is_long_term, years_found, has_keywords)
        """
        all_text = self.get_all_text(post)

        # Extract years mentioned
        years_found = self.extract_years_from_text(all_text)

        # Check for long-term keywords
        has_keywords = self.has_long_term_keywords(all_text)

        # Post is long-term if:
        # 1. Mentions 5+ years explicitly, OR
        # 2. Has long-term keywords
        max_years = max(years_found) if years_found else 0
        is_long_term = max_years >= self.min_years or has_keywords

        return is_long_term, years_found, has_keywords

    def filter_posts(self, posts: List[Dict]) -> Tuple[List[Dict], Dict]:
        """
        Filter posts for long-term mentions

        Returns:
            (filtered_posts, metadata)
        """
        filtered_posts = []

        # Tracking statistics
        year_distribution = Counter()
        keyword_matches = 0
        explicit_year_matches = 0

        for post in posts:
            is_long_term, years_found, has_keywords = self.is_long_term_post(post)

            if is_long_term:
                # Add metadata to post
                post_copy = post.copy()
                post_copy['long_term_metadata'] = {
                    'years_mentioned': years_found,
                    'max_years': max(years_found) if years_found else None,
                    'has_long_term_keywords': has_keywords,
                    'filter_reason': []
                }

                # Track filtering reason
                if years_found:
                    max_years = max(years_found)
                    post_copy['long_term_metadata']['filter_reason'].append(
                        f"Mentions {max_years}+ years of use"
                    )
                    explicit_year_matches += 1

                    # Track distribution
                    if max_years >= 10:
                        year_distribution['10+ years'] += 1
                    elif max_years >= 8:
                        year_distribution['8-9 years'] += 1
                    elif max_years >= 5:
                        year_distribution['5-7 years'] += 1

                if has_keywords:
                    post_copy['long_term_metadata']['filter_reason'].append(
                        "Contains long-term keywords (chronic, long-term, decade, etc.)"
                    )
                    keyword_matches += 1

                filtered_posts.append(post_copy)

        # Create metadata report
        metadata = {
            'total_posts_analyzed': len(posts),
            'posts_matching_long_term': len(filtered_posts),
            'match_percentage': round(len(filtered_posts) / len(posts) * 100, 2),
            'explicit_year_matches': explicit_year_matches,
            'keyword_matches': keyword_matches,
            'year_distribution': dict(year_distribution),
            'filter_criteria': {
                'min_years_threshold': self.min_years,
                'year_patterns_used': len(self.year_patterns),
                'keyword_patterns_used': len(self.long_term_keywords)
            },
            'filtering_rationale': (
                f"Posts were selected if they mention {self.min_years}+ years of birth control use "
                "OR contain long-term indicators (chronic, long-term, decade, etc.). "
                "This captures both explicit duration mentions and implicit long-term use patterns."
            ),
            'filtered_at': datetime.now().isoformat()
        }

        return filtered_posts, metadata


def main():
    """Main filtering workflow"""
    print("=" * 60)
    print("LONG-TERM BIRTH CONTROL SIDE EFFECTS - POST FILTER")
    print("=" * 60)
    print()

    # Setup paths
    project_root = Path(__file__).parent.parent.parent
    data_dir = project_root / 'data'
    raw_dir = data_dir / 'raw'
    analysis_dir = data_dir / 'analysis'

    # Find the raw Reddit data file
    reddit_files = list(raw_dir.glob('reddit_bc_symptoms_posts_*.json'))
    if not reddit_files:
        print("❌ Error: No Reddit data files found in data/raw/")
        return

    reddit_file = reddit_files[0]  # Use most recent
    print(f"📂 Loading posts from: {reddit_file.name}")

    # Load posts
    with open(reddit_file, 'r', encoding='utf-8') as f:
        all_posts = json.load(f)

    print(f"   Total posts loaded: {len(all_posts)}")
    print()

    # Filter for long-term mentions (5+ years)
    print("🔍 Filtering for long-term use mentions (5+ years)...")
    filter = LongTermPostFilter(min_years=5)
    filtered_posts, metadata = filter.filter_posts(all_posts)

    print(f"   ✓ Found {len(filtered_posts)} posts matching long-term criteria")
    print(f"   ✓ Match rate: {metadata['match_percentage']}%")
    print()

    # Display breakdown
    print("📊 Filter Breakdown:")
    print(f"   • Explicit year mentions (5+ years): {metadata['explicit_year_matches']}")
    print(f"   • Long-term keyword matches: {metadata['keyword_matches']}")
    print()

    if metadata['year_distribution']:
        print("📈 Duration Distribution:")
        for duration_range, count in sorted(metadata['year_distribution'].items()):
            print(f"   • {duration_range}: {count} posts")
        print()

    # Save filtered posts
    output_file = analysis_dir / 'reddit_long_term_posts.json'
    print(f"💾 Saving filtered posts to: {output_file.name}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(filtered_posts, f, indent=2, ensure_ascii=False)

    # Save metadata report
    report_file = analysis_dir / 'long_term_filter_report.json'
    print(f"📋 Saving filter report to: {report_file.name}")
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print()
    print("=" * 60)
    print("✅ FILTERING COMPLETE")
    print("=" * 60)
    print()
    print("Filtering Rationale:")
    print(metadata['filtering_rationale'])
    print()
    print(f"Next step: Run long_term_side_effect_extractor.py to extract side effects from these {len(filtered_posts)} posts")


if __name__ == '__main__':
    main()
