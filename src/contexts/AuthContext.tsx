import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { EncryptionService } from '../utils/encryption';
import { blockchain } from '../utils/blockchain';

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
    throw new Error('useAuth must be used within an AuthProvider');
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
    const checkAuth = async () => {
      try {
        const encryptedUser = localStorage.getItem('vault_user');
        if (encryptedUser) {
          const userData = JSON.parse(EncryptionService.decrypt(encryptedUser));
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setAuthState(prev => ({ ...prev, isLoading: false, error: 'Session validation failed' }));
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'admin',
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      // Encrypt and store user data
      const encryptedUser = EncryptionService.encrypt(JSON.stringify(user));
      localStorage.setItem('vault_user', encryptedUser);

      // Add login event to blockchain
      blockchain.addBlock({
        type: 'user_login',
        userId: user.id,
        timestamp: new Date(),
        ip: 'xxx.xxx.xxx.xxx'
      });

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid credentials'
      }));
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'editor',
        createdAt: new Date(),
      };

      // Hash password and store securely
      const salt = EncryptionService.generateSalt();
      const hashedPassword = EncryptionService.hashPassword(password, salt);

      // Add user creation to blockchain
      blockchain.addBlock({
        type: 'user_created',
        userId: user.id,
        email: user.email,
        timestamp: new Date()
      });

      const encryptedUser = EncryptionService.encrypt(JSON.stringify(user));
      localStorage.setItem('vault_user', encryptedUser);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Registration failed'
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem('vault_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add password reset request to blockchain
      blockchain.addBlock({
        type: 'password_reset_requested',
        email,
        timestamp: new Date()
      });

      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to send reset email'
      }));
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hash new password
      const salt = EncryptionService.generateSalt();
      const hashedPassword = EncryptionService.hashPassword(newPassword, salt);

      // Add password reset to blockchain
      blockchain.addBlock({
        type: 'password_reset_completed',
        token,
        timestamp: new Date()
      });

      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to reset password'
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