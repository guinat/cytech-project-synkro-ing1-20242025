import { getTokenService } from './auth.service';

const API_BASE_URL = "http://localhost:8000";

export function extractSuccessMessage(data: any): string {
  if (!data) return 'Operation successful';
  if (typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (data.data && typeof data.data.message === 'string') {
      return data.data.message;
    }
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (typeof data.error === 'string') {
      return data.error;
    }
  }
  return typeof data === 'string' ? data : JSON.stringify(data);
}

export function extractErrorMessage(errorData: any, detailed: boolean = false, firstOnly: boolean = false): string {
  if (!errorData) return 'Unknown error';

  if (detailed || firstOnly) {
    const errorsObj = errorData.errors || errorData;
    if (typeof errorsObj === 'object' && errorsObj !== null && !Array.isArray(errorsObj)) {
      const entries = Object.entries(errorsObj);
      if (firstOnly && entries.length > 0) {
        const [, messages] = entries[0];
        if (Array.isArray(messages)) {
          return typeof messages[0] === 'string' ? messages[0] : String(messages[0]);
        } else {
          return typeof messages === 'string' ? messages : String(messages);
        }
      }
      if (detailed) {
        return entries
          .map(([field, messages]) => Array.isArray(messages) ? `${field}: ${messages.join(', ')}` : `${field}: ${messages}`)
          .join(' | ');
      }
    }
  }

  if (errorData.errors && errorData.errors.non_field_errors && Array.isArray(errorData.errors.non_field_errors)) {
    return errorData.errors.non_field_errors[0];
  }
  if (typeof errorData.message === 'string') {
    return errorData.message;
  }
  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }
  if (typeof errorData.error === 'string') {
    return errorData.error;
  }
  return typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getTokenService();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include'
  });
  if (!res.ok) {
    let errorMessage = 'Unknown error';
    let errorData: any = undefined;
    try {
      errorData = await res.clone().json();
      errorMessage = extractErrorMessage(errorData);
    } catch (e) {
      try {
        errorMessage = await res.text();
      } catch {}
    }
    const error = new Error(errorMessage);
    (error as any).raw = errorData;
    throw error;
  }
  const contentType = res.headers.get('content-type');
  if (res.status === 204 || !contentType || !contentType.includes('application/json')) {
    return undefined as any;
  }
  return res.json();
}
