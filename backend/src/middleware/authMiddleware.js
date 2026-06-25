// backend/src/middleware/authMiddleware.js
//
// This middleware protects routes that require a logged-in user.
// It does NOT contain business logic - its only job is to check
// "is there a valid token?" and either let the request through
// (by calling next()) or stop it with a 401 response.

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // ── Step 1: Get the Authorization header ──────────────────
  // Expected format: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided. Please log in." });
  }

  // ── Step 2: Extract just the token part ────────────────────
  // authHeader looks like "Bearer eyJhbGciOi..."
  // We split on the space and take the second piece.
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Malformed authorization header." });
  }

  const token = parts[1];

  // ── Step 3: Verify the token ────────────────────────────────
  // jwt.verify() does two things:
  //   1. Confirms the token's signature matches our JWT_SECRET
  //      (proves it was issued by us, not forged by someone else)
  //   2. Confirms the token hasn't expired (we set expiresIn: "7d"
  //      when we signed it in authController.js)
  // If either check fails, this throws an error, which we catch below.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Step 4: Attach the user's id to the request ──────────
    // Every route handler that runs AFTER this middleware can now
    // read req.userId to know exactly who is making this request,
    // without needing to re-verify anything themselves.
    req.userId = decoded.userId;

    // ── Step 5: Let the request continue ──────────────────────
    // Calling next() is what hands control to the actual route
    // handler (e.g. the function that fetches exercises).
    // If we never call next(), the request hangs forever -
    // this is a common beginner bug to watch out for.
    next();

  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
}

module.exports = authMiddleware;