// src/components/WorkoutStats.jsx

import React from "react";

export default function WorkoutStats({ total, completed, isDark }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  // ── Theme colors ──────────────────────────────────────────
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <div style={styles.wrap}>

      {/* Stat pills */}
      <div style={styles.pills}>

        <div style={{
          ...styles.pill,
          background: theme.pillBg,
          border:     `1px solid ${theme.pillBorder}`,
        }}>
          <span style={{
            ...styles.pillNum,
            color: theme.pillNumColor,
          }}>
            {completed}
          </span>
          <span style={{
            ...styles.pillLabel,
            color: theme.pillLabelColor,
          }}>
            Done
          </span>
        </div>

        <div style={{
          ...styles.pill,
          background: theme.pillBg,
          border:     `1px solid ${theme.pillBorder}`,
        }}>
          <span style={{
            ...styles.pillNum,
            color: theme.pillNumColor,
          }}>
            {total - completed}
          </span>
          <span style={{
            ...styles.pillLabel,
            color: theme.pillLabelColor,
          }}>
            Remaining
          </span>
        </div>

        <div style={{
          ...styles.pill,
          background: theme.highlightPillBg,
          border:     `1px solid ${theme.highlightPillBorder}`,
        }}>
          <span style={{
            ...styles.pillNum,
            color: theme.highlightNumColor,
          }}>
            {pct}%
          </span>
          <span style={{
            ...styles.pillLabel,
            color: theme.pillLabelColor,
          }}>
            Complete
          </span>
        </div>

      </div>

      {/* Progress bar */}
      <div style={styles.trackWrap}>
        <div style={{
          ...styles.track,
          background: theme.trackBg,
        }}>
          <div style={{
            ...styles.fill,
            width: `${pct}%`,
          }} />
        </div>

        {/* Progress label */}
        <div style={styles.progressLabel}>
          <span style={{ color: theme.pillLabelColor }}>
            {completed} of {total} exercises done
          </span>
          <span style={{ color: theme.highlightNumColor }}>
            {pct}%
          </span>
        </div>
      </div>

    </div>
  );
}

// ── Light theme ───────────────────────────────────────────────
const lightTheme = {
  pillBg:               "#f0f9ff",
  pillBorder:           "#e0f2fe",
  pillNumColor:         "#1a1917",
  pillLabelColor:       "#888780",
  highlightPillBg:      "linear-gradient(135deg, #e0f2fe, #d1fae5)",
  highlightPillBorder:  "#7dd3fc",
  highlightNumColor:    "#0369a1",
  trackBg:              "#e0f2fe",
};

// ── Dark theme ────────────────────────────────────────────────
const darkTheme = {
  pillBg:               "#1e293b",
  pillBorder:           "#334155",
  pillNumColor:         "#e2e8f0",
  pillLabelColor:       "#94a3b8",
  highlightPillBg:      "linear-gradient(135deg, #0c2340, #0c2318)",
  highlightPillBorder:  "#334155",
  highlightNumColor:    "#7dd3fc",
  trackBg:              "#1e293b",
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  wrap: {
    marginBottom: "1.5rem",
    display:      "flex",
    flexDirection:"column",
    gap:          "10px",
  },
  pills: {
    display: "flex",
    gap:     "8px",
  },
  pill: {
    flex:          1,
    borderRadius:  "12px",
    padding:       "12px 8px",
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           "2px",
    transition:    "all 0.3s",
  },
  pillNum: {
    fontSize:   "22px",
    fontWeight: 600,
    transition: "color 0.3s",
  },
  pillLabel: {
    fontSize:      "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    transition:    "color 0.3s",
  },
  trackWrap: {
    padding: "0 2px",
  },
  track: {
    height:       "8px",
    borderRadius: "4px",
    overflow:     "hidden",
    transition:   "background 0.3s",
  },
  fill: {
    height:       "100%",
    background:   "linear-gradient(90deg, #38bdf8, #34d399)",
    borderRadius: "4px",
    transition:   "width 0.4s ease",
  },
  progressLabel: {
    display:        "flex",
    justifyContent: "space-between",
    marginTop:      "6px",
    fontSize:       "11px",
  },
};