const express = require("express");
const router = express.Router();

const { authenticateUser, authorize } = require('../middleware');

const {
  createProgrammingLanguage,
  updateProgrammingLanguage,
  getProgrammingLanguages,
  deleteProgrammingLanguage,
} = require("../controllers/programminLanguageController");

// Create a new Programming Language
router.post("/", authenticateUser, authorize(['admin']),createProgrammingLanguage);

// Update a Programming Language
router.put("/:id", authenticateUser, authorize(['admin']), updateProgrammingLanguage);

// Get Programming Languages
router.get("/", getProgrammingLanguages);

// Delete a Programming Language
router.delete("/:id", authorize(['admin']), deleteProgrammingLanguage);

module.exports = router;
