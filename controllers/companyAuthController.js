const { Company } = require("../models/index");
const CustomError = require("../errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../config/mailer");

exports.register = async (req, res, next) => {
    try {
      const { business_email, password, first_name, last_name, name, country, contact_phone, description, website_url } = req.body;
  
      if (!business_email) {
        throw new CustomError.BadRequestError('Please provide a business email');
      }
  
      if (!password) {
        throw new CustomError.BadRequestError('Please provide a password');
      }
  
      if (!first_name) {
        throw new CustomError.BadRequestError('Please provide a first name');
      }
  
      if (!last_name) {
        throw new CustomError.BadRequestError('Please provide a last name');
      }
  
      if (!name) {
        throw new CustomError.BadRequestError('Please provide a company name');
      }
  
      if (!country) {
        throw new CustomError.BadRequestError('Please provide a country');
      }
  
      const emailAlreadyExists = await Company.findOne({ where: { business_email } });
      if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Business email already exists');
      }

      if (!contact_phone) {
        throw new CustomError.BadRequestError('Please provide a contact phone');
      }

      if (!description) {
        throw new CustomError.BadRequestError('Please provide a description');
      }
  
      if (!website_url) {
        throw new CustomError.BadRequestError('Please provide a website URL');
      }
  
      const newCompany = await Company.create({
        business_email,
        password,
        first_name,
        last_name,
        name,
        country,
        contact_phone,
        description,
        website_url,
      });
  
      res.status(201).json({ message: 'Company registered successfully' });
    } catch (err) {
      if (!err) {
        throw new CustomError.InternalServerError();
      }
      next(err);
    }
  };
  
  exports.login = async (req, res, next) => {
    const { business_email, password } = req.body;
  
    if (!business_email || !password) {
      throw new CustomError.BadRequestError('Please provide business email and password');
    }
  
    const company = await Company.findOne({ where: { business_email } });
    if (!company) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
  
    const isPasswordCorrect = await company.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
  
    const token = jwt.sign(
      { id: company.id, email: company.business_email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '90d' }
    );
  
    res.status(200).json({ token, id: company.id, email: company.business_email });
  };  


  exports.requestPasswordReset = async (req, res, next) => {
    try {
      const { business_email } = req.body;
  
      if (!business_email) {
        throw new CustomError.BadRequestError('Please provide a business email');
      }
  
      const company = await Company.findOne({ where: { business_email } });
  
      if (!company) {
        throw new CustomError.BadRequestError('No account with that email found');
      }
  
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
  
      company.resetPasswordToken = resetToken;
      company.resetPasswordExpiry = resetTokenExpiry;
      await company.save();
  
      const mailOptions = {
        to: business_email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: `Hello,

You are receiving this email because you (or someone else) have requested to reset the password for your account.

Please click on the following link, or paste it into your browser, to complete the process:

[Reset Password](https://codiors.vercel.app/reset-password/${resetToken})

If you did not request this, please ignore this email and your password will remain unchanged.

Best regards,
Codiors
`,
      };
  
      await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Reset email sent' });
    } catch (err) {
      next(err);
    }
  };

  exports.resetPassword = async (req, res, next) => {
    try {
      const { resetToken, newPassword } = req.body;
  
      if (!resetToken || !newPassword) {
        throw new CustomError.BadRequestError('Please provide a valid token and new password');
      }
  
      const company = await Company.findOne({
        where: {
          resetPasswordToken: resetToken,
          resetPasswordExpiry: { [Sequelize.Op.gt]: Date.now() }
        }
      });
  
      if (!company) {
        throw new CustomError.BadRequestError('Password reset token is invalid or has expired');
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      company.password = hashedPassword;
      company.resetPasswordToken = null;
      company.resetPasswordExpiry = null;
      await company.save();
  
      res.status(200).json({ message: 'Password has been reset' });
    } catch (err) {
      next(err);
    }
  };
  