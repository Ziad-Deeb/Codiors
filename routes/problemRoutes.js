const express = require("express");
const router = express.Router({ mergeParams: true });

const { authenticateUser, authorize, userHasPermissionToAccessProblem } = require('../middleware');

const {
  createProblem,
  updateGeneralInfo,
  getGeneralInfo,
  getMyProblems,
  updateProblemStatments,
  getProblemStatements, 
  getAllProblemDetails,
  getAllProblems, 
  searchProblems, 
} = require("../controllers/problemController");

// POST route to create a new problem
router.post("/cp", authenticateUser, createProblem);

router.put("/generalInfo/:problem_id", authenticateUser, userHasPermissionToAccessProblem(["can_update"]), updateGeneralInfo);

router.get("/generalInfo/:problem_id", authenticateUser, userHasPermissionToAccessProblem(["can_read"]), getGeneralInfo);

router.get("/myProblems", authenticateUser, getMyProblems);

router.put("/statements/:problem_id", authenticateUser, userHasPermissionToAccessProblem(["can_update"]), updateProblemStatments);

router.get("/statements/:problem_id", authenticateUser, userHasPermissionToAccessProblem(["can_read"]), getProblemStatements);

router.get("/problem/:problem_id/details", authenticateUser, userHasPermissionToAccessProblem(["can_read"]), getAllProblemDetails);

router.get("/", getAllProblems);

router.get("/search", searchProblems)

module.exports = router;
