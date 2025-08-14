import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to check if user is truly logged in
  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await authAPI.getCurrentUser();

      // Defensive: check if valid user data exists
      if (userData && userData.username) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Invalid or expired session
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.login(credentials);
      await fetchCurrentUser();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Invalid username or password';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.register(userData);
      // Optionally, fetch user again or redirect to login
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    clearError,
  };
}
