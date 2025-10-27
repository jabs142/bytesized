"""
Reddit Data Collector
======================
Collects posts and comments from Reddit about birth control side effects.

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
    Collects Reddit posts related to birth control side effects (mental + physical).

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
        Search a subreddit for posts containing symptom keywords.

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

    def _extract_post_data(self, post, include_comments: bool = True) -> Dict:
        """
        Extract relevant fields from a Reddit post object.

        LEARNING: Data Extraction
        - We only keep fields relevant to our analysis
        - This reduces storage and processing overhead
        - Privacy: We deliberately exclude user-identifying information

        Args:
            post: PRAW Submission object
            include_comments: Whether to extract top comments (slower but richer data)
        """

        post_data = {
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

        # Optionally extract top comments
        # This is slower but provides richer context for analysis
        if include_comments:
            post_data['top_comments'] = self._extract_top_comments(post, max_comments=5)

        return post_data

    def _extract_top_comments(self, post, max_comments: int = 5) -> List[Dict]:
        """
        Extract top comments from a Reddit post.

        LEARNING: Working with Reddit Comments
        - Comments form a tree structure (replies to replies)
        - We flatten this to get top-level comments
        - PRAW requires .replace_more() to fully load all comments
        - This can be slow, so we limit it

        Args:
            post: PRAW Submission object
            max_comments: Maximum number of comments to extract

        Returns:
            List of comment dictionaries with text and metadata
        """

        comments_data = []

        try:
            # PRAW lazily loads comments. replace_more(limit=0) loads all top-level
            # Setting limit=0 means "don't load any 'load more comments' sections"
            # This is faster but might miss some comments - good for our use case
            post.comments.replace_more(limit=0)

            # Get top-level comments (not replies)
            top_comments = post.comments[:max_comments]

            for comment in top_comments:
                # Skip deleted, removed, or low-quality comments
                # We filter for score >= 1 to keep reasonably valued comments
                if (hasattr(comment, 'body') and
                    comment.body not in ['[deleted]', '[removed]'] and
                    comment.score >= 1):  # ← Quality filter!

                    comment_data = {
                        'id': comment.id,
                        'text': comment.body,
                        'score': comment.score,
                        'created_utc': comment.created_utc,
                        # We deliberately don't include author for privacy
                    }
                    comments_data.append(comment_data)

        except Exception as e:
            # If comment extraction fails, don't crash the whole collection
            print(f"  Warning: Could not extract comments: {e}")
            pass

        return comments_data

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
    Main collection script with DEDUPLICATION and EXPANDED symptoms.

    Workflow:
    1. Load existing post IDs to avoid duplicates
    2. Initialize collector
    3. Define search parameters (mental + physical symptoms)
    4. Collect data with deduplication
    5. Save to disk
    """

    # Initialize collector
    collector = RedditCollector()

    # ============================================
    # DEDUPLICATION: Load existing post IDs
    # ============================================
    print("\n🔍 Checking for existing data...")
    existing_ids = set()

    # Look for any existing data files
    data_dir = Path(Config.RAW_DATA_DIR)
    existing_files = list(data_dir.glob('reddit_*_posts_*.json'))

    for file_path in existing_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                for post in existing_data:
                    existing_ids.add(post['id'])
        except Exception as e:
            print(f"  Warning: Could not load {file_path.name}: {e}")

    print(f"✓ Found {len(existing_ids)} existing post IDs (will skip duplicates)")

    # ============================================
    # EXPANDED KEYWORDS: Mental + Physical symptoms
    # ============================================
    # LEARNING: Comprehensive keyword list for pattern discovery
    # We now search for BOTH mental and physical symptoms
    symptom_keywords = [
        # Mental health symptoms
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
        'rage',
        'brain fog',

        # Physical symptoms
        'acne',
        'breakout',
        'yeast infection',
        'vaginal dryness',
        'hair loss',
        'weight gain',
        'bloating',
        'low libido',
        'spotting',
        'heavy bleeding',
        'headache',
        'nausea',

        # Post-pill specific
        'post pill',
        'after stopping',
        'came off',
        'quit the pill',
    ]

    # Target subreddits (added SkincareAddiction for physical symptoms)
    subreddits = [
        'birthcontrol',
        'PMDD',
        'TwoXChromosomes',
        'SkincareAddiction'  # For acne/skin-related symptoms
    ]

    # ============================================
    # COLLECTION WITH DEDUPLICATION
    # ============================================
    all_posts = []
    duplicates_skipped = 0

    for subreddit in subreddits:
        posts = collector.search_subreddit(
            subreddit_name=subreddit,
            keywords=symptom_keywords,
            max_posts=150,  # Increased for better pattern discovery
            time_filter='year'  # Last year of posts
        )

        # Deduplicate
        for post in posts:
            if post['id'] not in existing_ids:
                all_posts.append(post)
                existing_ids.add(post['id'])  # Track for inter-subreddit dedup
            else:
                duplicates_skipped += 1

    print(f"\n📊 Deduplication Results:")
    print(f"  New posts collected: {len(all_posts)}")
    print(f"  Duplicates skipped: {duplicates_skipped}")

    # Save collected data
    if all_posts:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'reddit_bc_side_effects_{timestamp}.json'  # Birth control side effects
        collector.save_posts(all_posts, filename)

        print(f"\n✓ Collection complete! Total posts: {len(all_posts)}")
        print(f"  Next steps:")
        print(f"  1. Run pattern mining analysis")
        print(f"  2. Discover symptom relationships")
        print(f"  3. Build knowledge graph")
    else:
        print(f"\n⚠️  No new posts found (all were duplicates)")
        print(f"  Try different subreddits or time filters")


if __name__ == '__main__':
    main()
