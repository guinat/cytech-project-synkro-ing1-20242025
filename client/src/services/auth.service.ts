import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  level: string;
  points: number;
  email_verified: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message?: string;
}


// Authentication service
// Handles all authentication-related API calls
 
class AuthService {
  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/users/login/', data);
  }

  // Register user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/users/register/', data);
  }

  // Get user profile
  async getProfile(): Promise<User> {
    return api.get<User>('/users/profile/');
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/users/password/reset/', { email });
  }

  // Reset password with token
  async resetPassword(token: string, password: string, password_confirm: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/users/password/reset/${token}/`, {
      password,
      password_confirm,
    });
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/users/email/verify/${token}/`);
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<{ message: string }> {
    return api.post<{ message: string }>('/users/email/resend-verification/');
  }

  // Change password
  async changePassword(
    old_password: string,
    new_password: string,
    new_password_confirm: string
  ): Promise<{ message: string }> {
    return api.post<{ message: string }>('/users/password/change/', {
      old_password,
      new_password,
      new_password_confirm,
    });
  }

  // Update user profile
  async updateProfile(
    username: string,
    current_password: string
  ): Promise<{ message: string; user: User }> {
    return api.put<{ message: string; user: User }>('/users/profile/update/', {
      username,
      current_password
    });
  }

  // Request email change with OTP verification
  async requestEmailChange(
    new_email: string,
    current_password: string
  ): Promise<{ message: string }> {
    return api.post<{ message: string }>('/users/email/change/request/', {
      new_email,
      current_password
    });
  }

  // Confirm email change with OTP code
  async confirmEmailChange(
    otp_code: string
  ): Promise<{ message: string; user: User }> {
    return api.post<{ message: string; user: User }>('/users/email/change/confirm/', {
      otp_code
    });
  }

  // Refresh access token
  async refreshToken(refresh: string): Promise<{ access: string }> {
    return api.post<{ access: string }>('/users/token/refresh/', { refresh });
  }
  
  // Store authentication tokens
  storeTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
  
  // Remove authentication tokens
  removeTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export default new AuthService(); 