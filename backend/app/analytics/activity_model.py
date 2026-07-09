"""
Activity Model - Core abstraction representing GitHub activities.
All GitHub responses normalize to one of these objects.
"""
from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ActivityType(str, Enum):
    COMMIT = "COMMIT"
    PULL_REQUEST = "PULL_REQUEST"
    PULL_REQUEST_REVIEW = "PULL_REQUEST_REVIEW"
    REVIEW = "REVIEW"
    REPOSITORY = "REPOSITORY"


class Activity(BaseModel):
    """Normalized GitHub activity - single abstraction for all activity types."""
    
    employee: str = Field(..., description="GitHub username of contributor")
    activity_type: ActivityType = Field(..., description="Type: COMMIT | PR | REVIEW | REPOSITORY")
    repository: str = Field(..., description="Repository name")
    timestamp: datetime = Field(..., description="Activity timestamp")
    
    # Activity-specific data
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Type-specific metadata")


class CommitActivity(Activity):
    """Normalized commit activity."""
    activity_type: ActivityType = ActivityType.COMMIT
    
    # Commit-specific fields in metadata:
    # - sha: commit hash
    # - message: commit message
    # - files_changed: number of files modified
    # - additions: lines added
    # - deletions: lines removed
    # - branch: target branch


class PullRequestActivity(Activity):
    """Normalized pull request activity."""
    activity_type: ActivityType = ActivityType.PULL_REQUEST
    
    # PR-specific fields in metadata:
    # - pr_number: PR number
    # - title: PR title
    # - state: open | closed | merged
    # - additions: lines added
    # - deletions: lines removed
    # - files_changed: files modified
    # - branch: source branch
    # - target_branch: target branch


class ReviewActivity(Activity):
    """Normalized code review activity."""
    activity_type: ActivityType = ActivityType.PULL_REQUEST_REVIEW
    
    # Review-specific fields in metadata:
    # - review_id: review ID
    # - pr_number: associated PR number
    # - state: APPROVED | CHANGES_REQUESTED | COMMENTED
    # - comments: inline comments count


class RepositoryActivity(Activity):
    """Normalized repository information."""
    activity_type: ActivityType = ActivityType.REPOSITORY
    
    # Repository-specific fields in metadata:
    # - repo_id: unique repository ID
    # - language: primary language
    # - visibility: public | private
    # - created_at: when repo was created
    # - stars: star count
    # - forks: fork count
