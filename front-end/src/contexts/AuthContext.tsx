import { useState, useEffect, type ReactNode } from "react";
import { apiClient, setAuthToken } from "../services/apiClient";
import { AuthContext, type User } from "./AuthContextDefinition";

export function AuthProvider({ children }: { children: ReactNode }) {
  //  token state: initialize from localStorage (if any)
  const [token, setToken] = useState<string | null>(() => {
    const token = localStorage.getItem("token");
    return token;
  });

  //  currentUser state: who is logged in
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  //  Whenever `token` change, sync Axios header and fetch /auth/me
  useEffect(() => {
    if (token) {
      setAuthToken(token);

      apiClient
        .get("/auth/me")
        .then((res) => {
          setCurrentUser(res.data.user);
        })
        .catch((err) => {
          // If token invalid/expired, clear everything
          console.error("AuthContext: /auth/me failed", err);
          setToken(null);
          localStorage.removeItem("token");
          setCurrentUser(null);
          setAuthToken(null);
        });
    } else {
      setAuthToken(null);
      setCurrentUser(null);
    }
  }, [token]);

  // login(token, user): store the token & user
  const login = (newToken: string, user: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setCurrentUser(user);
  };

  // logout(): clear all auth data
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
    setAuthToken(null);
  };

  //  compute isAuthenticated
  const isAuthenticated = Boolean(token);

  // Provide these values to any child component
  const value = {
    token,
    currentUser,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
