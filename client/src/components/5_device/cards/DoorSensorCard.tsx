import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { PublicDeviceType } from '@/services/devices.service';

interface DoorSensorCardProps {
  device: PublicDeviceType;
}

const DoorSensorCard: React.FC<DoorSensorCardProps> = ({ device }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-purple-100">
        <div className="p-3 bg-purple-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M7 9h10" />
            <path d="M7 15h10" />
            <path d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" />
            <path d="M4 22V7" />
            <path d="M20 22V7" />
          </svg>
        </div>
        <div>
          <CardTitle className="text-xl text-purple-800">{device.name}</CardTitle>
          <CardDescription className="text-purple-700">{device.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {device.capabilities.map((cap, idx) => (
            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              {cap}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex-1 text-center p-4 bg-green-100 rounded-lg mr-2">
            <div className="text-sm text-green-700 font-medium mb-1">État de la porte</div>
            <div className="text-xl font-bold text-green-700">FERMÉE</div>
          </div>
          <div className="flex-1 text-center p-4 bg-purple-100 rounded-lg">
            <div className="text-sm text-purple-700 font-medium mb-1">Batterie</div>
            <div className="text-xl font-bold text-purple-700">85%</div>
          </div>
        </div>
        
        <div className="mb-1">
          <h4 className="text-sm font-medium text-purple-800 mb-2">Activité récente</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md">
              <span className="text-purple-700">Fermée</span>
              <span className="text-purple-500 text-xs">il y a 1h 32m</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md">
              <span className="text-purple-700">Ouverte</span>
              <span className="text-purple-500 text-xs">il y a 1h 35m</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md">
              <span className="text-purple-700">Fermée</span>
              <span className="text-purple-500 text-xs">il y a 8h 12m</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-purple-100 pt-4">
        <button className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors">
          Historique
        </button>
        <button className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
          Notifications
        </button>
      </CardFooter>
    </Card>
  );
};

export default DoorSensorCard; 