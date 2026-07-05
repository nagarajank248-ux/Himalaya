'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/crm';
import { mockUsers } from '../utils/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  switchRole: (role: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is saved in localStorage
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const loginWithEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Find matching mock user or create one
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      if (existingUser.status === 'suspended') {
        setIsLoading(false);
        throw new Error('This account has been suspended. Please contact the administrator.');
      }
      setUser(existingUser);
      localStorage.setItem('crm_user', JSON.stringify(existingUser));
      setIsLoading(false);
      return true;
    } else {
      // Create new user
      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email: email,
        role: 'user',
        status: 'active',
        lastActive: new Date().toISOString(),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
      };
      setUser(newUser);
      localStorage.setItem('crm_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Create or login as Google mock user (admin by default for demo ease)
    const googleUser: User = {
      id: 'u_google',
      name: 'Nagarajan (Google)',
      email: 'nagarajan@example.com',
      role: 'admin',
      status: 'active',
      lastActive: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };
    setUser(googleUser);
    localStorage.setItem('crm_user', JSON.stringify(googleUser));
    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  const updateProfile = async (name: string, email: string) => {
    if (!user) return;
    const updatedUser = { ...user, name, email };
    setUser(updatedUser);
    localStorage.setItem('crm_user', JSON.stringify(updatedUser));
  };

  const switchRole = (role: 'admin' | 'user') => {
    if (!user) return;
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem('crm_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithEmail,
        loginWithGoogle,
        logout,
        updateProfile,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
