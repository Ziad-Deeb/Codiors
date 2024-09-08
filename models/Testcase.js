const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Testcase = sequelize.define("Testcase", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    test_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    input: {
      type: DataTypes.TEXT,
    },
    output: {
      type: DataTypes.TEXT,
    },
    isSample: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  Testcase.associate = (models) => {
    Testcase.belongsTo(models.Problem, { foreignKey: "problem_id" });
  };

  return Testcase;
};
