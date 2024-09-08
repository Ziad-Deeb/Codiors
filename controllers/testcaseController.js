const { Testcase, Problem } = require("../models/index");
const { NotFoundError, BadRequestError, InternalServerError } = require("../errors");

// Create a new testcase
exports.createTestcase = async (req, res, next) => {
    try {
      const {problem_id} = req.params;
      const { test_index, input, output, isSample } = req.body;

      const problem = await Problem.findOne({
        where: { id: problem_id },
        attributes: ["owner_id"],
      });

      if (!problem) {
        throw new NotFoundError(`No problem found with id: ${problem_id}`);
      }

      if (!test_index) {
        throw new BadRequestError("Test index must not be null");
      }  

      const existingTestcase = await Testcase.findOne({
        where: { test_index, problem_id },
      });
  
      if (existingTestcase) {
        throw new BadRequestError(`Testcase with test index ${test_index} already exists`);
      }
  
      const testcase = await Testcase.create({
        problem_id,
        test_index,
        input,
        output,
        isSample
      });
  
      res.status(201).json({ message: "Testcase created", testcase });
    } catch (err) {
      if (!err.statusCode) {
        err = new InternalServerError("Error creating testcase");
      }
      next(err);
    }
  };

  // Get a specific testcase
exports.getTestcase = async (req, res, next) => {
    try {
      const { problem_id, testcase_id } = req.params;
  
      const testcase = await Testcase.findOne({
        where: { id: testcase_id, problem_id: problem_id },
      });
  
      if (!testcase) {
        throw new NotFoundError(`No testcase found with id: ${testcase_id} for problem id: ${problem_id}`);
      }
  
      res.status(200).json({ message: "Testcase retrieved", testcase });
    } catch (err) {
      if (!err.statusCode) {
        err = new InternalServerError("Error retrieving testcase");
      }
      next(err);
    }
  };
  
  // Update a specific testcase
exports.updateTestcase = async (req, res, next) => {
    try {
      const { problem_id, testcase_id } = req.params;
      const { input, output, isSample } = req.body;
  
      const testcase = await Testcase.findOne({
        where: { id: testcase_id, problem_id: problem_id },
      });
  
      if (!testcase) {
        throw new NotFoundError(`No testcase found with id: ${testcase_id} for problem id: ${problem_id}`);
      }

      // Update the testcase fields
    if(input) {
        testcase.input = input;
    }
    if(output) {
        testcase.output = output;
    }
    if (isSample !== undefined) {
      testcase.isSample = isSample;
    }
  
      // Save the updated testcase
      await testcase.save();
  
      res.status(200).json({ message: "Testcase updated", testcase });
    } catch (err) {
      if (!err.statusCode) {
        err = new InternalServerError("Error updating testcase");
      }
      next(err);
    }
  };

  // Delete a specific testcase
exports.deleteTestcase = async (req, res, next) => {
    try {
      const { problem_id, testcase_id } = req.params;
  
      const testcase = await Testcase.findOne({
        where: { id: testcase_id, problem_id: problem_id },
      });
  
      if (!testcase) {
        throw new NotFoundError(`No testcase found with id: ${testcase_id} for problem id: ${problem_id}`);
      }
  
      // Delete the testcase
      await testcase.destroy();
  
      res.status(200).json({ message: "Testcase deleted" });
    } catch (err) {
      if (!err.statusCode) {
        err = new InternalServerError("Error deleting testcase");
      }
      next(err);
    }
  };
  
// Get all testcases for a problem
exports.getAllTestcases = async (req, res, next) => {
    try {
      const  problem_id  = req.params.problem_id;
      console.log(problem_id);
  
      const problem = await Problem.findOne({
        where: { id: problem_id },
        attributes: ["id"],
      });
  
      if (!problem) {
        throw new NotFoundError(`No problem found with id: ${problem_id}`);
      }
  
      const testcases = await Testcase.findAll({
        where: { problem_id: problem_id },
        order: [['test_index', 'ASC']], 
      });
  
      res.status(200).json({ message: "Testcases retrieved", testcases });
    } catch (err) {
      if (!err.statusCode) {
        err = new InternalServerError("Error retrieving testcases");
      }
      next(err);
    }
  };

  // swap the positions of two testcases based on their test_index
  exports.swapTestcases = async (req, res, next) => {
    try {
      const { problem_id, testcase_id_1, testcase_id_2 } = req.params;
  
      const testcase1 = await Testcase.findOne({
        where: { id: testcase_id_1, problem_id: problem_id },
      });
      const testcase2 = await Testcase.findOne({
        where: { id: testcase_id_2, problem_id: problem_id },
      });
  
      if (!testcase1 || !testcase2) {
        throw new NotFoundError("One or more testcases not found");
      }
  
      // Swap the test_index values
      const tempTestIndex = testcase1.test_index;
      testcase1.test_index = testcase2.test_index;
      testcase2.test_index = tempTestIndex;
  
      // Save the changes to the database
      await testcase1.save();
      await testcase2.save();
  
      res.status(200).json({ message: "Testcases swapped successfully" });
    } catch (err) {
      if (!err.statusCode) {
        err = new InternalServerError("Error swapping testcases");
      }
      next(err);
    }
  };