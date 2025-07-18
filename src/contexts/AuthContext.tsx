import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  login: (userName: string, password: string) => Promise<void>;
  signup: (userName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5138';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('jwt');
    const name = localStorage.getItem('userName');
    if (saved && name) {
      setToken(saved);
      setUserName(name);
    }
  }, []);

  const login = async (userName: string, password: string) => {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, password })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    localStorage.setItem('jwt', data.token);
    localStorage.setItem('userName', userName);
    setToken(data.token);
    setUserName(userName);
  };

  const signup = async (userName: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    await login(userName, password);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userName');
    setToken(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ token, userName, isAuthenticated: !!token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
