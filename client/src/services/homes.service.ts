import { apiFetch, extractErrorMessage, extractSuccessMessage } from '@/services/api';
import { toast } from 'sonner';

export type HomeMember = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string | null;
};

export type Home = {
  id: string;
  name: string;
  address?: string;
  color?: string; // couleur personnalisée pour la card
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  members?: HomeMember[];
  permissions?: {
    can_update?: boolean;
    can_delete?: boolean;
    can_invite?: boolean;
    [key: string]: boolean | undefined;
  };
  // Ajoute d'autres champs selon ton modèle backend
};

export type HomeInvitation = {
  id: string;
  home: string;
  email: string;
  status: string;
  created_at?: string;
  // Ajoute d'autres champs selon ton modèle backend
};

// --- HOMES CRUD ---
export async function listHomes(): Promise<Home[]> {
  try {
    const data = await apiFetch<any>('/homes/', { method: 'GET' });
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

export async function getHome(id: string): Promise<Home> {
  try {
    const data = await apiFetch<{ data: Home }>(`/homes/${id}/`, { method: 'GET' });
    // Supporte les deux formats
    const home = data.data ?? data;
    return {
      ...home,
      owner_id: home.owner_id,
    };
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function createHome(payload: Partial<Home>): Promise<Home> {
  try {
    const data = await apiFetch<{ data: Home }>('/homes/', {
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

export async function updateHome(id: string, payload: Partial<Home>): Promise<Home> {
  try {
    const data = await apiFetch<{ data: Home }>(`/homes/${id}/`, {
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

export async function deleteHome(id: string): Promise<void> {
  try {
    await apiFetch(`/homes/${id}/`, { method: 'DELETE' });
    toast.success('Home supprimée');
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function setPrimaryHome(id: string): Promise<Home> {
  try {
    const data = await apiFetch<{ data: Home }>(`/homes/${id}/set_primary/`, { method: 'POST' });
    toast.success(extractSuccessMessage(data));
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

// --- INVITATIONS ---

export async function acceptInvitationByToken(token: string): Promise<any> {
  try {
    const res = await apiFetch<{ message: string }>('/homes/invitations/accept-by-token/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return res;
  } catch (error: any) {
    throw error?.raw || error;
  }
}

export async function rejectInvitationByToken(token: string): Promise<any> {
  try {
    const res = await apiFetch<{ message: string }>('/homes/invitations/reject-by-token/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return res;
  } catch (error: any) {
    throw error?.raw || error;
  }
}

export async function listInvitations(homeId: string): Promise<HomeInvitation[]> {
  try {
    const data = await apiFetch<any>(`/homes/${homeId}/invitations/`, { method: 'GET' });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    return [];
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function createInvitation(homeId: string, email: string): Promise<HomeInvitation> {
  try {
    console.debug('[createInvitation] homeId:', homeId, 'email:', email);
    const data = await apiFetch<{ data: HomeInvitation }>(`/homes/${homeId}/invitations/`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    console.debug('[createInvitation] API response:', data);
    toast.success(extractSuccessMessage(data));
    return data.data ?? data;
  } catch (error: any) {
    console.error('[createInvitation] API error:', error, error?.raw);
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function getInvitation(homeId: string, invitationId: string): Promise<HomeInvitation> {
  try {
    const data = await apiFetch<{ data: HomeInvitation }>(`/homes/${homeId}/invitations/${invitationId}/`, { method: 'GET' });
    return data.data ?? data;
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function deleteInvitation(homeId: string, invitationId: string): Promise<void> {
  try {
    await apiFetch(`/homes/${homeId}/invitations/${invitationId}/`, { method: 'DELETE' });
    toast.success('Invitation supprimée');
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  try {
    await apiFetch(`/homes/invitations/${invitationId}/accept/`, { method: 'POST' });
    toast.success('Invitation acceptée');
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}

export async function rejectInvitation(invitationId: string): Promise<void> {
  try {
    await apiFetch(`/homes/invitations/${invitationId}/reject/`, { method: 'POST' });
    toast.success('Invitation rejetée');
  } catch (error: any) {
    toast.error(extractErrorMessage(error.raw, false, true));
    throw error;
  }
}
