import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, Moon, Settings, Sun, User, LogOut } from 'lucide-react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const useTheme = (): ThemeContextType => {
  const [theme, setThemeState] = React.useState<string>('light');
  
  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };
  
  return { theme, setTheme };
};

const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, isSidebarOpen } = useNavigation();
  const { theme, setTheme } = useTheme();
  
  const isDark = theme === 'dark';
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/95 backdrop-blur z-40">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {!isSidebarOpen && (
            <div className="flex items-center group">
            <Link to="/">
              <div className="flex items-center gap-2">
                <p className="text-logo">
                    Synkro
                </p>
              </div>
          </Link>
          </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {user?.username || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="flex items-center justify-start p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate w-[170px]">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile" className="cursor-pointer flex w-full items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="cursor-pointer flex w-full items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer focus:bg-destructive/10 text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 