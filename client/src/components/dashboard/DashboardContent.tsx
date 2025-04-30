import React from 'react';
import { motion } from 'motion/react';
import { PlusCircle } from 'lucide-react';
import { Home } from '@/services/homes.service';
import { Room } from '@/services/rooms.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import HomeTabs from '@/components/dashboard/overview/homes/HomeTabs';
import RoomTabs from '@/components/dashboard/overview/rooms/RoomTabs';
import DevicesList from '@/components/dashboard/overview/devices/DevicesList';
import EnergyConsumptionChart from '@/components/dashboard/overview/EnergyConsumptionChart';
import AddRoomDialog from '@/components/dashboard/overview/dialogs/AddRoomDialog';
import AddDeviceDialog from '@/components/dashboard/overview/dialogs/AddDeviceDialog';
import DeviceDetailDialog from '@/components/dashboard/overview/dialogs/DeviceDetailDialog';
import { EnhancedDevice } from '@/types/device';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardContentProps {
  selectedHomeId: string;
  selectedRoomId: string;
  homes: Home[];
  rooms: Room[];
  filteredDevices: EnhancedDevice[];
  isRoomsLoading: boolean;
  isDevicesLoading: boolean;
  isAddRoomDialogOpen: boolean;
  isAddDeviceDialogOpen: boolean;
  isDeviceDetailDialogOpen: boolean;
  selectedDevice: EnhancedDevice | null;
  onHomeChange: (homeId: string) => void;
  onCreateHome: (data: { name: string }) => Promise<void>;
  onUpdateHome: (id: string, payload: Partial<Home>) => Promise<Home>;
  onDeleteHome: (id: string) => Promise<void>;
  onCreateInvitation: (homeId: string, email: string) => Promise<any>;
  onReloadHomes: () => Promise<void>;
  onRoomChange: (roomId: string) => void;
  onAddRoom: (name: string) => Promise<void>;
  onAddRoomDialogChange: (open: boolean) => void;
  onAddDevice: (payload: any, roomId: string, homeId: string) => Promise<void>;
  onAddDeviceDialogChange: (open: boolean) => void;
  onOpenDeviceDetail: (device: EnhancedDevice) => void;
  onDeviceDetailDialogChange: (open: boolean) => void;
  onRenameDevice: (deviceId: string, name: string) => Promise<void>;
  onDeleteDevice: (deviceId: string) => Promise<void>;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  selectedHomeId,
  selectedRoomId,
  homes,
  rooms,
  filteredDevices,
  isRoomsLoading,
  isDevicesLoading,
  isAddRoomDialogOpen,
  isAddDeviceDialogOpen,
  isDeviceDetailDialogOpen,
  selectedDevice,
  onHomeChange,
  onCreateHome,
  onUpdateHome,
  onDeleteHome,
  onCreateInvitation,
  onReloadHomes,
  onRoomChange,
  onAddRoom,
  onAddRoomDialogChange,
  onAddDevice,
  onAddDeviceDialogChange,
  onOpenDeviceDetail,
  onDeviceDetailDialogChange,
  onRenameDevice,
  onDeleteDevice
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-6 bg-background text-foreground max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="fixed inset-0 -z-10 bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 opacity-50" />
        </div>
        
        <HomeTabs 
          homes={homes}
          activeHome={selectedHomeId}
          onHomeChange={onHomeChange}
          onCreateHome={onCreateHome}
          onRename={async (name: string) => {
            if (!selectedHomeId) return;
            await onUpdateHome(selectedHomeId, { name });
            await onReloadHomes();
          }}
          onColorChange={async (color: string) => {
            if (!selectedHomeId) return;
            await onUpdateHome(selectedHomeId, { color });
            await onReloadHomes();
          }}
          onDelete={async () => {
            if (!selectedHomeId) return;
            await onDeleteHome(selectedHomeId);
            const newHomes = homes.filter((h: Home) => h.id !== selectedHomeId);
            onHomeChange(newHomes[0]?.id || "");
            await onReloadHomes();
          }}
          onInvite={async (email: string) => {
            if (!selectedHomeId) return;
            await onCreateInvitation(selectedHomeId, email);
          }}

          //je recupere les devices de la home actuelle depuis filteredDevices depuis le fichier DashboardPage.tsx
          devices={filteredDevices} //ne contient les objets que de la maison/pièce active (overview pour toute la maison)
          onOpenDeviceDetail={onOpenDeviceDetail}
        />
        
        <RoomTabs 
          rooms={rooms}
          activeRoom={selectedRoomId}
          onRoomChange={onRoomChange}
          onAddRoom={() => onAddRoomDialogChange(true)}
        />
        
        {selectedRoomId === 'overview' && filteredDevices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {user && user.points !== undefined && user.points >= 40 ? (
              <EnergyConsumptionChart homeId={selectedHomeId} />
            ) : (
              <div className="text-center text-destructive font-semibold py-8">
                Tu n'as pas assez de points pour voir les statistiques de consommation d'énergie (min. 40)
              </div>
            )}
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
        )}
        
        <DevicesList 
          devices={filteredDevices}
          isLoading={isDevicesLoading}
          selectedRoomId={selectedRoomId}
          rooms={rooms}
          onAddDevice={() => onAddDeviceDialogChange(true)}
          onAddRoom={() => onAddRoomDialogChange(true)}
          onOpenDeviceDetail={onOpenDeviceDetail}
        />
      </div>
      
      <AddRoomDialog 
        open={isAddRoomDialogOpen}
        onOpenChange={onAddRoomDialogChange}
        onAddRoom={onAddRoom}
      />
      
      <AddDeviceDialog 
        open={isAddDeviceDialogOpen}
        onOpenChange={onAddDeviceDialogChange}
        onAddDevice={onAddDevice}
        rooms={rooms}
        onAddRoom={onAddRoom}
        selectedHomeId={selectedHomeId}
      />
      
      <DeviceDetailDialog 
        open={isDeviceDetailDialogOpen}
        onOpenChange={onDeviceDetailDialogChange}
        device={selectedDevice}
        onRename={onRenameDevice}
        onDelete={onDeleteDevice}
      />
    </div>
  );
};

export default DashboardContent; 