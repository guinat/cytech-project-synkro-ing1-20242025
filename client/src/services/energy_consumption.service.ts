import { apiFetch } from "./api";

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

export async function fetchEnergyConsumption(params: EnergyConsumptionParams): Promise<EnergyConsumptionResponse> {
  const searchParams = new URLSearchParams();
  
  // Assurer que le paramètre 'cumulative' est toujours inclus
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
  return response;
}
