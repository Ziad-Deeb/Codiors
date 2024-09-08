const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Assessment_Problem = sequelize.define('Assessment_Problem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    assessment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Assessments',
        key: 'id'
      },
      validate: {
        notNull: { msg: 'Assessment ID is required' },
        isInt: { msg: 'Assessment ID must be an integer' }
      }
    },
    problem_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Problems',
        key: 'id'
      },
      validate: {
        notNull: { msg: 'Problem ID is required' },
        isInt: { msg: 'Problem ID must be an integer' }
      }
    }, 
    status: {
      type: DataTypes.ENUM('not_started', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'not_started'
    }
  });

  Assessment_Problem.associate = (models) => {
    Assessment_Problem.belongsTo(models.Assessment, { foreignKey: 'assessment_id' });
    Assessment_Problem.belongsTo(models.Problem, { foreignKey: 'problem_id' });
  };

  return Assessment_Problem;
};
