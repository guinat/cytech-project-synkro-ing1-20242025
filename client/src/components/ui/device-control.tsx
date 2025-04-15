import { useState } from "react";
import { Device } from "@/services/device.service";
import deviceService from "@/services/device.service";
import { useDevices } from "@/context/DevicesContext";
import { Button } from "./button";
import { Slider } from "./slider";
import { Switch } from "./switch";
import { toast } from "sonner";
import { Power, Thermometer, Loader2 } from "lucide-react";

interface DeviceControlProps {
  device: Device;
  onDeviceUpdated?: () => void; // Callback after device update
}

// Main component to control a device
export function DeviceControl({ device, onDeviceUpdated }: DeviceControlProps) {
  // Determine which control to display based on device type
  const renderDeviceControl = () => {
    // If the device is offline, show it as unavailable
    if (device.status !== 'online') {
      return <DeviceOffline device={device} />;
    }

    // Determine the type of control based on device type
    if (device.device_type_name === 'Smart Light' || 
        device.device_type_name === 'Smart Plug') {
      return <DeviceToggle device={device} onDeviceUpdated={onDeviceUpdated} />;
    } else if (device.device_type_name === 'Smart Thermostat') {
      return <DeviceThermostat device={device} onDeviceUpdated={onDeviceUpdated} />;
    } else {
      // For other device types, show a generic control
      return <DeviceGeneric device={device} />;
    }
  };

  return (
    <div className="mt-4 border rounded-md p-4">
      <h3 className="text-sm font-medium mb-4">Controls</h3>
      {renderDeviceControl()}
    </div>
  );
}

// Control for devices that can be turned on/off
function DeviceToggle({ device, onDeviceUpdated }: DeviceControlProps) {
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateDeviceStatus } = useDevices();

  const toggleDevice = async () => {
    setLoading(true);
    try {
      // Call API to toggle the state
      const response = await deviceService.toggleDevice(device.id, isOn);
      
      if (response.status === 'success' && response.data) {
        // Update local state
        setIsOn(response.data.state);
        
        // Update device status (simulate connection)
        await updateDeviceStatus(device.id, 'online');
        
        toast(`${device.name} has been ${response.data.state ? 'turned on' : 'turned off'}.`);
        
        // Call the callback if provided
        if (onDeviceUpdated) onDeviceUpdated();
      }
    } catch (error) {
      console.error("Error controlling the device:", error);
      toast.error("Unable to control the device. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Power className={`h-5 w-5 ${isOn ? 'text-primary' : 'text-muted-foreground'}`} />
        <span>{isOn ? 'On' : 'Off'}</span>
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

// Control for thermostats
function DeviceThermostat({ device, onDeviceUpdated }: DeviceControlProps) {
  const [temperature, setTemperature] = useState(21); // Default temperature
  const [loading, setLoading] = useState(false);
  const { updateDeviceStatus } = useDevices();

  const updateTemperature = async (newTemp: number) => {
    setLoading(true);
    try {
      const response = await deviceService.setTemperature(device.id, newTemp);
      if (response.status === 'success' && response.data) {
        // Update local temperature
        setTemperature(response.data.temperature);
        
        // Update device status (simulate connection)
        await updateDeviceStatus(device.id, 'online');
        
        toast(`${device.name} has been set to ${response.data.temperature}°C.`);
        
        // Call the callback if provided
        if (onDeviceUpdated) onDeviceUpdated();
      }
    } catch (error) {
      console.error("Error setting temperature:", error);
      toast.error("Unable to set temperature. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Thermometer className="h-5 w-5 text-primary" />
          <span>Temperature</span>
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

// For offline devices
function DeviceOffline({ device }: { device: Device }) {
  return (
    <div className="text-center py-2">
      <p className="text-muted-foreground">
        This device is currently offline and cannot be controlled.
      </p>
    </div>
  );
}

// For other device types
function DeviceGeneric({ device }: { device: Device }) {
  return (
    <div className="text-center py-2">
      <p className="text-muted-foreground">
        No specific controls are available for this device type.
      </p>
    </div>
  );
} 