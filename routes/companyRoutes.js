const express = require('express');
const companyController = require('../controllers/companyController');

const {
    getCompanyById,
    updateCompanyById,
    getActiveSubscriptionForCompany,
  } = require("../controllers/companyController");

const { authenticateCompany } = require('../middleware');

const router = express.Router();

router.get('/active-subscription',authenticateCompany,  getActiveSubscriptionForCompany);

router.get('/:id', getCompanyById);

router.put('/:id', updateCompanyById);

module.exports = router;
