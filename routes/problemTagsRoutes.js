// routes/problemTags.js
const express = require('express');
const router = express.Router();
const { getAllTagsForProblem, updateTagsForProblem, getAllProblemsForTag} = require('../controllers/problemTagsController');

router.get('/problem/:problemId/tags', getAllTagsForProblem);
router.get('/tag/:tagId/problems', getAllProblemsForTag);
router.put('/', updateTagsForProblem);

module.exports = router;