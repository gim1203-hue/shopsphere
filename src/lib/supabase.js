// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRoes7-jeT_zDWEpMbl8b0cXSDXYmmO9E",
  authDomain: "shopsphere-54234.firebaseapp.com",
  projectId: "shopsphere-54234",
  storageBucket: "shopsphere-54234.firebasestorage.app",
  messagingSenderId: "948561170235",
  appId: "1:948561170235:web:da7452d11d9488d41eb11e",
  measurementId: "G-PFHEP96K91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);