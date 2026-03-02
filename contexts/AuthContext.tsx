import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types';
import { demoUser } from '@/mocks/user';

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
      } catch (e) {
        console.log('Auth check error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, _password: string) => {
    console.log('Login attempt:', email);
    await AsyncStorage.setItem('auth_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsAuthenticated(true);
  };

  const register = async (name: string, email: string, _password: string) => {
    console.log('Register attempt:', name, email);
    const newUser: User = {
      ...demoUser,
      name,
      email,
      id: 'u_' + Date.now(),
    };
    await AsyncStorage.setItem('auth_user', JSON.stringify(newUser));
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
