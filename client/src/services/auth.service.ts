import api, { ApiError, API_URL } from './api';

// Class for managing tokens
class TokenService {
  private ACCESS_TOKEN_KEY = 'access_token';
  private REFRESH_TOKEN_KEY = 'refresh_token';
  
  // Set access token in localStorage
  setAccessToken(token: string): void {
    if (token) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      console.log('Access token saved:', token.slice(0, 10) + '...');
    } else {
      console.warn('Attempted to save empty access token');
    }
  }
  
  // Set refresh token in localStorage
  setRefreshToken(token: string): void {
    if (token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      console.log('Refresh token saved:', token.slice(0, 10) + '...');
    } else {
      console.warn('Attempted to save empty refresh token');
    }
  }
  
  // Get access token from localStorage
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  // Get refresh token from localStorage
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  // Clear tokens from localStorage
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    console.log('Tokens cleared from localStorage');
  }
  
  // Check if access token exists
  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }
  
  // Store both tokens at once
  storeTokens(accessToken: string, refreshToken: string): void {
    if (!accessToken || !refreshToken) {
      console.error('Missing token data:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length
      });
      throw new Error('Invalid token data');
    }
    
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    
    // Verify token storage
    const storedAccessToken = this.getAccessToken();
    const storedRefreshToken = this.getRefreshToken();
    
    if (!storedAccessToken || !storedRefreshToken) {
      console.error('Token storage failed:', {
        originalAccessLength: accessToken.length,
        originalRefreshLength: refreshToken.length,
        storedAccessLength: storedAccessToken?.length,
        storedRefreshLength: storedRefreshToken?.length
      });
      throw new Error('Token storage failed');
    }
    
    console.log('Tokens stored successfully');
  }
}

// Class for managing user data in localStorage
class UserDataService {
  private USER_CACHE_KEY = 'user_cache';
  
  // Store user data in localStorage
  storeUserData(userData: User): void {
    if (!userData) {
      console.warn('Attempted to store empty user data');
      return;
    }
    
    try {
      // Handle potential circular references in user data
      const safeUserData = JSON.parse(JSON.stringify(userData));
      localStorage.setItem(this.USER_CACHE_KEY, JSON.stringify(safeUserData));
      console.log('User data stored in cache:', userData.username);
    } catch (error) {
      console.error('Error storing user data in cache:', error);
      // In case of error, try to store minimal user data
      const minimalUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };
      localStorage.setItem(this.USER_CACHE_KEY, JSON.stringify(minimalUserData));
      console.log('Minimal user data stored in cache as fallback');
    }
  }
  
  // Get user data from localStorage
  getUserData(): User | null {
    const userData = localStorage.getItem(this.USER_CACHE_KEY);
    
    if (!userData) {
      return null;
    }
    
    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Error parsing user data from cache:', error);
      return null;
    }
  }
  
  // Update specific field in user data
  updateUserField<K extends keyof User>(field: K, value: User[K]): void {
    const userData = this.getUserData();
    
    if (!userData) {
      console.warn(`Attempted to update field ${String(field)} but no user data exists`);
      return;
    }
    
    const updatedUserData = {
      ...userData,
      [field]: value
    };
    
    this.storeUserData(updatedUserData);
    console.log(`Updated user field ${String(field)} in cache`);
  }
  
  // Clear user data
  clearUserData(): void {
    localStorage.removeItem(this.USER_CACHE_KEY);
    console.log('User data cleared from cache');
  }
}

// Types for API requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

/**
 * User model based on backend model 
 * @see server/users/models.py
 */
export interface User {
  id: number;
  // Authentication fields
  email: string;
  username: string;
  
  // Personal information
  first_name: string;
  last_name: string;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  home_role?: string;
  
  // Avatar
  avatar?: string; // base64 encoded
  avatar_mime_type?: string;
  avatar_url?: string; // Derived from avatar in API responses
  
  // Role and level
  role: 'visitor' | 'simple' | 'complex' | 'admin';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  points: number;
  
  // Account state
  is_staff: boolean;
  email_verified: boolean;
  registration_approved: boolean;
  is_profile_completed: boolean;
  
  // Timestamps
  date_joined: string;
  last_login: string | null;
}

// API response interfaces
export interface AuthResponseData {
  user: User;
  access: string;
  refresh: string;
}

export interface ProfileUpdateResponse {
  user: User;
}

export interface AvatarUploadResponse {
  avatar_url: string;
}

export interface EmailChangeResponse {
  user: User;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface ApiSuccessResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: string;
  message: string;
  errors?: Record<string, string>;
  error_code?: string;
}

