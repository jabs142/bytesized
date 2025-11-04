"""
Configuration for Innovation Clusters Project
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env')

class Config:
    """Centralized configuration for the Innovation Clusters pipeline"""

    # API Credentials
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    NCBI_EMAIL = os.getenv('NCBI_EMAIL')  # For FDA API if needed

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
    PATENT_START_YEAR = 1920
    PATENT_END_YEAR = 2024

    # Patent Categories (CPC codes)
    PATENT_CATEGORIES = {
        'Pharmaceuticals': 'A61K',
        'Semiconductors': 'H01L',
        'Telecommunications': 'H04',
        'Computing': 'G06F'
    }

    # Citation threshold for "breakthrough" patents (top percentile)
    BREAKTHROUGH_CITATION_PERCENTILE = 90

    # API Rate Limiting
    FDA_API_DELAY = 0.5  # seconds between requests
    USPTO_API_DELAY = 1.0  # seconds between requests
    MAX_RETRIES = 3

    # Analysis Settings
    CLUSTERING_THRESHOLD_SIGMA = 2.0  # std deviations above mean
    MIN_CLUSTER_SIZE = 3  # minimum innovations to form a cluster
    SLIDING_WINDOW_SIZE = 5  # years for sliding window analysis

    # Validation methods
    @classmethod
    def validate_credentials(cls) -> bool:
        """Check if required credentials are available"""
        missing = []
        if not cls.OPENAI_API_KEY:
            missing.append('OPENAI_API_KEY')

        if missing:
            print(f"Warning: Missing credentials: {', '.join(missing)}")
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
