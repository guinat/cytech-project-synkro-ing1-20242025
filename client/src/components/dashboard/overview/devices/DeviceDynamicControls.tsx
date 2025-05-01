import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { sendDeviceCommand, getDevice } from '@/services/devices.service';
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


export const capabilityLabels: Record<string, string> = {
  on_off: 'On/Off',
  brightness: 'Brightness',
  color: 'Color',
  temperature: 'Temperature',
  position: 'Position',
  heat: 'Heat',
  channel: 'Channel',
  volume: 'Volume',
  mode: 'Mode',
  trackIndex: 'Track Index'
};

const DeviceDynamicControls: React.FC<DeviceDynamicControlsProps> = ({ device, homeId, roomId, onStateUpdate, cycle, delayStart, spinSpeed, onOffTemps }) => {
  const { id, state = {}, capabilities = [] } = device;

  const [localBrightness, setLocalBrightness] = React.useState<number>(state.brightness ?? 0);
  const [localTemperature, setLocalTemperature] = React.useState<number>(state.temperature ?? 20);
  const [localColor, setLocalColor] = React.useState<string>(state.color || '#ffffff');
  const [localPosition, setLocalPosition] = React.useState<number>(state.position ?? 0);
  const [localChannel, setLocalChannel] = React.useState<string>(state.channel ? String(state.channel) : '1');
  const [localVolume, setLocalVolume] = React.useState<number>(typeof state.volume === 'number' ? state.volume : 50);
  const [localHeat, setLocalHeat] = React.useState<number>(state.heat ?? 100);
  const [localFridgeMode, setLocalFridgeMode] = React.useState<string>(state.mode ?? 'normal');
  const [localTrackIndex, setLocalTrackIndex] = React.useState<number>(state.trackIndex ?? 0);
  const [localCycle, setLocalCycle] = React.useState<string>(cycle ?? 'Normal'); 
  const [localDelayStart, setLocalDelayStart] = React.useState<number>(delayStart ?? 0); 
  const [localSpinSpeed, setLocalSpinSpeed] = React.useState<number>(state.spin_speed_control ?? 1000); 
  const [localOnOffTemps, setLocalOnOffTemps] = React.useState<number>(onOffTemps ?? 0);  // Temps de délai


  React.useEffect(() => {
    setLocalChannel(state.channel ? String(state.channel) : '1');
  }, [state.channel]);

  React.useEffect(() => {
    setLocalFridgeMode(state.mode ?? 'normal');
  }, [state.mode]);
  React.useEffect(() => {
    setLocalVolume(typeof state.volume === 'number' ? state.volume : 50);
  }, [state.volume]);
  React.useEffect(() => {
    setLocalTrackIndex(typeof state.trackIndex === 'number' ? state.trackIndex : 0);
  }, [state.trackIndex]);  const [localMotionDetection, setLocalMotionDetection] = React.useState<string>(state.motion_detection ?? "Regular");
  
  React.useEffect(() => {
    setLocalBrightness(state.brightness ?? 0);
  }, [state.brightness]);
  React.useEffect(() => {
    setLocalSpinSpeed(state.spin_speed_control ?? 1000);
  }, [state.spin_speed_control]);
  React.useEffect(() => {
    setLocalTemperature(state.temperature ?? 20);
  }, [state.temperature]);
  React.useEffect(() => {
    setLocalColor(state.color || '#ffffff');
  }, [state.color]);
  React.useEffect(() => {
    setLocalPosition(state.position ?? 0);
  }, [state.position]);
  React.useEffect(() => {
    setLocalHeat(state.heat ?? 100);
  }, [state.heat]);
  React.useEffect(() => {
    setLocalMotionDetection(state.motion_detection || 'Regular');
  }, [state.motion_detection]);

  // Fonction pour envoyer la commande au serveur
  const handleSendCommand = async (capability: string, value: any) => {
    try {
      toast.error(`Envoi de la commande : ${capability} avec la valeur`, value);
      await sendDeviceCommand(homeId, roomId, id, capability, { [capability]: value });
      toast.success(`Commande envoyée: ${capability}`); // Désactivé pour ne pas spammer de notifications
      // Récupère le device à jour depuis l'API après la commande
      const updatedDevice = await getDevice(homeId, roomId, id);
      // Compatibilité : certains Device n'ont pas la propriété 'state'
      onStateUpdate((updatedDevice as any).state ?? updatedDevice ?? {});
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

  // Cas spécial : volets (shutter) avec on_off + position synchronisés
  if (capabilities.includes('on_off') && capabilities.includes('position')) {
    // Le switch est on si position à 100, off sinon
    const isOn = localPosition === 100;
    const handleToggle = async (checked: boolean) => {
      const newPosition = checked ? 100 : 0;
      await handleSendCommand('position', newPosition);
      await handleSendCommand('on_off', checked);
    };
    const handleSliderCommit = async ([v]: [number]) => {
      await handleSendCommand('position', v);
      if (v === 100) {
        await handleSendCommand('on_off', true);
      } else {
        await handleSendCommand('on_off', false);
      }
    };


    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span>On/Off</span>
          <Switch
            checked={isOn}
            onCheckedChange={handleToggle}
          />
        </div>
        <div>
          <span>Position</span>
          <Slider
            min={0}
            max={100}
            value={[localPosition]}
            onValueChange={([v]) => {
              setLocalPosition(v);
            }}
            onValueCommit={([v]) => {
              handleSliderCommit([v]);
            }}
          />
        </div>
      </div>
    );
  }


  // Contrôle spécial pour smart_speaker_x
  if (device.type === 'smart_speaker_x') {
    // Playlist locale (exemple)
    const playlist = [
      'Imagine Dragons - Believer',
      'Daft Punk - Get Lucky',
      'Queen - Bohemian Rhapsody',
      'The Weeknd - Blinding Lights',
      'Kanye West - Devil in A New Dress',
    ];
    // Index courant dans la playlist (stocké dans le state)
    const currentTrackIndex = typeof state.trackIndex === 'number' ? state.trackIndex : 0;
    const [localTrackIndex, setLocalTrackIndex] = React.useState(currentTrackIndex);
    React.useEffect(() => {
      setLocalTrackIndex(currentTrackIndex);
    }, [currentTrackIndex]);

    const handleNext = () => {
      const nextIndex = (localTrackIndex + 1) % playlist.length;
      setLocalTrackIndex(nextIndex);
      handleSendCommand('trackIndex', nextIndex);
    };
    const handlePrev = () => {
      const prevIndex = (localTrackIndex - 1 + playlist.length) % playlist.length;
      setLocalTrackIndex(prevIndex);
      handleSendCommand('trackIndex', prevIndex);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span>On/Off</span>
          <Switch
            checked={!!state.on_off}
            onCheckedChange={(checked) => handleSendCommand('on_off', checked)}
          />
        </div>
        <div>
          <span>Volume</span>
          <Slider
            min={0}
            max={100}
            value={[localVolume]}
            onValueChange={([v]) => setLocalVolume(v)}
            onValueCommit={([v]) => handleSendCommand('volume', v)}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            className="px-3 py-1 rounded bg-muted border hover:bg-primary/10"
            onClick={handlePrev}
            type="button"
          >
            Previous Track
          </button>
          <span className="font-semibold text-base mx-2">{playlist[localTrackIndex]}</span>
          <button
            className="px-3 py-1 rounded bg-muted border hover:bg-primary/10"
            onClick={handleNext}
            type="button"
          >
            Next Track
          </button>
        </div>
      </div>
    );
  }


  
  // Cas générique pour tous les autres devices
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
      {capabilities.includes('heat') && (
        <div>
          <span>Heat</span>
          <Slider
            min={50}
            max={250}
            step={1}
            value={[localHeat]}
            onValueChange={([v]) => setLocalHeat(v)}
            onValueCommit={([v]) => handleSendCommand('heat', v)}
          />
          <span className="ml-2">{localHeat}°C</span>
        </div>
      )}
      {capabilities.includes('mode') && (
        <div className="mt-2">
          <span>Mode</span>
          <select
            className="ml-2 px-2 py-1 rounded border"
            value={localFridgeMode}
            onChange={e => {
              setLocalFridgeMode(e.target.value);
              handleSendCommand('mode', e.target.value);
            }}
          >
            <option value="normal">Normal</option>
            <option value="eco">Eco</option>
          </select>
          <span className="ml-2">{localFridgeMode === 'eco' ? 'Eco mode (économie d\'énergie)' : 'Mode normal'}</span>
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
            <span>500</span>
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
      
      {capabilities.includes('brightness') && (
        <div>
          <span>Brightness</span>
          <div className="flex justify-between text-xs">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          <Slider
            min={0}
            max={100}
            value={[localBrightness]}
            onValueChange={([v]) => setLocalBrightness(v)}
            onValueCommit={([v]) => handleSendCommand('brightness', v)}
          />
          <div className="text-center text-sm mt-2">Brightness: {localBrightness}%</div>
        </div>
      )}
      {capabilities.includes('volume') && (
        <div>
          <span>Volume</span>
          <Slider
            min={0}
            max={100}
            value={[localVolume]}
            onValueChange={([v]) => setLocalVolume(v)}
            onValueCommit={([v]) => handleSendCommand('volume', v)}
          />
          <span className="ml-2">{localVolume}</span>
        </div>
      )}
      {capabilities.includes('color') && (
        <div>
          <span>Color</span>
          <input
            type="color"
            value={localColor}
            onChange={e => setLocalColor(e.target.value)}
            onBlur={() => handleSendCommand('color', localColor)}
            style={{ width: 40, height: 30, border: 'none', background: 'none' }}
          />
        </div>
      )}
      {capabilities.includes('temperature') && (
        <div>
          <span>Temperature</span>
          <div className="flex justify-between text-xs">
            <span>0</span>
            <span>100</span>
    
          </div>
          <Slider
            min={0}
            max={100}
            value={[localTemperature]}
            onValueChange={([v]) => setLocalTemperature(v)}
            onValueCommit={([v]) => handleSendCommand('temperature', v)}
          />
          <div className="text-center text-sm mt-2">Temperature: {localTemperature} °C</div>
        </div>
      )}

      {/* Contrôle spécial pour la télévision : channel (1-64) */}
      {capabilities.includes('channel') && (
        <div className="flex items-center gap-2">
          <span>Channel</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{1,2}"
            maxLength={2}
            className="border rounded w-12 text-center"
            value={localChannel}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 64)) {
                setLocalChannel(val);
              }
            }}
          />
          <button
            className="ml-2 px-2 py-1 bg-primary text-white rounded disabled:opacity-50"
            disabled={localChannel === '' || parseInt(localChannel) < 1 || parseInt(localChannel) > 64 || parseInt(localChannel) === (state.channel || 1)}
            onClick={() => handleSendCommand('channel', parseInt(localChannel))}
            type="button"
          >
            Valider
          </button>
        </div>
      )}

    </div>
  );
};

export default DeviceDynamicControls;
