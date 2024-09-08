const express = require("express");
const router = express.Router({ mergeParams: true });

const { authenticateUser, authorize, userHasPermissionToAccessProblem } = require('../middleware');

const {
  createTestcase,
  updateTestcase,
  deleteTestcase,
  getTestcase,
  getAllTestcases,
  swapTestcases,
} = require("../controllers/testcaseController");

// Create a new testcase
router.post("/", authenticateUser, userHasPermissionToAccessProblem(["can_create"]), createTestcase);

// Get a specific testcase
router.get("/:testcase_id", authenticateUser, userHasPermissionToAccessProblem(["can_read"]), getTestcase);

// Update a testcase
router.put("/:testcase_id", authenticateUser, userHasPermissionToAccessProblem(["can_update"]), updateTestcase);

// Delete a testcase
router.delete("/:testcase_id", authenticateUser, userHasPermissionToAccessProblem(["can_delete"]), deleteTestcase);

// Get all testcases for a problem
router.get("/", authenticateUser, userHasPermissionToAccessProblem(["can_read"]), getAllTestcases);

router.put("/swap/:testcase_id_1/:testcase_id_2", authenticateUser, userHasPermissionToAccessProblem(["can_update"]), swapTestcases);

module.exports = router;