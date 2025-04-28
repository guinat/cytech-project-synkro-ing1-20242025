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
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl flex items-center gap-2">
            {device.name}
            {device.brand && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                {device.brand}
              </span>
            )}
          </CardTitle>
          <CardDescription className="italic text-muted-foreground/80 text-sm">{device.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 bg-muted/40 rounded-lg p-3 shadow-inner">
          <span className="font-semibold text-sm text-muted-foreground">Fonctionnalités :</span>
          <ul className="list-disc list-inside ml-2 mt-1 text-sm">
            {Array.isArray(device.capabilities) && device.capabilities.length > 0 ? (
              device.capabilities.map((cap: string, idx: number) => (
                <li key={idx} className="pl-1 py-0.5">{cap}</li>
              ))
            ) : (
              <li className="italic text-muted-foreground">Aucune</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BaseDeviceCard;