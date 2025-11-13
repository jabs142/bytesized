# EDS Symptom Discovery Tool 🧬💡

> **Helping patients discover surprising symptoms they didn't know were related
> to Ehlers-Danlos Syndrome**

An evidence-based educational tool that validates symptom-EDS relationships
using multi-source data (Reddit experiences + PubMed research + diagnostic
criteria) to help shorten the 10+ year average diagnostic journey.

---

## 🎯 Project Goal

**Problem**: EDS patients often don't realize certain symptoms are related to
their condition:

- Motion sickness? Related to EDS dysautonomia
- Dental problems? Linked to connective tissue issues
- Temperature sensitivity? Common in EDS patients
- **Average diagnosis time: 10-12 years** due to lack of awareness

**Solution**: Build a tool that:

1. Validates symptom-EDS relationships with **scientific evidence**
2. Highlights **"surprising" symptoms** patients might miss
3. Tiers symptoms by evidence strength (diagnostic criteria → research → patient
   reports)
4. Provides **actionable information** for doctor conversations

---

## ✨ Key Innovation: Multi-Source Validation

Unlike single-source analysis, we combine:

### 1. **Reddit Patient Experiences** (What people report)

- r/ehlersdanlos, r/Hypermobility (general EDS communities only, avoiding
  symptom-specific bias)
- Track symptom frequency and co-occurrence
- Identify "hidden" symptoms patients mention

### 2. **PubMed Research** (What science says)

- Automated literature search via E-utilities API
- Extract prevalence data, sample sizes, key findings
- Link to original papers for verification

### 3. **Official Diagnostic Criteria** (What's officially recognized)

- 2017 International EDS Classification
- Ehlers-Danlos Society guidelines
- Core vs associated features

---

## 📊 Evidence Tiering System

| Tier       | Definition                           | Example                                      | Badge |
| ---------- | ------------------------------------ | -------------------------------------------- | ----- |
| **Tier 1** | Official diagnostic criteria         | Joint hypermobility, skin hyperextensibility | 🏆    |
| **Tier 2** | Research-backed (3+ studies)         | POTS (73% prevalence), gastroparesis (45%)   | ✅    |
| **Tier 3** | Strong patient signal (100+ reports) | Motion sickness, temperature sensitivity     | 💬    |
| **Tier 4** | Emerging pattern                     | Needs more research                          | ⚠️    |

---

## 🔬 Surprise Detection

**"Surprise Factor"** = High patient reports + Low public awareness

Algorithm:

```python
surprise_score = (reddit_mentions / total_posts) * (1 - google_search_volume)
```

Symptoms with **high surprise scores** are the "hidden gems" we want to surface.

**Example**:

- Motion sickness: 234 Reddit mentions, low awareness → **High surprise**
- Joint pain: 450 mentions, high awareness → **Low surprise** (expected)

---

## 🏗️ Project Structure

```
eds-symptom-discovery/
├── src/
│   ├── data_collection/
│   │   ├── reddit_collector.py      # Collect from EDS subreddits
│   │   ├── pubmed_fetcher.py        # PubMed E-utilities API
│   │   └── criteria_parser.py       # Parse diagnostic criteria
│   ├── validation/
│   │   ├── evidence_validator.py    # Multi-source validation
│   │   ├── symptom_classifier.py    # Tier assignment
│   │   └── surprise_detector.py     # Calculate surprise scores
│   └── analysis/
│       ├── symptom_extractor.py     # NLP extraction
│       └── prevalence_calculator.py # Statistical analysis
├── data/
│   ├── raw/              # Reddit posts
│   ├── research/         # PubMed papers
│   ├── official/         # Diagnostic criteria
│   └── validated/        # Final symptom database
├── notebooks/
│   ├── 01_data_collection.ipynb
│   ├── 02_validation.ipynb
│   └── 03_surprise_detection.ipynb
├── frontend/
│   └── index.html        # Interactive symptom discovery tool
└── docs/
    ├── METHODOLOGY.md
    └── API_GUIDE.md
```

---

## 🚀 Quick Start

### 1. Setup

```bash
cd eds-symptom-discovery
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Collect Data

```bash
# Reddit experiences
python src/data_collection/reddit_collector.py

