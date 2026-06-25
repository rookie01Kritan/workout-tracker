// src/components/StreakCounter.jsx

import React from "react";

// ── Flame icon (SVG) ──────────────────────────────────────────
function FlameIcon({ color, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2c-1 3-5 5-5 10a5 5 0 0 0 10 0c0-2-1-3-1-3s0 2-1.5 2c-1 0-1-1-1-2 0-2 2-3 2-6 0 0-2 1-2-1 0-1-1-2-1.5 0z" />
    </svg>
  );
}

export default function StreakCounter({ currentStreak, isCompletedToday, isDark }) {
  const theme = isDark ? darkTheme : lightTheme;

  // Flame color gets warmer with longer streaks
  const flameColor =
    currentStreak === 0  ? theme.flameOff   :
    currentStreak < 3    ? "#fbbf24"        :
    currentStreak < 7    ? "#f97316"        :
                            "#ef4444";

  return (
    <div style={{
      ...styles.wrap,
      background: theme.wrapBg,
      border:     `1.5px solid ${theme.wrapBorder}`,
    }}>

      {/* Flame + number */}
      <div style={styles.left}>
        <FlameIcon color={flameColor} />
        <div style={styles.textBlock}>
          <span style={{
            ...styles.streakNum,
            color: theme.numColor,
          }}>
            {currentStreak} day{currentStreak !== 1 ? "s" : ""}
          </span>
          <span style={{
            ...styles.streakLabel,
            color: theme.labelColor,
          }}>
            {currentStreak === 0
              ? "Start your streak today"
              : "Current streak"
            }
          </span>
        </div>
      </div>

      {/* Today status badge */}
      <div style={{
        ...styles.todayBadge,
        background: isCompletedToday ? theme.doneBg : theme.pendingBg,
        color:      isCompletedToday ? theme.doneColor : theme.pendingColor,
      }}>
        {isCompletedToday ? "Done today" : "Not done yet"}
      </div>

    </div>
  );
}

// ── Light theme ───────────────────────────────────────────────
const lightTheme = {
  wrapBg:      "#ffffff",
  wrapBorder:  "#e0f2fe",
  numColor:    "#0c4a6e",
  labelColor:  "#64748b",
  flameOff:    "#cbd5e1",
  doneBg:      "#d1fae5",
  doneColor:   "#059669",
  pendingBg:   "#fef3c7",
  pendingColor:"#b45309",
};

// ── Dark theme ────────────────────────────────────────────────
const darkTheme = {
  wrapBg:      "#1e293b",
  wrapBorder:  "#334155",
  numColor:    "#e2e8f0",
  labelColor:  "#94a3b8",
  flameOff:    "#475569",
  doneBg:      "#064e3b",
  doneColor:   "#6ee7b7",
  pendingBg:   "#451a03",
  pendingColor:"#fbbf24",
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  wrap: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "12px 16px",
    borderRadius:   "14px",
    marginBottom:   "1.5rem",
    transition:     "all 0.3s",
  },
  left: {
    display:    "flex",
    alignItems: "center",
    gap:        "10px",
  },
  textBlock: {
    display:       "flex",
    flexDirection: "column",
    gap:           "1px",
  },
  streakNum: {
    fontSize:   "16px",
    fontWeight: 700,
    transition: "color 0.3s",
  },
  streakLabel: {
    fontSize:   "11px",
    transition: "color 0.3s",
  },
  todayBadge: {
    fontSize:     "11px",
    fontWeight:   600,
    borderRadius: "20px",
    padding:      "5px 12px",
    transition:   "all 0.3s",
  },
};