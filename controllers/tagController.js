const { Tag } = require("../models/index");
const { NotFoundError, InternalServerError } = require("../errors");
const handleError = require('../utils/errorHandler');

// Get all tags
exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      attributes: ["id", "tag_name"],
    });
    res.status(200).json({ tags: tags });
  } catch (err) {
    handleError(err, next, "Error retrieving tags");
  }
};

// Create a new tag
exports.createTag = async (req, res, next) => {
  try {
    const { tag_name } = req.body;

    // Create a new tag
    const tag = await Tag.create({ tag_name });

    res.status(201).json({ message: "Tag created", tag });
  } catch (err) {
    handleError(err, next, "Error creating tag");
  }
};

// Delete a tag
exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the tag by ID
    const tag = await Tag.findByPk(id);

    if (!tag) {
      throw new NotFoundError(`No tag found with id: ${id}`);
    }

    // Delete the tag
    await tag.destroy();

    res.status(200).json({ message: "Tag deleted" });
  } catch (err) {
    handleError(err, next, "Error deleting tag");
  }
};

// Update a tag
exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tag_name } = req.body;

    const updatedTag = { tag_name };

    // Update the tag
    const [rowsUpdated, [tag]] = await Tag.update(updatedTag, {
      where: { id },
      returning: true,
      individualHooks: true,
    });

    if (rowsUpdated === 0 || !tag) {
      throw new NotFoundError(`No tag found with id: ${id}`);
    }

    res.status(200).json({ message: "Tag successfully updated", tag });
  } catch (err) {
    handleError(err, next, "Error updating tag");
  }
};
