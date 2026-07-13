import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import logo from '@/assets/logos/logo.png';

const platformConfig = {
  Instagram: {
    color: '#e1306c',
    bg: 'rgba(225, 48, 108, 0.08)',
    border: 'rgba(225, 48, 108, 0.15)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    )
  },
  Twitter: {
    color: '#1da1f2',
    bg: 'rgba(29, 161, 242, 0.08)',
    border: 'rgba(29, 161, 242, 0.15)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
      </svg>
    )
  }
};

const Footer = ({ compact }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const [comingSoonModal, setComingSoonModal] = useState({ isOpen: false, platform: '' });

  const isCompact = compact || location.pathname !== '/';

  const isDashboard = location.pathname.startsWith('/admin') || 
                      location.pathname === '/vendor-dashboard' || 
                      location.pathname === '/student';

  const selectedPlatform = platformConfig[comingSoonModal.platform] || {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.15)',
    icon: <span>🚀</span>
  };

  if (isAuthPage) return null;

  const handleComingSoon = (e, platform) => {
    e.preventDefault();
    setComingSoonModal({ isOpen: true, platform });
  };

  return (
    <>
      {isCompact ? (
        <footer style={{ 
          padding: '16px 0', 
          backgroundColor: 'var(--footer-bg)', 
          borderTop: '1px solid var(--footer-border)',
          width: '100%',
          marginTop: 'auto'
        }}>
          <div className="container compact-footer-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            width: '100%'
          }}>
            {/* Left Block: Logo + Copyright */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={logo} alt="CampusLunch Logo" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 650, color: isDashboard ? '#ffffff' : 'var(--footer-accent)' }}>
                &copy; {new Date().getFullYear()} CampusLunch
              </span>
            </div>

            {/* Right Block: Social Icons */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <a href="#" onClick={(e) => handleComingSoon(e, 'Instagram')} title="Instagram" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '28px', 
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: isDashboard ? '#ffffff' : 'var(--footer-accent)',
                border: 'none',
                transition: 'all 0.2s'
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#" onClick={(e) => handleComingSoon(e, 'Twitter')} title="Twitter" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '28px', 
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: isDashboard ? '#ffffff' : 'var(--footer-accent)',
                border: 'none',
                transition: 'all 0.2s'
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              <a href="mailto:support@campuslunch.com" title="Email" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '28px', 
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: isDashboard ? '#ffffff' : 'var(--footer-accent)',
                border: 'none',
                transition: 'all 0.2s'
              }}>
                <Mail size={13} strokeWidth={2.5} />
              </a>
            </div>
          </div>

          <style>{`
            @media (max-width: 480px) {
              .compact-footer-container {
                flex-direction: column !important;
                gap: 10px !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
              }
            }
          `}</style>
        </footer>
      ) : (
        <footer className="site-footer" style={{ marginTop: 'auto' }}>
          {/* Desktop/Laptop View of the Footer */}
          <div className="footer-desktop-view">
            <div className="container footer-grid-container">
              {/* Brand Column */}
              <div className="footer-brand-column">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <img src={logo} alt="CampusLunch Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                  <h3 className="footer-logo-desktop" style={{ margin: 0 }}>CampusLunch</h3>
                </div>
                <p className="footer-slogan-desktop">
                  Empowering local home chefs to provide students with healthy, delicious, and affordable home-cooked tiffins.
                </p>
              </div>

              {/* Links Column 1: Explore */}
              <div className="footer-links-column">
                <h4>Explore</h4>
                <ul>
                  <li><a href="/#how-it-works">How It Works</a></li>
                  <li><Link to="/register?role=vendor">Join as Vendor</Link></li>
                  <li><Link to="/register">Register as Student</Link></li>
                  <li><Link to="/login">Login</Link></li>
                </ul>
              </div>

              {/* Links Column 2: Support */}
              <div className="footer-links-column">
                <h4>Support</h4>
                <ul>
                  <li><Link to="/faq">Help Center & FAQ</Link></li>
                  <li><a href="mailto:support@campuslunch.com">Email Support (Gmail)</a></li>
                </ul>
              </div>

              {/* Links Column 3: Contact & Socials */}
              <div className="footer-links-column footer-contact-column">
                <h4>Contact Us</h4>
                <ul className="contact-info-list">
                  <li>
                    <Mail size={16} />
                    <a href="mailto:support@campuslunch.com">support@campuslunch.com</a>
                  </li>
                </ul>
                <div className="footer-social-icons">
                  <a href="#" className="social-icon-btn-desktop" onClick={(e) => handleComingSoon(e, 'Instagram')} title="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  <a href="#" className="social-icon-btn-desktop" onClick={(e) => handleComingSoon(e, 'Twitter')} title="Twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="container footer-bottom-bar-desktop">
              <span className="copyright-text-desktop">&copy; {new Date().getFullYear()} CampusLunch. All rights reserved.</span>
              <div className="footer-bottom-links-desktop">
                <Link to="/privacy">Privacy Policy</Link>
                <span className="separator-desktop">&bull;</span>
                <Link to="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>

          {/* Mobile View of the Footer (Original Layout) */}
          <div className="footer-mobile-view">
            <div className="container footer-content-wrapper">
              <div className="footer-brand-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', justifyContent: 'center' }}>
                  <img src={logo} alt="CampusLunch Logo" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
                  <h3 className="footer-logo" style={{ margin: 0 }}>CampusLunch</h3>
                </div>
                <p className="footer-slogan">Empowering home chefs, nourishing students.</p>
              </div>

              <div className="footer-social-icons">
                <a href="#" className="social-icon-btn" onClick={(e) => handleComingSoon(e, 'Instagram')} title="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" className="social-icon-btn" onClick={(e) => handleComingSoon(e, 'Twitter')} title="Twitter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                  </svg>
                </a>
                <a href="mailto:support@campuslunch.com" className="social-icon-btn" title="Email" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} /></a>
              </div>
            </div>

            <div className="container footer-bottom-bar">
              <span className="copyright-text">&copy; {new Date().getFullYear()} CampusLunch.</span>
              <div className="footer-bottom-links">
                <Link to="/privacy">Privacy Policy</Link>
                <span className="separator">&bull;</span>
                <Link to="/terms">Terms</Link>
                <span className="separator">&bull;</span>
                <Link to="/faq">FAQ</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
      {comingSoonModal.isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.25s ease-out'
          }}
          onClick={() => setComingSoonModal({ isOpen: false, platform: '' })}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '360px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.05)',
              transform: 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Sphere Icon */}
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: selectedPlatform.bg,
                color: selectedPlatform.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: `1px solid ${selectedPlatform.border}`
              }}
            >
              {selectedPlatform.icon}
            </div>
            
            <h3 
              className="dashboard-heading text-center" 
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: 900, 
                color: '#855300', 
                margin: '0 0 12px 0',
                display: 'block' 
              }}
            >
              Coming Soon!
            </h3>
            
            <p 
              style={{ 
                fontSize: '0.85rem', 
                color: '#64748b', 
                lineHeight: '1.55', 
                margin: '0 0 24px 0',
                fontWeight: 500 
              }}
            >
              Our <strong>{comingSoonModal.platform}</strong> integration is currently in design and will be launched in the next platform release. Stay tuned!
            </p>
            
            <button 
              onClick={() => setComingSoonModal({ isOpen: false, platform: '' })}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#855300',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(133, 83, 0, 0.15)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#783c00'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#855300'}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
