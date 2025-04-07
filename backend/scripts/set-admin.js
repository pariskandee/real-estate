const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const setAdmin = async (email) => {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`Success! ${email} is now an admin`);
};

// Replace with your admin user's email
setAdmin('eelanet@gmail.com').catch(console.error);