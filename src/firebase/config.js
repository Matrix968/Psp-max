import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBtvvmKPeSKCDuWZqFuae-bit0_Ccxk0W4",
  authDomain: "psp-max.firebaseapp.com",
  projectId: "psp-max",
  storageBucket: "psp-max.firebasestorage.app",
  messagingSenderId: "30110492737",
  appId: "1:30110492737:web:a7302bef1cd095e6d67ec0",
  measurementId: "G-79EPH4DR03"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;