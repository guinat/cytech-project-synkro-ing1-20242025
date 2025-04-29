import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Home } from '@/services/homes.service';
import { Room, listRoomsService } from '@/services/rooms.service';
import {
  Device,
  listDevices,
  updateDevice,
  deleteDevice
} from '@/services/devices.service';

interface DevicesSettingsProps {
  home: Home;
  onReload: () => Promise<void>;
}

const DevicesSettings: React.FC<DevicesSettingsProps> = ({ home, onReload }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceRoom, setNewDeviceRoom] = useState<string>('');
  const [confirmDeleteDevice, setConfirmDeleteDevice] = useState<Device | null>(null);

  const loadData = useCallback(async () => {
    if (!home || !home.id) return;
    
    setLoading(true);
    try {
      const [roomsData, devicesData] = await Promise.all([
        listRoomsService(home.id),
        listDevices(home.id)
      ]);
      setRooms(roomsData);
      setDevices(devicesData);
    } catch (error) {
      toast.error('Sorry, something went wrong');
    } finally {
      setLoading(false);
    }
  }, [home]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateDevice = async () => {
    if (!editDevice) return;

    const updates: { name?: string; room?: string } = {};
    if (newDeviceName.trim() && newDeviceName !== editDevice.name) {
      updates.name = newDeviceName;
    }
    if (newDeviceRoom && newDeviceRoom !== editDevice.room) {
      updates.room = newDeviceRoom;
    }

    if (Object.keys(updates).length === 0) {
      setEditDevice(null);
      return;
    }

    try {
      await updateDevice(home.id, editDevice.room, editDevice.id, updates);
      await loadData();
      await onReload();
      toast.success('Device updated successfully');
    } catch (error) {
      toast.error('Failed to update device');
    } finally {
      setEditDevice(null);
      setNewDeviceName('');
      setNewDeviceRoom('');
    }
  };

  const handleDeleteDevice = async () => {
    if (!confirmDeleteDevice) return;

    try {
      await deleteDevice(home.id, confirmDeleteDevice.room, confirmDeleteDevice.id);
      await loadData();
      await onReload();
      toast.success('Device deleted successfully');
    } catch (error) {
      toast.error('Failed to delete device');
    } finally {
      setConfirmDeleteDevice(null);
    }
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown room';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
          <CardDescription>
            Manage your connected devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : devices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{getRoomName(device.room)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setEditDevice(device);
                            setNewDeviceName(device.name);
                            setNewDeviceRoom(device.room);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setConfirmDeleteDevice(device)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No device found.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editDevice} onOpenChange={(open) => !open && setEditDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit device</DialogTitle>
            <DialogDescription>
              Update the details of this device.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceName" className="text-right">
                Name
              </Label>
              <Input
                id="deviceName"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceRoom" className="text-right">
                Room
              </Label>
              <Select
                value={newDeviceRoom}
                onValueChange={setNewDeviceRoom}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDevice(null)}>Cancel</Button>
            <Button onClick={handleUpdateDevice}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDeleteDevice} onOpenChange={(open) => !open && setConfirmDeleteDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the device "{confirmDeleteDevice?.name}" ?
              This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDevice(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDevice}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevicesSettings; 