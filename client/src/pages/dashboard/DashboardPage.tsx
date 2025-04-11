import { useState, useEffect } from "react";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import { useDevices } from "@/context/DevicesContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Home, Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
    fetchDevices 
  } = useDevices();
  
  // State for the dashboard
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false);

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
                <Button variant="outline" onClick={() => toast("Feature to be implemented")}>
                  <Plus className="mr-2 h-4 w-4" /> Create my first home
                </Button>
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