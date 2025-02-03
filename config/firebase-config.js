// firebase-config.js
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'firebase-key', 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
