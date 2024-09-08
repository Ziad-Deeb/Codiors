const { Submission, User, Problem, Programming_Language, Testcase, Assessment, Assessment_Problem } = require('../models');
const { runCode } = require('../services/codeRunner');
const { generateEvaluationNotes } = require('../services/aiEvaluator');
const { getEntityById, updateEntityById, getAllEntities, getEntity } = require('../utils/commonHelpers');
const solutionQueue = require('../jobs/solutionProcessor');
const singleSolutionQueue = require('../jobs/singleSolutionProcessor.js');


const handleError = require('../utils/errorHandler');
const models = require('../models');

exports.submitCode = async (req, res, next) => {
  const user_id = req.userId;
  const problem_id = req.params.problem_id;
  const { code, programming_language_id } = req.body;

  try {
    // Create the submission with the default status "In Queue"
    const submission = await Submission.create({
      code,
      result: 'In Queue', // Default status
      errorMessage: '',
      user_id,
      problem_id,
      programming_language_id
    });

    // Enqueue the job for processing the solution
    singleSolutionQueue.add({ submissionId: submission.id, user_id, problem_id, code, programming_language_id });

    res.status(202).json({
      message: 'Your solution has been submitted and is currently in the queue for processing.',
      submissionId: submission.id
    });
  } catch (err) {
    handleError(err, next, "Error submitting code for evaluation");
  }
};

exports.submitMultipleSolutions = async (req, res, next) => {
  const assessment_id = req.params.assessment_id;
  const { user_id, solutions } = req.body;

  try {
    const assessment = await getEntityById(Assessment, assessment_id);

    if (assessment.candidate_id !== user_id) {
      return res.status(403).json({ message: 'Forbidden: You are not the candidate for this assessment.' });
    }

    // Enqueue the job for processing solutions
    solutionQueue.add({ assessment_id, user_id, solutions });

    res.status(202).json({
      message: 'Solutions are being processed. You will be notified once the evaluation is complete.'
    });
  } catch (err) {
    handleError(err, next, "Error submitting solutions for evaluation");
  }
};

// Get all submissions of a specific user
exports.getUserSubmissions = async (req, res, next) => {
  const { user_id } = req.params; 
  const { page = 1, limit = 10 } = req.query;

  try {
    const options = {
      where: { user_id: user_id },
      attributes: ['id', 'result', 'time', 'memory', 'createdAt'],
      include: [
        {
          model: Problem,
          attributes: ['id', 'title'],
        },
        {
          model: Programming_Language,
          attributes: ['name'],
        },
        {
          model: User,
          attributes: ['username'],
        },
      ],
      limit: parseInt(limit, 10),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    };

    const { rows: submissions, count: totalSubmissions } = await Submission.findAndCountAll(options);

    res.status(200).json({
      submissions,
      totalPages: Math.ceil(totalSubmissions / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (err) {
    handleError(err, next, "Error fetching user submissions");
  }
};

// Get a specific submission by its ID
exports.getSubmissionById = async (req, res, next) => {
  const { submission_id } = req.params;

  try {
    const submission = await getEntity(Submission, {
      where: { id: submission_id },
      attributes: ['id', 'code', 'result','time' , 'memory', 'errorMessage', 'createdAt'],
      include: [
        {
          model: Problem,
          attributes: ['id', 'title'],
        },
        {
          model: Programming_Language,
          attributes: ['id', 'name'],
        },
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });

    res.status(200).json(submission);
  } catch (err) {
    handleError(err, next, "Error fetching submission");
  }
};

exports.getAllSubmissions = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const options = {
      attributes: ['id', 'result','time' , 'memory', 'createdAt'],
      include: [
        {
          model: Problem,
          attributes: ['id', 'title'],
        },
        {
          model: Programming_Language,
          attributes: ['name'],
        },
        {
          model: User,
          attributes: ['username'],
        },
      ],
      limit: parseInt(limit, 10),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    };

    const { rows: submissions, count: totalSubmissions } = await Submission.findAndCountAll(options);

    res.status(200).json({
      submissions,
      totalPages: Math.ceil(totalSubmissions / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (err) {
    handleError(err, next, "Error fetching submissions");
  }
};