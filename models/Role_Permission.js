const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const RolesPermissions = sequelize.define("Role_Permission", {
  
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: 'Roles', 
              key: 'id'
            }
          },
          permission_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: 'Permissions',
              key: 'id'
            }
          },
        });
  
    return RolesPermissions;
  };