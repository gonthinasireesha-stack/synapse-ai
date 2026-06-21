-- Migration: 002_refresh_tokens.sql
-- Purpose: Track issued refresh tokens so they can be individually revoked
--          (logout, suspected compromise) without invalidating JWT signing
--          secrets globally.

CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT NOT NULL,         -- SHA-256 hash of the token, not the raw token
    expires_at      TIMESTAMP NOT NULL,
    revoked_at      TIMESTAMP,             -- NULL = still active
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);