# PubMed research (no API key needed!)
python src/data_collection/pubmed_fetcher.py

# Parse diagnostic criteria
python src/data_collection/criteria_parser.py
```

### 3. Validate Symptoms

```bash
jupyter notebook notebooks/02_validation.ipynb
```

### 4. Launch Interactive Tool

```bash
cd frontend
python3 -m http.server 8000
```

---

## 📖 Learning Objectives

This project teaches:

1. **Multi-source data integration** (Reddit + PubMed + official docs)
2. **Evidence-based classification** (tiering systems)
3. **PubMed E-utilities API** (free research database access)
4. **Surprise detection algorithms** (finding hidden patterns)
5. **Medical ontology mapping** (standardizing symptom names)
6. **Responsible health data presentation** (disclaimers, transparency)

---

## 🔑 Key Concepts

### PubMed E-utilities API

Free API for searching biomedical literature:

```python
# Search for papers
search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
params = {
    "db": "pubmed",
    "term": "Ehlers Danlos motion sickness",
    "retmax": 20
}
```

### Evidence Validation Pipeline

```
Symptom → Reddit Check → PubMed Search → Criteria Check → Tier Assignment
```

### Surprise Score

```python
def calculate_surprise(symptom):
    patient_frequency = reddit_mentions / total_posts
    public_awareness = google_trends_score / 100
    research_coverage = pubmed_papers / 100

    surprise = patient_frequency * (1 - public_awareness) * (1 - research_coverage)
    return surprise
```

---

## 📊 Expected Output

**Interactive Tool Features**:

1. **Symptom Discovery**: "I have EDS, what else should I look for?"
2. **Evidence Viewer**: Click symptom → see tier, research links, patient
   reports
3. **Surprise Highlights**: "Did you know EDS is linked to...?"
4. **Doctor Checklist**: Export symptom list to bring to appointments

**Example Output**:

```
Motion Sickness
├─ Tier: 2 (Research-backed) ✅
├─ Prevalence: 67% of hEDS patients (Study: Smith 2019, n=89)
├─ Reddit mentions: 234 posts
├─ Surprise score: 0.78 (HIGH - commonly missed)
├─ PubMed: 3 studies
│   └─ [Link] "Vestibular dysfunction in hEDS patients"
└─ Likely related to: Dysautonomia, proprioception issues
```

---

## ⚠️ Limitations & Disclaimers

**This tool is for educational purposes only**:

- NOT for self-diagnosis
- NOT a replacement for medical evaluation
- Reddit data = subjective experiences, not clinical evidence
- Correlation ≠ Causation
- Always consult healthcare professionals

**Ethical Considerations**:

- All Reddit data anonymized
- PubMed data cited with proper attribution
- Transparent about evidence levels
- Clear distinction between validated vs emerging

---

## 🎯 Success Metrics

**Data Quality**:

- 500+ Reddit posts collected
- 50+ symptoms validated
- 10+ Tier 2 (research-backed) symptoms identified
- 20+ Tier 3 (patient-validated) symptoms

**Surprise Discovery**:

- Identify 5-10 "hidden" symptoms with surprise score > 0.7
- Find symptoms in 50%+ of patient reports but < 20% public awareness

**Impact**:

- Help patients bring comprehensive symptom lists to doctors
- Reduce diagnostic delay by surfacing uncommon symptoms
- Provide research links for evidence-based conversations

---

## 📚 References

### EDS Resources

- [Ehlers-Danlos Society](https://www.ehlers-danlos.com/)
- [2017 International Classification](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5473340/)
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/)

### APIs Used

- [Reddit PRAW](https://praw.readthedocs.io/)
- [PubMed E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25501/)

---

## 👩‍💻 Author

Built by [Your Name] as a learning project exploring:

- Multi-source data validation
- Evidence-based health informatics
- Rare disease patient advocacy
- Responsible AI in healthcare

**Background**: Pharmacy + Software Engineering **Motivation**: Bridge
healthcare knowledge with data science for patient empowerment

---

## 📜 License

Educational use only. Respect patient privacy and cite all sources.

---

**Status**: 🚧 In Development **Next Steps**: Collect Reddit data → Integrate
PubMed API → Build validation pipeline
