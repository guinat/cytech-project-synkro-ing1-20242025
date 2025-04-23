import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { PublicDeviceType } from '@/services/devices.service';

interface SecurityCameraCardProps {
  device: PublicDeviceType;
}

const SecurityCameraCard: React.FC<SecurityCameraCardProps> = ({ device }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-slate-200 bg-gradient-to-br from-slate-50 to-white">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-slate-100">
        <div className="p-3 bg-slate-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div>
          <CardTitle className="text-xl text-slate-800">{device.name}</CardTitle>
          <CardDescription className="text-slate-600">{device.description}</CardDescription>
        </div>
      </CardHeader>
      <div className="px-6 pt-4">
        <div className="w-full h-48 bg-slate-800 rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>LIVE</span>
          </div>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {device.capabilities.map((cap, idx) => (
            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
              {cap}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm mt-3">
          <div className="flex items-center gap-1 text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Motion Detection</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span>Recordings</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
        <button className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors">
          Historique
        </button>
        <button className="px-3 py-1 bg-slate-700 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
          Visionner
        </button>
      </CardFooter>
    </Card>
  );
};

export default SecurityCameraCard; 