import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Axios interceptor setup
const setupAxiosInterceptors = (token, logout) => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('prconnect_token'));
  const [loading, setLoading] = useState(true);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('prconnect_token', newToken);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu'
      };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('prconnect_token');
  };

  // Update password function
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/api/auth/update-password', {
        currentPassword,
        newPassword
      });

      const { token: newToken } = response.data;
      setToken(newToken);
      localStorage.setItem('prconnect_token', newToken);
      
      return { success: true, message: 'Şifre başarıyla güncellendi' };
    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Şifre güncellenirken bir hata oluştu'
      };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return { 
        success: true, 
        message: response.data.message || 'Şifre sıfırlama linki e-posta adresinize gönderildi' 
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'E-posta gönderilirken bir hata oluştu'
      };
    }
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Setup axios interceptors when token changes
  useEffect(() => {
    setupAxiosInterceptors(token, logout);
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updatePassword,
    forgotPassword,
    hasRole: (roles) => {
      if (!user) return false;
      if (typeof roles === 'string') {
        return user.role === roles;
      }
      return roles.includes(user.role);
    },
    isAdmin: () => user?.role === 'superadmin',
    canManage: () => ['superadmin', 'manager'].includes(user?.role),
    canEdit: () => ['superadmin', 'manager', 'dataentry'].includes(user?.role)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};