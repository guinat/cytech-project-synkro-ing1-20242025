import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavLink = {
  path: string;
  label: string;
  requiredRole?: 'USER' | 'ADMIN';
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);
  
  const isActive = (path: string) => location.pathname === path;

  const navLinks: NavLink[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      requiredRole: 'USER'
    },
    {
      path: '/admin',
      label: 'Administration',
      requiredRole: 'ADMIN'
    },
  ];

  const filteredNavLinks = navLinks.filter(link => {
    if (!link.requiredRole) return true;
    if (link.requiredRole === 'USER' && isAuthenticated()) return true;
    return user?.role === link.requiredRole;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/auth/sign_in');
  };

  const handleRegister = () => {
    navigate('/auth/sign_up');
  };

  const UserProfileDropdown = () => {
    if (!isAuthenticated || !user) return null;
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 outline-none">
            <Avatar className="h-8 w-8 ring-2 ring-primary-foreground">
              <AvatarImage src={undefined} alt={user?.username} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium overflow-hidden text-ellipsis max-w-[100px]">
              {user?.username}
            </span>
            <ChevronDown className="h-4 w-4 hidden md:block text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user?.username}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/dashboard')}>
            <UserIcon className="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          {user.role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin')}>
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const AuthActions = () => {
    if (isAuthenticated()) {
      return null; // Authenticated users use the dropdown instead
    }
    
    return (
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={handleLogin}
          className="text-primary border-primary hover:bg-primary hover:text-white"
        >
          Login
        </Button>
        <Button 
          variant="default" 
          onClick={handleRegister}
        >
          Register
        </Button>
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md flex items-center h-16 px-4 md:px-8 z-40 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo - Left section */}
          <div className="flex items-center group">
            <Link to="/">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  Synkro
                </span>
              </div>
            </Link>
          </div>
          
          {/* Navigation - Center section */}
          <nav className="hidden md:flex items-center">
            {filteredNavLinks.map((link) => (
              <Link 
                key={`desktop-${link.path}`}
                to={link.path} 
                className={`mx-4 transition-colors duration-200 text-sm font-medium hover:text-primary ${
                  isActive(link.path) 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Right side - Actions and User Profile */}
          <div className="flex items-center gap-4">
            {/* Authentication actions - visible on desktop */}
            <div className="hidden md:block">
              <AuthActions />
            </div>
            {/* User profile dropdown - only for authenticated users */}
            <div className="hidden md:block">
              <UserProfileDropdown />
            </div>
            
            {/* Mobile menu button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90%] max-w-[350px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    {/* Mobile user profile info */}
                    {isAuthenticated() && user ? (
                      <div className="flex flex-row gap-2">
                      <div className="flex items-center gap-3 p-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={undefined} alt={user?.username} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.username}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center ml-4">
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 p-2">
                        <span className="text-xl font-bold">Synkro</span>
                      </div>
                    )}
                  </div>

                  {/* Mobile navigation links */}
                  <div className="flex-1 overflow-auto p-4">
                    <nav className="flex flex-col space-y-1">
                      {filteredNavLinks.map((link) => (
                        <Link 
                          key={`mobile-${link.path}`}
                          to={link.path} 
                          className={`flex items-center gap-2 p-3 rounded-md transition-colors duration-200 ${
                            isActive(link.path) 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          <span>{link.label}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* Mobile footer actions */}
                  {isAuthenticated() ? (
                    <div className="p-4 border-t mt-auto">
                      <p className="text-sm font-medium mb-4 italic">Quick Actions</p>
                      <div className="flex flex-col gap-2">
                        <Link to="/dashboard">
                          <Button variant="outline" className="w-full">
                            Dashboard
                          </Button>
                        </Link>
                        <Link to="/dashboard/profile">
                          <Button variant="outline" className="w-full">
                            Profile
                          </Button>
                        </Link>
                        <Link to="/dashboard/settings">
                          <Button variant="outline" className="w-full">
                            Settings
                          </Button>
                        </Link>
                        <Link to="/logout">
                          <Button variant="outline" className="w-full">
                            Logout
                          </Button>
                        </Link>
                      </div>
                    </div>
                    ) : (
                      <div className="p-4 border-t mt-auto">
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline"
                          className="w-full" 
                          onClick={handleLogin}
                        >
                          Login
                        </Button>
                        <Button 
                          variant="default"
                          className="w-full" 
                          onClick={handleRegister}
                        >
                          Register
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Spacer to push content below the fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;