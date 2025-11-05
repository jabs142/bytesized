"""
Pharmacological Class to Therapeutic Area Mapper

Maps FDA pharmacological class (EPC) to therapeutic areas for improved categorization
"""

from typing import Dict, List, Optional


class PharmClassMapper:
    """Maps pharmacological classes to therapeutic areas"""

    def __init__(self):
        # Map keywords in pharm_class_epc to therapeutic areas
        self.class_mappings = {
            'Oncology': [
                'antineoplastic', 'kinase inhibitor', 'immunotherapy',
                'checkpoint inhibitor', 'programmed death', 'ctla-4',
                'car-t', 'cancer', 'tumor', 'chemotherapy', 'alkylating',
                'antimetabolite', 'topoisomerase', 'mitotic inhibitor',
                'aromatase inhibitor', 'tyrosine kinase'
            ],
            'Cardiovascular': [
                'antihypertensive', 'ace inhibitor', 'converting enzyme inhibitor',
                'angiotensin receptor blocker', 'calcium channel blocker',
                'diuretic', 'anticoagulant', 'antiplatelet', 'statin',
                'antiarrhythmic', 'vasodilator', 'cardiac glycoside',
                'thrombin inhibitor', 'factor xa inhibitor', 'angiotensin',
                'hmg-coa reductase'
            ],
            'CNS & Neurology': [
                'antiepileptic', 'anticonvulsant', 'antipsychotic',
                'dopamine agonist', 'gaba', 'nmda', 'neurotransmitter',
                'neuroprotective', 'central nervous', 'neurological',
                'alzheimer', 'parkinson', 'multiple sclerosis',
                'cholinesterase inhibitor', 'orexin receptor antagonist'
            ],
            'Pain & Analgesia': [
                'analgesic', 'opioid', 'nsaid', 'anti-inflammatory',
                'cyclooxygenase inhibitor', 'cox-2', 'pain',
                'antipyretic', 'mu-opioid', 'kappa-opioid'
            ],
            'Infectious Disease': [
                'antibiotic', 'antibacterial', 'antiviral', 'antifungal',
                'antimicrobial', 'antiretroviral', 'protease inhibitor',
                'reverse transcriptase', 'hiv', 'hepatitis', 'influenza',
                'antimycobacterial', 'antiparasitic', 'vaccine',
                'cytomegalovirus', 'dna polymerase inhibitor', 'herpes'
            ],
            'Diabetes & Endocrine': [
                'antidiabetic', 'hypoglycemic', 'insulin', 'glucagon',
                'incretin', 'glp-1', 'dpp-4', 'sglt2', 'thiazolidinedione',
                'sulfonylurea', 'biguanide', 'hormone', 'thyroid',
                'corticosteroid', 'testosterone', 'estrogen', 'progesterone'
            ],
            'Respiratory': [
                'bronchodilator', 'beta-2 adrenergic agonist', 'beta2-adrenergic',
                'anticholinergic bronchodilator', 'leukotriene',
                'mast cell stabilizer', 'respiratory', 'pulmonary',
                'asthma', 'copd', 'inhaled corticosteroid'
            ],
            'Gastrointestinal': [
                'proton pump inhibitor', 'h2 antagonist', 'antiemetic',
                'laxative', 'antidiarrheal', 'gi', 'gastrointestinal',
                'gastroprotective', 'acid reducer', 'bowel',
                'chloride channel activator', 'serotonin 5-ht3 receptor antagonist'
            ],
            'Immunology & Rheumatology': [
                'immunosuppressant', 'immunomodulator', 'tumor necrosis factor',
                'tnf blocker', 'tnf', 'interleukin', 'il-', 'jak inhibitor',
                'rheumatoid', 'autoimmune', 'inflammatory', 'arthritis', 'lupus',
                'disease-modifying antirheumatic', 'monoclonal antibody'
            ],
            'Psychiatry': [
                'antidepressant', 'serotonin reuptake inhibitor',
                'serotonin uptake inhibitor', 'snri', 'maoi', 'tricyclic',
                'anxiolytic', 'benzodiazepine', 'mood stabilizer',
                'lithium', 'antidepressant', 'selective serotonin'
            ],
            'Dermatology': [
                'topical', 'dermatologic', 'skin', 'retinoid', 'keratolytic',
                'antipruritic', 'psoriasis', 'eczema', 'dermatitis'
            ],
            'Ophthalmology': [
                'ophthalmic', 'eye', 'glaucoma', 'mydriatic', 'miotic',
                'retinal', 'macular degeneration', 'vegf inhibitor'
            ],
            'Rare & Orphan Diseases': [
                'orphan', 'rare disease', 'lysosomal storage',
                'enzyme replacement', 'gene therapy', 'muscular dystrophy',
                'cystic fibrosis', 'sickle cell', 'hemophilia'
            ]
        }

    def map_to_therapeutic_area(self, pharm_class_epc: str, pharm_class_moa: str = '') -> List[str]:
        """
        Map pharmacological class to therapeutic area(s)

        Args:
            pharm_class_epc: Established Pharmacological Class (from FDA)
            pharm_class_moa: Mechanism of Action (from FDA)

        Returns:
            List of therapeutic areas (may be multiple)
        """
        if not pharm_class_epc and not pharm_class_moa:
            return []

        # Combine both fields for searching
        search_text = f"{pharm_class_epc} {pharm_class_moa}".lower()

        matched_areas = []

        for area, keywords in self.class_mappings.items():
            for keyword in keywords:
                if keyword.lower() in search_text:
                    if area not in matched_areas:
                        matched_areas.append(area)
                    break

        return matched_areas

    def get_primary_area(self, pharm_class_epc: str, pharm_class_moa: str = '') -> Optional[str]:
        """
        Get the primary (most relevant) therapeutic area

        Args:
            pharm_class_epc: Established Pharmacological Class
            pharm_class_moa: Mechanism of Action

        Returns:
            Primary therapeutic area or None
        """
        areas = self.map_to_therapeutic_area(pharm_class_epc, pharm_class_moa)

        if not areas:
            return None

        # Priority order - more specific areas take precedence
        priority = [
            'Oncology',
            'Rare & Orphan Diseases',
            'Infectious Disease',
            'Cardiovascular',
            'CNS & Neurology',
            'Diabetes & Endocrine',
            'Respiratory',
            'Immunology & Rheumatology',
            'Psychiatry',
            'Gastrointestinal',
            'Pain & Analgesia',
            'Dermatology',
            'Ophthalmology'
        ]

        for priority_area in priority:
            if priority_area in areas:
                return priority_area

        return areas[0]


if __name__ == '__main__':
    # Test the mapper
    mapper = PharmClassMapper()

    test_cases = [
        ("Programmed Death Receptor-1 Blocking Antibody [EPC]", "Oncology"),
        ("Angiotensin Converting Enzyme Inhibitor [EPC]", "Cardiovascular"),
        ("Selective Serotonin Reuptake Inhibitor [EPC]", "Psychiatry"),
        ("Opioid Agonist [EPC]", "Pain & Analgesia"),
        ("Beta-2 Adrenergic Agonist [EPC]", "Respiratory"),
    ]

    print("Testing Pharmacological Class Mapper")
    print("=" * 60)

    for pharm_class, expected in test_cases:
        result = mapper.get_primary_area(pharm_class)
        status = "✓" if result == expected else "✗"
        print(f"{status} {pharm_class[:50]}")
        print(f"   Expected: {expected}, Got: {result}")
        print()
