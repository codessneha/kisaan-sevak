const admin = require('firebase-admin');

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (err) {
    console.warn('⚠️  Firebase Admin initialization failed:', err.message);
  }

  return firebaseApp;
};

const getAuth = () => {
  initFirebase();
  return admin.auth();
};

module.exports = { initFirebase, getAuth };
