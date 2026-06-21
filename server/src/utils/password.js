// src/utils/password.js
//
// WHY WE NEVER STORE PLAINTEXT PASSWORDS:
// If the database is ever breached (and breaches happen even to
// careful teams), plaintext passwords would let an attacker log in
// as every user immediately — and since people reuse passwords across
// sites, it compromises their other accounts too.
//
// We store a HASH instead — a one-way transformation. You can check
// "does this password match the hash?" but you cannot reverse a hash
// back into the original password.

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// Hash a plaintext password before storing it.
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

// Compare a plaintext password (from a login attempt) against a stored hash.
// Returns true/false — never reveals anything about the original password.
export async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}