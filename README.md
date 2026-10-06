# ContextSyncAI

ContextSyncAI is an AI-powered meeting assistant that captures LiveKit meeting conversations, stores transcripts, generates structured AI summaries, creates transcript embeddings, and lets users ask meeting-specific questions using retrieval-augmented generation.

Meeting information often becomes difficult to search and reuse after a call ends. ContextSyncAI turns meeting conversations into structured, searchable knowledge so users can revisit what was said, review action items, and query meeting content with AI.

## Features

The current codebase implements:

- User registration and login with JWT authentication.
- Optional registration lock controlled by `ALLOW_REGISTRATION`.
- Protected frontend routes for dashboard, clients, meetings, meeting rooms, transcripts, and summaries.
- Client CRUD with owner scoping, search, and sorting.
- Meeting CRUD with owner scoping, client association, search, and sorting.
- LiveKit room joining from the React app using server-generated LiveKit access tokens.
- LiveKit agent dispatch when a user joins a meeting room.
- Deepgram-based speech-to-text transcription inside the LiveKit agent.
- Transcript persistence in MongoDB after the LiveKit agent shuts down.
- AI meeting summary generation with Groq.
- Structured summary fields: summary, action items, key decisions, risks, and next steps.
- Transcript chunking and embedding generation after transcript persistence.
- Embedding storage in MongoDB.
- Meeting-specific RAG question answering using MongoDB Atlas Vector Search and Groq.
- Separate deployable frontend, backend, and LiveKit agent packages.

Current limitations and postponed work:

- The recording route exists as a stub and does not currently start or manage LiveKit recordings.
- The `/api/ai/ask` backend route is called by the authenticated client, but the route itself does not currently enforce `authMiddleware`.
- There is no root-level monorepo script; each app is installed and run from its own folder.
- Automated tests are not currently implemented. The default `test` scripts are placeholders.

## How It Works

```text
User
  |
  v
React Frontend
  |
  v
Express Backend
  |
  v
LiveKit Meeting
  |
  v
LiveKit Agent
  |
  v
Deepgram
  |
  v
Transcript
  |
  v
AI Summary
  |
  v
Embeddings
  |
  v
Vector Search
  |
  v
RAG
  |
  v
AI Answer
```

1. A user logs in through the React frontend. The backend validates credentials and returns a JWT.
2. The user creates clients and meetings. Meetings can be associated with client records.
3. When the user joins a meeting, the frontend requests a LiveKit token from `POST /api/livekit/token`.
4. The backend creates a LiveKit access token and dispatches the LiveKit agent named `contextsync-transcriber` into the room.
5. The LiveKit agent subscribes to participant audio tracks and streams audio frames to Deepgram STT.
6. Final transcription events are collected as transcript entries containing speaker, text, and timestamp.
7. When the agent shuts down, it saves the transcript document to MongoDB using the LiveKit room name as the meeting id.
8. After saving the transcript, the agent calls backend internal endpoints to generate a summary and embeddings.
9. The backend sends the transcript to Groq to produce structured JSON summary data.
10. The backend chunks the transcript, generates embeddings with `Xenova/all-MiniLM-L6-v2`, and stores each embedded chunk in MongoDB.
11. When the user asks a question, the backend embeds the question, retrieves the top matching chunks with MongoDB Atlas `$vectorSearch`, and sends those chunks to Groq as the only context for answer generation.

## System Architecture

### Frontend

The frontend is a React and Vite application in `client/`. It uses:

- `react-router-dom` for routes.
- Axios for backend communication.
- `@livekit/components-react` and `livekit-client` for the meeting room UI.
- Tailwind CSS styling through the Vite/Tailwind setup.
- `VITE_API_URL` to point API calls at the deployed or local backend.

The production frontend is intended to run on Vercel. `client/vercel.json` rewrites all routes to `index.html` so direct navigation to React routes works after deployment.

### Backend

The backend is a Node.js and Express API in `server/`. It uses:

- Express 5 for API routing.
- MongoDB and Mongoose for users, clients, meetings, transcripts, summaries, and embeddings.
- JWT authentication for protected user routes.
- LiveKit server SDK for meeting access token generation and agent dispatch.
- Groq for summary generation and RAG answer generation.
- Hugging Face Transformers for local embedding generation with `Xenova/all-MiniLM-L6-v2`.
- MongoDB Atlas Vector Search through an aggregation pipeline using `$vectorSearch`.

The production backend is intended to run on Render.

### LiveKit Agent

The agent is a separate Node.js app in `agent/`. It uses:

