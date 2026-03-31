import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUM3htuIwJfW2pocHaguwLteyRRkbzimY",
  authDomain: "project-1-68433.firebaseapp.com",
  projectId: "project-1-68433",
  storageBucket: "project-1-68433.firebasestorage.app",
  messagingSenderId: "992448276627",
  appId: "1:992448276627:web:1bfaeca28b46217ee9c566",
  measurementId: "G-69F0R24CS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
export default app;
