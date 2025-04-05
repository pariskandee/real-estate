import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHhdsL0w_3Q8dfVJBJCYXX9GD7Q3g7Fac",
  authDomain: "nexaimmo-e7519.firebaseapp.com",
  projectId: "nexaimmo-e7519",
  storageBucket: "nexaimmo-e7519.firebasestorage.app",
  messagingSenderId: "1016819299796",
  appId: "1:1016819299796:web:bcd03d1413361134135241",
  measurementId: "G-CSXW3PWG63"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
