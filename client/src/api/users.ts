import api from './client';
import { User, Role } from './types';

export const usersApi = {

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('users/users/');
    return response.data;
  },


  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`users/users/${id}/`);
    return response.data;
  },


  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`users/users/${id}/`, data);
    return response.data;
  },


  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`users/users/${id}/`);
  },


  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('users/roles/');
    return response.data;
  },

  createRole: async (data: Omit<Role, 'id'>): Promise<Role> => {
    const response = await api.post<Role>('users/roles/', data);
    return response.data;
  }
};