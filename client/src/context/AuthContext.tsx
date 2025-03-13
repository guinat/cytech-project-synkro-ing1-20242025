import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import authService, { User } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updateProfile: (username: string, currentPassword: string) => Promise<void>;
  requestEmailChange: (newEmail: string, currentPassword: string) => Promise<void>;
  confirmEmailChange: (otpCode: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string, newPasswordConfirm: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          // Token might be expired, try to refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const { access } = await authService.refreshToken(refreshToken);
              authService.storeTokens(access, refreshToken);
              
              // Try again with new token
              const userData = await authService.getProfile();
              setUser(userData);
            } catch (refreshError) {
              // Refresh failed, clear tokens
              authService.removeTokens();
            }
          } else {
            // No refresh token, clear tokens
            authService.removeTokens();
          }
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({
        email,
        password
      });
      
      // Store tokens
      authService.storeTokens(response.access, response.refresh);
      
      // Set user
      setUser(response.user);
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, passwordConfirm: string) => {
    try {
      const response = await authService.register({
        username,
        email,
        password,
        password_confirm: passwordConfirm
      });
      
      // Store tokens
      authService.storeTokens(response.access, response.refresh);
      
      // Set user
      setUser(response.user);
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const logout = () => {
    // Remove tokens from localStorage
    authService.removeTokens();
    
    // Clear user state
    setUser(null);
  };


  const resetPassword = async (token: string, password: string, passwordConfirm: string) => {
    try {
      await authService.resetPassword(token, password, passwordConfirm);
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await authService.requestPasswordReset(email);
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await authService.resendVerificationEmail();
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token);
      
      // If user is logged in, update their verified status
      if (user) {
        setUser({
          ...user,
          email_verified: true
        });
      }
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const updateProfile = async (username: string, currentPassword: string) => {
    try {
      const response = await authService.updateProfile(username, currentPassword);
      
      // Update user in state
      setUser(response.user);
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const requestEmailChange = async (newEmail: string, currentPassword: string) => {
    try {
      await authService.requestEmailChange(newEmail, currentPassword);
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const confirmEmailChange = async (otpCode: string) => {
    try {
      const response = await authService.confirmEmailChange(otpCode);
      
      // Update user in state
      setUser(response.user);
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };
  
  const changePassword = async (oldPassword: string, newPassword: string, newPasswordConfirm: string) => {
    try {
      await authService.changePassword(oldPassword, newPassword, newPasswordConfirm);
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        resendVerificationEmail,
        verifyEmail,
        updateProfile,
        requestEmailChange,
        confirmEmailChange,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

