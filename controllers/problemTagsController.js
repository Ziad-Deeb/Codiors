const { Problem, Tag, Problem_Tag } = require('../models');
const handleError  = require('../utils/errorHandler');
const {getEntityById , getAllEntities , deleteEntityById, updateEntityById } = require('../utils/commonHelpers');

  // Get All Tags for a Problem
exports.getAllTagsForProblem = async (req, res, next) => {
    try {
      const { problemId } = req.params;
      const problem = await getEntityById(Problem, problemId, {
        include: [{ model: Tag, through: { attributes: [] }, attributes: ['id', 'tag_name'] }],
      });
      res.status(200).json({ tags: problem.Tags });
    } catch (err) {
      handleError(err, next, 'Error fetching tags for problem');
    }
  };

  // Update the Tags for a Problem
exports.updateTagsForProblem = async (req, res, next) => {
    try {
      const { problemId, tagIds } = req.body;

      // Use Promise.all to fetch problem and tags in parallel
    const [problem, tags] = await Promise.all([
        getEntityById(Problem, problemId, { attributes: ['id'] }),
        getAllEntities(Tag, { where: { id: tagIds }, attributes: ['id', 'tag_name'] })
      ]);
      
      if (tags.length !== tagIds.length) {
        return res.status(400).json({ message: 'Some tags not found' });
      }
      await problem.setTags(tags);
      res.status(200).json({ message: 'Tags updated for problem successfully', tags });
    } catch (err) {
      handleError(err, next, 'Error updating tags for problem');
    }
  };

  // Get All Problems for a Tag
exports.getAllProblemsForTag = async (req, res, next) => {
    try {
      const { tagId } = req.params;
      const tag = await getEntityById(Tag, tagId, {
        include: [{ model: Problem, through: { attributes: [] } }],
      });
      res.status(200).json({ problems: tag.Problems });
    } catch (err) {
      handleError(err, next, 'Error fetching problems for tag');
    }
  };