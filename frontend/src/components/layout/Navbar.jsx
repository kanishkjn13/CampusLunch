import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import Button from '../common/Button';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Basic mock auth state to show different views
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const role = localStorage.getItem('role') || null; // 'student', 'vendor', 'admin'

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/');
    setIsOpen(false);
  };

  if (isAuthPage) return null;

  return (
    <nav className={`main-navbar ${isScrolled ? 'scrolled' : ''}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all 0.3s ease' }}>
      
      {/* Desktop Navbar (Hidden on mobile) */}
      <div className="container desktop-navbar-container flex items-center justify-between" style={{ height: '70px' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 nav-logo-link">
          <img src={logo} alt="CampusLunch Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          <span className="text-gradient nav-logo-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>CampusLunch</span>
        </Link>

        {/* Navigation Menu */}
        <div className="nav-menu flex items-center gap-4">
          {!role ? (
            <>
              <Link to="/login"><Button variant="outline" className="nav-login-btn">Sign In</Button></Link>
              <Link to="/register"><Button variant="primary" className="nav-signup-btn">Sign up</Button></Link>
            </>
          ) : (
            <>
              {role === 'student' && <Link to="/student">Dashboard</Link>}
              {role === 'vendor' && <Link to="/vendor-dashboard">Vendor Panel</Link>}
              {role === 'admin' && <Link to="/admin">Admin Panel</Link>}
              <Button variant="secondary" onClick={handleLogout}><LogOut size={16} /> Logout</Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Top Bar (Hidden on desktop) */}
      <div className="mobile-navbar-container flex items-center justify-between w-full" style={{ height: '64px', padding: '0 16px' }}>
        <Link to="/" className="mobile-nav-logo flex items-center gap-2">
          <img src={logo} alt="CampusLunch Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <span className="font-bold logo-text text-gradient" style={{ fontSize: '20px', fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700 }}>
            CampusLunch
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          {!role ? (
            <Link to="/login">
              <button 
                className="mobile-signin-btn px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300"
                style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
              >
                Sign In
              </button>
            </Link>
          ) : (
            <button 
              onClick={handleLogout} 
              className="mobile-logout-btn p-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#0f172a' }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        /* Desktop visibility & styles */
        @media (min-width: 768px) {
          .desktop-navbar-container {
            display: flex !important;
          }
          .mobile-navbar-container {
            display: none !important;
          }
          .main-navbar {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: none;
            border-bottom: 1px solid var(--border-color);
          }
          .main-navbar.scrolled {
            background: rgba(255, 255, 255, 0.8) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }
          .nav-link {
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.95rem;
            margin-right: 12px;
            transition: color var(--transition-fast) ease;
            text-decoration: none;
          }
          .nav-link:hover {
            color: var(--accent-primary);
          }
        }
        
        /* Mobile visibility & styles */
        @media (max-width: 767px) {
          .main-navbar {
            display: block !important;
            position: fixed !important;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.8) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
          }
          .desktop-navbar-container {
            display: none !important;
          }
          .mobile-navbar-container {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
