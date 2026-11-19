import { createContext, useContext, useEffect, useState } from "react";
import { authErrorMessage, logIn, logInWithGoogle, logOut, signUp, watchUser } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until Firebase tells us who is logged in
  const [error, setError] = useState("");

  // Firebase calls this on page load and every time the user logs in or out.
  useEffect(() => {
    return watchUser((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  // Runs an auth action and saves a friendly error message if it fails.
  async function run(action) {
    setError("");
    try {
      await action();
      return true;
    } catch (err) {
      setError(authErrorMessage(err));
      return false;
    }
  }

  const value = {
    user,
    loading,
    error,
    clearError: () => setError(""),
    signup: (email, password) => run(() => signUp(email, password)),
    login: (email, password) => run(() => logIn(email, password)),
    loginWithGoogle: () => run(logInWithGoogle),
    logout: () => run(logOut),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
