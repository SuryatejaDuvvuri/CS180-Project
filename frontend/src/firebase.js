import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMnIeCiPo6KuDkXm5ewln_elW27gSRry8",
  authDomain: "collabhub-28a6c.firebaseapp.com",
  projectId: "collabhub-28a6c",
  storageBucket: "collabhub-28a6c.appspot.com",
  messagingSenderId: "458858566808",
  appId: "1:458858566808:web:711c46f48b381f4e72aced"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    console.log("Firebase ID Token:", idToken);
    return idToken;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

export { auth, signInWithGoogle };
