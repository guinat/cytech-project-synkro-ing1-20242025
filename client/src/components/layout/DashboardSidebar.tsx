import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useNavigation } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SynkroLogo from '@/assets/synkro.svg';
import { 
  Home,
  Settings, 
  LogOut, 
  User, 
  Layers, 
  Gauge, 
  Lightbulb,
  FileCog,
  ChevronsLeft,
} from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  href,
  isActive = false,
}) => {
  const item = (
    <Link 
      to={href}
      className={cn(
        "flex items-center gap-x-3 px-3 py-2.5 rounded-lg text-sm font-medium",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive 
          ? "bg-primary/10 text-primary dark:bg-primary/20" 
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate flex-1">{label}</span>
    </Link>
  );
  return item;
};

const NavSection: React.FC<{
  title?: string;
  children: React.ReactNode;
  showTitle: boolean;
}> = ({ title, children, showTitle }) => {
  return (
    <div className="py-2">
      {title && showTitle && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {title}
        </h3>
      )}
      <nav className="space-y-1 px-2">
        {children}
      </nav>
    </div>
  );
};

const DashboardSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar, isMobile } = useNavigation();
  
  const isActive = (path: string) => {
    // If the path is '/dashboard', we check for an exact match to avoid 
    // all dashboard routes being active
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    // For other paths, we check if the current path starts with the link path
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Main navigation
  const mainNavigation = [
    { icon: Gauge, label: 'Dashboard', href: '/dashboard' },
    { icon: Lightbulb, label: 'Devices', href: '/dashboard/devices' },
    { icon: Layers, label: 'Rooms', href: '/dashboard/rooms' },
    { icon: Home, label: 'Homes', href: '/dashboard/homes' },
  ];

  // Secondary navigation
  const secondaryNavigation = [
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  // Admin navigation (conditional)
  const adminNavigation = user?.role === 'admin' 
    ? [{ icon: FileCog, label: 'Admin Panel', href: '/dashboard/admin' }] 
    : [];

  // Animation and classes for the sidebar
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

  // Determine if we should display menu text
  const showFullWidth = isSidebarOpen;

  return (
    <aside className={sidebarClasses}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link to="/" className={cn(
          "flex items-center gap-2",
          !showFullWidth && "justify-center w-full"
        )}>
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary">
            <img src={SynkroLogo} alt="Synkro" className="w-6 h-6" />
          </div>
          {showFullWidth && <span className="text-xl font-bold">Synkro</span>}
        </Link>
        
        {/* Button to close the sidebar */}
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

      {/* Scrollable sidebar content */}
      <div className="flex-1 overflow-y-auto py-2">
        <NavSection title="Menu" showTitle={showFullWidth}>
          {mainNavigation.map((item) => (
            <NavItem 
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={isActive(item.href)}
            />
          ))}
        </NavSection>

        <div className={cn("mx-3 my-4", !showFullWidth && "border-0")}>
          <div className="h-px bg-border" />
        </div>

        <NavSection title="Account" showTitle={showFullWidth}>
          {secondaryNavigation.map((item) => (
            <NavItem 
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={isActive(item.href)}
            />
          ))}
        </NavSection>

        {adminNavigation.length > 0 && (
          <>
            <div className={cn("mx-3 my-4", !showFullWidth && "border-0")}>
              <div className="h-px bg-border" />
            </div>
            
            <NavSection title="Administration" showTitle={showFullWidth}>
              {adminNavigation.map((item) => (
                <NavItem 
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={isActive(item.href)}
                />
              ))}
            </NavSection>
          </>
        )}
      </div>

      {/* Sidebar footer with user profile */}
      <div className={cn(
        "border-t border-border p-3",
        !showFullWidth && "flex justify-center items-center"
      )}>
        {showFullWidth ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url} alt={user?.username || 'User'} />
                <AvatarFallback className="text-xs">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">
                  {user?.username || 'User'}
                </span>
                <span className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">
                  {user?.email || ''}
                </span>
              </div>
            </div>
            <Button
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar; 