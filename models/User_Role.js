const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User_Role = sequelize.define("User_Role", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      validate: {
        notNull: { msg: 'User ID is required' },
        isInt: { msg: 'User ID must be an integer' }
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      },
      validate: {
        notNull: { msg: 'Role ID is required' },
        isInt: { msg: 'Role ID must be an integer' }
      }
    }
  });

  User_Role.associate = (models) => {
    User_Role.belongsTo(models.User, { foreignKey: 'user_id' });
    User_Role.belongsTo(models.Role, { foreignKey: 'role_id' });
  };

  return User_Role;
};
