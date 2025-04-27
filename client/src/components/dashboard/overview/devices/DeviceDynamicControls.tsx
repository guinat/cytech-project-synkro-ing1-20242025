import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { sendDeviceCommand } from '@/services/devices.service';
import { Select as SelectShadcn, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button'; // Import du bouton

interface DeviceDynamicControlsProps {
  device: any;
  homeId: string;
  roomId: string;
  onStateUpdate: (newState: any) => void;
  cycle?: string; 
  delayStart?: number; 
  spinSpeed?: number;
  onOffTemps?: number;  // Nouvelle capacité "on/off_temps"
}

const DeviceDynamicControls: React.FC<DeviceDynamicControlsProps> = ({ device, homeId, roomId, onStateUpdate, cycle, delayStart, spinSpeed, onOffTemps }) => {
  const { id, state = {}, capabilities = [] } = device;

  const [localBrightness, setLocalBrightness] = React.useState<number>(state.brightness ?? 0);
  const [localTemperature, setLocalTemperature] = React.useState<number>(state.temperature ?? 20);
  const [localColor, setLocalColor] = React.useState<string>(state.color || '#ffffff');
  const [localMotionDetection, setLocalMotionDetection] = React.useState<string>(state.motion_detection ?? "Regular");
  const [localCycle, setLocalCycle] = React.useState<string>(cycle ?? 'Normal'); 
  const [localDelayStart, setLocalDelayStart] = React.useState<number>(delayStart ?? 0); 
  const [localSpinSpeed, setLocalSpinSpeed] = React.useState<number>(spinSpeed ?? 1000); 
  const [localOnOffTemps, setLocalOnOffTemps] = React.useState<number>(onOffTemps ?? 0);  // Temps de délai

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

  // Fonction pour envoyer la commande au serveur
  const handleSendCommand = async (capability: string, value: any) => {
    try {
      toast.error(`Envoi de la commande : ${capability} avec la valeur`, value);
      await sendDeviceCommand(homeId, roomId, id, capability, { [capability]: value });
      toast.success(`Commande envoyée: ${capability}`);
      onStateUpdate({ ...state, [capability]: value });
    } catch (e: any) {
      console.error('Erreur lors de l\'envoi de la commande', capability, e);
      toast.error(`Erreur commande: ${capability} - ${e?.message || ''}`);
    }
  };

  // Fonction de validation
  const handleValidate = async () => {
    if (localOnOffTemps === 0) {
      // Si onOffTemps est à 0, lance immédiatement l'appareil et le met en "ON"
      await handleSendCommand('on_off', true);  // Met l'appareil en "ON"
      toast.success("L'appareil est maintenant allumé.");
    } else {
      // Si onOffTemps est supérieur à 0, met l'appareil en "Prévu"
      toast.success(`Démarrage prévu dans ${localOnOffTemps} minutes.`);
      // Tu peux ici également gérer un timer pour démarrer l'appareil après un délai
    }
  };

  return (
    <div className="space-y-4">
      {/* On/Off Switch */}
      {capabilities.includes('on_off') && (
        <div className="flex items-center gap-2">
          <span>On/Off</span>
          <Switch
            checked={!!state.on_off}
            onCheckedChange={(checked) => handleSendCommand('on_off', checked)}
          />
        </div>
      )}

      {/* Cycle Selection */}
      {capabilities.includes('cycle_selection') && (
        <div>
          <span>Cycle Selection</span>
          <SelectShadcn
            value={localCycle}
            onValueChange={(v) => {
              setLocalCycle(v);
              handleSendCommand('cycle_selection', v);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Quick">Quick</SelectItem>
              <SelectItem value="Eco">Eco</SelectItem>
            </SelectContent>
          </SelectShadcn>
        </div>
      )}

      {/* Spin Speed Control */}
      {capabilities.includes('spin_speed_control') && (
        <div>
          <span>Spin Speed (RPM)</span>
          <div className="flex justify-between text-xs">
            <span>0</span>
            <span>1000</span>
            <span>2000</span>
          </div>
          <Slider
            min={500}
            max={2000}
            value={[localSpinSpeed]}
            onValueChange={([v]) => setLocalSpinSpeed(v)}
            onValueCommit={([v]) => handleSendCommand('spin_speed_control', v)}
          />
          <div className="text-center text-sm mt-2">Spin Speed: {localSpinSpeed} RPM</div>
        </div>
      )}

      
        


    </div>
  );
};

export default DeviceDynamicControls;
