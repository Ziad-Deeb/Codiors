const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Discussion = sequelize.define("Discussion", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  Discussion.associate = (models) => {
    Discussion.belongsTo(models.Problem, { foreignKey: "problem_id" });
    Discussion.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Discussion;
};
