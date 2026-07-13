"""
Technical Scoring Engine - Calculates Technical Excellence Score from metrics.

Purpose: Convert 7 normalized metrics (0-100) into a final Technical Excellence Score.
Inputs: MetricsResult with 7 KPIs
Outputs: TechnicalScore with final score (0-100) and grade (A-F)

Scoring Formula (from HLD):
- Commit Frequency: 20%
- PR Participation: 20%
- Code Review Participation: 15%
- Documentation Contribution: 15%
- Branch Hygiene: 15%
- Repository Contribution: 15%
- Development Consistency: Variable (distributes remaining weight)
Total = 100%
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Weight configuration (must sum to 100%)
WEIGHTS = {
    'commit_frequency': 0.20,
    'pr_participation': 0.20,
    'code_review_participation': 0.15,
    'documentation_contribution': 0.15,
    'branch_hygiene': 0.15,
    'repository_contribution': 0.15,
    'development_consistency': 0.00,  # Can be enabled for future phases
}

# Grade thresholds (score ranges)
GRADE_THRESHOLDS = {
    'A': (90, 100),      # 90-100 → A (Excellent)
    'B': (80, 89.99),    # 80-89 → B (Very Good)
    'C': (70, 79.99),    # 70-79 → C (Good)
    'D': (60, 69.99),    # 60-69 → D (Satisfactory)
    'F': (0, 59.99),     # 0-59 → F (Needs Improvement)
}

# Validate weights sum to 100%
_total_weight = sum(WEIGHTS.values())
if abs(_total_weight - 1.0) > 0.001:  # Allow small floating point error
    logger.warning(f"Weights do not sum to 100%: {_total_weight * 100}%")


class TechnicalScorer:
    """
    Calculates Technical Excellence Score from normalized metrics.
    
    Consumes: Dict with 7 metrics (each 0-100)
    Produces: Dict with final score (0-100) and grade (A-F)
    """
    
    def __init__(self, weights: Dict[str, float] = None):
        """
        Initialize scorer with optional custom weights.
        
        Args:
            weights: Dict mapping metric names to weights (0-1).
                    If None, uses default HLD weights.
        """
        if weights:
            self.weights = weights
            self._validate_weights()
        else:
            self.weights = WEIGHTS.copy()
    
    def _validate_weights(self) -> None:
        """Validate that weights sum to 1.0."""
        total = sum(self.weights.values())
        if abs(total - 1.0) > 0.001:
            raise ValueError(
                f"Weights must sum to 1.0 (100%), got {total * 100}%"
            )
    
    def score(self, metrics: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculate Technical Excellence Score from metrics.
        
        Args:
            metrics: Dict with metric values (each 0-100)
                Expected keys: commit_frequency, pr_participation,
                code_review_participation, documentation_contribution,
                branch_hygiene, repository_contribution,
                development_consistency
        
        Returns:
            Dict with:
                - technical_score: Final score (0-100)
                - grade: Letter grade (A-F)
                - weighted_breakdown: Contribution of each metric
        """
        # Validate inputs
        if not metrics:
            logger.warning("No metrics provided")
            return {
                'technical_score': 0.0,
                'grade': 'F',
                'weighted_breakdown': {}
            }
        
        # Calculate weighted score
        weighted_breakdown = {}
        total_score = 0.0
        
        for metric_name, weight in self.weights.items():
            if weight == 0:
                # Skip metrics with 0 weight
                continue
            
            metric_value = metrics.get(metric_name, 0.0)
            
            # Validate metric is in range [0, 100]
            if not (0 <= metric_value <= 100):
                logger.warning(
                    f"Metric {metric_name} out of range: {metric_value}"
                )
                metric_value = max(0, min(100, metric_value))
            
            # Calculate weighted contribution
            weighted_value = metric_value * weight
            weighted_breakdown[metric_name] = {
                'value': metric_value,
                'weight': weight,
                'contribution': weighted_value
            }
            
            total_score += weighted_value
        
        # Round to 1 decimal place
        total_score = round(total_score, 1)
        
        # Determine grade
        grade = self._get_grade(total_score)
        
        logger.info(
            f"Technical Score: {total_score}/100, Grade: {grade}"
        )
        logger.debug(f"Weighted breakdown: {weighted_breakdown}")
        
        return {
            'technical_score': total_score,
            'grade': grade,
            'weighted_breakdown': weighted_breakdown
        }
    
    def _get_grade(self, score: float) -> str:
        """
        Determine letter grade from numerical score.
        
        Args:
            score: Numerical score (0-100)
        
        Returns:
            Letter grade (A-F)
        """
        for grade, (min_score, max_score) in GRADE_THRESHOLDS.items():
            if min_score <= score <= max_score:
                return grade
        
        # Fallback (should not reach here)
        return 'F'
    
    def score_breakdown(self, metrics: Dict[str, float]) -> Dict[str, Any]:
        """
        Get detailed breakdown of scoring.
        
        Args:
            metrics: Dict with metric values
        
        Returns:
            Dict with detailed scoring breakdown
        """
        result = self.score(metrics)
        
        # Add interpretation
        grade = result['grade']
        interpretation = self._get_interpretation(grade)
        
        result['interpretation'] = interpretation
        
        return result
    
    @staticmethod
    def _get_interpretation(grade: str) -> str:
        """Get human-readable interpretation of grade."""
        interpretations = {
            'A': 'Excellent technical excellence',
            'B': 'Very good technical practices',
            'C': 'Good engineering standards',
            'D': 'Satisfactory but needs improvement',
            'F': 'Significant improvement needed'
        }
        return interpretations.get(grade, 'Unknown')


# Convenience function for direct usage
def calculate_technical_score(metrics: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate technical excellence score.
    
    Args:
        metrics: Dict with 7 metric values (0-100 each)
    
    Returns:
        Dict with technical_score, grade, and breakdown
    """
    scorer = TechnicalScorer()
    return scorer.score(metrics)


def calculate_technical_score_with_breakdown(metrics: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculate technical excellence score with detailed breakdown.
    
    Args:
        metrics: Dict with 7 metric values (0-100 each)
    
    Returns:
        Dict with score, grade, interpretation, and breakdown
    """
    scorer = TechnicalScorer()
    return scorer.score_breakdown(metrics)
