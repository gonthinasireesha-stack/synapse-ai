# Synapse AI

An AI-powered study assistant that lets users upload PDFs and chat with them
using a Retrieval-Augmented Generation (RAG) pipeline — built on a self-hosted
Postgres + pgvector stack rather than a managed vector database, to
demonstrate end-to-end ownership of the retrieval system.

> 🚧 Actively under development. See [Roadmap](#roadmap) for current phase.

## Why this project exists

Most "chat with your PDF" demos wrap a single API call to a hosted vector
search service. Synapse AI is built to demonstrate the *system* behind that
experience: chunking strategy, embedding generation, similarity search,
context-grounded prompt construction, and the database/API design that ties
it together — plus the production concerns (auth, validation, async
processing, error handling) that a real product needs.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) | Fast dev loop, component-based UI |
| Backend | Node.js + Express | REST API, async I/O suited to AI API calls |
| Database | PostgreSQL | Relational data — users, documents, chats, quizzes have clear FK relationships |
| Vector Search | pgvector | Co-locates embeddings with relational data; avoids unnecessary infra at this scale (see `docs/adr/`) |
| LLM / Embeddings | Google Gemini API | Single provider for generation + embeddings |
| Auth | JWT (access + refresh tokens) | Stateless, scalable session handling |

Architecture decisions are documented in [`docs/adr/`](./docs/adr) as
Architecture Decision Records — each one states the decision, the
alternatives considered, and the reasoning.

## Local Development Setup

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- A Gemini API key ([Google AI Studio](https://aistudio.google.com))

### 1. Clone and configure environment
```bash
git clone <your-repo-url>
cd synapse-ai
cp .env.example server/.env
# edit server/.env and fill in real values
```

### 2. Start Postgres (with pgvector)
```bash
docker compose up -d
docker compose ps   # wait until synapse-postgres shows "healthy"
```

### 3. Run the database migration
```bash
docker exec -i synapse-postgres psql -U synapse_user -d synapse_db < server/src/db/migrations/001_init_schema.sql
```

### 4. Install and run the server
```bash
cd server
npm install
npm run dev
# server runs on http://localhost:5000 — check http://localhost:5000/health
```

### 5. Install and run the client
```bash
cd client
npm install
npm run dev
# client runs on http://localhost:5173
```

## Project Structure