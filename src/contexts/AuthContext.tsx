import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState } from "../types";
import { blockchain } from "../utils/blockchain";
import { authenticateFingerprint } from "../utils/fingerprint";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithFingerprint: (userId: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
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
    token: null,
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: false }));
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
        avatar: data.avatar,
      };

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
        token: data.token,
      });
    } catch (err) {
      console.error(err);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Invalid credentials",
      }));
    }
  };

  const loginWithFingerprint = async (userId: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await authenticateFingerprint<User>(userId);
      if (!result) throw new Error('failed');
      const { user, token } = result;
      setAuthState({ user, isAuthenticated: true, isLoading: false, error: null, token });
    } catch (err) {
      console.error(err);
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Fingerprint authentication failed' }));
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
        avatar: data.avatar,
      };

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
        token: data.token,
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
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add password reset request to blockchain
      const requestBlock = blockchain.addBlock({
        type: "password_reset_requested",
        email,
        timestamp: new Date(),
      });

      setAuthState((prev) => ({ ...prev, isLoading: false }));

      // Simulate completion after verification
      setTimeout(() => {
        blockchain.addBlock({
          type: "password_reset_completed",
          email,
          requestIndex: requestBlock.index,
          timestamp: new Date(),
        });
      }, 1500);
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

  const refreshProfile = async (): Promise<void> => {
    if (!authState.token) return;
    try {
      const res = await fetch('/api/account/me', {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const updated: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as User['role'],
        status: data.status as User['status'],
        createdAt: new Date(data.createdAt),
        lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined,
        avatar: data.avatar ?? authState.user?.avatar,
      };
      setAuthState(prev => ({ ...prev, user: updated }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginWithFingerprint,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
