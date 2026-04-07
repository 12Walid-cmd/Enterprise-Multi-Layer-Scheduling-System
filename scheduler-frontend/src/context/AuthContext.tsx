import { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "../api";
import type { AuthUser } from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (u: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await AuthAPI.me();
      setUser(me);
    } catch {
      sessionStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await AuthAPI.logout(); 
    } catch {}

    sessionStorage.removeItem("access_token");
    setUser(null);
    window.location.href = "/login";
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}