- `@livekit/agents` for the LiveKit worker/agent runtime.
- `@livekit/agents-plugin-deepgram` for speech-to-text.
- `@livekit/rtc-node` to subscribe to audio tracks.
- Mongoose to save transcripts directly to MongoDB.

The backend dispatches the agent into a room using the LiveKit server SDK. The agent name configured in code is:

```text
contextsync-transcriber
```

After a meeting ends and the agent shuts down, the agent saves the transcript and then calls:

- `POST /api/meetings/:id/generate-summary`
- `POST /api/meetings/:id/generate-embeddings`

These endpoints use `agentMiddleware`, which expects an `x-agent-secret` header matching `AGENT_INTERNAL_SECRET`.

The agent uses an internal secret instead of a user's JWT because this is server-to-server work. The agent is not acting as an interactive browser user, and it may need to finish background processing after the user leaves the room. A shared internal secret keeps those automation endpoints separate from user-scoped API access.

## Project Structure

```text
contextsync-ai/
|-- agent/
|   |-- index.js
|   |-- Dockerfile
|   |-- package.json
|   |-- db/
|   |   `-- connect.js
|   |-- models/
|   |   `-- transcript.model.js
|   |-- agents/
|   |   `-- transcription.agent.js
|   |-- services/
|   |   `-- deepgram.service.js
|   `-- config/
|       `-- config.js
|-- client/
|   |-- package.json
|   |-- vite.config.js
|   |-- vercel.json
|   |-- index.html
|   |-- public/
|   `-- src/
|       |-- api/
|       |   `-- api.js
|       |-- components/
|       |   `-- ProtectedRoute.jsx
|       |-- context/
|       |   `-- AuthContext.jsx
|       |-- hooks/
|       |   `-- useAuth.js
|       |-- pages/
|       |   |-- Login.jsx
|       |   |-- Register.jsx
|       |   |-- Dashboard.jsx
|       |   |-- Clients.jsx
|       |   |-- Meetings.jsx
|       |   |-- MeetingRoom.jsx
|       |   |-- Transcript.jsx
|       |   `-- Summary.jsx
|       |-- App.jsx
|       `-- main.jsx
|-- server/
|   |-- server.js
|   |-- package.json
|   |-- config/
|   |   `-- ai.config.js
|   |-- middleware/
|   |   |-- auth.middleware.js
|   |   `-- agent.middleware.js
|   |-- models/
|   |   |-- user.model.js
|   |   |-- client.model.js
|   |   |-- meeting.model.js
|   |   |-- transcript.model.js
|   |   |-- summary.model.js
|   |   `-- embedding.model.js
|   |-- routes/
|   |   |-- auth.routes.js
|   |   |-- client.routes.js
|   |   |-- meeting.routes.js
|   |   |-- livekit.routes.js
|   |   |-- ai.routes.js
|   |   `-- recording.routes.js
|   `-- services/
|       |-- ai.service.js
|       |-- chunking.services.js
|       |-- embedding.services.js
|       |-- embeddingPipeline.services.js
|       |-- rag.services.js
|       `-- retriveval.services.js
|-- .gitignore
`-- README.md
```

## Backend API

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Registration is allowed only when `ALLOW_REGISTRATION=true`.

### Clients

All client routes use JWT authentication.

```text
POST   /api/clients
GET    /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
DELETE /api/clients/:id
```

The list endpoint supports:

```text
?search=
?sort=az|za|newest|oldest
```

### Meetings

User-facing meeting routes use JWT authentication.

```text
POST   /api/meetings
GET    /api/meetings
GET    /api/meetings/:id
PATCH  /api/meetings/:id
DELETE /api/meetings/:id
GET    /api/meetings/:id/transcript
GET    /api/meetings/:id/summary
```

Agent-only processing routes use `x-agent-secret`:

```text
POST /api/meetings/:id/generate-summary
POST /api/meetings/:id/generate-embeddings
```

### LiveKit

```text
POST /api/livekit/token
```

This route requires JWT authentication. It returns a LiveKit room token and the configured LiveKit server URL.

### AI/RAG

```text
POST /api/ai/ask
```

Request body:

```json
{
  "meetingId": "MEETING_ID",
  "question": "What were the next steps?"
}
```

Response body:

```json
{
  "answer": "..."
}
```

## Data Models

The backend currently stores:

- `User`: name, email, password hash, role.
- `Client`: contact details, company, notes, owner.
- `Meeting`: title, description, date, time, status, client reference, owner.
- `Transcript`: meeting id and transcript entries with speaker, text, timestamp.
- `Summary`: meeting id, summary, action items, key decisions, risks, next steps.
- `Embedding`: meeting id, chunk index, chunk text, numeric embedding vector, start time, end time.

