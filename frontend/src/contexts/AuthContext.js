// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api';
import { jwtDecode } from 'jwt-decode'; // ✅ fixed import

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Verify token and get user data
      verifyToken();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyToken = async () => {
    try {
      // Decode the token to get user info
      const decoded = jwtDecode(token); // ✅ use jwtDecode

      // Verify token is still valid
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logout();
        return;
      }

      // Set user data from token
      setUser({
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name,
      });

      // Set authorization header for all future requests
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await API.post('/login', { email, password });

      if (response.data.success) {
        const { token, user } = response.data;

        // Store token in localStorage
        localStorage.setItem('token', token);
        setToken(token);

        // Set user data
        setUser(user);

        // Set authorization header
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true, user };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await API.post('/signup', userData);

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Clear user state
    setUser(null);
    setToken(null);

    // Remove authorization header
    delete API.defaults.headers.common['Authorization'];

    // Redirect to login page
    window.location.href = '/login';
  };

  const updateUser = (userData) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }));
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
