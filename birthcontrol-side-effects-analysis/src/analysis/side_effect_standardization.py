"""
Side Effect Standardization Module
===================================
Shared standardization rules for side effect names across the project.
This module ensures consistent naming conventions are applied in all scripts.
"""

# Standardization rules for side effect names
# Maps various forms to standardized canonical names
STANDARDIZATION_RULES = {
    # PMDD variations
    "premenstrual dysphoric disorder (PMDD)": "premenstrual dysphoric disorder",
    "premenstrual dysphoric disorder (pmdd)": "premenstrual dysphoric disorder",
    "PMDD": "premenstrual dysphoric disorder",
    "severe PMDD": "premenstrual dysphoric disorder",
    "PMDD episodes": "premenstrual dysphoric disorder",
    "PMDD symptoms": "premenstrual dysphoric disorder",

    # Acne variations
    "severe acne": "acne",
    "acne exacerbation": "acne",
    "cystic acne": "acne",
    "hormonal acne": "acne",
    "acne flare-ups": "acne",

    # Libido variations
    "low libido": "decreased libido",
    "loss of libido": "decreased libido",
    "no sex drive": "decreased libido",
    "reduced libido": "decreased libido",

    # Heavy bleeding variations
    "menorrhagia": "heavy menstrual flow",
    "heavy periods": "heavy menstrual flow",
    "excessive bleeding": "heavy menstrual flow",
    "heavy bleeding": "heavy menstrual flow",

    # Mood variations
    "mood instability": "mood swings",
    "emotional instability": "mood swings",
    "mood changes": "mood swings",
    "emotional lability": "mood swings",

    # Hair loss variations
    "alopecia": "hair loss",
    "hair thinning": "hair loss",
    "extreme hair loss": "hair loss",

    # Cognitive variations
    "cognitive dysfunction": "brain fog",
    "cognitive issues": "brain fog",
    "mental fog": "brain fog",

    # Pain variations
    "dysmenorrhea": "painful periods",
    "cramps": "painful periods",
    "menstrual pain": "painful periods"
}

def standardize_side_effect(side_effect_name: str) -> str:
    """
    Standardize a side effect name to its canonical form.

    Args:
        side_effect_name: The side effect name to standardize

    Returns:
        The standardized side effect name
    """
    # First check if it needs standardization
    if side_effect_name in STANDARDIZATION_RULES:
        return STANDARDIZATION_RULES[side_effect_name]

    # Also check lowercase version
    lower = side_effect_name.lower()
    if lower in STANDARDIZATION_RULES:
        return STANDARDIZATION_RULES[lower]

    # Return original if no standardization rule found
    return side_effect_name

def get_all_variants(canonical_name: str) -> list:
    """
    Get all known variants of a canonical side effect name.

    Args:
        canonical_name: The standardized side effect name

    Returns:
        List of all variants that map to this canonical name
    """
    variants = [canonical_name]  # Include the canonical name itself
    for variant, canonical in STANDARDIZATION_RULES.items():
        if canonical == canonical_name and variant not in variants:
            variants.append(variant)
    return variants