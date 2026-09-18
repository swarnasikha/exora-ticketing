# Agent 4 - AI Chat Integration

## Task
Implement the deterministic AI Chat module using function/tool calling. Ensure the LLM never invents ticket data and exclusively uses server-side data from MongoDB.

## Actions Taken
1. **Backend Configuration:**
   - Installed `@google/genai` to utilize the Gemini 2.5 Pro API.
   - Set up `AI_API_KEY` in the environment configuration.
2. **Deterministic Tools (`ai/ticketTools.js`):**
   - Implemented exact Mongoose queries required for the assignment examples:
     - `count_tickets`: Aggregates ticket count by `status` and `priority`.
     - `get_ticket`: Fetches specific ticket details by `ticketNumber`.
     - `search_tickets`: General purpose list search.
     - `get_tickets_by_assignee`: Regex matches the assignee name and fetches their tickets.
     - `get_ticket_statistics`: Returns dashboard-level ticket statistics.
3. **AI Service Orchestration (`ai/aiService.js`):**
   - Set up the Gemini client with strict `systemInstruction` parameters to forbid hallucinations.
   - Registered the `functionDeclarations` for all Mongoose tools.
   - Built a deterministic loop: When the user prompts the AI, the AI returns a `functionCall`. The backend parses this, executes the `ticketTools.js` function against MongoDB, and feeds the `functionResponse` back into Gemini to generate the final human-readable string.
4. **Frontend Implementation (`pages/AIChat.jsx`):**
   - Built a sleek, conversational chat interface featuring loading states, scrolling, and user/assistant avatars.
   - Hooked up the `API_URL/ai/chat` endpoint to process messages.
   - Configured `App.jsx` to render the component correctly at `/ai-chat`.

## Crucial Note
To test the AI functionality, an active `AI_API_KEY` for Google Gemini is required. It must be provided in `backend/.env`.
