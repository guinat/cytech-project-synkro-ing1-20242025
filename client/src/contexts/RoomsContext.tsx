import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  listRoomsService,
  getRoomService,
  createRoomService,
  updateRoomService,
  deleteRoomService,
  Room
} from '@/services/rooms.service';

interface RoomsContextType {
  rooms: Room[];
  loading: boolean;
  reloadRoomsContext: (homeId: string) => Promise<void>;
  getRoomContext: (homeId: string, roomId: string) => Promise<Room>;
  listRoomsContext: (homeId: string) => Promise<Room[]>;
  createRoomContext: (homeId: string, payload: Partial<Room>) => Promise<Room>;
  updateRoomContext: (homeId: string, roomId: string, payload: Partial<Room>) => Promise<Room>;
  deleteRoomContext: (homeId: string, roomId: string) => Promise<void>;
}

const RoomsContext = createContext<RoomsContextType | undefined>(undefined);

export const RoomsProvider: React.FC<{ children: ReactNode; homeId: string }> = ({ children, homeId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadRoomsContext = async (hId: string = homeId) => {
    setLoading(true);
    try {
      const data = await listRoomsService(hId);
      setRooms(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (homeId) reloadRoomsContext(homeId);
  }, [homeId]);
  

  const createRoomContext = async (hId: string, payload: Partial<Room>) => {
    const room = await createRoomService(hId, payload);
    await reloadRoomsContext(hId);
    return room;
  };

  const updateRoomContext = async (hId: string, roomId: string, payload: Partial<Room>) => {
    const room = await updateRoomService(hId, roomId, payload);
    await reloadRoomsContext(hId);
    return room;
  };

  const deleteRoomContext = async (hId: string, roomId: string) => {
    await deleteRoomService(hId, roomId);
    await reloadRoomsContext(hId);
  };

  const getRoomContext = async (homeId: string, roomId: string) => {
    setLoading(true);
    try {
      return await getRoomService(homeId, roomId);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const listRoomsContext = async (homeId: string) => {
    setLoading(true);
    try {
      return await listRoomsService(homeId);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        loading,
        reloadRoomsContext,
        getRoomContext,
        listRoomsContext,
        createRoomContext,
        updateRoomContext,
        deleteRoomContext,
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
