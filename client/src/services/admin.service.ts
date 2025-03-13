import { User } from './auth.service';
import api from './api';

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  role?: 'user' | 'admin';
  level?: string;
  points?: number;
  is_active?: boolean;
  email_verified?: boolean;
}

class AdminService {
  async getAllUsers(): Promise<User[]> {
    return api.get<User[]>('/admin/users/');
  }

  async getUserDetails(userId: number): Promise<User> {
    return api.get<User>(`/admin/users/${userId}/`);
  }

  async updateUser(userId: number, data: UserUpdateRequest): Promise<User> {
    return api.patch<User>(`/admin/users/${userId}/`, data);
  }

  async deleteUser(userId: number): Promise<void> {
    return api.delete<void>(`/admin/users/${userId}/`);
  }
}

export default new AdminService(); 