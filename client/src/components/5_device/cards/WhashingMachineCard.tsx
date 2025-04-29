import React, { useState, useRef, useEffect } from 'react';
import { WashingMachine, Settings } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import type { PublicDeviceType } from '@/services/devices.service';

interface WashingMachineCardProps {
  device: PublicDeviceType;
}

const WashingMachineCard: React.FC<WashingMachineCardProps> = ({ device }) => {
  const [isOn, setIsOn] = useState(true);
  const [activityStatus, setActivityStatus] = useState<"nothing" | "washing" | "drying" | "scheduled">("nothing");
  const [delayHour, setDelayHour] = useState(0);
  const [delayMinute, setDelayMinute] = useState(0);
  const [selectedTemperature, setSelectedTemperature] = useState(30);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllScheduledActivities = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startActivity = () => {
    clearAllScheduledActivities();
    const totalDelayMs = (delayHour * 60 + delayMinute) * 60 * 1000;

    if (totalDelayMs > 0) {
      const startTime = new Date().getTime() + totalDelayMs;
      const startDate = new Date(startTime);
      console.log(`L'activité démarrera à : ${startDate.toLocaleString()}`);
      setActivityStatus("scheduled");
      setDialogOpen(false);

      timeoutRef.current = setTimeout(() => {
        setActivityStatus("washing");
        console.log("L'activité a commencé.");
        timeoutRef.current = null;
      }, totalDelayMs);
    } else {
      setActivityStatus("washing");
      console.log("L'activité a commencé immédiatement.");
      setDialogOpen(false);
    }
  };

  const renderStatus = () => {
    if (activityStatus === "washing") return "En route";
    if (activityStatus === "drying") return "Séchage";
    if (activityStatus === "scheduled") return "Prévu";
    return "Inactif";
  };

  const badgeColor = () => {
    switch (activityStatus) {
      case "washing":
      case "drying":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    }
  };

  const badgeVariant = () => {
    switch (activityStatus) {
      case "washing":
      case "drying":
        return "success";
      case "scheduled":
        return "warning";
      default:
        return "error";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-blue-200 bg-gradient-to-br from-sky-50 to-white w-80">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-blue-100">
        <div className="p-3 bg-blue-100 rounded-full">
          <WashingMachine className="h-8 w-8 text-blue-500" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl text-blue-800">{device.name}</CardTitle>
          <CardDescription className="text-blue-700">{isOn ? "En marche" : "Éteinte"}</CardDescription>
        </div>
        <StatusBadge text={renderStatus()} position="inline" pulse={activityStatus !== "nothing"} variant={badgeVariant()} />
      </CardHeader>

      <CardContent className="pt-4 space-y-3 text-sm">
        {(delayHour > 0 || delayMinute > 0) && (
          <div className="text-yellow-600 dark:text-yellow-300">
            ⏰ Départ prévu dans {delayHour}h {delayMinute}min
          </div>
        )}
        {selectedTemperature && (
          <div className="text-muted-foreground">
            🌡️ Température : {selectedTemperature}°C
          </div>
        )}
        {selectedCycle && (
          <div className="text-muted-foreground">
            🔄 Cycle sélectionné : {selectedCycle}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-blue-100 pt-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-blue-800 border-blue-300">
              <Settings className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paramètres de {device.name}</DialogTitle>
              <DialogDescription>Ajustez les paramètres de votre machine à laver</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Lancement dans : Heures et Minutes */}
              <div className="flex gap-2 items-center">
                <Label>Lancement dans :</Label>
                <div className="flex flex-col">
                  <span className="text-sm">Heures</span>
                  <Input
                    type="number"
                    value={delayHour}
                    onChange={(e) => setDelayHour(Math.max(0, Math.min(23, parseInt(e.target.value))))}
                    min={0}
                    max={23}
                    disabled={!isOn}
                  />
                </div>
                <span>:</span>
                <div className="flex flex-col">
                  <span className="text-sm">Minutes</span>
                  <Input
                    type="number"
                    value={delayMinute}
                    onChange={(e) => setDelayMinute(Math.max(0, Math.min(59, parseInt(e.target.value))))}
                    min={0}
                    max={59}
                    disabled={!isOn}
                  />
                </div>
              </div>

              {/* Température */}
              <div>
                <Label>Température (°C)</Label>
                <Slider
                  value={[selectedTemperature]}
                  onValueChange={(value) => setSelectedTemperature(value[0])}
                  min={30}
                  max={90}
                  step={5}
                  disabled={!isOn}
                />
                <span>{selectedTemperature}°C</span>
              </div>

              {/* Cycles */}
              <div>
                <Label>Choisir le cycle</Label>
                <RadioGroup
                  value={selectedCycle}
                  onValueChange={setSelectedCycle}
                  className="grid grid-cols-2 gap-4"
                  disabled={!isOn}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delicate" id="delicate" />
                    <Label htmlFor="delicate">Délicat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quick" id="quick" />
                    <Label htmlFor="quick">Rapide</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Eco" id="Eco" />
                    <Label htmlFor="Eco">Eco</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={startActivity} disabled={!isOn} variant="outline">
                {activityStatus === "scheduled" ? "Décaler le départ" : "Lancer l'activité"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default WashingMachineCard;
