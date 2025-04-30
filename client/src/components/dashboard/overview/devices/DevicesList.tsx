import React from 'react';
import { motion } from 'motion/react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import DeviceCard from './DeviceCard';
import { EnhancedDevice } from '@/types/device';
import { Room } from '@/services/rooms.service';

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

interface DevicesListProps {
  devices: EnhancedDevice[];
  isLoading: boolean;
  selectedRoomId: string;
  rooms: Room[];
  onAddDevice: () => void;
  onAddRoom: () => void;
  onOpenDeviceDetail: (device: EnhancedDevice) => void;
}

const DevicesList: React.FC<DevicesListProps> = ({
  devices,
  isLoading,
  selectedRoomId,
  rooms,
  onAddDevice,
  onAddRoom,
  onOpenDeviceDetail
}) => {
  
  const handleAddDeviceClick = () => {
    if (rooms.length === 0) {
      onAddRoom();
    } else {
      onAddDevice();
    }
  };
  
  return (
    <motion.div 
      className="mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">My Devices</h2>
        <Button 
          onClick={handleAddDeviceClick}
          className="gap-1"
          size="sm"
        >
          <PlusCircle className="h-4 w-4" />
          Add Device
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-[185px] rounded-lg" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-primary/10 rounded-full p-3 mb-4">
              <PlusCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">No devices found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {selectedRoomId === 'overview' 
                ? rooms.length === 0 
                  ? "You need to add a room before adding devices. Add your first room to get started."
                  : "You haven't added any devices yet. Add your first device to start monitoring your home."
                : `This room doesn't have any devices yet. Add a device to this room to start monitoring.`
              }
            </p>
            <Button 
              onClick={handleAddDeviceClick}
              className="gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              {rooms.length === 0 ? "Add Your First Room" : "Add Your First Device"}
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
          {devices.map((device: EnhancedDevice) => (
            <motion.div 
              key={device.id}
              className="cursor-pointer"
              variants={itemVariants}
            >
              <DeviceCard 
                device={device}
                onOpenDetail={onOpenDeviceDetail}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DevicesList; 