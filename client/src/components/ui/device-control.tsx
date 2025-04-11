import { useState } from "react";
import { Device } from "@/services/device.service";
import deviceService from "@/services/device.service";
import { Button } from "./button";
import { Slider } from "./slider";
import { Switch } from "./switch";
import { toast } from "sonner";
import { Power, Thermometer, Loader2 } from "lucide-react";

interface DeviceControlProps {
  device: Device;
  onDeviceUpdated?: () => void; // Callback après mis à jour de l'appareil
}

// Composant principal pour contrôler un appareil
export function DeviceControl({ device, onDeviceUpdated }: DeviceControlProps) {
  // Déterminer le type de contrôle à afficher en fonction du type d'appareil
  const renderDeviceControl = () => {
    // Si l'appareil est hors ligne, montrer qu'il est indisponible
    if (device.status !== 'online') {
      return <DeviceOffline device={device} />;
    }

    // Déterminer le type de contrôle en fonction du type d'appareil
    if (device.device_type_name === 'Smart Light' || 
        device.device_type_name === 'Smart Plug') {
      return <DeviceToggle device={device} onDeviceUpdated={onDeviceUpdated} />;
    } else if (device.device_type_name === 'Smart Thermostat') {
      return <DeviceThermostat device={device} onDeviceUpdated={onDeviceUpdated} />;
    } else {
      // Pour les autres types d'appareils, montrer un contrôle générique
      return <DeviceGeneric device={device} />;
    }
  };

  return (
    <div className="mt-4 border rounded-md p-4">
      <h3 className="text-sm font-medium mb-4">Contrôles</h3>
      {renderDeviceControl()}
    </div>
  );
}

// Contrôle pour les appareils qui peuvent être allumés/éteints
function DeviceToggle({ device, onDeviceUpdated }: DeviceControlProps) {
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDevice = async () => {
    setLoading(true);
    try {
      const response = await deviceService.toggleDevice(device.id, isOn);
      if (response.status === 'success' && response.data) {
        setIsOn(response.data.state);
        toast(`${device.name} a été ${response.data.state ? 'allumé' : 'éteint'}.`);
        if (onDeviceUpdated) onDeviceUpdated();
      }
    } catch (error) {
      console.error("Erreur lors du contrôle de l'appareil:", error);
      toast.error("Impossible de contrôler l'appareil. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Power className={`h-5 w-5 ${isOn ? 'text-primary' : 'text-muted-foreground'}`} />
        <span>{isOn ? 'Allumé' : 'Éteint'}</span>
      </div>
      <div className="flex items-center space-x-4">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Switch 
            checked={isOn} 
            onCheckedChange={() => toggleDevice()} 
            disabled={loading}
          />
        )}
      </div>
    </div>
  );
}

// Contrôle pour les thermostats
function DeviceThermostat({ device, onDeviceUpdated }: DeviceControlProps) {
  const [temperature, setTemperature] = useState(21); // Température par défaut
  const [loading, setLoading] = useState(false);

  const updateTemperature = async (newTemp: number) => {
    setLoading(true);
    try {
      const response = await deviceService.setTemperature(device.id, newTemp);
      if (response.status === 'success' && response.data) {
        setTemperature(response.data.temperature);
        toast(`${device.name} a été réglé à ${response.data.temperature}°C.`);
        if (onDeviceUpdated) onDeviceUpdated();
      }
    } catch (error) {
      console.error("Erreur lors du réglage de la température:", error);
      toast.error("Impossible de régler la température. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Thermometer className="h-5 w-5 text-primary" />
          <span>Température</span>
        </div>
        <div>
          <span className="text-xl font-semibold">{temperature}°C</span>
        </div>
      </div>
      <div className="px-2">
        <Slider 
          defaultValue={[temperature]} 
          min={10} 
          max={30} 
          step={0.5}
          onValueCommit={(value) => updateTemperature(value[0])}
          disabled={loading}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>10°C</span>
          <span>30°C</span>
        </div>
      </div>
      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

// Pour les appareils hors ligne
function DeviceOffline({ device }: { device: Device }) {
  return (
    <div className="text-center py-2">
      <p className="text-muted-foreground">
        Cet appareil est actuellement hors ligne et ne peut pas être contrôlé.
      </p>
    </div>
  );
}

// Pour les autres types d'appareils
function DeviceGeneric({ device }: { device: Device }) {
  return (
    <div className="text-center py-2">
      <p className="text-muted-foreground">
        Aucun contrôle spécifique n'est disponible pour ce type d'appareil.
      </p>
    </div>
  );
} 