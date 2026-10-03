import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cloudshield_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cloudshield_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('cloudshield_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          localStorage.setItem('cloudshield_user', JSON.stringify(userData));
        } catch (err) {
          localStorage.removeItem('cloudshield_token');
          localStorage.removeItem('cloudshield_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('cloudshield_token', data.access_token);
    localStorage.setItem('cloudshield_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (email, password, role = 'operator') => {
    await authApi.register(email, password, role);
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('cloudshield_token');
    localStorage.removeItem('cloudshield_user');
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'operator';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isOperator }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
