// src/components/NowPlaying.jsx

import React from "react";

export default function NowPlaying({ exercise, isPlaying, onToggle, onStop, isDark }) {
  if (!exercise) return null;

  // ── Theme colors ──────────────────────────────────────────
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <div style={{
      ...styles.banner,
      background: theme.bannerBg,
      transition: "all 0.3s",
    }}>

      {/* Animated equaliser bars */}
      <div style={styles.vizWrap} aria-hidden="true">
        {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
          <span
            key={i}
            style={{
              ...styles.bar,
              animationPlayState: isPlaying ? "running" : "paused",
              animationDelay:     `${delay}s`,
            }}
          />
        ))}
      </div>

      {/* Exercise info */}
      <div style={styles.info}>
        <span style={{
          ...styles.label,
          color: theme.labelColor,
        }}>
          {isPlaying ? "Now Playing" : "Paused"}
        </span>

        <span style={{
          ...styles.name,
          color: theme.nameColor,
        }}>
          {exercise.name}
        </span>

        {exercise.sets && exercise.reps && (
          <span style={{
            ...styles.setsReps,
            color: theme.setsRepsColor,
          }}>
            {exercise.sets} sets x {exercise.reps} reps
          </span>
        )}

        {exercise.duration && (
          <span style={{
            ...styles.duration,
            color: theme.durationColor,
          }}>
            {exercise.duration}
          </span>
        )}
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          onClick={onToggle}
          style={{
            ...styles.playBtn,
            background: theme.playBtnBg,
          }}
          aria-label={isPlaying ? "Pause" : "Resume"}
        >
          {isPlaying ? "||" : ">"}
        </button>
        <button
          onClick={onStop}
          style={{
            ...styles.stopBtn,
            border: `1px solid ${theme.stopBtnBorder}`,
            color:  theme.stopBtnColor,
          }}
          aria-label="Stop"
        >
          Stop
        </button>
      </div>

    </div>
  );
}

// ── Light theme ───────────────────────────────────────────────
const lightTheme = {
  bannerBg:      "linear-gradient(135deg, #0c4a6e, #064e3b)",
  labelColor:    "#7dd3fc",
  nameColor:     "#ffffff",
  setsRepsColor: "#7dd3fc",
  durationColor: "#6ee7b7",
  playBtnBg:     "linear-gradient(135deg, #38bdf8, #34d399)",
  stopBtnBorder: "#164e63",
  stopBtnColor:  "#7dd3fc",
};

// ── Dark theme ────────────────────────────────────────────────
const darkTheme = {
  bannerBg:      "linear-gradient(135deg, #0f172a, #0c1a12)",
  labelColor:    "#38bdf8",
  nameColor:     "#e2e8f0",
  setsRepsColor: "#38bdf8",
  durationColor: "#34d399",
  playBtnBg:     "linear-gradient(135deg, #38bdf8, #34d399)",
  stopBtnBorder: "#334155",
  stopBtnColor:  "#94a3b8",
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  banner: {
    display:      "flex",
    alignItems:   "center",
    gap:          "14px",
    borderRadius: "14px",
    padding:      "14px 18px",
    marginBottom: "1.5rem",
  },
  vizWrap: {
    display:    "flex",
    alignItems: "flex-end",
    gap:        "3px",
    height:     "20px",
    flexShrink: 0,
  },
  bar: {
    display:         "inline-block",
    width:           "4px",
    height:          "100%",
    background:      "linear-gradient(to top, #38bdf8, #34d399)",
    borderRadius:    "2px",
    animation:       "bounce 0.6s ease-in-out infinite alternate",
    transformOrigin: "bottom",
  },
  info: {
    flex:          1,
    display:       "flex",
    flexDirection: "column",
    gap:           "2px",
    overflow:      "hidden",
  },
  label: {
    fontSize:      "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    transition:    "color 0.3s",
  },
  name: {
    fontSize:     "15px",
    fontWeight:   500,
    whiteSpace:   "nowrap",
    overflow:     "hidden",
    textOverflow: "ellipsis",
    transition:   "color 0.3s",
  },
  setsReps: {
    fontSize:   "12px",
    transition: "color 0.3s",
  },
  duration: {
    fontSize:   "12px",
    transition: "color 0.3s",
  },
  controls: {
    display:    "flex",
    gap:        "8px",
    flexShrink: 0,
  },
  playBtn: {
    border:         "none",
    borderRadius:   "8px",
    width:          "36px",
    height:         "36px",
    fontSize:       "14px",
    fontWeight:     700,
    cursor:         "pointer",
    color:          "#fff",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
  },
  stopBtn: {
    background:     "transparent",
    borderRadius:   "8px",
    width:          "46px",
    height:         "36px",
    fontSize:       "12px",
    fontWeight:     600,
    cursor:         "pointer",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    transition:     "all 0.3s",
  },
};