import { apiFetch } from '@/services/api';

// Service pour envoyer des commandes aux devices
export async function sendDeviceCommand(
  homeId: string,
  roomId: string,
  deviceId: string,
  capability: string,
  parameters: any = {}
) {
  try {
    return await apiFetch(`/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/commands/`, {
      method: 'POST',
      body: JSON.stringify({ capability, parameters }),
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la commande", error);
    throw new Error("Erreur lors de l'envoi de la commande");
  }
}
