# Exora Solutions AI-Assisted Full-Stack Ticketing System
## Implementation Plan (PLAN.md)

### 1. Problem Understanding
The goal is to build a production-like, scoped full-stack ticketing application for users and managers. The key differentiator is an integrated AI assistant that can answer questions about the tickets. The most critical constraint is that the AI must **never** invent data or use hard-coded responses; it must query the live MongoDB database using deterministic server-side tools to answer user questions accurately.

### 2. Functional Requirements
1. **User Authentication:** Login and Registration for `USER` and `MANAGER` roles.
2. **Ticket Management:** Create, list, view, and update tickets (status, assignee).
3. **Dashboard:** View statistics (total, open, in-progress, blocked, resolved, high-priority open, recent).
4. **Activity History:** Track every important mutation (creation, status change, assignment) in a timeline.
5. **AI Chat Interface:** A conversational UI for users to ask questions about ticket data.
6. **AI Grounding:** The AI must use function calling to retrieve real data from the backend to answer questions like "How many high-priority tickets are still open?"

### 3. Architecture
- **Frontend:** React, Vite, Tailwind CSS, React Router, Fetch API. Prioritize clean, usable UX.
- **Backend:** Node.js, Express.js. Handles routing, business logic, validation (Zod), and AI integration.
- **Database:** MongoDB Atlas, accessed via Mongoose.
- **AI:** An LLM provider (e.g., OpenAI or Gemini) integrated via a service layer in the backend, utilizing tool/function calling for structured data retrieval.
- **Authentication:** JWT-based stateless authentication.
- **Deployment:**
  - Frontend: Vercel
  - Backend: Render
  - Database: MongoDB Atlas

### 4. Data Model
**User Schema**
- `name` (String, required)
- `email` (String, required, unique)
- `passwordHash` (String, required)
- `role` (String, enum: ['USER', 'MANAGER'], default: 'USER')
- `createdAt`, `updatedAt` (Timestamps)

