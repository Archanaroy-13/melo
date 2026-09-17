import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/me');
      if (res.data.error && res.data.error.includes('Database')) {
        setDbConnected(false);
        setUser(null);
        setSetupRequired(false);
      } else {
        setDbConnected(true);
        setSetupRequired(Boolean(res.data.setupRequired));
        if (res.data.authenticated && res.data.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    if (res.data.user) {
      setUser(res.data.user);
      setSetupRequired(false);
    }
    return res.data;
  };

  const setupMasterAccount = async (username, password) => {
    const res = await axios.post('/api/auth/setup', { username, password });
    if (res.data.user) {
      setUser(res.data.user);
      setSetupRequired(false);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      // Ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setupRequired, loading, dbConnected, login, setupMasterAccount, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
