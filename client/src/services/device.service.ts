import api, { PaginatedResponse, ApiResponse, DEBUG_API } from './api';

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
      // Vérifier que les filtres ont des valeurs valides
      if (filters.device_type && !isNaN(Number(filters.device_type))) {
        params.append('device_type', filters.device_type.toString());
      }
      
      if (filters.location && filters.location.trim()) {
        params.append('location', filters.location.trim());
      }
      
      if (filters.status && ['online', 'offline', 'error', 'maintenance'].includes(filters.status)) {
        params.append('status', filters.status);
      }
      
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      
      if (filters.room && !isNaN(Number(filters.room))) {
        params.append('room', filters.room.toString());
      }
      
      if (filters.home && !isNaN(Number(filters.home))) {
        params.append('home', filters.home.toString());
      }
    }
    
    if (DEBUG_API) {
      console.log(`DeviceService.getDevices called with filters:`, filters);
      console.log(`Final query parameters:`, params.toString());
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    try {
      return await api.get<ApiResponse<Device[]>>(`/devices/devices/${queryString}`);
    } catch (error) {
      console.error('Error fetching devices:', error);
      // Si le filtre par pièce cause une erreur, réessayer avec seulement le filtre par maison
      if (filters?.room && filters?.home && error instanceof Error) {
        console.warn('Retrying device fetch with only home filter');
        const homeParams = new URLSearchParams();
        homeParams.append('home', filters.home.toString());
        const homeQueryString = `?${homeParams.toString()}`;
        return api.get<ApiResponse<Device[]>>(`/devices/devices/${homeQueryString}`);
      }
      throw error;
    }
  }

  // Get a device by its ID
  async getDevice(id: number): Promise<Device> {
    return api.get<Device>(`/devices/devices/${id}/`);
  }

  // Create a new device
  async createDevice(deviceData: Partial<Device>): Promise<Device> {
    if (DEBUG_API) {
      console.log("DeviceService.createDevice called with data:", deviceData);
    }
    
    try {
      const response = await api.post<ApiResponse<Device> | Device>('/devices/devices/', deviceData);
      
      if (DEBUG_API) {
        console.log("DeviceService.createDevice received response:", response);
      }
      
      // Handle both response formats (ApiResponse or direct Device object)
      if (response && typeof response === 'object' && 'status' in response && 
          response.status === 'success' && 'data' in response) {
        return response.data as Device;
      }
      return response as Device;
    } catch (error) {
      console.error("DeviceService.createDevice error:", error);
      throw error;
    }
  }

  // Update a device
  async updateDevice(id: number, deviceData: Partial<Device>): Promise<Device> {
    if (DEBUG_API) {
      console.log(`DeviceService.updateDevice(${id}) called with data:`, deviceData);
    }
    
    try {
      const response = await api.patch<ApiResponse<Device> | Device>(`/devices/devices/${id}/`, deviceData);
      
      if (DEBUG_API) {
        console.log(`DeviceService.updateDevice(${id}) received response:`, response);
      }
      
      // Handle both response formats (ApiResponse or direct Device object)
      if (response && typeof response === 'object' && 'status' in response && 
          response.status === 'success' && 'data' in response) {
        return response.data as Device;
      }
      return response as Device;
    } catch (error) {
      console.error(`DeviceService.updateDevice(${id}) error:`, error);
      throw error;
    }
  }

  // Delete a device
  async deleteDevice(id: number): Promise<void> {
    if (DEBUG_API) {
      console.log(`DeviceService.deleteDevice(${id}) called`);
    }
    
    try {
      const response = await api.delete<void>(`/devices/devices/${id}/`);
      
      if (DEBUG_API) {
        console.log(`DeviceService.deleteDevice(${id}) successful`);
      }
      
      return response;
    } catch (error) {
      console.error(`DeviceService.deleteDevice(${id}) error:`, error);
      throw error;
    }
  }

  // Update device status
  async updateDeviceStatus(id: number, status: 'online' | 'offline' | 'error' | 'maintenance'): Promise<ApiResponse<Device> | Device> {
    if (DEBUG_API) {
      console.log(`DeviceService.updateDeviceStatus(${id}) called with status: ${status}`);
    }
    
    try {
      const response = await api.patch<ApiResponse<Device> | Device>(
        `/devices/devices/${id}/update_status/`, 
        { status }
      );
      
      if (DEBUG_API) {
        console.log(`DeviceService.updateDeviceStatus(${id}) received response:`, response);
      }
      
      // Handle both response formats
      if (response && typeof response === 'object' && 'status' in response && 
          response.status === 'success' && 'data' in response) {
        return response;
      }
      return response;
    } catch (error) {
      console.error(`DeviceService.updateDeviceStatus(${id}) error:`, error);
      throw error;
    }
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