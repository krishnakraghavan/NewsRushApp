// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAmnHqlEhPsHsO1W1476Qt_KW1q2fqIUgo",
  authDomain: "newsrush-85d13.firebaseapp.com",
  databaseURL: "https://newsrush-85d13-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "newsrush-85d13",
  storageBucket: "newsrush-85d13.firebasestorage.app",
  messagingSenderId: "494013356010",
  appId: "1:494013356010:web:046fcc8a9de060a8140493",
  measurementId: "G-R8SNB1FJS8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
