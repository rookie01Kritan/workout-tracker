// backend/src/controllers/exerciseController.js

const prisma = require("../config/db");

// ── Get all exercises for the logged-in user ──────────────────
// GET /api/exercises
async function getExercises(req, res) {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
    });

    res.json(exercises);

  } catch (err) {
    console.error("getExercises error:", err);
    res.status(500).json({ error: "Failed to fetch exercises." });
  }
}

// ── Create a new exercise ─────────────────────────────────────
// POST /api/exercises
// Body: { exerciseName, sets, reps, restTime, muscleGroup,
//         duration, category, audioSrc, audioName }
async function createExercise(req, res) {
  try {
    const {
      exerciseName,
      sets,
      reps,
      restTime,
      muscleGroup,
      duration,
      category,
      audioSrc,
      audioName,
    } = req.body;

    // Server-side validation - same principle as authController:
    // never trust that the frontend already checked this.
    if (!exerciseName || !sets || !reps) {
      return res.status(400).json({ error: "Exercise name, sets, and reps are required." });
    }

    const exercise = await prisma.exercise.create({
      data: {
        userId: req.userId, // <- comes from authMiddleware, NEVER from req.body
        exerciseName,
        sets:   Number(sets),
        reps:   Number(reps),
        restTime:    restTime    || null,
        muscleGroup: muscleGroup || null,
        duration:    duration    || null,
        category:    category    || null,
        audioSrc:    audioSrc    || null,
        audioName:   audioName   || null,
      },
    });

    res.status(201).json(exercise);

  } catch (err) {
    console.error("createExercise error:", err);
    res.status(500).json({ error: "Failed to create exercise." });
  }
}

// ── Update an existing exercise ───────────────────────────────
// PUT /api/exercises/:id
async function updateExercise(req, res) {
  try {
    const exerciseId = Number(req.params.id);

    // ── Ownership check ──────────────────────────────────────
    // Before updating anything, confirm this exercise actually
    // belongs to the logged-in user. Without this check, User A
    // could send a request with User B's exercise id and edit it.
    const existing = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Exercise not found." });
    }

    const {
      exerciseName,
      sets,
      reps,
      restTime,
      muscleGroup,
      duration,
      category,
      audioSrc,
      audioName,
      completed,
    } = req.body;

    const updated = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        // Only update fields that were actually sent - this lets
        // the frontend send partial updates (e.g. just toggling
        // `completed`) without overwriting everything else with
        // undefined values.
        ...(exerciseName !== undefined && { exerciseName }),
        ...(sets         !== undefined && { sets: Number(sets) }),
        ...(reps          !== undefined && { reps: Number(reps) }),
        ...(restTime      !== undefined && { restTime }),
        ...(muscleGroup   !== undefined && { muscleGroup }),
        ...(duration      !== undefined && { duration }),
        ...(category      !== undefined && { category }),
        ...(audioSrc      !== undefined && { audioSrc }),
        ...(audioName     !== undefined && { audioName }),
        ...(completed     !== undefined && { completed }),
      },
    });

    res.json(updated);

  } catch (err) {
    console.error("updateExercise error:", err);
    res.status(500).json({ error: "Failed to update exercise." });
  }
}

// ── Delete an exercise ─────────────────────────────────────────
// DELETE /api/exercises/:id
async function deleteExercise(req, res) {
  try {
    const exerciseId = Number(req.params.id);

    const existing = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Exercise not found." });
    }

    await prisma.exercise.delete({
      where: { id: exerciseId },
    });

    res.json({ success: true });

  } catch (err) {
    console.error("deleteExercise error:", err);
    res.status(500).json({ error: "Failed to delete exercise." });
  }
}

module.exports = {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
};