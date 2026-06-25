// src/components/WorkoutHistory.jsx

import React from "react";

// ── Helpers ────────────────────────────────────────────────────

// Format Date as "YYYY-MM-DD"
function formatDate(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format date for tooltip display, e.g. "Jun 23, 2026"
function formatTooltip(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

// Build array of last N days, oldest first
function buildDayGrid(numDays) {
  const days = [];
  const today = new Date();

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(formatDate(d));
  }

  return days;
}

// Group days into weeks (columns of 7) for GitHub-style layout
function groupIntoWeeks(days) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export default function WorkoutHistory({ completedDates, isDark }) {
  const theme = isDark ? darkTheme : lightTheme;

  // Show last 84 days (12 weeks) like GitHub
  const allDays = buildDayGrid(84);
  const weeks   = groupIntoWeeks(allDays);
  const dateSet = new Set(completedDates);

  const totalCompleted = completedDates.length;

  return (
    <div style={{
      ...styles.wrap,
      background: theme.wrapBg,
      border:     `1.5px solid ${theme.wrapBorder}`,
    }}>

      {/* Header */}
      <div style={styles.header}>
        <span style={{
          ...styles.title,
          color: theme.titleColor,
        }}>
          Workout History
        </span>
        <span style={{
          ...styles.subtitle,
          color: theme.subtitleColor,
        }}>
          {totalCompleted} workout{totalCompleted !== 1 ? "s" : ""} in last 12 weeks
        </span>
      </div>

      {/* Grid */}
      <div style={styles.gridScroll}>
        <div style={styles.grid}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} style={styles.weekColumn}>
              {week.map((dateStr) => {
                const isDone = dateSet.has(dateStr);
                return (
                  <div
                    key={dateStr}
                    title={`${formatTooltip(dateStr)} — ${isDone ? "Workout done" : "No workout"}`}
                    style={{
                      ...styles.daySquare,
                      background: isDone
                        ? theme.doneSquare
                        : theme.emptySquare,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <span style={{ ...styles.legendText, color: theme.subtitleColor }}>
          Less
        </span>
        <div style={{ ...styles.legendSquare, background: theme.emptySquare }} />
        <div style={{ ...styles.legendSquare, background: theme.doneSquare }} />
        <span style={{ ...styles.legendText, color: theme.subtitleColor }}>
          More
        </span>
      </div>

    </div>
  );
}

// ── Light theme ───────────────────────────────────────────────
const lightTheme = {
  wrapBg:      "#ffffff",
  wrapBorder:  "#e0f2fe",
  titleColor:  "#0c4a6e",
  subtitleColor: "#64748b",
  emptySquare: "#e2e8f0",
  doneSquare:  "#34d399",
};

// ── Dark theme ────────────────────────────────────────────────
const darkTheme = {
  wrapBg:      "#1e293b",
  wrapBorder:  "#334155",
  titleColor:  "#e2e8f0",
  subtitleColor: "#94a3b8",
  emptySquare: "#334155",
  doneSquare:  "#34d399",
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  wrap: {
    borderRadius: "14px",
    padding:      "14px 16px",
    marginBottom: "1.5rem",
    transition:   "all 0.3s",
  },
  header: {
    display:       "flex",
    flexDirection: "column",
    gap:           "2px",
    marginBottom:  "10px",
  },
  title: {
    fontSize:   "14px",
    fontWeight: 700,
  },
  subtitle: {
    fontSize: "11px",
  },
  gridScroll: {
    overflowX:  "auto",
    paddingBottom: "4px",
  },
  grid: {
    display: "flex",
    gap:     "3px",
  },
  weekColumn: {
    display:       "flex",
    flexDirection: "column",
    gap:           "3px",
  },
  daySquare: {
    width:        "10px",
    height:       "10px",
    borderRadius: "2px",
    transition:   "background 0.3s",
  },
  legend: {
    display:    "flex",
    alignItems: "center",
    gap:        "4px",
    marginTop:  "8px",
    justifyContent: "flex-end",
  },
  legendText: {
    fontSize: "10px",
  },
  legendSquare: {
    width:        "10px",
    height:       "10px",
    borderRadius: "2px",
  },
};