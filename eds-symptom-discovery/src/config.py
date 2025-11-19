"""
Configuration for EDS Symptom Discovery
========================================
Centralized configuration for the project.
"""

from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
RESEARCH_DATA_DIR = DATA_DIR / "research"
VALIDATED_DATA_DIR = DATA_DIR / "validated"
FRONTEND_DATA_DIR = PROJECT_ROOT / "frontend" / "data"

# Analysis parameters
MIN_SYMPTOM_MENTIONS = 3  # Minimum mentions to consider a symptom
MIN_POST_COUNT = 5  # Minimum posts for statistical significance

# PubMed validation
PUBMED_MIN_PAPERS = 1  # Minimum papers for validation
PUBMED_RELEVANCE_THRESHOLD = 0.7  # Relevance score threshold
