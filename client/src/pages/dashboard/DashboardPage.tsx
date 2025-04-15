import { useState, useEffect } from "react";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { useDevices } from "@/context/DevicesContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Home, Plus, Loader2, DoorOpen, X, Check, Smartphone, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Home as HomeType, Room as RoomType } from "@/services/home.service";

const DashboardPage = () => {
  const { 
    homes, 
    rooms, 
    devices, 
    selectedHome, 
    setSelectedHome, 
    loadingHomes, 
    loadingRooms, 
    loadingDevices,
    fetchHomes,
    fetchDevices,
    createHome,
    createRoom 
  } = useDevices();
  
  const navigate = useNavigate();
  
  // State for the dashboard
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false);
  
  // States for creating a home
  const [isHomeDialogOpen, setIsHomeDialogOpen] = useState(false);
  const [isCreatingHome, setIsCreatingHome] = useState(false);
  const [homeName, setHomeName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  
  // States for room creation
  const [showRoomStep, setShowRoomStep] = useState(false);
  const [roomsToCreate, setRoomsToCreate] = useState<{name: string; id?: number}[]>([
    { name: "Living Room" },
    { name: "Kitchen" },
    { name: "Bedroom" }
  ]);
  const [newRoomName, setNewRoomName] = useState("");
  
  // State for device addition query
  const [showDeviceQuery, setShowDeviceQuery] = useState(false);
  const [newHomeId, setNewHomeId] = useState<number | null>(null);

  // Get dashboard data when a home is selected
  useEffect(() => {
    if (selectedHome) {
      fetchDashboardData();
    }
  }, [selectedHome]);

  // Function to retrieve dashboard data
  const fetchDashboardData = async () => {
    if (!selectedHome) return;
    
    setLoadingDashboard(true);
    try {
      // In a real case, this request would go to the API
      // For simplicity, we use the already loaded data
      const roomsInHome = rooms.filter(r => r.home === selectedHome.id);
      const devicesInHome = devices.filter(d => d.home === selectedHome.id);
      
      const formattedData = {
        home: selectedHome,
        rooms: roomsInHome.map(room => ({
          ...room,
          devices: devicesInHome.filter(d => d.room === room.id)
        })),
        // Devices without a room
        unassignedDevices: devicesInHome.filter(d => !d.room)
      };
      
      setDashboardData(formattedData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Unable to load dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  };
  
  // Refresh the dashboard
  const refreshDashboard = () => {
    fetchHomes();
    fetchDevices();
    fetchDashboardData();
    toast("Dashboard updated");
  };
  
  // Handle home creation
  const handleCreateHome = async () => {
    if (!homeName.trim()) {
      toast.error("Please enter a home name");
      return;
    }
    
    setIsCreatingHome(true);
    try {
      // Prepare home data
      const homeData: Partial<HomeType> = {
        name: homeName.trim()
      };
      
      if (homeAddress.trim()) {
        homeData.address = homeAddress.trim();
      }
      
      // Create the home
      const newHome = await createHome(homeData);
      toast.success(`Home "${newHome.name}" created successfully!`);
      
      // Store the new home ID
      setNewHomeId(newHome.id);
      
      // Select the new home
      setSelectedHome(newHome);
      
      // Rafraîchir la liste des pièces pour cette maison
      await fetchHomes();
      
      // Go to rooms step if user wants to add rooms
      setShowRoomStep(true);
      
    } catch (error) {
      console.error("Error creating home:", error);
      toast.error("Unable to create home. Please try again.");
    } finally {
      setIsCreatingHome(false);
    }
  };
  
  // Handle adding a room to the list
  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    
    setRoomsToCreate([...roomsToCreate, { name: newRoomName.trim() }]);
    setNewRoomName("");
  };
  
  // Handle removing a room from the list
  const handleRemoveRoom = (index: number) => {
    const updatedRooms = [...roomsToCreate];
    updatedRooms.splice(index, 1);
    setRoomsToCreate(updatedRooms);
  };
  
  // Handle creating rooms
  const handleCreateRooms = async () => {
    if (!newHomeId) return;
    
    setIsCreatingHome(true);
    try {
      const createdRooms = [];
      
      // Create each room sequentially
      for (const room of roomsToCreate) {
        const roomData: Partial<RoomType> = {
          name: room.name,
          home: newHomeId
        };
        
        try {
          const newRoom = await createRoom(roomData);
          createdRooms.push(newRoom);
        } catch (roomError) {
          console.error(`Error creating room ${room.name}:`, roomError);
          // Continue with other rooms even if one fails
        }
      }
      
      if (createdRooms.length > 0) {
        toast.success(`${createdRooms.length} room${createdRooms.length === 1 ? '' : 's'} created successfully!`);
      } else {
        toast.error("No rooms were created. Please try again later.");
      }
      
      // Ask if user wants to add devices
      setShowRoomStep(false);
      setShowDeviceQuery(true);
      
    } catch (error) {
      console.error("Error creating rooms:", error);
      toast.error("Unable to create all rooms. Please try again.");
    } finally {
      setIsCreatingHome(false);
    }
  };
  
  // Handle skipping room creation
  const handleSkipRooms = () => {
    setShowRoomStep(false);
    setShowDeviceQuery(true);
  };
  
  // Handle navigating to devices page
  const handleNavigateToDevices = () => {
    // Close the dialog
    setIsHomeDialogOpen(false);
    
    // Reset all states
    setHomeName("");
    setHomeAddress("");
    setShowRoomStep(false);
    setShowDeviceQuery(false);
    setRoomsToCreate([
      { name: "Living Room" },
      { name: "Kitchen" },
      { name: "Bedroom" }
    ]);
    
    // Make sure to bring the newly created home ID to the devices page
    // Cela permettra à la page des appareils de savoir quelle maison est sélectionnée
    const homeToUse = selectedHome ? selectedHome.id : newHomeId;
    
    // Navigate to the devices page
    navigate("/dashboard/devices", { state: { selectedHomeId: homeToUse } });
  };
  
  // Handle finishing the setup
  const handleFinishSetup = () => {
    // Close the dialog
    setIsHomeDialogOpen(false);
    
    // Reset all states
    setHomeName("");
    setHomeAddress("");
    setShowRoomStep(false);
    setShowDeviceQuery(false);
    setRoomsToCreate([
      { name: "Living Room" },
      { name: "Kitchen" },
      { name: "Bedroom" }
    ]);
    
    // Refresh the dashboard
    fetchDashboardData();
  };

  return (
      <MaxWidthWrapper>
      <div className="py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Visualize and control your connected devices
            </p>
          </div>
          <Button onClick={refreshDashboard}>
            Refresh
          </Button>
        </div>
        
        {/* Home selection */}
        {homes.length > 0 && (
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">Select a home:</p>
            
            <Select
              value={selectedHome ? selectedHome.id.toString() : ""}
              onValueChange={(value) => {
                const home = homes.find(h => h.id.toString() === value);
                if (home) setSelectedHome(home);
              }}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Choose a home" />
              </SelectTrigger>
              <SelectContent>
                {homes.map(home => (
                  <SelectItem key={home.id} value={home.id.toString()}>
                    <div className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      {home.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* No home selected */}
        {!selectedHome && !loadingHomes && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Home className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No home selected</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Please select a home to view its dashboard and control your devices.
              </p>
              {homes.length > 0 ? (
                <p>Choose a home in the selector above.</p>
              ) : (
                <Dialog open={isHomeDialogOpen} onOpenChange={setIsHomeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Create my first home
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="sm:max-w-md">
                    {/* Home creation step */}
                    {!showRoomStep && !showDeviceQuery && (
                      <>
                        <DialogHeader>
                          <DialogTitle>Create your first home</DialogTitle>
                          <DialogDescription>
                            Add a home to start managing your devices
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="home-name">Home name</Label>
                            <Input
                              id="home-name"
                              placeholder="My Home, Beach House, etc."
                              value={homeName}
                              onChange={(e) => setHomeName(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="home-address">Address (optional)</Label>
                            <Input
                              id="home-address"
                              placeholder="123 Main St, City, Country"
                              value={homeAddress}
                              onChange={(e) => setHomeAddress(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            onClick={handleCreateHome}
                            disabled={isCreatingHome || !homeName.trim()}
                          >
                            {isCreatingHome ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create and continue"
                            )}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                    
                    {/* Room creation step */}
                    {showRoomStep && (
                      <>
                        <DialogHeader>
                          <DialogTitle>Add rooms to your home</DialogTitle>
                          <DialogDescription>
                            You can add or customize rooms now or do it later
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-4">
                            {roomsToCreate.map((room, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <DoorOpen className="mr-2 h-4 w-4" />
                                  <span>{room.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveRoom(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Add a new room"
                              value={newRoomName}
                              onChange={(e) => setNewRoomName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newRoomName.trim()) {
                                  handleAddRoom();
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              onClick={handleAddRoom}
                              disabled={!newRoomName.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <DialogFooter className="flex justify-between sm:justify-between">
                          <Button
                            variant="outline"
                            onClick={handleSkipRooms}
                          >
                            Skip
                          </Button>
                          <Button
                            onClick={handleCreateRooms}
                            disabled={isCreatingHome || roomsToCreate.length === 0}
                          >
                            {isCreatingHome ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating rooms...
                              </>
                            ) : (
                              "Create rooms"
                            )}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                    
                    {/* Device addition query */}
                    {showDeviceQuery && (
                      <>
                        <DialogHeader>
                          <DialogTitle>Add devices to your home?</DialogTitle>
                          <DialogDescription>
                            Would you like to add devices to your home now?
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-6">
                          <div className="flex flex-col gap-4">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">Add devices</CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm text-muted-foreground">
                                <p>Go to the devices page to add and configure your smart devices.</p>
                              </CardContent>
                              <CardFooter>
                                <Button 
                                  className="w-full"
                                  onClick={handleNavigateToDevices}
                                >
                                  <Smartphone className="mr-2 h-4 w-4" />
                                  Add devices
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </CardFooter>
                            </Card>
                            
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">Finish setup</CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm text-muted-foreground">
                                <p>Return to the dashboard and add devices later.</p>
                              </CardContent>
                              <CardFooter>
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={handleFinishSetup}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Finish setup
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Loading */}
        {(loadingDashboard || loadingHomes || loadingRooms || loadingDevices) && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Loading dashboard...</span>
          </div>
        )}
        
        {/* Dashboard */}
        {selectedHome && dashboardData && !loadingDashboard && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="mr-2 h-6 w-6" />
                  {dashboardData.home.name}
                </CardTitle>
                <CardDescription>
                  {dashboardData.rooms.length} rooms, {devices.filter(d => d.home === selectedHome.id).length} devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Device summary by status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">
                            {devices.filter(d => d.home === selectedHome.id && d.status === 'online').length}
                          </p>
                          <p className="text-muted-foreground">Devices online</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-500">
                            {devices.filter(d => d.home === selectedHome.id && d.status === 'offline').length}
                          </p>
                          <p className="text-muted-foreground">Devices offline</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-500">
                            {rooms.filter(r => r.home === selectedHome.id).length}
                          </p>
                          <p className="text-muted-foreground">Rooms</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </MaxWidthWrapper>
  );
};

export default DashboardPage;