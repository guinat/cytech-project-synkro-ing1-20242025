import api, { ApiResponse } from './api';

// Interface for pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Interface for members
export interface HomeMember {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
}

// Interface for invitations
export interface HomeMembership {
  id: number;
  home: number;
  home_name: string;
  email: string;
  code: string;
  role: string;
  created_at: string;
  expires_at: string;
  is_used: boolean;
  inviter_username: string;
}

// Interface for invitations received by the user
export interface MyInvitation {
  invitation_id: number;
  home_id: number;
  home_name: string;
  owner_name: string;
  role: string;
  expires_at: string;
}

// Interfaces for homes
export interface Home {
  id: number;
  name: string;
  address?: string;
  owner: number;
  owner_username?: string;
  created_at: string;
  updated_at: string;
  room_count?: number;
  device_count?: number;
  member_count?: number;
  code?: string;
  members?: HomeMember[];
}

// Interfaces for rooms
export interface Room {
  id: number;
  name: string;
  home: number;
  home_name?: string;
  floor?: number;
  size?: number;
  created_at: string;
  updated_at: string;
  device_count?: number;
}

// Service class for homes and rooms
class HomeService {
  // Get all homes for the current user
  async getHomes(filters?: { search?: string }): Promise<ApiResponse<Home[]>> {
    const params = new URLSearchParams();
    if (filters && filters.search) {
      params.append('search', filters.search);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<ApiResponse<Home[]>>(`/devices/homes/${queryString}`);
  }

  // Get a home by its ID
  async getHome(id: number): Promise<Home> {
    return api.get<Home>(`/devices/homes/${id}/`);
  }

  // Create a new home
  async createHome(homeData: Partial<Home>): Promise<Home> {
    return api.post<Home>('/devices/homes/', homeData);
  }

  // Update a home
  async updateHome(id: number, homeData: Partial<Home>): Promise<Home> {
    return api.patch<Home>(`/devices/homes/${id}/`, homeData);
  }

  // Delete a home
  async deleteHome(id: number): Promise<void> {
    try {
      return await api.delete<void>(`/devices/homes/${id}/`);
    } catch (error: any) {
      // If the error is 403 Forbidden, log the error but throw it
      if (error?.response?.status === 403) {
        console.error("Permission denied when deleting home. Error:", error);
      }
      throw error;
    }
  }

  // Alternative method to try deleting a home using PATCH to mark it for deletion
  async markHomeForDeletion(id: number): Promise<Home> {
    // This method sends a PATCH request to mark the home as "to be deleted"
    // instead of trying to delete it directly
    return api.patch<Home>(`/devices/homes/${id}/`, { 
      marked_for_deletion: true 
    });
  }

  // Get all rooms for a specific home
  async getRooms(homeId: number, filters?: { search?: string }): Promise<ApiResponse<Room[]>> {
    const params = new URLSearchParams();
    params.append('home', homeId.toString());
    
    if (filters && filters.search) {
      params.append('search', filters.search);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<ApiResponse<Room[]>>(`/devices/rooms/${queryString}`);
  }

  // Get a room by its ID
  async getRoom(id: number): Promise<Room> {
    return api.get<Room>(`/devices/rooms/${id}/`);
  }

  // Create a new room
  async createRoom(roomData: Partial<Room>): Promise<Room> {
    return api.post<Room>('/devices/rooms/', roomData);
  }

  // Update a room
  async updateRoom(id: number, roomData: Partial<Room>): Promise<Room> {
    return api.patch<Room>(`/devices/rooms/${id}/`, roomData);
  }

  // Delete a room
  async deleteRoom(id: number): Promise<void> {
    return api.delete<void>(`/devices/rooms/${id}/`);
  }

  // Invite a member to a home
  async addMember(homeId: number, email: string, role: string = 'adult'): Promise<ApiResponse<HomeMembership>> {
    return api.post<ApiResponse<HomeMembership>>(`/devices/homes/${homeId}/add_member/`, { email, role });
  }

  // Remove a member from a home
  async removeMember(homeId: number, userId: number): Promise<ApiResponse<any>> {
    return api.post<ApiResponse<any>>(`/devices/homes/${homeId}/remove_member/`, { user_id: userId });
  }

  // Get invitations for a home
  async getHomeInvitations(homeId: number): Promise<ApiResponse<HomeMembership[]>> {
    return api.get<ApiResponse<HomeMembership[]>>(`/devices/homes/${homeId}/invitations/`);
  }

  // Get invitations for the current user
  async getMyInvitations(): Promise<ApiResponse<MyInvitation[]>> {
    return api.get<ApiResponse<MyInvitation[]>>(`/devices/homes/my_invitations/`);
  }

  // Accept an invitation
  async acceptInvitation(invitationId: number): Promise<ApiResponse<Home>> {
    return api.post<ApiResponse<Home>>(`/devices/homes/accept_invitation/`, { invitation_id: invitationId });
  }

  // Delete an invitation
  async deleteInvitation(homeId: number, invitationId: number): Promise<ApiResponse<any>> {
    return api.delete<ApiResponse<any>>(`/devices/homes/${homeId}/invitations/${invitationId}/`);
  }

  // Join a home via a token
  async joinByToken(token: string): Promise<ApiResponse<Home>> {
    return api.post<ApiResponse<Home>>(`/devices/homes/join_by_token/`, { token });
  }
}

export default new HomeService(); 