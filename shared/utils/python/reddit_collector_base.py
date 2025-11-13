"""
Reddit Collector Base Class
===========================
Reusable base class for Reddit data collection across ByteSized projects.

Usage:
    from shared.utils.python.reddit_collector_base import RedditCollectorBase

    class MyRedditCollector(RedditCollectorBase):
        def process_post(self, post):
            # Custom processing logic
            return {
                "id": post.id,
                "title": post.title,
                # ... custom fields
            }
"""

import praw
import json
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional, Callable
from tqdm import tqdm
from abc import ABC, abstractmethod


class RedditCollectorBase(ABC):
    """
    Base class for Reddit data collectors.

    Provides common functionality:
    - PRAW authentication
    - Rate limiting
    - Error handling
    - Progress tracking
    - Data serialization
    """

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        user_agent: str,
        rate_limit_delay: float = 1.0
    ):
        """
        Initialize Reddit API connection.

        Args:
            client_id: Reddit API client ID
            client_secret: Reddit API client secret
            user_agent: Reddit API user agent
            rate_limit_delay: Delay between API calls (seconds)
        """
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        self.rate_limit_delay = rate_limit_delay

    @abstractmethod
    def process_post(self, post) -> Dict:
        """
        Process a single Reddit post.

        Must be implemented by subclass.

        Args:
            post: PRAW Submission object

        Returns:
            Processed post dictionary
        """
        pass

    def collect_from_subreddit(
        self,
        subreddit_name: str,
        limit: int = 100,
        time_filter: str = "month",
        sort: str = "hot"
    ) -> List[Dict]:
        """
        Collect posts from a subreddit.

        Args:
            subreddit_name: Name of subreddit (without r/)
            limit: Maximum number of posts to collect
            time_filter: Time filter (hour, day, week, month, year, all)
            sort: Sort method (hot, new, top, rising)

        Returns:
            List of processed post dictionaries
        """
        print(f"\nCollecting from r/{subreddit_name}...")
        subreddit = self.reddit.subreddit(subreddit_name)
        posts = []

        try:
            # Get submissions based on sort method
            if sort == "hot":
                submissions = subreddit.hot(limit=limit)
            elif sort == "new":
                submissions = subreddit.new(limit=limit)
            elif sort == "top":
                submissions = subreddit.top(time_filter=time_filter, limit=limit)
            elif sort == "rising":
                submissions = subreddit.rising(limit=limit)
            else:
                raise ValueError(f"Invalid sort method: {sort}")

            for submission in tqdm(submissions, desc=f"r/{subreddit_name}", total=limit):
                try:
                    # Process post using subclass implementation
                    processed_post = self.process_post(submission)
                    if processed_post:
                        posts.append(processed_post)

                    # Rate limiting
                    time.sleep(self.rate_limit_delay)

                except Exception as e:
                    print(f"Error processing post {submission.id}: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error accessing r/{subreddit_name}: {str(e)}")

        print(f"Collected {len(posts)} posts from r/{subreddit_name}")
        return posts

    def search_subreddit(
        self,
        subreddit_name: str,
        query: str,
        limit: int = 100,
        time_filter: str = "year"
    ) -> List[Dict]:
        """
        Search for posts in a subreddit.

        Args:
            subreddit_name: Name of subreddit
            query: Search query
            limit: Maximum results
            time_filter: Time filter for search

        Returns:
            List of processed post dictionaries
        """
        print(f"\nSearching r/{subreddit_name} for '{query}'...")
        subreddit = self.reddit.subreddit(subreddit_name)
        posts = []

        try:
            submissions = subreddit.search(
                query,
                sort="relevance",
                time_filter=time_filter,
                limit=limit
            )

            for submission in tqdm(submissions, desc=f"Search: {query}", total=limit):
                try:
                    processed_post = self.process_post(submission)
                    if processed_post:
                        posts.append(processed_post)

                    time.sleep(self.rate_limit_delay)

                except Exception as e:
                    print(f"Error processing post {submission.id}: {str(e)}")
                    continue

        except Exception as e:
            print(f"Error searching r/{subreddit_name}: {str(e)}")

        print(f"Found {len(posts)} matching posts")
        return posts

    def save_to_json(self, posts: List[Dict], output_path: Path):
        """
        Save collected posts to JSON file.

        Args:
            posts: List of post dictionaries
            output_path: Path to output JSON file
        """
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)

        print(f"\nSaved {len(posts)} posts to {output_path}")

    def filter_by_date(
        self,
        posts: List[Dict],
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Filter posts by date range.

        Args:
            posts: List of post dictionaries (must have 'created_utc' field)
            start_date: Minimum date (inclusive)
            end_date: Maximum date (inclusive)

        Returns:
            Filtered list of posts
        """
        filtered = []

        for post in posts:
            post_date = datetime.fromtimestamp(post.get('created_utc', 0))

            if start_date and post_date < start_date:
                continue
            if end_date and post_date > end_date:
                continue

            filtered.append(post)

        print(f"Filtered {len(posts)} posts to {len(filtered)} within date range")
        return filtered


# Example implementation
class ExampleRedditCollector(RedditCollectorBase):
    """Example collector implementation."""

    def process_post(self, post) -> Dict:
        """Extract basic post information."""
        return {
            "id": post.id,
            "title": post.title,
            "selftext": post.selftext,
            "author": str(post.author) if post.author else "[deleted]",
            "created_utc": post.created_utc,
            "score": post.score,
            "num_comments": post.num_comments,
            "subreddit": str(post.subreddit),
            "url": post.url
        }
