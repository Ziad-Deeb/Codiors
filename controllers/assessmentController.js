const { Op, Sequelize } = require("sequelize");
const {
  Assessment,
  Problem,
  Assessment_Problem,
  Company_Subscription,
  Plan,
  User,
  Company,
  User_Problem
} = require("../models");
const {
  NotFoundError,
  InternalServerError,
  BadRequestError,
} = require("../errors");

const { findUserByUsername } = require('../utils/userHelpers');
const { findActiveSubscription } = require('../utils/assessmentHelpers');
const { getEntityById, updateEntityById, getAllEntities, getEntity } = require('../utils/commonHelpers');
const handleError = require('../utils/errorHandler');

// Create a new assessment
exports.createAssessment = async (req, res, next) => {
  try {
    const company_id = req.companyId;
    const { username, assessment_date, assessment_duration, candidate_score, evaluation_notes } = req.body;

    const user = await getEntity(User, {
      where: {username}, 
      attributes: ['id']
    });
    console.log(user);
    // const user = await findUserByUsername(username);
    const candidate_id = user.id;
    const candidate_name = username;

    const currentSubscription = await findActiveSubscription(company_id);

    const { attempts_per_month } = currentSubscription.Plan;

    // Check if assessment_date is in the past
    if (new Date(assessment_date) < new Date()) {
      throw new BadRequestError("Assessment date must be in the future");
    }

    const assessmentsThisSubscriptionCount = await Assessment.count({
      where: {
        company_id,
        assessment_date: {
          [Op.between]: [
            currentSubscription.start_date,
            currentSubscription.end_date,
          ],
        },
      },
    });

    if (assessmentsThisSubscriptionCount >= attempts_per_month) {
      throw new BadRequestError(
        `You have reached the assessment limit (${attempts_per_month}) for the current subscription period as per your plan`
      );
    }

    const assessment = await Assessment.create({
      candidate_id,
      company_id,
      assessment_date,
      assessment_duration,
      candidate_score,
      evaluation_notes,
    });

    res.status(201).json({ 
      message: "Assessment created successfully", 
      assessment: { 
        id: assessment.id,
        candidate_id,
        candidate_name,
        assessment_date,
        assessment_duration,
        candidate_score,
        evaluation_notes,
        createdAt: assessment.createdAt 
      } 
    });
  } catch (err) {
    handleError(err, next, "Error creating assessment");
  }
};

// Get all assessments for authenticated company
exports.getAllAssessmentsForCompany = async (req, res, next) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 10;
    const offset = (currentPage - 1) * perPage;

    // Fetch assessments with pagination
    const assessments = await Assessment.findAll({
      where: {
        company_id: req.companyId,
      },
      limit: perPage,
      offset: offset,
      order: [['assessment_date', 'DESC']] // Order by assessment date, most recent first
    });

    // Count the total number of assessments for pagination
    const totalAssessments = await Assessment.count({ where: { company_id: req.companyId } });
    const totalPages = Math.ceil(totalAssessments / perPage);

    res.status(200).json({ assessments, totalPages: totalPages });
  } catch (err) {
    handleError(err, next, "Error fetching assessments");
  }
};

// Get an assessment by ID
exports.getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;

    const assessment = await Assessment.findByPk(id, {
      where: {
        id,
        company_id: companyId, // Check that the assessment belongs to the requesting company
      },
      include: [
        {
          model: Problem,
          attributes: ["id", "title"],
        },
      ],
    });

    if (!assessment) {
      throw new NotFoundError(`No assessment found with id: ${id}`);
    }

    res.status(200).json({ assessment });
  } catch (err) {
    handleError(err, next, "Error fetching assessment");
  }
};

// Update an assessment
exports.updateAssessment = async (req, res, next) => {
  try {
    const company_id = req.companyId;
    const { id } = req.params;
    const { username, assessment_date, assessment_duration, candidate_score, evaluation_notes } = req.body;

    const assessment = await Assessment.findOne({
      where: { id, company_id },
    });

    if (!assessment) {
      throw new NotFoundError(`No assessment found with id: ${id} for the company`);
    }

    const currentSubscription = await findActiveSubscription(company_id);
    const { attempts_per_month } = currentSubscription.Plan;

    // Validate assessment date
    if (assessment_date && new Date(assessment_date) < new Date()) {
      throw new BadRequestError("Assessment date must be in the future");
    }

    // Update assessment fields
    if (username) {
      const user = await findUserByUsername(username);
      assessment.candidate_id = user.id;
      assessment.candidate_name = username;
    }
    if (assessment_date) assessment.assessment_date = assessment_date;
    if (assessment_duration) assessment.assessment_duration = assessment_duration;
    if (candidate_score) assessment.candidate_score = candidate_score;
    if (evaluation_notes) assessment.evaluation_notes = evaluation_notes;

    await assessment.save();

    res.status(200).json({ 
      message: "Assessment updated successfully", 
      assessment: { 
        id: assessment.id,
        candidate_id: assessment.candidate_id,
        candidate_name: assessment.candidate_name,
        assessment_date: assessment.assessment_date,
        assessment_duration: assessment.assessment_duration,
        candidate_score: assessment.candidate_score,
        evaluation_notes: assessment.evaluation_notes,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt 
      } 
    });
  } catch (err) {
    handleError(err, next, "Error updating assessment");
  }
};



// Delete an assessment
exports.deleteAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the assessment by ID
    const assessment = await Assessment.findByPk(id);

    if (!assessment) {
      throw new NotFoundError(`No assessment found with id: ${id}`);
    }

    // Delete the assessment
    await assessment.destroy();

    res.status(200).json({ message: "Assessment deleted" });
  } catch (err) {
    handleError(err, next, "Error deleting assessment");
  }
};

