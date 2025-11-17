#!/usr/bin/env python3
"""
Therapeutic Timeline Data Optimizer
====================================
Splits the 1.9MB timeline file into:
  1. Summary file with metadata (loaded on page load)
  2. Individual decade files (loaded on-demand when user navigates)

This reduces initial load from 1.9MB to ~20KB and enables lazy loading.

Usage:
    python optimize_timeline_data.py
"""

import json
from pathlib import Path
from collections import defaultdict


def optimize_timeline_data(input_path, output_dir):
    """
    Split timeline data into summary + decade chunks

    Args:
        input_path: Path to full therapeutic_timeline.json
        output_dir: Directory to save optimized files
    """
    print("Loading full timeline dataset...")
    with open(input_path, 'r') as f:
        data = json.load(f)

    print(f"Original file size: {Path(input_path).stat().st_size / 1024 / 1024:.1f} MB")
    print(f"Total approvals: {data['total_records']}")

    # Create output directory for decade files
    decade_dir = output_dir / 'decades'
    decade_dir.mkdir(exist_ok=True)

    # Group approvals by decade
    print("\nGrouping approvals by decade...")
    decades = defaultdict(list)

    for approval in data['approvals']:
        year = approval['year']
        decade = (year // 10) * 10  # e.g., 1995 -> 1990
        decades[decade].append(approval)

    # Sort decades
    sorted_decades = sorted(decades.keys())
    print(f"Found {len(sorted_decades)} decades: {sorted_decades[0]}s - {sorted_decades[-1]}s")

    # Create summary file (metadata only, no individual approvals)
    summary = {
        "therapeutic_areas": data["therapeutic_areas"],
        "total_records": data["total_records"],
        "date_range": data["date_range"],
        "decades": []
    }

    # Save decade files and build summary
    print("\nCreating decade files...")
    for decade in sorted_decades:
        decade_data = {
            "decade": decade,
            "label": f"{decade}s",
            "start": decade,
            "end": decade + 9,
            "count": len(decades[decade]),
            "approvals": decades[decade]
        }

        # Save decade file
        decade_file = decade_dir / f"{decade}s.json"
        with open(decade_file, 'w') as f:
            json.dump(decade_data, f, separators=(',', ':'))

        file_size = Path(decade_file).stat().st_size / 1024

        # Add decade metadata to summary (without approvals)
        summary["decades"].append({
            "decade": decade,
            "label": f"{decade}s",
            "start": decade,
            "end": decade + 9,
            "count": len(decades[decade]),
            "file": f"decades/{decade}s.json"
        })

        print(f"  ✓ {decade}s: {len(decades[decade])} approvals ({file_size:.1f} KB)")

    # Save summary file
    summary_file = output_dir / 'therapeutic_timeline_summary.json'
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)

    summary_size = Path(summary_file).stat().st_size / 1024
    original_size = Path(input_path).stat().st_size / 1024

    print(f"\n✓ Summary file saved: {summary_file}")
    print(f"  Size: {summary_size:.1f} KB")
    print(f"\nOptimization complete!")
    print(f"  - Initial load: {original_size:.1f} KB → {summary_size:.1f} KB")
    print(f"  - Savings on initial load: {((1 - summary_size / original_size) * 100):.1f}%")
    print(f"  - Decade files: {len(sorted_decades)} files in {decade_dir}")
    print(f"  - Individual decades loaded on-demand when user navigates")


def create_loader_module(output_dir):
    """
    Create a JavaScript module for lazy loading decade data

    Args:
        output_dir: Directory containing the optimized files
    """
    loader_path = output_dir.parent / 'js' / 'timeline-data-loader.js'

    loader_code = '''/**
 * Lazy Loader for Therapeutic Timeline Data
 * Loads decade data on-demand as user navigates
 */

// Cache for loaded decade data
const decadeCache = new Map();
let summaryData = null;

/**
 * Load timeline summary (metadata only)
 * @returns {Promise<Object>} Summary data with decade list
 */
export async function loadTimelineSummary() {
  if (summaryData) {
    return summaryData;
  }

  const response = await fetch('data/therapeutic_timeline_summary.json');
  if (!response.ok) {
    throw new Error(`Failed to load timeline summary: ${response.statusText}`);
  }

  summaryData = await response.json();
  return summaryData;
}

/**
 * Load data for a specific decade
 * @param {number} decade - Decade year (e.g., 1990)
 * @returns {Promise<Object>} Decade data with approvals
 */
export async function loadDecadeData(decade) {
  // Check cache first
  if (decadeCache.has(decade)) {
    return decadeCache.get(decade);
  }

  // Load from file
  const response = await fetch(`data/decades/${decade}s.json`);
  if (!response.ok) {
    throw new Error(`Failed to load decade ${decade}s: ${response.statusText}`);
  }

  const data = await response.json();
  decadeCache.set(decade, data);

  return data;
}

/**
 * Preload adjacent decades for smooth navigation
 * @param {number} currentDecade - Current decade being viewed
 */
export async function preloadAdjacentDecades(currentDecade) {
  const prevDecade = currentDecade - 10;
  const nextDecade = currentDecade + 10;

  // Preload in background (don't await)
  if (!decadeCache.has(prevDecade)) {
    loadDecadeData(prevDecade).catch(() => {}); // Ignore errors for preloading
  }
  if (!decadeCache.has(nextDecade)) {
    loadDecadeData(nextDecade).catch(() => {}); // Ignore errors for preloading
  }
}

/**
 * Clear the decade cache (useful for memory management)
 */
export function clearDecadeCache() {
  decadeCache.clear();
}

/**
 * Get cache statistics
 * @returns {Object} Cache info
 */
export function getCacheInfo() {
  return {
    cachedDecades: Array.from(decadeCache.keys()).sort(),
    cacheSize: decadeCache.size
  };
}
'''

    with open(loader_path, 'w') as f:
        f.write(loader_code)

    print(f"\n✓ Created lazy loader module: {loader_path}")


def main():
    """Main entry point"""
    data_dir = Path(__file__).parent / 'frontend' / 'data'
    input_file = data_dir / 'therapeutic_timeline.json'

    if not input_file.exists():
        print(f"Error: {input_file} not found")
        return 1

    # Optimize the data
    optimize_timeline_data(input_file, data_dir)

    # Create the lazy loader module
    create_loader_module(data_dir)

    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Update therapeutic-timeline.js to use the lazy loader:")
    print("   import { loadTimelineSummary, loadDecadeData, preloadAdjacentDecades }")
    print("     from './timeline-data-loader.js';")
    print("")
    print("2. Modify renderScatterPlot() to load decade data on-demand:")
    print("   const decadeData = await loadDecadeData(decade.start);")
    print("   const approvals = decadeData.approvals;")
    print("")
    print("3. Call preloadAdjacentDecades() after rendering for smooth navigation")
    print("")
    print("4. Remove the full therapeutic_timeline.json load from app.js")
    print("=" * 60)

    return 0


if __name__ == '__main__':
    exit(main())
