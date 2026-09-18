# Agent 1 - Planning and Architecture

## Task
Act as the software architect to read the Exora Solutions AI-Assisted Full-Stack Development Assignment, inspect the repository, and produce a complete `PLAN.md` document.

## Actions Taken
1. Checked the workspace directory, found it empty.
2. Created `PLAN.md` conforming to all requirements, detailing:
   - Problem Understanding
   - Functional Requirements
   - Architecture
   - Data Models (User, Ticket, Activity)
   - API Design
   - Ticket Workflow
   - AI Architecture & Grounding Strategy
   - Security Practices
   - Testing Strategy
   - Deployment Guidelines
   - Git Commit Strategy
   - Acceptance Criteria Checklist

## Important Decisions
- **AI Grounding:** AI will strictly interact through defined tools (e.g., `count_tickets`, `search_tickets`) over an Express service to query MongoDB. The system prompt will enforce answering only based on these returned JSON results. No raw string injection or arbitrary MongoDB queries are allowed.
- **Role and Workflows:** We defined specific status transitions (`OPEN` -> `IN_PROGRESS`, etc.) and basic roles (`USER`, `MANAGER`) to encapsulate business logic on the backend.

## Risks and Ambiguities
- Since the AI provider is not strictly defined, we assumed a generalized tool-calling API pattern that fits well with OpenAI or Gemini APIs.
- Testing data requirements must be seeded specifically so AI queries can be properly verified, this will be handled during the backend implementation.
