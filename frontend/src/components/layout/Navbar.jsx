import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import Button from '../common/Button';
import logo from '@/assets/logos/logo.png';

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
    <nav className={`main-navbar ${isScrolled ? 'scrolled' : ''}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, transition: 'all 0.3s ease' }}>
      
      {/* Desktop Navbar (Hidden on mobile) */}
      <div className="container desktop-navbar-container" style={{ display: 'flex', alignItems: 'center', height: '70px', position: 'relative' }}>
        {/* Logo (Left side) */}
        <Link to="/" className="flex items-center gap-2 nav-logo-link" style={{ zIndex: 10 }}>
          <img src={logo} alt="CampusLunch Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          <span className="text-gradient nav-logo-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>CampusLunch</span>
        </Link>

        {/* Center Navigation Links (Absolute Centered with Hover Animations) */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          zIndex: 5
        }}>
          <a href="/#how-it-works" className="nav-link-animated">How It Works</a>
          <Link to="/about" className="nav-link-animated">About Us</Link>
          <Link to="/faq" className="nav-link-animated">FAQ</Link>
        </div>

        {/* Right Actions (Auth Buttons/Dashboard Panels) */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', zIndex: 10 }}>
          {!role ? (
            <div className="flex items-center gap-3">
              <Link to="/login"><Button variant="outline" className="nav-login-btn">Sign In</Button></Link>
              <Link to="/register"><Button variant="primary" className="nav-signup-btn">Sign up</Button></Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {role === 'student' && <Link to="/student" className="nav-link-animated" style={{ fontWeight: 700, color: '#b45309', marginRight: '16px' }}>Student Dashboard</Link>}
              {role === 'vendor' && <Link to="/vendor-dashboard" className="nav-link-animated" style={{ fontWeight: 700, color: '#b45309', marginRight: '16px' }}>Vendor Dashboard</Link>}
              {role === 'admin' && <Link to="/admin" className="nav-link-animated" style={{ fontWeight: 700, color: '#b45309', marginRight: '16px' }}>Admin Dashboard</Link>}
              <Button variant="secondary" onClick={handleLogout} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={16} /> Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Top Bar (Hidden on desktop) */}
      <div className="mobile-navbar-container flex items-center justify-between w-full" style={{ height: '64px', padding: '0 16px' }}>
        <Link to="/" className="mobile-nav-logo flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <img src={logo} alt="CampusLunch Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <span className="font-bold logo-text text-gradient" style={{ fontSize: '20px', fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700 }}>
            CampusLunch
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {!role && !isOpen && (
            <Link to="/login">
              <button 
                className="mobile-signin-btn px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300"
                style={{ backgroundColor: '#f59e0b', color: '#0f172a', border: 'none' }}
              >
                Sign In
              </button>
            </Link>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="mobile-menu-btn p-2"
            style={{ background: 'transparent', border: 'none', color: '#0f172a', display: 'flex', alignItems: 'center' }}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="mobile-drawer-overlay" 
          style={{ 
            position: 'fixed', 
            top: '64px', 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: '#ffffff', 
            zIndex: 998, 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '24px', 
            gap: '20px',
            animation: 'fadeIn 0.25s ease-out',
            textAlign: 'left'
          }}
        >
          <a href="/#how-it-works" className="mobile-drawer-link" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', textDecoration: 'none' }}>How It Works</a>
          <Link to="/about" className="mobile-drawer-link" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', textDecoration: 'none' }}>About Us</Link>
          <Link to="/faq" className="mobile-drawer-link" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', textDecoration: 'none' }}>FAQ</Link>
          
          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '10px 0' }} />
          
          {role ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {role === 'student' && <Link to="/student" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309', textDecoration: 'none' }}>Student Dashboard</Link>}
              {role === 'vendor' && <Link to="/vendor-dashboard" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309', textDecoration: 'none' }}>Vendor Dashboard</Link>}
              {role === 'admin' && <Link to="/admin" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309', textDecoration: 'none' }}>Admin Dashboard</Link>}
              
              <button 
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  justifyContent: 'center', 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  backgroundColor: '#f1f5f9', 
                  border: 'none', 
                  fontWeight: 700, 
                  color: '#64748b',
                  fontSize: '0.95rem'
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/login" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#f1f5f9', border: 'none', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>
                  Sign In
                </button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#f59e0b', border: 'none', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

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
          .nav-link-animated {
            position: relative;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.95rem;
            text-decoration: none;
            transition: color 0.3s ease;
            padding: 4px 0;
          }
          .nav-link-animated::after {
            content: '';
            position: absolute;
            width: 100%;
            transform: scaleX(0);
            height: 2px;
            bottom: 0;
            left: 0;
            background-color: var(--accent-primary, #b45309);
            transform-origin: bottom center;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .nav-link-animated:hover {
            color: var(--accent-primary, #b45309) !important;
          }
          .nav-link-animated:hover::after {
            transform: scaleX(1);
          }
        }
        
        /* Mobile visibility & styles */
        @media (max-width: 767px) {
          .main-navbar {
            display: none !important;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
