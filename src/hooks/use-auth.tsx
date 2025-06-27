
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { initialUsers } from '@/lib/data';

type AuthContextType = {
  user: User | null;
  allUsers: User[];
  mode: 'guest' | 'host';
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: Omit<User, 'id'>) => { success: boolean, message?: string };
  setMode: (mode: 'guest' | 'host') => void;
  updateUser: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean, message?: string };
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [mode, setModeState] = useState<'guest' | 'host'>('guest');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('airbnbUser');
      const storedAllUsers = localStorage.getItem('airbnbAllUsers');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedAllUsers) {
        setAllUsers(JSON.parse(storedAllUsers));
      } else {
        setAllUsers(initialUsers);
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      setAllUsers(initialUsers);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(!isLoading) {
      localStorage.setItem('airbnbAllUsers', JSON.stringify(allUsers));
    }
  }, [allUsers, isLoading]);

  useEffect(() => {
    if (user?.isHost) {
      if (pathname.startsWith('/hosting')) {
        if (mode !== 'host') {
          setModeState('host');
        }
      } else {
        if (mode !== 'guest') {
          setModeState('guest');
        }
      }
    }
  }, [pathname, user, mode]);

  const login = (email: string, password: string) => {
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser && foundUser.password === password) {
      localStorage.setItem('airbnbUser', JSON.stringify(foundUser));
      setUser(foundUser);
      localStorage.setItem('airbnbMode', 'guest');
      setModeState('guest');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('airbnbUser');
    localStorage.removeItem('airbnbMode');
    // Clear all shared data to reset state for the next user
    localStorage.removeItem('airbnbAllUsers');
    localStorage.removeItem('airbnbAllBookings');
    setUser(null);
    setModeState('guest');
    router.push('/login');
  };
  
  const register = (data: Omit<User, 'id'>) => {
    if (allUsers.some(u => u.email === data.email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    
    const newUser: User = {
      ...data,
      id: `user${Date.now()}`,
    };
    
    setAllUsers(prevUsers => [...prevUsers, newUser]);
    return { success: true };
  };
  
  const changePassword = (currentPassword: string, newPassword: string) => {
     if (!user || user.password !== currentPassword) {
      return { success: false, message: 'The current password you entered is incorrect.' };
    }
    
    updateUser({ password: newPassword });
    return { success: true };
  };

  const setMode = (newMode: 'guest' | 'host') => {
    if (user?.isHost) {
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
      setAllUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
      localStorage.setItem('airbnbUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, allUsers, mode, login, logout, register, setMode, updateUser, changePassword, isLoading }}>
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
