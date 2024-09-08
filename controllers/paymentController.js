const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Plan, Company_Subscription, Payment } = require("../models");
const CustomError = require("../errors");
const handleError = require('../utils/errorHandler');
const { Op } = require("sequelize");

exports.createCompanyPlanCheckoutSession  = async (req, res, next) => {
  try {
    company_id = req.companyId;
    const { plan_id } = req.body;

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      throw new CustomError.NotFoundError('Plan not found');
    }

    // Check if there is already an active subscription for this company
    const activeSubscription = await Company_Subscription.findOne({
      where: {
        company_id: company_id,
        end_date: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (activeSubscription) {
      const error = new Error('The company already has an active subscription.');
      error.statusCode = 409; // 409 Conflict
      throw error;
    }

    const origin = req.headers.origin || 'http://localhost:8080';

    const priceId = plan.stripe_price_id;

    if (!priceId) {
        throw new CustomError.NotFoundError('Price ID not found for the selected plan');
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        // success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        // cancel_url: `${origin}/cancel`,
        success_url: `${origin}/assessments`,
        cancel_url: `${origin}/pricing`,
        metadata: {
          plan_id: plan.id,
          company_id: company_id,
        },
      });

      console.log(session.id);
      res.status(200).json({ url: session.url });
  } catch (error) {
    handleError(error, next, 'Error creating checkout session');
  }
};

exports.handleWebhook = async (req, res, next) => {
  const event = req.body;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const company_id = session.metadata.company_id;
        const plan_id = session.metadata.plan_id;

        const start_date = new Date(); 
        const end_date = new Date(start_date); 
        end_date.setMonth(start_date.getMonth() + 1);

        await Company_Subscription.create({
          company_id: company_id,
          plan_id: plan_id,
          start_date: start_date,
          end_date: end_date,
        });

        await Payment.create({
          company_id: company_id,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: 'completed',
          payment_method: session.payment_method_types[0],
          // stripe_payment_intent_id: session.payment_intent,
        });
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).end();
  } catch (error) {
    handleError(error, next, 'Error handling webhook');
  }
};
