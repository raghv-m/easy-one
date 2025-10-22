const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db = null;
let auth = null;

const initializeFirebase = () => {
  try {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      // Try to load service account key from file
      let serviceAccount = null;
      // Look in root directory (two levels up from backend/src/config)
      const keyPath = path.join(__dirname, '../../../firebase-key.json');

      console.log('🔍 Looking for firebase-key.json at:', keyPath);

      if (fs.existsSync(keyPath)) {
        try {
          const keyContent = fs.readFileSync(keyPath, 'utf8');
          serviceAccount = JSON.parse(keyContent);
          console.log('✅ Loaded service account key file successfully');
        } catch (e) {
          console.error('❌ Error reading/parsing firebase-key.json:', e.message);
          throw new Error(`Failed to load firebase-key.json: ${e.message}`);
        }
      } else {
        console.log('❌ firebase-key.json not found at:', keyPath);
        console.log('📝 Please download it from Firebase Console and place it in the root directory');
        throw new Error('firebase-key.json not found. Please download it from Firebase Console.');
      }

      const config = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        credential: admin.credential.cert(serviceAccount),
      };

      admin.initializeApp(config);
    }

    db = admin.firestore();
    auth = admin.auth();

    console.log('✅ Firebase initialized successfully');
    console.log('🔥 Using real Firestore database');
    console.log(`📍 Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
};

const getDb = () => {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
};

const getAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebase() first.');
  }
  return auth;
};

module.exports = {
  initializeFirebase,
  getDb,
  getAuth,
};

