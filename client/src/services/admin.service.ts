import { apiFetch, extractErrorMessage } from '@/services/api';
import { toast } from 'sonner';

export type AdminDashboard = {
  counts: {
    users: number;
    active_users: number;
    homes: number;
    rooms: number;
    devices: number;
  };
  device_status: Record<string, number>;
  device_types: Record<string, number>;
  command_status: Record<string, number>;
  recent_activity: any[];
};

export type AdminHome = {
  id: string;
  name: string;
  owner: { id: string; name: string; email: string };
  members_count: number;
  rooms_count: number;
  created_at: string;
};

export type AdminRoom = {
  id: string;
  name: string;
  room_type: string;
  floor: string;
  home: { id: string; name: string };
  created_at: string;
};

export type AdminDeviceType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  capabilities: any;
  devices_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminDevice = {
  id: string;
  name: string;
  status: string;
  model: string;
  manufacturer: string;
  device_type: { id: string; name: string };
  room: { id: string; name: string };
  home: { id: string; name: string };
  last_seen: string | null;
  created_at: string;
};

export type AdminInvitation = {
  id: string;
  email: string;
  status: string;
  home: { id: string; name: string };
  inviter: { id: string; name: string; email: string };
  created_at: string;
  expires_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  is_staff: boolean;
  owned_homes_count: number;
  member_homes_count: number;
  date_joined: string;
  last_login: string | null;
};

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  try {
    const data = await apiFetch<{ data: AdminDashboard }>('/admin/dashboard/', { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function fetchAdminHomes(): Promise<AdminHome[]> {
  try {
    const data = await apiFetch<{ data: AdminHome[] }>('/admin/homes/', { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function fetchAdminRooms(): Promise<AdminRoom[]> {
  try {
    const data = await apiFetch<{ data: AdminRoom[] }>('/admin/rooms/', { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function fetchAdminDeviceTypes(): Promise<AdminDeviceType[]> {
  try {
    const data = await apiFetch<{ data: AdminDeviceType[] }>('/admin/device-types/', { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function fetchAdminDevices(): Promise<AdminDevice[]> {
  try {
    const data = await apiFetch<{ data: AdminDevice[] }>('/admin/devices/', { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function fetchAdminInvitations(): Promise<AdminInvitation[]> {
  try {
    const data = await apiFetch<{ data: AdminInvitation[] }>('/admin/invitations/', { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const data = await apiFetch<{ data: AdminUser[] }>('/admin/users/', { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}
