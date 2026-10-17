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
  updateUser: (user: Partial<User>) => void;
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
    const storedAuth = localStorage.getItem("auth");

    // Clean up any legacy sessionStorage auth items
    try {
      sessionStorage.removeItem("auth");
      sessionStorage.removeItem("accessToken");
    } catch {
      // ignore
    }

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

  const login = ({ token, user }: AuthData, _rememberMe = false) => {
    const data = { token, user };
    setAuthData(data);

    // Always store auth and access token in localStorage
    localStorage.setItem("auth", JSON.stringify(data));
    if (token) {
      localStorage.setItem("accessToken", token);
    }

    // Clean up any legacy sessionStorage auth items
    try {
      sessionStorage.removeItem("auth");
      sessionStorage.removeItem("accessToken");
    } catch {
      // ignore
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setAuthData(prev => {
      if (!prev.user) return prev;

      const nextUser = { ...prev.user, ...updates };
      const nextData = { ...prev, user: nextUser };

      localStorage.setItem("auth", JSON.stringify(nextData));

      return nextData;
    });
  };

  const logout = () => {
    setAuthData({ token: null, user: null });

    localStorage.removeItem("auth");
    localStorage.removeItem("accessToken");

    try {
      sessionStorage.removeItem("auth");
      sessionStorage.removeItem("accessToken");
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ ...authData, isInitialized, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
