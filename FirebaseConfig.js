import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNpqUjszOHTp40pZwg-02jgiy9cF3W6Kk",
  authDomain: "memberreadings.firebaseapp.com",
  projectId: "memberreadings",
  storageBucket: "memberreadings.firebasestorage.app",
  messagingSenderId: "969125813621",
  appId: "1:969125813621:web:4a97d6f81fc650dd72873c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);