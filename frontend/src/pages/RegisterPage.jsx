// src/pages/RegisterPage.jsx

import { useState } from "react";
import { registerUser } from "../api/authApi";

export default function RegisterPage({ onRegisterSuccess, onSwitchToLogin, isDark }) {
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [isLoading,       setIsLoading]       = useState(false);

  const theme = isDark ? darkTheme : lightTheme;

  function validate() {
    if (!name.trim())  return "Name is required.";
    if (!email.trim()) return "Email is required.";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return "Please enter a valid email.";

    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";

    if (password !== confirmPassword) return "Passwords do not match.";

    return null;
  }

  // ── Real submit handler ────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { token, user } = await registerUser(name, email, password);

      localStorage.setItem("authToken", token);

      onRegisterSuccess(user);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ ...styles.page, background: theme.pageBg }}>
      <div style={{ ...styles.card, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>

        <h1 style={{ ...styles.title, color: theme.titleColor }}>
          Create Account
        </h1>
        <p style={{ ...styles.subtitle, color: theme.subtitleColor }}>
          Start tracking your workouts today
        </p>

        <form onSubmit={handleRegister}>

          <label style={{ ...styles.label, color: theme.labelColor }}>
            Full Name
          </label>
          <input
            type="text"
            style={{
              ...styles.input,
              background: theme.inputBg,
              border:     `1.5px solid ${theme.inputBorder}`,
              color:      theme.inputColor,
            }}
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            autoFocus
          />

          <label style={{ ...styles.label, color: theme.labelColor }}>
            Email
          </label>
          <input
            type="email"
            style={{
              ...styles.input,
              background: theme.inputBg,
              border:     `1.5px solid ${theme.inputBorder}`,
              color:      theme.inputColor,
            }}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <label style={{ ...styles.label, color: theme.labelColor }}>
            Password
          </label>
          <input
            type="password"
            style={{
              ...styles.input,
              background: theme.inputBg,
              border:     `1.5px solid ${theme.inputBorder}`,
              color:      theme.inputColor,
            }}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <label style={{ ...styles.label, color: theme.labelColor }}>
            Confirm Password
          </label>
          <input
            type="password"
            style={{
              ...styles.input,
              background: theme.inputBg,
              border:     `1.5px solid ${theme.inputBorder}`,
              color:      theme.inputColor,
            }}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor:  isLoading ? "not-allowed" : "pointer",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ ...styles.switchText, color: theme.subtitleColor }}>
          Already have an account?{" "}
          <span
            style={{ ...styles.switchLink, color: theme.linkColor }}
            onClick={onSwitchToLogin}
          >
            Log In
          </span>
        </p>

      </div>
    </div>
  );
}

// ── Light theme ───────────────────────────────────────────────
const lightTheme = {
  pageBg:        "linear-gradient(160deg, #e0f2fe 0%, #d1fae5 50%, #f0fdf4 100%)",
  cardBg:        "#ffffff",
  cardBorder:    "#e0f2fe",
  titleColor:    "#0c4a6e",
  subtitleColor: "#64748b",
  labelColor:    "#555",
  inputBg:       "#f0f9ff",
  inputBorder:   "#e0f2fe",
  inputColor:    "#1a1917",
  linkColor:     "#0369a1",
};

// ── Dark theme ────────────────────────────────────────────────
const darkTheme = {
  pageBg:        "linear-gradient(160deg, #0f172a 0%, #0c1a12 50%, #0f172a 100%)",
  cardBg:        "#1e293b",
  cardBorder:    "#334155",
  titleColor:    "#7dd3fc",
  subtitleColor: "#94a3b8",
  labelColor:    "#94a3b8",
  inputBg:       "#0f172a",
  inputBorder:   "#334155",
  inputColor:    "#e2e8f0",
  linkColor:     "#7dd3fc",
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight:      "100vh",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    padding:        "1.5rem",
    fontFamily:     "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    width:        "100%",
    maxWidth:     "380px",
    borderRadius: "20px",
    padding:      "2rem 1.75rem",
    boxShadow:    "0 24px 64px rgba(0,0,0,0.12)",
  },
  title: {
    fontSize:   "22px",
    fontWeight: 700,
    margin:     "0 0 4px",
  },
  subtitle: {
    fontSize: "13px",
    margin:   "0 0 1.5rem",
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
    padding:      "11px 14px",
    fontSize:     "14px",
    marginBottom: "1.1rem",
    outline:      "none",
  },
  error: {
    color:    "#dc2626",
    fontSize: "13px",
    margin:   "-4px 0 12px",
  },
  submitBtn: {
    width:        "100%",
    padding:      "12px",
    background:   "linear-gradient(135deg, #38bdf8, #34d399)",
    border:       "none",
    borderRadius: "10px",
    color:        "#fff",
    fontWeight:   600,
    fontSize:     "14px",
  },
  switchText: {
    textAlign: "center",
    fontSize:  "13px",
    marginTop: "1.25rem",
  },
  switchLink: {
    fontWeight: 600,
    cursor:     "pointer",
  },
};