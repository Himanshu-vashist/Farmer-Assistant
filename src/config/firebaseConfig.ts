
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnu97NpBOdH75UY_yYCv-jcI4NIy0lwdY",
  authDomain: "farmer-assistant-bf3f1.firebaseapp.com",
  projectId: "farmer-assistant-bf3f1",
  storageBucket: "farmer-assistant-bf3f1.firebasestorage.app",
  messagingSenderId: "453648587310",
  appId: "1:453648587310:web:c45300c6d9b1e915f21dbf",
  measurementId: "G-WC8FLSHTH1"
};


// ✅ Initialize Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);

// ✅ Use getFirestore() to avoid reinitialization conflicts
const db: Firestore = getFirestore(app);

// ✅ Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  console.error("Firestore persistence error:", err);
});

export const auth: Auth = getAuth(app);
export { db };

