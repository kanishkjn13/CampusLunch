import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import logo from '../../assets/logo.png';

const Footer = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return null;

  const handleComingSoon = (e, platform) => {
    e.preventDefault();
    alert(`${platform} integration is coming soon!`);
  };

  return (
    <footer className="site-footer">
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
              <li><Link to="/support-chat">Live Chat Support</Link></li>
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
            <a href="#" className="social-icon-btn" onClick={(e) => handleComingSoon(e, 'Website')} title="Website"><span style={{ fontSize: '0.9rem' }}>🌐</span></a>
            <a href="#" className="social-icon-btn" onClick={(e) => handleComingSoon(e, 'Share')} title="Share"><span style={{ fontSize: '0.9rem' }}>🔗</span></a>
            <a href="mailto:support@campuslunch.com" className="social-icon-btn" title="Email"><Mail size={16} /></a>
          </div>
        </div>
        
        <div className="container footer-bottom-bar">
          <span className="copyright-text">&copy; {new Date().getFullYear()} CampusLunch.</span>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="separator">&bull;</span>
            <Link to="/terms">Terms</Link>
            <span className="separator">&bull;</span>
            <Link to="/support-chat">Help Chat</Link>
            <span className="separator">&bull;</span>
            <Link to="/faq">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
