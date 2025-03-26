import React, { useState, useEffect } from 'react';
import { Lamp, Sun, Moon, Power, Settings } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Slider
} from "@/components/ui/slider";
import {
  Switch
} from "@/components/ui/switch";
import {StatusBadge} from './status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Composant simplifié avec fonctionnalité de changement de couleur
export default function LampCard({
  name = "Lamp1",
  dialogTitle = `Paramètres de : ${name}`,
  dialogDescription = "Ajustez les paramètres de votre lampe",
  initialBgColor = "bg-white",
  initialDarkBgColor = "dark:bg-slate-800",
  className = ""
}: {
  name?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  initialBgColor?: string;
  initialDarkBgColor?: string;
  className?: string;
}) {
  // définition des hooks
  const [isOn, setIsOn] = useState(true);
  const [brightness, setBrightness] = useState(75);
  const [isAnimating, setIsAnimating] = useState(false);
  const [bgColor, setBgColor] = useState(initialBgColor);
  const [darkBgColor, setDarkBgColor] = useState(initialDarkBgColor);
  const [colorSelection, setColorSelection] = useState("white");
  
  // Fonction pour gérer le changement d'état avec animation --> ClaudeAI
  const handleStateChange = (newState: boolean | ((prevState: boolean) => boolean)) => {
    setIsOn(newState);
    
    // Déclencher l'animation
    setIsAnimating(true);
    
    // Réinitialiser l'animation après qu'elle soit terminée
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Durée légèrement plus longue que l'animation pour s'assurer qu'elle se termine
  };
  
  // fonction raccordé au changement de couleur
  const handleColorChange = (color: React.SetStateAction<string>) => {
    setColorSelection(color);
    
    switch (color) {
      case "yellow":
        setBgColor("bg-amber-100");
        setDarkBgColor("dark:bg-amber-900");
        break;
      case "blue":
        setBgColor("bg-blue-100");
        setDarkBgColor("dark:bg-blue-900");
        break;
      case "green":
        setBgColor("bg-green-100");
        setDarkBgColor("dark:bg-green-900");
        break;
      case "red":
        setBgColor("bg-red-100");
        setDarkBgColor("dark:bg-red-900");
        break;
      case "purple":
        setBgColor("bg-purple-100");
        setDarkBgColor("dark:bg-purple-900");
        break;
      default:
        setBgColor("bg-white");
        setDarkBgColor("dark:bg-slate-800");
    }
  };
  
  return (
    <Card 
      className={`aspect-square w-64 max-w-full ${bgColor} shadow-md ${darkBgColor} transition-all duration-300 ${
        isAnimating ? 'translate-y-1.5' : ''
      } ${className}`}
    >
      <CardHeader className="relative pb-2">
        <CardDescription className="flex items-center gap-2">
          <Lamp className="size-4" />
          <span>{isOn ? 'On' : 'Off'}</span>
        </CardDescription>
        <CardTitle className="text-xl font-semibold">
          {name}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${isOn ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
            {isOn ? <StatusBadge
              variant="success"
              text="Active"
              position="inline"
              pulse={true}
            /> : <StatusBadge
              text="Inactive"
              position="inline"
              pulse={false}
              variant="error"
            />}
          </Badge>
        </div>
      </CardHeader>
      
      <div className="px-6 py-2">
        <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Power className="size-4" />
            <span className="font-medium">Power</span>
          </div>
          <Switch
            checked={isOn}
            onCheckedChange={handleStateChange}
          />
        </div>
      </div>
      
      <CardFooter className="flex items-center justify-between pb-4 pt-2 text-sm">
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex justify-center">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Settings className="size-4" />
              </Button>
            </div>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                {dialogDescription}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="size-4" />
                <span className="text-sm">Brightness</span>
              </div>
              <span className="font-medium tabular-nums">{brightness}%</span>
            </div>
              
            {/* barre de progression pour ajuster la luminosité de la lumière */}
            <Slider
              disabled={!isOn} //pour que on puisse gérer la luminosité que si la lampe est allumée
              value={[brightness]}
              min={0}
              max={100}
              step={1}
              className="mb-6"
              onValueChange={(value) => setBrightness(value[0])}
            />
    
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Choose Light Color</Label>
                <RadioGroup 
                  value={colorSelection}
                  onValueChange={handleColorChange}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="white" id="white" />
                    <Label htmlFor="white" className="cursor-pointer">White</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yellow" id="yellow" />
                    <Label htmlFor="yellow" className="cursor-pointer">Yellow</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blue" id="blue" />
                    <Label htmlFor="blue" className="cursor-pointer">Blue</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="green" id="green" />
                    <Label htmlFor="green" className="cursor-pointer">Green</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="red" id="red" />
                    <Label htmlFor="red" className="cursor-pointer">Red</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="purple" id="purple" />
                    <Label htmlFor="purple" className="cursor-pointer">Purple</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}