const { Plan } = require("../models/index");
const {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} = require("../errors");

const handleError = require('../utils/errorHandler');

// Get all plans
exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plan.findAll({
        order: [['id', 'ASC']]
      });
      res.status(200).json({ message: "Plans fetched successfully.", plans: plans });
  } catch (err) {
    handleError(err, next, 'Error fetching plans');
  }
};

// Get a single plan
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    res.status(200).json({ message: "Plan fetched successfully.", plan: plan });
  } catch (err) {
    handleError(err, next, 'Error fetching plan');
  }
};

// Create a new plan
exports.createPlan = async (req, res, next) => {
  try {
    const { name, monthly_cost, attempts_per_month, additional_attempt_price, question_pool_size, screen_interview_access } = req.body;
    const plan = await Plan.create({
      name,
      monthly_cost,
      attempts_per_month,
      additional_attempt_price,
      question_pool_size,
      screen_interview_access
    });
    res.status(201).json({ message: "Plan created successfully.", plan: plan });
  } catch (err) {
    handleError(err, next, 'Error creating plan');
  }
};

// Update a plan
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    await plan.update(req.body);
    res.status(200).json({ message: "Plan updated successfully.", plan: plan });
  } catch (err) {
    handleError(err, next, 'Error updating plan');
  }
};

// Delete a plan
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }
    await plan.destroy();
    res.status(200).json({ message: 'Plan deleted' });
  } catch (err) {
    handleError(err, next, 'Error deleting plan');
  }
};