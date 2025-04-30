import { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  AlertCircle,
  Loader2,
  ShieldAlert,
  DoorClosed,
  Cpu
} from 'lucide-react';
import SettingsHomeTabs from '@/components/dashboard/settings/SettingsHomeTabs';
import GeneralSettings from '@/components/dashboard/settings/GeneralSettings';
import MembersSettings from '@/components/dashboard/settings/MembersSettings';
import InvitationsSettings from '@/components/dashboard/settings/InvitationsSettings';
import RoomsSettings from '@/components/dashboard/settings/RoomsSettings';
import DevicesSettings from '@/components/dashboard/settings/DevicesSettings';
import { toast } from 'sonner';
import { 
  Home,
  listHomes,
  getHome,
  updateHome as updateHomeService,
  deleteHome as deleteHomeService,
  createInvitation as createInvitationService
} from '@/services/homes.service';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  
  const [homes, setHomes] = useState<Home[]>([]);
  const [ownedHomes, setOwnedHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomeId, setSelectedHomeId] = useState<string>('');
  const [selectedHome, setSelectedHome] = useState<Home | null>(null);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [loadingHomeDetails, setLoadingHomeDetails] = useState(false);
  
  const initialized = useRef(false);
  const homeCache = useRef<Map<string, Home>>(new Map());
  const networkRequestActive = useRef(false);
  
  const loadHomesOnce = useCallback(async () => {
    if (initialized.current) return;
    
    setLoading(true);
    try {
      const fetchedHomes = await listHomes();
      setHomes(fetchedHomes);
      
      const owned = fetchedHomes.filter(home => 
        (home.owner_id && home.owner_id === user?.id) || 
        home.permissions?.can_delete === true
      );
      setOwnedHomes(owned);
      
      if (owned.length > 0 && !selectedHomeId) {
        setSelectedHomeId(owned[0].id);
      } else if (fetchedHomes.length > 0 && !selectedHomeId) {
        setSelectedHomeId(fetchedHomes[0].id);
      }
      
      initialized.current = true;
    } catch (error) {
      console.error("Error loading homes:", error);
      toast.error('Failed to load homes');
    } finally {
      setLoading(false);
    }
  }, [selectedHomeId, user?.id]);
  
  useEffect(() => {
    loadHomesOnce();
    
    return () => {
      initialized.current = false;
      homeCache.current.clear();
    };
  }, [loadHomesOnce]);
  
  useEffect(() => {
    const loadHomeDetails = async () => {
      if (!selectedHomeId || networkRequestActive.current) return;
      
      if (homeCache.current.has(selectedHomeId)) {
        setSelectedHome(homeCache.current.get(selectedHomeId) || null);
        return;
      }
      
      networkRequestActive.current = true;
      setLoadingHomeDetails(true);
      
      try {
        const homeDetails = await getHome(selectedHomeId);
        homeCache.current.set(selectedHomeId, homeDetails);
        setSelectedHome(homeDetails);
      } catch (error) {
        console.error("Error loading home details:", error);
        toast.error('Failed to load home details');
      } finally {
        setLoadingHomeDetails(false);
        networkRequestActive.current = false;
      }
    };
    
    loadHomeDetails();
  }, [selectedHomeId]);
  
  const refreshHomeDetails = async (homeId: string) => {
    if (!homeId) return;
    
    setLoadingHomeDetails(true);
    try {
      const freshHomeDetails = await getHome(homeId);
      homeCache.current.set(homeId, freshHomeDetails);
      
      if (selectedHomeId === homeId) {
        setSelectedHome(freshHomeDetails);
      }
      
      return freshHomeDetails;
    } catch (error) {
      console.error("Error refreshing home details:", error);
      toast.error('Failed to refresh home data');
      return null;
    } finally {
      setLoadingHomeDetails(false);
    }
  };
  
  const handleHomeChange = (homeId: string) => {
    if (homeId !== selectedHomeId) {
      setSelectedHomeId(homeId);
    }
  };
  
  const handleRename = async (name: string) => {
    if (!selectedHomeId || !selectedHome || name === selectedHome.name) return;
    
    try {
      await updateHomeService(selectedHomeId, { name });
      await refreshHomeDetails(selectedHomeId);
      setHomes(homes.map(h => h.id === selectedHomeId ? { ...h, name } : h));
      toast.success('Name updated successfully');
    } catch (error) {
      toast.error('Failed to update name');
    }
  };
  
  const handleColorChange = async (color: string) => {
    if (!selectedHomeId || !selectedHome || color === selectedHome.color) return;
    
    try {
      await updateHomeService(selectedHomeId, { color });
      await refreshHomeDetails(selectedHomeId);
      setHomes(homes.map(h => h.id === selectedHomeId ? { ...h, color } : h));
      toast.success('Color updated successfully');
    } catch (error) {
      toast.error('Failed to update color');
    }
  };
  
  const handleDelete = async () => {
    if (!selectedHomeId || !selectedHome) return;
    
    try {
      await deleteHomeService(selectedHomeId);
      homeCache.current.delete(selectedHomeId);
      const updatedHomes = homes.filter(h => h.id !== selectedHomeId);
      setHomes(updatedHomes);
      const updatedOwnedHomes = ownedHomes.filter(h => h.id !== selectedHomeId);
      setOwnedHomes(updatedOwnedHomes);
      
      if (updatedOwnedHomes.length > 0) {
        setSelectedHomeId(updatedOwnedHomes[0].id);
      } else if (updatedHomes.length > 0) {
        setSelectedHomeId(updatedHomes[0].id);
      } else {
        setSelectedHomeId('');
        setSelectedHome(null);
      }
      
      toast.success('Home deleted successfully');
    } catch (error) {
      toast.error('Failed to delete home');
    }
  };
  
  const handleInvite = async (email: string) => {
    if (!selectedHomeId) return;
    
    try {
      await createInvitationService(selectedHomeId, email);
      await refreshHomeDetails(selectedHomeId);
      toast.success('Invitation sent successfully');
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (homes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No homes available</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have any homes yet. Create one from the dashboard.
        </p>
      </div>
    );
  }
  
  if (ownedHomes.length === 0) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your homes and preferences.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <ShieldAlert className="h-16 w-16 text-amber-500" />
            <h2 className="text-2xl font-semibold text-center">You do not own any home</h2>
            <p className="text-muted-foreground text-center max-w-md">
              You must own a home to access the settings. Please create one or request to be designated as an owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your homes and preferences.
          </p>
        </div>
        
        <SettingsHomeTabs
          homes={ownedHomes}
          activeHomeId={selectedHomeId}
          onHomeChange={handleHomeChange}
        />
        
        {loadingHomeDetails ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : selectedHome ? (
          <div className="flex flex-col space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>General</span>
                  </TabsTrigger>
                  <TabsTrigger value="members" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </TabsTrigger>
                  <TabsTrigger value="invitations" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
                    <Mail className="h-4 w-4" />
                    <span>Invitations</span>
                  </TabsTrigger>
                  <TabsTrigger value="rooms" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
                    <DoorClosed className="h-4 w-4" />
                    <span>Rooms</span>
                  </TabsTrigger>
                  <TabsTrigger value="devices" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2">
                    <Cpu className="h-4 w-4" />
                    <span>Devices</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="general" className="pt-6">
                <GeneralSettings
                  home={selectedHome}
                  onRename={handleRename}
                  onColorChange={handleColorChange}
                  onDelete={handleDelete}
                />
              </TabsContent>

              <TabsContent value="members" className="pt-6">
                <MembersSettings
                  home={selectedHome}
                  onInvite={handleInvite}
                />
              </TabsContent>

              <TabsContent value="invitations" className="pt-6">
                <InvitationsSettings
                  home={selectedHome}
                  onInvite={handleInvite}
                />
              </TabsContent>

              <TabsContent value="rooms" className="pt-6">
                <RoomsSettings
                  home={selectedHome}
                  onReload={() => refreshHomeDetails(selectedHomeId).then(() => {})}
                />
              </TabsContent>

              <TabsContent value="devices" className="pt-6">
                <DevicesSettings
                  home={selectedHome}
                  onReload={() => refreshHomeDetails(selectedHomeId).then(() => {})}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Select a home to view its settings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
