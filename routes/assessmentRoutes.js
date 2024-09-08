const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

const { authenticateCompany, authenticateUser, authorize } = require('../middleware');


const {
    createAssessment,
    getAllAssessmentsForCompany,
    getAssessmentById,
    updateAssessment,
    deleteAssessment,
    associateProblems,
    updateAssessmentProblems,
    getAssessmentsByUserId,
    getProblemsForRunningAssessment,
  } = require("../controllers/assessmentController");

// Create a new assessment
router.post('/', authenticateCompany, createAssessment);

// Get all assessments for authenticated company
router.get('/', authenticateCompany, getAllAssessmentsForCompany);

// Get all upcoming and currently running assessments by logged-in user
router.get('/user', authenticateUser, getAssessmentsByUserId);

// Get all problems for a running assessment by ID
router.get('/:assessmentId/problems', authenticateUser, getProblemsForRunningAssessment);

// Get an assessment by ID
router.get('/:id', authenticateCompany, getAssessmentById);

// Update an assessment
router.put('/:id', authenticateCompany, updateAssessment);

// Delete an assessment
router.delete('/:id', authenticateCompany, deleteAssessment);

// Associate problems with an assessment
router.post('/:assessmentId/problems', authenticateCompany, associateProblems);

// Update problems associated with an assessment
router.put('/:assessmentId/problems', authenticateCompany, updateAssessmentProblems);

module.exports = router;
