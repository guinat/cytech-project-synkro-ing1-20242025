import { useState } from "react";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { useDevices } from "@/context/DevicesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeviceControl } from "@/components/ui/device-control";
import { Device, DeviceType } from "@/services/device.service";
import { Room } from "@/services/home.service";
import { Plus, Smartphone, DoorOpen, Home, Trash2, Pencil, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const DevicesPage = () => {
  const {
    homes,
    rooms,
    devices,
    deviceTypes,
    loadingHomes,
    loadingRooms,
    loadingDevices,
    loadingDeviceTypes,
    selectedHome,
    selectedRoom,
    setSelectedHome,
    setSelectedRoom,
    createDevice,
    updateDevice,
    deleteDevice,
    fetchDevices,
    createRoom,
    fetchRooms
  } = useDevices();

  // Local states for device creation/editing
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  
  // States for room creation
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  
  // Form for devices
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState<string>("");
  const [deviceRoom, setDeviceRoom] = useState<string>("");
  const [deviceLocation, setDeviceLocation] = useState("");
  const [deviceManufacturer, setDeviceManufacturer] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceSerialNumber, setDeviceSerialNumber] = useState("");

  // Handling dialog opening for creating/modifying a device
  const handleOpenDeviceDialog = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setDeviceName(device.name);
      setDeviceType(device.device_type.toString());
      setDeviceRoom(device.room?.toString() || "");
      setDeviceLocation(device.location || "");
      setDeviceManufacturer(device.manufacturer || "");
      setDeviceModel(device.model || "");
      setDeviceSerialNumber(device.serial_number || "");
    } else {
      setEditingDevice(null);
      setDeviceName("");
      setDeviceType("");
      setDeviceRoom(selectedRoom ? selectedRoom.id.toString() : "");
      setDeviceLocation("");
      setDeviceManufacturer("");
      setDeviceModel("");
      setDeviceSerialNumber("");
    }
    setIsDeviceDialogOpen(true);
  };

  // Reset the form
  const resetDeviceForm = () => {
    setDeviceName("");
    setDeviceType("");
    setDeviceRoom("");
    setDeviceLocation("");
    setDeviceManufacturer("");
    setDeviceModel("");
    setDeviceSerialNumber("");
    setEditingDevice(null);
  };

  // Save a device (creation or modification)
  const handleSaveDevice = async () => {
    if (!deviceName.trim() || !deviceType || (!deviceRoom && filteredRooms.length > 0)) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const deviceData: Partial<Device> = {
        name: deviceName.trim(),
        device_type: parseInt(deviceType),
        home: selectedHome?.id,
        // Assign room only if it's selected
        ...(deviceRoom ? { room: parseInt(deviceRoom) } : {}),
      };
      
      if (deviceLocation) {
        deviceData.location = deviceLocation;
      }
      
      if (deviceManufacturer) {
        deviceData.manufacturer = deviceManufacturer;
      }
      
      if (deviceModel) {
        deviceData.model = deviceModel;
      }
      
      if (deviceSerialNumber) {
        deviceData.serial_number = deviceSerialNumber;
      }
      
      if (editingDevice) {
        await updateDevice(editingDevice.id, deviceData);
      } else {
        await createDevice(deviceData);
      }
      
      // Reset the form
      resetDeviceForm();
      
      // Close the modal
      setIsDeviceDialogOpen(false);
    } catch (error) {
      console.error("Error saving device:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete a device
  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm("Are you sure you want to delete this device?")) {
      return;
    }
    
    try {
      await deleteDevice(deviceId);
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  // Create a new room
  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !selectedHome) return;
    
    setIsCreatingRoom(true);
    try {
      const roomData: Partial<Room> = {
        name: newRoomName.trim(),
        home: selectedHome.id
      };
      
      const newRoom = await createRoom(roomData);
      setNewRoomName("");
      setIsRoomDialogOpen(false);
      
      // If creation is successful, update the selected room for the device
      setDeviceRoom(newRoom.id.toString());
      
      // Refresh the rooms list after creation
      fetchRooms(selectedHome.id);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Filter rooms based on selected home
  const filteredRooms = selectedHome
    ? rooms.filter(room => room.home === selectedHome.id)
    : rooms;

  return (
    <MaxWidthWrapper>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-2">Device Management</h1>
        <p className="text-muted-foreground mb-10">
          Add and configure your connected devices
        </p>

        {/* Home selection */}
        {homes.length > 0 && (
          <div className="mb-8">
            <p className="mb-2">Select a home:</p>
            <div className="flex gap-2 flex-wrap">
              {homes.map(home => (
                <Button
                  key={home.id}
                  variant={selectedHome?.id === home.id ? "default" : "outline"}
                  onClick={() => {
                    setSelectedHome(home);
                    setSelectedRoom(null);
                  }}
                  className="flex items-center"
                >
                  <Home className="mr-2 h-4 w-4" />
                  {home.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Message if no home is selected */}
        {!selectedHome && (
          <Alert>
            <AlertTitle>No home selected</AlertTitle>
            <AlertDescription>
              Please select a home to manage its devices.
            </AlertDescription>
          </Alert>
        )}

        {/* Main content - only displayed if a home is selected */}
        {selectedHome && (
          <>
            {/* Room selection */}
            {filteredRooms.length > 0 && (
              <div className="mb-8">
                <p className="mb-2">Filter by room:</p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={!selectedRoom ? "default" : "outline"}
                    onClick={() => setSelectedRoom(null)}
                    className="flex items-center"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    All rooms
                  </Button>
                  
                  {filteredRooms.map(room => (
                    <Button
                      key={room.id}
                      variant={selectedRoom?.id === room.id ? "default" : "outline"}
                      onClick={() => setSelectedRoom(room)}
                      className="flex items-center"
                    >
                      <DoorOpen className="mr-2 h-4 w-4" />
                      {room.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Button to add a device */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {selectedRoom ? `Devices in ${selectedRoom.name}` : `All devices in ${selectedHome.name}`}
              </h2>
              
              <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDeviceDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add a device
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDevice ? "Edit a device" : "Add a device"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingDevice
                        ? "Modify the information of this device."
                        : "Add a new device to your home."}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="device-name">Device name</Label>
                      <Input
                        id="device-name"
                        placeholder="Living room lamp, Bedroom thermostat..."
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="device-type">Device type</Label>
                      <Select
                        value={deviceType}
                        onValueChange={setDeviceType}
                      >
                        <SelectTrigger id="device-type">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          {deviceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="device-room">Room</Label>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Select
                            value={deviceRoom}
                            onValueChange={setDeviceRoom}
                          >
                            <SelectTrigger id="device-room">
                              <SelectValue placeholder="Select a room" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredRooms.length === 0 ? (
                                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                  No rooms available
                                </div>
                              ) : (
                                filteredRooms.map((room) => (
                                  <SelectItem key={room.id} value={room.id.toString()}>
                                    {room.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsRoomDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Room
                        </Button>
                      </div>
                    </div>
                    
                    {/* Dialog to create a room */}
                    <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create a new room</DialogTitle>
                          <DialogDescription>
                            Add a new room to your home to place your devices.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="room-name">Room name</Label>
                            <Input
                              id="room-name"
                              placeholder="Living room, Kitchen, Bedroom..."
                              value={newRoomName}
                              onChange={(e) => setNewRoomName(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsRoomDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateRoom}
                            disabled={isCreatingRoom || !newRoomName.trim()}
                          >
                            {isCreatingRoom ? "Creating..." : "Create"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <div className="space-y-2">
                      <Label htmlFor="device-location">Precise location (optional)</Label>
                      <Input
                        id="device-location"
                        placeholder="On the table, northeast corner..."
                        value={deviceLocation}
                        onChange={(e) => setDeviceLocation(e.target.value)}
                      />
                    </div>
                    
                    <Tabs defaultValue="basic">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>
                      <TabsContent value="basic">
                        {/* Basic options already displayed above */}
                      </TabsContent>
                      <TabsContent value="advanced" className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="device-manufacturer">Manufacturer</Label>
                          <Input
                            id="device-manufacturer"
                            placeholder="Philips, Samsung..."
                            value={deviceManufacturer}
                            onChange={(e) => setDeviceManufacturer(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="device-model">Model</Label>
                          <Input
                            id="device-model"
                            placeholder="Hue, SmartThings..."
                            value={deviceModel}
                            onChange={(e) => setDeviceModel(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="device-serial">Serial number</Label>
                          <Input
                            id="device-serial"
                            placeholder="SN12345678"
                            value={deviceSerialNumber}
                            onChange={(e) => setDeviceSerialNumber(e.target.value)}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      onClick={handleSaveDevice}
                      disabled={isProcessing || !deviceName.trim() || !deviceType || (filteredRooms.length > 0 && !deviceRoom)}
                    >
                      {isProcessing
                        ? "Processing..."
                        : editingDevice
                        ? "Update"
                        : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Loading state */}
            {loadingDevices && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* No devices found */}
            {!loadingDevices && devices.length === 0 && (
              <div className="text-center py-12 border rounded-lg">
                <Smartphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No devices found</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  {selectedRoom
                    ? `You haven't added any devices in ${selectedRoom.name} yet.`
                    : "You haven't added any devices in this home yet."}
                </p>
                <Button onClick={() => handleOpenDeviceDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> Add my first device
                </Button>
              </div>
            )}

            {/* Device list */}
            {!loadingDevices && devices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                  <Card key={device.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center">
                          <Smartphone className="mr-2 h-5 w-5" />
                          {device.name}
                        </CardTitle>
                        <StatusBadge status={device.status} />
                      </div>
                      <CardDescription>
                        {device.device_type_name}
                        {device.room_name && ` • ${device.room_name}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {device.location && (
                          <div className="text-muted-foreground">
                            Location: {device.location}
                          </div>
                        )}
                        
                        <div className="text-muted-foreground">
                          Last activity: {new Date(device.last_seen).toLocaleString()}
                        </div>
                        
                        {device.manufacturer && (
                          <div className="text-muted-foreground">
                            Manufacturer: {device.manufacturer}
                            {device.model && ` (${device.model})`}
                          </div>
                        )}
                        
                        {/* Device control */}
                        <DeviceControl device={device} onDeviceUpdated={fetchDevices} />
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDeviceDialog(device)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDevice(device.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MaxWidthWrapper>
  );
};

export default DevicesPage;