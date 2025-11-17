# Raw Data Archive

This directory contains raw Reddit post data that was used for backend processing but is **not loaded by the frontend**. These files have been moved here to reduce frontend bundle size and deployment footprint.

## Contents

### Birth Control Project
- `reddit_bc_symptoms_posts_20251027_175721.json` (2.1MB)
  - Raw Reddit posts from r/birthcontrol
  - Used for backend LLM extraction and pattern mining
  - Frontend uses processed files: `symptom_network.json`, `stats.json`, etc.

### PCOS Project
- `reddit_pcos_posts.json` (1.6MB)
  - Raw Reddit posts from r/PCOS
  - Used for backend surprise score calculation
  - Frontend uses processed file: `surprise_rankings.json`

### EDS Project
- `eds_reddit_posts_20251028_115859.json` (689KB)
  - Raw Reddit posts from r/ehlersdanlos
  - Used for backend LLM symptom extraction

- `symptom_mentions_20251028_115859.json` (11KB)
  - Initial symptom mentions extracted by LLM
  - Used as intermediate processing step

- `symptom_stats_20251028_115859.json` (12KB)
  - Raw symptom statistics before validation
  - Frontend uses validated files: `symptom_summary.json`, `llm_symptom_database.json`

### COVID Scrollytelling Project
- `covid-data-full.json` (20MB)
  - Full daily COVID-19 data for 58 countries (Jan 2020 - Jan 2024)
  - Contains ~1,460 daily data points per country
  - Frontend uses optimized file with only 13 key dates (137KB)
  - Optimization: 99.3% size reduction

### Pharmaceutical Innovation Project
- `therapeutic_timeline_full.json` (1.9MB)
  - Full timeline of 9,998 FDA drug approvals (1942-2024)
  - Contains individual approval records for all drugs
  - Frontend uses lazy-loaded decade files (1.8KB summary + on-demand chunks)
  - Optimization: 99.9% reduction in initial load (1.9MB → 1.8KB)

## Total Size Saved
~26.3MB removed from frontend deployments

## Usage

These files are kept for:
1. **Reproducibility** - Ability to re-run data processing pipelines
2. **Documentation** - Reference for data sources and collection dates
3. **Analysis** - Future research or validation needs

## Not Needed For

- ❌ Frontend builds
- ❌ Production deployments
- ❌ Testing (use `/shared/tests/fixtures/` instead)

## File Locations (Original)

- Birth Control: `birthcontrol-side-effects-analysis/data/raw/`
- PCOS: `pcos-surprise-discovery/data/raw/`
- EDS: `eds-symptom-discovery/data/raw/`
- COVID: `covid-scrollytelling/frontend/data/` (replaced with optimized version)
- Pharmaceutical: `pharmaceutical-innovation-clusters/frontend/data/` (replaced with lazy-loaded chunks)

## Last Updated
November 2025

---

**Note**: If you need to access these files for reprocessing, they remain available here. The backend processing scripts should be updated to reference this archive location if needed.
