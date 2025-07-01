
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { initialUsers } from '@/lib/data';
import { config } from '@/lib/config';
import * as apiClient from '@/lib/api-client';

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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setModeState] = useState<'guest' | 'host'>('guest');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // This state is only for JSON mode to persist user list changes
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      // Load all users list only for JSON mode persistence
      if (config.dataSource === 'json') {
        const storedAllUsers = localStorage.getItem('airbnbAllUsers');
        if (storedAllUsers) {
          setAllUsers(JSON.parse(storedAllUsers));
        }
      }

      // Load the currently logged-in user
      try {
        const storedUser = localStorage.getItem('airbnbUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if(!isLoading && config.dataSource === 'json') {
      localStorage.setItem('airbnbAllUsers', JSON.stringify(allUsers));
    }
  }, [allUsers, isLoading]);

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
    if (config.dataSource === 'api') {
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
    } else {
      const foundUser = allUsers.find(u => u.email === email && u.password === password);
      if (foundUser) {
        localStorage.setItem('airbnbUser', JSON.stringify(foundUser));
        setUser(foundUser);
        setModeState('guest');
        return true;
      }
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
    if (config.dataSource === 'api') {
        try {
            await apiClient.registerUser(data);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message || 'API registration failed' };
        }
    } else {
        if (allUsers.some(u => u.email === data.email)) {
          return { success: false, message: 'An account with this email already exists.' };
        }
        const newUser: User = { ...data, id: Date.now() }; // Use numeric ID for consistency
        setAllUsers(prevUsers => [...prevUsers, newUser]);
        return { success: true };
    }
  };
  
  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    
    if (config.dataSource === 'api') {
      await apiClient.updateUser(user.id, data);
    }
    
    setUser(updatedUser);
    // Persist changes to the user list in JSON mode
    if (config.dataSource === 'json') {
      setAllUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
    }
    localStorage.setItem('airbnbUser', JSON.stringify(updatedUser));
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
     if (!user || (config.dataSource === 'json' && user.password !== currentPassword)) {
      return { success: false, message: 'The current password you entered is incorrect.' };
    }
    
    await updateUser({ password: newPassword });
    // In API mode, we don't have old password to check on client, server should do it if logic existed
    // For now, we assume it's successful if API call in updateUser works.
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
    isLoading
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
