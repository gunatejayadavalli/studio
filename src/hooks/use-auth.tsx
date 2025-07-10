
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import * as apiClient from '@/lib/api-client';

type ApiEndpoint = 'local' | 'cloud';

type AuthContextType = {
  user: User | null;
  mode: 'guest' | 'host';
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: Omit<User, 'id'>) => Promise<{ success: boolean; message?: string }>;
  setMode: (mode: 'guest' | 'host') => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
  apiEndpoint: ApiEndpoint;
  setApiEndpoint: (endpoint: ApiEndpoint) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setModeState] = useState<'guest' | 'host'>('guest');
  const [isLoading, setIsLoading] = useState(true);
  const [apiEndpoint, setApiEndpointState] = useState<ApiEndpoint>('local');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUserFromStorage = () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('airbnbUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedEndpoint = localStorage.getItem('apiEndpoint') as ApiEndpoint | null;
        if (storedEndpoint && ['local', 'cloud'].includes(storedEndpoint)) {
            setApiEndpointState(storedEndpoint);
            apiClient.setApiBaseUrl(storedEndpoint);
        } else {
            apiClient.setApiBaseUrl('local');
        }
      } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
        localStorage.removeItem('airbnbUser');
        localStorage.removeItem('apiEndpoint');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  const setApiEndpoint = (endpoint: ApiEndpoint) => {
    localStorage.setItem('apiEndpoint', endpoint);
    setApiEndpointState(endpoint);
    apiClient.setApiBaseUrl(endpoint);
  };

  useEffect(() => {
    if (user?.isHost) {
      if (pathname.startsWith('/hosting')) {
        if (mode !== 'host') setModeState('host');
      } else {
        if (mode !== 'guest') setModeState('guest');
      }
    }
  }, [pathname, user, mode]);

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await apiClient.loginUser({ email, password });
      localStorage.setItem('airbnbUser', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setModeState('guest');
      return true;
    } catch (error) {
      console.error('API Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('airbnbUser');
    setUser(null);
    setModeState('guest');
    router.push('/login');
  };
  
  const register = async (data: Omit<User, 'id'>) => {
    try {
        await apiClient.registerUser(data);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || 'API registration failed' };
    }
  };
  
  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    
    await apiClient.updateUser(user.id, data);
    
    setUser(updatedUser);
    localStorage.setItem('airbnbUser', JSON.stringify(updatedUser));
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
     if (!user) {
      return { success: false, message: 'You must be logged in to change your password.' };
    }
    // In a real app, the API would validate the currentPassword.
    // Here we just update it.
    await updateUser({ password: newPassword });
    return { success: true };
  };

  const setMode = (newMode: 'guest' | 'host') => {
    if (user?.isHost) {
      if (newMode === 'host') router.push('/hosting');
      else router.push('/home');
    }
  };

  const contextValue = {
    user,
    mode,
    login,
    logout,
    register,
    setMode,
    updateUser,
    changePassword,
    isLoading,
    apiEndpoint,
    setApiEndpoint,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
