"""
Extract Official PCOS Diagnostic Criteria
Creates baseline of what's "expected" vs "surprising"
"""
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from config import Config


def create_official_criteria():
    """
    Define official PCOS diagnostic criteria

    Sources:
    - Rotterdam Criteria (most common)
    - NIH Criteria
    """
    criteria = {
        "metadata": {
            "created_at": "2025-01-29",
            "description": "Official PCOS diagnostic criteria from medical guidelines",
            "sources": [
                "Rotterdam Criteria (ESHRE/ASRM 2003)",
                "NIH Criteria (1990)",
                "Androgen Excess Society (2006)"
            ]
        },
        "rotterdam_criteria": {
            "name": "Rotterdam Criteria",
            "year": 2003,
            "requires": "2 of 3 criteria",
            "criteria": [
                {
                    "criterion": "oligo_or_anovulation",
                    "name": "Oligo-ovulation or anovulation",
                    "symptoms": [
                        "irregular_periods",
                        "absent_periods",
                        "amenorrhea",
                        "infrequent_menstruation"
                    ]
                },
                {
                    "criterion": "hyperandrogenism",
                    "name": "Clinical or biochemical signs of hyperandrogenism",
                    "symptoms": [
                        "hirsutism",
                        "facial_hair",
                        "acne",
                        "male_pattern_baldness",
                        "elevated_testosterone"
                    ]
                },
                {
                    "criterion": "polycystic_ovaries",
                    "name": "Polycystic ovaries on ultrasound",
                    "symptoms": [
                        "ovarian_cysts",
                        "enlarged_ovaries",
                        "multiple_follicles"
                    ]
                }
            ],
            "exclusions": [
                "thyroid_disorders",
                "hyperprolactinemia",
                "congenital_adrenal_hyperplasia"
            ]
        },
        "nih_criteria": {
            "name": "NIH Criteria",
            "year": 1990,
            "requires": "Both criteria required",
            "criteria": [
                {
                    "criterion": "hyperandrogenism",
                    "name": "Clinical or biochemical hyperandrogenism",
                    "symptoms": [
                        "hirsutism",
                        "acne",
                        "elevated_androgens"
                    ]
                },
                {
                    "criterion": "oligo_or_anovulation",
                    "name": "Chronic anovulation",
                    "symptoms": [
                        "irregular_periods",
                        "absent_periods"
                    ]
                }
            ]
        },
        "commonly_discussed_symptoms": {
            "description": "Symptoms commonly associated with PCOS in medical literature but not in diagnostic criteria",
            "symptoms": [
                {
                    "symptom": "insulin_resistance",
                    "category": "metabolic",
                    "expected": True,
                    "note": "Present in 50-70% of PCOS patients"
                },
                {
                    "symptom": "weight_gain",
                    "category": "metabolic",
                    "expected": True
                },
                {
                    "symptom": "difficulty_losing_weight",
                    "category": "metabolic",
                    "expected": True
                },
                {
                    "symptom": "infertility",
                    "category": "reproductive",
                    "expected": True
                },
                {
                    "symptom": "dark_skin_patches",
                    "category": "skin",
                    "expected": True,
                    "medical_term": "acanthosis_nigricans"
                }
            ]
        },
        "diagnostic_core_features": [
            "irregular_periods",
            "absent_periods",
            "amenorrhea",
            "hirsutism",
            "facial_hair",
            "acne",
            "ovarian_cysts",
            "elevated_testosterone",
            "elevated_androgens"
        ],
        "associated_but_not_diagnostic": [
            "insulin_resistance",
            "weight_gain",
            "difficulty_losing_weight",
            "infertility",
            "dark_skin_patches",
            "acanthosis_nigricans"
        ]
    }

    return criteria


def save_criteria(criteria: dict):
    """Save criteria to JSON file"""
    output_path = Config.OFFICIAL_DATA_DIR / Config.OFFICIAL_CRITERIA_FILE

    # Create directory if it doesn't exist
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(criteria, f, indent=2, ensure_ascii=False)

    print(f"✅ Official PCOS criteria saved to: {output_path}")

    # Print summary
    print("\nDiagnostic Core Features:")
    for feature in criteria['diagnostic_core_features']:
        print(f"  - {feature}")

    print(f"\nTotal diagnostic symptoms: {len(criteria['diagnostic_core_features'])}")
    print(f"Associated but not diagnostic: {len(criteria['associated_but_not_diagnostic'])}")


def main():
    """Main execution function"""
    print("="*50)
    print("Extracting Official PCOS Diagnostic Criteria")
    print("="*50)

    criteria = create_official_criteria()
    save_criteria(criteria)

    print("\n✅ Criteria extraction complete!")


if __name__ == "__main__":
    main()
