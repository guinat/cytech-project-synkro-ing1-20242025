import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { PublicDeviceType } from '@/services/devices.service';

interface SmartPlugCardProps {
  device: PublicDeviceType;
}

const SmartPlugCard: React.FC<SmartPlugCardProps> = ({ device }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-emerald-100">
        <div className="p-3 bg-emerald-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <div>
          <CardTitle className="text-xl text-emerald-800">{device.name}</CardTitle>
          <CardDescription className="text-emerald-700">{device.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {device.capabilities.map((cap, idx) => (
            <span key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
              {cap}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 text-xl font-bold">ON</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-emerald-700 font-medium">État actuel</div>
              <div className="text-xs text-emerald-600">Activé depuis 2h</div>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm text-emerald-800 mb-1">
            <span>Consommation actuelle</span>
            <span className="font-bold">25W</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-emerald-800 mb-1">
            <span>Consommation journalière</span>
            <span className="font-bold">0.15 kWh</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-emerald-100 pt-4">
        <button className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md text-sm font-medium hover:bg-emerald-200 transition-colors">
          Statistiques
        </button>
        <button className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors">
          Allumer/Éteindre
        </button>
      </CardFooter>
    </Card>
  );
};

export default SmartPlugCard; 