-- Migration: 001_init_schema.sql
-- Purpose: Initial schema for Synapse AI — users, documents, RAG chunks,
--          chat history, notes, and quizzes.

-- Enable pgvector extension (provides the VECTOR type + similarity operators)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================== USERS =====================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ===================== DOCUMENTS =====================
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    file_path       TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'processing'
                        CHECK (status IN ('processing', 'ready', 'failed')),
    page_count      INT,
    uploaded_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);

-- ===================== DOCUMENT CHUNKS (RAG core) =====================
CREATE TABLE document_chunks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_text      TEXT NOT NULL,
    chunk_index     INT NOT NULL,
    page_number     INT,
    embedding       VECTOR(768),  -- Gemini text-embedding-004 output dimension
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);
-- Note: vector similarity index (IVFFlat/HNSW) added later in Phase 3,
-- once we understand the data distribution — explained when we get there.

-- ===================== CHAT SESSIONS =====================
CREATE TABLE chat_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_document_id ON chat_sessions(document_id);
CREATE INDEX idx_sessions_user_id ON chat_sessions(user_id);

-- ===================== MESSAGES =====================
CREATE TABLE messages (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role                    VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content                 TEXT NOT NULL,
    retrieved_chunk_ids     UUID[],
    created_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_session_id ON messages(session_id);

-- ===================== NOTES =====================
CREATE TABLE notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_document_id ON notes(document_id);

-- ===================== QUIZZES =====================
CREATE TABLE quizzes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE quiz_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    options         JSONB NOT NULL,
    correct_option  CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D'))
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score           INT,
    answers         JSONB,
    attempted_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_attempts_quiz_id ON quiz_attempts(quiz_id);