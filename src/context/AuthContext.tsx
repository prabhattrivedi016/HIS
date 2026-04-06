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
  isInitialized: boolean;
  login: (data: AuthData, rememberMe?: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({
    token: null,
    user: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const localAuth = localStorage.getItem("auth");
    const sessionAuth = sessionStorage.getItem("auth");
    const storedAuth = localAuth || sessionAuth;

    if (!storedAuth) {
      setIsInitialized(true);
      return;
    }

    try {
      setAuthData(JSON.parse(storedAuth));
    } catch (e) {
      console.error("Failed to parse stored auth", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = ({ token, user }: AuthData, rememberMe = false) => {
    const data = { token, user };
    setAuthData(data);

    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    storage.setItem("auth", JSON.stringify(data));
    if (token) {
      storage.setItem("accessToken", token);
    }

    otherStorage.removeItem("auth");
    otherStorage.removeItem("accessToken");
  };

  const logout = () => {
    setAuthData({ token: null, user: null });

    localStorage.removeItem("auth");
    localStorage.removeItem("accessToken");

    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ ...authData, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
