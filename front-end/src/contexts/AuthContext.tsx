import { useState, useEffect, type ReactNode } from "react";
import { apiClient, setAuthToken } from "../services/apiClient";
import { AuthContext, type User } from "./AuthContextDefinition";
import { jwtDecode } from "jwt-decode";

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
    const raw = localStorage.getItem("token");
    if (!raw) {
      // no token
      setAuthToken(null);
      setCurrentUser(null);
      return;
    }

    // decode expiration
    interface JWTPayload {
      exp: number;
    }
    let payload: JWTPayload;
    try {
      payload = jwtDecode<JWTPayload>(raw);
    } catch {
      // bad token
      localStorage.removeItem("token");
      setAuthToken(null);
      return;
    }

    // if expired
    if (Date.now() >= payload.exp * 1000) {
      localStorage.removeItem("token");
      setAuthToken(null);
      return;
    }

    // still valid — set header and fetch user
    setAuthToken(raw);
    setToken(raw); // if you want to keep token state in sync
    apiClient
      .get("/auth/me")
      .then((res) => setCurrentUser(res.data.user))
      .catch((err) => {
        console.error("AuthContext: /auth/me failed", err);
        localStorage.removeItem("token");
        setAuthToken(null);
        setCurrentUser(null);
        setToken(null);
      });
  }, []);

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
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
