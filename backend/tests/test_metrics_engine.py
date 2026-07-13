"""
Unit tests for Metrics Extraction Engine.

Tests all 7 metrics calculation logic with various scenarios.
"""

import pytest
from datetime import datetime, timedelta
from app.analytics.activity_model import (
    ActivityType, CommitActivity, PullRequestActivity, 
    ReviewActivity, RepositoryActivity
)
from app.analytics.metrics_engine import MetricsExtractor, extract_metrics


class TestMetricsExtractor:
    """Test suite for MetricsExtractor class."""
    
    @pytest.fixture
    def extractor(self):
        """Create a fresh MetricsExtractor instance."""
        return MetricsExtractor()
    
    # =========================================================================
    # Commit Frequency Tests
    # =========================================================================
    def test_commit_frequency_zero_commits(self, extractor):
        """When no commits exist, score should be 0."""
        activities = []
        metrics = extractor.extract(activities)
        assert metrics['commit_frequency'] == 0.0
    
    def test_commit_frequency_baseline(self, extractor):
        """At baseline (30 commits), score should be 100."""
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={'sha': f'abc{i}', 'message': f'commit {i}'}
            )
            for i in range(30)
        ]
        metrics = extractor.extract(activities)
        assert metrics['commit_frequency'] == 100.0
    
    def test_commit_frequency_half_baseline(self, extractor):
        """At half baseline (15 commits), score should be ~50."""
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={'sha': f'abc{i}', 'message': f'commit {i}'}
            )
            for i in range(15)
        ]
        metrics = extractor.extract(activities)
        assert 45 < metrics['commit_frequency'] < 55
    
    def test_commit_frequency_clamped_max(self, extractor):
        """Score should be clamped at 100 for very high commit counts."""
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={'sha': f'abc{i}', 'message': f'commit {i}'}
            )
            for i in range(100)
        ]
        metrics = extractor.extract(activities)
        assert metrics['commit_frequency'] == 100.0
    
    # =========================================================================
    # PR Participation Tests
    # =========================================================================
    def test_pr_participation_zero_prs(self, extractor):
        """When no PRs exist, score should be 0."""
        activities = []
        metrics = extractor.extract(activities)
        assert metrics['pr_participation'] == 0.0
    
    def test_pr_participation_baseline(self, extractor):
        """At baseline (10 PRs), score should be 100."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': i,
                    'title': f'PR {i}',
                    'state': 'merged'
                }
            )
            for i in range(10)
        ]
        metrics = extractor.extract(activities)
        assert metrics['pr_participation'] == 100.0
    
    def test_pr_participation_half_baseline(self, extractor):
        """At half baseline (5 PRs), score should be ~50."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': i,
                    'title': f'PR {i}',
                    'state': 'merged'
                }
            )
            for i in range(5)
        ]
        metrics = extractor.extract(activities)
        assert 45 < metrics['pr_participation'] < 55
    
    # =========================================================================
    # Code Review Participation Tests
    # =========================================================================
    def test_code_review_zero_reviews(self, extractor):
        """When no reviews exist, score should be 0."""
        activities = []
        metrics = extractor.extract(activities)
        assert metrics['code_review_participation'] == 0.0
    
    def test_code_review_baseline(self, extractor):
        """At baseline (10 reviews), score should be 100."""
        activities = [
            ReviewActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'review_id': f'review{i}',
                    'pr_number': i,
                    'state': 'APPROVED'
                }
            )
            for i in range(10)
        ]
        metrics = extractor.extract(activities)
        assert metrics['code_review_participation'] == 100.0
    
    def test_code_review_half_baseline(self, extractor):
        """At half baseline (5 reviews), score should be ~50."""
        activities = [
            ReviewActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'review_id': f'review{i}',
                    'pr_number': i,
                    'state': 'APPROVED'
                }
            )
            for i in range(5)
        ]
        metrics = extractor.extract(activities)
        assert 45 < metrics['code_review_participation'] < 55
    
    # =========================================================================
    # Documentation Contribution Tests
    # =========================================================================
    def test_documentation_zero_prs(self, extractor):
        """When no PRs exist, documentation score should be 0."""
        activities = []
        metrics = extractor.extract(activities)
        assert metrics['documentation_contribution'] == 0.0
    
    def test_documentation_with_descriptions(self, extractor):
        """PR descriptions contribute to documentation score."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': 1,
                    'title': 'Fix: User authentication' + 'x' * 500,  # ~500 chars
                    'body': 'This PR fixes the login flow. ' + 'y' * 600,  # ~600 chars
                }
            )
        ]
        metrics = extractor.extract(activities)
        # ~1100 chars / 2000 baseline * 100 ≈ 55
        assert 50 < metrics['documentation_contribution'] < 60
    
    def test_documentation_baseline(self, extractor):
        """At baseline (2000 chars), score should be 100."""
        # Create PR with exactly ~2000 characters of description
        doc_text = 'x' * 2000
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': 1,
                    'title': 'Fix PR',
                    'body': doc_text,
                }
            )
        ]
        metrics = extractor.extract(activities)
        assert metrics['documentation_contribution'] == 100.0
    
    def test_documentation_clamped_max(self, extractor):
        """Documentation score should be clamped at 100."""
        doc_text = 'x' * 5000  # Way above baseline
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': 1,
                    'title': 'Fix PR',
                    'body': doc_text,
                }
            )
        ]
        metrics = extractor.extract(activities)
        assert metrics['documentation_contribution'] == 100.0
    
    # =========================================================================
    # Branch Hygiene Tests
    # =========================================================================
    def test_branch_hygiene_no_prs(self, extractor):
        """When no PRs, branch hygiene should be neutral (50)."""
        activities = []
        metrics = extractor.extract(activities)
        assert metrics['branch_hygiene'] == 50.0
    
    def test_branch_hygiene_no_branch_data(self, extractor):
        """When PRs exist but no branch data, should be neutral (50)."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': 1,
                    'title': 'PR without branch info'
                }
            )
        ]
        metrics = extractor.extract(activities)
        assert metrics['branch_hygiene'] == 50.0
    
    def test_branch_hygiene_well_named_branches(self, extractor):
        """Well-named branches score high."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow() - timedelta(days=i),
                metadata={
                    'pr_number': i,
                    'title': f'PR {i}',
                    'branch': branch
                }
            )
            for i, branch in enumerate(['feature/login', 'fix/bug-123', 'develop'], 1)
        ]
        metrics = extractor.extract(activities)
        assert metrics['branch_hygiene'] == 100.0
    
    def test_branch_hygiene_poorly_named_branches(self, extractor):
        """Poorly-named branches score low."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow() - timedelta(days=i),
                metadata={
                    'pr_number': i,
                    'title': f'PR {i}',
                    'branch': branch
                }
            )
            for i, branch in enumerate(['random-stuff', 'my-branch', 'quick-fix'], 1)
        ]
        metrics = extractor.extract(activities)
        assert metrics['branch_hygiene'] < 50.0
    
    def test_branch_hygiene_mixed_names(self, extractor):
        """Mix of well and poorly named branches."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow() - timedelta(days=i),
                metadata={
                    'pr_number': i,
                    'title': f'PR {i}',
                    'branch': branch
                }
            )
            for i, branch in enumerate(['feature/new', 'my-work', 'fix/crash'], 1)
        ]
        metrics = extractor.extract(activities)
        # 2/3 well-named ≈ 66.7
        assert 65 < metrics['branch_hygiene'] < 70
    
    # =========================================================================
    # Repository Contribution Tests
    # =========================================================================
    def test_repo_contribution_no_prs(self, extractor):
        """When no PRs, repo contribution should be 0."""
        activities = []
        metrics = extractor.extract(activities)
        assert metrics['repository_contribution'] == 0.0
    
    def test_repo_contribution_no_file_data(self, extractor):
        """When PRs lack file count data, should be neutral (50)."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': 1,
                    'title': 'PR without file data'
                }
            )
        ]
        metrics = extractor.extract(activities)
        assert metrics['repository_contribution'] == 50.0
    
    def test_repo_contribution_baseline(self, extractor):
        """At baseline (20 files/PR), score should be 100."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': 1,
                    'title': 'PR',
                    'files_changed': 20
                }
            )
        ]
        metrics = extractor.extract(activities)
        assert metrics['repository_contribution'] == 100.0
    
    def test_repo_contribution_half_baseline(self, extractor):
        """At half baseline (10 files/PR), score should be ~50."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': 1,
                    'title': 'PR',
                    'files_changed': 10
                }
            )
        ]
        metrics = extractor.extract(activities)
        assert 45 < metrics['repository_contribution'] < 55
    
    def test_repo_contribution_multiple_prs(self, extractor):
        """Repo contribution averages across PRs."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow() - timedelta(days=i),
                metadata={
                    'pr_number': i,
                    'title': f'PR {i}',
                    'files_changed': 10
                }
            )
            for i in range(3)  # 3 PRs × 10 files = 30 total, avg 10
        ]
        metrics = extractor.extract(activities)
        assert 45 < metrics['repository_contribution'] < 55
    
    # =========================================================================
    # Development Consistency Tests
    # =========================================================================
    def test_development_consistency_no_activities(self, extractor):
        """When no activities, consistency should be 0."""
        activities = []
        metrics = extractor.extract(activities)
        assert metrics['development_consistency'] == 0.0
    
    def test_development_consistency_single_activity(self, extractor):
        """Single activity should have neutral consistency (50)."""
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={'sha': 'abc123'}
            )
        ]
        metrics = extractor.extract(activities)
        assert metrics['development_consistency'] == 50.0
    
    def test_development_consistency_all_same_day(self, extractor):
        """All activities on same day = neutral consistency (50)."""
        base_time = datetime.utcnow()
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=base_time.replace(hour=h),
                metadata={'sha': f'abc{i}'}
            )
            for i, h in enumerate([9, 10, 11, 14, 15])
        ]
        metrics = extractor.extract(activities)
        assert metrics['development_consistency'] == 50.0
    
    def test_development_consistency_evenly_spread(self, extractor):
        """Evenly spread activities over days = high consistency."""
        base_time = datetime.utcnow()
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=base_time - timedelta(days=i),
                metadata={'sha': f'abc{i}'}
            )
            for i in range(0, 10, 2)  # Days 0, 2, 4, 6, 8
        ]
        metrics = extractor.extract(activities)
        # Evenly distributed should have higher consistency
        assert metrics['development_consistency'] > 60.0
    
    def test_development_consistency_bursty(self, extractor):
        """Bursty activities (many then none) = lower consistency."""
        base_time = datetime.utcnow()
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=base_time - timedelta(days=i),
                metadata={'sha': f'abc{i}'}
            )
            for i in [0, 0, 0, 0, 0, 10, 11, 12]  # Burst then gap
        ]
        metrics = extractor.extract(activities)
        # Bursty should have lower consistency
        assert metrics['development_consistency'] < 60.0
    
    # =========================================================================
    # Integration Tests (Multiple Activity Types)
    # =========================================================================
    def test_all_metrics_mixed_activities(self, extractor):
        """Extract all metrics from mixed activities."""
        base_time = datetime.utcnow()
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=base_time - timedelta(days=i),
                metadata={'sha': f'abc{i}', 'message': f'commit {i}'}
            )
            for i in range(10)
        ] + [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=base_time - timedelta(days=i),
                metadata={
                    'pr_number': i,
                    'title': f'PR {i}' + 'x' * 200,
                    'state': 'merged',
                    'branch': 'feature/test',
                    'files_changed': 5
                }
            )
            for i in range(5)
        ] + [
            ReviewActivity(
                employee="user1",
                repository="repo1",
                timestamp=base_time - timedelta(days=i),
                metadata={
                    'review_id': f'review{i}',
                    'pr_number': i,
                    'state': 'APPROVED'
                }
            )
            for i in range(3)
        ]
        
        metrics = extractor.extract(activities)
        
        # All metrics should be calculated and be in valid range
        assert 0 <= metrics['commit_frequency'] <= 100
        assert 0 <= metrics['pr_participation'] <= 100
        assert 0 <= metrics['code_review_participation'] <= 100
        assert 0 <= metrics['documentation_contribution'] <= 100
        assert 0 <= metrics['branch_hygiene'] <= 100
        assert 0 <= metrics['repository_contribution'] <= 100
        assert 0 <= metrics['development_consistency'] <= 100
        
        # With these activities, expect meaningful scores
        assert metrics['commit_frequency'] > 0
        assert metrics['pr_participation'] > 0
        assert metrics['code_review_participation'] > 0
    
    # =========================================================================
    # Convenience Function Tests
    # =========================================================================
    def test_extract_metrics_function(self):
        """Test convenience function."""
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={'sha': 'abc123'}
            )
        ]
        metrics = extract_metrics(activities)
        
        assert isinstance(metrics, dict)
        assert 'commit_frequency' in metrics
        assert metrics['commit_frequency'] > 0
    
    # =========================================================================
    # Edge Cases
    # =========================================================================
    def test_activities_with_string_timestamps(self, extractor):
        """Handle activities with string timestamps (ISO format)."""
        iso_time = datetime.utcnow().isoformat()
        
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=iso_time,
                metadata={'sha': 'abc123'}
            )
        ]
        
        metrics = extractor.extract(activities)
        # Should not raise, all metrics calculated
        assert 'commit_frequency' in metrics
    
    def test_activities_with_none_metadata_fields(self, extractor):
        """Handle None values in metadata."""
        activities = [
            PullRequestActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={
                    'pr_number': 1,
                    'title': 'PR',
                    'body': None,
                    'files_changed': None
                }
            )
        ]
        
        metrics = extractor.extract(activities)
        # Should not raise, handle None gracefully
        assert 'documentation_contribution' in metrics
        assert 'repository_contribution' in metrics
    
    def test_metrics_are_rounded_to_one_decimal(self, extractor):
        """All metrics should be rounded to 1 decimal place."""
        activities = [
            CommitActivity(
                employee="user1",
                repository="repo1",
                timestamp=datetime.utcnow(),
                metadata={'sha': f'abc{i}'}
            )
            for i in range(7)
        ]
        
        metrics = extractor.extract(activities)
        
        for metric_name, score in metrics.items():
            # Check that score is a float and has max 1 decimal place
            assert isinstance(score, (int, float))
            # Verify no more than 1 decimal place
            assert score == round(score, 1)
