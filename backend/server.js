// backend/server.js
require("dotenv").config();

const express  = require("express");
const cors     = require("cors");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const { exec } = require("child_process");
const exerciseRoutes = require("./src/routes/exerciseRoutes");

const app  = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require("./src/routes/authRoutes");
// ── Middleware ────────────────────────────────────────────────
app.set("trust proxy", 1); // so req.protocol respects Render's X-Forwarded-Proto
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);

const authMiddleware = require("./src/middleware/authMiddleware");

// Test route — only reachable with a valid token
app.get("/api/test-protected", authMiddleware, (req, res) => {
  res.json({ message: `You are authenticated as user ${req.userId}` });
});
// ── Downloads folder ──────────────────────────────────────────
// All audio files (uploaded or downloaded) go here
const DOWNLOADS_DIR = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR);
}

// ── Serve audio files statically ──────────────────────────────
// Frontend can access files at:
// http://localhost:5000/audio/filename.mp3
app.use("/audio", express.static(DOWNLOADS_DIR));

// ── Multer setup for device uploads ───────────────────────────
// Saves uploaded files to downloads/ folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOWNLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Use timestamp + original name to avoid conflicts
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  // Only allow audio files
  fileFilter: (req, file, cb) => {
    const allowed = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// ── Route 1: Upload audio from device ─────────────────────────
// POST /api/upload
// Body: multipart form with field "audio"
// Returns: { success, fileUrl, fileName }
app.post("/api/upload", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file provided",
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/audio/${req.file.filename}`;

    console.log("File uploaded:", req.file.filename);

    res.json({
      success:  true,
      fileUrl,
      fileName: req.file.originalname,
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      success: false,
      error:   err.message,
    });
  }
});

// ── Route 2: Download YouTube audio ───────────────────────────
// POST /api/download-youtube
// Body: { url: "https://youtube.com/watch?v=..." }
// Returns: { success, fileUrl, fileName }
app.post("/api/download-youtube", (req, res) => {
  const { url } = req.body;

  // Basic YouTube URL validation
  if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
    return res.status(400).json({
      success: false,
      error:   "Please provide a valid YouTube URL",
    });
  }

  // Generate unique filename for this download
  const fileName   = `yt-${Date.now()}.mp3`;
  const outputPath = path.join(DOWNLOADS_DIR, fileName);

  // yt-dlp command:
  //   -x              → extract audio only
  //   --audio-format  → convert to mp3
  //   --audio-quality → 0 = best quality
  //   -o              → output file path
  //   --no-playlist   → don't download full playlist
  const ytdlpPath = path.join(__dirname, "yt-dlp-bin");
const command = `"${ytdlpPath}" --cookies "${path.join(__dirname, "cookies.txt")}" -x --audio-format mp3 --audio-quality 0 --no-playlist -o "${outputPath}" "${url}"`;

  console.log("Downloading YouTube audio:", url);

  // Set timeout to 5 minutes for large videos
 exec(command, {
  timeout: 300000,
  env: { ...process.env, PATH: `${process.env.PATH}:/opt/render/.local/bin` },
}, (error, stdout, stderr) => {
    if (error) {
      console.error("yt-dlp error:", error.message);
      return res.status(500).json({
        success: false,
        error:   "Failed to download audio. Please check the YouTube URL and try again.",
      });
    }

    // Check file actually exists after download
    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({
        success: false,
        error:   "Download completed but file not found.",
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/audio/${fileName}`;
    console.log("YouTube audio downloaded:", fileName);

    res.json({
      success: true,
      fileUrl,
      fileName,
    });
  });
});

// ── Route 3: Delete audio file ────────────────────────────────
// DELETE /api/audio/:filename
// Removes file from downloads/ folder
app.delete("/api/audio/:filename", (req, res) => {
  const filePath = path.join(DOWNLOADS_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error:   "File not found",
    });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error:   "Failed to delete file",
      });
    }
    res.json({ success: true });
  });
});

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", port: PORT });
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Audio files served at http://localhost:${PORT}/audio/`);
});