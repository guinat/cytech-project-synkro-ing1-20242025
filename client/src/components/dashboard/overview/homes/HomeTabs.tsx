import React, { useState, useEffect, useRef } from 'react';
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
  devices: any[]; //je récupère les devices filtrés pour la recherche
  onOpenDeviceDetail: (device: any) => void;
}

const HomeTabs: React.FC<HomeTabsProps> = ({ homes, activeHome, onHomeChange, onCreateHome, onRename, onColorChange, onDelete, onInvite, devices = [], onOpenDeviceDetail }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);

  //hookers de la fonctionnalité de recherche
  const [searchQuery, setSearchQuery] = useState(''); //stocker la requete de recherche, set pour la mettre a jour
  const [showSearchInput, setShowSearchInput] = useState(false); //etat pour afficher ou non le champs de recherche, set le boolean 1 oui 0 non
  const searchInputRef = useRef<HTMLInputElement>(null); //réf react pour l'input (généré par IA car je ne savais pas comment faire)
 
  //ce hook se déclenche quand showSearchInput est vrai 
  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchInput]);

  const filteredHomes = homes.filter((home) =>
    home.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const activeHomeObj = homes.find((h) => h.id === activeHome) as Home | undefined;

  // Recherche device
  const [deviceSearch, setDeviceSearch] = useState('');
  const [showDeviceSearch, setShowDeviceSearch] = useState(false);
  const deviceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showDeviceSearch && deviceInputRef.current) {
      deviceInputRef.current.focus();
    }
  }, [showDeviceSearch]);

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(deviceSearch.toLowerCase())
  );

  console.log("[HomeTabs] isHomeModalOpen:", isHomeModalOpen, "activeHomeObj:", activeHomeObj);

  return (
    <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {showSearchInput ? (
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher un home..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border rounded-md px-4 py-2 w-full max-w-xs text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mr-2"
            onBlur={() => setShowSearchInput(false)}
          />
        ) : null}
        {filteredHomes.map((home) => (
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
      
      <div className="flex items-center invisible">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => setShowSearchInput((v) => !v)}
              >
                
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search for devices, rooms, or other homes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </div>

        <div className="flex items-center ">
        {/*Bouton de recherche des devices de la maison*/}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => setShowDeviceSearch(v => !v)}
              >
                <div className="flex items-center justify-center w-6 h-6 bg-primary-foreground text-primary rounded-full">
                  <span className="sr-only">Search</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rechercher un objet de la maison</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>


        {/*Bouton des paramètres de la home*/}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  console.log('[HomeTabs] CLICK SETTINGS BTN - ouverture du modal Home Settings');
                  setIsHomeModalOpen(true);
                }}
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
      
      {showDeviceSearch && (
        <div className="relative">
          <input
            ref={deviceInputRef}
            type="text"
            placeholder="Rechercher un objet..."
            value={deviceSearch}
            onChange={e => setDeviceSearch(e.target.value)}
            className="border rounded-md px-4 py-2 w-full max-w-xs text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mt-2"
            onBlur={() => setTimeout(() => setShowDeviceSearch(false), 150)}
          />
          {deviceSearch && filteredDevices.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-60 overflow-auto">
              {filteredDevices.map(device => (
                <li
                  key={device.id}
                  className="px-4 py-2 hover:bg-primary/10 cursor-pointer"
                  onMouseDown={() => onOpenDeviceDetail(device)}
                >
                  <span className="font-medium">{device.name}</span>
                  {device.room && (
                    <span className="text-xs text-muted-foreground ml-2">({device.room})</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {deviceSearch && filteredDevices.length === 0 && (
            <div className="absolute z-10 w-full bg-white border rounded shadow mt-1 px-4 py-2 text-sm text-muted-foreground">Aucun objet trouvé</div>
          )}
        </div>
      )}
      
      {activeHomeObj && (
        <>
          {console.log("open modal", isHomeModalOpen, activeHomeObj)}
          <HomeModal
            key={activeHomeObj.id}
            open={isHomeModalOpen}
            onClose={() => setIsHomeModalOpen(false)}
            home={activeHomeObj}
            onRename={onRename}
            onColorChange={onColorChange}
            onDelete={onDelete}
            onInvite={onInvite}
          />
        </>
      )}
    </div>
  );
};

export default HomeTabs;