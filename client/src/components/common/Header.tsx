  import React, { useState, useEffect } from 'react';
  import { Link, useLocation, useNavigate } from 'react-router-dom';
  import SynkroLogo from '@/assets/synkro.svg';
  import { Menu, X, LogOut } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';
  import { Separator } from '@/components/ui/separator';
  import { useAuth } from '@/context/AuthContext';

  type NavLink = {
    path: string;
    label: string;
    requiredRole?: 'user' | 'admin';
  };

  const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useAuth();
    
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);
    
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
        path: '/',
        label: 'Home',
      },
      {
        path: '/dashboard',
        label: 'Dashboard',
      },
      {
        path: '/admin',
        label: 'Administration',
        requiredRole: 'admin'
      },
      {
        path: '/control-center',
        label:'Control-Center'
      }
    ];

    const filteredNavLinks = navLinks.filter(link => {
      if (!link.requiredRole) return true;
      return user?.role === link.requiredRole;
    });

    const handleLogout = () => {
      logout();
      closeMenu();
      navigate('/');
    };

    const handleLogin = () => {
      closeMenu();
      navigate('/login');
    };

    const handleRegister = () => {
      closeMenu();
      navigate('/register');
    };

    const authActions = isAuthenticated ? (
      <Button 
        variant="outline" 
        onClick={handleLogout}
      >
        <LogOut size={22} />
        <span>Logout</span>
      </Button>
    ) : (
      <div className="flex items-center gap-3">
        <Button 
        variant="login" 
        onClick={handleLogin}
      >
        <span>Login</span>
      </Button>
      <Button 
        variant="register" 
        onClick={handleRegister}
      >
        <span>Register</span>
      </Button>
      </div>
    );

    return (
      <MaxWidthWrapper>
          <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-sm flex items-center justify-between py-4 px-4 md:px-8 z-50 border-b border-gray-200">

              <div className="flex items-center group">
                <Link to="/"  onClick={closeMenu}>
                  <div className="flex items-center gap-2">
                    <img src={SynkroLogo} alt="Synkro Logo"className="h-8 w-8 mr-2 transition-transform duration-300 group-hover:rotate-12"/>
                    <span className="text-logo">
                        Synkro
                    </span>
                  </div>
              </Link>
              </div>
              
              <nav className="hidden md:flex items-center space-x-8">
              {filteredNavLinks.map((link) => {
                  return (
                  <Link 
                      key={`desktop-${link.path}`}
                      to={link.path} 
                      className={`link ${
                      isActive(link.path) 
                          ? 'link-active' 
                          : 'link-hover'
                      }`}
                  >
                      <span>{link.label}</span>
                  </Link>
                  );
              })}
              
              </nav>
              
              <div className="hidden md:flex items-center space-x-4">
                  {authActions}
              </div>
              
              <button 
              className="md:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </header>
      
        <div 
          className={`fixed inset-0 bg-white z-40 transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} md:hidden`}
        >
          <div className="pt-20 px-6 h-full overflow-y-auto">
            <nav className="flex flex-col items-center space-y-4">
              {filteredNavLinks.map((link) => {
                return (
                  <Link 
                    key={`mobile-${link.path}`}
                    to={link.path} 
                    className={`link py-3 w-full text-center flex items-center justify-left gap-4 p-4 rounded-lg ${
                      isActive(link.path) 
                        ? 'link-active bg-primary-foreground/90' 
                        : 'link-hover hover:bg-primary-foreground/30'
                    }`}
                    onClick={closeMenu}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <Separator className="my-2" />

              <div className="flex flex-col w-full space-y-3 mt-2">
                {authActions}
              </div>
            </nav>
          </div>
        </div>
        
        <div className="h-16"></div>
      </MaxWidthWrapper>
    );
  };

  export default Header;
