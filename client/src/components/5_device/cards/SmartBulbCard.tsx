import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { PublicDeviceType } from '@/services/devices.service';

interface SmartBulbCardProps {
  device: PublicDeviceType;
}

const SmartBulbCard: React.FC<SmartBulbCardProps> = ({ device }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-yellow-200 bg-gradient-to-br from-amber-50 to-white">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-yellow-100">
        <div className="p-3 bg-yellow-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </div>
        <div>
          <CardTitle className="text-xl text-yellow-800">{device.name}</CardTitle>
          <CardDescription className="text-yellow-700">{device.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2">
          {device.capabilities.map((cap, idx) => (
            <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {cap}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <span className="text-xs text-yellow-700">Brightness</span>
        </div>
        <div className="mt-4 flex justify-between">
          <div className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-red-500 cursor-pointer"></span>
            <span className="h-6 w-6 rounded-full bg-green-500 cursor-pointer"></span>
            <span className="h-6 w-6 rounded-full bg-blue-500 cursor-pointer"></span>
            <span className="h-6 w-6 rounded-full bg-purple-500 cursor-pointer"></span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-yellow-100 pt-4">
        <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors">
          Configurer
        </button>
        <button className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors">
          Allumer/Éteindre
        </button>
      </CardFooter>
    </Card>
  );
};

export default SmartBulbCard; 