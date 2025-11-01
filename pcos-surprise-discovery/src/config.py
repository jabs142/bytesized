"""
Configuration Management for PCOS Surprise Discovery
======================================================
Centralized configuration loading from environment variables.

LEARNING CONCEPTS:
- Environment variable management for API keys
- Project structure organization
- Configuration validation patterns
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
# This keeps sensitive API keys out of code and version control
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env')


class Config:
    """
    Configuration class using environment variables.

    Why use environment variables?
    - Security: Keeps API credentials out of code
    - Flexibility: Easy to change settings without modifying code
    - Best practice: Standard in production ML/AI systems
    - Reproducibility: Different settings for dev vs. production
    """

    # ============================================
    # API Credentials
    # ============================================
    # Reddit API (for data collection)
    REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
    REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
    REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'PCOS_Surprise_Discovery_v1.0')

    # OpenAI API (for LLM symptom extraction)
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

    # NCBI/PubMed (for medical literature validation)
    NCBI_EMAIL = os.getenv('NCBI_EMAIL')

    # ============================================
    # Project Paths
    # ============================================
    PROJECT_ROOT = project_root
    DATA_DIR = PROJECT_ROOT / 'data'
    RAW_DATA_DIR = DATA_DIR / 'raw'
    PROCESSED_DATA_DIR = DATA_DIR / 'processed'
    VALIDATED_DATA_DIR = DATA_DIR / 'validated'
    PATTERNS_DATA_DIR = DATA_DIR / 'patterns'
    OFFICIAL_DATA_DIR = DATA_DIR / 'official'
    NOTEBOOKS_DIR = PROJECT_ROOT / 'notebooks'
    FRONTEND_DIR = PROJECT_ROOT / 'frontend'

    # ============================================
    # Reddit Collection Settings
    # ============================================
    # Target: 500 posts total from 4 subreddits
    # This is efficient - enough for pattern discovery, not overwhelming
    TARGET_SUBREDDITS = {
        'PCOS': 300,           # Main PCOS community
        'PCOSloseit': 100,     # Weight management focus
        'Hirsutism': 50,       # Hair growth issues
        'TwoXChromosomes': 50  # Search for "PCOS" in general women's health
    }
    TOTAL_POSTS_TARGET = 500
    SEARCH_TERM = 'PCOS'
    MONTHS_BACK = 12  # Collect from last 12 months
    RATE_LIMIT_DELAY = 0.5  # Delay between API calls (respect rate limits)

    # ============================================
    # LLM Settings (OpenAI GPT-4o-mini)
    # ============================================
    LLM_MODEL = 'gpt-4o-mini'
    LLM_TEMPERATURE = 0.1  # Low temperature = consistent, deterministic extraction
    MAX_TOKENS = 4000

    # Why GPT-4o-mini?
    # - Cost-effective (~10x cheaper than GPT-4)
    # - Fast inference
    # - Still excellent at structured extraction tasks
    # - Good balance of quality and cost for research

    # ============================================
    # Analysis Thresholds
    # ============================================
    TOP_N_SYMPTOMS = 30  # Only validate top 30 (efficiency!)
    MIN_MENTION_PERCENTAGE = 0.03  # 3% of posts (15+ posts out of 500)
    MIN_SURPRISE_SIGNALS = 10  # Threshold for "high surprise signal"

    # ============================================
    # Surprise Score Weights
    # ============================================
    # These weights determine what makes a symptom "surprising"
    WEIGHT_NOT_IN_CRITERIA = 2.0        # 2x - not used for PCOS diagnosis
    WEIGHT_LOW_AWARENESS = 1.5          # 1.5x - not widely discussed
    WEIGHT_HIGH_SURPRISE_SIGNALS = 1.3  # 1.3x - patients express surprise
    WEIGHT_HIGH_PREVALENCE_RATIO = 1.2  # 1.2x - much higher in PCOS

    # Public awareness threshold (for heuristic classification)
    LOW_AWARENESS_THRESHOLD = 10000  # Monthly Google search volume

    # ============================================
    # Association Rules Mining Settings
    # ============================================
    MIN_SUPPORT = 0.05     # 5% - symptom combination appears in 5%+ of posts
    MIN_CONFIDENCE = 0.6   # 60% - if symptom A, then 60% chance of symptom B

    # ============================================
    # Output File Names
    # ============================================
    REDDIT_POSTS_FILE = 'reddit_pcos_posts.json'
    OFFICIAL_CRITERIA_FILE = 'pcos_criteria.json'
    ALL_SYMPTOMS_FILE = 'all_symptoms_discovered.json'
    SOLUTIONS_FILE = 'solutions_discovered.json'
    SURPRISE_SIGNALS_FILE = 'surprise_signals.json'
    TOP_30_FILE = 'top_30_symptoms.json'
    SURPRISE_RANKINGS_FILE = 'surprise_rankings.json'
    SYMPTOM_CLUSTERS_FILE = 'surprise_clusters.json'
    SOLUTION_RANKINGS_FILE = 'solution_rankings.json'

    # ============================================
    # Validation Methods
    # ============================================
    @classmethod
    def validate_reddit_credentials(cls) -> bool:
        """Check if Reddit API credentials are properly configured."""
        required = [cls.REDDIT_CLIENT_ID, cls.REDDIT_CLIENT_SECRET, cls.REDDIT_USER_AGENT]
        return all(credential is not None for credential in required)

    @classmethod
    def validate_openai_credentials(cls) -> bool:
        """Check if OpenAI API key is configured."""
        return cls.OPENAI_API_KEY is not None

    @classmethod
    def validate_ncbi_credentials(cls) -> bool:
        """Check if NCBI email is configured."""
        return cls.NCBI_EMAIL is not None

    @classmethod
    def print_safe_summary(cls) -> None:
        """Print configuration summary without exposing sensitive data."""
        print("=" * 50)
        print("PCOS Surprise Discovery Configuration")
        print("=" * 50)
        print(f"\nAPI Credentials:")
        print(f"  Reddit API: {'✓ Configured' if cls.validate_reddit_credentials() else '✗ Missing'}")
        print(f"  OpenAI API: {'✓ Configured' if cls.validate_openai_credentials() else '✗ Missing'}")
        print(f"  NCBI Email: {'✓ Configured' if cls.validate_ncbi_credentials() else '✗ Missing'}")

        print(f"\nData Collection:")
        print(f"  Target posts: {cls.TOTAL_POSTS_TARGET}")
        print(f"  Subreddits: {len(cls.TARGET_SUBREDDITS)}")
        print(f"  Timeframe: Last {cls.MONTHS_BACK} months")

        print(f"\nLLM Settings:")
        print(f"  Model: {cls.LLM_MODEL}")
        print(f"  Temperature: {cls.LLM_TEMPERATURE}")

        print(f"\nAnalysis:")
        print(f"  Top symptoms to validate: {cls.TOP_N_SYMPTOMS}")
        print(f"  Min mention threshold: {cls.MIN_MENTION_PERCENTAGE:.1%}")

        print(f"\nProject Directories:")
        print(f"  Root: {cls.PROJECT_ROOT}")
        print(f"  Raw data: {cls.RAW_DATA_DIR}")
        print(f"  Processed data: {cls.PROCESSED_DATA_DIR}")
        print(f"  Validated data: {cls.VALIDATED_DATA_DIR}")


# Create directories if they don't exist
# This ensures the project structure is set up correctly on first run
Config.RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.VALIDATED_DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.PATTERNS_DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.OFFICIAL_DATA_DIR.mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    # Test configuration when run directly
    Config.print_safe_summary()
