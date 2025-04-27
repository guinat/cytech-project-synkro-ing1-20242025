import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { PublicDeviceType } from '@/services/devices.service';

interface SmartThermostatCardProps {
  device: PublicDeviceType;
}

const SmartThermostatCard: React.FC<SmartThermostatCardProps> = ({ device }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-blue-100">
        <div className="p-3 bg-blue-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
          </svg>
        </div>
        <div>
          <CardTitle className="text-xl text-blue-800">{device.name}</CardTitle>
          <CardDescription className="text-blue-700">{device.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {device.capabilities.map((cap, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {cap}
            </span>
          ))}
        </div>
        
        <div className="flex justify-center items-center mb-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset="70"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800">21°C</div>
              <div className="text-xs text-blue-600">Temp. actuelle</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
          </button>
          <div className="text-lg font-medium text-blue-800">22°C</div>
          <button className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-blue-100 pt-4">
        <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors">
          Programme
        </button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
          Auto/Manuel
        </button>
      </CardFooter>
    </Card>
  );
};

export default SmartThermostatCard; 