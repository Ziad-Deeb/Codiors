const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Plan = sequelize.define("Plan", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Plan name must be unique",
      },
      validate: {
        notEmpty: {
          msg: "Plan name cannot be empty",
        },
      },
    },
    monthly_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Monthly cost must be greater than or equal to 0",
        },
      },
    },
    attempts_per_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Attempts per month must be greater than or equal to 0",
        },
        isInt: {
          msg: "Attempts per month must be an integer",
        },
      },
    },
    additional_attempt_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Additional attempt price must be greater than or equal to 0",
        },
      },
    },
    question_pool_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Question pool size must be greater than or equal to 0",
        },
        isInt: {
          msg: "Question pool size must be an integer",
        },
      },
    },
    stripe_price_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    screen_interview_access: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Plan.associate = (models) => {
    Plan.hasMany(models.Company_Subscription, {
      foreignKey: "plan_id",
    });
  };

  return Plan;
};