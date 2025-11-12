"""
Integration tests for pharmaceutical innovation clusters pipeline

Tests the complete analysis pipeline with mock data
"""
import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys
import tempfile
import json
import shutil

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent / 'src'))
from analysis.statistical_clustering import StatisticalAnalyzer
from config import Config


class TestPipelineIntegration:
    """Test complete analysis pipeline"""

    @pytest.fixture
    def mock_fda_data(self):
        """Create mock FDA drug approval data"""
        np.random.seed(42)

        # Create realistic mock data with clustering patterns
        data = []

        # Background rate: ~10 drugs per year
        for year in range(1990, 2000):
            count = np.random.poisson(10)
            for _ in range(count):
                data.append({
                    'application_number': f'NDA{year}_{_}',
                    'approval_date': f'{year}-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}',
                    'sponsor_name': 'Test Pharma Inc',
                    'product_name': f'Test Drug {year}_{_}',
                    'active_ingredient': 'Test Ingredient',
                    'is_innovative': np.random.random() > 0.3,
                    'is_generic': np.random.random() > 0.7
                })

        # Cluster period 1: 2000-2004 (high activity)
        for year in range(2000, 2005):
            count = np.random.poisson(50)  # 5x background rate
            for _ in range(count):
                data.append({
                    'application_number': f'NDA{year}_{_}',
                    'approval_date': f'{year}-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}',
                    'sponsor_name': 'Innovation Pharma',
                    'product_name': f'Innovative Drug {year}_{_}',
                    'active_ingredient': 'Novel Compound',
                    'is_innovative': True,
                    'is_generic': False
                })

        # Return to background: 2005-2010
        for year in range(2005, 2011):
            count = np.random.poisson(12)
            for _ in range(count):
                data.append({
                    'application_number': f'NDA{year}_{_}',
                    'approval_date': f'{year}-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}',
                    'sponsor_name': 'Generic Corp',
                    'product_name': f'Generic Drug {year}_{_}',
                    'active_ingredient': 'Standard Compound',
                    'is_innovative': False,
                    'is_generic': True
                })

        # Cluster period 2: 2011-2015 (moderate activity)
        for year in range(2011, 2016):
            count = np.random.poisson(30)
            for _ in range(count):
                data.append({
                    'application_number': f'BLA{year}_{_}',
                    'approval_date': f'{year}-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}',
                    'sponsor_name': 'Biotech Innovations',
                    'product_name': f'Biologic {year}_{_}',
                    'active_ingredient': 'Monoclonal Antibody',
                    'is_innovative': True,
                    'is_generic': False
                })

        return pd.DataFrame(data)

    @pytest.fixture
    def temp_data_dir(self, mock_fda_data):
        """Create temporary directory with mock data"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)

            # Create subdirectories
            raw_dir = tmpdir_path / 'raw'
            processed_dir = tmpdir_path / 'processed'
            raw_dir.mkdir()
            processed_dir.mkdir()

            # Save mock data
            mock_fda_data.to_csv(raw_dir / 'fda_drugs_raw.csv', index=False)

            yield tmpdir_path

    def test_full_pipeline_execution(self, temp_data_dir, mock_fda_data, monkeypatch):
        """Test that complete pipeline executes without errors"""
        # Override Config paths to use temp directory
        monkeypatch.setattr(Config, 'RAW_DATA_DIR', temp_data_dir / 'raw')
        monkeypatch.setattr(Config, 'PROCESSED_DATA_DIR', temp_data_dir / 'processed')

        # Create analyzer
        analyzer = StatisticalAnalyzer(drug_type_filter='all')

        # Run analysis
        results = analyzer.analyze()

        # Verify results structure
        assert 'poisson_tests' in results
        assert 'significant_clusters' in results
        assert 'peak_years' in results
        assert 'metadata' in results

        # Verify output file was created
        output_file = temp_data_dir / 'processed' / 'statistical_results.json'
        assert output_file.exists()

        # Verify output file is valid JSON
        with open(output_file) as f:
            loaded_results = json.load(f)
            # Just check structure, not exact equality (JSON serialization may differ slightly)
            assert 'poisson_tests' in loaded_results
            assert 'significant_clusters' in loaded_results

    def test_poisson_test_detects_clustering(self, temp_data_dir, mock_fda_data, monkeypatch):
        """Test that Poisson test correctly identifies clustering in mock data"""
        monkeypatch.setattr(Config, 'RAW_DATA_DIR', temp_data_dir / 'raw')
        monkeypatch.setattr(Config, 'PROCESSED_DATA_DIR', temp_data_dir / 'processed')

        analyzer = StatisticalAnalyzer()
        results = analyzer.analyze()

        # Mock data has intentional clustering - should be detected
        poisson = results['poisson_tests']['fda_drugs']
        assert poisson['is_clustered'] == True  # Allow True or 'True'
        assert poisson['coefficient_of_variation'] > 0.5

    def test_sliding_window_finds_clusters(self, temp_data_dir, mock_fda_data, monkeypatch):
        """Test that sliding window analysis identifies cluster periods"""
        monkeypatch.setattr(Config, 'RAW_DATA_DIR', temp_data_dir / 'raw')
        monkeypatch.setattr(Config, 'PROCESSED_DATA_DIR', temp_data_dir / 'processed')

        analyzer = StatisticalAnalyzer()
        results = analyzer.analyze()

        # Should find significant clusters
        clusters = results['significant_clusters']
        assert len(clusters) > 0

        # Verify cluster structure
        for cluster in clusters:
            assert 'period' in cluster
            assert 'start_year' in cluster
            assert 'end_year' in cluster
            assert 'avg_per_year' in cluster
            assert 'sigma_above_mean' in cluster

    def test_innovative_vs_generic_filtering(self, temp_data_dir, mock_fda_data, monkeypatch):
        """Test that drug type filtering works correctly"""
        monkeypatch.setattr(Config, 'RAW_DATA_DIR', temp_data_dir / 'raw')
        monkeypatch.setattr(Config, 'PROCESSED_DATA_DIR', temp_data_dir / 'processed')

        # Test with innovative drugs only
        analyzer_innovative = StatisticalAnalyzer(drug_type_filter='innovative')
        results_innovative = analyzer_innovative.analyze()

        # Test with generic drugs only
        analyzer_generic = StatisticalAnalyzer(drug_type_filter='generic')
        results_generic = analyzer_generic.analyze()

        # Both should produce valid results
        assert 'poisson_tests' in results_innovative
        assert 'poisson_tests' in results_generic

        # Record counts should be different
        assert (results_innovative['metadata']['total_records_analyzed'] !=
                results_generic['metadata']['total_records_analyzed'])

    def test_metadata_completeness(self, temp_data_dir, mock_fda_data, monkeypatch):
        """Test that metadata contains all required fields"""
        monkeypatch.setattr(Config, 'RAW_DATA_DIR', temp_data_dir / 'raw')
        monkeypatch.setattr(Config, 'PROCESSED_DATA_DIR', temp_data_dir / 'processed')

        analyzer = StatisticalAnalyzer()
        results = analyzer.analyze()

        metadata = results['metadata']

        # Required metadata fields
        required_fields = [
            'analysis_date',
            'sliding_window_size',
            'threshold_sigma',
            'drug_type_filter',
            'total_records_analyzed'
        ]

        for field in required_fields:
            assert field in metadata, f"Missing metadata field: {field}"

    def test_peak_year_identification(self, temp_data_dir, mock_fda_data, monkeypatch):
        """Test that peak year is correctly identified"""
        monkeypatch.setattr(Config, 'RAW_DATA_DIR', temp_data_dir / 'raw')
        monkeypatch.setattr(Config, 'PROCESSED_DATA_DIR', temp_data_dir / 'processed')

        analyzer = StatisticalAnalyzer()
        results = analyzer.analyze()

        peak_years = results['peak_years']
        assert 'fda_drugs' in peak_years
        assert isinstance(peak_years['fda_drugs'], int)

        # Peak should be in cluster period (2000-2004 based on mock data)
        assert 2000 <= peak_years['fda_drugs'] <= 2004


class TestErrorHandling:
    """Test error handling in pipeline"""

    def test_missing_data_file_handling(self, monkeypatch):
        """Test graceful handling of missing data files"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)
            raw_dir = tmpdir_path / 'raw'
            processed_dir = tmpdir_path / 'processed'
            raw_dir.mkdir()
            processed_dir.mkdir()

            monkeypatch.setattr(Config, 'RAW_DATA_DIR', raw_dir)
            monkeypatch.setattr(Config, 'PROCESSED_DATA_DIR', processed_dir)

            # Try to analyze with no data file
            analyzer = StatisticalAnalyzer()

            # Should handle missing file gracefully (returns empty DataFrame)
            df = analyzer._load_fda_data()
            assert df.empty

    def test_corrupted_date_handling(self, monkeypatch):
        """Test handling of corrupted date values"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)
            # Create data with invalid dates
            bad_data = pd.DataFrame({
                'application_number': ['NDA001', 'NDA002'],
                'approval_date': ['invalid_date', '2020-13-45'],  # Invalid dates
                'is_innovative': [True, False],
                'is_generic': [False, True]
            })

            raw_dir = tmpdir_path / 'raw'
            processed_dir = tmpdir_path / 'processed'
            raw_dir.mkdir()
            processed_dir.mkdir(exist_ok=True)

            bad_data.to_csv(raw_dir / 'fda_drugs_raw.csv', index=False)

            monkeypatch.setattr(Config, 'RAW_DATA_DIR', raw_dir)
            monkeypatch.setattr(Config, 'PROCESSED_DATA_DIR', processed_dir)

            # Should handle invalid dates gracefully (coerce to NaT)
            analyzer = StatisticalAnalyzer()
            df = analyzer._load_fda_data()

            # Invalid dates should be converted to NaT, then dropped or handled
            assert df is not None


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
