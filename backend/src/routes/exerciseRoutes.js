// backend/src/routes/exerciseRoutes.js

const express = require("express");
const router  = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} = require("../controllers/exerciseController");

// Every route below requires a valid token.
// router.use(authMiddleware) applies the middleware to ALL routes
// defined after this line, in this router - so we don't have to
// repeat authMiddleware on every single line.
router.use(authMiddleware);

router.get("/", getExercises);
router.post("/", createExercise);
router.put("/:id", updateExercise);
router.delete("/:id", deleteExercise);

module.exports = router;