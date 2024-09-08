const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Country = sequelize.define(
    "Country",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: {
            args: [2, 100],
            msg: "Country name must be between 2 and 100 characters"
          }
        }
      },
      code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true,
        validate: {
          len: {
            args: [2, 3],
            msg: "Country code must be between 2 and 3 characters"
          }
        }
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        validate: {
          len: {
            args: [3],
            msg: "Currency code must be 3 characters"
          }
        }
      },
      calling_code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 5],
            msg: "Calling code must be between 1 and 5 characters"
          }
        }
      }, 
      flag: {
        type: DataTypes.STRING,
        allowNull: true
      },
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: true
    }
  );

  return Country;
};