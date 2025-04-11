import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import authService, { User } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, passwordConfirm: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updateProfile: (data: { 
    username?: string; 
    email?: string;
    first_name?: string; 
    last_name?: string; 
    gender?: 'male' | 'female' | 'other';
    date_of_birth?: string;
    home_role?: string;
    current_password: string 
  }) => Promise<void>;
  uploadAvatar: (avatar: File) => Promise<string>;
  requestEmailChange: (newEmail: string, currentPassword: string) => Promise<{email_sent: boolean}>;
  confirmEmailChange: (otpCode: string) => Promise<{success: boolean; message: string; appliedChanges: boolean; error?: any}>;
  changePassword: (oldPassword: string, newPassword: string, newPasswordConfirm: string) => Promise<void>;
  updateUser: (userData: User) => void;
  cancelPendingChanges: () => void;
  hasPendingChanges: boolean;
  getPendingEmail: () => string | null;
  prepareProfileChanges: (data: Partial<User> & { current_password: string; email?: string }) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingProfileChanges, setPendingProfileChanges] = useState<{
    data: Partial<Omit<User, 'email'>> & { current_password: string };
    newEmail: string;
  } | null>(() => {
    // Initialize with data from localStorage if available
    try {
      const savedChanges = localStorage.getItem('pendingProfileChanges');
      if (savedChanges) {
        const parsed = JSON.parse(savedChanges);
        console.log("AuthContext: Restoring pending changes from localStorage:", parsed);
        return parsed;
      }
    } catch (error) {
      console.error("AuthContext: Error retrieving pending changes:", error);
    }
    return null;
  });

  // Function to update pending changes and save them
  const updatePendingChanges = (changes: {
    data: Partial<Omit<User, 'email'>> & { current_password: string };
    newEmail: string;
  } | null) => {
    setPendingProfileChanges(changes);
    
    // Save to localStorage
    try {
      if (changes) {
        localStorage.setItem('pendingProfileChanges', JSON.stringify(changes));
        console.log("AuthContext: Pending changes saved to localStorage");
      } else {
        localStorage.removeItem('pendingProfileChanges');
        console.log("AuthContext: Pending changes removed from localStorage");
      }
    } catch (error) {
      console.error("AuthContext: Error saving pending changes:", error);
    }
  };

  // Utility function to update the authentication state
  const updateAuthState = (userData: User | null) => {
    const hasToken = authService.isAuthenticated();
    console.log('Updating authentication state:', { 
      hasUser: !!userData, 
      hasToken, 
      tokenLength: authService.getAccessToken()?.length 
    });
    
    setUser(userData);
    setIsAuthenticated(!!userData && hasToken);
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("AuthContext: Checking authentication...");
      const hasToken = authService.isAuthenticated();
      console.log("AuthContext: Token present:", hasToken);
      
      if (hasToken) {
        console.log("AuthContext: Token found, attempting to retrieve profile...");
        try {
          const userData = await authService.getProfile();
          console.log("AuthContext: Profile retrieved successfully:", userData?.username);
          updateAuthState(userData);
        } catch (error) {
          console.error("AuthContext: Error retrieving profile:", error);
          // Token might be expired, try to refresh
          const refreshToken = authService.getRefreshToken();
          if (refreshToken) {
            console.log("AuthContext: Attempting to refresh token...");
            try {
              const { access } = await authService.refreshToken(refreshToken);
              console.log("AuthContext: Token refreshed successfully");
              authService.storeTokens(access, refreshToken);
              
              // Try again with new token
              try {
                console.log("AuthContext: New attempt to retrieve profile...");
                const userData = await authService.getProfile();
                console.log("AuthContext: Profile successfully retrieved after refresh:", userData?.username);
                updateAuthState(userData);
              } catch (retryError) {
                console.error("AuthContext: Failed to retrieve profile after refresh:", retryError);
                updateAuthState(null);
                authService.removeTokens();
              }
            } catch (refreshError) {
              console.error("AuthContext: Failed to refresh token:", refreshError);
              // Refresh failed, clear tokens and user
              updateAuthState(null);
              authService.removeTokens();
            }
          } else {
            console.log("AuthContext: No refresh token, clearing tokens");
            // No refresh token, clear tokens and user
            updateAuthState(null);
            authService.removeTokens();
          }
        }
      } else {
        console.log("AuthContext: No access token found");
        updateAuthState(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    console.log("AuthContext: Login attempt...");
    try {
      const response = await authService.login({
        email,
        password
      });
      
      console.log("AuthContext: Login response received:", response);
      
      // Check if tokens are present in the response
      if (!response || !response.access || !response.refresh) {
        console.error("AuthContext: Missing tokens in response:", response);
        throw new Error("Authentication tokens are missing in the response");
      }
      
      console.log("AuthContext: Tokens found in response, lengths:", {
        access: response.access?.length,
        refresh: response.refresh?.length
      });
      
      // Store tokens
      authService.storeTokens(response.access, response.refresh);
      
      // Immediate verification that tokens have been stored
      const accessToken = authService.getAccessToken();
      const refreshToken = authService.getRefreshToken();
      console.log("AuthContext: Verifying token storage:", {
        access: !!accessToken,
        refresh: !!refreshToken,
        accessLength: accessToken?.length,
        refreshLength: refreshToken?.length
      });
      
      // Check if user is present in the response
      if (!response.user) {
        console.error("AuthContext: User data missing in response:", response);
        throw new Error("User data is missing in the response");
      }
      
      // Set user and auth state
      console.log("AuthContext: Updating user data in context:", response.user?.username);
      updateAuthState(response.user);
      
      // Force an additional check to ensure the token is properly stored
      setTimeout(() => {
        const hasValidToken = authService.isAuthenticated();
        const token = authService.getAccessToken();
        console.log("AuthContext: Post-login authentication verification:", 
          { hasValidToken, tokenLength: token?.length, token: token?.substring(0, 20) + '...' });
          
        // If authentication state doesn't match the token, force an update
        if (hasValidToken !== isAuthenticated) {
          console.log("AuthContext: Inconsistent authentication state, forced update");
          setIsAuthenticated(hasValidToken);
        }
      }, 100);
    } catch (error) {
      console.error("AuthContext: Error during login:", error);
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, passwordConfirm: string, firstName?: string, lastName?: string) => {
    try {
      console.log("AuthContext: Registration attempt...");
      const response = await authService.register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName
      });
      
      console.log("AuthContext: Registration response received:", response);
      
      // Check if tokens are present in the response
      if (!response || !response.access || !response.refresh) {
        console.error("AuthContext: Missing tokens in registration response:", response);
        throw new Error("Authentication tokens are missing in the response");
      }
      
      console.log("AuthContext: Registration successful, storing tokens");
      // Store tokens
      authService.storeTokens(response.access, response.refresh);
      
      // Immediate verification that tokens have been stored
      const accessToken = authService.getAccessToken();
      const refreshToken = authService.getRefreshToken();
      console.log("AuthContext: Verifying token storage after registration:", {
        access: !!accessToken,
        refresh: !!refreshToken,
        accessLength: accessToken?.length,
        refreshLength: refreshToken?.length
      });
      
      // Check if user is present in the response
      if (!response.user) {
        console.error("AuthContext: User data missing in registration response:", response);
        throw new Error("User data is missing in the response");
      }
      
      // Set user and auth state
      console.log("AuthContext: Updating user data in context after registration:", response.user?.username);
      updateAuthState(response.user);
      
      // Force an additional check to ensure the token is properly stored
      setTimeout(() => {
        const hasValidToken = authService.isAuthenticated();
        const token = authService.getAccessToken();
        console.log("AuthContext: Post-registration authentication verification:", 
          { hasValidToken, tokenLength: token?.length, token: token?.substring(0, 20) + '...' });
          
        // If authentication state doesn't match the token, force an update
        if (hasValidToken !== isAuthenticated) {
          console.log("AuthContext: Inconsistent authentication state after registration, forced update");
          setIsAuthenticated(hasValidToken);
        }
      }, 100);
    } catch (error) {
      console.error("AuthContext: Error during registration:", error);
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const logout = () => {
    // Remove tokens from localStorage
    authService.removeTokens();
    
    // Clear user state and auth state
    updateAuthState(null);
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

  const updateProfile = async (data: { 
    username?: string; 
    email?: string;
    first_name?: string; 
    last_name?: string; 
    gender?: 'male' | 'female' | 'other';
    date_of_birth?: string;
    home_role?: string;
    current_password: string 
  }): Promise<void> => {
    try {
      console.log("AuthContext: Attempting to update profile with data:", 
        { ...data, current_password: '********' });
      
      // If an email change is included, use prepareProfileChanges and requestEmailChange
      if (data.email && data.email !== user?.email) {
        console.log("AuthContext: Detected email change to:", data.email);
        
        // Prepare the changes
        prepareProfileChanges(data);
        
        // Request email change only
        await requestEmailChange(data.email, data.current_password);
        return;
      }
      
      // Check if there are already pending changes
      if (pendingProfileChanges && !data.email) {
        console.log("AuthContext: Existing pending changes detected, using the pending new email");
        // If an update is attempted without specifying an email, but there's a pending email change,
        // reuse the pending email to avoid overwriting the change
        data = {
          ...data,
          email: pendingProfileChanges.newEmail
        };
      }
      
      // Standard case (no email change or modifications after email confirmation)
      const updatedUser = await authService.updateProfile(data);
      
      console.log("AuthContext: Profile updated successfully:", updatedUser?.username);
      
      // Update user state explicitly
      updateAuthState(updatedUser);
      
      // Clear pending changes if they exist
      if (pendingProfileChanges) {
        console.log("AuthContext: Clearing pending changes after successful update");
        updatePendingChanges(null);
      }
    } catch (error) {
      console.error("AuthContext: Error updating profile:", error);
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const uploadAvatar = async (avatar: File) => {
    try {
      const response = await authService.uploadAvatar(avatar);
      
      // Update user avatar in state
      if (user && response.avatar_url) {
        setUser({
          ...user,
          avatar_url: response.avatar_url,
          avatar: response.avatar_url // To maintain compatibility with existing code
        });
      }
      
      return response.avatar_url;
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const requestEmailChange = async (newEmail: string, currentPassword: string) => {
    try {
      console.log("AuthContext: Request to change email to:", newEmail);
      
      // If no changes have been prepared, but we have a password,
      // implicitly create pending changes for email change only
      if (!pendingProfileChanges && currentPassword) {
        console.log("AuthContext: No prepared changes, implicitly creating for email change");
        updatePendingChanges({
          data: { 
            current_password: currentPassword 
          },
          newEmail: newEmail
        });
      }
      
      const response = await authService.requestEmailChange(newEmail, currentPassword);
      return response;
    } catch (error) {
      // Directly throw the original error to preserve ApiError type
      throw error;
    }
  };

  const confirmEmailChange = async (otpCode: string) => {
    try {
      // Check pending changes before confirmation
      console.log("AuthContext: Pending changes before confirmation:", pendingProfileChanges);
      
      // Confirm email change
      const updatedUser = await authService.confirmEmailChange(otpCode);
      console.log("AuthContext: Email updated successfully, new data:", updatedUser);
      
      // If we have pending changes, apply them now
      if (pendingProfileChanges && pendingProfileChanges.data) {
        console.log("AuthContext: Applying pending changes after email change:", 
          pendingProfileChanges.data);
        
        try {
          // Save current pending changes as backup
          const backupChanges = {...pendingProfileChanges};
          
          // Apply all previously stored changes
          const finalUser = await authService.updateProfile(pendingProfileChanges.data);
          
          // Update user state with all changes
          updateAuthState(finalUser);
          
          // Clear pending changes
          updatePendingChanges(null);
          
          console.log("AuthContext: All changes have been applied successfully. Final data:", finalUser);
          return {
            success: true,
            message: "Email changed and profile updated successfully",
            appliedChanges: true
          };
        } catch (updateError) {
          console.error("AuthContext: Error applying pending changes:", updateError);
          // In case of failure, still update with the new email
          updateAuthState(updatedUser);
          
          // Don't clear pending changes in case of temporary error
          // The user can try again later
          
          return {
            success: true,
            message: "Email changed successfully, but some changes could not be applied",
            appliedChanges: false,
            error: updateError
          };
        }
      } else {
        // No pending changes, update normally
        console.log("AuthContext: No pending changes to apply");
        updateAuthState(updatedUser);
        
        return {
          success: true,
          message: "Email changed successfully",
          appliedChanges: false
        };
      }
    } catch (error) {
      console.error("AuthContext: Error confirming email change:", error);
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

  const updateUser = (userData: User) => {
    // Update user state and authentication state
    console.log("AuthContext: Updating user data:", userData?.username);
    updateAuthState(userData);
  };

  const cancelPendingChanges = () => {
    updatePendingChanges(null);
  };

  const hasPendingChanges = !!pendingProfileChanges;

  const getPendingEmail = () => {
    return pendingProfileChanges?.newEmail || null;
  };

  const prepareProfileChanges = (data: Partial<User> & { current_password: string; email?: string }) => {
    console.log("AuthContext: Preparing profile changes:", 
      { ...data, current_password: '********' });
    
    if (!data.email) {
      console.error("AuthContext: Cannot prepare changes without email");
      return;
    }
    
    if (data.email === user?.email) {
      console.log("AuthContext: Email hasn't changed, no need to store changes");
      return;
    }
    
    // Store all changes including password for later use
    const { email, ...otherChanges } = data;
    
    console.log("AuthContext: Storing pending changes:", otherChanges);
    
    updatePendingChanges({
      data: otherChanges as Partial<Omit<User, 'email'>> & { current_password: string },
      newEmail: email
    });
    
    // Display the state of pending changes right after update
    setTimeout(() => {
      console.log("AuthContext: State of pending changes:", pendingProfileChanges);
    }, 0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        resendVerificationEmail,
        verifyEmail,
        updateProfile,
        uploadAvatar,
        requestEmailChange,
        confirmEmailChange,
        changePassword,
        updateUser,
        cancelPendingChanges,
        hasPendingChanges,
        getPendingEmail,
        prepareProfileChanges
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

export default AuthContext;

