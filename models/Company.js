const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const Company = sequelize.define(
    "Company",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      business_email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: {
            args: true,
            msg: "Please provide a valid email"
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6],
            msg: "Password must be at least 6 characters long"
          }
        }
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 50],
            msg: "First name must be between 2 and 50 characters"
          }
        }
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 50],
            msg: "Last name must be between 2 and 50 characters"
          }
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 100],
            msg: "Company name must be between 2 and 100 characters"
          }
        }
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Description is required"
          }
        }
      },
      website_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: {
            args: true,
            msg: "Please provide a valid URL"
          },
          notNull: {
            msg: "Website URL is required"
          }
        }
      },
      contact_phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^[0-9\-\+]{9,15}$/,
            msg: "Please provide a valid phone number"
          }
        }
      },
      logo: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true
        }
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
      },
      resetPasswordExpiry: {
        type: DataTypes.DATE,
      }
    },
    {
      hooks: {
        beforeCreate: async (company) => {
          const salt = await bcrypt.genSalt(10);
          company.password = await bcrypt.hash(company.password, salt);
        }
      }
    }
  );

  Company.associate = (models) => {
    Company.hasMany(models.Assessment, { foreignKey: "company_id" });
    Company.hasMany(models.Company_Subscription, { foreignKey: "company_id" });
  };

  Company.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  return Company;
};