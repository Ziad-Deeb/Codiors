const express = require('express');
const router = express.Router();

const { authenticateUser, authorize, userHasPermissionToAccessProblem } = require('../middleware');

const {
  submitCode,
  submitMultipleSolutions,
  getUserSubmissions,
  getSubmissionById,
  getAllSubmissions,
} = require("../controllers/submissionController");

// Route to submit code
router.post('/submit/:problem_id', authenticateUser, submitCode);

// Route to submit multiple solutions for an assessment
router.post('/:assessment_id/submitMultipleSolutions', submitMultipleSolutions);

// Get all submissions of a specific user
router.get('/user/:user_id', getUserSubmissions);

// Get a specific submission by its ID
router.get('/:submission_id', getSubmissionById);

// Get all submissions 
router.get('/', getAllSubmissions);

module.exports = router;
