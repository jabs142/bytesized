"""
LLM-Powered Treatment Solution Discovery
Extracts what treatments/solutions people tried and whether they helped
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


class LLMSolutionExtractor:
    def __init__(self):
        """Initialize OpenAI client"""
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.model = Config.LLM_MODEL
        self.temperature = Config.LLM_TEMPERATURE

    def create_extraction_prompt(self, post_title: str, post_text: str, comments: List[Dict]) -> str:
        """Create prompt for extracting treatment solutions"""
        comment_text = "\n".join([f"Comment: {c['body']}" for c in comments[:5]])

        prompt = f"""Extract ALL treatments, medications, lifestyle changes, or interventions mentioned in this PCOS discussion.

For EACH treatment mentioned, extract:
- What was tried?
- For which symptom(s)?
- Did it help? (yes/no/somewhat/unclear)
- How much did it help? (if mentioned)
- How long until results? (if mentioned)
- Any side effects mentioned?
- Direct quote for evidence

POST TITLE: {post_title}

POST TEXT: {post_text}

TOP COMMENTS:
{comment_text}

Return your response as a JSON object with this exact structure:
{{
  "solutions": [
    {{
      "solution": "specific_treatment_name",
      "target_symptom": "symptom_it_addressed",
      "effectiveness": "high/medium/low/unclear",
      "details": "specific improvements mentioned",
      "time_to_results": "timeframe if mentioned",
      "side_effects": "any mentioned side effects",
      "quote": "exact quote from discussion"
    }}
  ]
}}

Be thorough - extract ALL treatments mentioned, even if just mentioned in passing."""

        return prompt

    def extract_from_post(self, post: Dict) -> Dict:
        """Extract solutions from a single post using LLM"""
        prompt = self.create_extraction_prompt(
            post["title"], post["selftext"], post["top_comments"]
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical treatment extraction assistant. Extract all treatments and their effectiveness from patient discussions.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)

            return {
                "post_id": post["id"],
                "subreddit": post["subreddit"],
                "post_title": post["title"],
                "extracted_at": response.created,
                "solutions": result.get("solutions", []),
            }

        except Exception as e:
            print(f"Error extracting from post {post['id']}: {e}")
            return {
                "post_id": post["id"],
                "error": str(e),
                "solutions": [],
            }

    def extract_from_all_posts(self, posts: List[Dict]) -> List[Dict]:
        """Extract solutions from all posts"""
        print(f"\nExtracting treatment solutions from {len(posts)} posts...")
        print("This may take 5-10 minutes...")

        results = []
        for post in tqdm(posts, desc="Extracting solutions"):
            result = self.extract_from_post(post)
            results.append(result)

        # Calculate stats
        total_solutions = sum(len(r["solutions"]) for r in results)
        posts_with_solutions = sum(1 for r in results if len(r["solutions"]) > 0)

        print(f"\n{'='*50}")
        print(f"Solution Extraction Complete!")
        print(f"  Posts processed: {len(results)}")
        print(f"  Posts with solutions: {posts_with_solutions}")
        print(f"  Total treatment mentions: {total_solutions}")
        print(f"  Average solutions per post: {total_solutions / len(results):.1f}")
        print(f"{'='*50}")

        return results

    def save_results(self, results: List[Dict]):
        """Save extraction results to JSON"""
        output_path = Config.PROCESSED_DATA_DIR / Config.SOLUTIONS_FILE
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\nResults saved to: {output_path}")


def load_reddit_posts() -> List[Dict]:
    """Load Reddit posts from JSON file"""
    input_path = Config.RAW_DATA_DIR / Config.REDDIT_POSTS_FILE

    if not input_path.exists():
        print(f"❌ Error: Reddit posts file not found at {input_path}")
        sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        posts = json.load(f)

    print(f"Loaded {len(posts)} Reddit posts")
    return posts


def main():
    """Main execution function"""
    print("=" * 50)
    print("PHASE 2B: LLM Treatment Solution Discovery")
    print("=" * 50)

    if not Config.OPENAI_API_KEY:
        print("\n❌ Error: OpenAI API key not found!")
        sys.exit(1)

    posts = load_reddit_posts()
    extractor = LLMSolutionExtractor()
    results = extractor.extract_from_all_posts(posts)
    extractor.save_results(results)

    print("\n✅ Solution extraction complete!")


if __name__ == "__main__":
    main()
