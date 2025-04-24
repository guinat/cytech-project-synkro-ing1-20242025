import { apiFetch, extractErrorMessage, extractSuccessMessage } from './api';
import { toast } from 'sonner';

export type UserProfile = {
  id: string;
  email: string;
  username?: string;
  role?: string;
  level?: string;
  points?: number;
  is_email_verified?: boolean;
  profile_photo?: string;
  date_joined?: string;
  last_login?: string;
};

import { getTokenService } from './auth.service';

export async function getMeService(): Promise<UserProfile> {
  const token = getTokenService();
  if (!token) {
    throw new Error('No authentication token found');
  }
  try {
    const res = await apiFetch<{ data: UserProfile }>('/me/', { method: 'GET' });
    return res.data ?? res;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

let globalOtpCurrentPassword: string = '';
export function setGlobalOtpCurrentPassword(pwd: string) { globalOtpCurrentPassword = pwd; }
export function getGlobalOtpCurrentPassword() { return globalOtpCurrentPassword; }
export function clearGlobalOtpCurrentPassword() { globalOtpCurrentPassword = ''; }

export async function updateMeService(data: Partial<UserProfile> & {
  current_password: string;
  new_password?: string;
  new_password_confirm?: string;
  otp_code?: string;
}): Promise<any> {
  try {
    const res = await apiFetch('/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    toast.success(extractSuccessMessage(res));
    return res;
  } catch (error: any) {
    let msg = '';
    if (error && error.raw) {
      msg = extractErrorMessage(error.raw, false, true);
    } else {
      msg = error.message;
    }
    toast.error(msg);
    throw new Error(msg);
  }
}

export async function deleteMeService(): Promise<void> {
  try {
    const data = await apiFetch('/me/', { method: 'DELETE' });
    toast.success(extractSuccessMessage(data));
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

type UserListParams = { search?: string; ordering?: string; role?: string; level?: string; is_email_verified?: boolean };

export async function listUsersService(params?: UserListParams): Promise<UserProfile[]> {
  let url = '/users/';
  if (params) {
    const query = new URLSearchParams(params as any).toString();
    if (query) url += '?' + query;
  }
  try {
    const res = await apiFetch<{ results: UserProfile[] }>(url, { method: 'GET' });
    return res.results ?? res;
  } catch (error: any) {
    let msg = '';
    if (error && error.raw) {
      msg = extractErrorMessage(error.raw, false, true);
    } else {
      msg = error.message;
    }
    toast.error(msg);
    throw new Error(msg);
  }
}

export async function getUserService(id: string): Promise<UserProfile> {
  try {
    const res = await apiFetch<{ data: UserProfile }>(`/users/${id}/`, { method: 'GET' });
    return res.data ?? res;
  } catch (error: any) {
    let msg = '';
    if (error && error.raw) {
      msg = extractErrorMessage(error.raw, false, true);
    } else {
      msg = error.message;
    }
    toast.error(msg);
    throw new Error(msg);
  }
}

export async function createUserService(data: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const res = await apiFetch<{ data: UserProfile }>(`/users/`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data ?? res;
  } catch (error: any) {
    let msg = '';
    if (error && error.raw) {
      msg = extractErrorMessage(error.raw, false, true);
    } else {
      msg = error.message;
    }
    toast.error(msg);
    throw new Error(msg);
  }
}

export async function updateUserService(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await apiFetch<{ data: UserProfile }>(`/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data ?? res;
}

export async function deleteUserService(id: string): Promise<void> {
  await apiFetch(`/users/${id}/`, { method: 'DELETE' });
}
