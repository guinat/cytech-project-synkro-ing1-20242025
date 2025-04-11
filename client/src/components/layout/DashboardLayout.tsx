import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DevicesProvider from '@/context/DevicesContext';

// Context to manage global navigation state
type NavContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  isMobile: boolean;
};

const NavContext = createContext<NavContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

const DashboardLayout: React.FC = () => {
  // State for mobile mode and sidebar opening
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Sidebar handlers
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);
  
  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Automatically close sidebar in mobile mode
      if (mobile && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);
  
  // Classes for main content
  const mainContentClass = cn(
    "flex-grow transition-all duration-300 ease-in-out",
    "bg-background/50 pt-16", // pt-16 to leave space for the fixed header
    {
      "pl-64": isSidebarOpen, // With sidebar open
      "pl-0": !isSidebarOpen, // Sidebar closed
      "pl-20": !isMobile && !isSidebarOpen // Mini-sidebar on desktop
    }
  );

  return (
    <NavContext.Provider value={{ 
      isSidebarOpen, 
      toggleSidebar, 
      closeSidebar, 
      openSidebar,
      isMobile 
    }}>
      <div className="flex flex-col h-screen bg-background">
        {/* Header (fixed top bar) */}
        <DashboardHeader />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar (side navigation) */}
          <DashboardSidebar />
          
          {/* Overlay to close sidebar on mobile */}
          {isMobile && isSidebarOpen && (
            <div 
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}
          
          {/* Main content with scrolling */}
          <main className={`${mainContentClass} flex-1 overflow-y-auto`}>
            <div className="container mx-auto p-4 md:p-6">
              <DevicesProvider>
                <Outlet />
              </DevicesProvider>
            </div>
          </main>
        </div>
      </div>
    </NavContext.Provider>
  );
};

export default DashboardLayout; 