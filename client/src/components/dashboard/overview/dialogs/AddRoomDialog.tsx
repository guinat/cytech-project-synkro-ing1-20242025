import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Home, Plus } from 'lucide-react';

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRoom: (name: string) => Promise<void>;
}

const AddRoomDialog: React.FC<AddRoomDialogProps> = ({ open, onOpenChange, onAddRoom }) => {
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    
    setIsCreating(true);
    try {
      await onAddRoom(roomName);
      setRoomName("");
      onOpenChange(false);
      toast.success(`Room "${roomName}" created successfully`);
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Add New Room</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-sm font-medium">
              Room Name
            </Label>
            <Input
              id="roomName"
              className="w-full"
              placeholder="Enter room name (e.g. Living Room, Kitchen)"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isCreating || !roomName.trim()} 
              className="w-full gap-1"
            >
              {isCreating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Room
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomDialog; 