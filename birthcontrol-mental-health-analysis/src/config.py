"""
Configuration Management
========================
Centralized configuration loading from environment variables.
This keeps sensitive credentials out of code and version control.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
# This allows us to keep API keys and secrets out of our code
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env')


class Config:
    """
    Configuration class using environment variables.

    Why use environment variables?
    - Security: Keeps credentials out of code
    - Flexibility: Easy to change settings without code changes
    - Best practice: Standard in production ML/AI systems
    """

    # Reddit API Configuration
    REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
    REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
    REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT')

    # LLM API Keys (for future use)
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

    # Data Collection Settings
    MAX_POSTS_PER_SUBREDDIT = int(os.getenv('MAX_POSTS_PER_SUBREDDIT', 100))
    RATE_LIMIT_DELAY = float(os.getenv('RATE_LIMIT_DELAY', 2.0))

    # Project paths
    PROJECT_ROOT = project_root
    DATA_DIR = project_root / 'data'
    RAW_DATA_DIR = DATA_DIR / 'raw'
    PROCESSED_DATA_DIR = DATA_DIR / 'processed'
    INTERIM_DATA_DIR = DATA_DIR / 'interim'
    OUTPUTS_DIR = project_root / 'outputs'

    @classmethod
    def validate_reddit_credentials(cls) -> bool:
        """Check if Reddit API credentials are properly configured."""
        required = [cls.REDDIT_CLIENT_ID, cls.REDDIT_CLIENT_SECRET, cls.REDDIT_USER_AGENT]
        return all(credential is not None for credential in required)


    @classmethod
    def print_safe_summary(cls) -> None:
        """Print a summary of the configuration without sensitive data."""
        print(f"Reddit credentials are configured: {cls.validate_reddit_credentials()}")
        print(f"Max posts per subreddit: {cls.MAX_POSTS_PER_SUBREDDIT}")
        print(f"Rate limit delay: {cls.RATE_LIMIT_DELAY}")
        print(f"Data directory paths:")
        print(f"  Raw data: {cls.RAW_DATA_DIR}")
        print(f"  Processed data: {cls.PROCESSED_DATA_DIR}")
        print(f"  Interim data: {cls.INTERIM_DATA_DIR}")
        print(f"  Outputs: {cls.OUTPUTS_DIR}")

# Create directories if they don't exist
Config.RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.INTERIM_DATA_DIR.mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    Config.print_safe_summary()