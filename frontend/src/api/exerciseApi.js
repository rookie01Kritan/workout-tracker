// src/api/exerciseApi.js
//
// All functions here automatically attach the JWT token from
// localStorage as an Authorization header. Components never
// build this header themselves - they just call these functions.

const BACKEND_URL = "http://localhost:5000";

// ── Helper: build headers with the token attached ─────────────
function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

// ── Get all exercises for the logged-in user ──────────────────
export async function getExercises() {
  const response = await fetch(`${BACKEND_URL}/api/exercises`, {
    method:  "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load exercises.");
  }

  return data; // array of exercises
}

// ── Create a new exercise ─────────────────────────────────────
// exerciseData shape: { exerciseName, sets, reps, restTime,
//   muscleGroup, duration, category, audioSrc, audioName }
export async function createExercise(exerciseData) {
  const response = await fetch(`${BACKEND_URL}/api/exercises`, {
    method:  "POST",
    headers: getAuthHeaders(),
    body:    JSON.stringify(exerciseData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create exercise.");
  }

  return data; // the created exercise, including its real id
}

// ── Update an existing exercise ───────────────────────────────
// Can send a partial object - e.g. just { completed: true }
export async function updateExercise(id, exerciseData) {
  const response = await fetch(`${BACKEND_URL}/api/exercises/${id}`, {
    method:  "PUT",
    headers: getAuthHeaders(),
    body:    JSON.stringify(exerciseData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update exercise.");
  }

  return data;
}

// ── Delete an exercise ─────────────────────────────────────────
export async function deleteExercise(id) {
  const response = await fetch(`${BACKEND_URL}/api/exercises/${id}`, {
    method:  "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete exercise.");
  }

  return data;
}