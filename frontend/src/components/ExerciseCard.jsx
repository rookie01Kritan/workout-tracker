// src/components/ExerciseCard.jsx

import React from "react";

// ── Category colors ───────────────────────────────────────────
const CATEGORY_COLORS = {
  Push:   "#f97316",
  Pull:   "#8b5cf6",
  Legs:   "#22c55e",
  Core:   "#38bdf8",
  Cardio: "#f43f5e",
};

// ── Wave animation ────────────────────────────────────────────
function WaveAnimation() {
  return (
    <div style={styles.waveWrap} aria-hidden="true">
      {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
        <span
          key={i}
          style={{
            ...styles.wave,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Music icon (SVG) ──────────────────────────────────────────
function MusicIcon({ color }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ── Trash icon (SVG) ──────────────────────────────────────────
function TrashIcon({ color }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ── Edit icon (SVG) ───────────────────────────────────────────
function EditIcon({ color }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function ExerciseCard({
  exercise,
  isActive,
  isPlaying,
  onStart,
  onComplete,
  onEdit,
  onDelete,
  isDark,
}) {
  const {
    id,
    exerciseName,
    sets,
    reps,
    duration,
    muscleGroup,
    category,
    audioSrc,
    completed,
  } = exercise;

  const thisIsPlaying = isActive && isPlaying;
  const theme         = isDark ? darkTheme : lightTheme;
  const categoryColor = CATEGORY_COLORS[category] || "#888780";

  return (
    <div
      style={{
        ...styles.card,
        background: isActive ? theme.activeBg : theme.cardBg,
        border:     isActive
          ? `1.5px solid ${theme.activeBorder}`
          : `1px solid ${theme.border}`,
        opacity:    completed ? 0.55 : 1,
        transition: "all 0.3s",
      }}
    >
      {/* Category color bar on left edge */}
      <div style={{
        ...styles.categoryBar,
        background: categoryColor,
      }} />

      {/* ── Left: checkbox + info ── */}
      <div style={styles.left}>
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onComplete(id)}
          style={styles.checkbox}
          aria-label={`Mark ${exerciseName} as complete`}
        />

        <div style={styles.textBlock}>

          {/* Name + playing badge */}
          <div style={styles.nameRow}>
            <span
              style={{
                ...styles.exerciseName,
                textDecoration: completed ? "line-through" : "none",
                color:          completed
                  ? theme.completedText
                  : theme.nameColor,
              }}
            >
              {exerciseName}
            </span>
            {thisIsPlaying && (
              <span style={{
                ...styles.playingBadge,
                background: theme.badgeBg,
                color:      theme.badgeColor,
              }}>
                Playing
              </span>
            )}
          </div>

          {/* Sets x Reps */}
          {sets && reps && (
            <span style={{
              ...styles.setsReps,
              color: theme.setsRepsColor,
            }}>
              {sets} sets x {reps} reps
            </span>
          )}

          {/* Chips row */}
          <div style={styles.meta}>

            {/* Category chip */}
            {category && (
              <span style={{
                ...styles.categoryChip,
                background: `${categoryColor}22`,
                color:      categoryColor,
                border:     `1px solid ${categoryColor}44`,
              }}>
                {category}
              </span>
            )}

            {/* Duration chip */}
            {duration && (
              <span style={{
                ...styles.metaChip,
                background: theme.chipBg,
                color:      theme.chipColor,
                border:     `1px solid ${theme.chipBorder}`,
              }}>
                {duration}
              </span>
            )}

            {/* Muscle chip */}
            {muscleGroup && (
              <span style={{
                ...styles.metaChip,
                background: theme.chipBg,
                color:      theme.chipColor,
                border:     `1px solid ${theme.chipBorder}`,
              }}>
                {muscleGroup}
              </span>
            )}

            {/* Music chip with icon */}
            {audioSrc && (
              <span style={{
                ...styles.musicChip,
                background: theme.musicChipBg,
                color:      theme.musicChipColor,
              }}>
                <MusicIcon color={theme.musicChipColor} />
                Music
              </span>
            )}

          </div>
        </div>
      </div>

      {/* ── Right: wave + buttons ── */}
      <div style={styles.right}>

        {thisIsPlaying && <WaveAnimation />}

        {/* Play / Pause */}
        {!completed && (
          <button
            onClick={() => onStart(id, audioSrc)}
            style={{
              ...styles.playBtn,
              background: thisIsPlaying
                ? "linear-gradient(135deg, #38bdf8, #34d399)"
                : isActive
                ? theme.activePlayBg
                : theme.playBg,
              color:     theme.playColor,
              boxShadow: thisIsPlaying
                ? "0 0 0 3px rgba(56,189,248,0.3)"
                : "none",
            }}
            aria-label={thisIsPlaying ? `Pause ${exerciseName}` : `Play ${exerciseName}`}
          >
            {thisIsPlaying ? "||" : ">"}
          </button>
        )}

        {/* Edit button */}
        <button
          style={styles.iconBtn}
          onClick={() => onEdit(exercise)}
          title="Edit"
        >
          <EditIcon color={theme.iconColor} />
        </button>

        {/* Delete button */}
        <button
          style={styles.iconBtn}
          onClick={() => onDelete(id)}
          title="Delete"
        >
          <TrashIcon color="#f87171" />
        </button>

        {/* Done badge */}
        {completed && (
          <span style={styles.doneBadge}>Done</span>
        )}

      </div>
    </div>
  );
}

// ── Light theme ───────────────────────────────────────────────
const lightTheme = {
  cardBg:         "#ffffff",
  activeBg:       "linear-gradient(135deg, #f0f9ff, #f0fdf4)",
  border:         "#e0f2fe",
  activeBorder:   "#38bdf8",
  nameColor:      "#0c4a6e",
  completedText:  "#b4b2a9",
  setsRepsColor:  "#0369a1",
  chipBg:         "#f0f9ff",
  chipColor:      "#64748b",
  chipBorder:     "#e0f2fe",
  musicChipBg:    "linear-gradient(135deg, #e0f2fe, #d1fae5)",
  musicChipColor: "#0369a1",
  badgeBg:        "linear-gradient(135deg, #e0f2fe, #d1fae5)",
  badgeColor:     "#0369a1",
  playBg:         "#f0f9ff",
  activePlayBg:   "linear-gradient(135deg, #bae6fd, #bbf7d0)",
  playColor:      "#0c4a6e",
  iconColor:      "#64748b",
};

// ── Dark theme ────────────────────────────────────────────────
const darkTheme = {
  cardBg:         "#1e293b",
  activeBg:       "linear-gradient(135deg, #0c2340, #0c2318)",
  border:         "#334155",
  activeBorder:   "#38bdf8",
  nameColor:      "#e2e8f0",
  completedText:  "#475569",
  setsRepsColor:  "#7dd3fc",
  chipBg:         "#0f172a",
  chipColor:      "#94a3b8",
  chipBorder:     "#334155",
  musicChipBg:    "linear-gradient(135deg, #0c2340, #0c2318)",
  musicChipColor: "#7dd3fc",
  badgeBg:        "linear-gradient(135deg, #0c2340, #0c2318)",
  badgeColor:     "#7dd3fc",
  playBg:         "#0f172a",
  activePlayBg:   "linear-gradient(135deg, #0c2340, #0c2318)",
  playColor:      "#e2e8f0",
  iconColor:      "#94a3b8",
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  card: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    gap:            "12px",
    padding:        "14px 16px",
    borderRadius:   "14px",
    overflow:       "hidden",
    position:       "relative",
  },
  categoryBar: {
    position:     "absolute",
    left:         0,
    top:          0,
    bottom:       0,
    width:        "4px",
    borderRadius: "4px 0 0 4px",
  },
  left: {
    display:     "flex",
    alignItems:  "center",
    gap:         "12px",
    flex:        1,
    minWidth:    0,
    paddingLeft: "8px",
  },
  checkbox: {
    width:       "18px",
    height:      "18px",
    flexShrink:  0,
    cursor:      "pointer",
    accentColor: "#38bdf8",
  },
  textBlock: {
    display:       "flex",
    flexDirection: "column",
    gap:           "4px",
    minWidth:      0,
  },
  nameRow: {
    display:    "flex",
    alignItems: "center",
    gap:        "8px",
    flexWrap:   "wrap",
  },
  exerciseName: {
    fontSize:     "15px",
    fontWeight:   600,
    whiteSpace:   "nowrap",
    overflow:     "hidden",
    textOverflow: "ellipsis",
    transition:   "color 0.3s",
  },
  playingBadge: {
    fontSize:     "11px",
    borderRadius: "20px",
    padding:      "2px 8px",
    fontWeight:   500,
    whiteSpace:   "nowrap",
  },
  setsReps: {
    fontSize:   "13px",
    fontWeight: 500,
    transition: "color 0.3s",
  },
  meta: {
    display:  "flex",
    gap:      "6px",
    flexWrap: "wrap",
  },
  categoryChip: {
    fontSize:     "11px",
    borderRadius: "6px",
    padding:      "2px 8px",
    fontWeight:   600,
  },
  metaChip: {
    fontSize:     "11px",
    borderRadius: "6px",
    padding:      "2px 8px",
    transition:   "all 0.3s",
  },
  musicChip: {
    fontSize:     "11px",
    borderRadius: "6px",
    padding:      "2px 8px",
    fontWeight:   500,
    display:      "flex",
    alignItems:   "center",
    gap:          "3px",
  },
  right: {
    display:    "flex",
    alignItems: "center",
    gap:        "6px",
    flexShrink: 0,
  },
  waveWrap: {
    display:    "flex",
    alignItems: "flex-end",
    gap:        "2px",
    height:     "20px",
  },
  wave: {
    display:         "inline-block",
    width:           "3px",
    height:          "100%",
    background:      "linear-gradient(to top, #38bdf8, #34d399)",
    borderRadius:    "2px",
    animation:       "wave 0.6s ease-in-out infinite alternate",
    transformOrigin: "bottom",
  },
  playBtn: {
    width:          "38px",
    height:         "38px",
    borderRadius:   "50%",
    border:         "none",
    fontSize:       "14px",
    fontWeight:     700,
    cursor:         "pointer",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    transition:     "all 0.2s",
  },
  iconBtn: {
    background:   "transparent",
    border:       "none",
    cursor:       "pointer",
    padding:      "6px",
    borderRadius: "6px",
    display:      "flex",
    alignItems:   "center",
    justifyContent:"center",
    transition:   "opacity 0.2s",
  },
  doneBadge: {
    flexShrink:   0,
    fontSize:     "12px",
    color:        "#059669",
    background:   "#d1fae5",
    borderRadius: "6px",
    padding:      "4px 10px",
    fontWeight:   500,
  },
};