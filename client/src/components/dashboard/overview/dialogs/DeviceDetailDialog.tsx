import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { DeviceHistoryModal } from '@/components/ui/DeviceHistoryModal';

import { cn } from '@/lib/utils';
import DeviceDynamicControls from '../devices/DeviceDynamicControls';
import DeviceIcon from '../devices/DeviceIcon';
import { Edit, Trash2, AlertTriangle, Clock, Zap, History } from 'lucide-react';
import { updateDevice, deleteDevice, Device, getDeviceCommand } from '@/services/devices.service';

import { apiFetch } from '@/services/api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DeviceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: EnhancedDevice | null;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}

interface EnhancedDevice {
  id: string;
  name: string;
  type: string;
  home_id?: string;
  room_id?: string;
  home: string;
  room: string;
  isOn?: boolean;
  energyConsumption?: string;
  activeTime?: string;
  lastActiveAt?: string;
  state?: any;
  brand?: string;
}

interface DeviceStatsResponse {
  activeTime: string;
  energyConsumption: string;
  lastActiveAt: string;
  isOn: boolean;
}

const deviceColors: Record<string, string> = {
  light: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  thermostat: 'bg-red-500/10 text-red-500 border-red-500/20',
  door: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  sensor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  camera: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  default: 'bg-secondary text-secondary-foreground'
};

const DeviceDetailDialog: React.FC<DeviceDetailDialogProps> = ({ open, onOpenChange, device, onRename, onDelete }) => {
  const [editName, setEditName] = useState(device?.name || "");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localState, setLocalState] = useState<any>(device?.state || {});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<EnhancedDevice | null>(device);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (device && open) {
      setIsLoading(true);
      const fetchDeviceStats = async () => {
        try {
          const deviceData = await apiFetch<Device>(
            `/homes/${device.home}/rooms/${device.room}/devices/${device.id}/`
          );

          let statsData: DeviceStatsResponse = {
            activeTime: '0 h',
            energyConsumption: '0 kWh',
            lastActiveAt: new Date().toISOString(),
            isOn: device.state?.power === 'on' || device.state?.isOn === true || false
          };

          try {
            statsData = await apiFetch<DeviceStatsResponse>(
              `/homes/${device.home}/rooms/${device.room}/devices/${device.id}/stats/`
            );
          } catch (statsError) {
            console.warn("L'endpoint des stats n'est pas encore disponible:", statsError);
          }

          const enhancedDevice: EnhancedDevice = {
            ...device,
            name: deviceData.name || device.name,
            id: deviceData.id || device.id,
            home: device.home,
            room: device.room,
            home_id: device.home_id || device.home,
            room_id: device.room_id || device.room,
            activeTime: statsData.activeTime,
            energyConsumption: statsData.energyConsumption,
            lastActiveAt: statsData.lastActiveAt,
            isOn: statsData.isOn,
            state: device.state,
            brand: deviceData.brand || device.brand || ''
          };

          setDeviceDetails(enhancedDevice);
          if (device.state) {
            setLocalState(device.state);
          }
        } catch (error) {
          console.error("Failed to fetch device data:", error);
          toast.error("Impossible de charger les détails de l'appareil");
          setDeviceDetails(device);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDeviceStats();
    }
  }, [device, open]);

  useEffect(() => {
    if (deviceDetails) {
      setEditName(deviceDetails.name);
    }
  }, [deviceDetails]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceDetails || !editName.trim()) return;
    setIsRenaming(true);
    try {
      await updateDevice(deviceDetails.home, deviceDetails.room, deviceDetails.id, { name: editName });
      setDeviceDetails(prev => prev ? { ...prev, name: editName } : null);
      if (onRename) {
        onRename(deviceDetails.id, editName);
      }
    } catch (error) {
      console.error("Failed to rename device:", error);
      toast.error("Impossible de renommer l'appareil");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!deviceDetails) return;
    if (isConfirmingDelete) {
      setIsDeleting(true);
      try {
        await deleteDevice(deviceDetails.home, deviceDetails.room, deviceDetails.id);
        onOpenChange(false);
        if (onDelete) {
          onDelete(deviceDetails.id);
        }
      } catch (error) {
        console.error("Failed to delete device:", error);
        toast.error("Impossible de supprimer l'appareil");
      } finally {
        setIsDeleting(false);
        setIsConfirmingDelete(false);
      }
    } else {
      setIsConfirmingDelete(true);
    }
    console.log("test");
  };


  const formatLastActive = (lastActiveAt?: string) => {
    if (!lastActiveAt) return "Inconnu";
    try {
      const date = parseISO(lastActiveAt);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (e) {
      return "Format de date invalide";
    }
  };

  if (!device) return null;

  const isDeviceOn = deviceDetails?.isOn || localState.power === 'on' || localState.isOn === true;
  const deviceColorClass = deviceColors[device.type.toLowerCase()] || deviceColors.default;
  const homeId = deviceDetails?.home_id || device.home || "";
  const roomId = deviceDetails?.room_id || device.room || "";





  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) setIsConfirmingDelete(false); onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-md">
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{device?.name || "Chargement..."}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors border", deviceColorClass)}>
                  <DeviceIcon type={device.type} />
                </div>
                <div>
                  <DialogTitle className="text-xl">{deviceDetails?.name || device.name}</DialogTitle>
                  <div className="text-xs text-muted-foreground">Type: {device.type}</div>
                  {deviceDetails?.brand && (
                    <div className="text-xs text-muted-foreground">Marque: {deviceDetails.brand}</div>
                  )}
                </div>
                <div className="ml-auto">
                  <Badge variant={isDeviceOn ? "default" : "outline"} className={cn(isDeviceOn && "bg-green-500 hover:bg-green-500/90")}>
                    {isDeviceOn ? "ON" : "OFF"}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Consommation</div>
                    <div className="font-medium">{deviceDetails?.energyConsumption || '0 kWh'}</div>
                  </div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Temps actif</div>
                    <div className="font-medium">{deviceDetails?.activeTime || '0 h'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Dernière activité</div>
                  <div className="font-medium">{formatLastActive(deviceDetails?.lastActiveAt)}</div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium mb-3">Contrôles</h3>
                <DeviceDynamicControls
                  device={{ ...deviceDetails, id: deviceDetails?.id || device.id, state: localState, home_id: homeId, room_id: roomId }}
                  homeId={homeId}
                  roomId={roomId}
                  onStateUpdate={(state) => {
                    setLocalState(state);
                    if (state.power === 'on' || state.isOn === true) {
                      setDeviceDetails(prev => prev ? { ...prev, isOn: true } : null);
                    } else if (state.power === 'off' || state.isOn === false) {
                      setDeviceDetails(prev => prev ? { ...prev, isOn: false } : null);
                    }
                  }}
                />
              </div>

              <form onSubmit={handleRename} className="space-y-3">
                <Label htmlFor="deviceName" className="text-sm font-medium">Renommer l'appareil</Label>
                <div className="flex gap-2">
                  <Input
                    id="deviceName"
                    className="flex-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={isRenaming}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={editName === (deviceDetails?.name || device.name) || !editName.trim() || isRenaming}
                    className="gap-1"
                  >
                    {isRenaming ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                    {isRenaming ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>

              <Separator />

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="gap-1"
                  size="sm"
                >
                  {isConfirmingDelete ? (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Confirmer
                    </>
                  ) : isDeleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </>
                  )}
                </Button>
                <DeviceHistoryModal
                  homeId={homeId}
                  roomId={roomId}
                  deviceId={deviceDetails?.id || device.id}
                  triggerClassName="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white px-4 py-2 ml-2"
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeviceDetailDialog;
