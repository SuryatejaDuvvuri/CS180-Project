import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMnIeCiPo6KuDkXm5ewln_elW27gSRry8",
  authDomain: "collabhub-28a6c.firebaseapp.com",
  projectId: "collabhub-28a6c",
  storageBucket: "collabhub-28a6c.appspot.com",
  messagingSenderId: "458858566808",
  appId: "1:458858566808:web:711c46f48b381f4e72aced"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google Sign-In
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

// Email/Password Signup
const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error("Signup Error:", error.message);
  }
};

export { auth, signInWithGoogle, signUpWithEmail };
