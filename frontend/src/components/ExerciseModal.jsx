// src/components/ExerciseModal.jsx

import { useState } from "react";

const BACKEND = "https://workoutwithfun.onrender.com";

// ── Category options ──────────────────────────────────────────
const CATEGORIES = [
  { value: "Push",   color: "#f97316" },
  { value: "Pull",   color: "#8b5cf6" },
  { value: "Legs",   color: "#22c55e" },
  { value: "Core",   color: "#38bdf8" },
  { value: "Cardio", color: "#f43f5e" },
];

export default function ExerciseModal({ exercise, onSave, onClose, isDark }) {
  const [name,       setName]       = useState(exercise?.name      ?? "");
  const [sets,       setSets]       = useState(exercise?.sets      ?? "");
  const [reps,       setReps]       = useState(exercise?.reps      ?? "");
  const [restTime,   setRestTime]   = useState(exercise?.restTime  ?? "");
  const [duration,   setDuration]   = useState(exercise?.duration  ?? "");
  const [muscle,     setMuscle]     = useState(exercise?.muscle    ?? "");
  const [category,   setCategory]   = useState(exercise?.category  ?? "Push");
  const [audioMode,  setAudioMode]  = useState("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audioSrc,   setAudioSrc]   = useState(exercise?.audioSrc  ?? "");
  const [audioName,  setAudioName]  = useState(exercise?.audioName ?? "");
  const [status,     setStatus]     = useState("");
  const [error,      setError]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);

  const theme = isDark ? darkTheme : lightTheme;

  // ── Extract an 11-character YouTube video ID from a URL ────────
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

  // ── Upload file from device ───────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setStatus("Uploading audio file...");
    setError("");

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const response = await fetch(`${BACKEND}/api/upload`, {
        method: "POST",
        body:   formData,
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      setAudioSrc(data.fileUrl);
      setAudioName(data.fileName);
      setStatus(`Ready: ${data.fileName}`);

    } catch (err) {
      setError("Upload failed. Make sure backend is running.");
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  }

 // ── Use YouTube video for playback (no download needed) ──
  function handleYoutubeDownload() {
    if (!youtubeUrl.trim()) return setError("Please paste a YouTube URL first.");

    const videoId = extractYouTubeId(youtubeUrl.trim());
    if (!videoId) {
      setError("Couldn't find a valid YouTube video ID in that URL.");
      return;
    }

    setAudioSrc(`youtube:${videoId}`);
    setAudioName("YouTube audio");
    setStatus("YouTube audio ready!");
    setError("");
  }
  // ── Validate and save ─────────────────────────────────────
  function handleSave() {
    if (!name.trim())      return setError("Exercise name is required.");
    if (!sets || sets < 1) return setError("Sets must be at least 1.");
    if (!reps || reps < 1) return setError("Reps must be at least 1.");
    if (isLoading)         return setError("Please wait for audio to finish.");

    setError("");
  onSave({
  exerciseName: name.trim(),
  sets:         Number(sets),
  reps:         Number(reps),
  restTime:     restTime.trim(),
  duration:     duration.trim(),
  muscleGroup:  muscle.trim(),
  category,
  audioSrc,
  audioName,
});
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={{
          ...styles.modal,
          background: theme.modalBg,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={{
            ...styles.title,
            color: theme.titleColor,
          }}>
            {exercise ? "Edit Exercise" : "Add Exercise"}
          </h2>
          <button
            style={{
              ...styles.closeBtn,
              color: theme.closeColor,
            }}
            onClick={onClose}
          >
            X
          </button>
        </div>

        {/* Name */}
        <label style={{
          ...styles.label,
          color: theme.labelColor,
        }}>
          Exercise Name *
        </label>
        <input
          style={{
            ...styles.input,
            background:  theme.inputBg,
            border:      `1.5px solid ${theme.inputBorder}`,
            color:       theme.inputColor,
          }}
          placeholder="e.g. Push Ups"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Category */}
        <label style={{
          ...styles.label,
          color: theme.labelColor,
        }}>
          Category
        </label>

        <div style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              style={{
                ...styles.categoryBtn,
                background: category === cat.value
                  ? cat.color
                  : theme.categoryBtnBg,
                color: category === cat.value
                  ? "#ffffff"
                  : theme.categoryBtnColor,
                border: `1.5px solid ${category === cat.value
                  ? cat.color
                  : theme.categoryBtnBorder}`,
              }}
            >
              {cat.value}
            </button>
          ))}
        </div>

        {/* Sets + Reps */}
        <div style={styles.row}>
          <div style={styles.half}>
            <label style={{
              ...styles.label,
              color: theme.labelColor,
            }}>
              Sets *
            </label>
            <input
              style={{
                ...styles.input,
                background: theme.inputBg,
                border:     `1.5px solid ${theme.inputBorder}`,
                color:      theme.inputColor,
              }}
              type="number"
              min="1"
              placeholder="3"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
          </div>
          <div style={styles.half}>
            <label style={{
              ...styles.label,
              color: theme.labelColor,
            }}>
              Reps *
            </label>
            <input
              style={{
                ...styles.input,
                background: theme.inputBg,
                border:     `1.5px solid ${theme.inputBorder}`,
                color:      theme.inputColor,
              }}
              type="number"
              min="1"
              placeholder="12"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        </div>

        {/* Rest Time — new field */}
        <label style={{
          ...styles.label,
          color: theme.labelColor,
        }}>
          Rest After Each Set
        </label>
        <input
          style={{
            ...styles.input,
            background: theme.inputBg,
            border:     `1.5px solid ${theme.inputBorder}`,
            color:      theme.inputColor,
          }}
          placeholder="e.g. 60s, 90s, 2 min"
          value={restTime}
          onChange={(e) => setRestTime(e.target.value)}
        />

        {/* Duration + Muscle */}
        <div style={styles.row}>
          <div style={styles.half}>
            <label style={{
              ...styles.label,
              color: theme.labelColor,
            }}>
              Duration
            </label>
            <input
              style={{
                ...styles.input,
                background: theme.inputBg,
                border:     `1.5px solid ${theme.inputBorder}`,
                color:      theme.inputColor,
              }}
              placeholder="e.g. 45s"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div style={styles.half}>
            <label style={{
              ...styles.label,
              color: theme.labelColor,
            }}>
              Muscle
            </label>
            <input
              style={{
                ...styles.input,
                background: theme.inputBg,
                border:     `1.5px solid ${theme.inputBorder}`,
                color:      theme.inputColor,
              }}
              placeholder="e.g. Chest"
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
            />
          </div>
        </div>

        {/* Audio Section */}
        <label style={{
          ...styles.label,
          color: theme.labelColor,
        }}>
          Music (optional)
        </label>

        {/* Toggle */}
        <div style={styles.toggleRow}>
          <button
            style={{
              ...(audioMode === "upload" ? styles.toggleOn : styles.toggleOff),
              background: audioMode === "upload"
                ? "linear-gradient(135deg, #e0f2fe, #d1fae5)"
                : theme.toggleOffBg,
              color: audioMode === "upload"
                ? "#0369a1"
                : theme.toggleOffColor,
              border: `1.5px solid ${audioMode === "upload"
                ? "#38bdf8"
                : theme.toggleOffBorder}`,
            }}
            onClick={() => { setAudioMode("upload"); setStatus(""); setError(""); }}
          >
            Upload File
          </button>
          <button
            style={{
              ...(audioMode === "youtube" ? styles.toggleOn : styles.toggleOff),
              background: audioMode === "youtube"
                ? "linear-gradient(135deg, #e0f2fe, #d1fae5)"
                : theme.toggleOffBg,
              color: audioMode === "youtube"
                ? "#0369a1"
                : theme.toggleOffColor,
              border: `1.5px solid ${audioMode === "youtube"
                ? "#38bdf8"
                : theme.toggleOffBorder}`,
            }}
            onClick={() => { setAudioMode("youtube"); setStatus(""); setError(""); }}
          >
            YouTube Link
          </button>
        </div>

        {/* Upload */}
        {audioMode === "upload" && (
          <div style={styles.uploadBox}>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="audio-file"
              disabled={isLoading}
            />
            <label
              htmlFor="audio-file"
              style={{
                ...styles.fileLabel,
                borderColor: audioSrc ? "#34d399" : "#38bdf8",
                color:       audioSrc ? "#059669" : "#0369a1",
                background:  theme.inputBg,
                cursor:      isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading
                ? "Uploading..."
                : status
                ? status
                : "Click to choose audio file"
              }
            </label>
          </div>
        )}

        {/* YouTube */}
        {audioMode === "youtube" && (
          <div style={styles.youtubeBox}>
            <input
              style={{
                ...styles.input,
                background: theme.inputBg,
                border:     `1.5px solid ${theme.inputBorder}`,
                color:      theme.inputColor,
              }}
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isLoading}
            />
            <button
              style={{
                ...styles.downloadBtn,
                opacity: isLoading ? 0.6 : 1,
                cursor:  isLoading ? "not-allowed" : "pointer",
              }}
              onClick={handleYoutubeDownload}
              disabled={isLoading}
            >
              {isLoading ? "Downloading..." : "Download Audio"}
            </button>
            {status && !error && (
              <p style={{
                ...styles.statusMsg,
                color: theme.statusColor,
              }}>
                {status}
              </p>
            )}
          </div>
        )}

        {/* Audio ready */}
        {audioSrc && !isLoading && (
          <div style={styles.audioReady}>
            Audio saved: {audioName || "Ready to play"}
          </div>
        )}

        {/* Error */}
        {error && <p style={styles.error}>{error}</p>}

        {/* Buttons */}
        <div style={styles.actions}>
          <button
            style={{
              ...styles.cancelBtn,
              border: `1.5px solid ${theme.cancelBorder}`,
              color:  theme.cancelColor,
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{
              ...styles.saveBtn,
              opacity: isLoading ? 0.6 : 1,
              cursor:  isLoading ? "not-allowed" : "pointer",
            }}
            onClick={handleSave}
            disabled={isLoading}
          >
            {exercise ? "Save Changes" : "Add Exercise"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Light theme ───────────────────────────────────────────────
const lightTheme = {
  modalBg:            "#ffffff",
  titleColor:         "#1a1917",
  closeColor:         "#888780",
  labelColor:         "#555",
  inputBg:            "#f0f9ff",
  inputBorder:        "#e0f2fe",
  inputColor:         "#1a1917",
  categoryBtnBg:      "#f0f9ff",
  categoryBtnColor:   "#64748b",
  categoryBtnBorder:  "#e0f2fe",
  toggleOffBg:        "#f0f9ff",
  toggleOffColor:     "#888780",
  toggleOffBorder:    "#e0f2fe",
  statusColor:        "#0369a1",
  cancelBorder:       "#e0f2fe",
  cancelColor:        "#888780",
};

// ── Dark theme ────────────────────────────────────────────────
const darkTheme = {
  modalBg:            "#1e293b",
  titleColor:         "#e2e8f0",
  closeColor:         "#94a3b8",
  labelColor:         "#94a3b8",
  inputBg:            "#0f172a",
  inputBorder:        "#334155",
  inputColor:         "#e2e8f0",
  categoryBtnBg:      "#0f172a",
  categoryBtnColor:   "#94a3b8",
  categoryBtnBorder:  "#334155",
  toggleOffBg:        "#0f172a",
  toggleOffColor:     "#94a3b8",
  toggleOffBorder:    "#334155",
  statusColor:        "#7dd3fc",
  cancelBorder:       "#334155",
  cancelColor:        "#94a3b8",
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  backdrop: {
    position:       "fixed",
    inset:          0,
    background:     "rgba(0,0,0,0.3)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    zIndex:         1000,
    padding:        "1rem",
  },
  modal: {
    borderRadius: "20px",
    padding:      "1.75rem",
    width:        "100%",
    maxWidth:     "420px",
    boxShadow:    "0 24px 64px rgba(0,0,0,0.15)",
    maxHeight:    "90vh",
    overflowY:    "auto",
  },
  header: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   "1.25rem",
  },
  title: {
    fontSize:   "18px",
    fontWeight: 600,
    margin:     0,
  },
  closeBtn: {
    background: "none",
    border:     "none",
    fontSize:   "16px",
    cursor:     "pointer",
    fontWeight: 600,
  },
  label: {
    display:       "block",
    fontSize:      "12px",
    fontWeight:    600,
    marginBottom:  "5px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    width:        "100%",
    boxSizing:    "border-box",
    borderRadius: "10px",
    padding:      "10px 12px",
    fontSize:     "14px",
    marginBottom: "1rem",
    outline:      "none",
    transition:   "all 0.3s",
  },
  categoryRow: {
    display:      "flex",
    gap:          "6px",
    marginBottom: "1rem",
    flexWrap:     "wrap",
  },
  categoryBtn: {
    padding:      "6px 12px",
    borderRadius: "20px",
    fontSize:     "12px",
    fontWeight:   600,
    cursor:       "pointer",
    transition:   "all 0.2s",
  },
  row: {
    display: "flex",
    gap:     "12px",
  },
  half: {
    flex: 1,
  },
  toggleRow: {
    display:      "flex",
    gap:          "8px",
    marginBottom: "0.75rem",
  },
  toggleOn: {
    flex:         1,
    padding:      "9px",
    borderRadius: "10px",
    fontWeight:   600,
    fontSize:     "13px",
    cursor:       "pointer",
  },
  toggleOff: {
    flex:         1,
    padding:      "9px",
    borderRadius: "10px",
    fontSize:     "13px",
    cursor:       "pointer",
  },
  uploadBox: {
    marginBottom: "1rem",
  },
  fileLabel: {
    display:      "block",
    padding:      "10px 12px",
    border:       "1.5px dashed",
    borderRadius: "10px",
    fontSize:     "13px",
    textAlign:    "center",
    transition:   "all 0.2s",
  },
  youtubeBox: {
    marginBottom: "1rem",
  },
  downloadBtn: {
    width:        "100%",
    padding:      "10px",
    background:   "linear-gradient(135deg, #38bdf8, #34d399)",
    border:       "none",
    borderRadius: "10px",
    color:        "#fff",
    fontWeight:   600,
    fontSize:     "14px",
    marginBottom: "0.5rem",
  },
  statusMsg: {
    fontSize:  "12px",
    margin:    "6px 0 0",
    textAlign: "center",
  },
  audioReady: {
    fontSize:     "12px",
    color:        "#059669",
    background:   "#d1fae5",
    borderRadius: "8px",
    padding:      "8px 12px",
    marginBottom: "1rem",
  },
  error: {
    color:        "#dc2626",
    fontSize:     "12px",
    marginBottom: "1rem",
    marginTop:    "-0.5rem",
  },
  actions: {
    display:        "flex",
    justifyContent: "flex-end",
    gap:            "8px",
    marginTop:      "0.5rem",
  },
  cancelBtn: {
    background:   "transparent",
    borderRadius: "10px",
    padding:      "9px 20px",
    fontSize:     "13px",
    cursor:       "pointer",
  },
  saveBtn: {
    background:   "linear-gradient(135deg, #38bdf8, #34d399)",
    border:       "none",
    borderRadius: "10px",
    padding:      "9px 20px",
    fontSize:     "13px",
    color:        "#fff",
    fontWeight:   600,
  },
};