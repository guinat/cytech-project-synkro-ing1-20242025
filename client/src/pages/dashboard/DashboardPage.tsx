import React, { useState, useEffect, ReactNode } from 'react';
import { useHomes } from '@/contexts/HomesContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Room } from '@/services/rooms.service';
import type { Home } from '@/services/homes.service';
import type { Device } from '@/services/devices.service';
import { motion } from 'motion/react';

import HomeTabs from '@/components/dashboard/overview/homes/HomeTabs';
import RoomTabs from '@/components/dashboard/overview/rooms/RoomTabs';
import { createRoom, listRooms, getRoom } from '@/services/rooms.service';
import { listDevices } from '@/services/devices.service';
import DeviceCard from '@/components/dashboard/overview/devices/DeviceCard';
import AddRoomDialog from '@/components/dashboard/overview/dialogs/AddRoomDialog';
import AddDeviceDialog from '@/components/dashboard/overview/dialogs/AddDeviceDialog';
import DeviceDetailDialog from '@/components/dashboard/overview/dialogs/DeviceDetailDialog';
import { HomeQuickCreateForm } from '@/components/3_home/forms/HomeQuickCreateForm';
import EnergyConsumptionChart from '@/components/dashboard/overview/EnergyConsumptionChart';
import { PlusCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export interface EnhancedDevice {
  id: string;
  name: string;
  type: string;
  home: string;
  room: string;
  isOn?: boolean;
  energyConsumption?: string;
  activeTime?: string;
} 

// Animation variants pour les cartes de dispositifs
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const DashboardPage: React.FC = (): ReactNode => {
  
  const [error, setError] = useState<Error | null>(null);  
  const { homes, loading: homesLoading, createHome, getHomeDetail, updateHome, deleteHome, createInvitation, reloadHomes } = useHomes();
  const [selectedHomeId, setSelectedHomeId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("overview");
  const [rooms, setRooms] = useState<Room[]>([]);
  
  const [devices, setDevices] = useState<EnhancedDevice[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [isDevicesLoading, setIsDevicesLoading] = useState(false);
  
  // Dialog state
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
  
  useEffect(() => {
    if (!selectedHomeId) return;
    const loadRooms = async () => {
      setIsRoomsLoading(true);
      try {
        const homeRooms = await listRooms(selectedHomeId);
        setRooms(homeRooms);
      } catch (err) {
        setRooms([]);
      }
      setIsRoomsLoading(false);
    };
    loadRooms();
  }, [selectedHomeId]);

  useEffect(() => {
    if (!selectedHomeId) return;
    
    const loadRoomsAndDevices = async () => {
      setIsDevicesLoading(true);
      try {
        if (selectedRoomId === 'overview') {
          // Appelle le nouvel endpoint pour tous les devices de la maison
          try {
            const response = await listDevices(selectedHomeId, undefined);
            // Vérifier que la réponse contient un tableau results
            if (response && response.results && Array.isArray(response.results)) {
              // Ajoute la propriété home et room si besoin
              setDevices(response.results.map((d: Device) => ({
                ...d,
                home: selectedHomeId,
                room: d.room || '',
                type: d.type || 'unknown'
              })));
            } else {
              // Si la structure n'est pas celle attendue, log l'erreur et initialise avec un tableau vide
              console.error('[DashboardPage] Structure de réponse inattendue:', response);
              setDevices([]);
            }
          } catch (e) {
            console.error(`[DashboardPage] Erreur lors du chargement des devices pour la maison :`, e);
            setDevices([]);
          }
        } else {
          // Devices d'une pièce précise
          try {
            const response = await listDevices(selectedHomeId, selectedRoomId);
            // Vérifier que la réponse contient un tableau results
            if (response && response.results && Array.isArray(response.results)) {
              setDevices(response.results.map((d: Device) => ({
                ...d,
                home: selectedHomeId,
                room: selectedRoomId,
                type: d.type || 'unknown'
              })));
            } else {
              console.error('[DashboardPage] Structure de réponse inattendue:', response);
              setDevices([]);
            }
          } catch (e) {
            console.error(`[DashboardPage] Erreur lors du chargement des devices pour la pièce ${selectedRoomId}:`, e);
            setDevices([]);
          }
        }
      } catch (error) {
        console.error('[DashboardPage] Error loading rooms:', error);
        toast.error('Failed to load rooms');
      } finally {
        setIsDevicesLoading(false);
      }
    };
    
    loadRoomsAndDevices();
  }, [selectedHomeId, selectedRoomId, getHomeDetail]);
  
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
  
  useEffect(() => {
    if (!selectedHomeId || selectedRoomId === 'overview') return;
    const fetchRoomDetail = async () => {
      try {
        const roomDetail = await getRoom(selectedHomeId, selectedRoomId);
        setRooms((prev: Room[]) => prev.map(r => r.id === selectedRoomId ? roomDetail : r));
        
      } catch (error) {
        console.error('[DashboardPage] Error fetching room detail:', error);
        toast.error('Impossible de charger les infos de la pièce');
        
      }
    };
    fetchRoomDetail();
  }, [selectedHomeId, selectedRoomId]);

  const handleAddRoom = async (name: string) => {
    if (!selectedHomeId) return;
    try {
      await createRoom(selectedHomeId, { name });
      const homeRooms = await listRooms(selectedHomeId);
      setRooms(homeRooms);
    } catch (error) {
      toast.error('Erreur lors de la création de la pièce');
    }
  };
  
  // IMPORTANT : le backend attend le champ device_type (et non type)
  const handleAddDevice = async (payload: any, roomId: string, homeId: string) => {
    if (!homeId || !roomId) return;
    try {
      // Passe le payload tel quel (déjà conforme depuis AddDeviceDialog)
      await import('@/services/devices.service').then(m => m.createDevice(homeId, roomId, payload));
      // Recharge la liste des devices
      const response = await import('@/services/devices.service').then(m => m.listDevices(homeId, selectedRoomId === 'overview' ? undefined : selectedRoomId));
      if (response && response.results && Array.isArray(response.results)) {
        setDevices(response.results.map((d: Device) => ({
          ...d,
          home: homeId,
          room: d.room || '',
          type: d.type || 'unknown'
        })));
      }
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
    // Mock implementation - in a real app, you'd call an API
    setDevices(
      devices.map((device: EnhancedDevice) => 
        device.id === deviceId ? { ...device, name } : device
      )
    );
    setSelectedDevice((prev: EnhancedDevice | null) => prev?.id === deviceId ? { ...prev, name } : prev);
  };
  
  const handleDeleteDevice = async (deviceId: string) => {
    setDevices(devices.filter((device: EnhancedDevice) => device.id !== deviceId));
  };
  
  // Filter devices based on selected room
  const filteredDevices = selectedRoomId === 'overview' 
    ? devices 
    : devices.filter((device: EnhancedDevice) => device.room === selectedRoomId);
  


  // Affichage des erreurs
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
  
  return (
    <div className="min-h-screen p-6 bg-background text-foreground max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Background gradient effect */}
        <div className="fixed inset-0 -z-10 bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 opacity-50" />
        </div>
        
        {/* Home selection tabs */}
        <HomeTabs 
          homes={homes}
          activeHome={selectedHomeId}
          onHomeChange={handleHomeChange}
          onCreateHome={handleCreateHome}
          onRename={async (name: string) => {
            if (!selectedHomeId) return;
            await updateHome(selectedHomeId, { name });
            await reloadHomes();
          }}
          onColorChange={async (color: string) => {
            if (!selectedHomeId) return;
            await updateHome(selectedHomeId, { color });
            await reloadHomes();
          }}
          onDelete={async () => {
            if (!selectedHomeId) return;
            await deleteHome(selectedHomeId);
            const newHomes = homes.filter((h: Home) => h.id !== selectedHomeId);
            setSelectedHomeId(newHomes[0]?.id || "");
            await reloadHomes();
          }}
          onInvite={async (email: string) => {
            if (!selectedHomeId) return;
            await createInvitation(selectedHomeId, email);
          }}
        />
        
        {/* Room navigation tabs */}
        <RoomTabs 
          rooms={rooms}
          activeRoom={selectedRoomId}
          onRoomChange={setSelectedRoomId}
          onAddRoom={() => setIsAddRoomDialogOpen(true)}
        />
        
        {/* Energy Consumption Chart - only visible in overview */}
        {selectedRoomId === 'overview' && filteredDevices.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <EnergyConsumptionChart homeId={selectedHomeId} />
  </motion.div>
)}
{selectedRoomId === 'overview' && filteredDevices.length === 0 && (
  <Card className="my-6">
    <CardContent>
      <div className="text-center text-muted-foreground py-8">
        No devices found. Add a device to start monitoring your home.
      </div>
    </CardContent>
  </Card>
)
}
        
        {/* My Devices section */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">My Devices</h2>
            <Button 
              onClick={() => setIsAddDeviceDialogOpen(true)}
              className="gap-1"
              size="sm"
            >
              <PlusCircle className="h-4 w-4" />
              Add Device
            </Button>
          </div>
          
          {isDevicesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-[185px] rounded-lg" />
              ))}
            </div>
          ) : filteredDevices.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="bg-primary/10 rounded-full p-3 mb-4">
                  <PlusCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">No devices found</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {selectedRoomId === 'overview' 
                    ? "You haven't added any devices yet. Add your first device to start monitoring your home."
                    : `This room doesn't have any devices yet. Add a device to this room to start monitoring.`
                  }
                </p>
                <Button 
                  onClick={() => setIsAddDeviceDialogOpen(true)}
                  className="gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Device
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredDevices.map((device: EnhancedDevice) => (
                <motion.div 
                  key={device.id}
                  className="cursor-pointer"
                  variants={itemVariants}
                >
                  <DeviceCard 
                    device={device}
                    onOpenDetail={handleOpenDeviceDetail}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Dialogs */}
      <AddRoomDialog 
        open={isAddRoomDialogOpen}
        onOpenChange={setIsAddRoomDialogOpen}
        onAddRoom={handleAddRoom}
      />
      
      <AddDeviceDialog 
        open={isAddDeviceDialogOpen}
        onOpenChange={setIsAddDeviceDialogOpen}
        onAddDevice={handleAddDevice}
        rooms={rooms}
        onAddRoom={handleAddRoom}
        selectedHomeId={selectedHomeId}
      />
      
      <DeviceDetailDialog 
        open={isDeviceDetailDialogOpen}
        onOpenChange={setIsDeviceDetailDialogOpen}
        device={selectedDevice}
        onRename={handleRenameDevice}
        onDelete={handleDeleteDevice}
      />
    </div>
  );
};

export default DashboardPage; 