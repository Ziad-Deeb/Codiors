const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Assessment = sequelize.define('Assessment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'Candidate ID is required'
        },
        isInt: {
          msg: 'Candidate ID must be an integer'
        }
      }
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'Company ID is required'
        },
        isInt: {
          msg: 'Company ID must be an integer'
        }
      }
    },
    assessment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Assessment date is required'
        },
        isDate: {
          msg: 'Assessment date must be a valid date'
        },
        isCurrentTime(value) {
          if (new Date(value) < new Date()) {
            throw new Error('Assessment date must be in the future');
          }
        }
      }
    },
    assessment_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Assessment duration is required'
        },
        isInt: {
          msg: 'Assessment duration must be an integer'
        }
      }
    },
    candidate_score: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        isDecimal: {
          msg: 'Candidate score must be a decimal'
        }
      }
    },
    evaluation_notes: {
      type: DataTypes.TEXT
    }, 
    status: {
      type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
      validate: {
        notNull: {
          msg: 'Status is required'
        },
        isIn: {
          args: [['scheduled', 'ongoing', 'completed', 'cancelled']],
          msg: 'Status must be one of "scheduled", "ongoing", "completed", "cancelled"'
        }
      }
    }
  });

  Assessment.associate = (models) => {
    Assessment.belongsTo(models.User, { foreignKey: 'candidate_id' });
    Assessment.belongsTo(models.Company, { foreignKey: 'company_id' });
    Assessment.belongsToMany(models.Problem, {
      through: 'Assessment_Problems',
      foreignKey: 'assessment_id'
    });
  };

  return Assessment;
};
