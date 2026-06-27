// src/App.jsx

import { useState, useRef, useEffect } from "react";
import useAudioPlayer                  from "./hooks/useAudioPlayer";
import useStreak                       from "./hooks/useStreak";
import { ThemeProvider, useTheme }     from "./context/ThemeContext";

import NowPlaying      from "./components/NowPlaying";
import ExerciseCard    from "./components/ExerciseCard";
import WorkoutStats    from "./components/WorkoutStats";
import ExerciseModal   from "./components/ExerciseModal";
import StreakCounter   from "./components/StreakCounter";
import WorkoutHistory  from "./components/WorkoutHistory";
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import { getExercises, createExercise, updateExercise, deleteExercise } from "./api/exerciseApi";

// ── Sun icon ──────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}

// ── Moon icon ─────────────────────────────────────────────────
function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#a5b4fc">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ── Animated dark mode toggle ───────────────────────────────────
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      style={{
        ...styles.switchTrack,
        background: isDark
          ? "linear-gradient(135deg, #1e293b, #0f172a)"
          : "linear-gradient(135deg, #7dd3fc, #38bdf8)",
        border: isDark
          ? "1.5px solid #334155"
          : "1.5px solid #38bdf8",
      }}
    >
      <span style={styles.bgIconLeft}><SunIcon /></span>
      <span style={styles.bgIconRight}><MoonIcon /></span>
      <span
        style={{
          ...styles.switchKnob,
          transform: isDark ? "translateX(22px)" : "translateX(0px)",
          background: isDark ? "#0f172a" : "#ffffff",
        }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}

