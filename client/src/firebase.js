import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

// Firebase config using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
<<<<<<< HEAD
=======
console.log(firebaseConfig);
>>>>>>> 16655405ad37ad864a51ea7ea7804d392d795fff
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Create reCAPTCHA verifier (invisible)
export const createRecaptcha = () => {
  return new RecaptchaVerifier("recaptcha", {
    size: "invisible",
    callback: (response) => {
      console.log("reCAPTCHA solved:", response);
    }
  }, auth);
};

// Phone sign-in function
<<<<<<< HEAD
export const phoneSignIn = signInWithPhoneNumber;
=======
export const phoneSignIn = signInWithPhoneNumber;
>>>>>>> 16655405ad37ad864a51ea7ea7804d392d795fff
