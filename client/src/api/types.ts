export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: number;
    created_at?: string;
    last_login?: string;
  }
  
  export interface Role {
    id: number;
    role_name: string;
    permissions: any;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    access: string;
    refresh: string;
  }
  
  export interface RegisterData {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: number;
  }
  
  export interface RegisterResponse {
    user: User;
    message: string;
  }
  
  export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
  }