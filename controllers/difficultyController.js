const { Difficulty } = require("../models/index");
const {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} = require("../errors");
const handleError = require('../utils/errorHandler');

// Create a new difficulty:
exports.createDifficulty = async (req, res, next) => {
  try {
    const { difficulty } = req.body;

    const newDifficulty = await Difficulty.create({ difficulty });

    res.status(201).json(newDifficulty);
  } catch (error) {
    handleError(error, next, "Error creating difficulty");
  }
};

// Get all difficulties:
exports.getAllDifficulties = async (req, res, next) => {
  try {
    const difficulties = await Difficulty.findAll();

    res.status(200).json(difficulties);
  } catch (error) {
    handleError(error, next, "Error fetching difficulties");
  }
};

// Get a single difficulty by ID:
exports.getDifficultyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const difficulty = await Difficulty.findByPk(id);

    if (!difficulty) {
      throw new NotFoundError(`No difficulty found with id: ${id}`);
    }

    res.status(200).json(difficulty);
  } catch (error) {
    handleError(error, next, "Error fetching difficulty");
  }
};

// Update a difficulty:
exports.updateDifficulty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { difficulty } = req.body;

    const difficultyToUpdate = await Difficulty.findByPk(id);

    if (!difficultyToUpdate) {
      throw new NotFoundError(`No difficulty found with id: ${id}`);
    }

    await difficultyToUpdate.update({ difficulty });

    res.status(200).json(difficultyToUpdate);
  } catch (error) {
    handleError(error, next, "Error updating difficulty");
  }
};

// Delete a difficulty:
exports.deleteDifficulty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const difficulty = await Difficulty.findByPk(id);

    if (!difficulty) {
      throw new NotFoundError(`No difficulty found with id: ${id}`);
    }

    await difficulty.destroy();

    res.status(200).json({ message: "Difficulty deleted" });
  } catch (error) {
    handleError(error, next, "Error deleting difficulty");
  }
};
