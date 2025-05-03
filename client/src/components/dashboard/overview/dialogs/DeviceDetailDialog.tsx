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
import { updateDevice, deleteDevice, Device, getDeviceCommand, getDeviceTotalConsumption } from '@/services/devices.service';

import { apiFetch } from '@/services/api';
import { formatDistanceToNow, parseISO } from 'date-fns';

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
  const [totalConsumption, setTotalConsumption] = useState<string>('0 Wh');
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
            energyConsumption: '0 Wh',
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

          // Calcul de la durée ON à partir de l'historique des commandes
          let activeTime = '0 h';
          try {
            // @ts-ignore
            const commands = await getDeviceCommand(device.home, device.room, device.id);
            if (Array.isArray(commands) && commands.length > 0) {
              // Filtrer uniquement les commandes on/off exécutées avec executed_at
              const onOffCmds = commands
                .filter(cmd => cmd.capability === 'on_off' && !!cmd.executed_at)
                .sort((a, b) => (a.executed_at && b.executed_at ? a.executed_at.localeCompare(b.executed_at) : 0));

              let totalMs = 0;
              let lastOn: string | null = null;
              for (const cmd of onOffCmds) {
                let isOn: boolean | undefined = undefined;
                if (typeof cmd.parameters === 'object' && cmd.parameters !== null) {
                  // Certains backends envoient parameters en string, on parse si besoin
                  let paramsObj: any = cmd.parameters;
                  if (typeof paramsObj === 'string') {
                    try {
                      paramsObj = JSON.parse(paramsObj);
                    } catch {}
                  }
                  if (typeof paramsObj === 'object' && paramsObj !== null && 'on_off' in paramsObj) {
                    isOn = paramsObj.on_off;
                  }
                }
                if (isOn && !lastOn) {
                  lastOn = cmd.executed_at!;
                } else if (isOn === false && lastOn) {
                  // Ajoute la période ON
                  totalMs += new Date(cmd.executed_at!).getTime() - new Date(lastOn).getTime();
                  lastOn = null;
                }
              }
              // Si le dernier état est ON, on considère que le device est encore allumé jusqu'à maintenant
              if (lastOn) {
                totalMs += new Date().getTime() - new Date(lastOn).getTime();
              }
              // Formattage de la durée
              const totalMin = Math.floor(totalMs / 60000);
              const h = Math.floor(totalMin / 60);
              const min = totalMin % 60;
              if (h > 0 && min > 0) activeTime = `${h} h ${min} min`;
              else if (h > 0) activeTime = `${h} h`;
              else activeTime = `${min} min`;
            }
          } catch (e) {
            // fallback: statsData.activeTime
            activeTime = statsData.activeTime;
          }

          // Récupération de la dernière commande exécutée
          let lastCommandAt: string | null = null;
          try {
            // @ts-ignore
            const commands = await getDeviceCommand(device.home, device.room, device.id);
            if (Array.isArray(commands) && commands.length > 0) {
              // On prend la dernière commande exécutée (la plus récente)
              const sorted = [...commands].sort((a, b) => {
                if (!a.executed_at) return 1;
                if (!b.executed_at) return -1;
                return b.executed_at.localeCompare(a.executed_at);
              });
              lastCommandAt = sorted[0].executed_at || null;
            }
          } catch (e) {
            // ignore erreur, fallback handled below
          }

          const enhancedDevice: EnhancedDevice = {
            ...device,
            name: deviceData.name || device.name,
            id: deviceData.id || device.id,
            home: device.home,
            room: device.room,
            home_id: device.home_id || device.home,
            room_id: device.room_id || device.room,
            activeTime: activeTime, // Utilise la valeur calculée
            energyConsumption: statsData.energyConsumption,
            lastActiveAt: lastCommandAt || undefined, // On priorise la vraie dernière commande
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

  // Récupérer la consommation totale réelle et l'actualiser toutes les secondes
  useEffect(() => {
    const fetchTotalConsumption = async () => {
      if (deviceDetails) {
        try {
          const deviceId = deviceDetails.id;
          
          const kWh = await getDeviceTotalConsumption(deviceId);
          setTotalConsumption(`${kWh.toFixed(2)} Wh`);
        } catch (error) {
          console.error("Erreur lors de la récupération de la consommation:", error);
          setTotalConsumption('0 Wh');
        }
      }
    };
    
    let intervalId: NodeJS.Timeout | null = null;
    
    if (open && deviceDetails) {
      // Récupération initiale
      fetchTotalConsumption();
      
      // Mise en place de l'actualisation toutes les secondes
      intervalId = setInterval(() => {
        fetchTotalConsumption();
      }, 1000);
    }
    
    // Nettoyage de l'intervalle à la fermeture du dialogue ou au démontage du composant
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [open, deviceDetails]);

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
    if (!lastActiveAt) return "Never used";
    try {
      const date = parseISO(lastActiveAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "Invalid date format";
    }
  };


  if (!device) return null;

  const isDeviceOn = localState.on_off === true || deviceDetails?.isOn || localState.power === 'on' || localState.isOn === true;
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
                    <div className="text-xs text-muted-foreground">Brand: {deviceDetails.brand}</div>
                  )}
                </div>
                <div className="ml-auto">
                  <Badge variant={isDeviceOn ? "default" : "outline"} className={cn(isDeviceOn && "bg-green-500 hover:bg-green-500/90")}>
                    {isDeviceOn ? "ON" : "OFF"}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-400 rounded-lg p-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Total consumption</div>
                    <div className="font-medium">{totalConsumption}</div>
                  </div>
                </div>
                <div className="bg-green-100 dark:bg-green-400 rounded-lg p-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Time active</div>
                    <div className="font-medium">{deviceDetails?.activeTime || '0 h'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-sky-100 dark:bg-sky-400 rounded-lg p-3 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Last interaction</div>
                  <div className="font-medium">{formatLastActive(deviceDetails?.lastActiveAt)}</div>
                </div>
              </div>

              {/* <div className="rounded-lg border border-border p-4">
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
              </div> */}

              <form onSubmit={handleRename} className="space-y-3">
                <Label htmlFor="deviceName" className="text-sm font-medium">Rename device</Label>
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
                    {isRenaming ? 'Saving...' : 'Save'}
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
                      Confirm
                    </>
                  ) : isDeleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
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
