const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Checker = sequelize.define("Checker", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.TEXT,
    },
  });

  Checker.associate = (models) => {
    Checker.belongsTo(models.Problem, { foreignKey: "problem_id" });
    Checker.belongsTo(models.Programming_Language, { foreignKey: "programming_language_id" });
  };

  return Checker;
};