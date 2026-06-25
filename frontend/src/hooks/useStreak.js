// src/hooks/useStreak.js

import { useState, useEffect } from "react";

const STORAGE_KEY = "workout_streak_dates";

// ── Helpers ────────────────────────────────────────────────────

// Get today's date as "YYYY-MM-DD" string
function getTodayString() {
  const today = new Date();
  return formatDate(today);
}

// Format any Date object as "YYYY-MM-DD"
function formatDate(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get yesterday's date string
function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

// Load completed dates array from localStorage
function loadDates() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save completed dates array to localStorage
function saveDates(dates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch (err) {
    console.error("Failed to save streak dates:", err);
  }
}

// ── Calculate current streak ────────────────────────────────
// Counts consecutive days backward from today (or yesterday)
function calculateStreak(dates) {
  if (dates.length === 0) return 0;

  const dateSet   = new Set(dates);
  const today     = getTodayString();
  const yesterday = getYesterdayString();

  // Streak must include today OR yesterday to still be "alive"
  let cursor;
  if (dateSet.has(today)) {
    cursor = new Date();
  } else if (dateSet.has(yesterday)) {
    cursor = new Date();
    cursor.setDate(cursor.getDate() - 1);
  } else {
    // Neither today nor yesterday done — streak is broken
    return 0;
  }

  let streak = 0;
  // Walk backward day by day while dates exist in the set
  while (dateSet.has(formatDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

// ── Main hook ────────────────────────────────────────────────
export default function useStreak() {
  const [completedDates, setCompletedDates] = useState(() => loadDates());

  // Save to localStorage whenever dates change
  useEffect(() => {
    saveDates(completedDates);
  }, [completedDates]);

  // Call this when workout is 100% complete
  function markTodayComplete() {
    const today = getTodayString();
    setCompletedDates((prev) => {
      if (prev.includes(today)) return prev; // already marked
      return [...prev, today];
    });
  }

  // Call this if workout is unmarked (uncompleted) on same day
  function unmarkToday() {
    const today = getTodayString();
    setCompletedDates((prev) => prev.filter((d) => d !== today));
  }

  const currentStreak  = calculateStreak(completedDates);
  const isCompletedToday = completedDates.includes(getTodayString());

  return {
    currentStreak,
    completedDates,
    isCompletedToday,
    markTodayComplete,
    unmarkToday,
  };
}