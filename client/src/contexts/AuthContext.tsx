import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import api from '../service/api';
import { User, LoginResponse } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userId: string, userData: { name?: string; email?: string; role?: string; password?: string }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        console.log('Checking stored user:', { storedUser });
        
        if (storedUser && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify the cookie is still valid by making a test request
          try {
            await api.get('/users/');
            console.log('Auth cookie valid, user is authenticated');
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (authError) {
            console.log('Auth cookie invalid, clearing storage');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (email: string, name: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending signup request to:', '/users/');
      console.log('Request data:', { name, email, password });
      
      const response = await api.post('/users/', {
        name,
        email,
        password
      });

      console.log('Signup response:', response.data);
      
    } catch (err: any) {
      console.error('Signup error:', err.response?.data || err.message);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending login request to:', '/auth/login');
      
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password
      }, {
        withCredentials: true
      });

      console.log('Login response:', response.data);

      // Store ONLY user data, NOT tokens (cookies are handled by browser)
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set user and authentication state
      console.log('Setting user:', response.data.user);
      setUser(response.data.user);
      setIsAuthenticated(true);
      
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear cookies
      await api.get('/auth/logout', {} );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and state regardless
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user function
const updateUser = async (userId: string, userData: { name?: string; email?: string; role?: string; password?: string }) => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Sending update request to:', `/users/${userId}`);
    console.log('Request data:', userData);
    
    // Send ALL fields the JSONMapper expects
    const updatePayload = {
      name: userData.name,
      email: userData.email,
      role: userData.role, // Always include role!
      ...(userData.password && userData.password.trim() !== '' ? { password: userData.password } : {})
    };
    
    console.log('Update payload:', updatePayload);
    
    const response = await api.put(`/users/${userId}`, updatePayload, {
      withCredentials: true
    });

    console.log('Update response:', response.data);
    
    // If the updated user is the currently logged in user, update the stored user
    if (user && user.id === userId) {
      const updatedUser = { 
        ...user, 
        name: userData.name || user.name,
        email: userData.email || user.email,
        role: userData.role || user.role
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('Current user updated in storage');
    }
    
  } catch (err: any) {
    console.error('Update error:', err.response?.data || err.message);
    
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message ||
                        'Failed to update user';
    setError(errorMessage);
    throw err;
  } finally {
    setLoading(false);
  }
};
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      register, 
      login, 
      logout,
      updateUser,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};