# dev-pulse
AI-powered GitHub Technical Excellence Intelligence Platform that analyzes repositories, generates engineering quality insights, and provides personalized improvement recommendations.
# DEV-PULSE

> AI-Powered GitHub Technical Excellence Intelligence Platform

DEV-PULSE is an internal engineering intelligence platform that analyzes GitHub repositories and generates AI-powered Technical Excellence Reports.

The platform helps engineering managers and developers gain objective insights into repository health, engineering practices, and improvement opportunities.

---

## Problem Statement

Engineering managers often rely on manual code reviews and subjective feedback to assess technical excellence.

DEV-PULSE automates repository analysis using GitHub data and AI-generated recommendations.

---

## Features (Phase 1 MVP)

- Repository Analysis
- Commit Analysis
- Pull Request Analysis
- Technical Excellence Score
- AI-generated Recommendations
- Technical Excellence Report
- Engineering Dashboard

---

## Future Roadmap

- Azure Boards Integration
- SonarQube Integration
- Jira Integration
- Teams Standup Analysis
- Engineering Health Dashboard
- Leadership Readiness
- Skill Matrix

---

## Architecture

```
GitHub

↓

Data Collector

↓

Metrics Engine

↓

Scoring Engine

↓

LLM Recommendation Engine

↓

Dashboard
```

---

## Technology Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- React Query

### Backend

- Python
- FastAPI

### AI

- OpenAI / Claude / Azure OpenAI

### Database

- PostgreSQL (Future)

---

## Project Structure

```
frontend/
backend/
docs/
assets/
data/
```

---

## Getting Started

### Clone

```bash
git clone https://github.com/<org>/dev-pulse.git
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Team

| Name | Role |
|------|------|
| Mithun | Product Owner |
| Raman | Backend Lead |
| Gauri | Data Intelligence |
| Akanksha | AI Engineer |
| Abhishek | AI Engineer |
| Yasir | Frontend Engineer |

---

## Sprint Plan

Week 1

Architecture

Planning

Scoring Design

Week 2

GitHub Integration

Analytics Engine

Dashboard

Week 3

AI Reports

Testing

Demo

---
dev-pulse/

│
├── README.md
├── LICENSE
├── .gitignore
├── docs/
│      ProductVision.md
│      Architecture.md
│      SprintPlan.md
│      API.md
│      ADR.md
│
├── frontend/
│      React App
│
├── backend/
│      app/
│      api/
│      services/
│      models/
│      prompts/
│
├── assets/
│      logo/
│      screenshots/
│
├── data/
│      sample-data/
│
└── .github/
       ISSUE_TEMPLATE
       PULL_REQUEST_TEMPLATE

main

develop

feature/github-integration

feature/dashboard

feature/scoring-engine

feature/report-generation

feature/ai-recommendation

feature/frontend-ui

feature

bug

enhancement

documentation

backend

frontend

AI

good first issue

Milestones
Milestone 1

MVP Planning

Milestone 2

GitHub Integration

Milestone 3

Dashboard

Milestone 4

AI Recommendation

Milestone 5

Final Demo

docs/

ProductVision.md

Architecture.md

SprintPlan.md

ScoringEngine.md

PromptLibrary.md

ADR.md

MeetingNotes.md

BusinessValue.md

backend/

app/

    main.py

    api/

        github.py

        report.py

    services/

        github_service.py

        scoring_service.py

        recommendation_service.py

    models/

    prompts/

    utils/

requirements.txt

## License

Internal Tricon Innovation Project
