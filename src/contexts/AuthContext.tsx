import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState } from "../types";
import { EncryptionService } from "../utils/encryption";
import { blockchain } from "../utils/blockchain";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = () => {
      try {
        const encryptedUser = localStorage.getItem("vault_user");
        const token = localStorage.getItem("vault_token");
        if (encryptedUser && token) {
          const decrypted = JSON.parse(
            EncryptionService.decrypt(encryptedUser),
          );
          const userData = { status: "active", ...decrypted } as User;
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error(err);
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Session validation failed",
        }));
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data: {
        id: string;
        email: string;
        name: string;
        role: string;
        status: string;
        createdAt: string;
        lastLogin: string | null;
        token: string;
      } = await res.json();

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as User["role"],
        status: data.status as User["status"],
        createdAt: new Date(data.createdAt),
        lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined,
      };

      localStorage.setItem("vault_token", data.token);
      const encryptedUser = EncryptionService.encrypt(JSON.stringify(user));
      localStorage.setItem("vault_user", encryptedUser);

      blockchain.addBlock({
        type: "user_login",
        userId: user.id,
        timestamp: new Date(),
        ip: "0.0.0.0",
      });

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error(err);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Invalid credentials",
      }));
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
  ): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data: {
        id: string;
        email: string;
        name: string;
        role: string;
        status: string;
        createdAt: string;
        lastLogin: string | null;
        token: string;
      } = await res.json();

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as User["role"],
        status: data.status as User["status"],
        createdAt: new Date(data.createdAt),
        lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined,
      };

      localStorage.setItem("vault_token", data.token);
      const encryptedUser = EncryptionService.encrypt(JSON.stringify(user));
      localStorage.setItem("vault_user", encryptedUser);

      blockchain.addBlock({
        type: "user_created",
        userId: user.id,
        email: user.email,
        timestamp: new Date(),
      });

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error(err);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Registration failed",
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem("vault_user");
    localStorage.removeItem("vault_token");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add password reset request to blockchain
      blockchain.addBlock({
        type: "password_reset_requested",
        email,
        timestamp: new Date(),
      });

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      console.error(err);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to send reset email",
      }));
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      void newPassword;

      // Add password reset to blockchain
      blockchain.addBlock({
        type: "password_reset_completed",
        token,
        timestamp: new Date(),
      });

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      console.error(err);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to reset password",
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
