"""
Configuration for Pharmaceutical Innovation Clusters Project
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env')

class Config:
    """Centralized configuration for the Pharmaceutical Innovation Clusters pipeline"""

    # API Credentials
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    FDA_API_KEY = os.getenv('FDA_API_KEY')  # Required for FDA openFDA API
    NCBI_EMAIL = os.getenv('NCBI_EMAIL')  # Optional

    # Project Paths
    PROJECT_ROOT = project_root
    DATA_DIR = PROJECT_ROOT / 'data'
    RAW_DATA_DIR = DATA_DIR / 'raw'
    PROCESSED_DATA_DIR = DATA_DIR / 'processed'
    VALIDATED_DATA_DIR = DATA_DIR / 'validated'
    OUTPUTS_DIR = PROJECT_ROOT / 'outputs'
    REPORTS_DIR = OUTPUTS_DIR / 'reports'
    VIZ_DIR = OUTPUTS_DIR / 'visualizations'
    FRONTEND_DATA_DIR = PROJECT_ROOT / 'frontend' / 'data'

    # Data Collection Settings
    FDA_START_YEAR = 1938
    FDA_END_YEAR = 2024

    # API Rate Limiting
    FDA_API_DELAY = 0.5  # seconds between requests (240 req/min with key)
    MAX_RETRIES = 3

    # Analysis Settings
    CLUSTERING_THRESHOLD_SIGMA = 2.0  # std deviations above mean
    MIN_CLUSTER_SIZE = 3  # minimum innovations to form a cluster
    SLIDING_WINDOW_SIZE = 5  # years for sliding window analysis

    # Validation methods
    @classmethod
    def validate_credentials(cls) -> bool:
        """Check if required credentials are available"""
        if not cls.FDA_API_KEY:
            print(f"⚠️  Warning: Missing FDA_API_KEY")
            print(f"   Get your key at: https://open.fda.gov/apis/authentication/")
            return False
        return True

    @classmethod
    def create_directories(cls):
        """Create all necessary directories"""
        directories = [
            cls.RAW_DATA_DIR,
            cls.PROCESSED_DATA_DIR,
            cls.VALIDATED_DATA_DIR,
            cls.REPORTS_DIR,
            cls.VIZ_DIR,
            cls.FRONTEND_DATA_DIR
        ]
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

# Create directories on import
Config.create_directories()
