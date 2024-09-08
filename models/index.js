const sequelize = require("../config/database");

// Import and define the models
const models = {
  Request: require('./Request')(sequelize),
  QuestionType: require('./Question_Type')(sequelize),
  Difficulty: require('./Difficulty')(sequelize),
  Tag: require('./Tag')(sequelize),
  User: require('./User')(sequelize),
  Problem: require('./Problem')(sequelize),
  Testcase: require('./Testcase')(sequelize),
  Discussion: require('./Discussion')(sequelize),
  Submission: require('./Submission')(sequelize),
  Permission: require('./Permission')(sequelize),
  Role: require('./Role')(sequelize),
  Checker: require('./Checker')(sequelize),
  Programming_Language: require('./Programming_Language')(sequelize),
  User_Problem: require('./User_Problem')(sequelize),
  Country: require('./Country')(sequelize),
  Company: require('./Company')(sequelize),
  Plan: require('./Plan')(sequelize),
  Payment: require('./Payment')(sequelize),
  Company_Subscription: require('./Company_Subscription')(sequelize),
  Assessment: require('./Assessment')(sequelize),
  Assessment_Problem: require('./Assessment_Problem')(sequelize),
  User_Problem: require('./User_Problem')(sequelize),
};

// Define associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export the models
module.exports = {
  sequelize,
  ...models,
};
