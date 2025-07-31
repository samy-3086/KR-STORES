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
    // Check for stored user and token on app load
    const storedUser = localStorage.getItem('kr_stores_user');
    const storedToken = localStorage.getItem('kr_stores_token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('kr_stores_user');
        localStorage.removeItem('kr_stores_token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Check for admin credentials first
      if (email === 'kr0792505@gmail.com' && password === 'vidhya') {
        const adminUser: User = {
          id: 'admin-1',
          name: 'KR Admin',
          email: 'kr0792505@gmail.com',
          phone: '+91 98765 43210',
          address: 'KR Stores HQ, Mumbai',
          isAdmin: true
        };

        setUser(adminUser);
        localStorage.setItem('kr_stores_user', JSON.stringify(adminUser));
        localStorage.setItem('kr_stores_token', 'admin-token-' + Date.now());
        return true;
      }

      // Demo credentials
      if (email === 'admin@krstores.com' && password === 'admin123') {
        const demoAdmin: User = {
          id: 'demo-admin',
          name: 'Demo Admin',
          email: 'admin@krstores.com',
          phone: '+91 98765 43210',
          address: 'Demo Address',
          isAdmin: true
        };

        setUser(demoAdmin);
        localStorage.setItem('kr_stores_user', JSON.stringify(demoAdmin));
        localStorage.setItem('kr_stores_token', 'demo-admin-token-' + Date.now());
        return true;
      }

      // Try API login
      try {
        const response = await authAPI.login(email, password);
        if (response.data.success) {
          const userData = {
            ...response.data.user,
            isAdmin: response.data.user.role === 'admin'
          };
          
          setUser(userData);
          localStorage.setItem('kr_stores_user', JSON.stringify(userData));
          localStorage.setItem('kr_stores_token', response.data.token);
          return true;
        }
      } catch (apiError) {
        console.log('API login failed, using demo mode');
      }

      // Demo user login for any other credentials
      const demoUser: User = {
        id: 'demo-user-' + Date.now(),
        name: 'Demo User',
        email: email,
        phone: '+91 98765 43211',
        address: 'Demo Address, Mumbai',
        isAdmin: false
      };

      setUser(demoUser);
      localStorage.setItem('kr_stores_user', JSON.stringify(demoUser));
      localStorage.setItem('kr_stores_token', 'demo-token-' + Date.now());
      return true;

    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);

      // Try API registration
      try {
        const response = await authAPI.register(userData);
        if (response.data.success) {
          const newUser = {
            ...response.data.user,
            isAdmin: response.data.user.role === 'admin'
          };
          
          setUser(newUser);
          localStorage.setItem('kr_stores_user', JSON.stringify(newUser));
          localStorage.setItem('kr_stores_token', response.data.token);
          return true;
        }
      } catch (apiError) {
        console.log('API registration failed, using demo mode');
      }

      // Demo registration
      const newUser: User = {
        id: 'demo-user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        isAdmin: false
      };

      setUser(newUser);
      localStorage.setItem('kr_stores_user', JSON.stringify(newUser));
      localStorage.setItem('kr_stores_token', 'demo-token-' + Date.now());
      return true;

    } catch (error) {
      console.error('Registration error:', error);
      return false;
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