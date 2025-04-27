import React, { useState } from 'react';
import InviteGuestModal from './InviteGuestModal';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ChevronsLeft } from 'lucide-react';
import SidebarUserProfile from '@/components/dashboard/DashboardSidebarUserProfile';
import SidebarNavigationMenu from '@/components/dashboard/DashboardSidebarNavigationMenu';

const DashboardSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar, isMobile } = useNavigation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-30 flex flex-col bg-background h-screen",
    "transition-all duration-300 ease-in-out border-r border-border",
    "shadow-sm",
    {
      "translate-x-0": isSidebarOpen,
      "-translate-x-full": !isSidebarOpen,
      "w-64": isSidebarOpen,
      "w-20": !isSidebarOpen && !isMobile,
      "w-64 lg:translate-x-0": isMobile && isSidebarOpen
    }
  );

  const showFullWidth = isSidebarOpen;

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link to="/" className={cn(
          "flex items-center gap-2",
          !showFullWidth && "justify-center w-full"
        )}>
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary">
            <p className="text-black">Synkro</p>
          </div>
          {showFullWidth && <span className="text-xl font-bold">Synkro</span>}
        </Link>
        
        {showFullWidth && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">

        <SidebarNavigationMenu
          showFullWidth={showFullWidth}
          userRole={user?.role}
        />
        {/* Bouton + Invité sous le menu */}
        {showFullWidth && (
          <div className="flex flex-col items-center mt-6">
            <Button
              variant="outline"
              className="w-11 h-11 rounded-full flex items-center justify-center mb-1"
              onClick={() => setInviteModalOpen(true)}
              aria-label="Inviter un invité"
            >
              <span className="text-2xl font-bold">+</span>
            </Button>
            <span className="text-xs text-muted-foreground">Invité</span>
          </div>
        )}
      </div>

      <SidebarUserProfile
        user={user}
        showFullWidth={showFullWidth}
        onLogout={handleLogout}
      />
      {/* Modale d'invitation */}
      <InviteGuestModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
    </aside>
  );
};

export default DashboardSidebar; 