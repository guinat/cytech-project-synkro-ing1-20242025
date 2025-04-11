import api, { PaginatedResponse, ApiResponse } from './api';

// Interfaces for device types
export interface DeviceType {
  id: number;
  name: string;
  description: string;
}

// Interface for devices
export interface Device {
  id: number;
  name: string;
  device_type: number;
  device_type_name?: string;
  location: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  owner: number;
  owner_username?: string;
  room?: number;
  room_name?: string;
  home?: number;
  home_name?: string;
  registration_date: string;
  last_seen: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  mac_address?: string;
  firmware_version?: string;
  api_key?: string;
}

// Interface for device data
export interface DeviceDataPoint {
  id: number;
  device: number;
  device_name?: string;
  timestamp: string;
  data: any;
}

// Interface for device commands
export interface DeviceCommand {
  id: number;
  device: number;
  device_name?: string;
  command: any;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  created_at: string;
  updated_at: string;
  executed_at?: string;
  result?: any;
  created_by?: number;
  created_by_username?: string;
}

// Service class for devices
class DeviceService {
  // Get all device types
  async getDeviceTypes(): Promise<DeviceType[]> {
    const response = await api.get<ApiResponse<DeviceType[]>>('/devices/device-types/');
    return response.data || [];
  }

  // Get a device type by its ID
  async getDeviceType(id: number): Promise<DeviceType> {
    return api.get<DeviceType>(`/devices/device-types/${id}/`);
  }

  // Get all devices
  async getDevices(filters?: { 
    device_type?: number; 
    location?: string; 
    status?: string; 
    search?: string;
    room?: number;
    home?: number;
  }): Promise<ApiResponse<Device[]>> {
    // Creating request parameters
    const params = new URLSearchParams();
    if (filters) {
      if (filters.device_type) params.append('device_type', filters.device_type.toString());
      if (filters.location) params.append('location', filters.location);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.room) params.append('room', filters.room.toString());
      if (filters.home) params.append('home', filters.home.toString());
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<ApiResponse<Device[]>>(`/devices/devices/${queryString}`);
  }

  // Get a device by its ID
  async getDevice(id: number): Promise<Device> {
    return api.get<Device>(`/devices/devices/${id}/`);
  }

  // Create a new device
  async createDevice(deviceData: Partial<Device>): Promise<Device> {
    return api.post<Device>('/devices/devices/', deviceData);
  }

  // Update a device
  async updateDevice(id: number, deviceData: Partial<Device>): Promise<Device> {
    return api.patch<Device>(`/devices/devices/${id}/`, deviceData);
  }

  // Delete a device
  async deleteDevice(id: number): Promise<void> {
    return api.delete<void>(`/devices/devices/${id}/`);
  }

  // Toggle a device on/off (for lights, plugs, etc.)
  async toggleDevice(id: number, currentState?: boolean): Promise<ApiResponse<{device_id: number, state: boolean}>> {
    const payload = currentState !== undefined ? { current_state: currentState } : {};
    const response = await api.post<ApiResponse<{device_id: number, state: boolean}>>(
      `/devices/devices/${id}/toggle/`,
      payload
    );
    return response;
  }

  // Set temperature for a thermostat
  async setTemperature(id: number, temperature: number): Promise<ApiResponse<{device_id: number, temperature: number}>> {
    const response = await api.post<ApiResponse<{device_id: number, temperature: number}>>(
      `/devices/devices/${id}/set_temperature/`,
      { temperature }
    );
    return response;
  }

  // Send a generic command to a device
  async sendCommand(deviceId: number, commandType: string, params?: Record<string, any>): Promise<ApiResponse<DeviceCommand>> {
    const payload = {
      command_type: commandType,
      params: params || {}
    };
    
    const response = await api.post<ApiResponse<DeviceCommand>>(
      `/devices/devices/${deviceId}/send_command/`,
      payload
    );
    return response;
  }

  // Get device data
  async getDeviceData(deviceId: number, timeRange?: { start?: string; end?: string }): Promise<PaginatedResponse<DeviceDataPoint>> {
    const params = new URLSearchParams();
    params.append('device', deviceId.toString());
    
    if (timeRange) {
      if (timeRange.start) params.append('start_time', timeRange.start);
      if (timeRange.end) params.append('end_time', timeRange.end);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<PaginatedResponse<DeviceDataPoint>>(`/devices/data-points/${queryString}`);
  }

  // Get command history for a device
  async getDeviceCommands(deviceId: number): Promise<PaginatedResponse<DeviceCommand>> {
    const params = new URLSearchParams();
    params.append('device', deviceId.toString());
    
    return api.get<PaginatedResponse<DeviceCommand>>(`/devices/commands/?${params.toString()}`);
  }
}

export default new DeviceService(); 