const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Editorial = sequelize.define("Editorial", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
    },
  });

  return Editorial;
};