## AI and RAG Pipeline

### Summary generation

`server/services/ai.service.js` sends the transcript to Groq using `GROQ_CHAT_MODEL`, which defaults to:

```text
openai/gpt-oss-120b
```

The prompt requires valid JSON with:

```json
{
  "summary": "...",
  "actionItems": [],
  "keyDecisions": [],
  "risks": [],
  "nextSteps": []
}
```

The result is saved in the `Summary` collection.

### Embedding generation

`server/services/embedding.services.js` loads:

```text
Xenova/all-MiniLM-L6-v2
```

through `@huggingface/transformers` with mean pooling and normalization. Transcript chunks are created in `server/services/chunking.services.js` with a character limit of 1200.

Each stored embedding includes:

- meeting id
- chunk index
- chunk text
- embedding vector
- chunk start timestamp
- chunk end timestamp

### Retrieval and answer generation

`server/services/retriveval.services.js` embeds the user's question and runs MongoDB aggregation with `$vectorSearch`:

```js
{
  $vectorSearch: {
    index: "vector_index",
    path: "embedding",
    queryVector,
    numCandidates: 20,
    limit: 3,
    filter: {
      meetingId
    }
  }
}
```

The filter keeps retrieval scoped to the selected meeting. `server/services/rag.services.js` then sends the retrieved chunk text to Groq and instructs the model to answer only from the provided meeting context.

## Environment Variables

### `server/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ALLOW_REGISTRATION=true
LIVEKIT_URL=your_livekit_cloud_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
GROQ_API_KEY=your_groq_api_key
GROQ_CHAT_MODEL=openai/gpt-oss-120b
AGENT_INTERNAL_SECRET=shared_secret_for_agent_internal_calls
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

For production, set this to the Render backend URL.

### `agent/.env`

```env
MONGO_URI=your_mongodb_connection_string
LIVEKIT_URL=your_livekit_cloud_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
DEEPGRAM_API_KEY=your_deepgram_api_key
BACKEND_URL=http://localhost:5000
AGENT_INTERNAL_SECRET=shared_secret_for_agent_internal_calls
```

`AGENT_INTERNAL_SECRET` must match between the backend and the agent.

## Local Development

Install dependencies separately for each app:

```bash
cd server
npm install

cd ../client
npm install

cd ../agent
npm install
```

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Start the LiveKit agent in development mode:

```bash
cd agent
npm run dev
```

The frontend reads the backend URL from `VITE_API_URL`. The backend and agent both need access to the same MongoDB database so the meeting id, transcript, summary, and embedding records line up.

## MongoDB Atlas Vector Search

The RAG implementation expects a MongoDB Atlas Vector Search index named:

```text
vector_index
```

The index should target the `embedding` field in the embeddings collection. The embedding vectors are generated by `Xenova/all-MiniLM-L6-v2`, so the Atlas index dimensions must match that model's output.

The retrieval code filters by `meetingId`, so embeddings must be generated successfully for a meeting before question answering can return relevant answers.

## Deployment

### Frontend on Vercel

Deploy the `client/` folder as the Vercel project.

Recommended settings:

```text
Build command: npm run build
Output directory: dist
Environment: VITE_API_URL=<Render backend URL>
```

`client/vercel.json` already includes an SPA rewrite to support React routes.

### Backend on Render

Deploy the `server/` folder as a Node.js service.

Recommended settings:

```text
Build command: npm install
Start command: npm start
Environment: MONGO_URI, JWT_SECRET, ALLOW_REGISTRATION, LIVEKIT_URL,
             LIVEKIT_API_KEY, LIVEKIT_API_SECRET, GROQ_API_KEY,
             AGENT_INTERNAL_SECRET
```

### LiveKit Agent

Deploy the `agent/` folder as the LiveKit agent service. The included `agent/Dockerfile` can be used for container-based deployment.

The agent needs:

- LiveKit credentials.
- Deepgram API key.
- MongoDB connection string.
- Backend URL.
- The same `AGENT_INTERNAL_SECRET` used by the backend.

## Security Notes

- User-facing protected routes use JWT bearer tokens.
- Passwords are hashed with bcrypt before storage.
- Agent-only processing routes are protected with `x-agent-secret`.
- The internal agent secret should be long, random, and stored only as an environment variable.
- In production, `ALLOW_REGISTRATION` can be set to `false` to prevent open signups.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Axios
- LiveKit React Components
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- LiveKit Cloud
- LiveKit Agents
- Deepgram
- Groq
- Hugging Face Transformers
- MongoDB Atlas Vector Search

