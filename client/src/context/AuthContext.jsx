import React, { createContext, useState, useContext, useEffect } from 'react';
import { verifyToken, logout as logoutAPI } from '../api';

const AuthContext = createContext(null);

// Helper function to decode JWT and get expiration time
const getTokenExpiry = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload).exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiresIn, setTokenExpiresIn] = useState(null);

  useEffect(() => {
    // Load tokens from localStorage on mount
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedAccessToken && storedRefreshToken && storedUser) {
      // Check if access token is expired
      if (!isTokenExpired(storedAccessToken)) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
        
        // Calculate remaining time
        const expiry = getTokenExpiry(storedAccessToken);
        setTokenExpiresIn(expiry ? Math.round((expiry - Date.now()) / 1000) : null);
      } else {
        // Clear expired tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Token expiration warning timer
  useEffect(() => {
    if (!accessToken) return;

    const expiry = getTokenExpiry(accessToken);
    if (!expiry) return;

    const timeUntilExpiry = expiry - Date.now();
    
    // Set timer to warn user 1 minute before expiration
    if (timeUntilExpiry > 60000) {
      const timer = setTimeout(() => {
        console.warn('Token expiring soon - will auto-refresh');
      }, timeUntilExpiry - 60000);
      
      return () => clearTimeout(timer);
    }
  }, [accessToken]);

  const loginUser = (userData, tokens) => {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setTokenExpiresIn(tokens.expiresIn);
    
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = async () => {
    try {
      // Call logout endpoint for audit logging
      await logoutAPI();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setTokenExpiresIn(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isTokenValid = () => {
    return accessToken && !isTokenExpired(accessToken);
  };

  const isAdmin = user?.role === 'admin';
  const isHost = user?.role === 'host';
  const isAuthenticated = !!user && !!accessToken && isTokenValid();

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        accessToken,
        refreshToken,
        tokenExpiresIn,
        loading,
        isAdmin,
        isHost,
        isAuthenticated,
        isTokenValid,
        login: loginUser, 
        logout: logoutUser,
        updateUser 
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
