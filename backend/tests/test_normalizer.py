"""
Unit tests for Data Normalizer.
Validates all GitHub activity types normalize correctly.
"""
import pytest
from datetime import datetime
from app.analytics.normalizer import DataNormalizer
from app.analytics.activity_model import (
    ActivityType, CommitActivity, PullRequestActivity, 
    ReviewActivity, RepositoryActivity, Activity
)


# Sample GitHub API payloads

SAMPLE_COMMIT = {
    "sha": "abc123def456",
    "message": "Add data normalizer",
    "created_at": "2026-07-07T13:30:00Z",
    "files_changed": 5,
    "additions": 120,
    "deletions": 45,
    "repository": {"name": "dev-pulse"},
    "author": {"name": "gauri-moudgil"}
}

SAMPLE_PR = {
    "number": 42,
    "title": "Implement data normalizer",
    "state": "merged",
    "created_at": "2026-07-06T10:00:00Z",
    "additions": 350,
    "deletions": 85,
    "changed_files": 8,
    "head": {"ref": "feature/normalizer"},
    "base": {"ref": "main"},
    "user": {"login": "gauri-moudgil"},
    "repository": {"name": "dev-pulse"}
}

SAMPLE_REVIEW = {
    "id": "review_123",
    "state": "APPROVED",
    "submitted_at": "2026-07-07T13:45:00Z",
    "comments": [{"body": "Nice pattern"}],
    "pull_request_number": 42,
    "user": {"login": "gauri-moudgil"},
    "repository": {"name": "dev-pulse"}
}

SAMPLE_REPOSITORY = {
    "id": "repo_001",
    "name": "dev-pulse",
    "language": "Python",
    "private": False,
    "created_at": "2026-01-01T00:00:00Z",
    "stargazers_count": 50,
    "forks_count": 10,
    "owner": {"login": "gauri-moudgil"}
}


class TestCommitNormalization:
    """Test commit normalization."""
    
    def test_normalize_commit(self):
        """Test normalizing a commit."""
        activity = DataNormalizer.normalize_commit(SAMPLE_COMMIT, "gauri-moudgil", "dev-pulse")
        
        assert isinstance(activity, CommitActivity)
        assert activity.employee == "gauri-moudgil"
        assert activity.repository == "dev-pulse"
        assert activity.activity_type == ActivityType.COMMIT
        assert activity.metadata["sha"] == "abc123def456"
        assert activity.metadata["message"] == "Add data normalizer"
        assert activity.metadata["additions"] == 120
        assert activity.metadata["deletions"] == 45
        assert activity.metadata["files_changed"] == 5
    
    def test_commit_timestamp_parsing(self):
        """Test timestamp parsing."""
        activity = DataNormalizer.normalize_commit(SAMPLE_COMMIT, "gauri-moudgil", "dev-pulse")
        assert isinstance(activity.timestamp, datetime)
        assert activity.timestamp.year == 2026


class TestPullRequestNormalization:
    """Test PR normalization."""
    
    def test_normalize_pr(self):
        """Test normalizing a PR."""
        activity = DataNormalizer.normalize_pull_request(SAMPLE_PR, "gauri-moudgil", "dev-pulse")
        
        assert isinstance(activity, PullRequestActivity)
        assert activity.employee == "gauri-moudgil"
        assert activity.repository == "dev-pulse"
        assert activity.activity_type == ActivityType.PULL_REQUEST
        assert activity.metadata["pr_number"] == 42
        assert activity.metadata["title"] == "Implement data normalizer"
        assert activity.metadata["state"] == "merged"
        assert activity.metadata["additions"] == 350
        assert activity.metadata["branch"] == "feature/normalizer"
        assert activity.metadata["target_branch"] == "main"
    
    def test_pr_state_preserved(self):
        """Test PR state is correctly preserved."""
        for state in ["open", "closed", "merged"]:
            payload = SAMPLE_PR.copy()
            payload["state"] = state
            activity = DataNormalizer.normalize_pull_request(payload, "user", "repo")
            assert activity.metadata["state"] == state


