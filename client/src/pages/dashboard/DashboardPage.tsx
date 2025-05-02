import React, { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useHomes } from '@/contexts/HomesContext';
import { RoomsProvider } from '@/contexts/RoomsContext';
import { DevicesProvider } from '@/contexts/DevicesContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Room } from '@/services/rooms.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeQuickCreateForm } from '@/components/3_home/forms/HomeQuickCreateForm';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { EnhancedDevice } from '@/types/device';

const DashboardPage: React.FC = (): ReactNode => {
  const [error, setError] = useState<Error | null>(null);
  const { homes, loading: homesLoading, createHome, updateHome, deleteHome, createInvitation, reloadHomes } = useHomes();
  
  const [selectedHomeId, setSelectedHomeId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("overview");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<EnhancedDevice[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [isDevicesLoading, setIsDevicesLoading] = useState(false);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] = useState(false);
  const [isDeviceDetailDialogOpen, setIsDeviceDetailDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<EnhancedDevice | null>(null);

  const deviceCache = useRef<Map<string, EnhancedDevice[]>>(new Map());
  const roomCache = useRef<Map<string, Room[]>>(new Map());
  const roomDetailCache = useRef<Map<string, Room>>(new Map());
  const networkRequestActive = useRef<{ rooms: boolean, devices: boolean, roomDetail: boolean }>({
    rooms: false,
    devices: false,
    roomDetail: false
  });

  const handleDeviceDeleted = async () => {
    for (const key of Array.from(deviceCache.current.keys())) {
      if (key.startsWith(selectedHomeId)) {
        deviceCache.current.delete(key);
      }
    }
    await loadDevicesWithContext();
  };
  
  const previousRoomId = useRef<string>(selectedRoomId);

  useEffect(() => {
    try {
      if (homes.length > 0 && !selectedHomeId) {
        setSelectedHomeId(homes[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [homes, selectedHomeId]);
  
  const loadRoomsWithContext = useCallback(async () => {
    if (!selectedHomeId || networkRequestActive.current.rooms) return;
    const cacheKey = `${selectedHomeId}`;
    if (roomCache.current.has(cacheKey)) {
      setRooms(roomCache.current.get(cacheKey) || []);
      return;
    }
    networkRequestActive.current.rooms = true;
    setIsRoomsLoading(true);
    try {
      const roomsData = await import('@/services/rooms.service')
        .then(m => m.listRoomsService(selectedHomeId));
      roomCache.current.set(cacheKey, roomsData);
      setRooms(roomsData);
    } catch (err) {
      console.error("Error loading rooms:", err);
      setRooms([]);
    } finally {
      setIsRoomsLoading(false);
      networkRequestActive.current.rooms = false;
    }
  }, [selectedHomeId]);
  
  const loadDevicesWithContext = useCallback(async () => {
    if (!selectedHomeId || networkRequestActive.current.devices) return;
    const cacheKey = `${selectedHomeId}_${selectedRoomId}`;
    if (deviceCache.current.has(cacheKey)) {
      setDevices(deviceCache.current.get(cacheKey) || []);
      return;
    }
    networkRequestActive.current.devices = true;
    setIsDevicesLoading(true);
    try {
      const devicesData = await import('@/services/devices.service')
        .then(m => m.listDevices(selectedHomeId, selectedRoomId === 'overview' ? undefined : selectedRoomId));
      const enhancedDevices = devicesData.map(device => ({
        ...device,
        home: selectedHomeId,
        room: device.room || '',
        type: device.type || 'unknown'
      }));
      deviceCache.current.set(cacheKey, enhancedDevices);
      setDevices(enhancedDevices);
    } catch (err) {
      console.error("Error loading devices:", err);
      setDevices([]);
    } finally {
      setIsDevicesLoading(false);
      networkRequestActive.current.devices = false;
    }
  }, [selectedHomeId, selectedRoomId]);
  
  useEffect(() => {
    if (selectedHomeId) {
      loadRoomsWithContext();
    }
  }, [selectedHomeId, loadRoomsWithContext]);
  
  useEffect(() => {
    if (selectedHomeId && previousRoomId.current !== selectedRoomId) {
      previousRoomId.current = selectedRoomId;
      loadDevicesWithContext();
    }
  }, [selectedHomeId, selectedRoomId, loadDevicesWithContext]);

  // Correction : charge les devices dès l'arrivée sur la page overview
  useEffect(() => {
    if (selectedHomeId && selectedRoomId === "overview") {
      loadDevicesWithContext();
    }
  }, [selectedHomeId, selectedRoomId, loadDevicesWithContext]);
  
  const fetchRoomDetail = useCallback(async () => {
    if (!selectedHomeId || selectedRoomId === 'overview' || networkRequestActive.current.roomDetail) return;
    const cacheKey = `${selectedHomeId}_${selectedRoomId}`;
    if (roomDetailCache.current.has(cacheKey)) {
      const cachedRoom = roomDetailCache.current.get(cacheKey);
      if (cachedRoom) {
        setRooms((prev: Room[]) => prev.map(r => r.id === selectedRoomId ? cachedRoom : r));
      }
      return;
    }
    networkRequestActive.current.roomDetail = true;
    try {
      const roomDetail = await import('@/services/rooms.service')
        .then(m => m.getRoomService(selectedHomeId, selectedRoomId));
      roomDetailCache.current.set(cacheKey, roomDetail);
      setRooms((prev: Room[]) => prev.map(r => r.id === selectedRoomId ? roomDetail : r));
    } catch (error) {
      console.error('[DashboardPage] Error fetching room detail:', error);
    } finally {
      networkRequestActive.current.roomDetail = false;
    }
  }, [selectedHomeId, selectedRoomId]);
  
  useEffect(() => {
    if (selectedRoomId !== 'overview' && selectedHomeId) {
      fetchRoomDetail();
    }
  }, [selectedRoomId, fetchRoomDetail]);
  
  const handleHomeChange = (homeId: string) => {
    if (homeId === selectedHomeId) return;
    setSelectedHomeId(homeId);
    setSelectedRoomId('overview');
    previousRoomId.current = 'overview';
  };
  
  const handleCreateHome = async (data: { name: string }): Promise<void> => {
    try {
      const newHome = await createHome(data);
      setSelectedHomeId(newHome.id);
    } catch (error) {
      toast.error('Failed to create home');
    }
  };
  
  const handleAddRoom = async (name: string) => {
    if (!selectedHomeId) return;
    try {
      await import('@/services/rooms.service')
        .then(m => m.createRoomService(selectedHomeId, { name }));
      roomCache.current.delete(selectedHomeId);
      loadRoomsWithContext();
    } catch (error) {
      toast.error('Failed to create room');
    }
  };
  
  const handleAddDevice = async (payload: any, roomId: string, homeId: string) => {
    if (!homeId || !roomId) return;
    try {
      await import('@/services/devices.service')
        .then(m => m.createDevice(homeId, roomId, payload));
      for (const key of Array.from(deviceCache.current.keys())) {
        if (key.startsWith(homeId)) {
          deviceCache.current.delete(key);
        }
      }
      loadDevicesWithContext();
      toast.success('Device added successfully');
    } catch (error) {
      toast.error('Failed to add device');
      throw error;
    }
  };
  
  const handleOpenDeviceDetail = (device: EnhancedDevice) => {
    setSelectedDevice(device);
    setIsDeviceDetailDialogOpen(true);
  };
  
  const handleRenameDevice = async (deviceId: string, name: string) => {
    if (!selectedHomeId || !selectedDevice?.room) return;
    try {
      await import('@/services/devices.service')
        .then(m => m.updateDevice(selectedHomeId, selectedDevice.room, deviceId, { name }));
      const updatedDevices = devices.map((device: EnhancedDevice) => 
        device.id === deviceId ? { ...device, name } : device
      );
      setDevices(updatedDevices);
      const cacheKey = `${selectedHomeId}_${selectedRoomId}`;
      deviceCache.current.set(cacheKey, updatedDevices);
      setSelectedDevice((prev: EnhancedDevice | null) => prev?.id === deviceId ? { ...prev, name } : prev);
    } catch (error) {
      toast.error("Failed to rename device");
    }
  };
  
  const handleDeleteDevice = async (deviceId: string) => {
    if (!selectedHomeId || !selectedDevice?.room) return;
    try {
      await import('@/services/devices.service')
        .then(m => m.deleteDevice(selectedHomeId, selectedDevice.room, deviceId));
      for (const key of Array.from(deviceCache.current.keys())) {
        if (key.startsWith(selectedHomeId)) {
          deviceCache.current.delete(key);
        }
      }
      setDevices(devices.filter((device: EnhancedDevice) => device.id !== deviceId));
      setIsDeviceDetailDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete device");
    }
  };
  
  const filteredDevices = selectedRoomId === 'overview' 
    ? devices 
    : devices.filter((device: EnhancedDevice) => device.room === selectedRoomId);
  
  if (error) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950">
        <h2 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">An error occurred</h2>
        <p className="text-red-500 dark:text-red-400 mb-6">{error?.message || 'Unknown error'}</p>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">Try refreshing the page or contact support if the problem persists.</p>
        <Button onClick={() => window.location.reload()}>
          Refresh the page
        </Button>
      </div>
    );
  }
  
  if (homesLoading) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-4 w-60 mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (homes.length === 0) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-2">Welcome to Hello Home</h2>
          <p className="text-muted-foreground mb-8">Create your first home to get started with smart home management</p>
          <Card>
            <CardHeader>
              <CardTitle>Create Your First Home</CardTitle>
              <CardDescription>
                Set up your first smart home to start connecting devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomeQuickCreateForm 
                onSubmit={handleCreateHome}
                horizontal={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const RoomsWithSelectedHome = ({ children }: { children: ReactNode }) => {
    if (!selectedHomeId) return null;
    return (
      <RoomsProvider homeId={selectedHomeId}>
        {children}
      </RoomsProvider>
    );
  };
  
  const DevicesWithSelectedHome = ({ children }: { children: ReactNode }) => {
    if (!selectedHomeId) return null;
    return (
      <DevicesProvider homeId={selectedHomeId} roomId={selectedRoomId !== 'overview' ? selectedRoomId : ''}>
        {children}
      </DevicesProvider>
    );
  };
  
  const handleRoomChange = (roomId: string) => {
    if (roomId === selectedRoomId) return;
    setSelectedRoomId(roomId);
  };
  
  return (
    <div className="min-h-screen">
      <RoomsWithSelectedHome>
        <DevicesWithSelectedHome>
          <DashboardContent 
            selectedHomeId={selectedHomeId}
            selectedRoomId={selectedRoomId}
            homes={homes}
            rooms={rooms}
            filteredDevices={filteredDevices}
            isRoomsLoading={isRoomsLoading}
            isDevicesLoading={isDevicesLoading}
            isAddRoomDialogOpen={isAddRoomDialogOpen}
            isAddDeviceDialogOpen={isAddDeviceDialogOpen}
            isDeviceDetailDialogOpen={isDeviceDetailDialogOpen}
            selectedDevice={selectedDevice}
            onHomeChange={handleHomeChange}
            onCreateHome={handleCreateHome}
            onUpdateHome={updateHome}
            onDeleteHome={deleteHome}
            onCreateInvitation={createInvitation}
            onReloadHomes={reloadHomes}
            onRoomChange={handleRoomChange}
            onAddRoom={handleAddRoom}
            onAddRoomDialogChange={setIsAddRoomDialogOpen}
            onAddDevice={handleAddDevice}
            onAddDeviceDialogChange={setIsAddDeviceDialogOpen}
            onOpenDeviceDetail={handleOpenDeviceDetail}
            onDeviceDetailDialogChange={setIsDeviceDetailDialogOpen}
            onRenameDevice={handleRenameDevice}
            onDeleteDevice={handleDeleteDevice}
            onDeviceDeleted={handleDeviceDeleted}
          />
        </DevicesWithSelectedHome>
      </RoomsWithSelectedHome>
    </div>
  );
};

export default DashboardPage;
