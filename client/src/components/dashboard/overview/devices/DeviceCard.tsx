import React, { useState } from 'react';
import DeviceIcon from './DeviceIcon';
import DeviceDynamicControls from './DeviceDynamicControls';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock, Zap } from 'lucide-react';
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
    shutter: 'bg-green-500/10 text-green-500 border-green-500/20',
    default: 'bg-secondary text-secondary-foreground'
  };
  
  const deviceColorClass = deviceColors[device.type.toLowerCase()] || deviceColors.default;

  return (
    <Card 
      style={{ backgroundColor: '#98d7eb' }}
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
            {(() => {
              // Mapping local pour correspondance type → puissance de base (en kW)
              const DEVICE_TYPE_POWER: Record<string, number> = {
                smart_bulb_x: 0.01,
                smart_thermostat_x: 0.05,
                smart_shutter_x: 0,
                smart_television_x: 0.1,
                smart_oven_x: 0.2,
                smart_doorlocker_x: 0,
                smart_speaker_x: 0.1,
              };
              if (device.type === 'smart_bulb_x') {
                // Brightness dynamique (0-100)
                const brightness = localState.brightness ?? 100;
                const power = DEVICE_TYPE_POWER.smart_bulb_x * (brightness / 100);
                return `${(power * 1000).toFixed(1)} W`;
              } else if (device.type === 'smart_oven_x') {
                // Conversion température (50-250°C) → pourcentage (0-100), robustesse contre NaN
                const heat = localState.heat ?? 100;
                const power = DEVICE_TYPE_POWER.smart_oven_x * (heat / 100);
                return `${(power * 1000).toFixed(1)} W`;
              } else {
                const power = DEVICE_TYPE_POWER[device.type] ?? 0;
                return `${(power * 1000).toFixed(1)} W`;
              }
            })()}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DeviceCard;