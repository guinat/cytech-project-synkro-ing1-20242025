import { apiFetch, extractErrorMessage, extractSuccessMessage } from '@/services/api';
import { toast } from 'sonner';

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

export async function fetchPublicDeviceTypes(): Promise<PublicDeviceType[]> {
  try {
    // Assurons-nous d'avoir le bon chemin d'API et de gérer correctement toutes les structures de réponse possibles
    const data = await apiFetch<any>('/devices/device-types/', { method: 'GET' });
    
    // Vérifier si data est un tableau ou un objet contenant un tableau
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data && typeof data === 'object') {
      // En dernier recours, essayons de trouver un tableau quelque part dans l'objet
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    
    // Si aucune donnée n'est trouvée, retourner un tableau vide
    console.error('Aucun device trouvé dans la réponse API:', data);
    return [];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des devices:', error);
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export type Device = {
  id: string;
  name: string;
  type?: string;
  home: string;
  room: string;
  isOn?: boolean; // Ajouté pour la gestion on/off
  // Ajoute d'autres champs selon ton modèle backend
  created_at?: string;
  updated_at?: string;
};

// Ajouter un type pour la réponse paginée
export interface PaginatedResponse<T> {
  status: string;
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- DEVICES CRUD ---
export async function listDevices(homeId: string, roomId?: string): Promise<PaginatedResponse<Device>> {
  try {
    let url: string;
    if (roomId) {
      url = `/homes/${homeId}/rooms/${roomId}/devices/`;
    } else {
      url = `/homes/${homeId}/devices/`;
    }
    const data = await apiFetch<PaginatedResponse<Device>>(url, { method: 'GET' });
    return data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function getDevice(homeId: string, roomId: string, deviceId: string): Promise<Device> {
  try {
    const data = await apiFetch<{ data: Device }>(`/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/`, { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

// NOTE :
// L'endpoint principal utilisé pour créer un device est /homes/<home_pk>/rooms/<room_pk>/devices/ (voir backend homes/urls.py)
// Mais le backend accepte aussi /devices/<home_pk>/rooms/<room_pk>/devices/ (voir backend devices/urls.py)
// On privilégie /homes/... pour la cohérence avec les autres appels frontend.
export async function createDevice(homeId: string, roomId: string, payload: Partial<Device>): Promise<Device> {
  try {
    // Si tu veux utiliser la route alternative, décommente la ligne suivante :
    // const url = `/devices/${homeId}/rooms/${roomId}/devices/`;
    const url = `/homes/${homeId}/rooms/${roomId}/devices/`;
    const data = await apiFetch<{ data: Device }>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    toast.success(extractSuccessMessage(data));
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
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
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}
