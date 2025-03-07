import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

console.log("Firebase Config:", {
  apiKeyPresent: !!firebaseConfig.apiKey,
  authDomainPresent: !!firebaseConfig.authDomain,
  projectIdPresent: !!firebaseConfig.projectId,
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Ensure persistence is set before any auth operations
setPersistence(auth, browserLocalPersistence).then(() => {
  console.log("Firebase auth persistence set to local");
}).catch((error) => {
  console.error("Error setting persistence:", error);
});

const googleProvider = new GoogleAuthProvider();


const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};


const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error("Signup Error:", error.message);
    throw error;
  }
};

// Email/Password Login
const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error) {
    console.error(`Firebase Login Error: ${error.code} - ${error.message}`);
    throw error;
  }
};


const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("authToken");
  } catch (error) {
    console.error("Logout Error", error);
  }
};


const monitorAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      user.getIdToken().then((token) => {
        localStorage.setItem('authToken', token);
        callback(user);
      });
    } else {
      localStorage.removeItem('authToken');
      callback(null);
    }
  });
};

export { auth, signInWithGoogle, signUpWithEmail, signInWithEmail, monitorAuthState, logout };