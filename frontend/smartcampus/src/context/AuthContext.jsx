/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import authService, { getRoleDashboardPath } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount, validate existing token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    authService.getCurrentUser()
      .then((userData) => {
        setUser(userData);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    // Full window navigation to bypass iframe security restrictions
    window.location.href = authService.getGoogleLoginUrl();
  };

  const loginWithEmail = async (payload) => {
    const authData = await authService.loginWithEmail(payload);
    setAuthToken(authData.token);
    setUser(authData.user);
    return authData;
  };

  const signupWithEmail = async (payload) => {
    return authService.signup(payload);
  };

  const requestPasswordReset = async (email) => {
    return authService.forgotPassword({ email });
  };

  const resetPassword = async (payload) => {
    return authService.resetPassword(payload);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore server errors on logout
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const setAuthToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const value = {
    user,
    setUser,
    token,
    setAuthToken,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    isTechnician: user?.role === 'TECHNICIAN',
    isStudent: user?.role === 'USER',
    loading,
    getRoleDashboardPath,
    login,
    loginWithEmail,
    signupWithEmail,
    requestPasswordReset,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
