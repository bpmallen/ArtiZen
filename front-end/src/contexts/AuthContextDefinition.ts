// front-end/src/contexts/AuthContextDefinition.ts
import { createContext } from "react";

export interface User {
  id: string;
  username: string;
  profileImageUrl: string;
}

export interface AuthContextType {
  token: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
