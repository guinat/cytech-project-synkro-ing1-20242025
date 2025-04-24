import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  href,
  isActive = false,
}) => {
  return (
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
};

interface NavSectionProps {
  title?: string;
  children: React.ReactNode;
  showTitle: boolean;
}

export const NavSection: React.FC<NavSectionProps> = ({ 
  title, 
  children, 
  showTitle 
}) => {
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