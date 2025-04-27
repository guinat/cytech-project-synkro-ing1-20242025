import { apiFetch, extractErrorMessage, extractSuccessMessage } from '@/services/api';
import { toast } from 'sonner';

const TOKEN_KEY = 'auth_token';

export type User = {
  id: string;
  email: string;
  username?: string;
  role?: string;
  points?: number;
  level?: string;
  is_email_verified?: boolean;
  owned_homes_count?: number;
  member_homes_count?: number;
  date_joined?: string;
  last_login?: string;
};

export async function registerService(email: string, password: string, username?: string, password_confirm?: string) {
  try {
    const confirm = password_confirm || password;
    
    const data = await apiFetch<{ data: { user: User; tokens: { access: string; refresh: string } } }>(
      '/auth/register/',
      {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          username, 
          password_confirm: confirm 
        }),
      }
    );
    setTokenService(data.data.tokens.access);
    toast.success(extractSuccessMessage(data));
    return data.data.user;
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

export async function loginService(email: string, password: string) {
  try {
    const data = await apiFetch<any>(
      '/auth/login/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    setTokenService(data.data?.tokens?.access);
    toast.success(extractSuccessMessage(data));
    return data.data.user;

  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function emailVerifyService(token: string) {
  try {
    const data = await apiFetch(`/auth/email/verify/${token}/`, { method: 'GET' });
    toast.success(extractSuccessMessage(data));
    return true;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function emailResendService() {
  try {
    const data = await apiFetch('/auth/email/resend-verification/', { method: 'POST' });
    toast.success(extractSuccessMessage(data));
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function passwordResetRequestService(email: string) {
  try {
    const data = await apiFetch('/auth/password/reset/request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    toast.success(extractSuccessMessage(data));
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function passwordResetConfirmService(token: string, password: string, passwordConfirm: string) {
  try {
    const payload = { token, password, password_confirm: passwordConfirm };
    const data = await apiFetch('/auth/password/reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    toast.success(extractSuccessMessage(data));
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function passwordChangeService(current_password: string, new_password: string, new_password_confirm: string) {
  try {
    const data = await apiFetch('/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password, new_password_confirm }),
    });
    toast.success(extractSuccessMessage(data));
    return true;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export function setTokenService(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getTokenService(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeTokenService() {
  localStorage.removeItem(TOKEN_KEY);
}

