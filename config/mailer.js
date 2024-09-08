const nodemailer = require("nodemailer");
const decrypt = require('../utils/decrypt');

const encryptedPass = process.env.ENCRYPTED_EMAIL_PASS;
const EMAIL_PASS = decrypt(encryptedPass);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: EMAIL_PASS
  },
  // debug: true,
  // logger: true,
});

module.exports = transporter;