**Ticket Schema**
- `ticketNumber` (Number, unique, auto-incremented or generated)
- `title` (String, required)
- `description` (String, required)
- `priority` (String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
- `status` (String, enum: ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED'], default: 'OPEN')
- `assignee` (ObjectId, ref: 'User', nullable)
- `createdBy` (ObjectId, ref: 'User', required)
- `createdAt`, `updatedAt` (Timestamps)

**Activity Schema**
- `ticketId` (ObjectId, ref: 'Ticket', required)
- `actorId` (ObjectId, ref: 'User', required)
- `action` (String, required - e.g., 'CREATED', 'STATUS_CHANGED', 'ASSIGNEE_CHANGED')
- `oldValue` (String)
- `newValue` (String)
- `message` (String)
- `createdAt` (Timestamp)

### 5. API Design
*All endpoints except login/register require a valid JWT.*

- `POST /api/auth/login` - Authenticate user, return JWT.
- `POST /api/auth/register` - Create a new user.
- `GET /api/tickets` - List tickets (supports query params for filters, pagination).
- `POST /api/tickets` - Create a new ticket.
- `GET /api/tickets/:ticketNumber` - Get details of a specific ticket.
- `PATCH /api/tickets/:ticketNumber` - Update title/description (Manager/Creator).
- `PATCH /api/tickets/:ticketNumber/status` - Update ticket status.
- `PATCH /api/tickets/:ticketNumber/assignee` - Update ticket assignee (Manager).
- `GET /api/tickets/:ticketNumber/activity` - Get activity timeline for a ticket.
- `GET /api/dashboard/stats` - Get aggregated counts for the dashboard.
- `POST /api/ai/chat` - Send a message to the AI and receive a grounded response.

### 6. Ticket Workflow
Allowed status transitions enforced by backend logic:
- `OPEN` → `IN_PROGRESS`
- `OPEN` → `BLOCKED`
- `IN_PROGRESS` → `BLOCKED`
- `IN_PROGRESS` → `RESOLVED`
- `BLOCKED` → `IN_PROGRESS`

Any other transition will return a 400 Bad Request.

### 7. AI Architecture (Grounding)
To ensure the AI uses REAL ticket data:
1. The user sends a prompt via the frontend to `POST /api/ai/chat`.
2. The backend Express server initializes an LLM session with a strict system prompt and defined tools:
   - `get_ticket({ ticketNumber })`
   - `search_tickets({ status, priority, assignee })`
   - `count_tickets({ status, priority })`
   - `get_ticket_statistics()`
   - `get_tickets_by_assignee({ name })`
3. If the LLM needs data to answer the prompt, it responds to the backend with a tool call request.
4. The backend executes the corresponding predefined Mongoose query (e.g., `Ticket.countDocuments({ status: 'OPEN', priority: 'HIGH' })`).
5. The backend sends the deterministic JSON result back to the LLM.
6. The LLM formulates a natural language response based *only* on the JSON result.
7. The backend returns the final text to the frontend.
*The LLM cannot execute arbitrary MongoDB queries; it is constrained strictly to the parameters defined in the tools.*

### 8. Security
- **Authentication:** JWT stored in an HttpOnly cookie or secure local storage, validated on every protected API route.
- **Authorization:** Middleware to ensure only `MANAGER` roles can assign tickets.
- **Input Validation:** Zod schemas used to validate all request bodies (`req.body`) before processing.
- **Secrets:** AI API keys, MongoDB URI, and JWT secret are kept in backend `.env` files and never exposed to the frontend.
- **AI Security:** Tool implementations construct safe Mongoose queries. No raw user input or LLM output is executed as a query directly (NoSQL injection prevention).

### 9. Testing Strategy
- **API Tests:** Use Postman or automated tests (Jest/Supertest) to verify CRUD operations, invalid status transitions, and validation errors.
- **Integration Tests:** Verify that creating a ticket accurately updates the dashboard stats.
- **AI Grounding Tests:** 
  1. Ask AI a specific query (e.g., count of high priority).
  2. Mutate a ticket in the database.
  3. Ask the same query and verify the answer reflects the new state.
- **Manual UI Verification:** Click through all flows (login, create ticket, assign, change status, view dashboard, chat with AI) to ensure a smooth, error-free UX.

### 10. Deployment
- **Frontend (Vercel):** Connected to the GitHub repo `frontend` directory. Environment variables set for `VITE_API_BASE_URL`.
- **Backend (Render):** Connected to the `backend` directory. Environment variables set for `MONGO_URI`, `JWT_SECRET`, `AI_API_KEY`, `PORT`, `FRONTEND_URL`.
- **Database (MongoDB Atlas):** Network access configured to allow Render IPs (or `0.0.0.0/0` with strong authentication).

### 11. Git Commit & Documentation Strategy
- Commit strictly per feature to show iterative progress:
  `chore: initialize project`
  `docs: add implementation plan`
  `feat: add ticket database models`
  ...
- **AI Development History:** Create a `docs/ai-history/` directory to store transcripts/summaries of interactions with AI agents at each phase (`01-planning.md`, `02-backend.md`, etc.).

### 12. Acceptance Criteria Checklist
- [ ] Application starts successfully locally
- [ ] Database connects securely via env variables
- [ ] User can register and log in
- [ ] User can create a ticket
- [ ] Tickets appear in the list with filters
- [ ] Ticket detail page displays all fields and activity timeline
- [ ] Ticket status can change (following allowed workflow)
- [ ] Invalid status transitions are rejected by the backend
- [ ] Manager can change ticket assignee
- [ ] Activity history is recorded for mutations
- [ ] Dashboard counts are real and correct
- [ ] AI chat loads and functions
- [ ] AI queries real database data using backend tools
- [ ] AI answers ticket # questions correctly
- [ ] AI answers count questions correctly
- [ ] AI handles nonexistent data gracefully
- [ ] AI does not hallucinate ticket information
- [ ] AI reflects newly changed ticket data after a DB update
- [ ] API keys/secrets are not exposed to the frontend
- [ ] Error states and loading states are handled in UI
- [ ] README is complete with setup and testing instructions
- [ ] PLAN.md is complete and reflects final implementation
- [ ] Git history contains meaningful feature-based commits
- [ ] AI histories are collected in `docs/ai-history/`
- [ ] Deployment/local setup is reproducible
