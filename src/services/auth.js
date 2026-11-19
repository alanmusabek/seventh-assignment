// All Firebase Authentication calls live here, so pages never talk to Firebase directly.
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

// Keep the user logged in after a page refresh or browser restart.
setPersistence(auth, browserLocalPersistence);

export function watchUser(callback) {
  return onAuthStateChanged(auth, callback); // returns the unsubscribe function
}

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function logOut() {
  return signOut(auth);
}

// Turns Firebase error codes into short, friendly messages.
const messages = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/user-not-found": "No account with this email.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "This email address is not valid.",
  "auth/weak-password": "Password must have at least 6 characters.",
  "auth/popup-closed-by-user": "Google sign-in was closed before finishing.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/unauthorized-domain": "This website is not allowed in Firebase. Add it under Authentication → Settings → Authorized domains.",
  "auth/operation-not-allowed": "This sign-in method is turned off in Firebase.",
};

export function authErrorMessage(error) {
  return messages[error.code] || "Something went wrong. Please try again.";
}
