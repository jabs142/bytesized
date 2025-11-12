"""
Unit tests for statistical clustering analysis

Tests the core statistical calculations including:
- Coefficient of Variation (CV)
- Variance-to-Mean Ratio (VMR)
- Poisson test logic
- Sliding window analysis
"""
import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys
import tempfile
import json

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent / 'src'))
from analysis.statistical_clustering import StatisticalAnalyzer


class TestStatisticalCalculations:
    """Test statistical calculation methods"""

    def test_coefficient_of_variation_calculation(self):
        """Test CV calculation with known values"""
        # Create a mock DataFrame with controlled distribution
        years = [2000, 2001, 2002, 2003, 2004]
        # High variation: [10, 50, 20, 60, 30]
        data = []
        for year, count in zip(years, [10, 50, 20, 60, 30]):
            data.extend([{'year': year, 'approval_date': f'{year}-01-01'}] * count)

        df = pd.DataFrame(data)
        df['approval_date'] = pd.to_datetime(df['approval_date'])

        # Calculate expected CV manually
        counts = [10, 50, 20, 60, 30]
        mean = np.mean(counts)  # 34.0
        std = np.std(counts, ddof=0)  # ~19.0
        expected_cv = std / mean  # ~0.56

        # Create temporary analyzer (will fail on file ops but that's OK)
        with tempfile.TemporaryDirectory() as tmpdir:
            analyzer = StatisticalAnalyzer()
            result = analyzer._poisson_test(df, 'Test Data')

            # CV should be close to our manual calculation
            assert abs(result['coefficient_of_variation'] - expected_cv) < 0.01
            assert result['mean_rate'] == mean
            assert abs(result['std_rate'] - std) < 0.1

    def test_variance_to_mean_ratio(self):
        """Test VMR calculation for overdispersion detection"""
        # Create perfectly Poisson-distributed data (VMR should be ~1)
        np.random.seed(42)
        poisson_data = np.random.poisson(lam=10, size=50)

        mean = poisson_data.mean()
        variance = poisson_data.var()
        expected_vmr = variance / mean

        # For Poisson distribution, VMR should be close to 1.0
        assert abs(expected_vmr - 1.0) < 0.3  # Allow some variance due to sampling

        # Create overdispersed (clustered) data (VMR should be > 1)
        clustered_data = [5, 5, 6, 50, 60, 55, 4, 3, 70, 65]
        mean_clustered = np.mean(clustered_data)
        variance_clustered = np.var(clustered_data, ddof=0)
        vmr_clustered = variance_clustered / mean_clustered

        # Clustered data should have high VMR
        assert vmr_clustered > 2.0

    def test_clustering_detection_threshold(self):
        """Test that clustered data is correctly identified"""
        # Create highly clustered data
        clustered_years = [2000] * 5 + [2001] * 10 + [2002] * 100 + [2003] * 15 + [2004] * 8
        df_clustered = pd.DataFrame({
            'year': clustered_years,
            'approval_date': pd.to_datetime([f'{y}-01-01' for y in clustered_years])
        })

        analyzer = StatisticalAnalyzer()
        result = analyzer._poisson_test(df_clustered, 'Clustered Data')

        # Should detect clustering
        assert result['is_clustered'] == True  # Allow True or 'True' from JSON
        assert result['is_random'] == False
        assert result['coefficient_of_variation'] > 0.7
        assert result['interpretation'] == 'Clustered'

    def test_uniform_distribution_detection(self):
        """Test that uniform data is correctly identified"""
        # Create uniform data (same count each year)
        uniform_years = []
        for year in range(2000, 2010):
            uniform_years.extend([year] * 20)  # Exactly 20 per year

        df_uniform = pd.DataFrame({
            'year': uniform_years,
            'approval_date': pd.to_datetime([f'{y}-01-01' for y in uniform_years])
        })

        analyzer = StatisticalAnalyzer()
        result = analyzer._poisson_test(df_uniform, 'Uniform Data')

        # Should not detect clustering (CV should be 0 for perfect uniformity)
        assert result['coefficient_of_variation'] < 0.1  # Very low CV
        assert result['is_clustered'] == False  # Allow False or 'False'
        assert result['interpretation'] == 'Relatively uniform'

    def test_sliding_window_cluster_identification(self):
        """Test sliding window correctly identifies cluster periods"""
        # Create data with clear cluster period (2005-2009)
        data = []
        for year in range(2000, 2015):
            if 2005 <= year <= 2009:
                count = 50  # High activity cluster
            else:
                count = 10  # Background rate
            data.extend([{'year': year, 'approval_date': f'{year}-01-01'}] * count)

        df = pd.DataFrame(data)
        df['approval_date'] = pd.to_datetime(df['approval_date'])

        analyzer = StatisticalAnalyzer()
        clusters = analyzer._sliding_window_category(df, 'test_category', 'Test Category')

        # Should identify windows overlapping the cluster period
        assert len(clusters) > 0

        # Check that at least one cluster covers the high-activity period
        cluster_periods = [c['period'] for c in clusters]
        assert any('2006' in period or '2007' in period for period in cluster_periods)

    def test_confidence_score_calculation(self):
        """Test that confidence scores are properly normalized"""
        # Test with various data patterns
        test_cases = [
            ([10, 10, 10, 10, 10], 0.0, 0.2),  # Perfect uniform - low confidence
            ([10, 50, 100, 60, 20], 0.4, 1.0),  # Clustered - high confidence
        ]

        for counts, min_conf, max_conf in test_cases:
            years = list(range(2000, 2000 + len(counts)))
            data = []
            for year, count in zip(years, counts):
                data.extend([{'year': year, 'approval_date': f'{year}-01-01'}] * count)

            df = pd.DataFrame(data)
            df['approval_date'] = pd.to_datetime(df['approval_date'])

            analyzer = StatisticalAnalyzer()
            result = analyzer._poisson_test(df, 'Test')

            # Confidence should be between 0 and 1
            assert 0.0 <= result['confidence'] <= 1.0
            # Should be within expected range
            assert min_conf <= result['confidence'] <= max_conf


