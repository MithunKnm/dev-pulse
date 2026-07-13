"""
Unit tests for Technical Scoring Engine.

Tests scoring logic, grade assignment, and weighted calculations.
"""

import pytest
from app.analytics.scoring_engine import (
    TechnicalScorer, calculate_technical_score, 
    calculate_technical_score_with_breakdown,
    GRADE_THRESHOLDS
)


class TestTechnicalScorer:
    """Test suite for TechnicalScorer class."""
    
    @pytest.fixture
    def scorer(self):
        """Create a fresh TechnicalScorer instance."""
        return TechnicalScorer()
    
    @pytest.fixture
    def sample_metrics(self):
        """Sample metrics for testing."""
        return {
            'commit_frequency': 80.0,
            'pr_participation': 75.0,
            'code_review_participation': 70.0,
            'documentation_contribution': 85.0,
            'branch_hygiene': 90.0,
            'repository_contribution': 65.0,
            'development_consistency': 72.0,
        }
    
    # =========================================================================
    # Basic Scoring Tests
    # =========================================================================
    def test_score_all_perfect_metrics(self, scorer):
        """Perfect metrics (100 each) should yield 100 score."""
        metrics = {
            'commit_frequency': 100.0,
            'pr_participation': 100.0,
            'code_review_participation': 100.0,
            'documentation_contribution': 100.0,
            'branch_hygiene': 100.0,
            'repository_contribution': 100.0,
            'development_consistency': 100.0,
        }
        result = scorer.score(metrics)
        assert result['technical_score'] == 100.0
        assert result['grade'] == 'A'
    
    def test_score_all_zero_metrics(self, scorer):
        """Zero metrics (0 each) should yield 0 score."""
        metrics = {
            'commit_frequency': 0.0,
            'pr_participation': 0.0,
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['technical_score'] == 0.0
        assert result['grade'] == 'F'
    
    def test_score_empty_metrics(self, scorer):
        """Empty metrics dict should return 0 score."""
        result = scorer.score({})
        assert result['technical_score'] == 0.0
        assert result['grade'] == 'F'
    
    def test_score_none_metrics(self, scorer):
        """None metrics should return 0 score."""
        result = scorer.score(None)
        assert result['technical_score'] == 0.0
        assert result['grade'] == 'F'
    
    def test_score_mixed_metrics(self, scorer, sample_metrics):
        """Mixed metrics should calculate weighted average."""
        result = scorer.score(sample_metrics)
        
        # Expected calculation:
        # (80*0.20 + 75*0.20 + 70*0.15 + 85*0.15 + 90*0.15 + 65*0.15 + 0*0.00)
        # = 16 + 15 + 10.5 + 12.75 + 13.5 + 9.75
        # = 77.5
        assert result['technical_score'] == 77.5
        assert result['grade'] == 'C'
    
    # =========================================================================
    # Grade Assignment Tests
    # =========================================================================
    def test_grade_a_minimum(self, scorer):
        """Score 90 should be grade A."""
        metrics = {
            'commit_frequency': 90.0,
            'pr_participation': 90.0,
            'code_review_participation': 90.0,
            'documentation_contribution': 90.0,
            'branch_hygiene': 90.0,
            'repository_contribution': 90.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['grade'] == 'A'
    
    def test_grade_b_minimum(self, scorer):
        """Score 80 should be grade B."""
        metrics = {
            'commit_frequency': 80.0,
            'pr_participation': 80.0,
            'code_review_participation': 80.0,
            'documentation_contribution': 80.0,
            'branch_hygiene': 80.0,
            'repository_contribution': 80.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['grade'] == 'B'
    
    def test_grade_c_minimum(self, scorer):
        """Score 70 should be grade C."""
        metrics = {
            'commit_frequency': 70.0,
            'pr_participation': 70.0,
            'code_review_participation': 70.0,
            'documentation_contribution': 70.0,
            'branch_hygiene': 70.0,
            'repository_contribution': 70.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['grade'] == 'C'
    
    def test_grade_d_minimum(self, scorer):
        """Score 60 should be grade D."""
        metrics = {
            'commit_frequency': 60.0,
            'pr_participation': 60.0,
            'code_review_participation': 60.0,
            'documentation_contribution': 60.0,
            'branch_hygiene': 60.0,
            'repository_contribution': 60.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['grade'] == 'D'
    
    def test_grade_f_below_threshold(self, scorer):
        """Score below 60 should be grade F."""
        metrics = {
            'commit_frequency': 50.0,
            'pr_participation': 50.0,
            'code_review_participation': 50.0,
            'documentation_contribution': 50.0,
            'branch_hygiene': 50.0,
            'repository_contribution': 50.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['grade'] == 'F'
    
    def test_grade_a_maximum(self, scorer):
        """Score 100 should be grade A."""
        metrics = {
            'commit_frequency': 100.0,
            'pr_participation': 100.0,
            'code_review_participation': 100.0,
            'documentation_contribution': 100.0,
            'branch_hygiene': 100.0,
            'repository_contribution': 100.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['grade'] == 'A'
    
    # =========================================================================
    # Weight Distribution Tests
    # =========================================================================
    def test_weight_distribution_high_commit_only(self, scorer):
        """Score should reflect weight of each metric."""
        # Only commit_frequency is high (weight 20%)
        metrics = {
            'commit_frequency': 100.0,  # 100 * 0.20 = 20
            'pr_participation': 0.0,     # 0 * 0.20 = 0
            'code_review_participation': 0.0,  # 0 * 0.15 = 0
            'documentation_contribution': 0.0,  # 0 * 0.15 = 0
            'branch_hygiene': 0.0,       # 0 * 0.15 = 0
            'repository_contribution': 0.0,    # 0 * 0.15 = 0
            'development_consistency': 0.0,    # 0 * 0.00 = 0
        }
        result = scorer.score(metrics)
        assert result['technical_score'] == 20.0
    
    def test_weight_distribution_high_pr_only(self, scorer):
        """PR participation has 20% weight."""
        metrics = {
            'commit_frequency': 0.0,
            'pr_participation': 100.0,   # 100 * 0.20 = 20
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['technical_score'] == 20.0
    
    def test_weight_distribution_high_review_only(self, scorer):
        """Code review has 15% weight."""
        metrics = {
            'commit_frequency': 0.0,
            'pr_participation': 0.0,
            'code_review_participation': 100.0,  # 100 * 0.15 = 15
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['technical_score'] == 15.0
    
    # =========================================================================
    # Clamping and Validation Tests
    # =========================================================================
    def test_metric_above_100_clamped(self, scorer):
        """Metrics above 100 should be clamped to 100."""
        metrics = {
            'commit_frequency': 150.0,  # Should be clamped to 100
            'pr_participation': 0.0,
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        # 100 * 0.20 = 20
        assert result['technical_score'] == 20.0
    
    def test_metric_below_0_clamped(self, scorer):
        """Metrics below 0 should be clamped to 0."""
        metrics = {
            'commit_frequency': -50.0,  # Should be clamped to 0
            'pr_participation': 0.0,
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['technical_score'] == 0.0
    
    def test_missing_metrics_treated_as_zero(self, scorer):
        """Missing metrics should be treated as 0."""
        metrics = {
            'commit_frequency': 100.0,  # 100 * 0.20 = 20
            # Other metrics missing
        }
        result = scorer.score(metrics)
        assert result['technical_score'] == 20.0
    
    # =========================================================================
    # Breakdown Tests
    # =========================================================================
    def test_score_includes_breakdown(self, scorer, sample_metrics):
        """Score should include weighted breakdown."""
        result = scorer.score(sample_metrics)
        
        assert 'weighted_breakdown' in result
        breakdown = result['weighted_breakdown']
        
        # Check that each metric has value, weight, contribution
        for metric_name, data in breakdown.items():
            assert 'value' in data
            assert 'weight' in data
            assert 'contribution' in data
    
    def test_breakdown_values_correct(self, scorer):
        """Breakdown values should reflect calculation."""
        metrics = {
            'commit_frequency': 80.0,
            'pr_participation': 0.0,
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        breakdown = result['weighted_breakdown']
        
        # Commit frequency: 80 * 0.20 = 16
        assert breakdown['commit_frequency']['value'] == 80.0
        assert breakdown['commit_frequency']['weight'] == 0.20
        assert breakdown['commit_frequency']['contribution'] == 16.0
    
    # =========================================================================
    # Score Breakdown (With Interpretation) Tests
    # =========================================================================
    def test_score_breakdown_includes_interpretation(self, scorer, sample_metrics):
        """Score breakdown should include interpretation."""
        result = scorer.score_breakdown(sample_metrics)
        
        assert 'technical_score' in result
        assert 'grade' in result
        assert 'interpretation' in result
        assert isinstance(result['interpretation'], str)
    
    def test_interpretation_for_grade_a(self, scorer):
        """Grade A should have appropriate interpretation."""
        metrics = {
            'commit_frequency': 100.0,
            'pr_participation': 100.0,
            'code_review_participation': 100.0,
            'documentation_contribution': 100.0,
            'branch_hygiene': 100.0,
            'repository_contribution': 100.0,
            'development_consistency': 0.0,
        }
        result = scorer.score_breakdown(metrics)
        assert 'Excellent' in result['interpretation']
    
    def test_interpretation_for_grade_f(self, scorer):
        """Grade F should have appropriate interpretation."""
        metrics = {
            'commit_frequency': 0.0,
            'pr_participation': 0.0,
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = scorer.score_breakdown(metrics)
        assert 'improvement' in result['interpretation'].lower()
    
    # =========================================================================
    # Custom Weights Tests
    # =========================================================================
    def test_custom_weights_valid(self, scorer):
        """Should accept custom weights that sum to 1."""
        custom_weights = {
            'commit_frequency': 0.25,
            'pr_participation': 0.25,
            'code_review_participation': 0.25,
            'documentation_contribution': 0.25,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        custom_scorer = TechnicalScorer(weights=custom_weights)
        
        metrics = {
            'commit_frequency': 100.0,
            'pr_participation': 0.0,
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = custom_scorer.score(metrics)
        assert result['technical_score'] == 25.0  # 100 * 0.25
    
    def test_custom_weights_invalid_sum(self):
        """Should reject weights that don't sum to 1."""
        invalid_weights = {
            'commit_frequency': 0.5,
            'pr_participation': 0.3,  # Sum = 0.8, not 1.0
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        with pytest.raises(ValueError):
            TechnicalScorer(weights=invalid_weights)
    
    # =========================================================================
    # Rounding Tests
    # =========================================================================
    def test_score_rounded_to_one_decimal(self, scorer):
        """Technical score should be rounded to 1 decimal place."""
        metrics = {
            'commit_frequency': 83.3333,
            'pr_participation': 0.0,
            'code_review_participation': 0.0,
            'documentation_contribution': 0.0,
            'branch_hygiene': 0.0,
            'repository_contribution': 0.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        # 83.3333 * 0.20 = 16.66666 → rounds to 16.7
        assert result['technical_score'] == round(83.3333 * 0.20, 1)
    
    # =========================================================================
    # Convenience Function Tests
    # =========================================================================
    def test_convenience_function_score(self, sample_metrics):
        """Test convenience function."""
        result = calculate_technical_score(sample_metrics)
        
        assert 'technical_score' in result
        assert 'grade' in result
        assert 0 <= result['technical_score'] <= 100
        assert result['grade'] in ['A', 'B', 'C', 'D', 'F']
    
    def test_convenience_function_breakdown(self, sample_metrics):
        """Test convenience function with breakdown."""
        result = calculate_technical_score_with_breakdown(sample_metrics)
        
        assert 'technical_score' in result
        assert 'grade' in result
        assert 'interpretation' in result
        assert 'weighted_breakdown' in result
    
    # =========================================================================
    # Edge Cases
    # =========================================================================
    def test_score_with_partial_metrics(self, scorer):
        """Should handle partial metric data gracefully."""
        metrics = {
            'commit_frequency': 80.0,
            'pr_participation': 75.0,
            # Missing other metrics
        }
        result = scorer.score(metrics)
        
        # 80*0.20 + 75*0.20 = 16 + 15 = 31
        assert result['technical_score'] == 31.0
        assert result['grade'] == 'F'
    
    def test_score_boundary_89_99(self, scorer):
        """Score just below A threshold (89.94) should be B."""
        metrics = {
            'commit_frequency': 89.94,  # This will result in ~89.94 after weighting, rounds to 89.9
            'pr_participation': 89.94,
            'code_review_participation': 89.94,
            'documentation_contribution': 89.94,
            'branch_hygiene': 89.94,
            'repository_contribution': 89.94,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['grade'] == 'B'
    
    def test_score_boundary_90_00(self, scorer):
        """Score at A threshold (90.00) should be A."""
        metrics = {
            'commit_frequency': 90.0,
            'pr_participation': 90.0,
            'code_review_participation': 90.0,
            'documentation_contribution': 90.0,
            'branch_hygiene': 90.0,
            'repository_contribution': 90.0,
            'development_consistency': 0.0,
        }
        result = scorer.score(metrics)
        assert result['grade'] == 'A'
