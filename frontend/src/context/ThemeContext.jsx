// src/context/ThemeContext.jsx

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {

  // Load saved preference, default to light
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("workout_theme") === "dark";
    } catch {
      return false;
    }
  });

  // Save preference whenever it changes
  useEffect(() => {
    localStorage.setItem("workout_theme", isDark ? "dark" : "light");
  }, [isDark]);

  function toggleTheme() {
    setIsDark((prev) => !prev);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook — use this in any component
// Example: const { isDark, toggleTheme } = useTheme();
export function useTheme() {
  return useContext(ThemeContext);
}