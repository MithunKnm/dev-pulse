# US-201: Implement Data Normalizer

## Purpose

GitHub returns different response formats:
- **Commits**: `{sha, author, created_at, files_changed, ...}`
- **Pull Requests**: `{number, title, state, additions, ...}`
- **Reviews**: `{id, state, submitted_at, comments, ...}`
- **Repositories**: `{id, language, stars, forks, ...}`

This normalizer converts ALL of them into ONE common `Activity` object.

## Definition of Done

✅ Commit normalized  
✅ PR normalized  
✅ Review normalized  
✅ Repository normalized  

## Architecture

```
GitHub MCP Response
        ↓
Auto-detect Type
        ↓
Type-specific Normalizer
    ├─ CommitNormalizer
    ├─ PullRequestNormalizer
    ├─ ReviewNormalizer
    └─ RepositoryNormalizer
        ↓
Normalized Activity Object
        ↓
Metrics Extraction Engine
```

## Core Model: Activity

```python
class Activity(BaseModel):
    employee: str              # GitHub username
    activity_type: ActivityType  # COMMIT | PULL_REQUEST | REVIEW | REPOSITORY
    repository: str            # Repository name
    timestamp: datetime        # Activity timestamp
    metadata: Dict[str, Any]   # Activity-specific data
```

## Activity Types

### 1. COMMIT Activity

```python
Activity(
    employee="gauri-moudgil",
    activity_type=ActivityType.COMMIT,
    repository="dev-pulse",
    timestamp=datetime(...),
    metadata={
        "sha": "abc123def456",
        "message": "Add data normalizer",
        "files_changed": 5,
        "additions": 120,
        "deletions": 45,
        "branch": "main"
    }
)
```

**Required Metadata:**
- `sha`: Commit SHA
- `message`: Commit message
- `files_changed`: Number of files
- `additions`: Lines added
- `deletions`: Lines removed
- `branch`: Target branch

### 2. PULL_REQUEST Activity

```python
Activity(
    employee="gauri-moudgil",
    activity_type=ActivityType.PULL_REQUEST,
    repository="dev-pulse",
    timestamp=datetime(...),
    metadata={
        "pr_number": 42,
        "title": "Implement data normalizer",
        "state": "merged",
        "additions": 350,
        "deletions": 85,
        "branch": "feature/normalizer",
        "target_branch": "main"
    }
)
```

**Required Metadata:**
- `pr_number`: PR number
- `title`: PR title
- `state`: open | closed | merged
- `additions`: Lines added
- `deletions`: Lines removed
- `branch`: Source branch
- `target_branch`: Target branch

### 3. REVIEW Activity

```python
Activity(
    employee="gauri-moudgil",
    activity_type=ActivityType.REVIEW,
    repository="dev-pulse",
    timestamp=datetime(...),
    metadata={
        "review_id": "review_123",
        "pr_number": 42,
        "state": "APPROVED",
        "comments": 2
    }
)
```

**Required Metadata:**
- `review_id`: Review ID
- `pr_number`: Associated PR
- `state`: APPROVED | CHANGES_REQUESTED | COMMENTED
- `comments`: Comment count

### 4. REPOSITORY Activity

```python
Activity(
    employee="gauri-moudgil",
    activity_type=ActivityType.REPOSITORY,
    repository="dev-pulse",
    timestamp=datetime(...),
    metadata={
        "repo_id": "repo_001",
        "language": "Python",
        "visibility": "public",
        "stars": 50,
        "forks": 10
    }
)
```

**Required Metadata:**
- `repo_id`: Repository ID
- `language`: Primary language
- `visibility`: public | private
- `stars`: Star count
- `forks`: Fork count

## API Usage

### Individual Normalization

