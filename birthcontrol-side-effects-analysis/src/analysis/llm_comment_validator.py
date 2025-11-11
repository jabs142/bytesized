"""
LLM Comment Validator
Analyzes Reddit comments to identify validation patterns ("me too"), additional experiences, and counter-experiences

Uses LLM to understand social media language, slang, and context to detect:
- Validation: "me too", "same here", "experiencing this", etc.
- Additional info: Related experiences without explicit validation
- Counter: "I didn't have this", "opposite for me"
- Unrelated: Off-topic comments
"""

import os
import json
import time
from typing import Dict, List
from openai import OpenAI
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()


class LLMCommentValidator:
    """
    Validate Reddit comments using LLM to detect patterns and validations
    """

    def __init__(self, api_key: str = None, model: str = "gpt-4o-mini"):
        """
        Initialize with OpenAI API key

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            model: OpenAI model to use (default: gpt-4o-mini)
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY or pass api_key parameter")

        self.client = OpenAI(api_key=self.api_key)
        self.model = model

    def analyze_comment(self, comment_text: str, post_symptoms: List[str]) -> Dict:
        """
        Analyze a single comment to detect validation patterns

        Args:
            comment_text: The comment text
            post_symptoms: List of symptoms mentioned in the original post

        Returns:
            Dictionary with analysis results
        """
        symptom_list = ", ".join(post_symptoms) if post_symptoms else "various symptoms"

        prompt = f"""Analyze this comment from a birth control discussion:

Original Post Mentioned: {symptom_list}

Comment: "{comment_text}"

Determine the comment type:

1. "validation" - Agrees with/validates the experience
   Examples: "me too", "same here", "I experienced this", "omg literally same", "happening to me too",
   "fr tho same", "this is me", "experiencing this rn", "you're not alone"

2. "additional_info" - Adds related info or experiences without explicit validation
   Examples: "I also tried...", "my doctor said...", "I found that...", "check with your doctor"

3. "counter" - Disagrees or had different experience
   Examples: "that's weird, I never had that", "opposite for me", "mine was totally different"

4. "unrelated" - Off-topic or not about symptoms
   Examples: "what pill are you on?", "lol", "thanks for sharing", general conversation

Return JSON:
{{
  "type": "validation" | "additional_info" | "counter" | "unrelated",
  "confidence": 0.0-1.0,
  "reason": "Brief explanation (1 sentence)",
  "additional_symptoms": ["symptom1", "symptom2"] or [] if no new symptoms mentioned
}}

Be flexible with language - social media uses slang, abbreviations, creative expressions.
Focus on the INTENT, not just keywords.

