const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Role = sequelize.define("Role", {
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
    description: {
      type: DataTypes.STRING,
      allowNull:true
    },
  });

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: 'User_Role',
      foreignKey: 'role_id',
    });
    Role.belongsToMany(models.Permission, {
      through: 'Role_Permission',
      foreignKey: 'role_id',
    });
  };

  return Role;
};
