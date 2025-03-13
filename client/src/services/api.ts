// Base API URL 
export const API_URL = 'http://localhost:8000/api';
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

// Parse the response from the API
const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  
  // Handle JSON responses
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error Response:', response.status, data);
      
      // Handle Django REST framework errors (can be just a string or an object with field errors)
      if (typeof data === 'object' && Object.keys(data).length > 0) {
        // Check for error details format with nested fields
        if (data.error && data.details) {
          // Find the first detailed error message
          const detailsObj = data.details;
          const firstDetailField = Object.keys(detailsObj)[0];
          if (firstDetailField) {
            const detailMessage = detailsObj[firstDetailField];
            throw new ApiError(response.status, detailMessage, data);
          }
        }
        
        // Fallback to standard field error handling
        const firstField = Object.keys(data)[0];
        const errorValue = data[firstField];
        const errorMessage = Array.isArray(errorValue) ? errorValue[0] : errorValue;
        throw new ApiError(response.status, `${errorMessage}`, data);
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
    const token = localStorage.getItem('access_token');
    
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
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
    const token = localStorage.getItem('access_token');
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    console.log(`API POST Request: ${url}`, data);
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return parseResponse(response) as Promise<T>;
  },
  
  // PUT request
  put: async <T>(url: string, data?: any, options: RequestInit = {}): Promise<T> => {
    const token = localStorage.getItem('access_token');
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
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
    const token = localStorage.getItem('access_token');
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return parseResponse(response) as Promise<T>;
  },
  
  // DELETE request
  delete: async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = localStorage.getItem('access_token');
    
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      method: 'DELETE',
      headers,
    });
    
    return parseResponse(response) as Promise<T>;
  }
};

export default api; 