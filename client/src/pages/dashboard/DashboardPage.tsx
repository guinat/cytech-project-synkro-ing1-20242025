import React, { useState, useEffect, ReactNode } from 'react';
import { useHomes } from '@/contexts/HomesContext';
import { RoomsProvider } from '@/contexts/RoomsContext';
import { DevicesProvider } from '@/contexts/DevicesContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Room } from '@/services/rooms.service';
import type { Home } from '@/services/homes.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeQuickCreateForm } from '@/components/3_home/forms/HomeQuickCreateForm';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { EnhancedDevice } from '@/types/device';

const DashboardPage: React.FC = (): ReactNode => {
  const [error, setError] = useState<Error | null>(null);  
  const { homes, loading: homesLoading, createHome, getHomeDetail, updateHome, deleteHome, createInvitation, reloadHomes } = useHomes();
  
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
  
  useEffect(() => {
    try {
      if (homes.length > 0 && !selectedHomeId) {
        setSelectedHomeId(homes[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [homes, selectedHomeId]);
  
  const loadRoomsWithContext = async () => {
    if (!selectedHomeId) return;
    
    setIsRoomsLoading(true);
    try {
      const roomsData = await import('@/services/rooms.service')
        .then(m => m.listRoomsService(selectedHomeId));
      setRooms(roomsData);
    } catch (err) {
      console.error("Error loading rooms:", err);
      setRooms([]);
    } finally {
      setIsRoomsLoading(false);
    }
  };
  
  const loadDevicesWithContext = async () => {
    if (!selectedHomeId) return;
    
    setIsDevicesLoading(true);
    try {
      const devicesData = await import('@/services/devices.service')
        .then(m => m.listDevices(selectedHomeId, selectedRoomId === 'overview' ? undefined : selectedRoomId));
      
      setDevices(devicesData.map(device => ({
        ...device,
        home: selectedHomeId,
        room: device.room || '',
        type: device.type || 'unknown'
      })));
    } catch (err) {
      console.error("Error loading devices:", err);
      setDevices([]);
    } finally {
      setIsDevicesLoading(false);
    }
  };
  
  useEffect(() => {
    loadRoomsWithContext();
  }, [selectedHomeId]);
  
  useEffect(() => {
    loadDevicesWithContext();
  }, [selectedHomeId, selectedRoomId]);
  
  useEffect(() => {
    if (!selectedHomeId || selectedRoomId === 'overview') return;
    
    const fetchRoomDetail = async () => {
      try {
        const roomDetail = await import('@/services/rooms.service')
          .then(m => m.getRoomService(selectedHomeId, selectedRoomId));
        setRooms((prev: Room[]) => prev.map(r => r.id === selectedRoomId ? roomDetail : r));
      } catch (error) {
        console.error('[DashboardPage] Error fetching room detail:', error);
        toast.error('Impossible de charger les infos de la pièce');
      }
    };
    
    fetchRoomDetail();
  }, [selectedHomeId, selectedRoomId]);
  
  const handleHomeChange = (homeId: string) => {
    setSelectedHomeId(homeId);
    setSelectedRoomId('overview');
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
      loadRoomsWithContext();
    } catch (error) {
      toast.error('Erreur lors de la création de la pièce');
    }
  };
  
  const handleAddDevice = async (payload: any, roomId: string, homeId: string) => {
    if (!homeId || !roomId) return;
    
    try {
      await import('@/services/devices.service')
        .then(m => m.createDevice(homeId, roomId, payload));
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
      setDevices(
        devices.map((device: EnhancedDevice) => 
          device.id === deviceId ? { ...device, name } : device
        )
      );
      setSelectedDevice((prev: EnhancedDevice | null) => prev?.id === deviceId ? { ...prev, name } : prev);
    } catch (error) {
      toast.error("Impossible de renommer l'appareil");
    }
  };
  
  const handleDeleteDevice = async (deviceId: string) => {
    if (!selectedHomeId || !selectedDevice?.room) return;
    
    try {
      await import('@/services/devices.service')
        .then(m => m.deleteDevice(selectedHomeId, selectedDevice.room, deviceId));
      setDevices(devices.filter((device: EnhancedDevice) => device.id !== deviceId));
      setIsDeviceDetailDialogOpen(false);
    } catch (error) {
      toast.error("Impossible de supprimer l'appareil");
    }
  };
  
  const filteredDevices = selectedRoomId === 'overview' 
    ? devices 
    : devices.filter((device: EnhancedDevice) => device.room === selectedRoomId);
  
  if (error) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950">
        <h2 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">Une erreur est survenue</h2>
        <p className="text-red-500 dark:text-red-400 mb-6">{error?.message || 'Erreur inconnue'}</p>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">Essayez de rafraîchir la page ou contactez le support si le problème persiste.</p>
        <Button onClick={() => window.location.reload()}>
          Rafraîchir la page
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
  
  return (
    <RoomsWithSelectedHome>
      <DevicesProvider homeId={selectedHomeId} roomId={selectedRoomId === 'overview' ? '' : selectedRoomId}>
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
          onRoomChange={setSelectedRoomId}
          onAddRoom={handleAddRoom}
          onAddRoomDialogChange={setIsAddRoomDialogOpen}
          onAddDevice={handleAddDevice}
          onAddDeviceDialogChange={setIsAddDeviceDialogOpen}
          onOpenDeviceDetail={handleOpenDeviceDetail}
          onDeviceDetailDialogChange={setIsDeviceDetailDialogOpen}
          onRenameDevice={handleRenameDevice}
          onDeleteDevice={handleDeleteDevice}
        />
      </DevicesProvider>
    </RoomsWithSelectedHome>
  );
};

export default DashboardPage; 