// Associate problems with an assessment
exports.associateProblems = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const { problems } = req.body;

    const assessment = await Assessment.findByPk(assessmentId);

    if (!assessment) {
      throw new NotFoundError(`No assessment found with id: ${assessmentId}`);
    }

    const { company_id, candidate_id, assessment_date, assessment_duration } = assessment;
    const currentSubscription = await findActiveSubscription(company_id);
    const { question_pool_size } = currentSubscription.Plan;

    if (problems.length > question_pool_size) {
      throw new BadRequestError(
        `You can only select up to ${question_pool_size} problems as per your plan`
      );
    }

    const assessments = await Assessment.findAll({
      where: { company_id },
      attributes: ["id"],
    });

    const assessmentIds = assessments.map((assessment) => assessment.id);

    const totalProblemsUsed = await Assessment_Problem.count({
      where: {
        assessment_id: { [Op.in]: assessmentIds },
      },
    });

    if (totalProblemsUsed + problems.length > question_pool_size) {
      throw new BadRequestError(
        `You have exceeded the total allowed problems (${question_pool_size}) as per your plan`
      );
    }

    await assessment.setProblems(problems);

    // Calculate start and end times for the user problem permissions
    const start_time = new Date(assessment_date);
    const end_time = new Date(assessment_date);
    end_time.setMinutes(end_time.getMinutes() + assessment_duration);

    // Update User_Problem permissions
    const userProblemsData = problems.map(problem_id => ({
      problem_id,
      user_id: candidate_id,
      can_read: true,
      start_time,
      end_time
    }));

    await User_Problem.bulkCreate(userProblemsData, {
      updateOnDuplicate: ['can_read', 'start_time', 'end_time']
    });

    res
      .status(200)
      .json({ message: "Problems associated with assessment successfully" });
  } catch (err) {
    handleError(err, next, "Error associating problems with assessment");
  }
};

// Update problems associated with an assessment
exports.updateAssessmentProblems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { problems } = req.body;

    const assessment = await Assessment.findByPk(id);

    if (!assessment) {
      throw new NotFoundError(`No assessment found with id: ${id}`);
    }

    const { company_id } = assessment;
    const currentSubscription = await findActiveSubscription(company_id);
    const { question_pool_size } = currentSubscription.Plan;

    if (problems.length > question_pool_size) {
      throw new BadRequestError(
        `You can only select up to ${question_pool_size} problems as per your plan`
      );
    }

    const assessments = await Assessment.findAll({
      where: { company_id },
      attributes: ["id"],
    });

    const assessmentIds = assessments.map((assessment) => assessment.id).filter(assessmentId => assessmentId !== id);

    const totalProblemsUsed = await Assessment_Problem.count({
      where: {
        assessment_id: { [Op.in]: assessmentIds },
      },
    });

    const currentAssessmentProblems = await Assessment_Problem.count({
      where: {
        assessment_id: id,
      },
    });

    if (totalProblemsUsed + problems.length - currentAssessmentProblems > question_pool_size) {
      throw new BadRequestError(
        `You have exceeded the total allowed problems (${question_pool_size}) as per your plan`
      );
    }

    await assessment.setProblems(problems);

    res
      .status(200)
      .json({ message: "Problems associated with assessment successfully updated" });
  } catch (err) {
    handleError(err, next, "Error updating problems associated with assessment");
  }
};

// get all upcoming and currently running assessments by logged-in user
exports.getAssessmentsByUserId = async (req, res, next) => {
  const userId = req.userId;

  try {
    const now = new Date();
    const assessments = await getAllEntities(Assessment, {
      where: {
        candidate_id: userId,
        [Op.or]: [
          { assessment_date: { [Op.gt]: now } }, // Upcoming assessments
          Sequelize.literal(`assessment_date <= NOW() AND (assessment_date + assessment_duration * INTERVAL '1 minute') >= NOW()`) // Currently running assessments
        ]
      },
      attributes: ['id', 'assessment_date', 'assessment_duration'],
      include: [
        {
          model: Company,
          attributes: ['name']
        }
      ], 
      order: [['assessment_date', 'ASC']] // Order by assessment date from closest to farthest
    });
    res.status(200).json(assessments);
  } catch (err) {
    handleError(err, next, "Error fetching assessments");
  }
};

// get all problems for a running assessment by ID
exports.getProblemsForRunningAssessment = async (req, res, next) => {
  const userId = req.userId;
  const assessmentId = req.params.assessmentId;

  try {
    const now = new Date();

    // Define the options for the query
    const options = {
      where: {
        id: assessmentId,
        candidate_id: userId,
        [Op.and]: [
          { assessment_date: { [Op.lte]: now } },
          Sequelize.literal(`(assessment_date + interval '1 minute' * assessment_duration) >= NOW()`)
        ]
      },
      attributes: ['assessment_date', 'assessment_duration'],
      include: [
        {
          model: Problem,
          attributes: ['id', 'title'],
          through: { attributes: [] } // Exclude join table attributes
        }
      ]
    };

    // Fetch the assessment and check if it is currently running
    const assessment = await getEntity(Assessment, options);

    const problems = assessment.Problems;
    res.status(200).json({problems, assessment_date: assessment.assessment_date, assessment_duration: assessment.assessment_duration});
  } catch (err) {
    handleError(err, next, "Error fetching problems for the running assessment");
  }
};