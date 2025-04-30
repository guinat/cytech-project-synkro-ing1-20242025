import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Home, PlusCircle } from 'lucide-react';

import type { Room } from '@/services/rooms.service';

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDevice: (payload: any, roomId: string, homeId: string) => Promise<void>;
  rooms: Room[];
  onAddRoom: (name: string) => Promise<void>;
  selectedHomeId: string;
}

const AddDeviceDialog: React.FC<AddDeviceDialogProps> = ({ open, onOpenChange, onAddDevice, rooms, onAddRoom, selectedHomeId }) => {
  const [creatingRoom, setCreatingRoom] = useState(rooms.length === 0);
  
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [productCode, setProductCode] = useState("DUMMY1");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceTypes, setDeviceTypes] = useState<{ id: string; name: string }[]>([]);
  const [isDeviceTypesLoading, setIsDeviceTypesLoading] = useState(false);
  const [deviceTypesError, setDeviceTypesError] = useState<string | null>(null);

  useEffect(() => {
    if (deviceTypes.length > 0) {
      const found = deviceTypes.find(dt => dt.id === deviceType);
      if (!deviceType || !found) {
        setDeviceType(deviceTypes[0].id);
      }
    }
  }, [deviceTypes]);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || "");
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    if (rooms.length > 0) {
      setSelectedRoomId(rooms[0]?.id || "");
      setCreatingRoom(false);
    } else {
      setCreatingRoom(true);
    }
  }, [rooms]);

  useEffect(() => {
    let mounted = true;
    setIsDeviceTypesLoading(true);
    setDeviceTypesError(null);
    import('@/services/devices.service').then(m => m.getPublicDeviceTypes())
      .then((types) => {
        if (mounted) {
         setDeviceTypes(types.filter(t => !!t.id).map(t => ({ id: t.id, name: t.name })));
        }
      })
      .catch(() => {
        setDeviceTypesError("Failed to load device types");
        setDeviceTypes([]);
      })
      .finally(() => {
        setIsDeviceTypesLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim() || !selectedRoomId || !deviceType) return;
    const selectedType = deviceTypes.find(dt => dt.id === deviceType);
    if (!deviceType || !selectedType) {
      toast.error("Le type d'appareil sélectionné est invalide ou n'existe plus. Veuillez réessayer.");
      return;
    }
    const debugPayload = {
      name: deviceName,
      type: selectedType.id,
      product_code: productCode,
      brand: deviceBrand,
      state: {},
      room: selectedRoomId,
    };

    setIsCreating(true);
    try {
      await onAddDevice(debugPayload, selectedRoomId, selectedHomeId);
      setDeviceName("");
      setDeviceBrand("");
      onOpenChange(false);
      toast.success(`Device "${deviceName}" added successfully`);
    } catch (error) {
      if (error && typeof error === 'object' && 'raw' in error) {
        try {
          const raw = (error as any).raw;
          if (raw && typeof raw === 'object') {
            if (raw.message) {
              toast.error(raw.message);
            } else if (raw.errors && Array.isArray(raw.errors)) {
              toast.error(raw.errors.join(', '));
            } else {
              toast.error(JSON.stringify(raw));
            }
          } else {
            toast.error(JSON.stringify(raw));
          }
        } catch (e) {
          toast.error("Failed to add device");
        }
      } else {
        toast.error("Failed to add device");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setIsCreatingRoom(true);
    try {
      await onAddRoom(newRoomName);
      setNewRoomName("");
      toast.success(`Room "${newRoomName}" created successfully`);
      if (rooms.length > 0) {
        setCreatingRoom(false);
      }
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="add-device-description">
        <DialogHeader>
          <DialogTitle>
            {creatingRoom ? "Create a Room First" : "Add New Device"}
          </DialogTitle>
        </DialogHeader>
        
        {creatingRoom ? (
          <>
            <div id="add-room-description" className="sr-only">You need to create a room before adding a device. Please create a room first.</div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You need to create a room before adding a device. Please create a room first.
              </p>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="roomName" className="text-sm font-medium">
                    Room Name
                  </label>
                  <input
                    id="roomName"
                    className="w-full p-2 rounded-md bg-card border border-input focus:border-primary outline-none"
                    placeholder="Enter room name (e.g. Living Room, Kitchen)"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isCreatingRoom || !newRoomName.trim()} 
                  className="w-full gap-1"
                >
                  {isCreatingRoom ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating Room...
                    </>
                  ) : (
                    <>
                      <Home className="h-4 w-4" />
                      Create Room
                    </>
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div id="add-device-description" className="sr-only">Add a new device to an existing room. All fields are required.</div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="deviceName" className="text-sm font-medium">
                  Device Name
                </label>
                <input
                  id="deviceName"
                  className="w-full p-2 rounded-md bg-card border border-input focus:border-primary outline-none"
                  placeholder="Enter device name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="productCode" className="text-sm font-medium">
                  Product Code
                </label>
                <input
                  id="productCode"
                  className="w-full p-2 rounded-md bg-card border border-input focus:border-primary outline-none"
                  placeholder="Enter product code"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="deviceType" className="text-sm font-medium">
                  Device Type
                </label>
                {isDeviceTypesLoading ? (
                  <div className="text-muted-foreground text-sm">Loading device types...</div>
                ) : deviceTypesError ? (
                  <div className="text-destructive text-sm">{deviceTypesError}</div>
                ) : (
                  <select
                    id="deviceType"
                    className="w-full p-2 rounded-md bg-card border border-input focus:border-primary outline-none"
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a device type</option>
                    {deviceTypes.filter(type => !!type.id).map((type) => (
                      <option key={`device-type-${type.id}`} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="roomSelect" className="text-sm font-medium">
                  Room
                </label>
                <select
                  id="roomSelect"
                  className="w-full p-2 rounded-md bg-card border border-input focus:border-primary outline-none"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  required
                >
                  {rooms.map((room) => (
                    <option key={room.id ?? room.name ?? Math.random()} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="deviceBrand" className="text-sm font-medium">
                  Device Brand
                </label>
                <select
                  id="deviceBrand"
                  className="w-full p-2 rounded-md bg-card border border-input focus:border-primary outline-none"
                  value={deviceBrand}
                  onChange={(e) => setDeviceBrand(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a brand</option>
                  <option value="Philips">Philips</option>
                  <option value="Apple">Apple</option>
                  <option value="Nest">Nest</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Google">Google</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Bosch">Bosch</option>
                </select>
              </div>

              <Button type="submit" disabled={isCreating || !deviceName.trim() || !selectedRoomId || isDeviceTypesLoading || deviceTypes.length === 0 || !deviceType} className="w-full">
                {isCreating ? "Adding..." : "Add Device"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceDialog;
