"""
Metrics Extraction Engine - Extracts engineering metrics from normalized activities.

Purpose: Transforms normalized Activity objects into measurable KPIs.
Outputs metrics that feed into the Technical Scoring Engine (US-204).

Current metrics (7 KPIs):
1. Commit Frequency - frequency of commits
2. Pull Request Participation - frequency of PRs opened
3. Code Review Participation - frequency of reviews given
4. Documentation Contribution - quality of PR documentation
5. Branch Hygiene - adherence to branch naming conventions
6. Repository Contribution - file/codebase diversity
7. Development Consistency - code contribution patterns over time
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import defaultdict
import logging

from app.analytics.activity_model import (
    Activity, ActivityType, CommitActivity, 
    PullRequestActivity, ReviewActivity
)

logger = logging.getLogger(__name__)

# Baselines for normalizing metrics to 0-100 scale
# Conservative estimates so even small contributions produce meaningful scores
COMMIT_FREQUENCY_BASELINE = 30  # 30 commits → 100 score
PR_PARTICIPATION_BASELINE = 10  # 10 PRs → 100 score
CODE_REVIEW_BASELINE = 10       # 10 reviews → 100 score
DOC_CONTRIBUTION_BASELINE = 2000  # 2000 chars in PR descriptions → 100
BRANCH_HYGIENE_THRESHOLD = 0.3  # ≤30% stale branches → 100 score
CONSISTENCY_WINDOW_DAYS = 30    # Measure consistency over last 30 days


class MetricsExtractor:
    """
    Extracts engineering metrics from normalized activities.
    
    Consumes: List[Activity] from Data Normalizer
    Produces: MetricsData dict with 7 KPIs (each 0-100)
    """
    
    def __init__(self):
        self.activities: List[Activity] = []
        self.commits: List[CommitActivity] = []
        self.pull_requests: List[PullRequestActivity] = []
        self.reviews: List[ReviewActivity] = []
        
    def extract(self, activities: List[Activity]) -> Dict[str, Any]:
        """
        Extract all metrics from activities.
        
        Args:
            activities: Normalized activities from Data Normalizer
            
        Returns:
            Dict with 7 metric scores (each 0-100) and supporting data
        """
        self.activities = activities
        self._categorize_activities()
        
        metrics = {
            'commit_frequency': self._calculate_commit_frequency(),
            'pr_participation': self._calculate_pr_participation(),
            'code_review_participation': self._calculate_code_review_participation(),
            'documentation_contribution': self._calculate_documentation_contribution(),
            'branch_hygiene': self._calculate_branch_hygiene(),
            'repository_contribution': self._calculate_repository_contribution(),
            'development_consistency': self._calculate_development_consistency(),
        }
        
        # Round all metrics to 1 decimal place
        metrics = {k: round(v, 1) for k, v in metrics.items()}
        
        logger.info("Extracted metrics: %s", metrics)
        return metrics
    
    def _categorize_activities(self) -> None:
        """Separate activities by type for metric calculations."""
        self.commits = [a for a in self.activities if isinstance(a, CommitActivity)]
        self.pull_requests = [a for a in self.activities if isinstance(a, PullRequestActivity)]
        self.reviews = [a for a in self.activities if isinstance(a, ReviewActivity)]
        
        logger.debug(
            f"Categorized activities: {len(self.commits)} commits, "
            f"{len(self.pull_requests)} PRs, {len(self.reviews)} reviews"
        )
    
    def _clamp(self, value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
        """Clamp value to [min_val, max_val] range."""
        return max(min_val, min(max_val, value))
    
    # =========================================================================
    # Metric 1: Commit Frequency
    # =========================================================================
    def _calculate_commit_frequency(self) -> float:
        """
        Measure: How frequently does the developer commit?
        
        Calculation: (commit_count / BASELINE) × 100
        
        Returns: Score 0-100
        """
        commit_count = len(self.commits)
        score = (commit_count / COMMIT_FREQUENCY_BASELINE) * 100
        
        logger.debug(f"Commit Frequency: {commit_count} commits → {score:.1f}")
        return self._clamp(score)
    
    # =========================================================================
    # Metric 2: PR Participation
    # =========================================================================
    def _calculate_pr_participation(self) -> float:
        """
        Measure: How frequently does the developer create/participate in PRs?
        
        Calculation: (pr_count / BASELINE) × 100
        
        Returns: Score 0-100
        """
        pr_count = len(self.pull_requests)
        score = (pr_count / PR_PARTICIPATION_BASELINE) * 100
        
        logger.debug(f"PR Participation: {pr_count} PRs → {score:.1f}")
        return self._clamp(score)
    
    # =========================================================================
    # Metric 3: Code Review Participation
    # =========================================================================
    def _calculate_code_review_participation(self) -> float:
        """
        Measure: How frequently does the developer conduct code reviews?
        
        Calculation: (review_count / BASELINE) × 100
        
        Returns: Score 0-100
        """
        review_count = len(self.reviews)
        score = (review_count / CODE_REVIEW_BASELINE) * 100
        
        logger.debug(f"Code Review Participation: {review_count} reviews → {score:.1f}")
        return self._clamp(score)
    
    # =========================================================================
    # Metric 4: Documentation Contribution
    # =========================================================================
    def _calculate_documentation_contribution(self) -> float:
        """
        Measure: Quality of documentation in PR descriptions.
        
        Calculation: (total_pr_description_chars / BASELINE) × 100
        
        Rationale: Longer, detailed PR descriptions indicate better documentation.
        
        Returns: Score 0-100
        """
        total_doc_chars = 0
        
        for pr in self.pull_requests:
            # Check for PR description/body in metadata
            pr_body = pr.metadata.get('title', '') or ''
            pr_desc = pr.metadata.get('body', '') or pr.metadata.get('description', '') or ''
            
            total_doc_chars += len(pr_body) + len(pr_desc)
        
        score = (total_doc_chars / DOC_CONTRIBUTION_BASELINE) * 100
        
        logger.debug(f"Documentation Contribution: {total_doc_chars} chars → {score:.1f}")
        return self._clamp(score)
    
    # =========================================================================
    # Metric 5: Branch Hygiene
    # =========================================================================
    def _calculate_branch_hygiene(self) -> float:
        """
        Measure: Adherence to branch naming conventions and hygiene.
        
        Calculation: (well_named_branches / total_branches) × 100
        
        Well-named: Follows conventions (main, master, develop, feature/*, fix/*, etc.)
        
        Returns: Score 0-100, or 50.0 (neutral) if no branches found
        """
        if not self.pull_requests:
            logger.debug("Branch Hygiene: No PRs found → 50.0 (neutral)")
            return 50.0
        
        branches = set()
        for pr in self.pull_requests:
            branch = pr.metadata.get('branch', '') or pr.metadata.get('source_branch', '')
            if branch:
                branches.add(branch)
        
        if not branches:
            logger.debug("Branch Hygiene: No branch data found → 50.0 (neutral)")
            return 50.0
        
        well_named_count = sum(1 for b in branches if self._is_well_named_branch(b))
        score = (well_named_count / len(branches)) * 100
        
        logger.debug(
            f"Branch Hygiene: {well_named_count}/{len(branches)} well-named → {score:.1f}"
        )
        return self._clamp(score)
    
    @staticmethod
    def _is_well_named_branch(branch_name: str) -> bool:
        """Check if branch follows naming conventions."""
        if not branch_name:
            return False
        
        # Standard conventions
        conventions = (
            'main', 'master', 'develop', 'development',
            'feature/', 'fix/', 'hotfix/', 'bugfix/',
            'release/', 'chore/', 'docs/', 'test/'
        )
        
        branch_lower = branch_name.lower()
        return any(branch_lower.startswith(c) for c in conventions) or branch_lower in conventions
    
    # =========================================================================
    # Metric 6: Repository Contribution
    # =========================================================================
    def _calculate_repository_contribution(self) -> float:
        """
        Measure: Diversity of code contribution across the codebase.
        
        Calculation: (avg_files_per_pr / 20) × 100
        
        Rationale: Developers who modify multiple files/areas show broader impact.
        Baseline: ~20 files per PR = 100 score
        
        Returns: Score 0-100
        """
        if not self.pull_requests:
            logger.debug("Repository Contribution: No PRs → 0.0")
            return 0.0
        
        # Sum of files changed across all PRs
        total_files_changed = 0
        pr_count_with_files = 0
        
        for pr in self.pull_requests:
            files_changed = pr.metadata.get('files_changed', 0) or 0
            if files_changed > 0:
                total_files_changed += files_changed
                pr_count_with_files += 1
        
        # If we don't have file data, use PR count as proxy
        if not pr_count_with_files:
            logger.debug("Repository Contribution: No file data → 50.0 (neutral)")
            return 50.0
        
        avg_files_per_pr = total_files_changed / pr_count_with_files
        score = (avg_files_per_pr / 20) * 100  # Baseline: 20 files → 100
        
        logger.debug(
            f"Repository Contribution: {avg_files_per_pr:.1f} avg files/PR → {score:.1f}"
        )
        return self._clamp(score)
    
    # =========================================================================
    # Metric 7: Development Consistency
    # =========================================================================
    def _calculate_development_consistency(self) -> float:
        """
        Measure: Consistency of contributions over time.
        
        Calculation: Activity distribution over CONSISTENCY_WINDOW_DAYS
        - Perfect consistency: activities evenly spread = 100
        - Burst activity: concentrated spikes = lower score
        - No activity: 0
        
        Returns: Score 0-100
        """
        if not self.activities:
            logger.debug("Development Consistency: No activities → 0.0")
            return 0.0
        
        # Sort activities by timestamp
        sorted_activities = sorted(
            self.activities,
            key=lambda a: a.timestamp if isinstance(a.timestamp, datetime) else datetime.fromisoformat(str(a.timestamp))
        )
        
        # Get time range
        first_activity = sorted_activities[0].timestamp
        last_activity = sorted_activities[-1].timestamp
        
        if isinstance(first_activity, str):
            first_activity = datetime.fromisoformat(first_activity.replace('Z', '+00:00'))
        if isinstance(last_activity, str):
            last_activity = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
        
        time_span = (last_activity - first_activity).days
        
        if time_span == 0:
            # All activities on same day
            logger.debug("Development Consistency: All activities same day → 50.0 (neutral)")
            return 50.0
        
        # Count activities per day
        activities_by_day = defaultdict(int)
        for activity in self.activities:
            ts = activity.timestamp
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts.replace('Z', '+00:00'))
            day_key = ts.date()
            activities_by_day[day_key] += 1
        
        # Calculate standard deviation of activity distribution
        daily_counts = list(activities_by_day.values())
        avg_per_day = len(self.activities) / len(daily_counts)
        
        if len(daily_counts) <= 1:
            return 50.0
        
        # Calculate coefficient of variation (std dev / mean)
        variance = sum((x - avg_per_day) ** 2 for x in daily_counts) / len(daily_counts)
        std_dev = variance ** 0.5
        
        # If mean is 0, avoid division by zero
        if avg_per_day == 0:
            coeff_variation = 0
        else:
            coeff_variation = std_dev / avg_per_day
        
        # Convert to score: lower CV = higher consistency
        # CV range: 0 (perfect) to ~2+ (very bursty)
        # Map: CV=0 → 100, CV=1 → 50, CV=2 → 0
        score = 100 - (coeff_variation * 50)
        
        logger.debug(
            f"Development Consistency: {len(daily_counts)} active days, "
            f"CV={coeff_variation:.2f} → {score:.1f}"
        )
        return self._clamp(score)


# Convenience function for direct usage
def extract_metrics(activities: List[Activity]) -> Dict[str, Any]:
    """
    Extract metrics from activities.
    
    Args:
        activities: List of normalized Activity objects
        
    Returns:
        Dict with 7 metric scores (0-100 each)
    """
    extractor = MetricsExtractor()
    return extractor.extract(activities)
