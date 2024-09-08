const { Problem, User, User_Problem, Difficulty } = require("../models/index");
const { Tag } = require("../models/index");
const { Op } = require("sequelize");
const {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} = require("../errors");
const { getEntityById, getAllEntities } = require('../utils/commonHelpers');
const handleError = require("../utils/errorHandler");


// Create a problem
exports.createProblem = async (req, res, next) => {
  try {
    const { title } = req.body;

    // Create the problem with just the title
    const problem = await Problem.create({
      title: title,
      owner_id: req.userId,
    });

    res.status(201).json({ problem });
  } catch (error) {
    handleError(error, next, "Error creating problem");
  }
};

// Update general info of a problem
exports.updateGeneralInfo = async (req, res, next) => {
  try {
    const id = req.params.problem_id;
    const {
      title,
      input_file,
      output_file,
      timelimit,
      memorylimit,
      tags,
      difficulty_id,
    } = req.body;

    // Find the problem by ID and include the associated tags
    const problem = await Problem.findByPk(id, {
      include: [
        { model: Tag, attributes: ["tag_name"] },
        { model: Difficulty, attributes: ["id", "difficulty"] },
      ],
    });

    if (!problem) {
      throw new NotFoundError("Problem not found");
    }

    // Update the problem information
    const updatedProblem = await problem.update({
      title,
      input_file,
      output_file,
      timelimit,
      memorylimit,
    });

    if (difficulty_id) {
      // Check if the provided difficulty ID exists
      const difficulty = await Difficulty.findByPk(difficulty_id);
      if (!difficulty) {
        throw new BadRequestError("Invalid difficulty ID");
      }
      await updatedProblem.setDifficulty(difficulty);
    } else {
      // If difficulty_id is not provided, reset the difficulty association
      await updatedProblem.setDifficulty(null);
    }

    // Update the associated tags
    if (tags && tags.length > 0) {
      const existingTags = await Tag.findAll({
        where: { tag_name: { [Op.in]: tags } },
        attributes: ["id", "tag_name"],
      });

      const existingTagIds = existingTags.map((tag) => tag.id);

      await updatedProblem.setTags(existingTagIds);
    } else {
      await updatedProblem.setTags([]); // If no tags provided, remove all associated tags
    }

    // Fetch the updated problem with the associated tag names
    const updatedProblemWithTags = await Problem.findByPk(id, {
      include: [
        { model: Tag, attributes: ["tag_name"] },
        { model: Difficulty, attributes: ["difficulty"] },
      ],
    });

    // Extract the tag names
    const updatedTags = updatedProblemWithTags.Tags.map((tag) => tag.tag_name);

    // Create the general information object
    const generalInfo = {
      id: updatedProblemWithTags.id,
      title: updatedProblemWithTags.title,
      input_file: updatedProblemWithTags.input_file,
      output_file: updatedProblemWithTags.output_file,
      timelimit: updatedProblemWithTags.timelimit,
      memorylimit: updatedProblemWithTags.memorylimit,
      difficulty: updatedProblemWithTags.Difficulty?.difficulty || "",
      tags: updatedTags,
    };

    res
      .status(200)
      .json({ msg: "Problem updated successfully", problem: generalInfo });
  } catch (error) {
    handleError(error, next, "Error updating problem");
  }
};

// Get general info of a problem
exports.getGeneralInfo = async (req, res, next) => {
  try {
    const userId = req.userId;
    const problem_id = req.params.problem_id;

    // Use the helper function to get the problem by ID
    const problem = await getEntityById(Problem, problem_id, {
      include: [
        {
          model: Difficulty,
          attributes: ["difficulty"],
        },
        {
          model: Tag,
          attributes: ["tag_name"],
        },
      ],
    });

    // Fetch the tag names of the associated tags
    const tags = problem.Tags.map((tag) => tag.tag_name);

    // Create the general information object
    const generalInfo = {
      id: problem.id,
      title: problem.title,
      input_file: problem.input_file,
      output_file: problem.output_file,
      timelimit: problem.timelimit,
      memorylimit: problem.memorylimit,
      tags: tags,
      difficulty: problem.Difficulty ? problem.Difficulty.difficulty : "",
    };

    res.status(200).json(generalInfo);
  } catch (error) {
    handleError(error, next, "Error fetching problem general info");
  }
};


