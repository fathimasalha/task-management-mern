import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (storedToken) {
        try {
          const { data } = await API.get('/auth/me');
          setUser(data.data);
          setToken(storedToken);
        } catch (error) {
          console.warn('[AuthContext] Session expired or invalid:', error.message);
          localStorage.removeItem('taskflow_token');
          localStorage.removeItem('taskflow_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('taskflow_token', data.data.token);
      localStorage.setItem('taskflow_user', JSON.stringify(data.data));
      setUser(data.data);
      setToken(data.data.token);
      return data.data;
    }
  };

  const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', { name, email, password });
    if (data.success) {
      localStorage.setItem('taskflow_token', data.data.token);
      localStorage.setItem('taskflow_user', JSON.stringify(data.data));
      setUser(data.data);
      setToken(data.data.token);
      return data.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
