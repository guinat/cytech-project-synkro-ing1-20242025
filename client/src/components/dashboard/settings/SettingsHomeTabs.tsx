import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home } from '@/services/homes.service';
import { cn } from '@/lib/utils';

interface SettingsHomeTabsProps {
  homes: Home[];
  activeHomeId: string;
  onHomeChange: (homeId: string) => void;
}

const SettingsHomeTabs: React.FC<SettingsHomeTabsProps> = ({ 
  homes, 
  activeHomeId, 
  onHomeChange 
}) => {
  if (!homes || homes.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No home available
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-2">Select a home</h2>
      <Tabs value={activeHomeId} onValueChange={onHomeChange}>
        <TabsList className="w-full flex flex-wrap h-auto">
          {homes.map((home) => (
            <TabsTrigger 
              key={home.id} 
              value={home.id}
              className={cn(
                "flex-grow sm:flex-grow-0",
                home.color && `border-l-4 border-[${home.color}]`
              )}
            >
              {home.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SettingsHomeTabs; 