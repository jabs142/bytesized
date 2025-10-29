"""
Reddit Data Collector for PCOS Discussions
Collects 500 posts from 4 PCOS-related subreddits
"""
import praw
import json
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict
from tqdm import tqdm

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class PCOSRedditCollector:
    def __init__(self):
        """Initialize Reddit API client"""
        self.reddit = praw.Reddit(
            client_id=Config.REDDIT_CLIENT_ID,
            client_secret=Config.REDDIT_CLIENT_SECRET,
            user_agent=Config.REDDIT_USER_AGENT,
        )
        self.cutoff_date = datetime.now() - timedelta(days=Config.MONTHS_BACK * 30)

    def collect_from_subreddit(
        self, subreddit_name: str, target_count: int, search_pcos: bool = False
    ) -> List[Dict]:
        """
        Collect posts from a specific subreddit

        Args:
            subreddit_name: Name of subreddit
            target_count: Number of posts to collect
            search_pcos: If True, search for "PCOS", otherwise get all posts

        Returns:
            List of post dictionaries
        """
        print(f"\nCollecting from r/{subreddit_name}...")
        subreddit = self.reddit.subreddit(subreddit_name)
        posts = []

        try:
            if search_pcos:
                # Search for "PCOS" in subreddit
                submissions = subreddit.search(
                    Config.SEARCH_TERM, sort="relevance", time_filter="year", limit=target_count * 3
                )
            else:
                # Get recent posts
                submissions = subreddit.new(limit=target_count * 3)

            for submission in tqdm(submissions, desc=f"r/{subreddit_name}", total=target_count):
                # Check if post is within time range
                post_date = datetime.fromtimestamp(submission.created_utc)
                if post_date < self.cutoff_date:
                    continue

                # Skip if no content (removed/deleted)
                if not submission.selftext or submission.selftext in ["[removed]", "[deleted]"]:
                    continue

                # Collect top comments
                submission.comments.replace_more(limit=0)  # Don't expand "more comments"
                top_comments = []

                for comment in submission.comments[:10]:  # Top 10 comments
                    if hasattr(comment, "body") and comment.body not in ["[removed]", "[deleted]"]:
                        top_comments.append(
                            {
                                "author": str(comment.author) if comment.author else "[deleted]",
                                "body": comment.body,
                                "score": comment.score,
                                "created_utc": comment.created_utc,
                            }
                        )

                # Create post object
                post_data = {
                    "id": submission.id,
                    "subreddit": subreddit_name,
                    "title": submission.title,
                    "selftext": submission.selftext,
                    "author": str(submission.author) if submission.author else "[deleted]",
                    "created_utc": submission.created_utc,
                    "score": submission.score,
                    "num_comments": submission.num_comments,
                    "url": submission.url,
                    "top_comments": top_comments,
                    "collected_at": datetime.now().isoformat(),
                }

                posts.append(post_data)

                # Stop when we have enough
                if len(posts) >= target_count:
                    break

        except Exception as e:
            print(f"Error collecting from r/{subreddit_name}: {e}")

        print(f"Collected {len(posts)} posts from r/{subreddit_name}")
        return posts

    def collect_all(self) -> List[Dict]:
        """
        Collect all 500 posts from target subreddits

        Returns:
            List of all collected posts
        """
        all_posts = []

        for subreddit, target_count in Config.TARGET_SUBREDDITS.items():
            # Special handling for TwoXChromosomes - search for PCOS
            search_pcos = subreddit == "TwoXChromosomes"
            posts = self.collect_from_subreddit(subreddit, target_count, search_pcos)
            all_posts.extend(posts)

        print(f"\n{'='*50}")
        print(f"Total posts collected: {len(all_posts)}")
        print(f"Target: 500 posts")
        print(f"{'='*50}")

        return all_posts

    def save_posts(self, posts: List[Dict], filename: str = None):
        """
        Save collected posts to JSON file

        Args:
            posts: List of post dictionaries
            filename: Output filename (default from config)
        """
        if filename is None:
            filename = Config.REDDIT_POSTS_FILE

        output_path = Config.RAW_DATA_DIR / filename

        # Create directory if it doesn't exist
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Save to JSON
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)

        print(f"\nPosts saved to: {output_path}")

        # Print summary stats
        print(f"\nCollection Summary:")
        print(f"  Total posts: {len(posts)}")
        print(f"  Subreddits: {len(set(p['subreddit'] for p in posts))}")
        print(f"  Date range: {self.cutoff_date.date()} to {datetime.now().date()}")

        # Posts per subreddit
        from collections import Counter

        subreddit_counts = Counter(p["subreddit"] for p in posts)
        print(f"\nPosts per subreddit:")
        for subreddit, count in subreddit_counts.most_common():
            print(f"  r/{subreddit}: {count}")


def main():
    """Main execution function"""
    print("=" * 50)
    print("PCOS Surprise Discovery - Reddit Data Collection")
    print("=" * 50)

    # Check API credentials
    if not Config.validate_reddit_credentials():
        print("\n❌ Error: Reddit API credentials not found!")
        print("Please set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, and REDDIT_USER_AGENT in .env file")
        sys.exit(1)

    # Initialize collector
    collector = PCOSRedditCollector()

    # Collect posts
    posts = collector.collect_all()

    # Save posts
    collector.save_posts(posts)

    print("\n✅ Collection complete!")


if __name__ == "__main__":
    main()
