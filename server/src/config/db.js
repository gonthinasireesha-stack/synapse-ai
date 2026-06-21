// src/config/db.js
//
// WHY A CONNECTION POOL (not a single connection):
// Opening a new TCP connection to Postgres for every request is slow
// (TCP handshake + Postgres auth on every single query) and doesn't scale —
// Postgres has a hard limit on concurrent connections (default ~100).
//
// A "pool" pre-opens a set of connections and REUSES them across requests.
// When a request needs the DB, it borrows a connection from the pool,
// runs its query, and returns the connection — instead of opening a fresh one.

import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,                      // max simultaneous connections in the pool
  idleTimeoutMillis: 30000,     // close idle clients after 30s
  connectionTimeoutMillis: 5000 // fail fast if Postgres is unreachable
});

// Verify connectivity at startup — fail loudly if the DB is unreachable,
// rather than letting the first real user request mysteriously fail.
export async function verifyDbConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connected to Postgres');
  } catch (err) {
    console.error('❌ Failed to connect to Postgres:', err.message);
    process.exit(1);
  }
}

// Log unexpected errors on idle clients (e.g. DB restarted, network blip)
// so failures are visible in logs instead of silently swallowed.
pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err.message);
});