import api from './client';
import { LoginCredentials, LoginResponse, RegisterData, RegisterResponse, User } from './types';

export const authApi = {

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('users/login/', credentials);
    return response.data;
  },


  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('users/register/', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('users/me/');
    return response.data;
  },

  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const response = await api.post<{ access: string }>('users/login/refresh/', { refresh });
    return response.data;
  }
};