// src/repositories/userRepository.js
//
// WHY THIS FILE EXISTS:
// The ONLY place in the entire app allowed to write SQL queries against
// the `users` table. Services call these functions — they never see SQL.
// This keeps business logic (services) decoupled from data access details.

import { pool } from '../config/db.js';

// Find a user by email — used during signup (check for duplicates)
// and login (look up the account to verify password against).
export async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null; // null if no match, not undefined — explicit "not found"
}

// Find a user by ID — used by auth middleware to attach the current
// user to req.user after verifying their access token.
export async function findUserById(id) {
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Create a new user — called during signup, AFTER the password has
// already been hashed by the service layer (this function never sees
// a plaintext password).
export async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}