class TestReviewNormalization:
    """Test review normalization."""
    
    def test_normalize_review(self):
        """Test normalizing a review."""
        activity = DataNormalizer.normalize_review(SAMPLE_REVIEW, "gauri-moudgil", "dev-pulse")
        
        assert isinstance(activity, ReviewActivity)
        assert activity.employee == "gauri-moudgil"
        assert activity.repository == "dev-pulse"
        assert activity.activity_type == ActivityType.PULL_REQUEST_REVIEW
        assert activity.metadata["review_id"] == "review_123"
        assert activity.metadata["pr_number"] == 42
        assert activity.metadata["state"] == "APPROVED"
        assert activity.metadata["comments"] == 1
    
    def test_review_states(self):
        """Test different review states."""
        for state in ["APPROVED", "CHANGES_REQUESTED", "COMMENTED"]:
            payload = SAMPLE_REVIEW.copy()
            payload["state"] = state
            activity = DataNormalizer.normalize_review(payload, "user", "repo")
            assert activity.metadata["state"] == state


class TestRepositoryNormalization:
    """Test repository normalization."""
    
    def test_normalize_repository(self):
        """Test normalizing a repository."""
        activity = DataNormalizer.normalize_repository(SAMPLE_REPOSITORY)
        
        assert isinstance(activity, RepositoryActivity)
        assert activity.repository == "dev-pulse"
        assert activity.activity_type == ActivityType.REPOSITORY
        assert activity.metadata["language"] == "Python"
        assert activity.metadata["visibility"] == "public"
        assert activity.metadata["stars"] == 50
        assert activity.metadata["forks"] == 10
    
    def test_repository_privacy(self):
        """Test repository privacy detection."""
        public_repo = SAMPLE_REPOSITORY.copy()
        public_repo["private"] = False
        activity = DataNormalizer.normalize_repository(public_repo)
        assert activity.metadata["visibility"] == "public"
        
        private_repo = SAMPLE_REPOSITORY.copy()
        private_repo["private"] = True
        activity = DataNormalizer.normalize_repository(private_repo)
        assert activity.metadata["visibility"] == "private"


class TestActivityTypeDetection:
    """Test activity type auto-detection."""
    
    def test_detect_commit(self):
        """Test commit detection."""
        activity_type = DataNormalizer._detect_type(SAMPLE_COMMIT)
        assert activity_type == ActivityType.COMMIT
    
    def test_detect_pr(self):
        """Test PR detection."""
        activity_type = DataNormalizer._detect_type(SAMPLE_PR)
        assert activity_type == ActivityType.PULL_REQUEST
    
    def test_detect_review(self):
        """Test review detection."""
        activity_type = DataNormalizer._detect_type(SAMPLE_REVIEW)
        assert activity_type == ActivityType.PULL_REQUEST_REVIEW
    
    def test_detect_repository(self):
        """Test repository detection."""
        activity_type = DataNormalizer._detect_type(SAMPLE_REPOSITORY)
        assert activity_type == ActivityType.REPOSITORY
    
    def test_detect_unknown(self):
        """Test detection fails for unknown type."""
        with pytest.raises(ValueError):
            DataNormalizer._detect_type({"unknown": "payload"})


class TestAutoNormalization:
    """Test auto-detection and normalization."""
    
    def test_auto_normalize_commit(self):
        """Test auto normalization detects and normalizes commit."""
        activity = DataNormalizer.normalize(SAMPLE_COMMIT, "gauri-moudgil", "dev-pulse")
        assert isinstance(activity, CommitActivity)
        assert activity.activity_type == ActivityType.COMMIT
    
    def test_auto_normalize_pr(self):
        """Test auto normalization detects and normalizes PR."""
        activity = DataNormalizer.normalize(SAMPLE_PR, "gauri-moudgil", "dev-pulse")
        assert isinstance(activity, PullRequestActivity)
        assert activity.activity_type == ActivityType.PULL_REQUEST
    
    def test_auto_normalize_review(self):
        """Test auto normalization detects and normalizes review."""
        activity = DataNormalizer.normalize(SAMPLE_REVIEW, "gauri-moudgil", "dev-pulse")
        assert isinstance(activity, ReviewActivity)
        assert activity.activity_type == ActivityType.PULL_REQUEST_REVIEW
    
    def test_auto_normalize_repository(self):
        """Test auto normalization detects and normalizes repository."""
        activity = DataNormalizer.normalize(SAMPLE_REPOSITORY)
        assert isinstance(activity, RepositoryActivity)
        assert activity.activity_type == ActivityType.REPOSITORY


