import React, { useState, useRef, useEffect } from 'react';
import { CookingPot } from 'lucide-react';
import {
  Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from '@/components/ui/status-badge';
import type { PublicDeviceType } from '@/services/devices.service';

interface DishWasherCardProps {
  device: PublicDeviceType;
}

const DishWasherCard: React.FC<DishWasherCardProps> = ({ device }) => {
  const [isOn, setIsOn] = useState(true);
  const [activityStatus, setActivityStatus] = useState<"nothing" | "washing" | "drying" | "scheduled">("nothing");
  const [delayHour, setDelayHour] = useState(0);
  const [delayMinute, setDelayMinute] = useState(0);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [halfLoad, setHalfLoad] = useState(false);
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
      setActivityStatus("scheduled");
      setDialogOpen(false);
      timeoutRef.current = setTimeout(() => {
        setActivityStatus("washing");
        timeoutRef.current = null;
      }, totalDelayMs);
    } else {
      setActivityStatus("washing");
      setDialogOpen(false);
    }
  };

  const renderStatus = () => {
    switch (activityStatus) {
      case "washing": return "En route";
      case "drying": return "Séchage";
      case "scheduled": return "Prévu";
      default: return "Inactif";
    }
  };

  const badgeVariant = () => {
    switch (activityStatus) {
      case "washing": return "success";
      case "drying": return "success";
      case "scheduled": return "warning";
      default: return "error";
    }
  };

  useEffect(() => {
    const durations: { [key: string]: number } = {
      "Intensif": 120,
      "Automatique": 90,
      "Rapide Express": 30,
      "Eco": 150,
      "Silencieux/Nuit": 180,
      "Rincage": 15,
      "Cycle Doux": 60
    };
    setEstimatedDuration(durations[selectedCycle] || 0);
  }, [selectedCycle]);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-blue-200 bg-gradient-to-br from-sky-50 to-white w-80">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-blue-100">
        <div className="p-3 bg-blue-100 rounded-full">
          <CookingPot className="h-8 w-8 text-blue-500" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl text-blue-800">{device.name}</CardTitle>
          <CardDescription className="text-blue-700">État : <span className="font-medium">{renderStatus()}</span></CardDescription>
        </div>
        <StatusBadge text={renderStatus()} position="inline" pulse={activityStatus !== "nothing"} variant={badgeVariant()} />
      </CardHeader>

      <CardContent className="pt-4 space-y-3 text-sm">
        {(delayHour > 0 || delayMinute > 0) && (
          <div className="text-yellow-600 dark:text-yellow-300">
            ⏰ Départ dans {delayHour}h {delayMinute}min
          </div>
        )}
        {estimatedDuration > 0 && (
          <div className="text-muted-foreground">
            ⏱️ Durée estimée : {estimatedDuration} minutes
          </div>
        )}
        {halfLoad && <div>🔄 Mode demi-charge activé</div>}
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-blue-100 pt-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-blue-800 border-blue-300" variant="outline" size="sm">
              Configurer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paramètres du Lave-vaisselle</DialogTitle>
              <DialogDescription>Ajustez le lancement et le cycle</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div>
                <Label>Lancement dans :</Label>
                <div className="flex gap-2 items-center">
                  <div>
                    <Label>Heures</Label>
                    <Input type="number" value={delayHour} onChange={(e) => setDelayHour(Math.max(0, Math.min(23, Number(e.target.value))))} disabled={!isOn} />
                  </div>
                  <div>
                    <Label>Minutes</Label>
                    <Input type="number" value={delayMinute} onChange={(e) => setDelayMinute(Math.max(0, Math.min(59, Number(e.target.value))))} disabled={!isOn} />
                  </div>
                </div>
              </div>

              <div>
                <Label>Cycle</Label>
                <RadioGroup value={selectedCycle} onValueChange={setSelectedCycle} className="grid grid-cols-2 gap-2">
                  {["Intensif", "Automatique", "Rapide Express", "Eco", "Silencieux/Nuit", "Rincage", "Cycle Doux"].map((cycle) => (
                    <div key={cycle} className="flex items-center space-x-2">
                      <RadioGroupItem value={cycle} id={cycle} />
                      <Label htmlFor={cycle}>{cycle}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="halfLoad" checked={halfLoad} onChange={(e) => setHalfLoad(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600" />
                <Label htmlFor="halfLoad">Mode demi-charge</Label>
              </div>

              <Button onClick={startActivity} disabled={!isOn} variant="default" className="w-full">
                {activityStatus === "scheduled" ? "Décaler le départ" : "Lancer l'activité"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={() => setIsOn(!isOn)}
          className={`text-white ${isOn ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 hover:bg-gray-500"}`}
          size="sm"
        >
          {isOn ? "Éteindre" : "Allumer"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DishWasherCard;
