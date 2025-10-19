import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_CPQl-aODdoRcY3We5th1oc_NA8oxJAg",
  authDomain: "easy-one-a9576.firebaseapp.com",
  databaseURL: "https://easy-one-a9576-default-rtdb.firebaseio.com",
  projectId: "easy-one-a9576",
  storageBucket: "easy-one-a9576.firebasestorage.app",
  messagingSenderId: "596867721267",
  appId: "1:596867721267:web:8ea0ea0f006bcd71145b46",
  measurementId: "G-XEXSP5XFXJ"
};

let app;
let auth;
let db;

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
};

export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;

