import { getAuthStorage } from "@/utils/authStorage";
import { createContext, ReactNode, useEffect, useState } from "react";

interface User {
  userId: number;
  userName: string;
  email: string;
  contact: string;
  isContactVerified: boolean;
  isEmailVerified: boolean;
  [key: string]: any;
}

interface AuthData {
  token: string | null;
  user: User | null;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (data: AuthData) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({
    token: null,
    user: null,
  });

  // 🔹 Load auth from storage on app start
  useEffect(() => {
    const storage = getAuthStorage();
    const storedAuth = storage.getItem("auth");
    if (storedAuth) {
      try {
        setAuthData(JSON.parse(storedAuth));
      } catch (e) {
        console.error("Failed to parse stored auth", e);
      }
    }
  }, []);

  // 🔹 Login
  const login = ({ token, user }: AuthData) => {
    const data = { token, user };
    setAuthData(data);
    const storage = getAuthStorage();
    storage.setItem("auth", JSON.stringify(data));
  };

  // 🔹 Logout
  const logout = () => {
    setAuthData({ token: null, user: null });
    const storage = getAuthStorage();
    storage.removeItem("auth");
    storage.removeItem("accessToken");
    storage.removeItem("branchId");
    storage.removeItem("userId");
    storage.removeItem("userDetails");
  };

  return (
    <AuthContext.Provider value={{ ...authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};