"""
Pharmacological Class Simplifier
Converts technical FDA pharm class names to plain language for general audience
"""

from typing import Dict, Tuple


class PharmClassSimplifier:
    """Simplifies FDA pharmacological class names for layman understanding"""

    def __init__(self):
        # Manual mappings for common complex terms
        self.manual_mappings = {
            'Programmed Death Receptor-1 Blocking Antibody [EPC]': {
                'simple_name': 'PD-1 Inhibitors',
                'category': 'Cancer Immunotherapy',
                'description': 'Helps the immune system recognize and attack cancer cells',
                'uses': 'Melanoma, lung cancer, kidney cancer, head and neck cancer',
                'examples': 'Keytruda, Opdivo'
            },
            'Hepatitis B Virus Nucleoside Analog Reverse Transcriptase Inhibitor [EPC]; Human Immunodeficiency Virus Nucleoside Analog Reverse Transcriptase Inhibitor [EPC]': {
                'simple_name': 'HIV/Hepatitis B Antivirals',
                'category': 'Infectious Disease',
                'description': 'Blocks virus replication in HIV and Hepatitis B infections',
                'uses': 'HIV, Hepatitis B',
                'examples': 'Viread, Emtriva'
            },
            'Nonsteroidal Anti-inflammatory Drug [EPC]': {
                'simple_name': 'NSAIDs',
                'category': 'Pain & Inflammation',
                'description': 'Reduces pain, fever, and inflammation',
                'uses': 'Arthritis, headaches, muscle pain, fever',
                'examples': 'Ibuprofen, Naproxen, Aspirin'
            },
            'Corticosteroid [EPC]': {
                'simple_name': 'Corticosteroids',
                'category': 'Anti-inflammatory',
                'description': 'Reduces inflammation and suppresses immune response',
                'uses': 'Asthma, allergies, arthritis, autoimmune diseases',
                'examples': 'Prednisone, Dexamethasone, Hydrocortisone'
            },
            'Benzodiazepine [EPC]': {
                'simple_name': 'Benzodiazepines',
                'category': 'Anxiety & Sleep',
                'description': 'Reduces anxiety and promotes sleep',
                'uses': 'Anxiety, insomnia, seizures, muscle spasms',
                'examples': 'Xanax, Valium, Ativan'
            },
            'Atypical Antipsychotic [EPC]': {
                'simple_name': 'Atypical Antipsychotics',
                'category': 'Mental Health',
                'description': 'Treats psychosis, schizophrenia, and bipolar disorder',
                'uses': 'Schizophrenia, bipolar disorder, depression augmentation',
                'examples': 'Abilify, Risperdal, Zyprexa'
            },
            'Thiazide Diuretic [EPC]': {
                'simple_name': 'Thiazide Diuretics',
                'category': 'Blood Pressure',
                'description': 'Removes excess water and salt to lower blood pressure',
                'uses': 'High blood pressure, heart failure, kidney stones',
                'examples': 'Hydrochlorothiazide, Chlorthalidone'
            },
            'Azole Antifungal [EPC]': {
                'simple_name': 'Azole Antifungals',
                'category': 'Fungal Infections',
                'description': 'Treats fungal infections',
                'uses': 'Yeast infections, ringworm, serious systemic fungal infections',
                'examples': 'Fluconazole, Itraconazole, Voriconazole'
            },
            'Anti-epileptic Agent [EPC]': {
                'simple_name': 'Anti-Seizure Medications',
                'category': 'Neurology',
                'description': 'Prevents and controls seizures',
                'uses': 'Epilepsy, seizure disorders, nerve pain, bipolar disorder',
                'examples': 'Keppra, Lamictal, Depakote'
            },
            'Insulin Analog [EPC]': {
                'simple_name': 'Insulin Analogs',
                'category': 'Diabetes',
                'description': 'Modified insulin that acts faster or longer than natural insulin',
                'uses': 'Type 1 and Type 2 diabetes',
                'examples': 'Humalog, Lantus, NovoLog'
            },
            'Insulin [EPC]': {
                'simple_name': 'Insulin',
                'category': 'Diabetes',
                'description': 'Regulates blood sugar levels',
                'uses': 'Type 1 and Type 2 diabetes',
                'examples': 'Regular Insulin, NPH Insulin'
            },
            'Hedgehog Pathway Inhibitor [EPC]': {
                'simple_name': 'Hedgehog Inhibitors',
                'category': 'Targeted Cancer Therapy',
                'description': 'Blocks cancer cell growth pathway (Hedgehog signaling)',
                'uses': 'Basal cell carcinoma (skin cancer)',
                'examples': 'Erivedge, Odomzo'
            },
            'Tyrosine Kinase 2 Inhibitor [EPC]': {
                'simple_name': 'TYK2 Inhibitors',
                'category': 'Autoimmune Disease',
                'description': 'Blocks inflammatory signals in immune cells',
                'uses': 'Psoriasis, psoriatic arthritis',
                'examples': 'Sotyktu'
            },
            'Isocitrate Dehydrogenase 1 Inhibitor [EPC]; Isocitrate Dehydrogenase 2 Inhibitor [EPC]': {
                'simple_name': 'IDH Inhibitors',
                'category': 'Targeted Cancer Therapy',
                'description': 'Blocks mutant enzymes that help cancer cells grow',
                'uses': 'Acute myeloid leukemia (AML) with IDH mutations',
                'examples': 'Idhifa, Tibsovo'
            },
            'Sphingosine 1-phosphate Receptor Modulator [EPC]': {
                'simple_name': 'S1P Modulators',
                'category': 'Multiple Sclerosis',
                'description': 'Prevents immune cells from attacking the nervous system',
                'uses': 'Multiple sclerosis',
                'examples': 'Gilenya, Zeposia'
            },
            'Vesicular Monoamine Transporter 2 Inhibitor [EPC]': {
                'simple_name': 'VMAT2 Inhibitors',
                'category': 'Movement Disorders',
                'description': 'Controls involuntary movements by regulating dopamine',
                'uses': 'Huntington\'s disease, tardive dyskinesia (involuntary movements)',
                'examples': 'Austedo, Ingrezza'
            },
            'Penem Antibacterial [EPC]': {
                'simple_name': 'Penem Antibiotics',
                'category': 'Infectious Disease',
                'description': 'Treats serious bacterial infections',
                'uses': 'Resistant bacterial infections, hospital-acquired infections',
                'examples': 'Faropenem'
            },
            'Lead Chelator [EPC]': {
                'simple_name': 'Lead Chelators',
                'category': 'Toxin Removal',
                'description': 'Removes lead from the body in lead poisoning',
                'uses': 'Lead poisoning',
                'examples': 'Succimer, EDTA'
            },
            'Actinomycin [EPC]': {
                'simple_name': 'Actinomycins',
                'category': 'Cancer Chemotherapy',
                'description': 'Chemotherapy that stops cancer DNA from working',
                'uses': 'Wilms tumor, rhabdomyosarcoma, gestational trophoblastic disease',
                'examples': 'Dactinomycin'
            },
            'Radioligand Therapeutic Agent [EPC]': {
                'simple_name': 'Radioligand Therapy',
                'category': 'Targeted Cancer Therapy',
                'description': 'Delivers radiation directly to cancer cells',
                'uses': 'Prostate cancer, neuroendocrine tumors',
                'examples': 'Pluvicto, Lutathera'
            },
            'Epidermal Growth Factor Receptor Antagonist [EPC]': {
                'simple_name': 'EGFR Blockers',
                'category': 'Targeted Cancer Therapy',
                'description': 'Blocks signals that help cancer cells grow',
                'uses': 'Lung cancer, colorectal cancer, head and neck cancer',
                'examples': 'Erbitux, Vectibix'
            },
            'Cholinergic Nicotinic Agonist [EPC]': {
                'simple_name': 'Nicotinic Agonists',
                'category': 'Neuromuscular',
                'description': 'Stimulates nicotinic receptors to improve muscle function',
                'uses': 'Myasthenia gravis, smoking cessation, cognitive enhancement',
                'examples': 'Nicotine patches, Varenicline'
            },
            'Cytomegalovirus Nucleoside Analog DNA Polymerase Inhibitor [EPC]; Nucleoside Analog Antiviral [EPC]': {
                'simple_name': 'CMV Antivirals',
                'category': 'Infectious Disease',
                'description': 'Treats cytomegalovirus (CMV) infections',
                'uses': 'CMV retinitis in AIDS patients, CMV in transplant recipients',
                'examples': 'Ganciclovir, Valganciclovir'
            },
            'Echinocandin Antifungal [EPC]': {
                'simple_name': 'Echinocandin Antifungals',
                'category': 'Fungal Infections',
                'description': 'Treats serious invasive fungal infections',
                'uses': 'Candida bloodstream infections, invasive aspergillosis',
                'examples': 'Caspofungin, Micafungin'
            },
            'Benzodiazepine Antagonist [EPC]': {
                'simple_name': 'Benzodiazepine Reversal Agents',
                'category': 'Antidote',
                'description': 'Reverses benzodiazepine overdose',
                'uses': 'Benzodiazepine overdose reversal',
                'examples': 'Flumazenil'
            },
            'CXC Chemokine Receptor 4 Antagonist [EPC]': {
                'simple_name': 'CXCR4 Blockers',
                'category': 'Blood Cancer',
                'description': 'Mobilizes stem cells for transplantation',
                'uses': 'Stem cell mobilization for transplant in lymphoma/myeloma',
                'examples': 'Mozobil'
            },
            'CD3-directed Antibody [EPC]': {
                'simple_name': 'CD3-directed Antibodies',
                'category': 'Cancer Immunotherapy',
                'description': 'Directs immune T-cells to attack cancer cells',
                'uses': 'Blood cancers (leukemia, lymphoma)',
                'examples': 'Blincyto'
            },
            'Dihydrofolate Reductase Inhibitor Antibacterial [EPC]': {
                'simple_name': 'DHFR Inhibitor Antibiotics',
                'category': 'Infectious Disease',
                'description': 'Treats bacterial infections by blocking folate synthesis',
                'uses': 'Urinary tract infections, toxoplasmosis, malaria',
                'examples': 'Trimethoprim'
            },
            'gamma-Aminobutyric Acid A Receptor Agonist [EPC]': {
                'simple_name': 'GABA-A Agonists',
                'category': 'Neurology',
                'description': 'Calms brain activity',
                'uses': 'Epilepsy, anxiety, insomnia',
                'examples': 'Gaboxadol'
            },
            'Sodium-Glucose Cotransporter 2 Inhibitor [EPC]; Dipeptidyl Peptidase 4 Inhibitor [EPC]': {
                'simple_name': 'SGLT2/DPP-4 Combo',
                'category': 'Diabetes',
                'description': 'Combination diabetes treatment (lowers blood sugar two ways)',
                'uses': 'Type 2 diabetes',
                'examples': 'Qternmet, Glyxambi'
            },
            'Ileal Bile Acid Transporter Inhibitor [EPC]': {
                'simple_name': 'Bile Acid Blockers',
                'category': 'Gastrointestinal',
                'description': 'Treats chronic diarrhea from bile acid malabsorption',
                'uses': 'Bile acid diarrhea, irritable bowel syndrome',
                'examples': 'Bylvay'
            }
        }

        # Pattern-based simplification rules
        self.replacement_patterns = [
            ('Antibacterial', 'Antibiotic'),
            ('[EPC]', ''),
            ('[MoA]', ''),
            ('Receptor Antagonist', 'Blocker'),
            ('Receptor Agonist', 'Activator'),
            ('Inhibitor', 'Inhibitor'),
            (' ; ', ' / '),
        ]

    def simplify(self, pharm_class: str, drug_count: int = None) -> Dict:
        """
        Simplify a pharmacological class name

        Returns dict with:
        - simple_name: Simplified display name
        - category: Broader therapeutic category
        - description: What it does (plain language)
        - uses: What conditions it treats
        - examples: Example drug names
        - technical_name: Original FDA name
        - count: Number of drugs (if provided)
        """
        # Check manual mappings first
        if pharm_class in self.manual_mappings:
            result = self.manual_mappings[pharm_class].copy()
            result['technical_name'] = pharm_class
            if drug_count is not None:
                result['count'] = drug_count
            return result

        # Auto-simplify using patterns
        simplified = pharm_class
        for pattern, replacement in self.replacement_patterns:
            simplified = simplified.replace(pattern, replacement)

        simplified = simplified.strip()

        # Infer category from keywords
        category = self._infer_category(pharm_class)

        return {
            'simple_name': simplified,
            'category': category,
            'description': 'Pharmaceutical agent',  # Generic description
            'uses': 'Various conditions',
            'examples': 'See FDA database',
            'technical_name': pharm_class,
            'count': drug_count
        }

    def _infer_category(self, pharm_class: str) -> str:
        """Infer broader therapeutic category from pharm class name"""
        text_lower = pharm_class.lower()

        # Category inference rules
        if any(term in text_lower for term in ['cancer', 'oncol', 'tumor', 'chemo', 'antibody', 'kinase inhibitor']):
            return 'Cancer Treatment'
        elif any(term in text_lower for term in ['antibiotic', 'antibacterial', 'antiviral', 'antifungal']):
            return 'Infectious Disease'
        elif any(term in text_lower for term in ['insulin', 'diabetes', 'glucose']):
            return 'Diabetes'
        elif any(term in text_lower for term in ['hypertens', 'blood pressure', 'cardiac', 'heart']):
            return 'Cardiovascular'
        elif any(term in text_lower for term in ['pain', 'analges', 'opioid', 'nsaid']):
            return 'Pain Management'
        elif any(term in text_lower for term in ['antidepress', 'antipsychotic', 'anxiety', 'psychiatric']):
            return 'Mental Health'
        elif any(term in text_lower for term in ['immune', 'inflammatory', 'arthritis', 'autoimmune']):
            return 'Immunology'
        elif any(term in text_lower for term in ['seizure', 'epilep', 'neurological']):
            return 'Neurology'
        elif any(term in text_lower for term in ['respiratory', 'asthma', 'bronch']):
            return 'Respiratory'
        else:
            return 'Other'

    def format_for_display(self, pharm_class: str, drug_count: int) -> str:
        """
        Format for display in charts
        Returns: "Simple Name (Category) - 123 drugs"
        """
        info = self.simplify(pharm_class, drug_count)
        return f"{info['simple_name']} ({info['category']})"

    def format_for_tooltip(self, pharm_class: str, drug_count: int) -> str:
        """
        Format detailed tooltip HTML
        """
        info = self.simplify(pharm_class, drug_count)

        tooltip = f"""<strong>{info['simple_name']}</strong><br/>
<em>{info['category']}</em><br/><br/>
<strong>What it does:</strong> {info['description']}<br/>
<strong>Used for:</strong> {info['uses']}<br/>
<strong>Examples:</strong> {info['examples']}<br/>
<strong>Total drugs:</strong> {drug_count:,}"""

        return tooltip


if __name__ == '__main__':
    # Test the simplifier
    simplifier = PharmClassSimplifier()

    test_classes = [
        'Programmed Death Receptor-1 Blocking Antibody [EPC]',
        'Nonsteroidal Anti-inflammatory Drug [EPC]',
        'Hedgehog Pathway Inhibitor [EPC]',
        'Corticosteroid [EPC]',
        'Random Unknown Class [EPC]'
    ]

    print("Testing PharmClassSimplifier:\n")
    for pc in test_classes:
        result = simplifier.simplify(pc, 150)
        print(f"Original: {pc}")
        print(f"Display: {simplifier.format_for_display(pc, 150)}")
        print(f"Tooltip: {simplifier.format_for_tooltip(pc, 150)}")
        print("-" * 80)
