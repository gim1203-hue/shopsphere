import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBRoes7-jeT_zDWEpMbl8b0cXSDXYmmO9E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'shopsphere-54234.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shopsphere-54234',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'shopsphere-54234.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '948561170235',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:948561170235:web:da7452d11d9488d41eb11e',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
)

export const firebaseAuth = isFirebaseConfigured ? getAuth(initializeApp(firebaseConfig)) : null