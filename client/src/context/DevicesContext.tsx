import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import deviceService, { Device, DeviceType } from '../services/device.service';
import homeService, { Home, Room } from '../services/home.service';
import { toast } from 'sonner';
import { DEBUG_API } from '../services/api';

interface DevicesContextType {
  // Data
  homes: Home[];
  rooms: Room[];
  devices: Device[];
  deviceTypes: DeviceType[];
  
  // Loading states
  loadingHomes: boolean;
  loadingRooms: boolean;
  loadingDevices: boolean;
  loadingDeviceTypes: boolean;
  
  // Selected states
  selectedHome: Home | null;
  selectedRoom: Room | null;
  
  // Home functions
  fetchHomes: () => Promise<void>;
  createHome: (homeData: Partial<Home>) => Promise<Home>;
  updateHome: (id: number, homeData: Partial<Home>) => Promise<Home>;
  deleteHome: (id: number) => Promise<void>;
  setSelectedHome: (home: Home | null) => void;
  
  // Room functions
  fetchRooms: (homeId: number) => Promise<void>;
  createRoom: (roomData: Partial<Room>) => Promise<Room>;
  updateRoom: (id: number, roomData: Partial<Room>) => Promise<Room>;
  deleteRoom: (id: number) => Promise<void>;
  setSelectedRoom: (room: Room | null) => void;
  
  // Device functions
  fetchDevices: (filters?: { room?: number; home?: number }) => Promise<void>;
  createDevice: (deviceData: Partial<Device>) => Promise<Device>;
  updateDevice: (id: number, deviceData: Partial<Device>) => Promise<Device>;
  deleteDevice: (id: number) => Promise<void>;
  
  // Device type functions
  fetchDeviceTypes: () => Promise<void>;
  
  // Additional device functions
  fetchSingleDevice: (deviceId: number) => Promise<Device | null>;
  updateDeviceStatus: (id: number, status: 'online' | 'offline' | 'error' | 'maintenance') => Promise<Device>;
}

export const DevicesContext = createContext<DevicesContextType | undefined>(undefined);

export const useDevices = () => {
  const context = useContext(DevicesContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DevicesProvider');
  }
  return context;
};

interface DevicesProviderProps {
  children: ReactNode;
}

