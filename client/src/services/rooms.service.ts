import { apiFetch, extractErrorMessage, extractSuccessMessage } from '@/services/api';
import { toast } from 'sonner';

export type Room = {
  id: string;
  name: string;
  home: string;
  created_at?: string;
  updated_at?: string;
  // Optionnel : liste des devices dans la room
  devices?: any[];
};

// --- ROOMS CRUD ---
export async function listRoomsService(homeId: string): Promise<Room[]> {
  try {
    const data = await apiFetch<any>(`/homes/${homeId}/rooms/`, { method: 'GET' });
    // Supporte tous les formats : {data: [...]}, {results: [...]}, ou tableau brut
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    // fallback : aucun format reconnu
    return [];
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function getRoomService(homeId: string, roomId: string): Promise<Room> {
  try {
    const data = await apiFetch<{ data: Room }>(`/homes/${homeId}/rooms/${roomId}/`, { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function createRoomService(homeId: string, payload: Partial<Room>): Promise<Room> {
  try {
    const data = await apiFetch<{ data: Room }>(`/homes/${homeId}/rooms/`, {
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

export async function updateRoomService(homeId: string, roomId: string, payload: Partial<Room>): Promise<Room> {
  try {
    const data = await apiFetch<{ data: Room }>(`/homes/${homeId}/rooms/${roomId}/`, {
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

export async function deleteRoomService(homeId: string, roomId: string): Promise<void> {
  try {
    await apiFetch(`/homes/${homeId}/rooms/${roomId}/`, { method: 'DELETE' });
    toast.success('Pièce supprimée');
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}
