import { Device } from '@/services/devices.service';

export interface EnhancedDevice extends Device {
  home: string;
  room: string;
  type: string;
  brand: string;
  isOn?: boolean;
  energyConsumption?: string;
  activeTime?: string;
} 