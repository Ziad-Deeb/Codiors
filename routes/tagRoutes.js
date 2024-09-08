const express = require("express");
const router = express.Router();
const {
  getAllTags,
  createTag,
  deleteTag,
  updateTag,
} = require("../controllers/tagController");

router.get("/", getAllTags);

router.post("/", createTag);

router.delete("/:id", deleteTag);

router.put("/:id", updateTag);

module.exports = router;
