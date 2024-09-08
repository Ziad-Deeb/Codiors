const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Permission = sequelize.define("Permission", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    });

    Permission.associate = (models) => {
      Permission.belongsToMany(models.Role, {
        through: 'Role_Permission',
        foreignKey: 'permission_id',
      });
      Permission.belongsToMany(models.User, {
        through: 'User_Permission',
        foreignKey: 'permission_id',
      });
    };
  
    return Permission;
  };