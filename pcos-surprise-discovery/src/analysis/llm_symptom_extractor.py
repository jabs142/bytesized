"""
LLM-Powered Organic Symptom Discovery
Uses GPT-4o-mini to extract ALL symptoms mentioned in PCOS discussions
NO predefined keyword lists - let the LLM discover patterns
"""
import json
import sys
from pathlib import Path
from typing import List, Dict
from tqdm import tqdm
from openai import OpenAI

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


class LLMSymptomExtractor:
    def __init__(self):
        """Initialize OpenAI client"""
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.model = Config.LLM_MODEL
        self.temperature = Config.LLM_TEMPERATURE

    def create_extraction_prompt(self, post_title: str, post_text: str, comments: List[Dict]) -> str:
        """
        Create prompt for LLM to extract symptoms organically

        Args:
            post_title: Reddit post title
            post_text: Reddit post body text
            comments: List of comment dictionaries

        Returns:
            Formatted prompt string
        """
        # Combine comments
        comment_text = "\n".join([f"Comment: {c['body']}" for c in comments[:5]])

        prompt = f"""Extract ALL symptoms, conditions, or health issues mentioned in this PCOS discussion.

INSTRUCTIONS:
- Be SPECIFIC: Don't just say "pain" - specify "jaw pain", "knee pain", "pelvic pain", etc.
- Include EVERYTHING: Physical symptoms, mental health, skin issues, digestive issues, sleep issues, cognitive issues
- Extract symptoms EXACTLY as described by the patient
- Do NOT limit to known PCOS symptoms - extract EVERYTHING mentioned
- Note if the patient expresses SURPRISE about a symptom being related to PCOS (keywords: "didn't know", "surprising", "never told", "had no idea")

POST TITLE: {post_title}

POST TEXT: {post_text}

TOP COMMENTS:
{comment_text}

Return your response as a JSON object with this exact structure:
{{
  "symptoms_mentioned": [
    {{
      "symptom": "specific_symptom_name",
      "category": "category_if_clear",
      "quote": "exact quote from post/comment",
      "surprise_signal": true/false
    }}
  ]
}}

Be thorough but precise. Extract all symptoms mentioned."""

        return prompt

    def extract_from_post(self, post: Dict) -> Dict:
        """
        Extract symptoms from a single post using LLM

        Args:
            post: Post dictionary

        Returns:
            Dictionary with post_id and extracted symptoms
        """
        # Create prompt
        prompt = self.create_extraction_prompt(
            post["title"], post["selftext"], post["top_comments"]
        )

        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical symptom extraction assistant. Extract symptoms accurately and comprehensively from patient discussions.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"},
            )

            # Parse response
            result = json.loads(response.choices[0].message.content)

            return {
                "post_id": post["id"],
                "subreddit": post["subreddit"],
                "post_title": post["title"],
                "extracted_at": response.created,
                "symptoms": result.get("symptoms_mentioned", []),
            }

        except Exception as e:
            print(f"Error extracting from post {post['id']}: {e}")
            return {
                "post_id": post["id"],
                "subreddit": post["subreddit"],
                "post_title": post["title"],
                "error": str(e),
                "symptoms": [],
            }

    def extract_from_all_posts(self, posts: List[Dict]) -> List[Dict]:
        """
        Extract symptoms from all posts

        Args:
            posts: List of post dictionaries

        Returns:
            List of extraction results
        """
        print(f"\nExtracting symptoms from {len(posts)} posts using {self.model}...")
        print("This may take 5-10 minutes...")

        results = []
        for post in tqdm(posts, desc="Extracting symptoms"):
            result = self.extract_from_post(post)
            results.append(result)

        # Calculate stats
        total_symptoms = sum(len(r["symptoms"]) for r in results)
        posts_with_symptoms = sum(1 for r in results if len(r["symptoms"]) > 0)

        print(f"\n{'='*50}")
        print(f"Extraction Complete!")
        print(f"  Posts processed: {len(results)}")
        print(f"  Posts with symptoms: {posts_with_symptoms}")
        print(f"  Total symptom mentions: {total_symptoms}")
        print(f"  Average symptoms per post: {total_symptoms / len(results):.1f}")
        print(f"{'='*50}")

        return results

    def save_results(self, results: List[Dict], filename: str = None):
        """Save extraction results to JSON"""
        if filename is None:
            filename = "symptom_extractions.json"

        output_path = Config.PROCESSED_DATA_DIR / filename
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\nResults saved to: {output_path}")


def load_reddit_posts() -> List[Dict]:
    """Load Reddit posts from JSON file"""
    input_path = Config.RAW_DATA_DIR / Config.REDDIT_POSTS_FILE

    if not input_path.exists():
        print(f"❌ Error: Reddit posts file not found at {input_path}")
        print("Please run reddit_collector.py first!")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        posts = json.load(f)

    print(f"Loaded {len(posts)} Reddit posts")
    return posts


def main():
    """Main execution function"""
    print("=" * 50)
    print("PHASE 2A: LLM Organic Symptom Discovery")
    print("=" * 50)

    # Check API key
    if not Config.OPENAI_API_KEY:
        print("\n❌ Error: OpenAI API key not found!")
        print("Please set OPENAI_API_KEY in .env file")
        sys.exit(1)

    # Load posts
    posts = load_reddit_posts()

    # Initialize extractor
    extractor = LLMSymptomExtractor()

    # Extract symptoms
    results = extractor.extract_from_all_posts(posts)

    # Save results
    extractor.save_results(results, "symptom_extractions.json")

    print("\n✅ Symptom extraction complete!")
    print("\nNext step: Run symptom_aggregator.py to aggregate and count symptoms")


if __name__ == "__main__":
    main()
