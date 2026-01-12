import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyKgormkjzLTL9ppCF3t4JDVrQXRsaIZg",
  authDomain: "khsapp-d60b9.firebaseapp.com",
  projectId: "khsapp-d60b9",
  storageBucket: "khsapp-d60b9.appspot.com",
  messagingSenderId: "53954666867",
  appId: "1:53954666867:web:d55ec56f9972de69272506",
  measurementId: "G-HX26JK88L2",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);

// 🔥 INI KUNCI PERBAIKAN ERROR OFFLINE
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export default app;