export const DevicesProvider: React.FC<DevicesProviderProps> = ({ children }) => {
  // States
  const [homes, setHomes] = useState<Home[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  
  // Loading states
  const [loadingHomes, setLoadingHomes] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingDeviceTypes, setLoadingDeviceTypes] = useState(false);
  
  // Selected states
  const [selectedHome, setSelectedHome] = useState<Home | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Initial loading of device types
  useEffect(() => {
    fetchDeviceTypes();
  }, []);
  
  // Initial loading of homes
  useEffect(() => {
    fetchHomes();
  }, []);
  
  // Load rooms when a home is selected
  useEffect(() => {
    if (selectedHome) {
      fetchRooms(selectedHome.id);
    } else {
      setRooms([]);
    }
  }, [selectedHome]);
  
  // Load devices when a room or home is selected
  useEffect(() => {
    const filters: { room?: number; home?: number } = {};
    
    if (selectedRoom) {
      // Check if the room is part of the selected home
      const isValidRoom = rooms.some(r => r.id === selectedRoom.id && (!selectedHome || r.home === selectedHome.id));
      
      if (isValidRoom) {
        filters.room = selectedRoom.id;
      } else if (selectedHome) {
        // If the room is not valid but a home is selected, filter by home
        filters.home = selectedHome.id;
        // Reset room selection if it's not valid
        setSelectedRoom(null);
      }
    } else if (selectedHome) {
      filters.home = selectedHome.id;
    }
    
    // Only retrieve devices if there are valid filters
    if (Object.keys(filters).length > 0) {
      fetchDevices(filters);
    }
  }, [selectedRoom, selectedHome, rooms]);
  
  // Home functions
  const fetchHomes = async () => {
    setLoadingHomes(true);
    try {
      const response = await homeService.getHomes();
      // Properly handle API response with status: 'success' format
      if (response && response.status === 'success') {
        if (Array.isArray(response.data)) {
          setHomes(response.data);
        } else {
          console.warn('API returned success but data is not an array:', response.data);
          setHomes([]);
        }
      } else if (response && (response as any).results && Array.isArray((response as any).results)) {
        // Handle legacy format with type assertion
        setHomes((response as any).results);
      } else if (Array.isArray(response)) {
        setHomes(response);
      } else {
        console.error('Unexpected response format from getHomes:', response);
        setHomes([]);
      }
    } catch (error) {
      console.error('Error fetching homes:', error);
      toast.error('Unable to retrieve homes. Please try again later.');
      setHomes([]);
    } finally {
      setLoadingHomes(false);
    }
  };
  
  const createHome = async (homeData: Partial<Home>) => {
    try {
      const newHome = await homeService.createHome(homeData);
      // Ensure homes is an array before spreading it
      const currentHomes = Array.isArray(homes) ? homes : [];
      setHomes([...currentHomes, newHome]);
      toast.success(`The home ${newHome.name} has been created successfully!`);
      return newHome;
    } catch (error) {
      console.error('Error creating home:', error);
      toast.error('Unable to create the home. Please try again later.');
      throw error;
    }
  };
  
  const updateHome = async (id: number, homeData: Partial<Home>) => {
    try {
      const updatedHome = await homeService.updateHome(id, homeData);
      // Add safety check for homes array
      if (Array.isArray(homes)) {
        setHomes(homes.map(home => home.id === id ? updatedHome : home));
      }
      if (selectedHome && selectedHome.id === id) {
        setSelectedHome(updatedHome);
      }
      toast.success(`The home ${updatedHome.name} has been updated successfully!`);
      return updatedHome;
    } catch (error) {
      console.error('Error updating home:', error);
      toast.error('Unable to update the home. Please try again later.');
      throw error;
    }
  };
  
  const deleteHome = async (id: number) => {
    try {
      await homeService.deleteHome(id);
      // Add safety check for homes array
      let deletedHome = { name: '' };
      if (Array.isArray(homes)) {
        deletedHome = homes.find(home => home.id === id) || { name: '' };
        setHomes(homes.filter(home => home.id !== id));
      }
      if (selectedHome && selectedHome.id === id) {
        setSelectedHome(null);
      }
      toast.success(`The home ${deletedHome?.name || ''} has been deleted successfully!`);
    } catch (error) {
      console.error('Error deleting home:', error);
      toast.error('Unable to delete the home. Please try again later.');
      throw error;
    }
  };
  
  // Room functions
  const fetchRooms = async (homeId: number) => {
    setLoadingRooms(true);
    try {
      const response = await homeService.getRooms(homeId);
      // Properly handle API response with status: 'success' format
      if (response && response.status === 'success') {
        if (Array.isArray(response.data)) {
          setRooms(response.data);
        } else {
          console.warn('API returned success but data is not an array:', response.data);
          setRooms([]);
        }
      } else if (response && (response as any).results && Array.isArray((response as any).results)) {
        // Handle legacy format with type assertion
        setRooms((response as any).results);
      } else if (Array.isArray(response)) {
        setRooms(response);
      } else {
        console.error('Unexpected response format from getRooms:', response);
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Unable to retrieve rooms. Please try again later.');
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };
  
  const createRoom = async (roomData: Partial<Room>) => {
    try {
      const newRoom = await homeService.createRoom(roomData);
      // Add safety check for rooms array
      const currentRooms = Array.isArray(rooms) ? rooms : [];
      setRooms([...currentRooms, newRoom]);
      toast.success(`The room ${newRoom.name} has been created successfully!`);
      return newRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Unable to create the room. Please try again later.');
      throw error;
    }
  };
  
  const updateRoom = async (id: number, roomData: Partial<Room>) => {
    try {
      const updatedRoom = await homeService.updateRoom(id, roomData);
      // Add safety check for rooms array
      if (Array.isArray(rooms)) {
        setRooms(rooms.map(room => room.id === id ? updatedRoom : room));
      }
      if (selectedRoom && selectedRoom.id === id) {
        setSelectedRoom(updatedRoom);
      }
      toast.success(`The room ${updatedRoom.name} has been updated successfully!`);
      return updatedRoom;
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Unable to update the room. Please try again later.');
      throw error;
    }
  };
  
  const deleteRoom = async (id: number) => {
    try {
      await homeService.deleteRoom(id);
      // Add safety check for rooms array
      let deletedRoom = { name: '' };
      if (Array.isArray(rooms)) {
        deletedRoom = rooms.find(room => room.id === id) || { name: '' };
        setRooms(rooms.filter(room => room.id !== id));
      }
      if (selectedRoom && selectedRoom.id === id) {
        setSelectedRoom(null);
      }
      toast.success(`The room ${deletedRoom?.name || ''} has been deleted successfully!`);
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Unable to delete the room. Please try again later.');
      throw error;
    }
  };
  
  // Device functions
  const fetchDevices = async (filters?: { room?: number; home?: number }) => {
    if (!filters || Object.keys(filters).length === 0) {
      // If no filters, don't load anything
      setDevices([]);
      return;
    }
    
    setLoadingDevices(true);
    try {
      // Check that the room exists before filtering by room
      if (filters.room) {
        const roomExists = Array.isArray(rooms) && rooms.some(r => r.id === filters.room);
        if (!roomExists) {
          console.warn(`Room id ${filters.room} does not exist in the current context, using home filter instead`);
          delete filters.room;
          // If home is available, use this filter instead
          if (!filters.home && selectedHome) {
            filters.home = selectedHome.id;
          }
        }
      }
      
      // Only make the request if valid filters are present
      if (Object.keys(filters).length === 0) {
        setDevices([]);
        return;
      }
      
      console.log("Fetching devices with filters:", filters);
      const response = await deviceService.getDevices(filters);
      // Properly handle API response with status: 'success' format
      if (response && response.status === 'success') {
        if (Array.isArray(response.data)) {
          setDevices(response.data);
        } else {
          console.warn('API returned success but data is not an array:', response.data);
          setDevices([]);
        }
      } else if (response && (response as any).results && Array.isArray((response as any).results)) {
        // Handle legacy format with type assertion
        setDevices((response as any).results);
      } else if (Array.isArray(response)) {
        setDevices(response);
      } else {
        console.error('Unexpected response format from getDevices:', response);
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Unable to retrieve devices. Please try again later.');
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  };
  
  const createDevice = async (deviceData: Partial<Device>) => {
    try {
      const response = await deviceService.createDevice(deviceData);
      
      // Extract the device data from the response correctly
      let newDevice: Device;
      // Check if response is an ApiResponse type with status and data
      if (response && typeof response === 'object' && 'status' in response && 
          (response as any).status === 'success' && 'data' in response) {
        // Handle new API response format
        newDevice = (response as any).data as Device;
      } else if (response && typeof response === 'object' && 'id' in response) {
        // Handle direct object response (legacy format)
        newDevice = response as Device;
      } else {
        console.error('Unexpected response format from createDevice:', response);
        throw new Error('Invalid response format from server');
      }
      
      // Add safety check for devices array
      const currentDevices = Array.isArray(devices) ? devices : [];
      setDevices([...currentDevices, newDevice]);
      toast.success(`The device ${newDevice.name} has been created successfully!`);
      
      // Refresh the device list to get the latest data
      const filters: { room?: number; home?: number } = {};
      if (selectedRoom) {
        filters.room = selectedRoom.id;
      } else if (selectedHome) {
        filters.home = selectedHome.id;
      }
      fetchDevices(filters);
      
      return newDevice;
    } catch (error) {
      console.error('Error creating device:', error);
      toast.error('Unable to create the device. Please try again later.');
      throw error;
    }
  };
  
  const updateDevice = async (id: number, deviceData: Partial<Device>) => {
    try {
      const response = await deviceService.updateDevice(id, deviceData);
      
      // Extract the device data from the response correctly
      let updatedDevice: Device;
      // Check if response is an ApiResponse type with status and data
      if (response && typeof response === 'object' && 'status' in response && 
          (response as any).status === 'success' && 'data' in response) {
        // Handle new API response format
        updatedDevice = (response as any).data as Device;
      } else if (response && typeof response === 'object' && 'id' in response) {
        // Handle direct object response (legacy format)
        updatedDevice = response as Device;
      } else {
        console.error('Unexpected response format from updateDevice:', response);
        throw new Error('Invalid response format from server');
      }
      
      // Add safety check for devices array
      if (Array.isArray(devices)) {
        setDevices(devices.map(device => device.id === id ? updatedDevice : device));
      }
      toast.success(`The device ${updatedDevice.name} has been updated successfully!`);
      
      // Refresh the device list to get the latest data
      const filters: { room?: number; home?: number } = {};
      if (selectedRoom) {
        filters.room = selectedRoom.id;
      } else if (selectedHome) {
        filters.home = selectedHome.id;
      }
      fetchDevices(filters);
      
      return updatedDevice;
    } catch (error) {
      console.error('Error updating device:', error);
      toast.error('Unable to update the device. Please try again later.');
      throw error;
    }
  };
  
  const deleteDevice = async (id: number) => {
    try {
      // Find the device name before deletion for the success message
      let deletedDevice = { name: '' };
      if (Array.isArray(devices)) {
        deletedDevice = devices.find(device => device.id === id) || { name: '' };
      }
      
      // Call the backend to delete the device
      const response = await deviceService.deleteDevice(id);
      
      // Update the local state
      if (Array.isArray(devices)) {
        setDevices(devices.filter(device => device.id !== id));
      }
      
      toast.success(`The device ${deletedDevice?.name || ''} has been deleted successfully!`);
      
      // Refresh the device list to ensure UI is up-to-date
      const filters: { room?: number; home?: number } = {};
      if (selectedRoom) {
        filters.room = selectedRoom.id;
      } else if (selectedHome) {
        filters.home = selectedHome.id;
      }
      fetchDevices(filters);
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Unable to delete the device. Please try again later.');
      throw error;
    }
  };
  
  // Device type functions
  const fetchDeviceTypes = async () => {
    setLoadingDeviceTypes(true);
    try {
      const deviceTypesList = await deviceService.getDeviceTypes();
      // deviceTypesList should already be an array from the service
      if (Array.isArray(deviceTypesList)) {
        setDeviceTypes(deviceTypesList);
      } else if (deviceTypesList && typeof deviceTypesList === 'object' && 'data' in deviceTypesList && Array.isArray((deviceTypesList as any).data)) {
        // Handle API response format with type safety
        setDeviceTypes((deviceTypesList as any).data);
      } else {
        console.error('Unexpected response format from getDeviceTypes:', deviceTypesList);
        setDeviceTypes([]);
      }
    } catch (error) {
      console.error('Error fetching device types:', error);
      setDeviceTypes([]);
    } finally {
      setLoadingDeviceTypes(false);
    }
  };
  
  // Fetch a single device by ID
  const fetchSingleDevice = async (deviceId: number): Promise<Device | null> => {
    try {
      if (DEBUG_API) {
        console.log(`DevicesContext.fetchSingleDevice(${deviceId}) called`);
      }
      
      const response = await deviceService.getDevice(deviceId);
      
      if (DEBUG_API) {
        console.log(`DevicesContext.fetchSingleDevice(${deviceId}) received:`, response);
      }
      
      // If this device is in our current list, update it
      if (Array.isArray(devices)) {
        const updatedDevices = [...devices];
        const index = updatedDevices.findIndex(d => d.id === deviceId);
        
        if (index >= 0) {
          updatedDevices[index] = response;
          setDevices(updatedDevices);
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching single device ${deviceId}:`, error);
      return null;
    }
  };
  
  // Update a device's status
  const updateDeviceStatus = async (id: number, status: 'online' | 'offline' | 'error' | 'maintenance'): Promise<Device> => {
    try {
      if (DEBUG_API) {
        console.log(`DevicesContext.updateDeviceStatus(${id}, ${status}) called`);
      }
      
      const response = await deviceService.updateDeviceStatus(id, status);
      
      // Extract device data from response
      let updatedDevice: Device;
      if (response && typeof response === 'object' && 'status' in response && 
          (response as any).status === 'success' && 'data' in response) {
        updatedDevice = (response as any).data as Device;
      } else {
        updatedDevice = response as Device;
      }
      
      // Update device in list if it exists
      if (Array.isArray(devices)) {
        const updatedDevices = devices.map(device => 
          device.id === id ? updatedDevice : device
        );
        setDevices(updatedDevices);
      }
      
      return updatedDevice;
    } catch (error) {
      console.error(`Error updating device status ${id}:`, error);
      toast.error('Unable to update device status. Please try again later.');
      throw error;
    }
  };
  
  const value = {
    // Data
    homes,
    rooms,
    devices,
    deviceTypes,
    
    // Loading states
    loadingHomes,
    loadingRooms,
    loadingDevices,
    loadingDeviceTypes,
    
    // Selected states
    selectedHome,
    selectedRoom,
    
    // Home functions
    fetchHomes,
    createHome,
    updateHome,
    deleteHome,
    setSelectedHome,
    
    // Room functions
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    setSelectedRoom,
    
    // Device functions
    fetchDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    fetchSingleDevice,
    updateDeviceStatus,
    
    // Device type functions
    fetchDeviceTypes,
  };
  
  return <DevicesContext.Provider value={value}>{children}</DevicesContext.Provider>;
};

export default DevicesProvider;
