"""
Data Normalizer - Transforms GitHub MCP responses into Activity objects.

Purpose: GitHub returns different response formats (commits, PRs, reviews, repos).
This normalizer converts ALL of them into ONE common Activity object.
"""
from datetime import datetime
from typing import Dict, Any, List, Union
from app.analytics.activity_model import (
    Activity, ActivityType, CommitActivity, 
    PullRequestActivity, ReviewActivity, RepositoryActivity
)


class DataNormalizer:
    """
    Normalizes GitHub MCP responses into Activity objects.
    
    Transforms:
    - Commits → CommitActivity
    - Pull Requests → PullRequestActivity
    - Reviews → ReviewActivity
    - Repositories → RepositoryActivity
    """
    
    @staticmethod
    def normalize_commit(payload: Dict[str, Any], employee: str, repository: str) -> CommitActivity:
        """
        Normalize GitHub commit to CommitActivity.
        
        Args:
            payload: GitHub commit object from MCP
            employee: GitHub username of commit author
            repository: Repository name
            
        Returns:
            CommitActivity with normalized data
        """
        timestamp = payload.get("created_at") or payload.get("authored_date")
        if isinstance(timestamp, str):
            try:
                timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                timestamp = datetime.utcnow()
        elif not timestamp:
            timestamp = datetime.utcnow()
        
        return CommitActivity(
            employee=employee,
            repository=repository,
            timestamp=timestamp,
            metadata={
                "sha": payload.get("sha") or payload.get("id", ""),
                "message": payload.get("message") or payload.get("commit", {}).get("message", ""),
                "files_changed": payload.get("files_changed", 0) or len(payload.get("files", [])),
                "additions": payload.get("additions", 0),
                "deletions": payload.get("deletions", 0),
                "branch": payload.get("branch", "main"),
                "url": payload.get("html_url", "")
            }
        )
    
    @staticmethod
    def normalize_pull_request(payload: Dict[str, Any], employee: str, repository: str) -> PullRequestActivity:
        """
        Normalize GitHub PR to PullRequestActivity.
        
        Args:
            payload: GitHub PR object from MCP
            employee: GitHub username of PR author
            repository: Repository name
            
        Returns:
            PullRequestActivity with normalized data
        """
        created_at = payload.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                created_at = datetime.utcnow()
        elif not created_at:
            created_at = datetime.utcnow()
        
        return PullRequestActivity(
            employee=employee,
            repository=repository,
            timestamp=created_at,
            metadata={
                "pr_number": payload.get("number", 0),
                "title": payload.get("title", ""),
                "state": payload.get("state", "open"),  # open | closed | merged
                "additions": payload.get("additions", 0),
                "deletions": payload.get("deletions", 0),
                "files_changed": payload.get("changed_files", 0),
                "branch": payload.get("head", {}).get("ref", ""),
                "target_branch": payload.get("base", {}).get("ref", "main"),
                "url": payload.get("html_url", "")
            }
        )
    
    @staticmethod
    def normalize_review(payload: Dict[str, Any], employee: str, repository: str) -> ReviewActivity:
        """
        Normalize GitHub review to ReviewActivity.
        
        Args:
            payload: GitHub review object from MCP
            employee: GitHub username of reviewer
            repository: Repository name
            
        Returns:
            ReviewActivity with normalized data
        """
        submitted_at = payload.get("submitted_at")
        if isinstance(submitted_at, str):
            try:
                submitted_at = datetime.fromisoformat(submitted_at.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                submitted_at = datetime.utcnow()
        elif not submitted_at:
            submitted_at = datetime.utcnow()
        
        return ReviewActivity(
            employee=employee,
            repository=repository,
            timestamp=submitted_at,
            metadata={
                "review_id": payload.get("id", ""),
                "pr_number": payload.get("pull_request_number", 0) or payload.get("pull_request", {}).get("number", 0),
                "state": payload.get("state", "COMMENTED"),  # APPROVED | CHANGES_REQUESTED | COMMENTED
                "comments": len(payload.get("comments", [])),
                "body": payload.get("body", ""),
                "url": payload.get("html_url", "")
            }
        )
    
    @staticmethod
    def normalize_repository(payload: Dict[str, Any]) -> RepositoryActivity:
        """
        Normalize GitHub repository to RepositoryActivity.
        
        Args:
            payload: GitHub repository object from MCP
            
        Returns:
            RepositoryActivity with normalized data
        """
        created_at = payload.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                created_at = datetime.utcnow()
        elif not created_at:
            created_at = datetime.utcnow()
        
        owner = payload.get("owner", {})
        employee = owner.get("login", "unknown") if isinstance(owner, dict) else str(owner)
        
        return RepositoryActivity(
            employee=employee,
            repository=payload.get("name", ""),
            timestamp=created_at,
            metadata={
                "repo_id": payload.get("id", ""),
                "language": payload.get("language", "Unknown"),
                "visibility": "private" if payload.get("private") else "public",
                "created_at": payload.get("created_at", ""),
                "stars": payload.get("stargazers_count", 0),
                "forks": payload.get("forks_count", 0),
                "url": payload.get("html_url", "")
            }
        )
    
    @staticmethod
    def normalize(payload: Dict[str, Any], employee: str = "", repository: str = "") -> Activity:
        """
        Auto-detect activity type and normalize.
        
        Args:
            payload: GitHub object from MCP
            employee: GitHub username (optional, extracted from payload if not provided)
            repository: Repository name (optional, extracted from payload if not provided)
            
        Returns:
            Normalized Activity object
        """
        activity_type = DataNormalizer._detect_type(payload)
        
        if activity_type == ActivityType.COMMIT:
            emp = employee or payload.get("author", {}).get("name", "unknown")
            repo = repository or payload.get("repository", {}).get("name", "unknown")
            return DataNormalizer.normalize_commit(payload, emp, repo)
        
        elif activity_type == ActivityType.PULL_REQUEST:
            emp = employee or payload.get("user", {}).get("login", "unknown")
            repo = repository or payload.get("repository", {}).get("name", "unknown")
            return DataNormalizer.normalize_pull_request(payload, emp, repo)
        
        elif activity_type == ActivityType.PULL_REQUEST_REVIEW:
            emp = employee or payload.get("user", {}).get("login", "unknown")
            repo = repository or payload.get("repository", {}).get("name", "unknown")
            return DataNormalizer.normalize_review(payload, emp, repo)
        
        elif activity_type == ActivityType.REVIEW:
            emp = employee or payload.get("user", {}).get("login", "unknown")
            repo = repository or payload.get("repository", {}).get("name", "unknown")
            return DataNormalizer.normalize_review(payload, emp, repo)
        
        elif activity_type == ActivityType.REPOSITORY:
            return DataNormalizer.normalize_repository(payload)
        
        else:
            raise ValueError(f"Unknown activity type for payload: {payload}")
    
    @staticmethod
    def _detect_type(payload: Dict[str, Any]) -> ActivityType:
        """
        Detect activity type from payload structure.
        
        Args:
            payload: GitHub object from MCP
            
        Returns:
            Detected ActivityType
        """
        # Repository detection
        if "stargazers_count" in payload and "forks_count" in payload and "repository" not in payload:
            return ActivityType.REPOSITORY
        
        # Commit detection
        if "sha" in payload or ("oid" in payload and "message" in payload):
            return ActivityType.COMMIT
        
        # Review detection (check for submitted_at + pull_request_number)
        if "submitted_at" in payload and ("pull_request_number" in payload or "pull_request" in payload):
            return ActivityType.PULL_REQUEST_REVIEW
        
        # Pull Request detection (has number, state, head, base)
        if "number" in payload and "state" in payload and "head" in payload and "base" in payload:
            return ActivityType.PULL_REQUEST
        
        # Fallback: if has pull_request_url or pull_request in body, it's a review
        if "pull_request_url" in payload:
            return ActivityType.PULL_REQUEST_REVIEW
        
        raise ValueError(f"Cannot detect activity type from payload keys: {list(payload.keys())}")
    
    @staticmethod
    def normalize_batch(payloads: List[Dict[str, Any]], 
                       employee: str = "", 
                       repository: str = "") -> List[Activity]:
        """
        Normalize multiple activities at once.
        
        Args:
            payloads: List of GitHub objects from MCP
            employee: Default GitHub username (optional)
            repository: Default repository name (optional)
            
        Returns:
            List of normalized Activity objects
        """
        results = []
        for payload in payloads:
            try:
                activity = DataNormalizer.normalize(payload, employee, repository)
                results.append(activity)
            except (ValueError, KeyError) as e:
                print(f"Warning: Failed to normalize payload - {str(e)}")
                continue
        
        return results