// Get user's problems
exports.getMyProblems = async (req, res, next) => {
  try {
    const userId = req.userId;
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 10;
    const offset = (currentPage - 1) * perPage;

    // Find problems associated with the user
    const ownedProblems = await Problem.findAll({
      where: { owner_id: userId },
      attributes: ["id", "title", "createdAt", "updatedAt"],
      include: [
        {
          model: User,
          foreignKey: "owner_id",
          attributes: ["username"],
        },
      ],
    });

    // Find all problems the user has access to
    const userProblems = await User_Problem.findAll({
      where: {
        user_id: userId,
        can_read: true,
      },
      attributes: ["problem_id"],
    });

    const problemIds = [
      ...new Set([
        ...ownedProblems.map((p) => p.id),
        ...userProblems.map((up) => up.problem_id),
      ]),
    ];
    const problems = await Problem.findAll({
      where: { id: problemIds },
      attributes: ["id", "title", "createdAt", "updatedAt"],
      include: [
        {
          model: User,
          foreignKey: "owner_id",
          attributes: ["username"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: perPage,
      offset: offset,
    });

    // Reshape the data structure
    const formattedProblems = problems.map((problem) => ({
      id: problem.id,
      title: problem.title,
      owner: problem.User.username,
      createdAt: problem.createdAt,
      updatedAt: problem.updatedAt,
    }));

    const totalProblems = await Problem.count({ where: { id: problemIds } });
    const totalPages = Math.ceil(totalProblems / perPage);

    res
      .status(200)
      .json({ problems: formattedProblems, totalPages: totalPages });
  } catch (error) {
    handleError(error, next, "Error fetching user problems");
  }
};

// Update problem statements
exports.updateProblemStatments = async (req, res, next) => {
  try {
    const userId = req.userId;
    const problem_id = req.params.problem_id;
    const {
      description,
      notes,
      tutorial,
      input_description,
      output_description,
    } = req.body;

    // Find the problem by ID
    const problem = await Problem.findByPk(problem_id);

    if (!problem) {
      throw new NotFoundError("Problem not found");
    }

    if (description) {
      problem.description = description;
    }
    if (notes) {
      problem.notes = notes;
    }
    if (tutorial) {
      problem.tutorial = tutorial;
    }
    if (input_description) {
      problem.input_description = input_description;
    }
    if (output_description) {
      problem.output_description = output_description;
    }

    // Save the updated problem
    await problem.save();

    const statements = {
      id: problem.id,
      description: problem.description,
      notes: problem.notes,
      tutorial: problem.tutorial,
      input_description: problem.input_description,
      output_description: problem.output_description,
    };

    res
      .status(200)
      .json({ msg: "Problem updated successfully", statements: statements });
  } catch (error) {
    handleError(error, next, "Error updating problem statements");
  }
};

// Get problem statements
exports.getProblemStatements = async (req, res, next) => {
  try {
    const problem_id = req.params.problem_id;
    const userId = req.userId;

    // Find the problem by ID
    const problem = await Problem.findByPk(problem_id);

    if (!problem) {
      throw new NotFoundError("Problem not found");
    }

    const statements = {
      id: problem.id,
      description: problem.description,
      notes: problem.notes,
      tutorial: problem.tutorial,
      input_description: problem.input_description,
      output_description: problem.output_description,
    };

    res.status(200).json({
      message: "Problem statements retrieved successfully",
      statements,
    });
  } catch (error) {
    handleError(error, next, "Error fetching problem statements");
  }
};

// Get all problem details
exports.getAllProblemDetails = async (req, res, next) => {
  try {
    const problem_id = req.params.problem_id;

    const problem = await Problem.findByPk(problem_id, {
      include: {
        model: Tag,
        through: {
          attributes: [],
        },
      },
    });

    const problemDetails = {
      title: problem.title || "",
      description: problem.description || "",
      input_file: problem.input_file || "",
      output_file: problem.output_file || "",
      timelimit: problem.timelimit || null,
      memorylimit: problem.memorylimit || null,
      notes: problem.notes || "",
      tutorial: problem.tutorial || "",
      input_description: problem.input_description || "",
      output_description: problem.output_description || "",
      tags: problem.Tags.map((tag) => tag.tag_name),
    };

    res.status(200).json({
      message: "Problem details retrieved successfully",
      problemDetails,
    });
  } catch (error) {
    handleError(error, next, "Error fetching problem details");
  }
};

exports.getAllProblems = async (req, res, next) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 10;
    const offset = (currentPage - 1) * perPage;
    const problems = await Problem.findAll({
      where: {
        visibility: "public",
      },
      attributes: ["id", "title", "updatedAt"],
      include: [
        {
          model: Difficulty,
          attributes: ["difficulty"],
        },
        {
          model: Tag,
          through: {
            attributes: [],
          },
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: perPage,
      offset: offset,
    });

    const formattedProblems = problems.map((problem) => ({
      id: problem.id,
      title: problem.title || "",
      difficulty: problem.Difficulty ? problem.Difficulty.difficulty : "",
      Tags: problem.Tags.map((tag) => tag.tag_name),
    }));

    const totalProblems = await Problem.count({
      where: {
        visibility: 'public',
      },
    });
    const totalPages = Math.ceil(totalProblems / perPage);

    res
      .status(200)
      .json({
        message: "Problems fetched successfully",
        problems: formattedProblems,
        totalPages: totalPages,
      });
  } catch (err) {
    handleError(err, next, "Error fetching problems");
  }
};

exports.searchProblems = async (req, res, next) => {
  try {
    const { title, id, limit } = req.query;
    const conditions = {};

    if (title) {
      conditions.title = { [Op.like]: `%${title}%` };
    }

    if (id) {
      conditions.id = id;
    }

    const options = {
      where: conditions,
      include: [
        {
          model: Difficulty,
          attributes: ['difficulty'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
          through: { attributes: [] },
        },
      ],
      limit: limit ? parseInt(limit, 10) : undefined
    };

    const problems = await getAllEntities(Problem, options);
    const formattedProblems = problems.map(problem => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.Difficulty ? problem.Difficulty.difficulty : null,
      tags: problem.Tags ? problem.Tags.map(tag => tag.tag_name) : [],
    }));
    res.status(200).json({ problems: formattedProblems });
  } catch (error) {
    handleError(error, next, "Error searching for problems");
  }
};