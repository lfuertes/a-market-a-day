import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDECZPkwBjyTu_wNnm6_lFjwO_vnJklyPY",
  authDomain: "market-a-day.firebaseapp.com",
  projectId: "market-a-day",
  storageBucket: "market-a-day.firebasestorage.app",
  messagingSenderId: "967002045504",
  appId: "1:967002045504:web:379a5c332c5a4fcf6773a5",
  measurementId: "G-F9Q6DXXRFD"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

