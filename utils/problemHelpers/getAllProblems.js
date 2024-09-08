// utils/problemHelpers/getAllProblems.js
const { Problem } = require("../../models/index");

const getAllProblems = async (attributes = { exclude: [] }) => {
  return await Problem.findAll({ attributes });
};

module.exports = getAllProblems;
