// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, TwitterAuthProvider} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDJx75gGFLS8GrWpu8nTztoSj51S48pL6Y",
  authDomain: "book-rental-project.firebaseapp.com",
  projectId: "book-rental-project",
  storageBucket: "book-rental-project.firebasestorage.app",
  messagingSenderId: "514987540360",
  appId: "1:514987540360:web:bb4152713d71ae0efdc43d",
  measurementId: "G-ML12Y99QZ0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();
export const db = getFirestore(app);