Examples:
- "omg same my anxiety is so bad" → validation (clear agreement)
- "fr experiencing this rn" → validation (fr = for real, rn = right now)
- "I had this but it went away" → additional_info (related but not validating)
- "weird i never had that" → counter (different experience)
- "what brand are you using" → unrelated (asking question)
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are analyzing social media comments to detect validation patterns."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_tokens=200
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            print(f"  ⚠️  Error analyzing comment: {e}")
            return {
                'type': 'unrelated',
                'confidence': 0.0,
                'reason': f'Error during analysis: {str(e)}',
                'additional_symptoms': []
            }

    def validate_post_comments(self, post: Dict) -> Dict:
        """
        Analyze all comments for a single post

        Args:
            post: Reddit post dictionary with 'top_comments' and 'symptoms'

        Returns:
            Dictionary with validation results for this post
        """
        comments = post.get('top_comments', [])
        if not comments:
            return {
                'post_id': post.get('id'),
                'comment_count': 0,
                'validations': [],
                'validation_score': 0,
                'has_validations': False
            }

        # Get symptoms from post analysis (if available)
        post_symptoms = list(post.get('symptoms', {}).keys()) if 'symptoms' in post else []

        validations = []
        validation_count = 0
        validation_score = 0  # Weighted by comment score

        for comment in comments:
            comment_text = comment.get('text', '')
            comment_score = comment.get('score', 1)

            if not comment_text or len(comment_text.strip()) < 10:
                continue

            # Analyze comment
            analysis = self.analyze_comment(comment_text, post_symptoms)

            # Add comment metadata
            validation_result = {
                'comment_text': comment_text,
                'comment_score': comment_score,
                'type': analysis['type'],
                'confidence': analysis['confidence'],
                'reason': analysis['reason'],
                'additional_symptoms': analysis.get('additional_symptoms', [])
            }

            validations.append(validation_result)

            # Track validation metrics
            if analysis['type'] == 'validation' and analysis['confidence'] >= 0.7:
                validation_count += 1
                validation_score += comment_score  # Weight by upvotes

            # Small delay to avoid rate limits
            time.sleep(0.1)

        return {
            'post_id': post.get('id'),
            'comment_count': len(comments),
            'validations': validations,
            'validation_count': validation_count,  # Count of "validation" type comments
            'validation_score': validation_score,  # Weighted by comment upvotes
            'has_validations': validation_count > 0,
            'validation_rate': validation_count / len(validations) if validations else 0
        }

    def validate_all_posts(self, posts: List[Dict]) -> Dict[str, Dict]:
        """
        Validate comments for all posts

        Args:
            posts: List of Reddit post dictionaries

        Returns:
            Dictionary mapping post_id -> validation results
        """
        print(f"\n💬 LLM Comment Validation")
        print("=" * 60)
        print(f"Analyzing comments from {len(posts)} posts...")
        print(f"Model: {self.model}\n")

        all_validations = {}
        total_comments = 0
        total_validations = 0

        for post in tqdm(posts, desc="Validating comments", unit="post"):
            # Only process posts that have comments
            if 'top_comments' not in post or not post['top_comments']:
                continue

            result = self.validate_post_comments(post)
            all_validations[post['id']] = result

            total_comments += result['comment_count']
            total_validations += result['validation_count']

        print(f"\n✅ Comment validation complete!")
        print(f"   Total posts with comments: {len(all_validations)}")
        print(f"   Total comments analyzed: {total_comments}")
        print(f"   Total validations found: {total_validations}")
        print(f"   Validation rate: {total_validations/total_comments*100:.1f}%")

        return all_validations

    def create_symptom_validation_stats(self, posts: List[Dict], validations: Dict[str, Dict]) -> Dict[str, Dict]:
        """
        Aggregate validation statistics by symptom

        Args:
            posts: List of posts with symptom analysis
            validations: Validation results by post_id

        Returns:
            Dictionary mapping symptom -> validation stats
        """
        symptom_validations = {}

        for post in posts:
            post_id = post.get('id')
            symptoms = post.get('symptoms', {})

            if not symptoms or post_id not in validations:
                continue

            validation_data = validations[post_id]

            # For each symptom in this post, add validation metrics
            for symptom in symptoms.keys():
                if symptom not in symptom_validations:
                    symptom_validations[symptom] = {
                        'symptom': symptom,
                        'total_posts': 0,
                        'posts_with_validations': 0,
                        'total_validations': 0,
                        'total_validation_score': 0
                    }

                symptom_validations[symptom]['total_posts'] += 1
                if validation_data['has_validations']:
                    symptom_validations[symptom]['posts_with_validations'] += 1
                symptom_validations[symptom]['total_validations'] += validation_data['validation_count']
                symptom_validations[symptom]['total_validation_score'] += validation_data['validation_score']

        # Calculate rates
        for symptom, stats in symptom_validations.items():
            stats['validation_rate'] = stats['posts_with_validations'] / stats['total_posts'] if stats['total_posts'] > 0 else 0
            stats['avg_validations_per_post'] = stats['total_validations'] / stats['total_posts'] if stats['total_posts'] > 0 else 0

        return symptom_validations

    def save_results(self, validations: Dict[str, Dict], symptom_stats: Dict[str, Dict]):
        """Save validation results"""
        os.makedirs('data/analysis', exist_ok=True)

        # Save raw validation results
        with open('data/analysis/comment_validations.json', 'w', encoding='utf-8') as f:
            json.dump(validations, f, indent=2, ensure_ascii=False)

        # Save symptom-level validation statistics
        with open('data/analysis/symptom_validation_stats.json', 'w', encoding='utf-8') as f:
            json.dump(symptom_stats, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved results:")
        print(f"   data/analysis/comment_validations.json")
        print(f"   data/analysis/symptom_validation_stats.json")


def main():
    """
    Example usage: Validate comments from Reddit posts
    """
    import glob

    # Load Reddit posts
    print("📂 Loading Reddit posts...")

    post_files = glob.glob('data/raw/reddit_bc_symptoms_posts_*.json')
    if not post_files:
        print("❌ No Reddit post files found in data/raw/")
        return

    latest_file = max(post_files)

    with open(latest_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    print(f"   ✓ Loaded {len(posts)} posts")

    # Check for analyzed posts with symptoms (from pattern mining)
    analyzed_file = 'data/patterns/analyzed_posts.json'
    try:
        with open(analyzed_file, 'r') as f:
            analyzed_posts = json.load(f)
        print(f"   ✓ Loaded analyzed posts with symptoms")

        # Merge symptom data into posts
        symptom_map = {p['id']: p['symptoms'] for p in analyzed_posts if 'symptoms' in p}
        for post in posts:
            if post['id'] in symptom_map:
                post['symptoms'] = symptom_map[post['id']]

    except FileNotFoundError:
        print("   ⚠️  No analyzed posts found. Run pattern mining first for better results.")

    # Initialize validator
    validator = LLMCommentValidator()

    # Validate all comments
    validations = validator.validate_all_posts(posts)

    # Create symptom-level statistics
    symptom_stats = validator.create_symptom_validation_stats(posts, validations)

    # Save results
    validator.save_results(validations, symptom_stats)

    # Print examples
    print("\nExample Validation Results:")
    for post_id in list(validations.keys())[:3]:
        result = validations[post_id]
        print(f"\nPost {post_id}:")
        print(f"  Comments: {result['comment_count']}")
        print(f"  Validations: {result['validation_count']} ({result['validation_rate']*100:.0f}%)")
        print(f"  Validation score: {result['validation_score']}")

        for val in result['validations'][:2]:
            print(f"  - {val['type']}: \"{val['comment_text'][:60]}...\" ({val['confidence']:.2f})")

    print("\n✅ Comment validation complete!")


if __name__ == "__main__":
    main()
