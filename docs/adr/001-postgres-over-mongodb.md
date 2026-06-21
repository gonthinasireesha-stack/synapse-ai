# ADR 001: Use PostgreSQL instead of MongoDB

## Status
Accepted

## Context
The previous project (Smart Expense Tracker) used MongoDB. Synapse AI's
core entities — users, documents, chat sessions, messages, notes, quizzes,
quiz attempts — have explicit one-to-many relationships with each other
(a User has many Documents, a Document has many ChatSessions, a
ChatSession has many Messages, etc.), and several features require
querying across these relationships at once (e.g. "all quiz attempts for
a user, with the document title and quiz title joined in").

## Decision
Use PostgreSQL as the primary database for all relational/structured data.

## Alternatives Considered

**MongoDB (continue using what we know)**
- Pro: faster initial velocity, no new paradigm to learn
- Con: no native foreign key enforcement — referential integrity (e.g. "a
  Document must belong to an existing User") would have to be manually
  enforced in application code, which is more error-prone
- Con: multi-collection joins in MongoDB ($lookup aggregation stages) are
  more verbose and less performant than SQL JOINs for this access pattern
- Con: doesn't extend naturally to vector search (no first-class vector
  type/index), which would force a separate vector DB anyway

**PostgreSQL (chosen)**
- Pro: foreign keys + CHECK constraints give data integrity guarantees at
  the database level, not just in application code
- Pro: JOIN-heavy queries (dashboard aggregation, quiz history with
  document titles) are a natural fit
- Pro: extensible via `pgvector`, letting us avoid a second database
  system for vector search (see ADR 002)
- Con: requires learning a new paradigm (schemas, migrations, SQL) —
  accepted as a deliberate learning goal for this project

## Consequences
- Schema changes require explicit migrations (versioned `.sql` files),
  rather than MongoDB's implicit schema flexibility. This is intentional —
  it forces deliberate, reviewable schema evolution.
- We gain the ability to enforce data integrity (cascading deletes, enum
  constraints via CHECK) at the database layer, reducing the surface area
  for application-level bugs.