// Authentication service
class AuthService {
  private tokenService: TokenService;
  private userDataService: UserDataService;
  
  constructor() {
    this.tokenService = new TokenService();
    this.userDataService = new UserDataService();
  }
  
  // Central method for handling API errors uniformly
  private handleApiError(error: any, context: string): never {
    console.error(`AuthService: Error during ${context}:`, error);
    
    // If it's already an ApiError, return it as is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // If it's a network error
    if (error instanceof Error) {
      // Create an ApiError with the error message
      throw new ApiError(0, `Connection error: ${error.message}`, { detail: error.message });
    }
    
    // For other types of unspecified errors
    throw new ApiError(500, `Unexpected error during ${context}`, { detail: String(error) });
  }
  
  // Token getters and setters
  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }
  
  getRefreshToken(): string | null {
    return this.tokenService.getRefreshToken();
  }
  
  setAccessToken(token: string): void {
    this.tokenService.setAccessToken(token);
  }
  
  setRefreshToken(token: string): void {
    this.tokenService.setRefreshToken(token);
  }
  
  // Login user
  async login(data: LoginRequest): Promise<AuthResponseData> {
    try {
      console.log(`AuthService: Attempting to login with ${data.email}`);
      
      // User login API call
      const response = await api.post<ApiSuccessResponse<AuthResponseData>>('/users/login/', data);
      
      if (!response || !response.data) {
        throw new ApiError(400, "Empty response from server", { detail: "The server returned an empty response" });
      }
      
      const authData = response.data;
      
      if (!authData.user) {
        throw new ApiError(400, "Missing user data", { detail: "User data is missing from the response" });
      }
      
      if (!authData.access || !authData.refresh) {
        throw new ApiError(400, "Missing authentication tokens", { detail: "Tokens are missing from the response" });
      }
      
      // Store tokens & user data
      this.tokenService.storeTokens(authData.access, authData.refresh);
      this.userDataService.storeUserData(authData.user);
      
      return authData;
    } catch (error) {
      return this.handleApiError(error, 'login');
    }
  }
  
  // Register user
  async register(data: RegisterRequest): Promise<AuthResponseData> {
    try {
      console.log(`AuthService: Attempting to register for ${data.email}`);
      
      // User registration API call
      const response = await api.post<ApiSuccessResponse<AuthResponseData>>('/users/register/', data);
      
      if (!response || !response.data) {
        throw new ApiError(400, "Empty registration response", { detail: "The server returned an empty response" });
      }
      
      const authData = response.data;
      
      if (!authData.user) {
        throw new ApiError(400, "Missing user data", { detail: "User data is missing from the registration response" });
      }
      
      if (!authData.access || !authData.refresh) {
        throw new ApiError(400, "Missing authentication tokens", { detail: "Tokens are missing from the registration response" });
      }
      
      // Store tokens & user data
      this.tokenService.storeTokens(authData.access, authData.refresh);
      this.userDataService.storeUserData(authData.user);
      
      return authData;
    } catch (error) {
      return this.handleApiError(error, 'registration');
    }
  }
  
  // Get user profile
  async getProfile(): Promise<User> {
    try {
      console.log('AuthService: Retrieving user profile');
      
      // Check if there's a token
      if (!this.tokenService.hasAccessToken()) {
        throw new ApiError(401, "Not authenticated", { detail: "No access token available" });
      }
      
      // User profile API call
      const response = await api.get<ApiSuccessResponse<User>>('/users/profile/');
      
      if (!response || !response.data) {
        throw new ApiError(400, "Empty profile response", { detail: "The server returned an empty response" });
      }
      
      const userData = response.data;
      
      // Update cached user data
      this.userDataService.storeUserData(userData);
      
      return userData;
    } catch (error) {
      return this.handleApiError(error, 'profile retrieval');
    }
  }
  
  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/users/password/reset/', { email });
    } catch (error) {
      this.handleApiError(error, 'password reset request');
    }
  }
  
  // Reset password with token
  async resetPassword(token: string, password: string, password_confirm: string): Promise<void> {
    try {
      await api.post(`/users/password/reset/${token}/`, {
        password,
        password_confirm,
      });
    } catch (error) {
      this.handleApiError(error, 'password reset');
    }
  }
  
  // Verify email with token
  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post(`/users/email/verify/${token}/`);
    } catch (error) {
      this.handleApiError(error, 'email verification');
    }
  }
  
  // Resend verification email
  async resendVerificationEmail(): Promise<void> {
    try {
      await api.post('/users/email/resend-verification/');
    } catch (error) {
      this.handleApiError(error, 'resending verification email');
    }
  }
  
  // Change password
  async changePassword(
    old_password: string,
    new_password: string,
    new_password_confirm: string
  ): Promise<void> {
    try {
      await api.post('/users/password/change/', {
        old_password,
        new_password,
        new_password_confirm,
      });
    } catch (error) {
      this.handleApiError(error, 'password change');
    }
  }
  
  // Update user profile
  async updateProfile(
    data: {
      username?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      gender?: 'male' | 'female' | 'other';
      date_of_birth?: string;
      home_role?: string;
      current_password: string;
    }
  ): Promise<User> {
    try {
      console.log('AuthService: Updating user profile');
      
      // Update profile API call
      const response = await api.patch<ApiSuccessResponse<{user: User; updated_fields: string[]}>>('/users/profile/update/', data);
      
      console.log('Complete response:', response);
      
      if (!response || !response.data || !response.data.user) {
        throw new ApiError(400, "Invalid profile update response", { detail: "User data is missing from the response" });
      }
      
      // Extract user data from the response
      const userData = response.data.user;
      
      // Update user cache
      this.userDataService.storeUserData(userData);
      
      return userData;
    } catch (error) {
      return this.handleApiError(error, 'profile update');
    }
  }
  
  // Upload avatar
  async uploadAvatar(avatar: File): Promise<AvatarUploadResponse> {
    try {
      console.log('AuthService: Uploading avatar');
      
      // Check if user is authenticated
      if (!this.tokenService.hasAccessToken()) {
        throw new ApiError(401, "Not authenticated", { detail: "You must be logged in to upload an avatar" });
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('avatar', avatar);
      
      // Avatar upload API call with form data
      const response = await fetch(`${API_URL}/users/profile/avatar/`, {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${this.tokenService.getAccessToken()}`
        }),
        body: formData
      });
      
      // Parse response
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          response.status,
          errorData.message || 'Avatar upload failed',
          errorData
        );
      }
      
      const responseData = await response.json();
      
      if (!responseData || !responseData.data) {
        throw new ApiError(400, "Invalid avatar response", { detail: "The response format is invalid" });
      }
      
      const avatarData = responseData.data as AvatarUploadResponse;
      
      // Update user data in cache if avatar_url is returned
      if (avatarData.avatar_url) {
        const userData = this.userDataService.getUserData();
        if (userData) {
          userData.avatar_url = avatarData.avatar_url;
          this.userDataService.storeUserData(userData);
        }
      }
      
      return avatarData;
    } catch (error) {
      return this.handleApiError(error, 'avatar upload');
    }
  }
  
  // Request email change
  async requestEmailChange(
    new_email: string,
    current_password: string
  ): Promise<{email_sent: boolean}> {
    try {
      const response = await api.post<ApiSuccessResponse<{email_sent: boolean}>>('/users/email/change/request/', {
        new_email,
        current_password
      });
      
      return response.data || {email_sent: true};
    } catch (error) {
      return this.handleApiError(error, 'email change request');
    }
  }
  
  // Confirm email change with OTP
  async confirmEmailChange(otp_code: string): Promise<User> {
    try {
      const response = await api.post<ApiSuccessResponse<User>>('/users/email/change/confirm/', {
        otp_code: otp_code
      });
      
      if (!response || !response.data) {
        throw new ApiError(400, "Empty email change confirmation response", { detail: "The server returned an empty response" });
      }
      
      const userData = response.data;
      
      // Update user data in cache
      this.userDataService.storeUserData(userData);
      
      return userData;
    } catch (error) {
      return this.handleApiError(error, 'email change confirmation');
    }
  }
  
  // Refresh token
  async refreshToken(refresh: string): Promise<TokenRefreshResponse> {
    try {
      const response = await api.post<TokenRefreshResponse>('/users/token/refresh/', { refresh });
      return response;
    } catch (error) {
      return this.handleApiError(error, 'token refresh');
    }
  }
  
  // Store tokens
  storeTokens(access: string, refresh: string): void {
    this.tokenService.storeTokens(access, refresh);
  }
  
  // Remove tokens
  removeTokens(): void {
    // Remove tokens and user data
    this.tokenService.clearTokens();
    this.userDataService.clearUserData();
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.tokenService.hasAccessToken();
  }
  
  // Get cached user data
  getCachedUserData(): User | null {
    return this.userDataService.getUserData();
  }
  
  // Check if the user profile is completed
  isProfileCompleted(): boolean {
    const userData = this.getCachedUserData();
    return userData?.is_profile_completed === true;
  }
}

// Create a singleton instance
const authService = new AuthService();
export default authService; 