const express = require('express');
const router = express.Router();

const { authenticateUser, authorize } = require('../middleware');

const { getAllPlans, createPlan, updatePlan, getPlan, deletePlan} = require('../controllers/planController');

// Get all plans
router.get('/', getAllPlans);

// Create a new plan
router.post('/', authenticateUser, authorize(['admin']), createPlan);

// Update a plan
router.put('/:id', authenticateUser, authorize(['admin']), updatePlan);

// Get a plan by ID
router.get('/:id', getPlan);

// Delete a plan
router.delete('/:id', authenticateUser, authorize(['admin']), deletePlan);

module.exports = router;