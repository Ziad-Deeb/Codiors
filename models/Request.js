const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Request = sequelize.define("Request", {
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
    },
    useragent: {
      type: DataTypes.STRING,
    },
    requestBody: {
      type: DataTypes.JSONB,
    },
    statusCode: {
      type: DataTypes.INTEGER,
    },
    responseTime: {
      type: DataTypes.INTEGER,
    },
    responseBody: { 
      type: DataTypes.TEXT,
    },
    referrer: {
      type: DataTypes.STRING,
    },
    headers: {
      type: DataTypes.JSONB,
    },
  });

  return Request;
};
