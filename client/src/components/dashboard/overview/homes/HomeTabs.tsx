import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HomeQuickCreateForm } from '@/components/3_home/forms/HomeQuickCreateForm';
import { Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HomeModal from '@/components/dashboard/HomeModal';
import type { Home } from '@/services/homes.service';

interface HomeTabsProps {
  homes: Array<{ id: string; name: string }>;
  activeHome: string;
  onHomeChange: (homeId: string) => void;
  onCreateHome: (data: { name: string }) => Promise<void>;
  onRename?: (name: string) => Promise<void>;
  onColorChange?: (color: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onInvite?: (email: string) => Promise<void>;
}

const HomeTabs: React.FC<HomeTabsProps> = ({ homes, activeHome, onHomeChange, onCreateHome, onRename, onColorChange, onDelete, onInvite }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);

  const handleCreateHome = async (data: { name: string }) => {
    setIsCreating(true);
    try {
      await onCreateHome(data);
      setIsDialogOpen(false);
      toast.success(`Home "${data.name}" created successfully`);
    } catch (error) {
      toast.error("Failed to create home");
    } finally {
      setIsCreating(false);
    }
  };

  // Trouve l'objet Home actif
  const activeHomeObj = homes.find((h) => h.id === activeHome) as Home | undefined;

  return (
    <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {homes.map((home) => (
          <Button
            key={home.id}
            onClick={() => onHomeChange(home.id)}
            variant={activeHome === home.id ? "default" : "outline"}
            size="sm"
            className={activeHome === home.id ? "bg-primary text-primary-foreground" : ""}
          >
            {home.name}
          </Button>
        ))}
        
        {homes.length < 3 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a new home</DialogTitle>
              </DialogHeader>
              <HomeQuickCreateForm 
                onSubmit={handleCreateHome} 
                loading={isCreating}
                horizontal={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={() => setIsHomeModalOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Home Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* HomeModal pour les paramètres du home */}
      {activeHomeObj && (
        <HomeModal
          open={isHomeModalOpen}
          onClose={() => setIsHomeModalOpen(false)}
          home={activeHomeObj}
          onRename={onRename}
          onColorChange={onColorChange}
          onDelete={onDelete}
          onInvite={onInvite}
        />
      )}
    </div>
  );
};

export default HomeTabs;