// Base API URL 
export const API_URL = 'http://localhost:8000/api';

// Enable debug mode for more verbose logging
export const DEBUG_API = true;

// Interface for paginated responses (legacy format)
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Interface for the new API response format
export interface ApiResponse<T> {
  status: string;
  data: T;
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
    page_size?: number;
    total_pages?: number;
    current_page?: number;
  };
  message?: string;
}

// Custom error for API responses
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Helper function to get authentication token
const getAuthHeader = (): Headers => {
  const headers = new Headers();
  const token = localStorage.getItem('access_token');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return headers;
};

// Token refresh function
const refreshAccessToken = async (): Promise<string> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    console.log('Attempting to refresh access token');
    const response = await fetch(`${API_URL}/users/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    const newAccessToken = data.access;
    
    if (!newAccessToken) {
      throw new Error('Invalid token response');
    }
    
    localStorage.setItem('access_token', newAccessToken);
    console.log('Access token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Clear tokens on refresh failure
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    throw error;
  }
};

// Handle token expiration and refresh
const handleTokenRefresh = async (response: Response): Promise<Response> => {
  // If response is 401 and we have a refresh token, try to refresh
  if (response.status === 401 && localStorage.getItem('refresh_token')) {
    try {
      await refreshAccessToken();
      
      // Retry the original request with the new token
      const originalRequest = response.url;
      // We can't get the method from the response object directly,
      // so we'll default to 'GET' which is most common
      const method = 'GET';
      const headers = getAuthHeader();
      
      // Add content-type for non-GET requests
      if (method !== 'GET') {
        headers.set('Content-Type', 'application/json');
      }
      
      const newResponse = await fetch(originalRequest, {
        method,
        headers,
      });
      
      return newResponse;
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }
  
  return response;
};

// Parse the response from the API
const parseResponse = async (response: Response) => {
  // Check for auth errors and try to refresh token if needed
  response = await handleTokenRefresh(response);
  
  const contentType = response.headers.get('content-type');
  
  // Handle JSON responses
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error Response:', response.status, data);
      
      // Helper function to extract message from possibly nested error objects
      const extractErrorMessage = (obj: any): string => {
        if (typeof obj === 'string') return obj;
        if (typeof obj === 'object' && obj !== null) {
          // If it's an object, try to get the first key's value
          const firstKey = Object.keys(obj)[0];
          if (firstKey) {
            const innerValue = obj[firstKey];
            return extractErrorMessage(innerValue); // Recursively extract
          }
        }
        return JSON.stringify(obj);
      };
      
      // Handle our custom API response format (status: 'error', message, errors)
      if (data.status === 'error') {
        // If we have detailed errors in the errors field
        if (data.errors && typeof data.errors === 'object') {
          // Get the first error message from validation errors
          const errorFields = Object.keys(data.errors);
          if (errorFields.length > 0) {
            const firstField = errorFields[0];
            const errorValue = data.errors[firstField];
            const errorMessage = extractErrorMessage(errorValue);
            // Return only the error message without the field prefix
            throw new ApiError(response.status, errorMessage, data);
          }
        }
        
        // Fallback to main error message if no detailed errors
        throw new ApiError(response.status, data.message || 'Unknown error', data);
      }
      
      // Handle Django REST framework errors (can be just a string or an object with field errors)
      if (typeof data === 'object' && Object.keys(data).length > 0) {
        // Check for error details format with nested fields
        if (data.error && data.details) {
          // Find the first detailed error message
          const detailsObj = data.details;
          const firstDetailField = Object.keys(detailsObj)[0];
          if (firstDetailField) {
            const detailMessage = extractErrorMessage(detailsObj[firstDetailField]);
            throw new ApiError(response.status, detailMessage, data);
          }
        }
        
        // Fallback to standard field error handling
        const firstField = Object.keys(data)[0];
        const errorValue = data[firstField];
        const errorMessage = Array.isArray(errorValue) ? errorValue[0] : extractErrorMessage(errorValue);
        throw new ApiError(response.status, errorMessage, data);
      }
    }
    
    return data;
  }
  
  // Handle non-JSON responses
  if (!response.ok) {
    console.error('API Non-JSON Error:', response.status, response.statusText);
    throw new ApiError(response.status, `Request failed: ${response.statusText}`, null);
  }
  
  return await response.text();
};

// HTTP Request methods
export const api = {
  // GET request
  get: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const headers = getAuthHeader();
    
    console.log(`API GET Request: ${url}`);
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      method: 'GET',
      headers,
    });
    
    return parseResponse(response) as Promise<T>;
  },
  
  
   // POST request
  post: async <T>(url: string, data?: any, options: RequestInit = {}): Promise<T> => {
    const headers = getAuthHeader();
    headers.set('Content-Type', 'application/json');
    
    if (DEBUG_API) {
      console.log(`API POST Request to ${API_URL}${url}`);
      console.log('Headers:', Object.fromEntries([...headers.entries()]));
      console.log('Request Data:', data);
    }
    
    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      
      const result = await parseResponse(response);
      
      if (DEBUG_API) {
        console.log('API Response:', result);
      }
      
      return result;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },
  
  // PUT request
  put: async <T>(url: string, data?: any, options: RequestInit = {}): Promise<T> => {
    const headers = getAuthHeader();
    headers.set('Content-Type', 'application/json');
    
    console.log(`API PUT Request: ${url}`, data);
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return parseResponse(response) as Promise<T>;
  },
  
  // PATCH request
  patch: async <T>(url: string, data?: any, options: RequestInit = {}): Promise<T> => {
    const headers = getAuthHeader();
    headers.set('Content-Type', 'application/json');
    
    if (DEBUG_API) {
      console.log(`API PATCH Request to ${API_URL}${url}`);
      console.log('Headers:', Object.fromEntries([...headers.entries()]));
      console.log('Request Data:', data);
    }
    
    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      
      const result = await parseResponse(response);
      
      if (DEBUG_API) {
        console.log('API Response:', result);
      }
      
      return result;
    } catch (error) {
      console.error('API PATCH Error:', error);
      throw error;
    }
  },
  
  // DELETE request
  delete: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const headers = getAuthHeader();
    
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      method: 'DELETE',
      headers,
    });
    
    return parseResponse(response) as Promise<T>;
  }
};

export default api; 