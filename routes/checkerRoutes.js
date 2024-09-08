const express = require("express");
const router = express.Router();

const { authenticateUser } = require('../middleware'); 

const {
  createChecker,
  updateChecker,
  getCheckerByProblemId,
} = require("../controllers/checkerController");

// Create a new checker
router.post("/:problemId", authenticateUser, createChecker);

// Update a checker
router.put("/:problemId",authenticateUser, updateChecker);

// Get a checker
router.get("/:problemId", getCheckerByProblemId);


module.exports = router;