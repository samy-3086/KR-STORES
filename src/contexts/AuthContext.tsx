import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User, AuthContextType, RegisterData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('kr_stores_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Try admin login first for specific credentials
      if (email === 'kr0792505@gmail.com' && password === 'vidhya') {
        const response = await authAPI.adminLogin(email, password);
        if (response.data.success) {
          const userData = {
            ...response.data.user,
            isAdmin: response.data.user.role === 'admin'
          };
          setUser(userData);
          localStorage.setItem('kr_stores_token', response.data.token);
          localStorage.setItem('kr_stores_user', JSON.stringify(userData));
          return true;
        }
      } else {
        // Regular user login
        const response = await authAPI.login(email, password);
        if (response.data.success) {
          const userData = {
            ...response.data.user,
            isAdmin: response.data.user.role === 'admin'
          };
          setUser(userData);
          localStorage.setItem('kr_stores_token', response.data.token);
          localStorage.setItem('kr_stores_user', JSON.stringify(userData));
          return true;
        }
      }

      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      // Fallback to localStorage for demo purposes
      if (email === 'admin@krstores.com' && password === 'admin123') {
        const adminUser: User = {
          id: 'admin',
          name: 'Admin',
          email: 'admin@krstores.com',
          phone: '+91 98765 43210',
          address: 'KR Stores HQ',
          isAdmin: true
        };
        setUser(adminUser);
        localStorage.setItem('kr_stores_user', JSON.stringify(adminUser));
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await authAPI.register(userData);
      if (response.data.success) {
        const userDataResponse = {
          ...response.data.user,
          isAdmin: response.data.user.role === 'admin'
        };
        setUser(userDataResponse);
        localStorage.setItem('kr_stores_token', response.data.token);
        localStorage.setItem('kr_stores_user', JSON.stringify(userDataResponse));
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      // Fallback to localStorage for demo purposes
      const users = JSON.parse(localStorage.getItem('kr_stores_users') || '[]');
      
      if (users.find((u: User) => u.email === userData.email)) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        isAdmin: false
      };

      users.push({ ...newUser, password: userData.password });
      localStorage.setItem('kr_stores_users', JSON.stringify(users));
      setUser(newUser);
      localStorage.setItem('kr_stores_user', JSON.stringify(newUser));
      
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kr_stores_user');
    localStorage.removeItem('kr_stores_token');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kr_stores_user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};