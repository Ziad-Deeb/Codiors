const { getEntityById, updateEntityById, getAllEntities } = require('../utils/commonHelpers');
const { Company, Company_Subscription, Plan } = require('../models');
const handleError = require('../utils/errorHandler');
const { Op } = require("sequelize");

// Get company by ID
exports.getCompanyById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const company = await getEntityById(Company, id, {
      attributes: ['id', 'business_email', 'first_name', 'last_name', 'name', 'country', 'description', 'website_url', 'contact_phone', 'logo']
    });

    res.status(200).json(company);
  } catch (err) {
    handleError(err, next, 'Error retrieving company');
  }
};

// Update company by ID
exports.updateCompanyById = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { 
        business_email, 
        first_name, 
        last_name, 
        name, 
        country, 
        description, 
        website_url, 
        contact_phone, 
        logo 
      } = req.body;
  
      // Use the helper function to update the company
      const updatedCompany = await updateEntityById(Company, id, {
        updateData: { 
          business_email, 
          first_name, 
          last_name, 
          name, 
          country, 
          description, 
          website_url, 
          contact_phone, 
          logo 
        }
      });
  
      // Create the company information object
      const companyInfo = {
        id: updatedCompany.id,
        business_email: updatedCompany.business_email,
        first_name: updatedCompany.first_name,
        last_name: updatedCompany.last_name,
        name: updatedCompany.name,
        country: updatedCompany.country,
        description: updatedCompany.description,
        website_url: updatedCompany.website_url,
        contact_phone: updatedCompany.contact_phone,
        logo: updatedCompany.logo
      };
  
      res.status(200).json({ msg: "Company information updated successfully", company: companyInfo });
  
    } catch (error) {
      handleError(error, next, "Error updating company information");
    }
  };

  exports.getActiveSubscriptionForCompany = async (req, res, next) => {
    const companyId  = req.companyId;
    console.log(companyId);
    const now = new Date();
  
    try {
      const activeSubscription = await getAllEntities(Company_Subscription, {
        where: {
          company_id: companyId,
          start_date: { [Op.lte]: now },
          end_date: { [Op.gte]: now },
        },
        include: [
          { model: Company, attributes: ['name'] },
          { model: Plan, attributes: ['name'] },
        ],
        limit: 1,
        order: [['end_date', 'DESC']],
      });
  
      if (activeSubscription.length === 0) {
        return res.status(404).json({ message: 'No active subscription found' });
      }
  
      res.status(200).json(activeSubscription[0]);
    } catch (err) {
      handleError(err, next, "Error fetching active subscription for company");
    }
  };
  