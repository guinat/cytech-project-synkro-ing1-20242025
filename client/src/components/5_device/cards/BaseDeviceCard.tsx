import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { PublicDeviceType } from '@/services/devices.service';

interface BaseDeviceCardProps {
  device: PublicDeviceType;
  className?: string;
}

const BaseDeviceCard: React.FC<BaseDeviceCardProps> = ({ device, className }) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div>
          <CardTitle className="text-xl">{device.name}</CardTitle>
          <CardDescription>{device.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <span className="font-semibold text-sm text-muted-foreground">Fonctionnalités :</span>
          <ul className="list-disc list-inside ml-2 mt-1 text-sm">
            {Array.isArray(device.capabilities) && device.capabilities.length > 0 ? (
              device.capabilities.map((cap: string, idx: number) => (
                <li key={idx}>{cap}</li>
              ))
            ) : (
              <li>Aucune</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BaseDeviceCard; 