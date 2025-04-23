import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { PublicDeviceType } from '@/services/devices.service';

interface SmokeDetectorCardProps {
  device: PublicDeviceType;
}

const SmokeDetectorCard: React.FC<SmokeDetectorCardProps> = ({ device }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-red-200 bg-gradient-to-br from-red-50 to-white">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-red-100">
        <div className="p-3 bg-red-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m8 16 2-6 2 6" />
            <path d="M12 10v4" />
            <path d="M2 12s2-6 10-6 10 6 10 6-2 6-10 6-10-6-10-6Z" />
            <path d="M5 18h1.5" />
            <path d="M17.5 18H19" />
          </svg>
        </div>
        <div>
          <CardTitle className="text-xl text-red-800">{device.name}</CardTitle>
          <CardDescription className="text-red-700">{device.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {device.capabilities.map((cap, idx) => (
            <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              {cap}
            </span>
          ))}
        </div>
        
        <div className="mb-5 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-2 border-4 border-green-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-700">AUCUNE ALERTE</div>
            <div className="text-sm text-green-600">Dernier test: il y a 7 jours</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-sm text-red-700 mb-1">Autonomie</div>
            <div className="font-bold text-red-800">94%</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-sm text-red-700 mb-1">Connectivité</div>
            <div className="font-bold text-red-800">Excellente</div>
            <div className="flex justify-center mt-1 space-x-0.5">
              <div className="w-1.5 h-3 bg-red-500 rounded-sm"></div>
              <div className="w-1.5 h-4 bg-red-500 rounded-sm"></div>
              <div className="w-1.5 h-5 bg-red-500 rounded-sm"></div>
              <div className="w-1.5 h-6 bg-red-500 rounded-sm"></div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-red-100 pt-4">
        <button className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors">
          Historique
        </button>
        <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
          Tester l'alarme
        </button>
      </CardFooter>
    </Card>
  );
};

export default SmokeDetectorCard; 