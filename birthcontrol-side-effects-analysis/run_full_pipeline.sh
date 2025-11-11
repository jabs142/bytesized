#!/bin/bash
# Full Analysis Pipeline with Quality Controls
# Runs complete extraction → validation → relevance checking → comment analysis

set -e  # Exit on error

echo "=========================================="
echo "Birth Control Analysis - Full Pipeline"
echo "=========================================="
echo ""

# Activate virtual environment
source .venv/bin/activate

# Step 1: LLM Extraction (already running in background, skip if done)
echo "Step 1: LLM Side Effect Extraction"
echo "-----------------------------------"
if [ -f "data/analysis/llm_side_effect_stats.json" ]; then
    echo "✓ LLM extraction data found"
else
    echo "Running LLM extraction..."
    python src/analysis/llm_side_effect_extractor.py
fi
echo ""

# Step 2: PubMed Validation (evidence_validator.py)
echo "Step 2: PubMed Evidence Validation"
echo "-----------------------------------"
echo "Validating side effects against PubMed..."
python src/validation/evidence_validator.py
echo ""

# Step 3: PubMed Relevance Filtering
echo "Step 3: PubMed Relevance Filtering"
echo "-----------------------------------"
echo "Checking paper relevance with LLM..."
python src/validation/pubmed_relevance_checker.py
echo ""

# Step 4: Comment Validation
echo "Step 4: Comment Validation Analysis"
echo "-----------------------------------"
echo "Analyzing comment validations..."
python src/analysis/llm_comment_validator.py
echo ""

# Step 5: Copy data to frontend
echo "Step 5: Updating Frontend Data"
echo "-----------------------------------"
echo "Copying updated data to frontend..."

# Create frontend data directory if it doesn't exist
mkdir -p frontend/data

# Copy validated database (with relevance filtering)
if [ -f "data/validated/validated_side_effects_database_filtered.json" ]; then
    cp data/validated/validated_side_effects_database_filtered.json frontend/data/validated_side_effects_database.json
    echo "✓ Copied relevance-filtered database"
elif [ -f "data/validated/validated_side_effects_database.json" ]; then
    cp data/validated/validated_side_effects_database.json frontend/data/
    echo "✓ Copied validated database"
fi

# Copy LLM stats
if [ -f "data/analysis/llm_side_effect_stats.json" ]; then
    cp data/analysis/llm_side_effect_stats.json frontend/data/
    echo "✓ Copied LLM stats"
fi

# Copy comment validations
if [ -f "data/analysis/comment_validations.json" ]; then
    cp data/analysis/comment_validations.json frontend/data/
    echo "✓ Copied comment validations"
fi

# Copy symptom validation stats
if [ -f "data/analysis/symptom_validation_stats.json" ]; then
    cp data/analysis/symptom_validation_stats.json frontend/data/
    echo "✓ Copied symptom validation stats"
fi

echo ""
echo "=========================================="
echo "✅ Pipeline Complete!"
echo "=========================================="
echo ""
echo "Data generated:"
echo "  - LLM-extracted side effects (with severity breakdown)"
echo "  - PubMed-validated database (with relevance filtering)"
echo "  - Comment validation results"
echo ""
echo "Frontend updated at: frontend/data/"
echo ""
echo "View results:"
echo "  cd frontend && python3 -m http.server 8000"
echo "  Open: http://localhost:8000/validation.html"
echo ""
