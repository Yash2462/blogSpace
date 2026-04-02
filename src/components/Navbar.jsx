import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Sun, Moon, Home as HomeIcon, PlusSquare, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    typeof window !== 'undefined' ? document.documentElement.className.includes('dark') ? 'dark' : 'light' : 'light'
  );

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
      setTheme('light');
    }
  };

  useEffect(() => {
    // Check theme on mount
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const authLinks = [
    { to: '/posts', label: 'Home', icon: <HomeIcon className="w-4 h-4 mr-2" /> },
    { to: '/create-post', label: 'Write', icon: <PlusSquare className="w-4 h-4 mr-2" /> },
    { to: '/profile', label: 'Profile', icon: <User className="w-4 h-4 mr-2" /> },
  ];

  const publicLinks = [
    { to: '/', label: 'Home', icon: <HomeIcon className="w-4 h-4 mr-2" /> },
  ];

  const linksToUse = user ? authLinks : publicLinks;

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate(user ? '/posts' : '/')}>
            <span className="text-xl font-mono font-bold text-foreground flex items-center">
              <span className="text-primary mr-1">&lt;</span>
              BlogSpace
              <span className="text-primary ml-1">/&gt;</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            {linksToUse.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center text-sm font-medium transition-all hover:text-primary h-16 border-b-2 px-2 ${
                    isActive ? 'text-primary border-primary' : 'text-muted-foreground border-transparent'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            ) : (
              location.pathname !== '/login' && location.pathname !== '/signup' && (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-2 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {linksToUse.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            ) : (
              location.pathname !== '/login' && location.pathname !== '/signup' && (
                <button
                  onClick={() => {
                    navigate('/login');
                    closeMenu();
                  }}
                  className="flex w-full mt-4 items-center justify-center bg-primary text-primary-foreground px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign In
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar; 