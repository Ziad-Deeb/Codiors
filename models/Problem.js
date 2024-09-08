const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Problem = sequelize.define("Problem", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    input_file: {
      type: DataTypes.STRING,
    },
    output_file: {
      type: DataTypes.STRING,
    },
    timelimit: {
      type: DataTypes.INTEGER,
    },
    memorylimit: {
      type: DataTypes.INTEGER,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    tutorial: {
      type: DataTypes.TEXT,
    },
    input_description: {
      type: DataTypes.TEXT,
      comment: "Describes the expected format and structure of the input data."
    },
    output_description: {
      type: DataTypes.TEXT,
      comment: "Describes the expected format and structure of the output data."
    },
    visibility: {
      type: DataTypes.ENUM('public', 'company', 'restricted'),
      defaultValue: 'restricted',
    },

  });

  Problem.associate = (models) => {
    Problem.belongsTo(models.Difficulty, { foreignKey: "difficulty_id" });
    Problem.belongsTo(models.QuestionType, { foreignKey: "question_type_id" });
    Problem.belongsTo(models.User, { foreignKey: "owner_id" });
    Problem.belongsToMany(models.Tag, {
      through: "Problem_Tag",
      foreignKey: "problem_id",
    });
    Problem.hasMany(models.Testcase, { foreignKey: "problem_id" });
    Problem.hasMany(models.Discussion, { foreignKey: "problem_id" });
    Problem.hasMany(models.Submission, { foreignKey: "problem_id" });
    Problem.hasOne(models.Checker, { foreignKey: "problem_id" });
    Problem.belongsToMany(models.Assessment, {
      through: "Assessment_Problems",
      foreignKey: "problem_id",
    });
  };

  return Problem;
};
