const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Company_Subscription = sequelize.define("Company_Subscription", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: {
          args: [new Date().toISOString()],
          msg: "End date must be in the future",
        },
      },
    },
  });

  Company_Subscription.associate = (models) => {
    Company_Subscription.belongsTo(models.Company, { foreignKey: "company_id" });
    Company_Subscription.belongsTo(models.Plan, { foreignKey: "plan_id" });
  };

  return Company_Subscription;
};