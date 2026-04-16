import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem('auth_user');
        if (stored) {
          setUser(JSON.parse(stored));
          setIsAuthenticated(true);
        }
      } catch (_e) {
        // Auth check failed
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, _password: string) => {
    const storedUser = await AsyncStorage.getItem('auth_user_profile');
    let loggedInUser: User;

    if (storedUser) {
      loggedInUser = JSON.parse(storedUser);
    } else {
      loggedInUser = {
        id: 'u_' + Date.now(),
        name: email.split('@')[0] ?? 'Usuario',
        email,
        phone: '',
        documentType: 'CC',
        documentNumber: '',
        role: 'user',
        planId: '',
        createdAt: new Date().toISOString(),
      };
    }

    await AsyncStorage.setItem('auth_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const register = async (name: string, email: string, _password: string) => {
    const newUser: User = {
      id: 'u_' + Date.now(),
      name,
      email,
      phone: '',
      documentType: 'CC',
      documentNumber: '',
      role: 'user',
      planId: '',
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem('auth_user', JSON.stringify(newUser));
    await AsyncStorage.setItem('auth_user_profile', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isLoading, isAuthenticated, login, register, logout };
});
