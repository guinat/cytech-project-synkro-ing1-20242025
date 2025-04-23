import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  listRooms,
  // getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  Room
} from '@/services/rooms.service';

interface RoomsContextType {
  rooms: Room[];
  loading: boolean;
  reloadRooms: (homeId: string) => Promise<void>;
  createRoom: (homeId: string, payload: Partial<Room>) => Promise<Room>;
  updateRoom: (homeId: string, roomId: string, payload: Partial<Room>) => Promise<Room>;
  deleteRoom: (homeId: string, roomId: string) => Promise<void>;
}

const RoomsContext = createContext<RoomsContextType | undefined>(undefined);

export const RoomsProvider: React.FC<{ children: ReactNode; homeId: string }> = ({ children, homeId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadRooms = async (hId: string = homeId) => {
    setLoading(true);
    try {
      const data = await listRooms(hId);
      setRooms(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (homeId) reloadRooms(homeId);
  }, [homeId]);
  

  const handleCreateRoom = async (hId: string, payload: Partial<Room>) => {
    const room = await createRoom(hId, payload);
    await reloadRooms(hId);
    return room;
  };

  const handleUpdateRoom = async (hId: string, roomId: string, payload: Partial<Room>) => {
    const room = await updateRoom(hId, roomId, payload);
    await reloadRooms(hId);
    return room;
  };

  const handleDeleteRoom = async (hId: string, roomId: string) => {
    await deleteRoom(hId, roomId);
    await reloadRooms(hId);
  };

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        loading,
        reloadRooms,
        createRoom: handleCreateRoom,
        updateRoom: handleUpdateRoom,
        deleteRoom: handleDeleteRoom,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
};

export function useRooms() {
  const context = useContext(RoomsContext);
  if (!context) {
    throw new Error('useRooms must be used within a RoomsProvider');
  }
  return context;
}
