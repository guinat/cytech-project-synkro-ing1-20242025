import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Room,
  listRoomsService,
  updateRoomService,
  deleteRoomService
} from '@/services/rooms.service';

interface RoomsSettingsProps {
  home: Home;
  onReload: () => Promise<void>;
}

const RoomsSettings: React.FC<RoomsSettingsProps> = ({ home, onReload }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<Room | null>(null);

  const loadRooms = useCallback(async () => {
    if (!home || !home.id) return;
    
    setLoading(true);
    try {
      const roomsData = await listRoomsService(home.id);
      setRooms(roomsData);
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast.error('Impossible to load rooms');
    } finally {
      setLoading(false);
    }
  }, [home]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleRenameRoom = async () => {
    if (!editRoom || !newRoomName.trim() || newRoomName === editRoom.name) {
      setEditRoom(null);
      return;
    }

    try {
      await updateRoomService(home.id, editRoom.id, { name: newRoomName });
      await loadRooms();
      await onReload();
      toast.success('Room renamed successfully');
    } catch (error) {
      toast.error('Failed to rename room');
    } finally {
      setEditRoom(null);
      setNewRoomName('');
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirmDeleteRoom) return;

    try {
      await deleteRoomService(home.id, confirmDeleteRoom.id);
      await loadRooms();
      await onReload();
      toast.success('Room deleted successfully');
    } catch (error) {
      toast.error('Failed to delete room');
    } finally {
      setConfirmDeleteRoom(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
          <CardDescription>
            Manage the rooms of your home
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setEditRoom(room);
                            setNewRoomName(room.name);
                          }}
                        >
                          Rename
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setConfirmDeleteRoom(room)}
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
              No room found.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editRoom} onOpenChange={(open) => !open && setEditRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename room</DialogTitle>
            <DialogDescription>
              Enter a new name for this room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roomName" className="text-right">
                Name
              </Label>
              <Input
                id="roomName"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoom(null)}>Cancel</Button>
            <Button onClick={handleRenameRoom}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDeleteRoom} onOpenChange={(open) => !open && setConfirmDeleteRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the room "{confirmDeleteRoom?.name}" ? 
              This action is irreversible and will also delete all the devices associated with it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteRoom(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRoom}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomsSettings; 