class TestBatchNormalization:
    """Test batch processing."""
    
    def test_normalize_batch_mixed(self):
        """Test batch normalization with mixed types."""
        payloads = [SAMPLE_COMMIT, SAMPLE_PR, SAMPLE_REVIEW, SAMPLE_REPOSITORY]
        activities = DataNormalizer.normalize_batch(payloads, "gauri-moudgil", "dev-pulse")
        
        assert len(activities) == 4
        assert activities[0].activity_type == ActivityType.COMMIT
        assert activities[1].activity_type == ActivityType.PULL_REQUEST
        assert activities[2].activity_type == ActivityType.PULL_REQUEST_REVIEW
        assert activities[3].activity_type == ActivityType.REPOSITORY
    
    def test_batch_skip_malformed(self):
        """Test batch skips malformed payloads."""
        payloads = [SAMPLE_COMMIT, {"bad": "data"}, SAMPLE_PR]
        activities = DataNormalizer.normalize_batch(payloads, "user", "repo")
        
        # Should process 2 valid, skip 1 invalid
        assert len(activities) == 2
        assert activities[0].activity_type == ActivityType.COMMIT
        assert activities[1].activity_type == ActivityType.PULL_REQUEST
    
    def test_batch_empty(self):
        """Test batch with no payloads."""
        activities = DataNormalizer.normalize_batch([], "user", "repo")
        assert activities == []


class TestMetadataCompleteness:
    """Test all metadata fields are captured."""
    
    def test_commit_metadata_fields(self):
        """Test commit has all required metadata."""
        activity = DataNormalizer.normalize_commit(SAMPLE_COMMIT, "user", "repo")
        required = ["sha", "message", "files_changed", "additions", "deletions", "branch"]
        for field in required:
            assert field in activity.metadata, f"Missing metadata field: {field}"
    
    def test_pr_metadata_fields(self):
        """Test PR has all required metadata."""
        activity = DataNormalizer.normalize_pull_request(SAMPLE_PR, "user", "repo")
        required = ["pr_number", "title", "state", "additions", "deletions", "files_changed", "branch", "target_branch"]
        for field in required:
            assert field in activity.metadata, f"Missing metadata field: {field}"
    
    def test_review_metadata_fields(self):
        """Test review has all required metadata."""
        activity = DataNormalizer.normalize_review(SAMPLE_REVIEW, "user", "repo")
        required = ["review_id", "pr_number", "state", "comments"]
        for field in required:
            assert field in activity.metadata, f"Missing metadata field: {field}"
    
    def test_repository_metadata_fields(self):
        """Test repository has all required metadata."""
        activity = DataNormalizer.normalize_repository(SAMPLE_REPOSITORY)
        required = ["repo_id", "language", "visibility", "stars", "forks"]
        for field in required:
            assert field in activity.metadata, f"Missing metadata field: {field}"


class TestEdgeCases:
    """Test edge cases and error handling."""
    
    def test_missing_optional_fields_commit(self):
        """Test commit normalization with missing optional fields."""
        minimal_commit = {"sha": "abc", "message": "test"}
        activity = DataNormalizer.normalize_commit(minimal_commit, "user", "repo")
        assert activity.metadata["sha"] == "abc"
        assert activity.metadata["additions"] == 0  # Should default to 0
    
    def test_timestamp_defaults(self):
        """Test timestamp defaults to current time if missing."""
        no_timestamp = {"sha": "abc", "message": "test"}
        activity = DataNormalizer.normalize_commit(no_timestamp, "user", "repo")
        assert activity.timestamp is not None
        assert isinstance(activity.timestamp, datetime)
    
    def test_employee_extraction(self):
        """Test employee extraction from payload."""
        activity = DataNormalizer.normalize(SAMPLE_COMMIT)
        # Should extract from payload if not provided
        assert activity.employee == "gauri-moudgil"
