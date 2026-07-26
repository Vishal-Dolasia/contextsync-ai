# ContextSyncAI — Detailed 15-Day Build & Deploy Guide

This expands your roadmap into a day-by-day execution plan: what to **learn**, what to **build**, specific **tasks/checklist items**, and the **deliverable** for each day. Follow it sequentially — each day depends on the previous one's output.

---

## Before Day 1 — Environment & Accounts Setup (do this first, ~2-3 hrs)

**Accounts to create:**
- MongoDB Atlas (free tier cluster)
- LiveKit Cloud (free tier — gives you API key/secret + WS URL)
- Deepgram (free credits) — or plan to self-host Whisper
- Groq or OpenAI API key
- GitHub account/repo
- Vercel account (frontend deploy)
- Render account (backend deploy)

**Local setup:**
- Node.js LTS (v20+), npm/pnpm
- VS Code + extensions: ESLint, Prettier, MongoDB for VS Code
- Postman or Thunder Client for API testing
- Git installed and configured

---

## Day 1 — Project Setup & Architecture

### Learn
- MERN-ish architecture basics (React + Express + MongoDB, no full MERN since you're using LiveKit instead of raw sockets)
- LiveKit core concepts at a glance (rooms, tokens — just conceptual, not implementation yet)
- Monorepo vs separate-repo structure for frontend/backend
- Environment variable management (`.env`, `dotenv`)

### Build
1. Create GitHub repo (`contextsync-ai`) with `/client` and `/server` folders (or two repos — your choice)
2. **Frontend:** `npm create vite@latest client -- --template react`, install Tailwind CSS (via Vite plugin), set up base folder structure (`components/`, `pages/`, `hooks/`, `services/`)
3. **Backend:** `npm init`, install `express`, `mongoose`, `dotenv`, `cors`, `nodemon`. Create `server.js` with a basic health-check route (`GET /api/health`)
4. Connect to MongoDB Atlas — test connection with a simple `mongoose.connect()` call, confirm in Atlas dashboard that a connection was made
5. Set up `.env` files for both client and server (add `.env` to `.gitignore`!)
6. Push initial commit

### Deliverable
Running React app (blank page ok) + Express server responding to `/api/health` + confirmed MongoDB connection.

---

## Day 2 — Authentication

### Learn
- JWT structure (header/payload/signature), access vs refresh tokens
- bcrypt hashing (salt rounds, why never store plain passwords)
- Express middleware pattern for route protection
- HttpOnly cookies vs localStorage for token storage (security tradeoffs)

### Build
1. **Schema:** `User` model — `name, email, passwordHash, role, createdAt`
2. **Backend routes:**
   - `POST /api/auth/register` — hash password with bcrypt, save user
   - `POST /api/auth/login` — verify password, issue JWT (short expiry, e.g. 15min access + refresh token, or a simpler single 7-day token for MVP)
   - Middleware: `authMiddleware.js` — verifies JWT from `Authorization: Bearer` header, attaches `req.user`
3. **Frontend:**
   - Register/Login forms with validation
   - Auth context/hook (`useAuth`) storing token + user state
   - Axios instance with interceptor to attach token to every request
   - Protected route wrapper component (redirects to login if no valid token)
4. Test: register a user, log in, hit a protected test route with the token

### Deliverable
Full register/login flow working end-to-end; protected routes reject unauthenticated requests (test in Postman).

---

## Day 3 — Client Management

### Learn
- MongoDB relationships: embedding vs referencing (`ObjectId` refs), when to use `.populate()`

### Build
1. **Schema:** `Client` model — `name, company, email, phone, notes, ownerUserId (ref User), createdAt`
2. **Backend routes** (all protected by auth middleware):
   - `POST /api/clients` (create)
   - `GET /api/clients` (list, scoped to logged-in user)
   - `GET /api/clients/:id` (detail)
   - `PUT /api/clients/:id` (update)
   - `DELETE /api/clients/:id`
3. **Frontend:**
   - Client list page (table/cards)
   - Create/Edit client modal or page with form
   - Client detail page (placeholder for meetings later)
   - Delete with confirmation dialog

### Deliverable
Full CRUD for clients, scoped per user, reflected live in UI.

---

## Day 4 — Meeting Management

### Learn
- Designing schemas for future extensibility (status enums, participant arrays)

### Build
1. **Schema:** `Meeting` model:
   ```
   title, clientId (ref Client), participants: [{name, email}],
   scheduledDate, status: enum['scheduled','live','completed','cancelled'],
   createdBy (ref User), recordingUrl, transcriptId, summaryId, createdAt
   ```
2. **Backend routes:**
   - `POST /api/meetings` — create meeting linked to a client
   - `GET /api/meetings` — list (filter by client, status, date)
   - `GET /api/meetings/:id` — detail
   - `PUT /api/meetings/:id` — update status/details
3. **Frontend:**
   - "Create Meeting" form (select client, add participants, set date)
   - Meeting list page with status badges
   - Meeting detail page shell (this becomes the "meeting room" hub from Day 5 onward)

### Deliverable
Users can create a meeting tied to a client, see it in a list, and open its detail page.

---

## Day 5 — LiveKit Integration (Live Video/Audio)

### Learn
- LiveKit core concepts: Rooms, Participants, Tracks, Access Tokens
- How token generation works (server signs a JWT-like token granting room access — different from your app's auth JWT)
- LiveKit React SDK (`@livekit/components-react`) or raw `livekit-client` SDK

### Build
1. **Backend:** `POST /api/livekit/token` — takes `meetingId` + user identity, generates a LiveKit access token using `livekit-server-sdk` (room name = meetingId)
2. **Frontend:**
   - Install `livekit-client` + `@livekit/components-react`
   - Build `MeetingRoom` component: fetch token → connect to LiveKit room → render `<LiveKitRoom>` with video/audio tracks
   - Add Camera toggle, Microphone toggle, Leave Room button
   - Update meeting `status` to `'live'` on join, `'completed'` on leave (or manual "End Meeting" button)

### Deliverable
Two browser tabs/users can join the same meeting room, see/hear each other, toggle camera/mic, and leave.

---

## Day 6 — Recording

### Learn
- LiveKit Egress API (cloud recording to file or S3-compatible storage)
- Where to store recording output (LiveKit Cloud storage, S3, or local disk for MVP)

### Build
1. **Backend:** `POST /api/livekit/recording/start` and `/stop` — use LiveKit Egress API to start/stop room composite recording
2. Store output reference (`recordingUrl`) on the `Meeting` document once recording completes (LiveKit sends a webhook on egress completion — set up `POST /api/webhooks/livekit`)
3. **Frontend:** Start/Stop Recording buttons in the meeting room UI, recording indicator

### Deliverable
Meeting produces a `meeting.webm` (or `.mp4`) file accessible via URL, linked to the meeting record.

---

## Day 7 — Transcription

### Learn
- Deepgram API (pre-recorded audio endpoint, diarization/speaker labels) — or Whisper API/self-hosted if avoiding Deepgram cost
- Handling large file uploads/processing asynchronously (don't block the request — use a background job or simple async function + polling)

### Build
1. **Backend:** `POST /api/meetings/:id/transcribe` — sends `recordingUrl` to Deepgram (with `diarize=true`) or Whisper, receives speaker-labeled transcript
2. **Schema:** `Transcript` model — `meetingId, segments: [{speaker, text, startTime, endTime}], fullText`
3. Store transcript in MongoDB, link `transcriptId` to the `Meeting`
4. **Frontend:** Transcript viewer component on meeting detail page (speaker-labeled, scrollable)

### Deliverable
Given a recorded meeting, generate and display a speaker-labeled transcript.

---

## Day 8 — AI Summary, Action Items, Decisions

### Learn
- Prompt engineering basics for structured extraction (asking an LLM to return JSON)
- Groq/OpenAI chat completions API, JSON mode / structured outputs

### Build
1. **Backend:** `POST /api/meetings/:id/summarize` — sends transcript to Groq/OpenAI with a prompt requesting JSON output:
   ```
   { summary, actionItems: [{task, owner, dueDate}], decisions: [], risks: [] }
   ```
2. **Schema:** `Summary` model — `meetingId, summary, actionItems[], decisions[], risks[], createdAt`
3. Parse and validate the JSON response (handle malformed output gracefully — retry or fallback)
4. **Frontend:** Summary tab on meeting detail page showing summary text + action items table + decisions list

### Deliverable
One-click "Generate Summary" button that produces a structured, readable meeting summary.

---

## Day 9 — Embeddings

### Learn
- What embeddings are (vector representations of text meaning)
- MongoDB Atlas Vector Search (creating a vector index on a collection)
- Chunking strategy (embed full summary vs transcript segments — start with summary-level embeddings for simplicity)

### Build
1. **Backend:** `POST /api/meetings/:id/embed` — generate embedding for the meeting summary (+ optionally transcript chunks) using an embedding model (OpenAI `text-embedding-3-small`, or Groq-compatible alternative)
2. **Schema:** add `embedding: [Number]` field to `Summary` (or a separate `Embeddings` collection)
3. In MongoDB Atlas, create a **Vector Search Index** on the embedding field (via Atlas UI, JSON index definition)

### Deliverable
Every summarized meeting has a stored embedding vector, and the Atlas vector index is live.

---

## Day 10 — Similar Meeting Search

### Learn
- `$vectorSearch` aggregation stage in MongoDB Atlas
- Cosine similarity / kNN search basics

### Build
1. **Backend:** `GET /api/meetings/:id/similar` — embed the current meeting's summary (or use existing embedding), run `$vectorSearch` aggregation against other meetings, return top-K matches with similarity scores
2. **Frontend:** "Similar Past Meetings" panel on meeting detail page showing matched meetings + relevance score

### Deliverable
Opening any meeting shows a ranked list of related past meetings.

---

## Day 11 — AI Chat with Previous Meetings (RAG)

### Learn
- RAG pattern end-to-end: query → embed query → vector search → inject retrieved context into LLM prompt → generate answer
- Prompt design for grounding answers strictly in retrieved context (reduce hallucination)

### Build
1. **Backend:** `POST /api/chat` — takes user question, embeds it, vector-searches across meeting summaries/transcripts (optionally scoped to one client), builds a context-stuffed prompt, calls LLM, returns answer + cited meeting sources
2. **Frontend:** Chat UI (message list + input box) — can be a global "Ask AI" page or embedded per-client
3. Test with real questions: "Did we discuss pricing with [Client]?", "Who owns the follow-up task from last week?"

### Deliverable
Working chat interface that answers questions grounded in past meeting data, with source citations.

---

## Day 12 — Proactive AI Suggestions

### Learn
- Designing "trigger points" for proactive surfacing (e.g., when a new meeting is created for a client, or when joining a live room)

### Build
1. **Backend:** `GET /api/meetings/:id/suggestions` — when a meeting starts (or client is selected), auto-run: similar meetings search + pull past action items still open + past decisions + flagged objections (simple keyword/LLM-tagged detection)
2. **Frontend:** "Before you start" panel shown when creating/joining a meeting: past decisions, open action items, past objections — surfaced automatically without the user asking

### Deliverable
Creating or joining a meeting automatically surfaces relevant history without any manual search.

---

## Day 13 — Dashboard

### Learn
- Aggregation pipelines for stats (counts, groupings by status/date)
- Chart library basics (Recharts or Chart.js) if adding visual stats

### Build
1. **Backend:** `GET /api/dashboard` — aggregate: recent meetings, pending action items across all meetings, meeting counts by status/week
2. **Frontend:**
   - Recent Meetings widget
   - Pending Action Items widget (with owner + due date)
   - Simple timeline/activity feed
   - Global search bar (meetings, clients, transcripts)
   - Basic stats cards/charts (meetings per week, avg duration, etc.)

### Deliverable
A single home dashboard summarizing everything at a glance.

---

## Day 14 — UI Polish

### Learn
- Tailwind responsive utilities (`sm:`, `md:`, `lg:`)
- Toast/notification libraries (e.g., `react-hot-toast`)
- Dark mode via Tailwind `dark:` class strategy

### Build
1. Responsive pass on every page (mobile/tablet breakpoints)
2. Loading skeletons/spinners for all async operations (transcription, summary generation, chat)
3. Toast notifications for success/error states (create/update/delete, API failures)
4. Dark mode toggle (persist preference in localStorage)
5. Global error boundary + friendly error pages (404, 500)
6. Form validation messages, empty states (e.g., "No meetings yet — create one")

### Deliverable
App feels production-ready: no dead spinners, no unstyled error states, works on mobile.

---

## Day 15 — Deployment

### Learn
- Environment variable management in production (Vercel/Render dashboards)
- CORS configuration for cross-origin frontend↔backend calls
- Basic production checklist (disable verbose error logs, rate limiting, HTTPS enforced)

### Build
1. **Backend → Render:**
   - Push server repo, create a new Web Service on Render
   - Set all env vars (Mongo URI, JWT secret, LiveKit keys, Deepgram/OpenAI/Groq keys)
   - Confirm health-check route responds
2. **Frontend → Vercel:**
   - Connect repo, set build command (`npm run build`), output dir (`dist`)
   - Set `VITE_API_URL` env var pointing to Render backend URL
3. **Database:** confirm MongoDB Atlas network access allows Render's IP (or `0.0.0.0/0` for MVP, tighten later)
4. Update CORS on backend to allow the deployed Vercel domain
5. Smoke-test the full flow in production: register → create client → create meeting → join room → record → transcribe → summarize → chat

### Deliverable
Live, publicly accessible app: Frontend on Vercel, Backend on Render, DB on Atlas — fully working end-to-end.

---

## Post-Launch: Future Enhancements (from your roadmap)
Once the MVP is stable, tackle in this rough priority order:
1. Calendar Integration (schedule meetings directly)
2. Gmail/Slack Integration (share summaries automatically)
3. CRM Integration (sync clients/action items)
4. Multi-language Transcription
5. Zoom/Teams Bot (meet users where they already are)
6. Voice AI Assistant (real-time in-meeting assistant)
7. Document Linking (attach contracts/proposals to meetings)

---

## Quick Daily Checklist Template
Use this each day to stay on track:
- [ ] Read/watch the day's "Learn" topics (30-45 min max — don't over-research)
- [ ] Build the listed features
- [ ] Test manually (Postman for API, browser for UI)
- [ ] Commit + push to GitHub with a clear message
- [ ] Note any blockers to revisit tomorrow
