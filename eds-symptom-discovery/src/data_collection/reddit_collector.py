"""
Reddit Data Collector for EDS Symptoms
======================================
Collects posts from EDS-related subreddits to discover symptom patterns
and identify "surprising" symptoms patients report.

Target subreddits:
- r/ehlersdanlos (main EDS community)
- r/Hypermobility (joint hypermobility - core EDS feature)

Note: We intentionally exclude symptom-specific subreddits (r/POTS, r/dysautonomia)
to avoid bias and discover symptoms organically from general EDS communities.
"""

import praw
import json
from datetime import datetime
from typing import List, Dict, Set
import os
from dotenv import load_dotenv
from collections import Counter
import time

# Load environment variables
load_dotenv()


class EDSRedditCollector:
    """
    Collects symptom reports from EDS-related subreddits.

    Goal: Discover what symptoms patients actually report in their daily lives,
    including "hidden" symptoms they might not realize are EDS-related.
    """

    # Target subreddits for EDS symptom discovery
    # Only general EDS communities to avoid symptom-specific bias
    SUBREDDITS = [
        "ehlersdanlos",      # Main EDS community
        "Hypermobility"      # Joint hypermobility (core EDS feature)
    ]

    # EDS-related keywords to filter relevant posts
    EDS_KEYWORDS = [
        "eds", "ehlers danlos", "heds", "hypermobile",
        "dysautonomia", "pots", "mcas", "hypermobility",
        "connective tissue", "joint hypermobility"
    ]

    # Common symptom keywords to look for in posts
    SYMPTOM_KEYWORDS = [
        # Autonomic/Dysautonomia
        "dizzy", "dizziness", "fainting", "faint", "tachycardia", "palpitations",
        "blood pressure", "lightheaded", "syncope", "temperature regulation",
        "sweating", "hot flashes", "cold intolerance",

        # Digestive/GI
        "nausea", "gastroparesis", "constipation", "diarrhea", "ibs",
        "bloating", "reflux", "gerd", "vomiting", "stomach pain",
        "food intolerance", "digestion",

        # Pain
        "pain", "ache", "chronic pain", "joint pain", "muscle pain",
        "headache", "migraine", "back pain", "neck pain", "fibromyalgia",

        # Neurological
        "brain fog", "cognitive", "memory", "concentration", "focus",
        "confusion", "numbness", "tingling", "neuropathy",

        # Musculoskeletal
        "subluxation", "dislocation", "joint instability", "loose joints",
        "hypermobile", "flat feet", "scoliosis", "tmj",

        # Skin
        "bruising", "scarring", "stretchy skin", "fragile skin",
        "wound healing", "thin skin",

        # Mental Health
        "anxiety", "depression", "panic", "ptsd", "stress",

        # Sensory
        "motion sickness", "vertigo", "light sensitive", "sound sensitive",
        "sensory overload", "photophobia",

        # Fatigue
        "fatigue", "exhaustion", "tired", "energy", "cfs", "chronic fatigue",

        # Other
        "allergies", "mcas", "histamine", "immune", "infections",
        "dental", "teeth", "vision", "hearing", "tinnitus"
    ]

    def __init__(self):
        """Initialize Reddit API connection using PRAW."""
        self.reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent=os.getenv('REDDIT_USER_AGENT')
        )
        self.rate_limit_delay = float(os.getenv('REDDIT_RATE_LIMIT_DELAY', '2'))

    def collect_posts(self, subreddit_name: str, limit: int = 200,
                     time_filter: str = 'year') -> List[Dict]:
        """
        Collect posts from a subreddit.

        Args:
            subreddit_name: Name of subreddit (without r/)
            limit: Maximum number of posts to collect
            time_filter: Time filter ('day', 'week', 'month', 'year', 'all')

        Returns:
            List of post dictionaries
        """
        print(f"\n🔍 Collecting from r/{subreddit_name}...")

        subreddit = self.reddit.subreddit(subreddit_name)
        posts = []

        try:
            # Collect from "hot" and "top" to get diverse content
            for post in subreddit.hot(limit=limit // 2):
                posts.append(self._extract_post_data(post))
                time.sleep(self.rate_limit_delay)

            for post in subreddit.top(time_filter=time_filter, limit=limit // 2):
                posts.append(self._extract_post_data(post))
                time.sleep(self.rate_limit_delay)

            # Remove duplicates based on post ID
            unique_posts = {post['id']: post for post in posts}.values()
            posts = list(unique_posts)

            print(f"   ✓ Collected {len(posts)} unique posts")
            return posts

        except Exception as e:
            print(f"   ❌ Error collecting from r/{subreddit_name}: {e}")
            return []

    def _extract_post_data(self, post) -> Dict:
        """
        Extract relevant data from a Reddit post.

        Args:
            post: PRAW submission object

        Returns:
            Dictionary with post data
        """
        return {
            'id': post.id,
            'title': post.title,
            'selftext': post.selftext,
            'author': str(post.author) if post.author else '[deleted]',
            'created_utc': post.created_utc,
            'score': post.score,
            'num_comments': post.num_comments,
            'subreddit': str(post.subreddit),
            'url': f"https://reddit.com{post.permalink}",
            'full_text': f"{post.title} {post.selftext}".lower()
        }

    def filter_relevant_posts(self, posts: List[Dict]) -> List[Dict]:
        """
        Filter posts that are relevant to EDS symptoms.

        Args:
            posts: List of all posts

        Returns:
            Filtered list of EDS-relevant posts
        """
        print("\n🔎 Filtering for EDS-relevant posts...")

        relevant_posts = []

        for post in posts:
            # Check if post mentions EDS or contains symptom keywords
            full_text = post['full_text']

            # Must mention EDS-related term OR be from EDS subreddit
            has_eds_keyword = any(keyword in full_text for keyword in self.EDS_KEYWORDS)
            is_eds_subreddit = post['subreddit'].lower() in ['ehlersdanlos', 'hypermobility']

            # Must mention at least one symptom
            has_symptom = any(keyword in full_text for keyword in self.SYMPTOM_KEYWORDS)

            if (has_eds_keyword or is_eds_subreddit) and has_symptom:
                relevant_posts.append(post)

        print(f"   ✓ Found {len(relevant_posts)} relevant posts (from {len(posts)} total)")
        return relevant_posts

    def extract_symptoms(self, posts: List[Dict]) -> Dict[str, List[str]]:
        """
        Extract symptom mentions from posts.

        Args:
            posts: List of posts

        Returns:
            Dictionary mapping symptom -> list of post IDs that mention it
        """
        print("\n💊 Extracting symptom mentions...")

        symptom_mentions = {symptom: [] for symptom in self.SYMPTOM_KEYWORDS}

        for post in posts:
            full_text = post['full_text']

            for symptom in self.SYMPTOM_KEYWORDS:
                if symptom in full_text:
                    symptom_mentions[symptom].append(post['id'])

        # Remove symptoms with no mentions
        symptom_mentions = {k: v for k, v in symptom_mentions.items() if len(v) > 0}

        # Sort by frequency
        sorted_symptoms = sorted(symptom_mentions.items(), key=lambda x: len(x[1]), reverse=True)

        print(f"   ✓ Found {len(sorted_symptoms)} symptoms mentioned across posts")
        print(f"\n   📊 Top 10 symptoms:")
        for symptom, post_ids in sorted_symptoms[:10]:
            print(f"      • {symptom}: {len(post_ids)} posts")

        return dict(sorted_symptoms)

    def calculate_symptom_stats(self, symptom_mentions: Dict[str, List[str]],
                               total_posts: int) -> List[Dict]:
        """
        Calculate statistics for each symptom.

        Args:
            symptom_mentions: Dict of symptom -> post IDs
            total_posts: Total number of posts analyzed

        Returns:
            List of symptom statistics
        """
        stats = []

        for symptom, post_ids in symptom_mentions.items():
            mention_count = len(post_ids)
            frequency = mention_count / total_posts if total_posts > 0 else 0

            stats.append({
                'symptom': symptom,
                'mention_count': mention_count,
                'frequency': round(frequency, 3),
                'post_ids': post_ids[:10]  # Only save first 10 post IDs to reduce size
            })

        return sorted(stats, key=lambda x: x['mention_count'], reverse=True)

    def save_data(self, posts: List[Dict], symptom_mentions: Dict[str, List[str]],
                  symptom_stats: List[Dict]):
        """
        Save collected data to JSON files.

        Args:
            posts: List of all posts
            symptom_mentions: Dict of symptom -> post IDs
            symptom_stats: List of symptom statistics
        """
        # Create data directory if it doesn't exist
        os.makedirs('data/raw', exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # Save raw posts
        posts_file = f'data/raw/eds_reddit_posts_{timestamp}.json'
        with open(posts_file, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Saved {len(posts)} posts to {posts_file}")

        # Save symptom mentions
        mentions_file = f'data/raw/symptom_mentions_{timestamp}.json'
        with open(mentions_file, 'w', encoding='utf-8') as f:
            json.dump(symptom_mentions, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved symptom mentions to {mentions_file}")

        # Save symptom statistics
        stats_file = f'data/raw/symptom_stats_{timestamp}.json'
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(symptom_stats, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved symptom statistics to {stats_file}")

        # Also save a "latest" version without timestamp
        with open('data/raw/eds_reddit_posts_latest.json', 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)

        with open('data/raw/symptom_stats_latest.json', 'w', encoding='utf-8') as f:
            json.dump(symptom_stats, f, indent=2, ensure_ascii=False)

    def collect_all(self, posts_per_subreddit: int = 200):
        """
        Main collection pipeline: collect from all subreddits and analyze symptoms.

        Args:
            posts_per_subreddit: Number of posts to collect from each subreddit
        """
        print("=" * 60)
        print("EDS Reddit Symptom Collector")
        print("=" * 60)

        all_posts = []

        # Collect from each subreddit
        for subreddit in self.SUBREDDITS:
            posts = self.collect_posts(subreddit, limit=posts_per_subreddit)
            all_posts.extend(posts)
            print(f"   Total posts collected so far: {len(all_posts)}")

        # Filter for relevant posts
        relevant_posts = self.filter_relevant_posts(all_posts)

        # Extract symptoms
        symptom_mentions = self.extract_symptoms(relevant_posts)

        # Calculate statistics
        symptom_stats = self.calculate_symptom_stats(symptom_mentions, len(relevant_posts))

        # Save data
        self.save_data(relevant_posts, symptom_mentions, symptom_stats)

        # Print summary
        print("\n" + "=" * 60)
        print("📊 Collection Summary")
        print("=" * 60)
        print(f"Total posts collected: {len(all_posts)}")
        print(f"Relevant posts (with symptoms): {len(relevant_posts)}")
        print(f"Unique symptoms found: {len(symptom_mentions)}")
        print(f"\nTop 5 symptoms:")
        for stat in symptom_stats[:5]:
            print(f"   {stat['symptom']}: {stat['mention_count']} posts ({stat['frequency']*100:.1f}%)")

        print("\n✅ Data collection complete!")
        print("\n💡 Next steps:")
        print("   1. Use these symptoms for targeted PubMed searches")
        print("   2. Calculate surprise scores (high Reddit + low PubMed = surprise)")
        print("   3. Build evidence validation pipeline")


def main():
    """Main entry point for Reddit data collection."""
    collector = EDSRedditCollector()

    # Collect 200 posts from each subreddit (800 total)
    collector.collect_all(posts_per_subreddit=200)


if __name__ == "__main__":
    main()