```python
from app.analytics.normalizer import DataNormalizer

# Normalize commit
commit_activity = DataNormalizer.normalize_commit(
    payload=github_commit_payload,
    employee="gauri-moudgil",
    repository="dev-pulse"
)

# Normalize PR
pr_activity = DataNormalizer.normalize_pull_request(
    payload=github_pr_payload,
    employee="gauri-moudgil",
    repository="dev-pulse"
)

# Normalize review
review_activity = DataNormalizer.normalize_review(
    payload=github_review_payload,
    employee="gauri-moudgil",
    repository="dev-pulse"
)

# Normalize repository
repo_activity = DataNormalizer.normalize_repository(
    payload=github_repo_payload
)
```

### Auto-Detection Normalization

```python
# Automatically detects type and normalizes
activity = DataNormalizer.normalize(
    payload=any_github_payload,
    employee="gauri-moudgil",
    repository="dev-pulse"
)
```

### Batch Processing

```python
# Process multiple activities at once
activities = DataNormalizer.normalize_batch(
    payloads=[commit_payload, pr_payload, review_payload, repo_payload],
    employee="gauri-moudgil",
    repository="dev-pulse"
)
# Automatically skips malformed payloads
```

## Project Structure

```
backend/
├── app/
│   └── analytics/
│       ├── __init__.py
│       ├── activity_model.py         # Activity models
│       ├── normalizer.py             # DataNormalizer (US-201)
│       ├── metrics_engine.py         # Metrics Extraction (US-203)
│       ├── scoring_engine.py         # Technical Scoring (US-204)
│       └── [future modules]
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_normalizer.py            # 30+ test cases
└── requirements.txt
```

## Test Coverage

**Test Classes**: 13  
**Test Methods**: 30+

Coverage includes:
- ✅ Commit normalization
- ✅ PR normalization
- ✅ Review normalization
- ✅ Repository normalization
- ✅ Activity type auto-detection
- ✅ Batch processing with error handling
- ✅ Metadata completeness
- ✅ Edge cases (missing fields, invalid timestamps)
- ✅ Employee extraction
- ✅ State preservation

## Key Design Decisions

1. **Single Activity Model**: All activities use the same `Activity` base class with type-specific metadata, enabling consistent processing downstream.

2. **Auto-Detection**: The normalizer can auto-detect activity types from payload structure, reducing coupling between Data Collector and normalizer.

3. **Error Resilience**: Batch processing gracefully skips malformed payloads and logs warnings instead of failing completely.

4. **Extensibility**: New activity types can be added by:
   - Creating a new ActivityType enum value
   - Implementing a new normalizer method
   - Updating type detection logic

5. **Employee Extraction**: If employee not provided, normalizer extracts from payload (author, user.login, owner.login).

## Integration with Data Collector

```python
from app.analytics.normalizer import DataNormalizer

# Get data from GitHub MCP
commits = github_mcp_client.get_commits(repo)
pull_requests = github_mcp_client.get_pull_requests(repo)
reviews = github_mcp_client.get_reviews(repo)
repositories = github_mcp_client.get_repositories()

# Normalize all activities
all_payloads = commits + pull_requests + reviews + repositories
normalized_activities = DataNormalizer.normalize_batch(all_payloads)

# Forward to Metrics Engine
for activity in normalized_activities:
    metrics_engine.process(activity)
```

## Files Delivered

1. **`app/analytics/activity_model.py`** (71 lines)
   - Activity base model
   - CommitActivity, PullRequestActivity, ReviewActivity, RepositoryActivity

2. **`app/analytics/normalizer.py`** (273 lines)
   - DataNormalizer class
   - Individual normalizer methods for each activity type
   - Auto-detection logic
   - Batch processing support

3. **`tests/test_normalizer.py`** (350+ lines)
   - 30+ comprehensive test cases
   - Tests for all activity types
   - Error handling and edge case tests

## Status

✅ **COMPLETE** - US-201 Implementation

All definition of done items addressed:
- ✅ Commit normalized
- ✅ PR normalized
- ✅ Review normalized
- ✅ Repository normalized
- ✅ Auto-detection
- ✅ Batch processing
- ✅ 30+ test cases
- ✅ Production-ready

