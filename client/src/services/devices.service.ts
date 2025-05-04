import { apiFetch, extractErrorMessage, extractSuccessMessage } from '@/services/api';import { toast } from 'sonner';

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
  brand?: string;
  type?: string; // Ajout du champ type pour filtrer dans DiscoverPage
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

export type DeviceCommand = {
  id: string;
  capability: string;
  parameters: string;
  created_at?: string;
  updated_at?: string;
  executed_at?: string; // Date d'exécution réelle de la commande
}


export interface DeviceConsumptionHistoryPayload {
  device: string;
  timestamp: string; // ISO string
  consumption: number; // Wh/h
}

/**
 * Calcule la consommation totale (en kWh) à partir de l'historique de consommation d'un appareil.
 * @param history Tableau d'historique de consommation (trié par timestamp croissant)
 * @returns Consommation totale en kWh
 */
/**
 * Vérifie si un enregistrement d'historique correspond à un état ON
 * @param record Enregistrement d'historique
 */
function isDeviceOn(record: any): boolean {
  // Si l'enregistrement a un champ is_on ou power, l'utiliser
  if (record.is_on !== undefined) return !!record.is_on;
  if (record.power !== undefined) return record.power === 'on';
  
  // Par défaut, si l'appareil a une consommation > 0, on considère qu'il est allumé
  return record.consumption > 0;
}

/**
 * Calcule la consommation totale en tenant compte de l'état ON/OFF
 */
export function calculateTotalDeviceConsumption(history: DeviceConsumptionHistoryPayload[]): number {
  if (!history || history.length === 0) return 0;
  
  // Trier l'historique par ordre chronologique croissant
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  let totalWh = 0;
  for (let i = 0; i < sortedHistory.length; i++) {
    const current = sortedHistory[i];
    
    // Si l'appareil est éteint, on ne compte pas de consommation
    if (!isDeviceOn(current)) continue;
    
    const currentDate = new Date(current.timestamp);
    let nextDate: Date;
    
    if (i < sortedHistory.length - 1) {
      nextDate = new Date(sortedHistory[i + 1].timestamp);
    } else {
      nextDate = new Date(); // jusqu'à maintenant pour le dernier point
    }
    
    // durée en minutes entre deux timestamps
    const durationMinutes = Math.max(0, (nextDate.getTime() - currentDate.getTime()) / 60000);
    
    // consommation par minute
    const whPerMinute = current.consumption / 60;
    totalWh += whPerMinute * durationMinutes;
  }
  
  // On garde la valeur en Wh
  return totalWh * 1000;
}

/**
 * Récupère l'historique de consommation d'un appareil et calcule sa consommation totale en kWh.
 * @param homeId ID de la maison
 * @param roomId ID de la pièce
 * @param deviceId ID de l'appareil
 * @returns Consommation totale en kWh
 */
export async function getDeviceTotalConsumption(deviceId: string): Promise<number> {
  try {
    // Récupération de l'historique de consommation via l'API
    const history = await apiFetch<DeviceConsumptionHistoryPayload[]>(
      `/devices/consumption/history/?device_id=${deviceId}`
    );
    
    console.log(`Historique de consommation récupéré pour le device ${deviceId}:`, history);
    
    // Calcul de la consommation totale
    const totalConsumption = calculateTotalDeviceConsumption(history);
    console.log(`Consommation totale calculée: ${totalConsumption} kWh`);
    
    return totalConsumption;
  } catch (error) {
    console.error("Erreur lors du calcul de la consommation totale:", error);
    return 0; // Valeur par défaut en cas d'erreur
  }
}

export async function postDeviceConsumption(payload: DeviceConsumptionHistoryPayload) {
  try {
    const data = await apiFetch('/devices/consumption/history/', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    return data;
  } catch (error: any) {
    throw error;
  }
}

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
    //toast.success(extractSuccessMessage(response));
    return response;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function getPublicDeviceTypes(): Promise<PublicDeviceType[]> {
  try {
    const data = await apiFetch<any>('/devices/device-types/', { method: 'GET' });
    //toast.success(extractSuccessMessage(data));
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
    return data;
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

export async function getDeviceCommand(homeId: string, roomId: string, deviceId: string): Promise<DeviceCommand[]> {
  try {
    const data = await apiFetch<any>(`/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/commands/`, { method: 'GET' });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    return [];
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}