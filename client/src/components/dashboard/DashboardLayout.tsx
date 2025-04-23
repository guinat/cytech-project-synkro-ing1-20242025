import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { UserProvider } from '@/contexts/UserContext';

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
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);
  
  const mainContentClass = cn(
    "flex-grow transition-all duration-300 ease-in-out",
    "bg-background/50 pt-16",
    {
      "pl-64": isSidebarOpen,
      "pl-0": !isSidebarOpen,
      "pl-20": !isMobile && !isSidebarOpen
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
      <UserProvider>
        <div className="flex flex-col h-screen bg-background">
          <DashboardHeader />
          <div className="flex flex-1 overflow-hidden">
            <DashboardSidebar />
            {isMobile && isSidebarOpen && (
              <div 
                className="fixed inset-0 z-20lg:hidden"
                onClick={closeSidebar}
                aria-hidden="true"
              />
            )}
            <main className={`${mainContentClass} flex-1 overflow-y-auto`}>
              <div className="container mx-auto p-4 md:p-6">
                <React.Suspense fallback={<div className="flex justify-center items-center h-64 text-lg">Chargement...</div>}>
                  <Outlet />
                </React.Suspense>
              </div>
            </main>
          </div>
        </div>
      </UserProvider>
    </NavContext.Provider>
  );
};

export default DashboardLayout; 