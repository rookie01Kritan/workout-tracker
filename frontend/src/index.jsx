// ============================================================
//  index.jsx — App entry point
//  This is the first file Vite (or Create React App) loads.
//  It mounts the <App /> component into the #root div in index.html.
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Reset browser default margins/padding globally
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; }
`;
document.head.appendChild(globalStyle);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
