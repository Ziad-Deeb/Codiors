const express = require("express");
const router = express.Router();

const { authenticateUser, authorize } = require('../middleware');

const {
  createDifficulty,
  getAllDifficulties,
  getDifficultyById,
  updateDifficulty,
  deleteDifficulty,
} = require("../controllers/difficultyController");

// Create a new difficulty
router.post("/", authenticateUser, authorize(['admin']), createDifficulty);

// Get all difficulties
router.get("/", getAllDifficulties);

// Get a single difficulty by ID
router.get("/:id", getDifficultyById);

// Update a difficulty
router.put("/:id", authenticateUser, authorize(['admin']), updateDifficulty);

// Delete a difficulty
router.delete("/:id", authenticateUser, authorize(['admin']), deleteDifficulty);

module.exports = router;
