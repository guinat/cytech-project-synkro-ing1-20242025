import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  listDevices as listDevicesService,
  createDevice as createDeviceService,
  updateDevice as updateDeviceService,
  deleteDevice as deleteDeviceService,
  getDevice as getDeviceService,
  sendDeviceCommand as sendDeviceCommandService,
  getPublicDeviceTypes as getPublicDeviceTypesService,
  getEnergyConsumption as getEnergyConsumptionService,
  Device,
} from '@/services/devices.service';

interface DevicesContextType {
  devices: Device[];
  loading: boolean;
  reloadDevices: (homeId?: string, roomId?: string) => Promise<void>;
  createDevice: (homeId: string, roomId: string, payload: Partial<Device>) => Promise<Device>;
  updateDevice: (homeId: string, roomId: string, deviceId: string, payload: Partial<Device>) => Promise<Device>;
  deleteDevice: (homeId: string, roomId: string, deviceId: string) => Promise<void>;
  getDeviceContext: (homeId: string, roomId: string, deviceId: string) => Promise<Device>;
  sendDeviceCommandContext: (homeId: string, roomId: string, deviceId: string, capability: string, parameters?: any) => Promise<any>;
  getPublicDeviceTypesContext: () => Promise<any[]>;
  getEnergyConsumptionContext: (params: any) => Promise<any>;
  listDevicesContext: (homeId: string, roomId?: string) => Promise<Device[]>;
  createDeviceContext: (homeId: string, roomId: string, payload: Partial<Device>) => Promise<Device>;
  updateDeviceContext: (homeId: string, roomId: string, deviceId: string, payload: Partial<Device>) => Promise<Device>;
  deleteDeviceContext: (homeId: string, roomId: string, deviceId: string) => Promise<void>;
}

const DevicesContext = createContext<DevicesContextType | undefined>(undefined);

export const DevicesProvider: React.FC<{ children: ReactNode; homeId: string; roomId: string }> = ({ children, homeId, roomId }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadDevices = async (hId?: string, rId?: string) => {
    setLoading(true);
    try {
      const data = await listDevicesService(hId || homeId, rId || roomId);
      setDevices(data);
    } catch (error: any) {
      setDevices([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDeviceContext = async (hId: string, rId: string, deviceId: string) => {
    setLoading(true);
    try {
      return await getDeviceService(hId, rId, deviceId);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendDeviceCommandContext = async (hId: string, rId: string, deviceId: string, capability: string, parameters: any = {}) => {
    setLoading(true);
    try {
      return await sendDeviceCommandService(hId, rId, deviceId, capability, parameters);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPublicDeviceTypesContext = async () => {
    setLoading(true);
    try {
      return await getPublicDeviceTypesService();
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEnergyConsumptionContext = async (params: any) => {
    setLoading(true);
    try {
      return await getEnergyConsumptionService(params);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (homeId && roomId) reloadDevices(homeId, roomId);
  }, [homeId, roomId]);




  // --- Only one definition for each context method ---
  // --- Only one definition for each context method ---
  const createDeviceContext = async (homeId: string, roomId: string, payload: Partial<Device>) => {
    setLoading(true);
    try {
      return await createDeviceService(homeId, roomId, payload);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDeviceContext = async (homeId: string, roomId: string, deviceId: string, payload: Partial<Device>) => {
    setLoading(true);
    try {
      return await updateDeviceService(homeId, roomId, deviceId, payload);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDeviceContext = async (homeId: string, roomId: string, deviceId: string) => {
    setLoading(true);
    try {
      return await deleteDeviceService(homeId, roomId, deviceId);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const listDevicesContext = async (homeId: string, roomId?: string) => {
    setLoading(true);
    try {
      return await listDevicesService(homeId, roomId);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (homeId && roomId) reloadDevices(homeId, roomId);
  }, [homeId, roomId]);

  return (
    <DevicesContext.Provider
      value={{
        devices,
        loading,
        reloadDevices,
        createDevice: createDeviceContext,
        updateDevice: updateDeviceContext,
        deleteDevice: deleteDeviceContext,
        getDeviceContext,
        sendDeviceCommandContext,
        getPublicDeviceTypesContext,
        getEnergyConsumptionContext,
        listDevicesContext,
        createDeviceContext,
        updateDeviceContext,
        deleteDeviceContext,
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
