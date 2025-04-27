import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { sendDeviceCommand } from '@/services/devices.service';
import { Select } from 'react-day-picker';
import { Select as SelectShadcn, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface DeviceDynamicControlsProps {
  device: any;
  homeId: string;
  roomId: string;
  onStateUpdate: (newState: any) => void;
}

export const capabilityLabels: Record<string, string> = {
  on_off: 'On/Off',
  brightness: 'Brightness',
  color: 'Color',
  temperature: 'Temperature',
  motion_detection: 'Motion Detection',
};

const DeviceDynamicControls: React.FC<DeviceDynamicControlsProps> = ({ device, homeId, roomId, onStateUpdate }) => {
  const { id, state = {}, capabilities = [] } = device;

  const [localBrightness, setLocalBrightness] = React.useState<number>(state.brightness ?? 0);
  const [localTemperature, setLocalTemperature] = React.useState<number>(state.temperature ?? 20);
  const [localColor, setLocalColor] = React.useState<string>(state.color || '#ffffff');
  const [localMotionDetection, setLocalMotionDetection] = React.useState<string>(state.motion_detection ?? "Regular");

  React.useEffect(() => {
    setLocalBrightness(state.brightness ?? 0);
  }, [state.brightness]);
  React.useEffect(() => {
    setLocalTemperature(state.temperature ?? 20);
  }, [state.temperature]);
  React.useEffect(() => {
    setLocalColor(state.color || '#ffffff');
  }, [state.color]);
  React.useEffect(() => {
    setLocalMotionDetection(state.motion_detection || 'Regular');
  }, [state.motion_detection]);

  

  

  const handleSendCommand = async (capability: string, value: any) => {
    try {
      await sendDeviceCommand(homeId, roomId, id, capability, { [capability]: value });
      toast.success(`Commande envoyée: ${capability}`);
      onStateUpdate({ ...state, [capability]: value });
      
    } catch (e: any) {
      console.error('Erreur lors de l\'envoi de la commande', capability, e);
      toast.error(`Erreur commande: ${capability} - ${e?.message || ''}`);
    }
  };

  return (
    <div className="space-y-4">
      {capabilities.includes('on_off') && (
        <div className="flex items-center gap-2">
          <span>On/Off</span>
          <Switch
            checked={!!state.on_off}
            onCheckedChange={(checked) => handleSendCommand('on_off', checked) }
          />
        </div>
      )}
      {capabilities.includes('brightness') && (
        <div>
          <span>Brightness</span>
          <Slider
            min={0}
            max={100}
            value={[localBrightness]}
            onValueChange={([v]) => setLocalBrightness(v)}
            onValueCommit={([v]) => handleSendCommand('brightness', v)}
          />
        </div>
      )}
      {capabilities.includes('color') && (
        <div>
          <span>Color</span>
          <input
            type="color"
            value={localColor}
            onChange={e => setLocalColor(e.target.value)}
            onBlur={e => handleSendCommand('color', localColor)}
            style={{ width: 40, height: 30, border: 'none', background: 'none' }}
          />
        </div>
      )}
      {capabilities.includes('temperature') && (
        <div>
          <span>Temperature</span>
          <Slider
            min={10}
            max={35}
            value={[localTemperature]}
            onValueChange={([v]) => setLocalTemperature(v)}
            onValueCommit={([v]) => handleSendCommand('temperature', v)}
          />
        </div>
      )}
      {capabilities.includes('motion_detection') && (
        <div>
          <span>Motion Detection</span>           
          <SelectShadcn 
              value={localMotionDetection} 
              onValueChange={(v) => {
                setLocalMotionDetection(v);
                handleSendCommand("motion_detection", v);
              }}
            >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select it" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Low</SelectItem>
              <SelectItem value="dark">Regular</SelectItem>
              <SelectItem value="system">Strong</SelectItem>
            </SelectContent>
          </SelectShadcn>
          
        </div>
      )}

    </div>
  );
};

export default DeviceDynamicControls;
