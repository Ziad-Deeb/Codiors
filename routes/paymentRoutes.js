const express = require("express");
const router = express.Router();
const { createCompanyPlanCheckoutSession, handleWebhook } = require("../controllers/paymentController");

const { authenticateCompany } = require('../middleware');

router.post("/company/plan/create-checkout-session", authenticateCompany, createCompanyPlanCheckoutSession);
router.post("/company/plan/webhook", express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
