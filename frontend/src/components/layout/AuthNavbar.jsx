import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../../assets/logo.png';

const AuthNavbar = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <nav className="glass" style={{ position: 'relative', zIndex: 100, borderBottom: '1px solid var(--border-color)' }}>
      <div className="container flex items-center justify-between auth-nav-container">
        
        {/* Back Button */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-secondary hover:text-primary"
          style={{ transition: 'var(--transition-fast)' }}
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Back</span>
        </Link>

        {/* Center Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ marginLeft: '12px' }}>
          <img src={logo} alt="CampusLunch Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <span className="text-gradient" style={{ fontSize: '1.15rem', fontWeight: 700 }}>CampusLunch</span>
        </Link>

        {/* Right Toggle Link */}
        <div>
          {isLogin ? (
            <Link 
              to="/register" 
              style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 500 }}
              className="hover:underline"
            >
              Sign Up
            </Link>
          ) : (
            <Link 
              to="/login" 
              style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 500 }}
              className="hover:underline"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
