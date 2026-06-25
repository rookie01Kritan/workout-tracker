// src/api/authApi.js
//
// This file is the ONLY place that knows the backend's URL and
// how auth requests are shaped. Components never call fetch()
// directly - they call these functions instead.

const BACKEND_URL = "http://localhost:5000";

// ── Register ──────────────────────────────────────────────────
// Returns { token, user } on success.
// Throws an Error with a readable message on failure.
export async function registerUser(name, email, password) {
  const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  // response.ok is false for any status outside 200-299 range
  // (e.g. 400, 409, 500). Our backend sends { error: "..." } in
  // those cases, so we surface that message instead of a generic one.
  if (!response.ok) {
    throw new Error(data.error || "Registration failed.");
  }

  return data; // { token, user }
}

// ── Login ─────────────────────────────────────────────────────
// Returns { token, user } on success.
// Throws an Error with a readable message on failure.
export async function loginUser(email, password) {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed.");
  }

  return data; // { token, user }
}