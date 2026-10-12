'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser, UserRole } from '../types';
import { api } from '../lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('memed_token');
    if (savedToken) {
      setToken(savedToken);
      api.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('memed_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('memed_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error', 'Authentication Error');
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const res = await api.signup({ name, email, password, role });
      if (res.success && res.token) {
        localStorage.setItem('memed_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Account created as ${role}!`, 'success', 'Welcome to Meme’d');
      }
    } catch (err: any) {
      showToast(err.message || 'Signup failed', 'error', 'Registration Error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('memed_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const quickDemoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      // First ensure demo seeds are populated
      try {
        await api.seedDemo();
      } catch {
        // seeds might already be there
      }

      const email = role === 'brand' ? 'brand@memed.in' : 'creator@memed.in';
      const password = 'password123';

      await login(email, password);
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
