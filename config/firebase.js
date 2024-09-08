var admin = require("firebase-admin");

// Decode the base64 encoded key
const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
const serviceAccountKey = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf8');

const serviceAccount = JSON.parse(serviceAccountKey);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGEBUCKET,
});

var bucket = admin.storage().bucket();

module.exports = bucket;
