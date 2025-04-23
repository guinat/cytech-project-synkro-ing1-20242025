import React from 'react';
import type { Room } from '@/services/rooms.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomTabsProps {
  rooms: Room[];
  activeRoom: string;
  onRoomChange: (roomId: string) => void;
  onAddRoom: () => void;
}

const RoomTabs: React.FC<RoomTabsProps> = ({ rooms, activeRoom, onRoomChange, onAddRoom }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Rooms</h2>
      </div>
      
      <div className="relative">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <Badge 
            variant={activeRoom === 'overview' ? "default" : "outline"}
            className={cn(
              "px-3 py-1 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
              activeRoom === 'overview' && "bg-primary hover:bg-primary/90"
            )}
            onClick={() => onRoomChange('overview')}
          >
            Overview
          </Badge>
          
          {rooms.map((room) => (
            <Badge
              key={room.id}
              variant={activeRoom === room.id ? "default" : "outline"}
              className={cn(
                "px-3 py-1 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap",
                activeRoom === room.id && "bg-primary hover:bg-primary/90"
              )}
              onClick={() => onRoomChange(room.id)}
            >
              {room.name}
            </Badge>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1 h-7 text-xs whitespace-nowrap"
            onClick={onAddRoom}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Room
          </Button>
        </div>
        
        {/* Ombre de défilement horizontale subtile */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
      </div>
      
      <div className="h-px w-full bg-border mt-1"></div>
    </div>
  );
};

export default RoomTabs; 