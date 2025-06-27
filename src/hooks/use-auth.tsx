"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';

type AuthContextType = {
  user: User | null;
  mode: 'guest' | 'host';
  login: (email: string) => boolean;
  logout: () => void;
  setMode: (mode: 'guest' | 'host') => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setModeState] = useState<'guest' | 'host'>('guest');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('airbnbUser');
      const storedMode = localStorage.getItem('airbnbMode');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedMode) {
        setModeState(storedMode as 'guest' | 'host');
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string) => {
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      localStorage.setItem('airbnbUser', JSON.stringify(foundUser));
      setUser(foundUser);
      if (foundUser.isHost) {
        localStorage.setItem('airbnbMode', 'host');
        setModeState('host');
      } else {
        localStorage.setItem('airbnbMode', 'guest');
        setModeState('guest');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('airbnbUser');
    localStorage.removeItem('airbnbMode');
    setUser(null);
    setModeState('guest');
    router.push('/login');
  };

  const setMode = (newMode: 'guest' | 'host') => {
    if (user?.isHost) {
      localStorage.setItem('airbnbMode', newMode);
      setModeState(newMode);
       if (newMode === 'host') {
        router.push('/hosting');
      } else {
        router.push('/home');
      }
    }
  };
  
  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('airbnbUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, mode, login, logout, setMode, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
