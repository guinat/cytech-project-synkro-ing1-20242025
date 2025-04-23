import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  listDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  Device
} from '@/services/devices.service';

interface DevicesContextType {
  devices: Device[];
  loading: boolean;
  reloadDevices: (homeId: string, roomId: string) => Promise<void>;
  createDevice: (homeId: string, roomId: string, payload: Partial<Device>) => Promise<Device>;
  updateDevice: (homeId: string, roomId: string, deviceId: string, payload: Partial<Device>) => Promise<Device>;
  deleteDevice: (homeId: string, roomId: string, deviceId: string) => Promise<void>;
}

const DevicesContext = createContext<DevicesContextType | undefined>(undefined);

export const DevicesProvider: React.FC<{ children: ReactNode; homeId: string; roomId: string }> = ({ children, homeId, roomId }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadDevices = async (hId: string = homeId, rId: string = roomId) => {
    setLoading(true);
    try {
      const data = await listDevices(hId, rId);
      setDevices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (homeId && roomId) reloadDevices(homeId, roomId);
  }, [homeId, roomId]);

  const handleCreateDevice = async (hId: string, rId: string, payload: Partial<Device>) => {
    const device = await createDevice(hId, rId, payload);
    await reloadDevices(hId, rId);
    return device;
  };

  const handleUpdateDevice = async (hId: string, rId: string, deviceId: string, payload: Partial<Device>) => {
    const device = await updateDevice(hId, rId, deviceId, payload);
    await reloadDevices(hId, rId);
    return device;
  };

  const handleDeleteDevice = async (hId: string, rId: string, deviceId: string) => {
    await deleteDevice(hId, rId, deviceId);
    await reloadDevices(hId, rId);
  };

  return (
    <DevicesContext.Provider
      value={{
        devices,
        loading,
        reloadDevices,
        createDevice: handleCreateDevice,
        updateDevice: handleUpdateDevice,
        deleteDevice: handleDeleteDevice,
      }}
    >
      {children}
    </DevicesContext.Provider>
  );
};

export function useDevices() {
  const context = useContext(DevicesContext);
  if (!context) {
    throw new Error('useDevices must be used within a DevicesProvider');
  }
  return context;
}
