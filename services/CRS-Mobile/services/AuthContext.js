import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('user');
    
    console.log('=== checkAuth ===');
    console.log('token:', token);        // ← thêm dòng này
    console.log('userData:', userData);  // ← thêm dòng này
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  } catch (e) {
    console.log('Auth check error:', e);
  } finally {
    setLoading(false);
  }
};

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (fullName, email, password) => {
    const res = await api.post('/auth/register/student', { fullName, email, password });
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (newUser) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (e) {
      console.log('Error updating user in storage:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
