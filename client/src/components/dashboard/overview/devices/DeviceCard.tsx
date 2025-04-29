import React, { useState } from 'react';
import DeviceIcon from './DeviceIcon';
import DeviceDynamicControls from './DeviceDynamicControls';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnergyConsumption } from '@/services/devices.service';

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
  cycle?: string; 
  delayStart?: number; 
  spinSpeed?: number; 
}

interface DeviceCardProps {
  device: EnhancedDevice;
  onOpenDetail?: (device: EnhancedDevice) => void;
}

const exportConsumption = (device: EnhancedDevice) => {
  const lines = [
    `Nom de l'appareil: ${device.name}`,
    `ID: ${device.id}`,
    `Type: ${device.type}`,
    `Home ID: ${device.home}`,
    `Room ID: ${device.room}`,
    
    `Consommation: ${device.energyConsumption || 'N/A'}`,
    `Temps d'activité: ${device.activeTime || 'N/A'}`
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${device.name.replace(/\s+/g, '_')}_consommation.txt`;
  link.click();

  window.URL.revokeObjectURL(url);
};

// Nouvelle fonction d'export détaillée par seconde
export const exportConsumptionPerSecond = async (device: EnhancedDevice) => {
  // On prend les 10 dernières minutes pour l'exemple
  const now = new Date();
  const dateStart = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes avant

  const params = {
    home_id: device.home,
    room_id: device.room,
    device_id: device.id,
    date_start: dateStart.toISOString(),
    date_end: now.toISOString(),
    granularity: 'minute' as 'minute', // Correction du type
    cumulative: 'false',
  };

  try {
    const res = await getEnergyConsumption(params);
    const deviceData = res.devices.find(d => d.device_id === device.id);
    if (!deviceData || !deviceData.consumption) {
      alert("Aucune donnée de consommation disponible pour cet appareil.");
      return;
    }
    // Pour chaque minute, on répartit la consommation sur 60 secondes
    const lines = [
      `Nom de l'appareil: ${device.name}`,
      `ID: ${device.id}`,
      `Type: ${device.type}`,
      `Home ID: ${device.home}`,
      `Room ID: ${device.room}`,
      '',
      'Temps relevé ;Consommation (kWh sur ce temps'
    ];
    Object.entries(deviceData.consumption).forEach(([minuteIso, value]) => {
      const minuteDate = new Date(minuteIso);
      for (let s = 0; s < 60; s++) {
        const secondDate = new Date(minuteDate.getTime() + s * 1000);
        lines.push(`${secondDate.toISOString()};${(value).toFixed(6)}`);
      }
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${device.name.replace(/\s+/g, '_')}_consommation_seconde.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (e: any) {
    alert("Erreur lors de l'export: " + (e?.message || e)); // Correction typage e: any
  }
};

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onOpenDetail }) => {
  const [localState, setLocalState] = useState(device.state || {});
  const [isHovered, setIsHovered] = useState(false);
  const homeId = device.home;
  const roomId = device.room;
  
  //const isDeviceOn = localState.power === 'on' || localState.isOn === true || device.isOn === true;
  const isDeviceOn = localState.on_off === true || localState.power === 'on' || localState.isOn === true || device.isOn === true;

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
        isHovered && "shadow-lg scale-101",
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

        
        <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={async (e) => {
                e.stopPropagation();
                await exportConsumptionPerSecond(device);
              }}
            >
              Export txt
        </Button>
        
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