// ── Inner app ─────────────────────────────────────────────────
function AppInner() {
  const { isDark, toggleTheme } = useTheme();

  // ── Auth state ────────────────────────────────────────────
  const [authView,    setAuthView]    = useState("login");
  const [isLoggedIn,  setIsLoggedIn]  = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ── Exercises state ───────────────────────────────────────
  // Starts empty - real data loads from the backend below.
  // No more localStorage for exercises; Postgres is the source of truth.
  const [exercises, setExercises] = useState([]);

  const [modalOpen,       setModalOpen]       = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  // ── Load exercises from the backend once the user is logged in ──
  useEffect(() => {
    async function loadExercises() {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (err) {
        console.error("Failed to load exercises:", err);
      }
    }

    if (isLoggedIn) {
      loadExercises();
    }
  }, [isLoggedIn]);

  // ── Streak + history tracking ───────────────────────────────
  const {
    currentStreak,
    completedDates,
    isCompletedToday,
    markTodayComplete,
    unmarkToday,
  } = useStreak();

  const {
    currentId,
    isPlaying,
    playExercise,
    togglePlay,
    stopAudio,
  } = useAudioPlayer();

  function handleStart(id, audioSrc) {
    if (id === currentId) {
      togglePlay();
    } else {
      playExercise(id, audioSrc);
    }
  }

  async function handleComplete(id) {
  try {
    if (id === currentId) stopAudio();

    const exercise = exercises.find((ex) => ex.id === id);
    const newCompletedValue = !exercise.completed;

    const updated = await updateExercise(id, { completed: newCompletedValue });

    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? updated : ex))
    );

  } catch (err) {
    console.error("Failed to update exercise completion:", err);
  }
}

  function handleReset() {
    stopAudio();
    setExercises((prev) =>
      prev.map((ex) => ({ ...ex, completed: false }))
    );
    unmarkToday();
  }

  function handleAdd() {
    setEditingExercise(null);
    setModalOpen(true);
  }

  function handleEdit(exercise) {
    setEditingExercise(exercise);
    setModalOpen(true);
  }

  async function handleDelete(id) {
  try {
    if (id === currentId) stopAudio();

    const exercise = exercises.find((ex) => ex.id === id);

    // Delete the audio file from the backend's downloads folder, if one exists
    if (exercise?.audioSrc?.includes("workoutwithfun.onrender.com/audio/")) {
  try {
    const fileName = exercise.audioSrc.split("/audio/")[1];
    await fetch(`https://workoutwithfun.onrender.com/api/audio/${fileName}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error("Failed to delete audio:", err);
  }
}
    // Delete the actual exercise row from Postgres
    await deleteExercise(id);

    // Only remove it from local state AFTER the backend confirms deletion
    setExercises((prev) => prev.filter((ex) => ex.id !== id));

  } catch (err) {
    console.error("Failed to delete exercise:", err);
  }
}

  async function handleSave(formData) {
  try {
    if (editingExercise) {
      if (editingExercise.id === currentId) stopAudio();

      const updated = await updateExercise(editingExercise.id, formData);

      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === editingExercise.id ? updated : ex
        )
      );

    } else {
      const created = await createExercise(formData);

      setExercises((prev) => [...prev, created]);
    }

    setModalOpen(false);
    setEditingExercise(null);

  } catch (err) {
    console.error("Failed to save exercise:", err);
  }
}

  function handleCloseModal() {
    setModalOpen(false);
    setEditingExercise(null);
  }

  const completedCount = exercises.filter((ex) => ex.completed).length;
  const allDone         = exercises.length > 0 && completedCount === exercises.length;
  const activeExercise  = exercises.find((ex) => ex.id === currentId) ?? null;

  useEffect(() => {
    if (allDone) {
      markTodayComplete();
    }
  }, [allDone]);

  const theme = isDark ? darkTheme : lightTheme;

  // ── Show Login/Register instead of the dashboard if not logged in ──
  if (!isLoggedIn) {
    return authView === "login" ? (
      <LoginPage
        isDark={isDark}
        onSwitchToRegister={() => setAuthView("register")}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }}
      />
    ) : (
      <RegisterPage
        isDark={isDark}
        onSwitchToLogin={() => setAuthView("login")}
        onRegisterSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // ── Render dashboard ──────────────────────────────────────
  return (
    <div style={{
      ...styles.page,
      background: theme.pageBg,
    }}>
      <style>{`
        @keyframes bounce {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1); }
        }
        @keyframes wave {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1); }
        }
      `}</style>

      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={{
              ...styles.title,
              color: theme.titleColor,
            }}>
              Today's Workout
            </h1>
            <p style={{
              ...styles.subtitle,
              color: theme.subtitleColor,
            }}>
              {currentUser?.name
                ? `Welcome, ${currentUser.name}`
                : currentUser?.email
                ? `Welcome, ${currentUser.email}`
                : "Home session · No equipment"}
            </p>
          </div>

          <div style={styles.headerRight}>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

            {allDone && (
              <button
                onClick={handleReset}
                style={{
                  ...styles.resetBtn,
                  border: `1.5px solid ${theme.resetBorder}`,
                  color:  theme.resetColor,
                }}
              >
                Reset
              </button>
            )}

            <button onClick={handleAdd} style={styles.addBtn}>
              + Add
            </button>

            {/* Logout — clears auth state + stored token + exercises */}
            <button
              onClick={() => {
                localStorage.removeItem("authToken");
                setIsLoggedIn(false);
                setCurrentUser(null);
                setAuthView("login");
                setExercises([]);
              }}
              style={{
                ...styles.logoutBtn,
                border: `1.5px solid ${theme.resetBorder}`,
                color:  theme.resetColor,
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Streak counter */}
        <StreakCounter
          currentStreak={currentStreak}
          isCompletedToday={isCompletedToday}
          isDark={isDark}
        />

        {/* Workout history grid */}
        <WorkoutHistory
          completedDates={completedDates}
          isDark={isDark}
        />

        {/* Stats */}
        <WorkoutStats
          total={exercises.length}
          completed={completedCount}
          isDark={isDark}
        />

        {/* Now playing */}
        <NowPlaying
          exercise={activeExercise}
          isPlaying={isPlaying}
          onToggle={togglePlay}
          onStop={stopAudio}
          isDark={isDark}
        />

        {/* Exercise list */}
        <div style={styles.list}>
          {exercises.length === 0 ? (
            <div style={{
              ...styles.empty,
              background:  theme.cardBg,
              borderColor: theme.emptyBorder,
              color:       theme.subtitleColor,
            }}>
              No exercises yet — tap + Add to get started!
            </div>
          ) : (
            exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isActive={exercise.id === currentId}
                isPlaying={isPlaying}
                onStart={handleStart}
                onComplete={handleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDark={isDark}
              />
            ))
          )}
        </div>

        {/* All done */}
        {allDone && (
          <div style={{
            ...styles.allDone,
            background: theme.allDoneBg,
            color:      theme.allDoneColor,
          }}>
            Workout complete! Amazing job!
          </div>
        )}

      </div>

      {/* Modal */}
      {modalOpen && (
        <ExerciseModal
          exercise={editingExercise}
          onSave={handleSave}
          onClose={handleCloseModal}
          isDark={isDark}
        />
      )}

    </div>
  );
}

// ── Root export ───────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

// ── Light theme ───────────────────────────────────────────────
const lightTheme = {
  pageBg:        "linear-gradient(160deg, #e0f2fe 0%, #d1fae5 50%, #f0fdf4 100%)",
  titleColor:    "#0c4a6e",
  subtitleColor: "#64748b",
  cardBg:        "#ffffff",
  emptyBorder:   "#7dd3fc",
  resetBorder:   "#7dd3fc",
  resetColor:    "#0369a1",
  allDoneBg:     "linear-gradient(135deg, #d1fae5, #e0f2fe)",
  allDoneColor:  "#065f46",
};

// ── Dark theme ────────────────────────────────────────────────
const darkTheme = {
  pageBg:        "linear-gradient(160deg, #0f172a 0%, #0c1a12 50%, #0f172a 100%)",
  titleColor:    "#7dd3fc",
  subtitleColor: "#94a3b8",
  cardBg:        "#1e293b",
  emptyBorder:   "#334155",
  resetBorder:   "#334155",
  resetColor:    "#94a3b8",
  allDoneBg:     "linear-gradient(135deg, #064e3b, #0c4a6e)",
  allDoneColor:  "#6ee7b7",
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight:  "100vh",
    padding:    "2rem 1rem",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    transition: "background 0.3s ease",
  },
  container: {
    maxWidth: "480px",
    margin:   "0 auto",
  },
  header: {
    display:        "flex",
    alignItems:     "flex-start",
    justifyContent: "space-between",
    marginBottom:   "1.5rem",
    flexWrap:       "wrap",
    gap:            "8px",
  },
  title: {
    fontSize:   "24px",
    fontWeight: 700,
    margin:     0,
    transition: "color 0.3s",
  },
  subtitle: {
    fontSize:  "13px",
    margin:    "4px 0 0",
    transition:"color 0.3s",
  },
  headerRight: {
    display:    "flex",
    gap:        "10px",
    marginTop:  "4px",
    alignItems: "center",
    flexWrap:   "wrap",
  },
  switchTrack: {
    position:       "relative",
    width:          "52px",
    height:         "28px",
    borderRadius:   "20px",
    cursor:         "pointer",
    padding:        0,
    transition:     "background 0.4s ease, border-color 0.4s ease",
    flexShrink:     0,
    display:        "flex",
    alignItems:     "center",
  },
  switchKnob: {
    position:       "absolute",
    top:            "2px",
    left:           "2px",
    width:          "22px",
    height:         "22px",
    borderRadius:   "50%",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    boxShadow:      "0 2px 6px rgba(0,0,0,0.25)",
    transition:     "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.35s ease",
  },
  bgIconLeft: {
    position: "absolute",
    left:     "5px",
    opacity:  0.5,
    display:  "flex",
  },
  bgIconRight: {
    position: "absolute",
    right:    "5px",
    opacity:  0.5,
    display:  "flex",
  },
  resetBtn: {
    background:   "transparent",
    borderRadius: "10px",
    padding:      "7px 14px",
    fontSize:     "13px",
    cursor:       "pointer",
  },
  addBtn: {
    background:   "linear-gradient(135deg, #38bdf8, #34d399)",
    border:       "none",
    borderRadius: "10px",
    padding:      "7px 16px",
    fontSize:     "13px",
    color:        "#fff",
    fontWeight:   600,
    cursor:       "pointer",
  },
  logoutBtn: {
    background:   "transparent",
    borderRadius: "10px",
    padding:      "7px 14px",
    fontSize:     "13px",
    cursor:       "pointer",
  },
  list: {
    display:       "flex",
    flexDirection: "column",
    gap:           "10px",
  },
  empty: {
    textAlign:    "center",
    padding:      "2.5rem 1rem",
    fontSize:     "14px",
    borderRadius: "14px",
    border:       "1.5px dashed",
    transition:   "all 0.3s",
  },
  allDone: {
    marginTop:    "1.5rem",
    textAlign:    "center",
    fontSize:     "15px",
    borderRadius: "12px",
    padding:      "16px",
    fontWeight:   500,
    transition:   "all 0.3s",
  },
};