const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProgrammingLanguage = sequelize.define("Programming_Language", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    name: {
      type: DataTypes.STRING,
    },
  });

  ProgrammingLanguage.associate = (models) => {
    ProgrammingLanguage.hasMany(models.Checker, {
      foreignKey: "programming_language_id",
    });
  };

  return ProgrammingLanguage;
};