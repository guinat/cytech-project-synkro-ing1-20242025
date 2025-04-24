import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavItem, NavSection } from '@/components/dashboard/DashboardSidebarNavigation';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  User, 
  Gauge, 
  Lightbulb,
  FileCog,
} from 'lucide-react';

interface NavigationMenuProps {
  showFullWidth: boolean;
  userRole?: string;
}

const SidebarNavigationMenu: React.FC<NavigationMenuProps> = ({
  showFullWidth,
  userRole
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const mainNavigation = [
    { icon: Gauge, label: 'Dashboard', href: '/dashboard' },
    { icon: Lightbulb, label: 'Devices', href: '/dashboard/devices' },
  ];

  const secondaryNavigation = [
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  const adminNavigation = userRole === 'admin' 
    ? [{ icon: FileCog, label: 'Admin Panel', href: '/dashboard/admin' }] 
    : [];

  return (
    <>
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
    </>
  );
};

export default SidebarNavigationMenu; 