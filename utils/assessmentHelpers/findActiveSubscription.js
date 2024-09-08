const { Company_Subscription, Plan } = require('../../models');
const { BadRequestError } = require('../../errors');
const { Op } = require('sequelize');

const findActiveSubscription = async (company_id) => {
  const currentSubscription = await Company_Subscription.findOne({
    where: {
      company_id,
      start_date: { [Op.lte]: new Date() },
      end_date: { [Op.gte]: new Date() },
    },
    include: [Plan],
  });

  if (!currentSubscription) {
    throw new BadRequestError("No active subscription found for the company");
  }

  return currentSubscription;
};

module.exports = findActiveSubscription;
