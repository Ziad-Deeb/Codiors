const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Difficulty = sequelize.define("Difficulty", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Difficulty.associate = (models) => {
    Difficulty.hasMany(models.Problem, { foreignKey: "difficulty_id" });
  };

  return Difficulty;
};
