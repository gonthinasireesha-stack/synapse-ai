# ADR 002: Use pgvector instead of a managed vector database

## Status
Accepted

## Context
RAG requires storing embedding vectors and performing similarity search
over them (nearest-neighbor search) to retrieve relevant document chunks
for a given question. The two broad options are: a dedicated vector
database (Pinecone, Weaviate, Milvus, Qdrant), or a vector extension
inside the existing relational database (pgvector for Postgres).

## Decision
Use `pgvector` — embeddings live in the same Postgres database as all
other application data, in a `document_chunks` table with a `VECTOR(768)`
column.

## Alternatives Considered

**Managed vector DB (e.g. Pinecone)**
- Pro: purpose-built for vector search at large scale; horizontally
  scalable; managed infra (no ops burden)
- Con: introduces a second system to operate, authenticate against, and
  reason about — a second network hop on every chat request, a second
  failure mode, a second billing/auth surface
- Con: retrieval that needs to be filtered by relational fields (e.g.
  "only search chunks belonging to documents owned by this user") requires
  fetching IDs from one system and cross-referencing in another, or
  duplicating relational metadata into the vector DB's metadata fields
- Pro becomes irrelevant at our scale: a single user's personal document
  set is at most thousands of chunks, far below the point where a
  dedicated vector DB's scaling advantages matter

**pgvector (chosen)**
- Pro: one database, one connection pool, one query language. A similarity
  search can be combined with a relational `WHERE document_id = ... AND
  user_id = ...` filter in a single SQL query — no cross-system
  orchestration needed
- Pro: simpler local dev setup (one Docker container, not two)
- Con: at very large scale (millions of vectors, high QPS, multi-tenant
  sharding needs), a dedicated vector DB's distributed indexing would
  outperform a single Postgres instance
- Con: pgvector's index types (IVFFlat, HNSW) require some manual tuning
  knowledge that a managed vector DB might abstract away

## Consequences
- We avoid the operational overhead of a second backing service at our
  current scale.
- If the product needed to scale to many tenants with very large combined
  document corpora, this decision would be revisited — pgvector does not
  horizontally shard the way dedicated vector DBs do.
- Embeddings and relational data can be backed up, migrated, and
  transactionally updated together (e.g. deleting a document and its
  chunks happens atomically via `ON DELETE CASCADE`).