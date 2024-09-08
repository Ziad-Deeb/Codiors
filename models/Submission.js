const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Submission = sequelize.define("Submission", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING,
      allowNull: false
    },
    errorMessage: {
      type: DataTypes.TEXT
    },
    time: {
      type: DataTypes.INTEGER, // Time in milliseconds
      defaultValue: 0,
    },
    memory: {
      type: DataTypes.INTEGER, // Memory in KB
      defaultValue: 0,
    }
  });

  Submission.associate = (models) => {
    Submission.belongsTo(models.Problem, { foreignKey: "problem_id" });
    Submission.belongsTo(models.User, { foreignKey: "user_id" });
    Submission.belongsTo(models.Programming_Language, { foreignKey: "programming_language_id" });
  };

  return Submission;
};
