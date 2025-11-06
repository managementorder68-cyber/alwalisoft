'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName?: string;
  balance: number;
  level: string;
  referralCode: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (only on client-side)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('telegram_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('telegram_user');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('telegram_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('telegram_user');
    }
    router.push('/mini-app/login');
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('telegram_user', JSON.stringify(updatedUser));
      }
    }
  };

  const refreshUser = async () => {
    if (user) {
      try {
        const response = await fetch(`/api/users?telegramId=${user.telegramId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const updatedUser = {
              id: data.data.id,
              telegramId: data.data.telegramId,
              username: data.data.username,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              balance: data.data.balance,
              level: data.data.level,
              referralCode: data.data.referralCode
            };
            login(updatedUser);
          }
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateBalance, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
