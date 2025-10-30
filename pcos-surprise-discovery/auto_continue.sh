#!/bin/bash
# Auto-execution script for remaining pipeline phases
# This script monitors Phase 2A and automatically executes Phases 2B-4

echo "=========================================="
echo "Auto-Continue Script Started"
echo "=========================================="
echo ""

# Wait for Phase 2A to complete
echo "Waiting for Phase 2A (llm_symptom_extractor.py) to complete..."
while pgrep -f "llm_symptom_extractor.py" > /dev/null; do
    sleep 30
    echo "  Phase 2A still running... (checked at $(date +%H:%M:%S))"
done

echo "✅ Phase 2A completed!"
echo ""

# Check if Phase 2A output exists
if [ ! -f "data/processed/symptom_extractions.json" ]; then
    echo "❌ Error: Phase 2A output not found"
    exit 1
fi

echo "=========================================="
echo "Phase 2B: LLM Solution Extraction"
echo "=========================================="
python3 src/analysis/llm_solution_extractor.py
if [ $? -ne 0 ]; then
    echo "❌ Phase 2B failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Phase 2C: Symptom Aggregation"
echo "=========================================="
python3 src/analysis/symptom_aggregator.py
if [ $? -ne 0 ]; then
    echo "❌ Phase 2C failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Phase 2D: Top 30 Selection"
echo "=========================================="
python3 src/analysis/top_symptom_selector.py
if [ $? -ne 0 ]; then
    echo "❌ Phase 2D failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Phase 3A: PubMed Validation"
echo "=========================================="
python3 src/validation/pubmed_validator.py
if [ $? -ne 0 ]; then
    echo "❌ Phase 3A failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Phase 3B: Surprise Score Calculation"
echo "=========================================="
python3 src/validation/surprise_score_calculator.py
if [ $? -ne 0 ]; then
    echo "❌ Phase 3B failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Phase 4A: Association Rules Mining"
echo "=========================================="
python3 src/analysis/association_rules_miner.py
if [ $? -ne 0 ]; then
    echo "❌ Phase 4A failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Phase 4B: Treatment Effectiveness Ranking"
echo "=========================================="
python3 src/analysis/treatment_effectiveness_ranker.py
if [ $? -ne 0 ]; then
    echo "❌ Phase 4B failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Copying Results to Frontend"
echo "=========================================="
mkdir -p frontend/data
cp data/validated/surprise_rankings.json frontend/data/
echo "✅ Results copied to frontend/data/"

echo ""
echo "=========================================="
echo "🎉 ALL PHASES COMPLETE!"
echo "=========================================="
echo ""
echo "Results available at:"
echo "  - data/validated/surprise_rankings.json"
echo "  - frontend/data/surprise_rankings.json"
echo ""
echo "To view the web interface:"
echo "  open frontend/index.html"
echo ""
echo "=========================================="

# Display top 10 surprising symptoms
echo "Top 10 Surprising Symptoms:"
echo "=========================================="
python3 << 'EOF'
import json
try:
    with open('data/validated/surprise_rankings.json', 'r') as f:
        rankings = json.load(f)
    for i, symptom in enumerate(rankings[:10], 1):
        name = symptom['symptom'].replace('_', ' ').title()
        classification = symptom['surprise_classification']
        score = symptom['surprise_score']
        print(f"{i}. {classification} {name} (score: {score:.2f})")
except Exception as e:
    print(f"Could not display results: {e}")
EOF
