import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('learnova_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('learnova_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('learnova_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('learnova_token', access_token);
    localStorage.setItem('learnova_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { access_token, user: newUser } = res.data;
    localStorage.setItem('learnova_token', access_token);
    localStorage.setItem('learnova_user', JSON.stringify(newUser));
    setToken(access_token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('learnova_token');
    localStorage.removeItem('learnova_user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('learnova_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
