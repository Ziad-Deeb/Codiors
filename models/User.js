const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: {
            args: [3, 50],
            msg: "Username must be between 3 and 50 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: {
            args: true,
            msg: "Please provide a valid email",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6],
            msg: "Password must be at least 6 characters long",
          },
        },
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      organization: {
        type: DataTypes.STRING,
      },
      birthdate: {
        type: DataTypes.DATE,
      },
      contribution: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastOnlineTimeSeconds: {
        type: DataTypes.DATE,
      },
      registrationTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        },
      },
    }
  );

  User.associate = (models) => {
    User.belongsToMany(models.Role, { through: 'User_Role', foreignKey: 'user_id' });
    User.belongsToMany(models.Permission, { through: 'User_Permission', foreignKey: 'userId' });
    User.hasMany(models.Assessment, { foreignKey: 'candidate_id' });
    User.hasMany(models.Discussion, { foreignKey: 'user_id' });
    User.hasMany(models.Submission, { foreignKey: 'user_id' });
    User.hasMany(models.Problem, { foreignKey: 'owner_id' });
  };

  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};
