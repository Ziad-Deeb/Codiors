const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const QuestionType = sequelize.define("Question_Type", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return QuestionType;
};
