import api from './api';
import { PaginatedResponse } from './device.service';
import { User } from './auth.service';

// Interface for homes
export interface Home {
  id: number;
  name: string;
  code: string;
  owner: number;
  owner_username: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  room_count: number;
  device_count: number;
  rooms?: Room[];
  members?: User[];
}

// Interface for rooms
export interface Room {
  id: number;
  name: string;
  home: number;
  created_at: string;
  device_count: number;
  devices?: any[];
}

// Interface for invitations
export interface HomeMembership {
  id: number;
  home: number;
  home_name: string;
  email: string;
  code: string;
  role: 'admin' | 'member' | 'guest';
  created_at: string;
  expires_at: string;
  is_used: boolean;
  inviter_username: string;
}

// Service for managing homes and rooms
class HomeService {
  // Get all homes for the user
  async getHomes(): Promise<Home[]> {
    const response = await api.get<PaginatedResponse<Home>>('/devices/homes/');
    return response.results;
  }

  // Get details of a home
  async getHome(id: number): Promise<Home> {
    return api.get<Home>(`/devices/homes/${id}/`);
  }

  // Get all homes for the logged-in user
  async getMyHomes(): Promise<Home[]> {
    return api.get<Home[]>('/devices/homes/me/');
  }

  // Create a new home
  async createHome(name: string): Promise<Home> {
    return api.post<Home>('/devices/homes/', { name });
  }

  // Update a home
  async updateHome(id: number, name: string): Promise<Home> {
    return api.patch<Home>(`/devices/homes/${id}/`, { name });
  }

  // Delete a home
  async deleteHome(id: number): Promise<void> {
    return api.delete<void>(`/devices/homes/${id}/`);
  }

  // Add a member to a home
  async addMember(homeId: number, email: string, role: 'admin' | 'member' | 'guest' = 'member'): Promise<HomeMembership> {
    return api.post<HomeMembership>(`/devices/homes/${homeId}/add_member/`, { email, role });
  }

  // Join a home with an invitation code
  async joinHome(invitationCode: string): Promise<Home> {
    return api.post<Home>('/devices/homes/join/', { code: invitationCode });
  }

  // Remove a member from a home
  async removeMember(homeId: number, userId: number): Promise<void> {
    return api.post<void>(`/devices/homes/${homeId}/remove_member/`, { user_id: userId });
  }

  // Get pending invitations for a home
  async getInvitations(homeId: number): Promise<HomeMembership[]> {
    return api.get<HomeMembership[]>(`/devices/homes/${homeId}/invitations/`);
  }

  // Get all rooms in a home
  async getRooms(homeId: number): Promise<Room[]> {
    const response = await api.get<PaginatedResponse<Room>>(`/devices/rooms/?home=${homeId}`);
    return response.results;
  }

  // Get details of a room
  async getRoom(id: number): Promise<Room> {
    return api.get<Room>(`/devices/rooms/${id}/`);
  }

  // Create a new room
  async createRoom(homeId: number, name: string): Promise<Room> {
    return api.post<Room>('/devices/rooms/', { home: homeId, name });
  }

  // Update a room
  async updateRoom(id: number, name: string): Promise<Room> {
    return api.patch<Room>(`/devices/rooms/${id}/`, { name });
  }

  // Delete a room
  async deleteRoom(id: number): Promise<void> {
    return api.delete<void>(`/devices/rooms/${id}/`);
  }

  // Add a device to a room
  async addDeviceToRoom(roomId: number, deviceId: number): Promise<any> {
    return api.post<any>(`/devices/rooms/${roomId}/add_device/`, { device_id: deviceId });
  }
}

export default new HomeService(); 