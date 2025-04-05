import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import homeService, { Home, Room } from '@/services/home.service';
import deviceService, { Device } from '@/services/device.service';

// Define the context interface
interface HomeContextProps {
  homes: Home[];
  currentHome: Home | null;
  isLoading: boolean;
  error: string | null;
  devices: Device[];
  rooms: Room[];
  currentRoom: Room | null;
  setCurrentHome: (home: Home) => void;
  setCurrentRoom: (room: Room) => void;
  refreshHomes: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  refreshRooms: () => Promise<void>;
  addRoom: (name: string) => Promise<Room | null>;
}

// Create the context
const HomeContext = createContext<HomeContextProps | undefined>(undefined);

// Provider component
export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const [homes, setHomes] = useState<Home[]>([]);
  const [currentHome, setCurrentHome] = useState<Home | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load homes on mount
  useEffect(() => {
    refreshHomes();
  }, []);

  // Load rooms when current home changes
  useEffect(() => {
    if (currentHome) {
      refreshRooms();
      refreshDevices();
    }
  }, [currentHome]);

  // Fetch homes from API
  const refreshHomes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const homesData = await homeService.getHomes();
      setHomes(homesData);
      
      // Set the first home as current if none is selected
      if (homesData.length > 0 && !currentHome) {
        setCurrentHome(homesData[0]);
      }
    } catch (err) {
      setError('Failed to load homes');
      console.error('Error loading homes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rooms for the current home
  const refreshRooms = async () => {
    if (!currentHome) return;
    
    try {
      setError(null);
      const roomsData = await homeService.getRooms(currentHome.id);
      setRooms(roomsData);
      
      // Reset current room if it doesn't belong to current home
      if (currentRoom && !roomsData.some(r => r.id === currentRoom.id)) {
        setCurrentRoom(null);
      }
    } catch (err) {
      setError('Failed to load rooms');
      console.error('Error loading rooms:', err);
    }
  };

  // Add a new room to the current home
  const addRoom = async (name: string): Promise<Room | null> => {
    if (!currentHome) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      const room = await homeService.createRoom(currentHome.id, name);
      await refreshRooms();
      return room;
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch devices for the current home
  const refreshDevices = async () => {
    if (!currentHome) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get devices for the current home
      const response = await deviceService.getDevices({ home: currentHome.id });
      setDevices(response.results);
    } catch (err) {
      setError('Failed to load devices');
      console.error('Error loading devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    homes,
    currentHome,
    setCurrentHome,
    isLoading,
    error,
    devices,
    rooms,
    currentRoom,
    setCurrentRoom,
    refreshHomes,
    refreshDevices,
    refreshRooms,
    addRoom
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};

// Hook for using the context
export const useHome = () => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};

export default HomeContext;
