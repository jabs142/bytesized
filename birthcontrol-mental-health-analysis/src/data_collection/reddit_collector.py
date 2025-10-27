"""
Reddit Data Collector
======================
Collects posts and comments from Reddit about birth control mental health effects.

LEARNING CONCEPTS:
- API authentication and rate limiting
- Data collection best practices
- Ethical web scraping
- Structured data extraction
"""

import praw
import json
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm
import sys

# Add parent directory to path to import config
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class RedditCollector:
    """
    Collects Reddit posts related to birth control mental health effects.

    DESIGN PATTERN: This class encapsulates all Reddit collection logic.
    In ML/AI projects, separating data collection from processing is crucial.
    """

    def __init__(self):
        """Initialize Reddit API connection with authentication."""

        # Validate credentials before attempting connection
        if not Config.validate_reddit_credentials():
            raise ValueError(
                "Reddit credentials not found. Please:\n"
                "1. Copy .env.example to .env\n"
                "2. Get Reddit API credentials from https://www.reddit.com/prefs/apps\n"
                "3. Fill in your credentials in .env"
            )

        # PRAW (Python Reddit API Wrapper) handles OAuth authentication
        # Read-only mode is sufficient for data collection
        self.reddit = praw.Reddit(
            client_id=Config.REDDIT_CLIENT_ID,
            client_secret=Config.REDDIT_CLIENT_SECRET,
            user_agent=Config.REDDIT_USER_AGENT,
            # Read-only mode: no voting, posting, or commenting
            # This is ethical for research purposes
            read_only=True
        )

        print(f"✓ Connected to Reddit as: {self.reddit.user.me() if not self.reddit.read_only else 'Read-Only User'}")

    def search_subreddit(
        self,
        subreddit_name: str,
        keywords: List[str],
        max_posts: int = 100,
        time_filter: str = 'all'
    ) -> List[Dict]:
        """
        Search a subreddit for posts containing mental health keywords.

        LEARNING: Search vs. Scraping
        - This uses Reddit's official API (ethical, legal, rate-limited)
        - Alternative: Web scraping (fragile, possibly violates ToS)

        Args:
            subreddit_name: Name of subreddit (e.g., 'birthcontrol')
            keywords: List of keywords to search for
            max_posts: Maximum number of posts to collect
            time_filter: 'all', 'year', 'month', 'week', 'day'

        Returns:
            List of dictionaries containing post data
        """

        subreddit = self.reddit.subreddit(subreddit_name)
        collected_posts = []

        # Create search query combining keywords with OR
        # Example: "(depression OR anxiety OR mood)"
        search_query = ' OR '.join(keywords)

        print(f"\n📊 Searching r/{subreddit_name} for: {search_query}")
        print(f"   Limit: {max_posts} posts | Time: {time_filter}")

        try:
            # Search returns a generator - efficient for large datasets
            # We use .search() instead of .hot() or .new() for keyword filtering
            search_results = subreddit.search(
                search_query,
                limit=max_posts,
                time_filter=time_filter,
                sort='relevance'  # Most relevant posts first
            )

            # tqdm provides a progress bar - helpful for long operations
            for post in tqdm(search_results, desc=f"r/{subreddit_name}", total=max_posts):

                # Extract structured data from the post
                # This is the first step in any NLP pipeline: data structuring
                post_data = self._extract_post_data(post)
                collected_posts.append(post_data)

                # ETHICAL CONSIDERATION: Rate limiting
                # Reddit API has rate limits. We add delays to be respectful.
                # This also prevents overwhelming the server.
                time.sleep(Config.RATE_LIMIT_DELAY)

            print(f"✓ Collected {len(collected_posts)} posts from r/{subreddit_name}")

        except Exception as e:
            print(f"✗ Error collecting from r/{subreddit_name}: {e}")

        return collected_posts

    def _extract_post_data(self, post) -> Dict:
        """
        Extract relevant fields from a Reddit post object.

        LEARNING: Data Extraction
        - We only keep fields relevant to our analysis
        - This reduces storage and processing overhead
        - Privacy: We deliberately exclude user-identifying information
        """

        return {
            # Post identifiers (for deduplication)
            'id': post.id,
            'created_utc': post.created_utc,
            'created_date': datetime.fromtimestamp(post.created_utc).isoformat(),

            # Content (what we'll analyze with NLP/LLMs)
            'title': post.title,
            'selftext': post.selftext,  # Post body text
            'text_length': len(post.selftext),

            # Metadata (useful for filtering and quality assessment)
            'subreddit': str(post.subreddit),
            'score': post.score,  # Upvotes - downvotes
            'upvote_ratio': post.upvote_ratio,
            'num_comments': post.num_comments,

            # Post characteristics
            'is_self': post.is_self,  # Text post vs. link
            'link_flair_text': post.link_flair_text,  # Subreddit flair

            # URL (for reference, not scraping)
            'permalink': f"https://reddit.com{post.permalink}",

            # Collection metadata
            'collected_at': datetime.now().isoformat(),

            # PRIVACY NOTE: We deliberately DO NOT collect:
            # - author username (PII)
            # - author profile information
            # - exact geolocation data
        }

    def save_posts(self, posts: List[Dict], filename: str):
        """
        Save collected posts to JSON file.

        LEARNING: Data Serialization
        - JSON is human-readable and widely supported
        - JSONL (JSON Lines) is better for large datasets - one object per line
        - For production ML, consider Parquet or Arrow formats
        """

        filepath = Config.RAW_DATA_DIR / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)

        print(f"✓ Saved {len(posts)} posts to {filepath}")

        # Print summary statistics
        total_text_length = sum(p['text_length'] for p in posts)
        avg_score = sum(p['score'] for p in posts) / len(posts) if posts else 0

        print(f"  Total text collected: {total_text_length:,} characters")
        print(f"  Average post score: {avg_score:.1f}")


def main():
    """
    Main collection script.

    This demonstrates a typical data collection workflow:
    1. Initialize collector
    2. Define search parameters
    3. Collect data
    4. Save to disk
    """

    # Initialize collector
    collector = RedditCollector()

    # Define mental health keywords
    # LEARNING: Keyword selection is crucial for data mining
    # These keywords were chosen based on medical literature
    mental_health_keywords = [
        'depression',
        'anxiety',
        'mood swings',
        'emotional',
        'mental health',
        'suicidal',
        'panic',
        'irritability',
        'mood',
        'crying',
        'anger',
        'rage'
    ]

    # Target subreddits
    subreddits = [
        'birthcontrol',
        'PMDD',
        'TwoXChromosomes'
    ]

    # Collect data from each subreddit
    all_posts = []

    for subreddit in subreddits:
        posts = collector.search_subreddit(
            subreddit_name=subreddit,
            keywords=mental_health_keywords,
            max_posts=100,  # Start small for learning
            time_filter='year'  # Last year of posts
        )
        all_posts.extend(posts)

    # Save collected data
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'reddit_mental_health_posts_{timestamp}.json'
    collector.save_posts(all_posts, filename)

    print(f"\n✓ Collection complete! Total posts: {len(all_posts)}")
    print(f"  Next steps:")
    print(f"  1. Run the exploratory analysis notebook")
    print(f"  2. Review data quality")
    print(f"  3. Begin preprocessing for NLP")


if __name__ == '__main__':
    main()
