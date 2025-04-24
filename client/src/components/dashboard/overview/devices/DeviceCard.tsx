import React, { useState } from 'react';
import DeviceIcon from './DeviceIcon';
import DeviceDynamicControls from './DeviceDynamicControls';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock, Zap, Power } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedDevice {
  id: string;
  name: string;
  type: string;
  home: string;
  room: string;
  isOn?: boolean;
  energyConsumption?: string;
  activeTime?: string;
  state?: any;
}

interface DeviceCardProps {
  device: EnhancedDevice;
  onOpenDetail?: (device: EnhancedDevice) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onOpenDetail }) => {
  const [localState, setLocalState] = useState(device.state || {});
  const [isHovered, setIsHovered] = useState(false);
  const homeId = device.home;
  const roomId = device.room;
  
  const isDeviceOn = localState.power === 'on' || localState.isOn === true || device.isOn === true;

  const deviceColors: Record<string, string> = {
    light: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    thermostat: 'bg-red-500/10 text-red-500 border-red-500/20',
    door: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    sensor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    camera: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    default: 'bg-secondary text-secondary-foreground'
  };
  
  const deviceColorClass = deviceColors[device.type.toLowerCase()] || deviceColors.default;

  return (
    <Card 
      className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden",
        isHovered && "shadow-lg",
        isDeviceOn ? "border-primary/20" : "border-border"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-4 pb-0 flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors border",
            deviceColorClass
          )}>
            <DeviceIcon type={device.type} />
          </div>
          
          <div>
            <CardTitle className="text-base">{device.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{device.activeTime || 'Active for 3 hours'}</span>
            </CardDescription>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={(e) => { e.stopPropagation(); onOpenDetail?.(device); }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-3">
        <DeviceDynamicControls
          device={{ ...device, state: localState }}
          homeId={homeId}
          roomId={roomId}
          onStateUpdate={setLocalState}
        />
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t flex justify-between items-center bg-muted/10">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {device.energyConsumption || '5Kwh'}
          </span>
        </div>
        
        <Badge 
          variant={isDeviceOn ? "default" : "outline"}
          className={cn(
            "text-xs px-2 h-5",
            isDeviceOn && "bg-green-500 hover:bg-green-500/90"
          )}
        >
          {isDeviceOn ? "ON" : "OFF"}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default DeviceCard;