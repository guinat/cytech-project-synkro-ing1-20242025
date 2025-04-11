import { useState } from "react";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { useDevices } from "@/context/DevicesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, DoorOpen, Home, Trash2, Pencil, Smartphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Room } from "@/services/home.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const RoomsPage = () => {
  const {
    rooms,
    loadingRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    selectedHome,
    setSelectedHome,
    homes,
  } = useDevices();

  // Local state for creating/editing a room
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Handle opening dialog for creating/modifying a room
  const handleOpenRoomDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setRoomName(room.name);
    } else {
      setEditingRoom(null);
      setRoomName("");
    }
    setIsRoomDialogOpen(true);
  };

  // Create or modify a room
  const handleSaveRoom = async () => {
    if (!roomName.trim() || !selectedHome) return;
    
    setIsProcessing(true);
    try {
      if (editingRoom) {
        // Update an existing room
        await updateRoom(editingRoom.id, { name: roomName.trim() });
      } else {
        // Create a new room
        await createRoom({
          name: roomName.trim(),
          home: selectedHome.id
        });
      }
      
      setRoomName("");
      setEditingRoom(null);
      setIsRoomDialogOpen(false);
    } catch (error) {
      console.error("Error saving room:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete a room
  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this room? All associated devices will be unlinked.")) {
      return;
    }
    
    try {
      await deleteRoom(roomId);
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <MaxWidthWrapper>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-2">Room Management</h1>
        <p className="text-muted-foreground mb-10">
          Create and manage rooms in your home to organize your devices
        </p>

        {/* Home selection */}
        {homes.length > 0 && (
          <div className="mb-8 flex gap-2 flex-wrap">
            <p className="w-full mb-2">Select a home:</p>
            {homes.map(home => (
              <Button
                key={home.id}
                variant={selectedHome?.id === home.id ? "default" : "outline"}
                onClick={() => setSelectedHome(home)}
                className="flex items-center"
              >
                <Home className="mr-2 h-4 w-4" />
                {home.name}
              </Button>
            ))}
          </div>
        )}

        {/* Message if no home is selected */}
        {!selectedHome && (
          <Alert>
            <AlertTitle>No home selected</AlertTitle>
            <AlertDescription>
              Please select a home to manage its rooms.
            </AlertDescription>
          </Alert>
        )}

        {/* Main content - only displayed if a home is selected */}
        {selectedHome && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Rooms in {selectedHome.name}</h2>
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenRoomDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add a room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRoom ? "Edit a room" : "Add a room"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingRoom
                        ? "Modify the information for this room."
                        : "Create a new room in your home."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="room-name">Room name</Label>
                      <Input
                        id="room-name"
                        placeholder="Living room, Kitchen, Bedroom..."
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSaveRoom}
                      disabled={isProcessing || !roomName.trim()}
                    >
                      {isProcessing
                        ? "Processing..."
                        : editingRoom
                        ? "Update"
                        : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Loading rooms */}
            {loadingRooms && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-2/3" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Room list */}
            {!loadingRooms && rooms.length === 0 && (
              <div className="text-center py-12 border rounded-lg">
                <DoorOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No rooms</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  You haven't created any rooms in this home yet.
                </p>
                <Button onClick={() => handleOpenRoomDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> Create my first room
                </Button>
              </div>
            )}

            {!loadingRooms && rooms.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <Card key={room.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DoorOpen className="mr-2 h-5 w-5" />
                        {room.name}
                      </CardTitle>
                      <CardDescription>
                        Created on {new Date(room.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm">
                        <Smartphone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{room.device_count || 0} devices</span>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenRoomDialog(room)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRoom(room.id)}
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

export default RoomsPage;