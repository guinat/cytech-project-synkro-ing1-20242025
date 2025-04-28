import { apiFetch, extractErrorMessage, extractSuccessMessage } from '@/services/api';
import { toast } from 'sonner';

export interface PaginatedResponse<T> {
  status: string;
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface EnergyConsumptionParams {
  home_id?: string;
  room_id?: string;
  device_id?: string;
  date_start?: string;
  date_end?: string;
  granularity?: 'minute' | 'hour' | 'day' | 'month';
  cumulative?: string;
}

export interface EnergyConsumptionResponse {
  devices: Array<{
    device_id: string;
    device_name: string;
    room_id: string;
    room_name: string;
    home_id: string;
    home_name: string;
    consumption: Record<string, number>;
    total: number;
  }>;
  total: number;
  granularity: string;
  cumulative: boolean;
  date_start: string;
  date_end: string;
}

export type PublicDeviceType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
  devices_count: number;
  created_at: string;
  updated_at: string;
};

export type Device = {
  id: string;
  name: string;
  type?: string;
  home: string;
  room: string;
  isOn?: boolean;
  brand: string;
  created_at?: string;
  updated_at?: string;
  capabilities?: string[];
};

export async function getEnergyConsumption(params: EnergyConsumptionParams): Promise<EnergyConsumptionResponse> {
  try {
    const searchParams = new URLSearchParams();
  
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        searchParams.append(k, v.toString());
      }
    });
  
    if (!searchParams.has('cumulative') && params.cumulative !== undefined) {
      searchParams.append('cumulative', params.cumulative.toString());
    }
  
    const url = `/devices/energy/consumption/?${searchParams.toString()}`;
  
    const response = await apiFetch(url) as EnergyConsumptionResponse;
    toast.success(extractSuccessMessage(response));
    return response;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function getPublicDeviceTypes(): Promise<PublicDeviceType[]> {
  try {
    const data = await apiFetch<any>('/devices/device-types/', { method: 'GET' });
    toast.success(extractSuccessMessage(data));
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data && typeof data === 'object') {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    return [];
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function getHomes(): Promise<any[]> {
  try {
    const data = await apiFetch('/homes/', { method: 'GET' });  // Assurez-vous que l'URL est correcte
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error: any) {
    throw new Error('Erreur de récupération des maisons');
  }
}

export async function listDevices(homeId: string, roomId?: string): Promise<Device[]> {
  try {
    let url: string;
    if (roomId) {
      url = `/homes/${homeId}/rooms/${roomId}/devices/`;
    } else {
      url = `/homes/${homeId}/devices/`;
    }
    const data = await apiFetch<any>(url, { method: 'GET' });
    toast.success('Liste des appareils mise à jour');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    return [];
  } catch (error: any) {
    toast.error(extractErrorMessage(error?.raw || error, false, true));
    throw error;
  }
}

export async function getDevice(homeId: string, roomId: string, deviceId: string): Promise<Device> {
  try {
    const data = await apiFetch<Device>(`/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/`, { method: 'GET' });
    toast.success('Détails du device récupérés');
    return data; // <<< PAS data.data
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}


export async function createDevice(homeId: string, roomId: string, payload: Partial<Device>): Promise<Device> {
  try {
    const url = `/homes/${homeId}/rooms/${roomId}/devices/`;
    const data = await apiFetch<{ data: Device }>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    toast.success(extractSuccessMessage(data) || 'Appareil créé avec succès');
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error?.raw || error, false, true));
    throw error;
  }
}

export async function updateDevice(homeId: string, roomId: string, deviceId: string, payload: Partial<Device>): Promise<Device> {
  try {
    const data = await apiFetch<{ data: Device }>(`/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    toast.success(extractSuccessMessage(data));
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function deleteDevice(homeId: string, roomId: string, deviceId: string): Promise<void> {
  try {
    await apiFetch(`/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/`, { method: 'DELETE' });
    toast.success('Appareil supprimé');
  } catch (error: any) {
    toast.error(extractErrorMessage(error?.raw || error, false, true));
    throw error;
  }
}

export async function sendDeviceCommand(
  homeId: string,
  roomId: string,
  deviceId: string,
  capability: string,
  parameters: any = {}
) {
  try {
    const data = await apiFetch(`/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/commands/`, {
      method: 'POST',
      body: JSON.stringify({ capability, parameters }),
    });
    toast.success(extractSuccessMessage(data));
    return data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}
