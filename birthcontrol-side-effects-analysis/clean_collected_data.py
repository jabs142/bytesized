"""
Clean Collected Reddit Data

This script:
1. Finds the most recent raw data file
2. Cleans it (removes PII, normalizes text)
3. Saves to processed/ directory

Run this AFTER collecting data but BEFORE analysis.
"""

import json
from pathlib import Path
from src.preprocessing.text_cleaner import TextCleaner

def main():
    print("=" * 60)
    print("DATA CLEANING PIPELINE")
    print("=" * 60)

    # Find most recent raw data file
    data_dir = Path('data/raw')
    data_files = list(data_dir.glob('reddit_bc_*.json'))

    if not data_files:
        print("\n✗ No data files found in data/raw/")
        print("  Please run: python src/data_collection/reddit_collector.py")
        return

    # Get most recent file
    latest_file = max(data_files, key=lambda p: p.stat().st_mtime)
    print(f"\n📂 Found data file: {latest_file.name}")

    # Load raw data
    print("📖 Loading raw data...")
    with open(latest_file, 'r', encoding='utf-8') as f:
        raw_posts = json.load(f)

    print(f"✓ Loaded {len(raw_posts)} posts")

    # Initialize cleaner
    cleaner = TextCleaner()

    # Clean all posts
    print("\n🧹 Cleaning data...")
    print("  - Removing PII (emails, phones, usernames)")
    print("  - Normalizing whitespace")
    print("  - Cleaning text formatting")

    cleaned_posts = cleaner.clean_dataset(raw_posts)

    print(f"✓ Cleaned {len(cleaned_posts)} posts")

    # Save cleaned data
    output_path = Path('data/processed/cleaned_posts.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"\n💾 Saving to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_posts, f, indent=2, ensure_ascii=False)

    print("✓ Saved cleaned data")

    # Print summary
    print("\n" + "=" * 60)
    print("CLEANING COMPLETE!")
    print("=" * 60)

    # Show example of cleaning
    if cleaned_posts:
        sample = cleaned_posts[0]
        print(f"\n📋 Sample cleaned post:")
        print(f"  Subreddit: {sample['subreddit']}")
        print(f"  Title: {sample['title'][:60]}...")
        print(f"  Text length: {sample['text_length']} characters")
        print(f"  Cleaned: {sample.get('cleaned', False)}")

        if 'top_comments' in sample:
            print(f"  Comments: {len(sample['top_comments'])}")

    print(f"\n✓ Raw data: {latest_file}")
    print(f"✓ Cleaned data: {output_path}")
    print(f"\nNext steps:")
    print(f"  1. Run: jupyter notebook")
    print(f"  2. Open: notebooks/01_exploratory_data_analysis.ipynb")
    print(f"  3. Analyze your cleaned data!")

if __name__ == '__main__':
    main()
