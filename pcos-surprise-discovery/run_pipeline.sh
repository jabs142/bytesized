#!/bin/bash

# PCOS Surprise Discovery Pipeline
# Runs all phases of the analysis

set -e  # Exit on error

echo "=================================================="
echo "PCOS Surprising Symptom Discovery Pipeline"
echo "=================================================="
echo ""

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "❌ Error: Virtual environment not activated"
    echo "Please run: source venv/bin/activate"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please copy .env.example to .env and add your API keys"
    exit 1
fi

echo "✅ Environment checks passed"
echo ""

# PHASE 1: Data Collection
echo "=================================================="
echo "PHASE 1: Data Collection"
echo "=================================================="
echo ""

echo "Step 1A: Collecting 500 Reddit posts..."
python src/data_collection/reddit_collector.py
echo ""

echo "Step 1B: Extracting official PCOS criteria..."
python src/data_collection/extract_official_criteria.py
echo ""

# PHASE 2: LLM Discovery
echo "=================================================="
echo "PHASE 2: LLM-Powered Discovery"
echo "=================================================="
echo ""

echo "Step 2A: Extracting symptoms with LLM..."
python src/analysis/llm_symptom_extractor.py
echo ""

echo "Step 2B: Extracting treatment solutions with LLM..."
python src/analysis/llm_solution_extractor.py
echo ""

echo "Step 2C: Aggregating symptoms..."
python src/analysis/symptom_aggregator.py
echo ""

# PHASE 3: Surprise Analysis
echo "=================================================="
echo "PHASE 3: Surprise Factor Calculation"
echo "=================================================="
echo ""

echo "Step 3A: Selecting top 30 symptoms..."
python src/analysis/top_symptom_selector.py
echo ""

echo "Step 3B: Validating with PubMed (this may take 5-10 minutes)..."
python src/validation/pubmed_validator.py
echo ""

echo "Step 3C: Calculating surprise scores..."
python src/validation/surprise_score_calculator.py
echo ""

# Final Summary
echo "=================================================="
echo "✅ Pipeline Complete!"
echo "=================================================="
echo ""
echo "Results saved to:"
echo "  - data/raw/reddit_pcos_posts.json"
echo "  - data/official/pcos_criteria.json"
echo "  - data/processed/all_symptoms_discovered.json"
echo "  - data/processed/solutions_discovered.json"
echo "  - data/validated/surprise_rankings.json"
echo ""
echo "Next steps:"
echo "  1. Review results: data/validated/surprise_rankings.json"
echo "  2. Explore patterns in Jupyter notebooks"
echo "  3. Run Phase 4 (pattern mining) - coming soon"
echo "  4. Build web interface (Phase 5) - coming soon"
echo ""