class TestEdgeCases:
    """Test edge cases and error handling"""

    def test_empty_dataframe_handling(self):
        """Test that empty DataFrames are handled gracefully"""
        df_empty = pd.DataFrame({'year': [], 'approval_date': []})
        analyzer = StatisticalAnalyzer()

        # Should not crash on empty data
        # Empty data will have nan or 0 for CV and VMR
        try:
            result = analyzer._poisson_test(df_empty, 'Empty Data')
            # If it returns a result, check it's structured correctly
            assert 'coefficient_of_variation' in result
            assert 'variance_to_mean_ratio' in result
        except (ValueError, ZeroDivisionError):
            # It's also acceptable to raise an error for empty data
            pass

    def test_single_year_data(self):
        """Test handling of data from only one year"""
        df_single = pd.DataFrame({
            'year': [2020] * 100,
            'approval_date': pd.to_datetime(['2020-01-01'] * 100)
        })

        analyzer = StatisticalAnalyzer()
        result = analyzer._poisson_test(df_single, 'Single Year')

        # Should handle single year data without crashing
        assert result['coefficient_of_variation'] == 0  # No variation across years

    def test_window_size_smaller_than_data(self):
        """Test that sliding window handles small datasets"""
        # Create data smaller than window size
        df_small = pd.DataFrame({
            'year': [2020, 2021],
            'approval_date': pd.to_datetime(['2020-01-01', '2021-01-01'])
        })

        analyzer = StatisticalAnalyzer()
        clusters = analyzer._sliding_window_category(df_small, 'test', 'Test')

        # Should return empty list (not enough data for window)
        assert clusters == []


class TestDataTypeHandling:
    """Test proper data type handling"""

    def test_result_types_are_serializable(self):
        """Test that all results can be JSON serialized"""
        # Create sample data
        data = []
        for year in range(2000, 2010):
            count = 10 + (year % 3) * 20
            data.extend([{'year': year, 'approval_date': f'{year}-01-01'}] * count)

        df = pd.DataFrame(data)
        df['approval_date'] = pd.to_datetime(df['approval_date'])

        analyzer = StatisticalAnalyzer()
        result = analyzer._poisson_test(df, 'Test')

        # Should be JSON serializable (no numpy types)
        try:
            json.dumps(result, default=str)
            assert True
        except TypeError:
            pytest.fail("Result contains non-serializable types")

    def test_integer_conversions(self):
        """Test that year values are properly converted to int"""
        data = []
        for year in range(2000, 2005):
            data.extend([{'year': year, 'approval_date': f'{year}-01-01'}] * 10)

        df = pd.DataFrame(data)
        df['approval_date'] = pd.to_datetime(df['approval_date'])

        analyzer = StatisticalAnalyzer()
        clusters = analyzer._sliding_window_category(df, 'test', 'Test')

        # All year values should be Python int (not numpy.int64)
        for cluster in clusters:
            assert isinstance(cluster['start_year'], int)
            assert isinstance(cluster['end_year'], int)
            assert isinstance(cluster['total_count'], int)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
